import { clamp } from "./gait";
import { CatMotion, WALK_LIMITS, type MotionLimits } from "./motion";
import { destination, isClearAt, nearestClear, pathClear, pointAt, sAtY, type CatRoute, type RoutePoint } from "./route";
import { CAT_ENVELOPE, catHalfWidth } from "./view";
import { CatWalker, type WalkerOptions } from "./walker";

/**
 * Keeps the cat company with the visitor. Scrolling only decides where the cat
 * would like to be; the cat walks there along its cleared route at a bounded
 * pace. When the destination is too far to walk calmly (a scrollbar drag,
 * Home/End, an anchor, a restored tab) or lies beyond a stretch it may not
 * cross, the cat fades out where it is and reappears near the destination,
 * without counting the jump as walking. It also fades while it would sit under
 * fixed page chrome (the header or the music player).
 */
export type ViewRect = { left: number; top: number; right: number; bottom: number };

export type CompanionFrame = {
  scrollY: number;
  /** Seconds since the previous frame (unclamped; long gaps are handled here). */
  dt: number;
  /** Seconds since the scroll position last changed. */
  sinceScroll: number;
  /** Viewport rectangles of fixed chrome the cat must not appear beneath. */
  chrome: ViewRect[];
};

export type CompanionState = {
  x: number;
  pageY: number;
  /** Viewport y of the cat's centre. */
  y: number;
  opacity: number;
  /** True while anything is still moving, fading or settling. */
  active: boolean;
  /** Set on frames where the cat was repositioned instead of walking. */
  jumped: boolean;
};

/** Walks shorter than this many seconds are walked; longer ones reposition discreetly. */
export const MAX_CATCH_UP = 2.6;
/**
 * A visible cat that has fallen far behind repositions only after a real pause,
 * not in the gaps between wheel notches while the visitor is still reading on.
 */
const CATCH_UP_PAUSE = 0.9;
/** The cat may drift this fraction of the viewport from its anchor before following. */
const COMFORT = 0.06;
/** Reversals shorter than this (world units) back up rather than turning round. */
const BACK_UP = 0.22;
const FADE_OUT = 0.18;
/** Fixed chrome hides the cat faster than a reposition does. */
const FADE_CHROME = 0.07;
const FADE_IN = 0.32;
/** On reappearing, the cat is placed this far short of its destination and walks in. */
const LEAD = 0.55;

type Jump = { to: number; lead: number; faded: boolean };

export class CatCompanion {
  readonly motion = new CatMotion();
  readonly walker: CatWalker;
  opacity = 0;
  private route: CatRoute;
  private limits: MotionLimits;
  private jump: Jump | null = null;
  private following = false;
  private waited = 0;
  private placed = false;
  private lastScroll: number | null = null;
  private scrollSpeed = 0;

  constructor(route: CatRoute, walker: WalkerOptions, limits: MotionLimits = WALK_LIMITS) {
    this.route = route;
    this.walker = new CatWalker(walker);
    this.limits = limits;
  }

  get point(): RoutePoint {
    return pointAt(this.route, this.motion.s);
  }

  /** Replaces the route after a re-measure, keeping the cat where it stands on the page. */
  setRoute(route: CatRoute, walker?: Partial<WalkerOptions>) {
    const pageY = this.placed ? this.point.pageY : null;
    this.route = route;
    if (walker) this.walker.setOptions(walker);
    if (pageY === null) return;
    // Keep walking at the same pace: a re-measure moves the route, not the cat.
    const v = this.motion.v;
    this.motion.place(sAtY(route, pageY));
    this.motion.v = v;
    const point = this.point;
    this.walker.place(point.x, point.pageY);
    if (this.jump) this.jump = null;
  }

  private stageAnchor: number | null = null;

  /**
   * The cat's resting height in the viewport: the layout's anchor, moved into
   * the open stage between fixed chrome above and below the lane (on short
   * viewports, such as phones zoomed in, the music player reaches it).
   */
  private anchorFor(chrome: ViewRect[]) {
    const { layout } = this.route;
    const ppu = layout.pxPerUnit;
    let top = 0, bottom = layout.viewport.height;
    for (const rect of chrome) {
      if (rect.right <= layout.lane.left || rect.left >= layout.right) continue;
      if (rect.top + rect.bottom < layout.viewport.height) top = Math.max(top, rect.bottom);
      else bottom = Math.min(bottom, rect.top);
    }
    const margin = 24;
    const low = top + margin + CAT_ENVELOPE.above * ppu, high = bottom - margin - CAT_ENVELOPE.below * ppu;
    // No room between them at all (a tiny or heavily zoomed viewport): stay out of sight.
    return low <= high ? clamp(layout.anchor, low, high) : null;
  }

  private wantedY(scrollY: number) {
    return scrollY + (this.stageAnchor ?? this.route.layout.anchor);
  }

  /** Puts the cat at its spot for this scroll position, sitting, to fade in. */
  place(scrollY: number) {
    const s = nearestClear(this.route, this.wantedY(scrollY)) ?? 0;
    this.motion.place(s);
    const point = this.point;
    this.walker.place(point.x, point.pageY);
    this.placed = true;
    this.following = false;
  }

  /** The cat's silhouette in the viewport, for visibility and chrome checks. */
  private viewBox(point: RoutePoint, scrollY: number): ViewRect {
    const ppu = this.route.layout.pxPerUnit;
    const half = (this.walker.sit > 0.5 ? CAT_ENVELOPE.seated : catHalfWidth(Math.abs(Math.sin(this.walker.yaw)))) * ppu;
    const y = point.pageY - scrollY;
    return { left: point.x - half, right: point.x + half, top: y - CAT_ENVELOPE.above * ppu, bottom: y + CAT_ENVELOPE.below * ppu };
  }

  update(frame: CompanionFrame): CompanionState {
    let jumped = false;
    this.stageAnchor = this.anchorFor(frame.chrome);
    if (!this.placed) { this.place(frame.scrollY); jumped = true; }
    const route = this.route;
    const { viewport } = route.layout;
    const dt = clamp(frame.dt, 0, 0.1);
    const gap = frame.dt > 0.25;

    let point = this.point;
    const anchorY = this.wantedY(frame.scrollY);
    const drift = Math.abs(point.pageY - anchorY);
    if (drift > viewport.height * COMFORT) this.following = true;
    const wantedY = this.following ? anchorY : point.pageY;
    const dest = destination(route, wantedY, this.motion.s);

    // Scrolling carries the cat across the screen; look ahead by a fade so it is
    // already gone by the time the page would slide it under fixed chrome.
    const leap = this.lastScroll !== null && Math.abs(frame.scrollY - this.lastScroll) > viewport.height * 0.2;
    let instant = 0;
    if (this.lastScroll !== null && frame.dt > 0) {
      instant = clamp((frame.scrollY - this.lastScroll) / Math.max(frame.dt, 1 / 240), -6000, 6000);
      this.scrollSpeed += (instant - this.scrollSpeed) * (frame.dt > 0.25 ? 1 : 0.5);
    }
    this.lastScroll = frame.scrollY;
    const box = this.viewBox(point, frame.scrollY);
    const offscreen = box.bottom < 0 || box.top > viewport.height || box.right < 0 || box.left > viewport.width;
    // Whichever is faster, the smoothed or this frame's scroll speed, so an accelerating scroll is caught early.
    const speed = Math.abs(instant) > Math.abs(this.scrollSpeed) ? instant : this.scrollSpeed;
    const shift = -speed * FADE_OUT * 1.5;
    const ahead = { top: Math.min(box.top, box.top + shift), bottom: Math.max(box.bottom, box.bottom + shift) };
    const margin = 16;
    const underChrome = frame.chrome.some((rect) => box.left < rect.right + margin && box.right > rect.left - margin && ahead.top < rect.bottom + margin && ahead.bottom > rect.top - margin);
    const walkTime = Math.abs(dest.walk - this.motion.s) / this.limits.maxSpeed;

    if (!this.jump) {
      const settled = frame.sinceScroll;
      const atBlock = dest.beyond !== null && Math.abs(dest.walk - this.motion.s) < 0.01;
      this.waited = atBlock ? this.waited + dt : 0;
      let to: number | null = null;
      if (!isClearAt(route, this.motion.s)) {
        // The layout changed under the cat: move somewhere clear at once.
        to = nearestClear(route, wantedY);
      } else if (dest.beyond !== null && this.waited > 0.6 && settled > 0.25) {
        to = dest.beyond;
      } else if (walkTime > 1.2 && (gap || (offscreen && settled > 0.15))) {
        to = dest.walk;
      } else if (walkTime > MAX_CATCH_UP && settled > CATCH_UP_PAUSE) {
        to = dest.walk;
      }
      if (to !== null) {
        const visible = this.opacity > 0.01 && !offscreen;
        this.jump = { to, lead: this.leadFor(to), faded: !visible };
      }
    }

    let hold = false;
    let face: number | null = null;
    if (this.jump) {
      hold = true;
      if (this.jump.faded || this.opacity <= 0.01) {
        const { to, lead } = this.jump;
        const start = clamp(to - lead, 0, route.length);
        this.motion.place(start);
        point = this.point;
        this.walker.place(point.x, point.pageY);
        if (lead !== 0) {
          // It reappears on its feet, already facing the way it is walking in.
          this.walker.yaw = lead > 0 ? point.heading : point.heading + Math.PI;
          this.walker.sit = 0;
        }
        this.jump = null;
        this.waited = 0;
        this.following = true;
        jumped = true;
      }
    }

    if (!this.jump) {
      const target = this.following ? destination(route, wantedY, this.motion.s).walk : this.motion.s;
      const error = target - this.motion.s;
      const direction = Math.abs(error) > 0.004 ? Math.sign(error) : 0;
      let limits = this.limits;
      if (direction !== 0) {
        const travel = direction > 0 ? point.heading : point.heading + Math.PI;
        const facing = Math.cos(travel - this.walker.yaw);
        const starting = Math.abs(this.motion.v) < 0.05 || Math.sign(this.motion.v) !== direction;
        if (facing < 0 && Math.abs(error) < BACK_UP && this.walker.sit <= 0.02) {
          // A small step back: shuffle backwards without turning round.
          limits = { ...this.limits, maxSpeed: this.limits.maxSpeed * 0.35 };
        } else if (starting && !this.walker.ready(travel)) {
          hold = true;
          face = travel;
        }
      } else if (this.motion.v === 0) {
        this.following = false;
      }
      this.motion.step(target, dt, limits, hold);
    } else {
      this.motion.step(this.motion.s, dt, this.limits, true);
    }

    point = this.point;
    this.walker.update(point.x, point.pageY, jumped ? 0 : dt, { allowance: point.allowance, face });

    const show = !this.jump && !underChrome && this.stageAnchor !== null;
    const rate = show ? 1 / FADE_IN : 1 / (underChrome ? FADE_CHROME : FADE_OUT);
    this.opacity = clamp(this.opacity + (show ? rate : -rate) * dt, 0, 1);
    // An instant scroll jump (End, Home, an anchor) that lands it under chrome hides it at once.
    if (underChrome && leap) this.opacity = 0;

    return {
      x: point.x,
      pageY: point.pageY,
      y: point.pageY - frame.scrollY,
      opacity: this.opacity,
      active: this.walker.moving || this.motion.v !== 0 || this.following || this.jump !== null || (show ? this.opacity < 1 : this.opacity > 0),
      jumped,
    };
  }

  /** How far short of `to` to reappear, walking in from the side it came from, if that stretch is clear. */
  private leadFor(to: number) {
    const direction = to >= this.motion.s ? 1 : -1;
    const lead = Math.min(LEAD, Math.abs(to - this.motion.s)) * direction;
    const start = clamp(to - lead, 0, this.route.length);
    return isClearAt(this.route, start) && pathClear(this.route, start, to) ? to - start : 0;
  }
}
