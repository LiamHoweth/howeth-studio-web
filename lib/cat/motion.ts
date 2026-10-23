import { MAX_WALK_SPEED } from "./gait";

/**
 * The cat's own movement along its route, separate from where scrolling says it
 * should be. Position is ground distance along the route (world units). Speed
 * and acceleration are bounded and integrated over elapsed time, so the cat
 * eases toward its destination and stops there; it can never sprint, however
 * fast the page scrolls. Distances too long to walk are handled by the
 * companion with a discreet reposition, never by walking faster.
 */
export type MotionLimits = {
  /** Firm top walking speed, world units per second. */
  maxSpeed: number;
  /** Acceleration and deceleration bound, world units per second squared. */
  accel: number;
};

export const WALK_LIMITS: MotionLimits = { maxSpeed: MAX_WALK_SPEED, accel: 1.1 };
/** Within this of the destination the cat is considered there. */
const ARRIVE = 0.004;

export class CatMotion {
  /** Ground distance along the route. */
  s = 0;
  /** Signed speed along the route. */
  v = 0;

  place(s: number) {
    this.s = s;
    this.v = 0;
  }

  /**
   * Advances by `dt` seconds toward `target`. With `hold` the cat brakes to a
   * stop (e.g. while it turns round); `maxSpeed` may be lowered for backing up.
   */
  step(target: number, dt: number, limits: MotionLimits, hold = false) {
    const step = Math.min(Math.max(dt, 0), 0.1);
    if (step === 0) return;
    const error = target - this.s;
    const distance = Math.abs(error);
    // The fastest speed from which the cat can still stop at the target.
    const braking = Math.sqrt(2 * limits.accel * Math.max(0, distance - ARRIVE));
    const desired = hold || distance <= ARRIVE ? 0 : Math.sign(error) * Math.min(limits.maxSpeed, braking, distance / step);
    const change = Math.max(-limits.accel * step, Math.min(limits.accel * step, desired - this.v));
    const next = this.v + change;
    // Integrate with the average speed over the step, then never pass the target.
    let move = ((this.v + next) / 2) * step;
    if (!hold && (distance === 0 || Math.sign(move) !== Math.sign(error) && Math.abs(move) > 0 && distance <= ARRIVE)) move = 0;
    else if (!hold && Math.sign(error) * move > distance) move = error;
    this.s += move;
    // At the destination the bounded deceleration brings the speed exactly to zero.
    this.v = next;
  }
}
