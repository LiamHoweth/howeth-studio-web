import { MAX_CADENCE, clamp, strideFor, type GaitInput } from "./gait";
import { FACING_SIDEWAYS, SIT_TURN } from "./view";

/**
 * Turns the cat's actual movement into gait state. The motion controller moves
 * the cat at a bounded speed; distance travelled advances the gait, so planted
 * paws stay put, and the cadence never exceeds MAX_CADENCE.
 *
 * Turning respects the space around the cat. `allowance` is the largest
 * |sin(yaw)| that fits where the cat stands: 1 lets it turn standing up; less
 * (a narrow lane) makes it sit and pivot, since the seated cat is compact at
 * any heading. It only sits down or stands up while square-on to the page, when
 * its tail and haunches stay narrowest.
 */
export type WalkerOptions = {
  /** Screen px per world unit, from the orthographic camera. */
  pxPerUnit: number;
  /** Camera elevation above the ground plane, in radians. */
  elevation: number;
};

export type WalkerIntent = {
  /** Largest |sin(yaw)| that fits here while standing; 1 allows any heading. */
  allowance: number;
  /** Heading the cat should face before it moves, or null when idle. */
  face: number | null;
};

export const SIT_DELAY = 1.3;
const STOP_DELAY = 0.12;
/** Standing turns and seated pivots, in radians per second. */
const TURN_RATE = 3.2;
const PIVOT_RATE = 2.8;
/** Ground distance a paw covers per radian of an on-the-spot turn. */
const TURN_STEP = 0.16;
/** Within this of the wanted heading the cat may set off. */
const READY_ANGLE = 0.3;

const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));
const approach = (value: number, target: number, rate: number, dt: number) => value + (target - value) * (1 - Math.exp(-rate * dt));
const sideways = (yaw: number) => Math.abs(Math.sin(yaw));
/** Nearer of facing the visitor (0) or walking away (π). */
const squareOn = (yaw: number) => (Math.cos(yaw) >= 0 ? 0 : Math.PI);

export class CatWalker {
  phase = 0;
  yaw = 0;
  walk = 0;
  sit = 1;
  speed = 0;
  /** Gait cycles per second over the last frame. */
  cadence = 0;
  still = Number.POSITIVE_INFINITY;
  private last: { x: number; y: number } | null = null;
  private wantYaw: number | null = null;
  private wantSit = 1;

  constructor(private options: WalkerOptions) {}

  setOptions(options: Partial<WalkerOptions>) {
    this.options = { ...this.options, ...options };
  }

  /** Repositions without walking, e.g. after a resize or a discreet jump. */
  place(x: number, pageY: number) {
    this.last = { x, y: pageY };
  }

  /** True when the cat faces `heading` closely enough and is standing, so it can walk. */
  ready(heading: number) {
    return this.sit <= 0.02 && Math.abs(wrap(heading - this.yaw)) < READY_ANGLE;
  }

  /** Advances one frame. `x` and `pageY` are the cat's page position in px. */
  update(x: number, pageY: number, dt: number, intent: WalkerIntent) {
    const step = clamp(dt, 0, 0.1);
    const previous = this.last;
    this.last = { x, y: pageY };
    const allowance = clamp(intent.allowance, 0, 1);
    let distance = 0;
    let travel = this.yaw;
    if (previous) {
      // Screen y is foreshortened by the camera's elevation.
      const gx = (x - previous.x) / this.options.pxPerUnit;
      const gz = (pageY - previous.y) / (this.options.pxPerUnit * Math.sin(this.options.elevation));
      distance = Math.hypot(gx, gz);
      if (distance > 1e-5) travel = Math.atan2(gx, gz);
    }
    const moving = distance > 1e-5;
    // Moving against its heading is a short back-up; the controller turns it before longer reversals.
    const backing = moving && Math.cos(wrap(travel - this.yaw)) < 0;
    const heading = moving ? (backing ? wrap(travel + Math.PI) : travel) : intent.face;

    const idle = !moving && intent.face === null;
    const seated = idle && this.still + step > SIT_DELAY;
    // Seated, the cat turns to face the visitor.
    this.wantYaw = seated ? 0 : heading ?? this.wantYaw;
    this.wantSit = seated ? 1 : 0;

    let turned = 0;
    if (this.wantYaw !== null) {
      const delta = wrap(this.wantYaw - this.yaw);
      if (Math.abs(delta) > 1e-3) {
        const standingOk = this.canTurnStanding(delta, allowance);
        // Too little room to turn standing: sit, pivot, then stand.
        if (!standingOk) this.wantSit = 1;
        if (this.sit >= SIT_TURN) {
          if (this.wantSit === 1) turned = this.rotate(delta, PIVOT_RATE * step);
          // About to stand: finish pivoting square-on, toward the way it will go.
          else if (sideways(this.yaw) > FACING_SIDEWAYS) {
            const squared = sideways(this.wantYaw) <= FACING_SIDEWAYS ? this.wantYaw : squareOn(this.wantYaw);
            turned = this.rotate(wrap(squared - this.yaw), PIVOT_RATE * step);
          }
        } else if (this.sit <= 0.02) {
          if (standingOk) turned = this.rotate(delta, TURN_RATE * step);
          // Square up within the space available before sitting down to pivot.
          else if (sideways(this.yaw) > FACING_SIDEWAYS) turned = this.rotate(wrap(squareOn(this.yaw) - this.yaw), TURN_RATE * step);
        }
      }
    }
    // Sitting down and standing up happen square-on; a sideways seated cat pivots first.
    const canChangeSit = sideways(this.yaw) <= FACING_SIDEWAYS || (this.sit > 0.02 && this.sit < SIT_TURN);
    if (canChangeSit) {
      const rate = this.wantSit > this.sit ? (seated ? 3.2 : 7) : 10;
      this.sit = approach(this.sit, this.wantSit, rate, step);
      if (this.wantSit === 1 && this.sit > 0.995) this.sit = 1;
      if (this.wantSit === 0 && this.sit < 0.005) this.sit = 0;
    } else if (this.sit >= SIT_TURN && this.wantSit === 0 && this.wantYaw === null) {
      // Seated sideways with nowhere in particular to go: pivot square-on so it can stand.
      turned += this.rotate(wrap(squareOn(this.yaw) - this.yaw), PIVOT_RATE * step);
    }

    // Steps follow ground distance, plus the paws shuffling round in an on-the-spot turn.
    const standingTurn = this.sit <= 0.02 ? Math.abs(turned) * TURN_STEP : 0;
    const stride = strideFor(this.speed);
    let cycles = (distance + standingTurn) / stride;
    if (step > 0) cycles = Math.min(cycles, MAX_CADENCE * step);
    this.phase += (backing ? -1 : 1) * cycles;
    this.cadence = step > 0 ? cycles / step : 0;

    const active = moving || standingTurn > 1e-5;
    if (active) this.still = 0; else this.still += step;
    const instant = step > 0 ? distance / step : 0;
    this.speed = approach(this.speed, instant, moving ? 8 : 5, step);
    if (this.speed < 1e-3 && !moving) this.speed = 0;
    const walking = this.still < STOP_DELAY;
    this.walk = approach(this.walk, walking ? 1 : 0, walking ? 12 : 9, step);
    if (Math.abs(this.walk) < 1e-4) this.walk = 0;
  }

  /** Turn standing up without exceeding the room available. */
  private canTurnStanding(delta: number, allowance: number) {
    if (allowance >= 0.999) return true;
    if (sideways(this.yaw) > allowance + 1e-6 || sideways(this.wantYaw ?? this.yaw) > allowance + 1e-6) return false;
    // A short turn within the same square-on cone never passes side-on.
    return Math.abs(delta) < Math.PI / 2 && squareOn(this.yaw) === squareOn(this.wantYaw ?? this.yaw);
  }

  private rotate(delta: number, maxStep: number) {
    const turn = clamp(delta, -maxStep, maxStep);
    this.yaw = wrap(this.yaw + turn);
    return turn;
  }

  /** True while any part of the motion is still easing, so rendering can sleep once false. */
  get moving() {
    const turning = this.wantYaw !== null && Math.abs(wrap(this.wantYaw - this.yaw)) > 1e-3;
    return this.walk > 0 || (this.sit > 0 && this.sit < 1) || this.speed > 0 || turning || this.sit !== this.wantSit;
  }

  gait(time: number, look: { x: number; y: number }, blink: number): GaitInput {
    return { phase: this.phase, walk: this.walk, speed: this.speed, sit: this.sit, time, look, blink };
  }
}
