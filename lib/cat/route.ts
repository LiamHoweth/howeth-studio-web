import { clamp, mix, smoothstep } from "./gait";
import { CAT_ENVELOPE, CONTENT_EDGE, NARROW_SIDEWAYS, catClearance, catHalfWidth } from "./view";

/**
 * The cat's route through a page, planned against the page's real contents.
 * The cat walks a reserved lane beside the content and may cross open "wander"
 * ground, but every point of the route is checked against measured text,
 * images and controls using the cat's complete silhouette (tail, turns, outline,
 * shadow and glow) plus clearance. A crossing that would touch content is
 * dropped; any stretch that still cannot be walked is blocked, and the cat
 * waits beside it or reappears beyond it rather than crossing. All rectangles
 * are page coordinates in px.
 */
export type RouteRect = { left: number; top: number; width: number; height: number };
export type RouteBand = RouteRect & { target: number };
export type RouteLayout = {
  viewport: { width: number; height: number };
  /** Viewport y of the cat's centre while it keeps the visitor company, in px. */
  anchor: number;
  /** The reserved lane. */
  lane: RouteRect;
  /** Rightmost page x the cat's silhouette may reach (the viewport edge, less a margin). */
  right: number;
  bands: RouteBand[];
  /** Text, images and controls the cat must keep clear of. */
  obstacles: RouteRect[];
  /** Screen px per world unit. */
  pxPerUnit: number;
  /** Largest |sin(yaw)| the standing cat may take in the lane (1 = free to turn). */
  laneSideways: number;
  /** Camera elevation, radians. */
  elevation: number;
  /** Length of one gentle side-to-side meander inside the lane. */
  meander: number;
};

/** Spacing of route samples down the page, in px. */
export const ROUTE_STEP = 6;

export type RoutePoint = { x: number; pageY: number; s: number; heading: number; allowance: number; wander: number };

export type CatRoute = {
  layout: RouteLayout;
  /** Page y of the first and last route samples. */
  first: number;
  last: number;
  /** Total ground length, world units. */
  length: number;
  pageY: Float64Array;
  x: Float64Array;
  s: Float64Array;
  /** Walking heading down the route at each sample (radians, 0 = down the page). */
  heading: Float64Array;
  /** Largest standing |sin(yaw)| that fits at each sample. */
  allowance: Float64Array;
  wander: Float64Array;
  /** 1 where the cat may stand, 0 where it would touch content. */
  clear: Uint8Array;
  /** Prefix count of blocked samples, for O(1) path checks. */
  blockedBefore: Uint32Array;
  /** Bands the route actually crosses (those whose ground proved clear). */
  crossings: RouteBand[];
};

type Box = { left: number; right: number; top: number; bottom: number };

function overlaps(box: Box, rect: RouteRect) {
  return box.left < rect.left + rect.width && box.right > rect.left && box.top < rect.top + rect.height && box.bottom > rect.top;
}

/** The cat's silhouette box at (x, pageY) for a standing heading allowance, plus clearance. */
export function catBox(layout: RouteLayout, x: number, pageY: number, halfWidthUnits: number, clearance = catClearance(layout.pxPerUnit)): Box {
  const ppu = layout.pxPerUnit;
  return {
    left: x - halfWidthUnits * ppu - clearance,
    right: x + halfWidthUnits * ppu + clearance,
    top: pageY - CAT_ENVELOPE.above * ppu - clearance,
    bottom: pageY + CAT_ENVELOPE.below * ppu + clearance,
  };
}

/** Obstacles bucketed by page y, so each sample tests only nearby rectangles. */
function bucketObstacles(obstacles: RouteRect[], size: number) {
  const buckets = new Map<number, RouteRect[]>();
  for (const rect of obstacles) {
    if (!(rect.width > 0 && rect.height > 0)) continue;
    for (let row = Math.floor(rect.top / size); row <= Math.floor((rect.top + rect.height) / size); row++) {
      const list = buckets.get(row);
      if (list) list.push(rect); else buckets.set(row, [rect]);
    }
  }
  return (box: Box) => {
    for (let row = Math.floor(box.top / size); row <= Math.floor(box.bottom / size); row++) {
      for (const rect of buckets.get(row) ?? []) if (overlaps(box, rect)) return true;
    }
    return false;
  };
}

/** Half-width (world units) the cat needs to stand, turn or pivot with this allowance. */
function envelopeFor(allowance: number) {
  return allowance >= 0.999 ? CAT_ENVELOPE.turning : Math.max(catHalfWidth(allowance), CAT_ENVELOPE.seated);
}

export function laneBounds(layout: RouteLayout) {
  const clearance = catClearance(layout.pxPerUnit);
  const half = envelopeFor(layout.laneSideways) * layout.pxPerUnit;
  const min = layout.lane.left + CONTENT_EDGE + clearance + half;
  const max = layout.right - half;
  return max >= min ? { min, max } : { min: (min + max) / 2, max: (min + max) / 2 };
}

export function laneX(layout: RouteLayout, pageY: number): number {
  const { min, max } = laneBounds(layout);
  return (min + max) / 2 + ((max - min) / 2) * 0.8 * Math.sin((pageY / Math.max(layout.meander, 1)) * Math.PI * 2);
}

/** How far into a band's crossing the cat is (0 in the lane, 1 at the band target). */
export function bandWeight(layout: RouteLayout, band: RouteBand, pageY: number): number {
  const ppu = layout.pxPerUnit;
  const clearance = catClearance(ppu);
  const start = band.top + CAT_ENVELOPE.above * ppu + clearance;
  const end = band.top + band.height - CAT_ENVELOPE.below * ppu - clearance;
  const usable = end - start;
  if (usable <= ppu) return 0;
  const ramp = Math.min(usable * 0.42, Math.max(layout.viewport.height * 0.38, 180));
  return smoothstep(start, start + ramp, pageY) * (1 - smoothstep(end - ramp, end, pageY));
}

function bandTarget(layout: RouteLayout, band: RouteBand) {
  const ppu = layout.pxPerUnit;
  const inset = CAT_ENVELOPE.turning * ppu + catClearance(ppu);
  return clamp(band.left + band.width * band.target, band.left + inset, Math.max(band.left + inset, band.left + band.width - inset));
}

export function buildRoute(layout: RouteLayout): CatRoute {
  const ppu = layout.pxPerUnit;
  const sin = Math.sin(layout.elevation);
  const clearance = catClearance(ppu);
  const first = layout.lane.top + CAT_ENVELOPE.above * ppu;
  const last = Math.max(first, layout.lane.top + layout.lane.height - CAT_ENVELOPE.below * ppu);
  const count = Math.max(2, Math.ceil((last - first) / ROUTE_STEP) + 1);
  const pageY = new Float64Array(count);
  for (let i = 0; i < count; i++) pageY[i] = Math.min(last, first + i * ROUTE_STEP);
  const blocked = bucketObstacles(layout.obstacles, 96);
  const lane = Float64Array.from(pageY, (y) => laneX(layout, y));
  const laneAllowance = layout.laneSideways >= 0.999 ? 1 : layout.laneSideways;

  const headingOf = (xs: ArrayLike<number>, i: number) => {
    const j = Math.min(count - 1, i + 1), k = Math.max(0, i - 1);
    return Math.atan2((xs[j] - xs[k]) / ppu, (pageY[j] - pageY[k]) / (ppu * sin));
  };
  /**
   * Largest standing allowance that fits at a point, or -1 if the cat cannot be
   * there at all. The walking silhouette must fit, and so must whatever it may
   * do on the spot: turn standing (allowance 1) or sit and pivot.
   */
  const fitAt = (x: number, y: number, heading: number, inLane: boolean) => {
    const sideways = Math.abs(Math.sin(heading));
    const fits = (half: number) => {
      const box = catBox(layout, x, y, half);
      if (box.right - clearance > layout.right + 0.5) return false;
      if (inLane && box.left < layout.lane.left - 0.5) return false;
      return !blocked(box);
    };
    if (fits(CAT_ENVELOPE.turning)) return 1;
    // Too tight to turn standing here (even in a wide lane, e.g. beside a tilted
    // card): the cat may still walk square-on and sit to turn round.
    const allowance = Math.max(Math.min(laneAllowance, NARROW_SIDEWAYS), sideways);
    return allowance < 1 && fits(Math.max(catHalfWidth(allowance), CAT_ENVELOPE.seated)) ? allowance : -1;
  };

  // Accept a crossing only if the whole way out and back stays clear of content.
  const crossings: RouteBand[] = [];
  const weights = new Float64Array(count);
  const targets = new Float64Array(count);
  for (const band of layout.bands) {
    const target = bandTarget(layout, band);
    const bandWeights = Float64Array.from(pageY, (y) => bandWeight(layout, band, y));
    const xs = Float64Array.from(lane, (laneValue, i) => mix(laneValue, target, bandWeights[i]));
    let used = false, safe = true;
    for (let i = 0; i < count && safe; i++) {
      if (bandWeights[i] <= 0) continue;
      used = true;
      if (fitAt(xs[i], pageY[i], headingOf(xs, i), false) < 0) safe = false;
    }
    if (!used || !safe) continue;
    crossings.push(band);
    for (let i = 0; i < count; i++) {
      if (bandWeights[i] > weights[i]) { weights[i] = bandWeights[i]; targets[i] = target; }
    }
  }

  const x = Float64Array.from(lane, (laneValue, i) => mix(laneValue, targets[i], weights[i]));
  const s = new Float64Array(count);
  const heading = new Float64Array(count);
  const allowance = new Float64Array(count);
  const clear = new Uint8Array(count);
  const blockedBefore = new Uint32Array(count + 1);
  for (let i = 0; i < count; i++) {
    heading[i] = headingOf(x, i);
    if (i > 0) s[i] = s[i - 1] + Math.hypot((x[i] - x[i - 1]) / ppu, (pageY[i] - pageY[i - 1]) / (ppu * sin));
    const fit = fitAt(x[i], pageY[i], heading[i], weights[i] <= 0);
    allowance[i] = fit >= 0 ? fit : laneAllowance;
    clear[i] = fit >= 0 ? 1 : 0;
    blockedBefore[i + 1] = blockedBefore[i] + (clear[i] ? 0 : 1);
  }
  return { layout, first, last, length: s[count - 1], pageY, x, s, heading, allowance, wander: weights, clear, blockedBefore, crossings };
}

/** Sample index nearest to a page y. */
export function indexAtY(route: CatRoute, y: number) {
  return clamp(Math.round((y - route.first) / ROUTE_STEP), 0, route.pageY.length - 1);
}

/** Sample index at or before ground distance `s`. */
function indexAtS(route: CatRoute, s: number) {
  let lo = 0, hi = route.s.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (route.s[mid] <= s) lo = mid; else hi = mid - 1;
  }
  return lo;
}

/** Point on the route at ground distance `s`. */
export function pointAt(route: CatRoute, s: number): RoutePoint {
  const at = clamp(s, 0, route.length);
  const i = indexAtS(route, at);
  const j = Math.min(i + 1, route.s.length - 1);
  const span = route.s[j] - route.s[i];
  const t = span > 1e-9 ? (at - route.s[i]) / span : 0;
  return {
    x: mix(route.x[i], route.x[j], t),
    pageY: mix(route.pageY[i], route.pageY[j], t),
    s: at,
    heading: t < 0.5 ? route.heading[i] : route.heading[j],
    allowance: Math.min(route.allowance[i], route.allowance[j]),
    wander: mix(route.wander[i], route.wander[j], t),
  };
}

/** Ground distance at page y, interpolated between samples so re-anchoring never nudges the cat. */
export function sAtY(route: CatRoute, y: number) {
  const at = (clamp(y, route.first, route.last) - route.first) / ROUTE_STEP;
  const i = Math.min(Math.floor(at), route.s.length - 1);
  const j = Math.min(i + 1, route.s.length - 1);
  return mix(route.s[i], route.s[j], j > i ? Math.min(1, (y - route.pageY[i]) / (route.pageY[j] - route.pageY[i] || 1)) : 0);
}

export function isClearAt(route: CatRoute, s: number) {
  return pathClear(route, s, s);
}

/** True when every sample between two ground distances may be walked. */
export function pathClear(route: CatRoute, from: number, to: number) {
  const low = clamp(Math.min(from, to), 0, route.length), high = clamp(Math.max(from, to), 0, route.length);
  const a = indexAtS(route, low);
  let b = indexAtS(route, high);
  // A point between samples also needs the next sample.
  if (route.s[b] < high - 1e-9) b = Math.min(b + 1, route.clear.length - 1);
  return route.blockedBefore[b + 1] - route.blockedBefore[a] === 0;
}

/** Nearest clear sample to page y, searching outward; null if the whole route is blocked. */
export function nearestClear(route: CatRoute, y: number, prefer: 1 | -1 = 1): number | null {
  const start = indexAtY(route, y);
  for (let d = 0; d < route.clear.length; d++) {
    for (const i of [start + d * prefer, start - d * prefer]) {
      if (i >= 0 && i < route.clear.length && route.clear[i]) return route.s[i];
    }
  }
  return null;
}

/**
 * Where the cat should walk to for a wanted page y, given where it stands.
 * `walk` is reachable without touching content; `beyond` is the clear spot
 * nearest the wanted position when a blocked stretch lies in between.
 */
export function destination(route: CatRoute, wantedY: number, from: number): { walk: number; beyond: number | null } {
  const y = clamp(wantedY, route.first, route.last);
  const goal = nearestClear(route, y, route.s[indexAtY(route, y)] >= from ? -1 : 1);
  if (goal === null) return { walk: from, beyond: null };
  if (pathClear(route, from, goal)) return { walk: goal, beyond: null };
  // Walk up to the edge of the blocked stretch and wait there.
  const direction = goal > from ? 1 : -1;
  let i = indexAtS(route, from);
  while (i + direction >= 0 && i + direction < route.clear.length && route.clear[i + direction]) i += direction;
  return { walk: route.s[i], beyond: goal };
}
