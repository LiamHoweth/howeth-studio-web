import { clamp, mix, smoothstep } from "./gait";
import { PHONE_LANE } from "./view";

/**
 * The cat's route through a page. Pure numbers, no DOM: the driver measures the
 * page, the Node tests check the geometry. Scroll position is the only input and
 * every rectangle is in page coordinates. Route points are the centre of the
 * cat's canvas; its paws meet the ground `feet` px below that centre.
 *
 * - Wide screens ("lane" mode): the cat keeps a fixed height in the viewport and
 *   walks down a reserved lane beside the content with a gentle meander. Near an
 *   open band (`[data-wander]`) it steps onto the band's painted footpath
 *   (`data-wander-ground`), walks out to the band target, pauses, walks back and
 *   rejoins the lane.
 * - Phones ("phone" mode, lane narrower than PHONE_LANE): there is no lane. The
 *   cat waits off-screen to the right and only appears for a band crossing,
 *   walking in from the right edge to the target and back out.
 */
export type RouteRect = { left: number; top: number; width: number; height: number };
/** `target`: x fraction (0–1) of the band to walk to. `ground`: y fraction from the band top where the paws stand. */
export type RouteBand = RouteRect & { target: number; ground: number };
export type RouteLayout = {
  viewport: { width: number; height: number };
  /** Viewport y of the cat's centre while it walks the lane, in px. */
  anchor: number;
  lane: RouteRect;
  bands: RouteBand[];
  /** On-screen size of the cat: full turning width and body height, in px. */
  cat: { width: number; height: number };
  /** Screen distance from the cat's centre down to where its paws meet the ground, in px. */
  feet: number;
  /** Length of one gentle side-to-side meander inside the lane, in page px. */
  meander: number;
};
export type RouteMode = "lane" | "phone";
export type RoutePoint = {
  /** Centre x, viewport px (equal to page x: the page does not scroll sideways). */
  x: number;
  /** Centre y, viewport px. */
  y: number;
  /** Centre y, page px. */
  pageY: number;
  /** How far out along the footpath (0 lane / off-screen, 1 at the band target). */
  wander: number;
  /** How firmly the paws are on a band's ground line (1 = exactly on it). */
  ground: number;
  mode: RouteMode;
  visible: boolean;
  opacity: number;
};

export { PHONE_LANE };
export const DEFAULT_GROUND = 0.88;
export const DEFAULT_TARGET = 0.4;

/** Parse a `data-wander` / `data-wander-ground` fraction, falling back when missing or invalid. */
export function parseFraction(value: string | null | undefined, fallback: number): number {
  if (value == null || value.trim() === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number, 0, 1) : fallback;
}

export function routeMode(layout: Pick<RouteLayout, "lane">): RouteMode {
  return layout.lane.width < PHONE_LANE ? "phone" : "lane";
}

export function laneX(layout: RouteLayout, pageY: number): number {
  const { lane, cat, meander } = layout;
  const slack = Math.max(0, (lane.width - cat.width) / 2) * 0.8;
  return lane.left + lane.width / 2 + slack * Math.sin((pageY / Math.max(meander, 1)) * Math.PI * 2);
}

/** Centre page-y range of the lane: the cat never pokes above its top or below its bottom. */
export function laneEnds(layout: RouteLayout) {
  const half = layout.cat.height / 2;
  const first = layout.lane.top + half;
  return { first, last: Math.max(first, layout.lane.top + layout.lane.height - half) };
}

/** Page-y of a band's footpath, where the paws stand. */
export function groundY(band: RouteBand): number {
  return band.top + band.height * clamp(band.ground, 0, 1);
}

/** Scroll span of one crossing. */
export function crossingSpan(layout: RouteLayout): number {
  return clamp(layout.viewport.height * 0.8, 360, 960);
}

/** Crossing phases over u ∈ [0, 1]: step onto the path, walk out, pause, walk back, step off. */
const STEP_ON = 0.18, OUT = 0.4, BACK = 0.6, STEP_OFF = 0.8;
/** The crossing starts this fraction of the span before the nominal paws reach the ground line. */
const LEAD = 0.3;

/**
 * Weights of one band crossing for the nominal (lane) centre `s`. `ground` is 1
 * for the whole time `wander` is above 0, so the paws stay exactly on the
 * footpath while the cat walks across the band.
 */
export function crossingWeights(layout: RouteLayout, band: RouteBand, s: number) {
  if (band.width <= 0 || band.height <= 0) return { ground: 0, wander: 0, u: 0 };
  const span = crossingSpan(layout);
  const u = (s + layout.feet - (groundY(band) - span * LEAD)) / span;
  if (u <= 0 || u >= 1) return { ground: 0, wander: 0, u };
  const ground = smoothstep(0, STEP_ON, u) * (1 - smoothstep(STEP_OFF, 1, u));
  const wander = smoothstep(STEP_ON, OUT, u) * (1 - smoothstep(BACK, STEP_OFF, u));
  return { ground, wander, u };
}

/** Centre x at a band's target, kept clear of the band's edges. */
export function bandTargetX(layout: RouteLayout, band: RouteBand): number {
  const pad = layout.cat.width / 2 + 8;
  if (band.width <= pad * 2) return band.left + band.width / 2;
  return clamp(band.left + band.width * clamp(band.target, 0, 1), band.left + pad, band.left + band.width - pad);
}

/** Phones: the waiting spot just past the right edge of the viewport. */
export function offscreenX(layout: RouteLayout): number {
  return layout.viewport.width + layout.cat.width / 2 + 12;
}

export function routeAt(layout: RouteLayout, scrollY: number): RoutePoint {
  const mode = routeMode(layout);
  const { first, last } = laneEnds(layout);
  // Past either lane end the cat waits on the page and scrolls with it.
  const s = clamp(scrollY + layout.anchor, first, last);
  const home = mode === "lane" ? laneX(layout, s) : offscreenX(layout);

  let best: { band: RouteBand; ground: number; wander: number } | null = null;
  for (const band of layout.bands) {
    const weights = crossingWeights(layout, band, s);
    if (weights.ground <= 0) continue;
    if (!best || weights.ground > best.ground || (weights.ground === best.ground && weights.wander > best.wander)) best = { band, ...weights };
  }

  let pageY = s, x = home, wander = 0, ground = 0;
  if (best) {
    ground = best.ground;
    wander = best.wander;
    pageY = mix(s, groundY(best.band) - layout.feet, ground);
    x = mix(home, bandTargetX(layout, best.band), wander);
  }

  // Full-bleed bands paint sky and hills under the lane. In the lane the cat
  // fades out over a band (it never stands on the painted sky) and shows again
  // once it is out on the band's footpath; on phones it only ever shows there.
  const onPath = smoothstep(0, 0.06, wander);
  const opacity = mode === "lane" ? Math.max(1 - bandCover(layout, pageY), onPath) : onPath;
  return { x, y: pageY - scrollY, pageY, wander, ground, mode, visible: opacity > 0, opacity };
}

/** 0 clear of every band … 1 when the cat's lane spot sits over a band's painted scene. */
export function bandCover(layout: RouteLayout, pageY: number): number {
  const half = layout.cat.height / 2;
  const edge = Math.max(layout.cat.height * 0.5, 1);
  let cover = 0;
  for (const band of layout.bands) {
    if (band.width <= 0 || band.height <= 0) continue;
    const entering = smoothstep(band.top - half - edge, band.top - half, pageY);
    const leaving = 1 - smoothstep(band.top + band.height + half, band.top + band.height + half + edge, pageY);
    cover = Math.max(cover, entering * leaving);
  }
  return cover;
}
