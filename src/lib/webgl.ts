export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!(gl && typeof (gl as WebGLRenderingContext).getParameter === "function");
  } catch {
    return false;
  }
}

export function supportsWebGL2(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    return !!(gl && typeof (gl as WebGL2RenderingContext).getParameter === "function");
  } catch {
    return false;
  }
}
