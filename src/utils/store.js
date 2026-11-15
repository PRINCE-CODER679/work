/**
 * Lightweight shared mutable state read inside R3F `useFrame`, scroll loops,
 * cursor dampeners, and chapter indicators without causing React re-renders per frame.
 */
export const pointer = {
  x: 0, // normalized [-1, 1]
  y: 0, // normalized [-1, 1]
  px: 0, // pixel X
  py: 0, // pixel Y
  active: false,
};

export const scroll = {
  y: 0,
  velocity: 0,
  progress: 0, // 0..1 across entire document
  direction: 1,
};

export const scenes = {
  hero: { progress: 0, visible: true, intro: 0 },
  about: { progress: 0, visible: false },
  workIntro: { progress: 0, visible: false },
  spendsense: { progress: 0, visible: false },
  signsense: { progress: 0, visible: false },
  medikiosk: { progress: 0, visible: false },
  devtalks: { progress: 0, visible: false },
  universe: { progress: 0, visible: false },
  dsa: { progress: 0, visible: false },
  lab: { progress: 0, visible: false },
  direction: { progress: 0, visible: false },
  contact: { progress: 0, visible: false },
};

export const app = {
  lenis: null,
  reducedMotion: false,
  touch: false,
  webgl: true,
  loaded: false,
  introDone: false,
  wireframe: false,
  activeSectionId: 'scene-hero',
  tier: 'high',
};

if (typeof window !== 'undefined') {
  window.__asrar = { pointer, scroll, scenes, app };
}
