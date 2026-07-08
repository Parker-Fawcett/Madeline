const KEYS = {
  unlocked: "pretty:unlocked",
  visited: "pretty:visited",
} as const;

function isAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getUnlocked(): boolean {
  if (typeof window === "undefined" || !isAvailable()) return false;
  try {
    return localStorage.getItem(KEYS.unlocked) === "true";
  } catch {
    return false;
  }
}

export function setUnlocked(): void {
  if (typeof window === "undefined" || !isAvailable()) return;
  try {
    localStorage.setItem(KEYS.unlocked, "true");
  } catch {
    // storage unavailable — fail silently
  }
}

export function getVisited(): string[] {
  if (typeof window === "undefined" || !isAvailable()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.visited) || "[]");
  } catch {
    return [];
  }
}

export function addVisited(route: string): void {
  const current = getVisited();
  const updated = Array.from(new Set([...current, route]));
  try {
    localStorage.setItem(KEYS.visited, JSON.stringify(updated));
  } catch {
    // storage unavailable — fail silently
  }
}

export function clear(): void {
  if (typeof window === "undefined" || !isAvailable()) return;
  try {
    localStorage.removeItem(KEYS.unlocked);
    localStorage.removeItem(KEYS.visited);
  } catch {
    // storage unavailable — fail silently
  }
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
