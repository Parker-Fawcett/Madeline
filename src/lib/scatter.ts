export interface ScatterOptions {
  seed: number;
  count: number;
  minRadius: number;
  maxRadius: number;
  spacing: number;
  avoid: { x: number; z: number; radius: number }[];
}

const ATTEMPTS_PER_POINT = 30;

// Small seeded PRNG so the layout is identical on every load.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Random points in a ring, kept `spacing` apart and out of `avoid` zones.
// Gives up on a point after a fixed number of tries, so a crowded ring
// returns fewer points rather than looping forever.
export function scatter(opts: ScatterOptions): { x: number; z: number }[] {
  const rand = mulberry32(opts.seed);
  const points: { x: number; z: number }[] = [];
  const maxAttempts = opts.count * ATTEMPTS_PER_POINT;

  for (let attempt = 0; attempt < maxAttempts && points.length < opts.count; attempt++) {
    // sqrt keeps the density even across the ring's area
    const r = Math.sqrt(
      opts.minRadius ** 2 + rand() * (opts.maxRadius ** 2 - opts.minRadius ** 2)
    );
    const theta = rand() * Math.PI * 2;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    const blocked =
      opts.avoid.some((a) => Math.hypot(x - a.x, z - a.z) < a.radius) ||
      points.some((p) => Math.hypot(x - p.x, z - p.z) < opts.spacing);
    if (!blocked) points.push({ x, z });
  }

  return points;
}
