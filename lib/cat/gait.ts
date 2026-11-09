/**
 * Motion helpers shared by the cat's route and walker. Pure numbers only, so the
 * Node tests run without a GPU. The animated model itself is the authored GLB in
 * `public/beopity/cat3d/`; `lib/cat/clips.ts` maps walker state onto its clips.
 *
 * World frame: the cat faces +Z, +Y is up and the ground is y = 0.
 */

/** Ground distance (world units) the walker counts as one gait cycle at walking pace. */
export const BASE_STRIDE = 0.4;
export const MAX_STRIDE_SCALE = 1.7;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const fract = (value: number) => value - Math.floor(value);
export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Stride lengthens with speed so a fast scroll reads as bounding, not frantic pedalling. */
export function strideFor(speed: number): number {
  return BASE_STRIDE * clamp(1 + Math.max(0, speed - 0.9) / 1.6, 1, MAX_STRIDE_SCALE);
}
