import { useEffect, useRef, useState } from 'react';
import { gsap, EASE, prefersReducedMotion } from '../../animations/motion';
import { app, scenes } from '../../utils/store';
import { ScrambleText } from '../ui/ScrambleText';
import './chrome.css';

/**
 * SCENE 00 — OPENING / BOOT SEQUENCE
 * Fast, real initialization choreography (~1.3s max), skippable anytime via click or Esc.
 * Synchronizes `scenes.hero.intro` (0 -> 1) so the WebGL camera smoothly pulls back
 * from macro detail inside the computational core into the full Hero composition.
 */
export function BootIntro({ onReady }) {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const barRef = useRef(null);
  const skippedRef = useRef(false);

  const finish = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    scenes.hero.intro = 1;
    app.loaded = true;
    app.introDone = true;
    document.body.classList.remove('is-loading');
    setPct(100);
    setDone(true);
    if (onReady) onReady();
  };

  useEffect(() => {
    const reduced = prefersReducedMotion();
    if (reduced) {
      finish();
      return;
    }

    document.body.classList.add('is-loading');
    const state = { p: 0 };

    // Wait briefly for fonts so first painted frame typography is sharp, capped tightly at 1.25s
    const fontsPromise = document.fonts ? document.fonts.ready : Promise.resolve();
    let fontsResolved = false;
    fontsPromise.then(() => {
      fontsResolved = true;
    });

    const tl = gsap.timeline({
      onUpdate: () => {
        const v = Math.round(state.p * 100);
        setPct(v);
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${state.p})`;
        }
        // Start easing the 3D camera pullback during the tail end of boot
        scenes.hero.intro = Math.max(0, (state.p - 0.55) / 0.45) * 0.45;
      },
      onComplete: () => {
        gsap.to(scenes.hero, {
          intro: 1,
          duration: 1.35,
          ease: EASE.camera,
        });
        finish();
      },
    });

    tl.to(state, {
      p: 0.72,
      duration: 0.65,
      ease: 'power2.out',
    }).to(state, {
      p: 1,
      duration: fontsResolved ? 0.45 : 0.6,
      ease: 'expo.out',
    });

    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        tl.kill();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      tl.kill();
      document.body.classList.remove('is-loading');
    };
  }, []);

  return (
    <div
      className={`boot ${done ? 'is-done' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={done}
    >
      <div className="boot__top">
        <span className="mono">
          <span className="boot__dot" aria-hidden="true" />
          <ScrambleText text="SYSTEM://ASRAR" duration={600} />
        </span>
        <button
          type="button"
          className="boot__skip"
          onClick={finish}
          aria-label="Skip introduction"
        >
          SKIP [ESC]
        </button>
      </div>

      <div className="boot__center">
        <p className="mono muted">
          <ScrambleText text="INITIALIZING DIGITAL ENVIRONMENT · 18.62°N 73.79°E" duration={720} />
        </p>
        <div className="boot__title display">
          <ScrambleText text="ASRAR MULLA" duration={780} delay={120} />
        </div>
        <div className="boot__sub mono">
          <span>AI &amp; DATA SCIENCE</span>
          <span>SOFTWARE ENGINEERING</span>
          <span>CREATIVE WEBGL</span>
        </div>
      </div>

      <div className="boot__bar-wrap">
        <span className="mono">STAGE // BOOT</span>
        <div className="boot__bar">
          <div ref={barRef} className="boot__bar-fill" />
        </div>
        <span className="mono">{String(pct).padStart(3, '0')}%</span>
      </div>
    </div>
  );
}

