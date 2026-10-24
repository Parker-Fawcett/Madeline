// Y rotation that faces a model (modelled facing +z) along a movement vector.
export function headingOf(dx: number, dz: number): number {
  return Math.atan2(dx, dz);
}

// Rotate `current` toward `target` by at most `maxStep`, the short way round.
export function turnTowards(current: number, target: number, maxStep: number): number {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  if (Math.abs(diff) <= maxStep) return current + diff;
  return current + Math.sign(diff) * maxStep;
}
