const KEYS = {
  unlocked: "pretty:unlocked",
  visited: "pretty:visited",
} as const;

// Private browsing and in-app browsers (Snapchat, Instagram) can block
// localStorage. Fall back to memory so progress lasts at least this visit
// instead of bouncing back to the login gate.
const memory = new Map<string, string>();

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, value: string): void {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage unavailable — memory copy covers this visit
  }
}

function remove(key: string): void {
  memory.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    // storage unavailable — nothing persisted to remove
  }
}

export function getUnlocked(): boolean {
  return read(KEYS.unlocked) === "true";
}

export function setUnlocked(): void {
  write(KEYS.unlocked, "true");
}

export function getVisited(): string[] {
  try {
    return JSON.parse(read(KEYS.visited) || "[]");
  } catch {
    return [];
  }
}

export function addVisited(route: string): void {
  const updated = Array.from(new Set([...getVisited(), route]));
  write(KEYS.visited, JSON.stringify(updated));
}

export function clear(): void {
  remove(KEYS.unlocked);
  remove(KEYS.visited);
}

export const REQUIRED_ROUTES = [
  "story",
  "memories",
  "quote",
  "letter",
  "playlist",
] as const;

export function isRevealUnlocked(): boolean {
  const visited = getVisited();
  return REQUIRED_ROUTES.every((r) => visited.includes(r));
}
