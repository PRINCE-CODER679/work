import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animations/motion';
import { app, scroll } from '../utils/store';

/**
 * Integrates Lenis smooth scrolling cleanly with GSAP ScrollTrigger.
 * Guarantees no double-scrolling, smooth reverse scrub, and clean refreshes
 * after fonts load and viewport resizes.
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    app.reducedMotion = reduced;

    if (!enabled || reduced) {
      app.lenis = null;
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.18,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });

    app.lenis = lenis;

    const onScroll = ({ scroll: y, velocity, progress, direction }) => {
      scroll.y = y;
      scroll.velocity = velocity;
      scroll.progress = progress;
      scroll.direction = direction || 1;
      ScrollTrigger.update();
    };

    lenis.on('scroll', onScroll);

    const tick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 180);
    };
    window.addEventListener('resize', onResize, { passive: true });

    let cancelled = false;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad, { once: true });

    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onLoad);
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      app.lenis = null;
    };
  }, [enabled]);
}

export function scrollToTarget(target, offset = 0) {
  if (app.lenis && !app.reducedMotion) {
    app.lenis.scrollTo(target, { offset, duration: 1.35 });
    return;
  }
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: app.reducedMotion ? 'auto' : 'smooth' });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el) {
    el.scrollIntoView({ behavior: app.reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }
}

