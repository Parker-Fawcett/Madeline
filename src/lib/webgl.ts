export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    const ok = !!(gl && typeof gl.getParameter === "function");
    // iOS Safari caps live WebGL contexts; free the probe so it doesn't
    // count against the real scene.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}
