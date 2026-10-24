const WINDOW = 60; // frames averaged before deciding
const SLACK = 1.25; // how far over budget the average may run

// Starts at `high` fps and drops to `low` for good if recent frames keep
// running over budget. Never climbs back, so the rate doesn't flicker.
export function createAdaptiveFps(high: number, low: number) {
  const budget = (1000 / high) * SLACK;
  const samples: number[] = [];
  let sum = 0;
  let current = high;

  return {
    fps: () => current,
    record(frameMs: number) {
      if (current === low) return;
      samples.push(frameMs);
      sum += frameMs;
      if (samples.length > WINDOW) sum -= samples.shift()!;
      if (samples.length === WINDOW && sum / WINDOW > budget) current = low;
    },
  };
}
