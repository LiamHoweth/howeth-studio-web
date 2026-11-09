/** Camera elevation above the floor: steep enough to see the back, low enough for the legs. */
export const CAMERA_ELEVATION = 0.42;
/** World height of the walking cat, ears included, as seen by the camera. */
export const CAT_SCREEN_UNITS = 1.22;
/** The square canvas spans this many world units, enough for a sideways cat and tail. */
export const VIEW_UNITS = 2.9;

/**
 * Measured screen-space envelope of the complete cat (skinned tail, tilted head,
 * whiskers, ink outline, contact shadow and lantern glow) about the canvas
 * centre, in world units. `scripts/beopity-cat.test.mjs` projects every vertex of
 * every pose through the real camera and fails if anything escapes it.
 *
 * Horizontal extent depends on how sideways the cat stands: facing the visitor
 * or walking away it is narrow, side-on (or mid-turn) its tail makes it wide.
 */
export const CAT_ENVELOPE = {
  /** Half-width facing the visitor or walking straight up the page, sitting down included. */
  facing: 0.62,
  /** Half-width of the standing cat at any heading, so standing turns fit too. */
  turning: 0.84,
  /** Half-width of the seated cat (sit >= SIT_TURN) at any heading, for seated pivots. */
  seated: 0.64,
  /** Above and below the canvas centre (screen y). */
  above: 1.0,
  below: 0.95,
} as const;

/**
 * Ground discs drawn under the cat. The lantern glow keeps the black cat legible
 * on charcoal; it is a pool under the cat rather than a halo over nearby text.
 * `radius` is where the glow fades out completely.
 */
export const CAT_GLOW = { radius: 0.58, opacity: 0.26 } as const;
export const CAT_SHADOW = { size: 1.4, stretch: [1.9, 1] as [number, number], falloff: 0.62, opacity: 0.5 } as const;

/** Half-width in world units for a cat whose heading is `sideways` = |sin(yaw)|. */
export function catHalfWidth(sideways: number) {
  const t = Math.min(1, Math.max(0, sideways) / 0.7);
  return CAT_ENVELOPE.facing + (CAT_ENVELOPE.turning - CAT_ENVELOPE.facing) * t;
}

/** Narrow lanes keep the standing cat within this heading of straight up/down the page. */
export const NARROW_SIDEWAYS = Math.sin(0.15);
/**
 * Focus rings (5px offset, 2px wide) of controls that end at the content
 * column's edge reach this far into the lane; the cat's walk stays beyond them.
 */
export const CONTENT_EDGE = 8;
/** The cat sits down or stands up only while this square-on (|sin(yaw)|). */
export const FACING_SIDEWAYS = 0.1;
/** Seated enough to pivot on the spot within the seated envelope. */
export const SIT_TURN = 0.97;
/** Gap kept between the cat and neighbouring content, in px. */
export function catClearance(pxPerUnit: number) {
  return Math.max(8, Math.round(pxPerUnit * 0.12));
}

export type CatFit = {
  pxPerUnit: number;
  /** On-screen height of the walking cat body, in px (CAT_SCREEN_UNITS). */
  height: number;
  /** True when the lane fits a standing turn; otherwise the cat pivots while seated. */
  freeTurn: boolean;
  /** Largest |sin(yaw)| allowed while standing in the lane. */
  sideways: number;
};

/**
 * Size the cat for a lane of `laneWidth` px. CSS `--cat-size` is the desired
 * height; the lane decides whether the cat can turn standing up or must sit to
 * turn round. A free turn is preferred unless it would shrink the cat noticeably.
 */
export function fitCat(desiredHeight: number, laneWidth: number): CatFit {
  const desired = Math.max(0, desiredHeight) / CAT_SCREEN_UNITS;
  const usable = Math.max(0, laneWidth - CONTENT_EDGE);
  const fits = (halfWidth: number) => {
    // Clearance grows with the cat, so solve for the largest scale that fits.
    let ppu = usable / (2 * halfWidth);
    for (let i = 0; i < 4; i++) ppu = Math.max(0, usable - catClearance(ppu)) / (2 * halfWidth);
    while (ppu > 0 && 2 * halfWidth * ppu + catClearance(ppu) > usable) ppu -= 0.01;
    return Math.min(desired, ppu);
  };
  const free = fits(CAT_ENVELOPE.turning);
  const narrow = fits(Math.max(catHalfWidth(NARROW_SIDEWAYS), CAT_ENVELOPE.seated));
  const freeTurn = free >= narrow * 0.88;
  const pxPerUnit = freeTurn ? free : narrow;
  return { pxPerUnit, height: pxPerUnit * CAT_SCREEN_UNITS, freeTurn, sideways: freeTurn ? 1 : NARROW_SIDEWAYS };
}
