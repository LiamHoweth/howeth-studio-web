/** Camera elevation above the floor: steep enough to see the back, low enough for the legs. */
export const CAMERA_ELEVATION = 0.42;
/** World height the orthographic camera looks at; the canvas is centred on it. */
export const CAMERA_FOCUS_Y = 0.55;
/**
 * Screen distance (world units) from the canvas centre down to the ground point
 * under the rig, where the paws meet the floor. Route points are canvas centres,
 * so a band's footpath line sits this far below them.
 */
export const FEET_BELOW_CENTRE_UNITS = CAMERA_FOCUS_Y * Math.cos(CAMERA_ELEVATION);
/** World height of the walking cat, ears included, as seen by the camera. */
export const CAT_SCREEN_UNITS = 1.05;
/**
 * Symmetric horizontal envelope about the rig origin for every heading, including
 * its curling tail, tilted head and ink outline. A width-only bounding box is
 * insufficient: the tail makes the silhouette asymmetric while turning.
 */
export const CAT_FULL_TURN_WIDTH_UNITS = 1.94;
export const CAT_LANE_INSET = 4;
/** Lanes narrower than this (phones) have no room to walk: the cat only crosses bands. */
export const PHONE_LANE = 60;

/**
 * CSS size is a maximum; keep the complete turning silhouette in the lane.
 * Phones have no lane, so the cat keeps the requested size for band crossings.
 */
export function fitCatToLane(desiredHeight: number, laneWidth: number) {
  const byHeight = Math.max(0, desiredHeight) / CAT_SCREEN_UNITS;
  const pxPerUnit = laneWidth < PHONE_LANE ? byHeight : Math.min(byHeight, Math.max(0, laneWidth - CAT_LANE_INSET * 2) / CAT_FULL_TURN_WIDTH_UNITS);
  return { width: pxPerUnit * CAT_FULL_TURN_WIDTH_UNITS, height: pxPerUnit * CAT_SCREEN_UNITS, pxPerUnit };
}
/**
 * The square canvas spans this many world units about the camera focus: the
 * full turning silhouette (radius < 0.97) plus the raised tail and contact shadow.
 */
export const VIEW_UNITS = 2.15;
