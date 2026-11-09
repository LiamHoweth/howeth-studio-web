import { BASE_STRIDE, clamp, fract, smoothstep } from "./gait";

/**
 * Maps the walker's state onto the authored GLB's animation clips
 * (`public/beopity/cat3d/beopity-cat.glb`, see design/branding/cat3d/CLAUDE_HANDOFF.txt).
 * Pure numbers so the blend rules are tested without WebGL.
 *
 * The walk clip is scrubbed by distance travelled, never by wall-clock time, so
 * planted paws keep pace with the page. Sitting down and standing up scrub the
 * one-shot transition clips by the walker's eased `sit` value (clamped at the
 * ends) and hand over to the matching idle loop; idle loops run on their own clock.
 */
export const CAT_GLB_URL = "/beopity/cat3d/beopity-cat.glb";

export const CLIPS = {
  walk: "walk",
  idleStand: "idle_stand",
  sitDown: "sit_down",
  idleSit: "idle_sit",
  standUp: "stand_up",
} as const;
export type ClipKey = keyof typeof CLIPS;

/** Morph targets on the head-parented expression mesh. */
export const MORPHS = { blink: "blink", dilate: "pupil_dilate" } as const;

/** Ground covered by one walk clip cycle at scale 1 (metres): the asset's 0.102 m/s at 1×, 1 s loop. */
export const WALK_STRIDE_METERS = 0.102;

export type ClipDurations = Record<ClipKey, number>;
export type ClipState = { weight: number; time: number };
export type ClipMix = Record<ClipKey, ClipState>;

export type MixInput = {
  /** Walker gait phase, in cycles of BASE_STRIDE world units. */
  phase: number;
  /** 0 standing still … 1 walking. */
  walk: number;
  /** 0 standing … 1 fully seated (eased by the walker). */
  sit: number;
  /** True while `sit` last moved upward (sitting down), false while standing up. */
  sitting: boolean;
  /** Free-running seconds for the idle loops. */
  clock: number;
  /** World units per metre of the loaded model. */
  scale: number;
};

/** Walk-clip cycles per walker phase cycle, so authored paws match travelled ground. */
export function walkCyclesPerPhase(scale: number) {
  return BASE_STRIDE / (WALK_STRIDE_METERS * Math.max(scale, 1e-6));
}

/** Seated idle takes over over the last part of the sit transition. */
const SETTLE = 0.9;

export function clipMix(input: MixInput, durations: ClipDurations): ClipMix {
  const walk = clamp(input.walk, 0, 1);
  const sit = clamp(input.sit, 0, 1);
  const rest = 1 - walk;
  const seated = smoothstep(SETTLE, 1, sit);
  const transitioning = sit > 0 && sit < 1 ? 1 - seated : 0;
  const idleSit = rest * seated;
  const transition = rest * transitioning * smoothstep(0, 0.08, sit);
  const idleStand = Math.max(0, rest - idleSit - transition);

  const progress = clamp(sit / SETTLE, 0, 1);
  const walkTime = fract(input.phase * walkCyclesPerPhase(input.scale)) * durations.walk;
  return {
    walk: { weight: walk, time: walkTime },
    idleStand: { weight: idleStand, time: fract(input.clock / durations.idleStand) * durations.idleStand },
    sitDown: { weight: input.sitting ? transition : 0, time: progress * durations.sitDown },
    standUp: { weight: input.sitting ? 0 : transition, time: (1 - progress) * durations.standUp },
    idleSit: { weight: idleSit, time: fract(input.clock / durations.idleSit) * durations.idleSit },
  };
}

/** Idle loops (breathing, tail sway) want gentle frames whenever the cat is not walking. */
export function wantsIdleFrames(walk: number) {
  return walk < 0.999;
}
