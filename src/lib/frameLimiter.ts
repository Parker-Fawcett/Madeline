// rAF timestamps jitter by a millisecond or two; without slack a 60Hz
// display would sometimes wait three frames instead of two.
const SLACK_FRACTION = 0.1;

export function createFrameLimiter(fps: number) {
  const interval = 1000 / fps;
  let last: number | null = null;

  return {
    shouldRender(now: number): boolean {
      if (last === null) {
        last = now;
        return true;
      }
      const elapsed = now - last;
      if (elapsed < interval * (1 - SLACK_FRACTION)) return false;
      // Stay on the original cadence, but don't try to catch up after a stall.
      last = elapsed > interval * 2 ? now : last + interval;
      return true;
    },
  };
}
