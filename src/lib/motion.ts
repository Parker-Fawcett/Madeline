export interface Mover {
  x: number;
  z: number;
  vx: number;
  vz: number;
}

export interface MotionConfig {
  maxSpeed: number;
  accel: number; // how quickly she gets up to speed (m/s²)
  decel: number; // how gently she slows to a stop (m/s²)
  arriveDistance: number;
}

const STOPPED = 0.05;

// Eases `m` toward `target`: speeds up gradually, slows so it comes to rest
// on the target, never overshoots. Mutates `m`; returns whether it moved.
export function stepMotion(
  m: Mover,
  target: { x: number; z: number },
  dt: number,
  config: MotionConfig
): boolean {
  const dx = target.x - m.x;
  const dz = target.z - m.z;
  const dist = Math.hypot(dx, dz);
  const speed = Math.hypot(m.vx, m.vz);
  if (dist <= config.arriveDistance && speed < STOPPED) {
    m.vx = 0;
    m.vz = 0;
    return false;
  }

  // the fastest speed from which she can still stop by the target
  const wanted = dist > 1e-6 ? Math.min(config.maxSpeed, Math.sqrt(2 * config.decel * dist)) : 0;
  const wantVx = dist > 1e-6 ? (dx / dist) * wanted : 0;
  const wantVz = dist > 1e-6 ? (dz / dist) * wanted : 0;
  const ddx = wantVx - m.vx;
  const ddz = wantVz - m.vz;
  const change = Math.hypot(ddx, ddz);
  const maxChange = (wanted > speed ? config.accel : config.decel) * dt;
  const k = change > maxChange ? maxChange / change : 1;
  m.vx += ddx * k;
  m.vz += ddz * k;

  const stepX = m.vx * dt;
  const stepZ = m.vz * dt;
  if (Math.hypot(stepX, stepZ) >= dist) {
    m.x = target.x;
    m.z = target.z;
    m.vx = 0;
    m.vz = 0;
  } else {
    m.x += stepX;
    m.z += stepZ;
  }
  return true;
}
