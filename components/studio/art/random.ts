/**
 * Deterministic helpers for the painted scenery. Positions come from a seeded
 * generator (never Math.random at render) so server HTML, client hydration and
 * every static export produce identical art.
 */

/** mulberry32: a tiny, fast, seedable PRNG returning [0, 1). */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Round to one decimal place to keep SVG path data compact. */
export const r1 = (value: number) => Math.round(value * 10) / 10;

/** Stable small hash so a string (e.g. an interlude index) can seed a scene. */
export function hashSeed(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0) % 997 + 1;
}
