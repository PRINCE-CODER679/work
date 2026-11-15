/**
 * Shared, non-reactive runtime state.
 * Animation values that change every frame live here (refs), never in React state.
 */
export const pointer = {
  x: 0, y: 0,           // normalized -1..1 (smoothed by consumers)
  px: 0, py: 0,         // pixels
  vx: 0, vy: 0,         // velocity px/frame
  active: false,
};

export const scroll = {
  y: 0,
  velocity: 0,
  progress: 0,
  direction: 1,
};

/** per-scene scroll progress, written by ScrollTrigger, read by WebGL scenes */
export const scenes = {
  hero: { progress: 0, visible: true, intro: 0 },
  about: { progress: 0, visible: false },
  spendsense: { progress: 0, visible: false },
  signsense: { progress: 0, visible: false },
  medikiosk: { progress: 0, visible: false },
  universe: { progress: 0, visible: false },
  contact: { progress: 0, visible: false },
};

export const app = {
  lenis: null,
  reducedMotion: false,
  touch: false,
  webgl: true,
  loaded: false,
  introDone: false,
  tier: 'high', // 'high' | 'mid' | 'low'
};

if (typeof window !== 'undefined') {
  const onMove = (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.vx = e.clientX - pointer.px;
    pointer.vy = e.clientY - pointer.py;
    pointer.px = e.clientX;
    pointer.py = e.clientY;
    pointer.x = nx;
    pointer.y = ny;
    pointer.active = true;
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  window.__asrar = { pointer, scroll, scenes, app }; // debug handle for QA
}

