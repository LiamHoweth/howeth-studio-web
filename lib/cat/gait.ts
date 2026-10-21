/**
 * Procedural four-leg gait for the Beopity cat. Pure numbers only: the Three.js
 * rig applies these angles, and the Node tests verify them without a GPU.
 *
 * Frame: the cat faces +Z, +Y is up, and the ground is y = 0. Leg angles are
 * measured from straight down; positive values swing the limb forward.
 */

export const LEGS = ["hindLeft", "foreLeft", "hindRight", "foreRight"] as const;
export type LegName = (typeof LEGS)[number];

/** Lateral-sequence walk: each foot lands a quarter cycle after the previous one. */
export const WALK_OFFSETS: Record<LegName, number> = { hindLeft: 0, foreLeft: 0.25, hindRight: 0.5, foreRight: 0.75 };
/** Fraction of each cycle a foot stays planted. Above 0.5 keeps three feet down at times. */
export const DUTY = 0.62;
/** Ground distance (world units) covered by one complete gait cycle at walking pace. */
export const BASE_STRIDE = 0.4;
export const MAX_STRIDE_SCALE = 1.7;
export const PAW_RADIUS = 0.052;

export type LegSpec = { hip: [number, number, number]; upper: number; lower: number; bend: 1 | -1 };

/** Hip positions are relative to the body centre. Both joints point backwards like a cat's elbow and hock. */
export const LEG_SPECS: Record<LegName, LegSpec> = {
  foreLeft: { hip: [0.12, -0.08, 0.25], upper: 0.2, lower: 0.19, bend: -1 },
  foreRight: { hip: [-0.12, -0.08, 0.25], upper: 0.2, lower: 0.19, bend: -1 },
  hindLeft: { hip: [0.13, -0.05, -0.25], upper: 0.21, lower: 0.2, bend: -1 },
  hindRight: { hip: [-0.13, -0.05, -0.25], upper: 0.21, lower: 0.2, bend: -1 },
};
/** Kitten proportions: short legs under a round body. */
export const BODY_HEIGHT = 0.44;
export const TAIL_SEGMENTS = 11;

const TAU = Math.PI * 2;
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

/**
 * Foot position along the body (z, relative to its hip's neutral point) and
 * lift above the paw's resting height, for one leg at the given gait phase.
 * A planted foot travels backwards by exactly duty * stride per cycle, which is
 * the distance the body covers in that time, so stance feet do not slide.
 */
export function footTarget(phase: number, offset: number, stride: number, lift: number) {
  const step = DUTY * stride;
  const local = fract(phase + offset);
  if (local < DUTY) return { z: step / 2 - (local / DUTY) * step, y: 0, planted: true };
  const swing = (local - DUTY) / (1 - DUTY);
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * swing);
  return { z: -step / 2 + step * eased, y: lift * Math.sin(Math.PI * swing) ** 0.8, planted: false };
}

/** Two-bone inverse kinematics in the leg's sagittal plane. */
export function solveLeg(dz: number, dy: number, upper: number, lower: number, bend: 1 | -1) {
  const reach = clamp(Math.hypot(dz, dy), Math.abs(upper - lower) + 1e-4, upper + lower - 1e-4);
  const direction = Math.atan2(dz, -dy);
  const atHip = Math.acos(clamp((upper * upper + reach * reach - lower * lower) / (2 * upper * reach), -1, 1));
  const atKnee = Math.acos(clamp((upper * upper + lower * lower - reach * reach) / (2 * upper * lower), -1, 1));
  // bend -1 rotates the upper bone behind the hip-to-foot line, so the joint points back.
  return { hip: direction + bend * atHip, knee: -bend * (Math.PI - atKnee) };
}

/** Forward kinematics matching solveLeg, used by tests and the rig's sanity checks. */
export function legEnd(hip: number, knee: number, upper: number, lower: number) {
  return {
    z: upper * Math.sin(hip) + lower * Math.sin(hip + knee),
    y: -upper * Math.cos(hip) - lower * Math.cos(hip + knee),
  };
}

export type GaitInput = {
  /** Accumulated gait cycles; decreasing values walk backwards. */
  phase: number;
  /** 0 when standing still, 1 while walking. */
  walk: number;
  /** Ground speed in body lengths per second, for stride and lift. */
  speed: number;
  /** 0 standing, 1 fully seated like the logo. */
  sit: number;
  /** Seconds, for breathing and the tail. */
  time: number;
  /** Where the head looks, -1..1 on each axis. */
  look: { x: number; y: number };
  blink: number;
};

export type LegPose = { hip: number; knee: number; paw: number; lift: number; planted: boolean };
export type CatPose = {
  body: { y: number; z: number; pitch: number; roll: number; breathe: number };
  head: { pitch: number; yaw: number; roll: number; y: number };
  legs: Record<LegName, LegPose>;
  tail: { pitch: number; yaw: number }[];
  ears: number;
  blink: number;
  pupils: { x: number; y: number };
};

/** Body pitch (nose up) and lowering for the seated pose, rotating about the haunch. */
function bodyFrame(sit: number, bob: number) {
  const pitch = 0.55 * sit;
  return { pitch, y: BODY_HEIGHT - 0.09 * sit + bob, z: -0.06 * sit };
}

/** Hip position in the root frame for a body pitched nose-up by `pitch`. */
export function hipInRoot(spec: LegSpec, frame: { pitch: number; y: number; z: number }) {
  const [, hy, hz] = spec.hip;
  const c = Math.cos(frame.pitch), s = Math.sin(frame.pitch);
  return { y: frame.y + hy * c + hz * s, z: frame.z - hy * s + hz * c };
}

export function computePose(input: GaitInput): CatPose {
  const walk = clamp(input.walk, 0, 1) * (1 - clamp(input.sit, 0, 1));
  const sit = clamp(input.sit, 0, 1);
  const stride = strideFor(input.speed);
  const lift = mix(0.06, 0.1, clamp((input.speed - 0.9) / 2, 0, 1));
  const cycle = input.phase * TAU;
  const bob = walk * 0.013 * Math.cos(cycle * 2);
  const frame = bodyFrame(sit, bob);
  const breathe = Math.sin(input.time * 1.7) * 0.012;

  const legs = {} as Record<LegName, LegPose>;
  for (const name of LEGS) {
    const spec = LEG_SPECS[name];
    const fore = name.startsWith("fore");
    const gait = footTarget(input.phase, WALK_OFFSETS[name], stride, lift);
    const hip = hipInRoot(spec, frame);
    // Neutral feet sit under the hips; seated hind feet tuck forward under the haunch.
    const neutralZ = spec.hip[2] + (fore ? 0.02 : 0) + (fore ? -0.05 : 0.18) * sit;
    const footZ = neutralZ + gait.z * walk;
    const footY = PAW_RADIUS + gait.y * walk;
    // Vector from hip to foot, expressed in the pitched body frame.
    const dz = footZ - hip.z, dy = footY - hip.y;
    const c = Math.cos(frame.pitch), s = Math.sin(frame.pitch);
    const localZ = dy * s + dz * c;
    const localY = dy * c - dz * s;
    const solved = solveLeg(localZ, localY, spec.upper, spec.lower, spec.bend);
    // Keep the paw flat on the ground regardless of leg angles.
    const paw = -(solved.hip + solved.knee) - frame.pitch;
    legs[name] = { hip: solved.hip, knee: solved.knee, paw, lift: gait.y * walk, planted: walk < 0.01 || gait.planted };
  }

  const sway = Math.sin(cycle + 0.6) * walk;
  const idle = Math.sin(input.time * 0.9);
  const tail = Array.from({ length: TAIL_SEGMENTS }, (_, index) => {
    const t = index / (TAIL_SEGMENTS - 1);
    // Positive pitch raises the tail. Walking: up with a hooked tip, like the
    // mascot's. Seated: down to the floor, then curling round the side.
    const walkingPitch = index === 0 ? 0.95 : 0.02 + 0.3 * smoothstep(0.6, 1, t);
    const seatedPitch = index === 0 ? -0.5 : index < 4 ? -0.15 : 0;
    const seatedYaw = index === 0 ? 0.75 : 0.3 + 0.04 * idle * t;
    return {
      pitch: mix(walkingPitch, seatedPitch, sit),
      yaw: mix((0.14 * sway + 0.04 * idle) * (0.4 + t), seatedYaw, sit),
    };
  });

  const look = { x: clamp(input.look.x, -1, 1), y: clamp(input.look.y, -1, 1) };
  return {
    body: { y: frame.y, z: frame.z, pitch: frame.pitch, roll: walk * 0.035 * Math.sin(cycle), breathe: breathe * (1 - walk * 0.5) },
    head: {
      // Counter the body pitch so the seated cat looks up at the visitor.
      pitch: -frame.pitch * 0.82 - 0.08 * sit + look.y * 0.22 + walk * 0.02 * Math.cos(cycle * 2 + 0.5),
      yaw: look.x * 0.45,
      // The approved mascot's curious head tilt.
      roll: -0.24 * sit + walk * 0.02 * Math.sin(cycle),
      y: -bob * 0.6,
    },
    legs,
    tail,
    ears: 0.08 * sit,
    blink: clamp(input.blink, 0, 1),
    pupils: { x: look.x, y: look.y },
  };
}
