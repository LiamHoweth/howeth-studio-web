import { clamp, strideFor, type GaitInput } from "./gait";

/**
 * Turns successive route points into gait state. Distance travelled across the
 * page advances the gait, so scrolling faster walks faster, scrolling back
 * walks back, and stopping lets the cat stand and then sit.
 */
export type WalkerOptions = {
  /** Screen px per world unit, from the orthographic camera. */
  pxPerUnit: number;
  /** Camera elevation above the ground plane, in radians. */
  elevation: number;
  /** Jumps larger than this (px) reposition the cat instead of walking. */
  snapDistance: number;
};

export const SIT_DELAY = 1.3;
const STOP_DELAY = 0.12;
/** Reversals shorter than this (world units) back up; longer ones turn round. */
const TURN_DISTANCE = 0.3;

const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
const approach = (value: number, target: number, rate: number, dt: number) => value + (target - value) * (1 - Math.exp(-rate * dt));

export class CatWalker {
  phase = 0;
  yaw = 0;
  heading = 0;
  walk = 0;
  sit = 1;
  speed = 0;
  still = Number.POSITIVE_INFINITY;
  private last: { x: number; y: number } | null = null;
  private reverse = 0;

  constructor(private options: WalkerOptions) {}

  setOptions(options: Partial<WalkerOptions>) {
    this.options = { ...this.options, ...options };
  }

  /** Repositions without walking, e.g. after a resize or a long jump. */
  place(x: number, pageY: number) {
    this.last = { x, y: pageY };
    this.reverse = 0;
  }

  /** Advances by one frame. `x` is page x and `pageY` page y of the cat, in px. */
  update(x: number, pageY: number, dt: number) {
    const step = clamp(dt, 0, 0.1);
    const previous = this.last;
    this.last = { x, y: pageY };
    let distance = 0;
    if (previous) {
      const dx = x - previous.x, dy = pageY - previous.y;
      if (Math.hypot(dx, dy) > this.options.snapDistance) {
        this.reverse = 0;
      } else {
        // Screen y is foreshortened by the camera's elevation.
        const gx = dx / this.options.pxPerUnit;
        const gz = dy / (this.options.pxPerUnit * Math.sin(this.options.elevation));
        distance = Math.hypot(gx, gz);
        if (distance > 1e-5) {
          const travel = Math.atan2(gx, gz);
          const along = Math.cos(wrap(travel - this.yaw));
          if (along < 0 && this.walk > 0.2) {
            // Brief reversals back up; sustained ones turn round.
            this.reverse += distance;
            if (this.reverse > TURN_DISTANCE) this.heading = travel;
          } else {
            this.reverse = 0;
            this.heading = travel;
          }
          const forward = Math.cos(wrap(travel - this.yaw)) < 0 ? -1 : 1;
          this.phase += (forward * distance) / strideFor(this.speed);
        }
      }
    }
    const instant = step > 0 ? distance / step : 0;
    if (distance > 1e-5) this.still = 0; else this.still += step;
    this.speed = approach(this.speed, instant, distance > 1e-5 ? 8 : 5, step);
    if (this.speed < 1e-3 && distance === 0) this.speed = 0;
    const walking = this.still < STOP_DELAY;
    const seated = this.still > SIT_DELAY;
    this.walk = approach(this.walk, walking ? 1 : 0, walking ? 12 : 9, step);
    this.sit = approach(this.sit, seated ? 1 : 0, seated ? 3.2 : 10, step);
    // A seated cat turns to face the visitor.
    const targetYaw = seated ? 0 : this.heading;
    this.yaw = wrap(this.yaw + wrap(targetYaw - this.yaw) * (1 - Math.exp(-(walking ? 9 : 4) * step)));
    if (Math.abs(this.walk) < 1e-4) this.walk = 0;
    if (Math.abs(1 - this.sit) < 1e-4) this.sit = 1;
  }

  /** True while any part of the motion is still easing, so rendering can sleep once false. */
  get moving() {
    const turning = Math.abs(wrap((this.sit > 0.5 ? 0 : this.heading) - this.yaw)) > 1e-3;
    return this.walk > 0 || this.sit < 1 || this.speed > 0 || turning;
  }

  gait(time: number, look: { x: number; y: number }, blink: number): GaitInput {
    return { phase: this.phase, walk: this.walk, speed: this.speed, sit: this.sit, time, look, blink };
  }
}
