/** Device capability helpers */
export function detectWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_lose_context');
    ext && ext.loseContext();
    return true;
  } catch (e) {
    return false;
  }
}

export function detectTier() {
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const touch = window.matchMedia('(hover: none)').matches;
  if (mem <= 2 || cores <= 2) return 'low';
  if (touch || cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}

export const isMobileWidth = () => window.innerWidth < 768;

