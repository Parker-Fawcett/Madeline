export interface GroundPosition {
  x: number;
  z: number;
}

export interface Obstacle {
  x: number;
  z: number;
  radius: number;
}

export interface MoveConfig {
  speed: number;
  deadzone: number;
  groundRadius: number;
}

// Mutates `pos` in place so the per-frame loop allocates nothing.
// Returns whether the player is walking.
export function stepPlayer(
  pos: GroundPosition,
  input: { x: number; y: number },
  yaw: number,
  delta: number,
  obstacles: Obstacle[],
  config: MoveConfig
): boolean {
  if (Math.hypot(input.x, input.y) <= config.deadzone) return false;

  const sin = Math.sin(yaw);
  const cos = Math.cos(yaw);
  const step = config.speed * delta;
  pos.x += (cos * input.x - sin * input.y) * step;
  pos.z += (-sin * input.x - cos * input.y) * step;

  const dist = Math.hypot(pos.x, pos.z);
  if (dist > config.groundRadius) {
    pos.x *= config.groundRadius / dist;
    pos.z *= config.groundRadius / dist;
  }

  for (const o of obstacles) {
    const dx = pos.x - o.x;
    const dz = pos.z - o.z;
    const d = Math.hypot(dx, dz);
    if (d < o.radius && d > 0.0001) {
      pos.x = o.x + (dx * o.radius) / d;
      pos.z = o.z + (dz * o.radius) / d;
    }
  }

  return true;
}
