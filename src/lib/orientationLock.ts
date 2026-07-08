export async function requestLandscapeLock(): Promise<void> {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      await el.requestFullscreen();
    }
    await screen.orientation?.lock?.("landscape");
  } catch {
    // Fullscreen/orientation lock unsupported or blocked (e.g. in-app
    // browsers, iOS Safari outside PWA context) — the CSS rotate-prompt
    // fallback handles this case instead.
  }
}
