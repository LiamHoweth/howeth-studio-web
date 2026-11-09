/**
 * Calmer wheel and trackpad scrolling. Each wheel gesture covers less distance
 * (WHEEL_SCALE of the browser's own travel) and settles briefly instead of
 * coasting: a mouse-wheel notch eases in over about a quarter second, while a
 * trackpad, which already has its own momentum, is followed almost directly.
 * Pending travel is capped so fast spinning never builds a long queue.
 *
 * This module is pure; `components/studio/CalmScroll.tsx` decides when to apply
 * it and leaves everything else (touch, keyboard, scrollbar, zoom, nested
 * scroll areas, reduced motion) to the browser.
 */
export const WHEEL_SCALE = 0.7;
/** Pixels per line for line-mode wheels (Firefox), close to Chrome's pixel deltas. */
export const LINE_PIXELS = 32;
/** Easing time constants, seconds. */
export const NOTCH_EASE = 0.075;
export const PRECISE_EASE = 0.018;
/** Pending travel never exceeds this fraction of the viewport. */
export const MAX_QUEUE = 0.9;

export type WheelKind = "notch" | "precise";

/** Converts a wheel delta to pixels. */
export function wheelPixels(delta: number, deltaMode: number, viewportHeight: number) {
  if (deltaMode === 1) return delta * LINE_PIXELS;
  if (deltaMode === 2) return delta * viewportHeight;
  return delta;
}

/**
 * Mouse wheels send coarse, whole-number steps (or lines); trackpads and
 * high-resolution wheels send streams of small or fractional pixel deltas.
 */
export function wheelKind(delta: number, deltaMode: number): WheelKind {
  if (deltaMode !== 0) return "notch";
  return Math.abs(delta) >= 40 && Number.isInteger(delta) ? "notch" : "precise";
}

export class CalmScroller {
  /** Where the eased scroll is heading, or null when idle. */
  target: number | null = null;
  private position = 0;
  private ease = NOTCH_EASE;

  get active() {
    return this.target !== null;
  }

  /** Adds one wheel event's travel. `current` is the page's scroll position now. */
  add(pixels: number, kind: WheelKind, current: number, max: number, viewportHeight: number) {
    if (this.target === null) this.position = current;
    const base = this.target ?? current;
    // Reversing direction drops whatever travel was still pending.
    const fresh = this.target !== null && Math.sign(pixels) !== Math.sign(this.target - this.position) ? this.position : base;
    const cap = viewportHeight * MAX_QUEUE;
    const wanted = fresh + pixels * WHEEL_SCALE;
    this.target = Math.min(max, Math.max(0, Math.min(this.position + cap, Math.max(this.position - cap, wanted))));
    this.ease = kind === "notch" ? NOTCH_EASE : PRECISE_EASE;
  }

  /** Advances by `dt` seconds; returns the next scroll position, or null when settled. */
  step(dt: number, max: number): number | null {
    if (this.target === null) return null;
    this.target = Math.min(this.target, max);
    const t = 1 - Math.exp(-Math.max(0, Math.min(dt, 0.1)) / this.ease);
    this.position += (this.target - this.position) * t;
    if (Math.abs(this.target - this.position) < 0.5) {
      this.position = this.target;
      this.target = null;
    }
    return this.position;
  }

  /** Another input moved the page (keyboard, scrollbar, anchor, touch): stop easing. */
  cancel() {
    this.target = null;
  }
}
