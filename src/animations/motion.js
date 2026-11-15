/**
 * MOTION SYSTEM
 * One source of truth for easing + timing across the experience.
 * Categories: UI · TYPE · CAMERA · OBJECT (3D) · MICRO
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

// Signature curves
CustomEase.create('cine', 'M0,0 C0.18,0 0.12,1 1,1');            // long cinematic settle
CustomEase.create('cineInOut', 'M0,0 C0.7,0 0.15,1 1,1');        // camera moves
CustomEase.create('snap', 'M0,0 C0.3,0 0,1 1,1');                // UI snap
CustomEase.create('drift', 'M0,0 C0.4,0 0.2,1 1,1');

export const EASE = {
  ui: 'expo.out',
  uiInOut: 'expo.inOut',
  type: 'cine',
  typeIn: 'power3.in',
  camera: 'cineInOut',
  object: 'power3.inOut',
  micro: 'power2.out',
  elastic: 'elastic.out(1, 0.55)',
  scrub: 'none', // scrubbed timelines map scroll 1:1; smoothing comes from `scrub` lag
  drift: 'drift',
  snap: 'snap',
};

export const DUR = {
  micro: 0.35,
  ui: 0.7,
  type: 1.2,
  typeLong: 1.6,
  camera: 2.6,
  object: 1.8,
};

export const STAGGER = {
  chars: 0.022,
  words: 0.06,
  lines: 0.09,
};

// scrub smoothing per category (seconds of lag)
export const SCRUB = {
  camera: 1.2,
  type: 0.8,
  ui: 0.5,
};

export const isTouch = () =>
  typeof window !== 'undefined' && (window.matchMedia('(hover: none)').matches || 'ontouchstart' in window);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
/** remap a global progress into a local 0..1 window */
export const range = (p, a, b) => clamp01((p - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
/** frame-rate independent damping */
export const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));

export { gsap, ScrollTrigger, SplitText };

