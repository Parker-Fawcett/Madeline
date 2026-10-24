export const GROUND_Y = -0.1;
// Above the tallest model even when it floats and scales up on highlight.
export const LABEL_WORLD_Y = 1.7;

export function labelOffsetFor(markerY: number): number {
  return LABEL_WORLD_Y - markerY;
}
