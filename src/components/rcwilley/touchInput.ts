// What the fingers are doing, shared from the page's touch handlers to the
// 3D world each frame.
export interface TouchInput {
  start: { x: number; y: number; t: number } | null; // where the current touch began
  hold: { x: number; y: number } | null; // finger held down, in normalised screen coords
  usedGesture: boolean; // this touch became a hold or a two-finger look, so it isn't a tap
  lastLook: number; // when a two-finger look last turned the camera
}

export function idleInput(): TouchInput {
  return { start: null, hold: null, usedGesture: false, lastLook: 0 };
}
