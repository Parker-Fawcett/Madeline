import type { Rect } from "./tapWalk";

export interface NavGrid {
  bounds: Rect;
  cell: number; // grid resolution in metres
  radius: number; // how much clearance she needs around furniture
}

interface Point {
  x: number;
  z: number;
}

const SAMPLE = 0.05;
const DIAGONAL = Math.SQRT2;

function blocked(p: Point, obstacles: Rect[], radius: number): boolean {
  for (const r of obstacles) {
    if (p.x > r.minX - radius && p.x < r.maxX + radius && p.z > r.minZ - radius && p.z < r.maxZ + radius) {
      return true;
    }
  }
  return false;
}

// Whether she can walk straight from a to b keeping `radius` clear of furniture.
export function segmentClear(a: Point, b: Point, obstacles: Rect[], radius: number): boolean {
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  const steps = Math.max(1, Math.ceil(len / SAMPLE));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (blocked({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t }, obstacles, radius)) return false;
  }
  return true;
}

// Which grid cells are walkable. The furniture doesn't move, so this is
// built once per obstacle list and grid and reused for every tap.
const cellCache = new WeakMap<Rect[], WeakMap<NavGrid, Uint8Array>>();
function walkableCells(
  obstacles: Rect[],
  grid: NavGrid,
  cols: number,
  rows: number,
  center: (c: number, r: number) => Point
): Uint8Array {
  let byGrid = cellCache.get(obstacles);
  if (!byGrid) {
    byGrid = new WeakMap();
    cellCache.set(obstacles, byGrid);
  }
  let free = byGrid.get(grid);
  if (!free) {
    free = new Uint8Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) free[r * cols + c] = blocked(center(c, r), obstacles, grid.radius) ? 0 : 1;
    }
    byGrid.set(grid, free);
  }
  return free;
}

// Route from start to goal around obstacles: a grid search, then smoothed
// so she walks direct lines between the few corners she needs. A goal
// inside furniture moves to the nearest open spot. Null when unreachable.
export function findPath(start: Point, goal: Point, obstacles: Rect[], grid: NavGrid): Point[] | null {
  const { bounds, cell, radius } = grid;
  const cols = Math.floor((bounds.maxX - bounds.minX) / cell);
  const rows = Math.floor((bounds.maxZ - bounds.minZ) / cell);
  const center = (c: number, r: number): Point => ({
    x: bounds.minX + (c + 0.5) * cell,
    z: bounds.minZ + (r + 0.5) * cell,
  });
  const free = walkableCells(obstacles, grid, cols, rows, center);

  const nearestFree = (p: Point): number => {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < free.length; i++) {
      if (!free[i]) continue;
      const q = center(i % cols, Math.floor(i / cols));
      const d = (q.x - p.x) ** 2 + (q.z - p.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };

  const goalBlocked = blocked(goal, obstacles, radius);
  const goalCell = nearestFree(goal);
  const startCell = nearestFree(start);
  if (goalCell < 0 || startCell < 0) return null;
  const end = goalBlocked ? center(goalCell % cols, Math.floor(goalCell / cols)) : goal;

  if (segmentClear(start, end, obstacles, radius)) return [end];

  // A* over the grid with 8-way moves
  const g = new Float32Array(cols * rows).fill(Infinity);
  const came = new Int32Array(cols * rows).fill(-1);
  const closed = new Uint8Array(cols * rows);
  const open: number[] = [startCell];
  const inOpen = new Uint8Array(cols * rows);
  inOpen[startCell] = 1;
  const goalPt = center(goalCell % cols, Math.floor(goalCell / cols));
  const h = (i: number) => {
    const p = center(i % cols, Math.floor(i / cols));
    return Math.hypot(p.x - goalPt.x, p.z - goalPt.z) / cell;
  };
  g[startCell] = 0;
  let found = false;
  while (open.length) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (g[open[i]] + h(open[i]) < g[open[bi]] + h(open[bi])) bi = i;
    const cur = open.splice(bi, 1)[0];
    inOpen[cur] = 0;
    if (cur === goalCell) {
      found = true;
      break;
    }
    closed[cur] = 1;
    const cc = cur % cols;
    const cr = Math.floor(cur / cols);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nc = cc + dc;
        const nr = cr + dr;
        if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
        const ni = nr * cols + nc;
        if (!free[ni] || closed[ni]) continue;
        // no cutting diagonally past a blocked corner
        if (dr && dc && (!free[cr * cols + nc] || !free[nr * cols + cc])) continue;
        const cost = g[cur] + (dr && dc ? DIAGONAL : 1);
        if (cost < g[ni]) {
          g[ni] = cost;
          came[ni] = cur;
          if (!inOpen[ni]) {
            open.push(ni);
            inOpen[ni] = 1;
          }
        }
      }
    }
  }
  if (!found) return null;

  const cells: Point[] = [];
  for (let i = goalCell; i !== -1 && i !== startCell; i = came[i]) cells.unshift(center(i % cols, Math.floor(i / cols)));
  cells[cells.length - 1] = end;

  // string-pull: from each point, jump to the furthest one in plain sight
  const path: Point[] = [];
  let from = start;
  let i = 0;
  while (i < cells.length) {
    let j = cells.length - 1;
    while (j > i && !segmentClear(from, cells[j], obstacles, radius)) j--;
    path.push(cells[j]);
    from = cells[j];
    i = j + 1;
  }
  return path;
}
