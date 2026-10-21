import { clamp, mix, smoothstep } from "./gait";

/**
 * The cat's route through a page. Scroll position is the only input: the cat
 * keeps a fixed height in the viewport, walks down a reserved lane beside the
 * content, and crosses open "wander" bands. All rectangles are page coordinates.
 */
export type RouteRect = { left: number; top: number; width: number; height: number };
export type RouteBand = RouteRect & { target: number };
export type RouteLayout = {
  viewport: { width: number; height: number };
  /** Viewport y of the cat's centre, in px. */
  anchor: number;
  lane: RouteRect;
  bands: RouteBand[];
  /** On-screen size of the cat's body, in px. */
  cat: { width: number; height: number };
  /** Length of one gentle side-to-side meander inside the lane. */
  meander: number;
};
export type RoutePoint = { x: number; y: number; pageY: number; wander: number };

export function laneX(layout: RouteLayout, pageY: number): number {
  const { lane, cat, meander } = layout;
  const slack = Math.max(0, (lane.width - cat.width) / 2) * 0.8;
  return lane.left + lane.width / 2 + slack * Math.sin((pageY / Math.max(meander, 1)) * Math.PI * 2);
}

/** How far into a band's crossing the cat is (0 in the lane, 1 at the band target). */
export function bandWeight(layout: RouteLayout, band: RouteBand, pageY: number): number {
  const margin = layout.cat.height * 0.55;
  const usable = band.height - margin * 2;
  if (usable <= layout.cat.height * 0.5) return 0;
  const ramp = Math.min(usable * 0.42, Math.max(layout.viewport.height * 0.38, 180));
  const start = band.top + margin, end = band.top + band.height - margin;
  return smoothstep(start, start + ramp, pageY) * (1 - smoothstep(end - ramp, end, pageY));
}

export function routeAt(layout: RouteLayout, scrollY: number): RoutePoint {
  const { lane, cat } = layout;
  const half = cat.height / 2;
  const first = lane.top + half;
  const last = Math.max(first, lane.top + lane.height - half);
  // Past either end the cat waits on the page and scrolls with it.
  const pageY = clamp(scrollY + layout.anchor, first, last);
  let x = laneX(layout, pageY);
  let wander = 0;
  for (const band of layout.bands) {
    const weight = bandWeight(layout, band, pageY);
    if (weight > wander) {
      wander = weight;
      const target = clamp(band.left + band.width * band.target, band.left + cat.width, band.left + band.width - cat.width);
      x = mix(laneX(layout, pageY), target, weight);
    }
  }
  return { x, y: pageY - scrollY, pageY, wander };
}
