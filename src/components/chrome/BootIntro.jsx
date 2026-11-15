import { useEffect, useRef, useState } from 'react';
import { gsap, EASE, prefersReducedMotion } from '../../animations/motion';
import { app, scenes } from '../../utils/store';
import { ScrambleText } from '../ui/ScrambleText';
import './chrome.css';

/**
 * SCENE 00 — OPENING OPTICAL FILM SEQUENCE (0–4s CHOREOGRAPHY)
 * Optical aperture lock inspired by cinema title cards (~1.05s boot progress, skippable anytime),
 * seamlessly triggering the continuous WebGL `scenes.hero.intro` camera pullback across 0..4s.
 */
export function BootIntro({ onReady }) {
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const barRef = useRef(null);
  const skippedRef = useRef(false);

  const finish = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    app.loaded = true;
    app.introDone = true;
    document.body.classList.remove('is-loading');
    setPct(100);
    setDone(true);
    if (prefersReducedMotion()) {
      scenes.hero.intro = 1;
    } else {
      gsap.to(scenes.hero, {
        intro: 1,
        duration: 2.35,
        ease: EASE.camera,
      });
    }
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
        // Begin unfolding the WebGL portrait & camera dolly near tail of boot
        scenes.hero.intro = Math.max(0, (state.p - 0.5) / 0.5) * 0.28;
      },
      onComplete: finish,
    });

    tl.to(state, { p: 0.72, duration: 0.55, ease: 'power2.out' }).to(state, {
      p: 1,
      duration: fontsResolved ? 0.38 : 0.5,
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
      className={`boot boot--cinema ${done ? 'is-done' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={done}
      onClick={finish}
    >
      <div className="boot__top">
        <span className="mono">
          <span className="boot__dot" aria-hidden="true" />
          <ScrambleText text="ASRAR://DIGITAL_FILM_v2" duration={540} />
        </span>
        <button
          type="button"
          className="boot__skip"
          onClick={(e) => {
            e.stopPropagation();
            finish();
          }}
          aria-label="Enter experience"
        >
          ENTER [ESC]
        </button>
      </div>

      <div className="boot__center boot__center--cinema">
        <div className="boot__title display">
          <ScrambleText text="ASRAR MULLA" duration={680} delay={60} />
        </div>
        <div className="boot__capsule">
          Asrar Mulla is an AI &amp; Data Science engineer building full-stack intelligent systems,
          real-time computer vision pipelines, and interactive 3D web experiences.
        </div>
        <div className="boot__enter-cue mono">
          <span style={{ color: 'var(--signal)' }}>●</span> CLICK OR SCROLL TO ENTER DIGITAL FILM
        </div>
      </div>

      <div className="boot__bar-wrap">
        <span className="mono">OPTICAL // LOCK</span>
        <div className="boot__bar">
          <div ref={barRef} className="boot__bar-fill" />
        </div>
        <span className="mono">{String(pct).padStart(3, '0')}%</span>
      </div>
    </div>
  );
}
