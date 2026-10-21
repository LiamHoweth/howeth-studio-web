/** Camera elevation above the floor: steep enough to see the back, low enough for the legs. */
export const CAMERA_ELEVATION = 0.42;
/** World height of the walking cat, ears included, as seen by the camera. */
export const CAT_SCREEN_UNITS = 1.22;
/**
 * Symmetric horizontal envelope about the rig origin for every heading, including
 * its curling tail, tilted head and ink outline. A width-only bounding box is
 * insufficient: the tail makes the silhouette asymmetric while turning.
 */
export const CAT_FULL_TURN_WIDTH_UNITS = 2.2;
export const CAT_LANE_INSET = 4;

/** CSS size is a maximum; keep the complete turning silhouette in the lane. */
export function fitCatToLane(desiredHeight: number, laneWidth: number) {
  const availableWidth = Math.max(0, laneWidth - CAT_LANE_INSET * 2);
  const pxPerUnit = Math.min(Math.max(0, desiredHeight) / CAT_SCREEN_UNITS, availableWidth / CAT_FULL_TURN_WIDTH_UNITS);
  return { width: pxPerUnit * CAT_FULL_TURN_WIDTH_UNITS, height: pxPerUnit * CAT_SCREEN_UNITS };
}
/** The square canvas spans this many world units, enough for a sideways cat and tail. */
export const VIEW_UNITS = 2.9;
