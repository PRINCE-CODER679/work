import { useEffect, useRef, useState } from 'react';
import { gsap, SCRUB, prefersReducedMotion } from '../animations/motion';
import { scenes } from '../utils/store';
import { scrollToTarget } from '../hooks/useSmoothScroll';
import { ScrambleText } from '../components/ui/ScrambleText';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Magnetic } from '../components/ui/Magnetic';
import { HeroDotField } from '../components/hero/HeroDotField';
import { HeroPortraitStage } from '../components/hero/HeroPortraitStage';
import { PROFILE } from '../data/profile';
import './sections.css';

/**
 * SCENE 01 — EDITORIAL PHOTOGRAPHIC HERO (RAZORPAY-GRADE INTERACTION + IMAGE TREATMENT)
 * Integrates Asrar's own portrait as the central spatial installation framed around
 * monumental stepped typography, interactive studio key-light / ASCII telemetry aperture,
 * and smooth reversible scroll transition into Scene 02 Cream Daylight.
 */
export function HeroSection({ ready }) {
  const sectionRef = useRef(null);
  const word1Ref = useRef(null);
  const word2Ref = useRef(null);
  const word3Ref = useRef(null);
  const subRef = useRef(null);
  const portraitWrapRef = useRef(null);
  const horizonRef = useRef(null);
  const [stageReadout, setStageReadout] = useState('OPTIC // PORTRAIT LOCK');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      scenes.hero.progress = 0;
      return undefined;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=135%',
          pin: true,
          scrub: SCRUB.camera,
          anticipatePin: 1,
          onUpdate: (self) => {
            scenes.hero.progress = self.progress;
            const phase =
              self.progress < 0.25
                ? 'OPTIC // PORTRAIT LOCK'
                : self.progress < 0.65
                ? 'SCAN // ASCII DISSOLVE'
                : 'HORIZON // CREAM SHIFT';
            setStageReadout(phase);
          },
        },
      });

      tl.to(word1Ref.current, { xPercent: -18, yPercent: -12, opacity: 0.14, ease: 'none' }, 0.16)
        .to(word2Ref.current, { xPercent: 14, yPercent: -8, opacity: 0.12, ease: 'none' }, 0.2)
        .to(word3Ref.current, { scale: 1.14, yPercent: 12, opacity: 0, ease: 'none' }, 0.26)
        .to(subRef.current, { yPercent: 32, opacity: 0, ease: 'none' }, 0.22)
        .to(portraitWrapRef.current, { yPercent: -8, opacity: 0.25, ease: 'none' }, 0.34)
        .to(horizonRef.current, { scaleY: 1, ease: 'power2.inOut' }, 0.72);
    });

    mm.add('(max-width: 767px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.65,
          onUpdate: (self) => {
            scenes.hero.progress = self.progress * 0.75;
          },
        },
      });
      tl.to(portraitWrapRef.current, { scale: 1.04, opacity: 0.45, ease: 'none' }, 0)
        .to(word1Ref.current, { xPercent: -8, opacity: 0.4, ease: 'none' }, 0)
        .to(word2Ref.current, { xPercent: 8, opacity: 0.35, ease: 'none' }, 0);
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      id="scene-hero"
      ref={sectionRef}
      className="hero section"
      aria-label="Hero — Building What's Next"
    >
      <HeroDotField />

      <div className="hero__meta">
        <div>
          <div className="mono">
            <ScrambleText text="ASRAR MULLA" trigger={ready} duration={650} />
          </div>
          <div className="mono muted">
            AI &amp; DATA SCIENCE / CREATIVE DEVELOPMENT
          </div>
        </div>

        <div className="hero__cad mono">
          <span style={{ color: 'var(--cobalt)' }}>●</span>
          <span>{stageReadout}</span>
          <span className="muted">· PUNE, IN</span>
        </div>
      </div>

      <div className="hero__composition">
        {/* Left editorial typography column overlapping edge of atmospheric portrait */}
        <div className="hero__type-col">
          <h1 className="sr-only">Asrar Mulla — Building What&apos;s Next. AI, Software, Experiments.</h1>

          <div className="hero__eyebrow mono">
            <span style={{ color: 'var(--signal)' }}>01 //</span> AI / SOFTWARE / EXPERIMENTS
          </div>

          <div className="hero__stack-words">
            <div ref={word1Ref} className="hero__word hero__word--1" aria-hidden="true">
              <SplitHeadline lines={['BUILDING']} immediate delay={0.12} />
            </div>

            <div ref={word2Ref} className="hero__word hero__word--2" aria-hidden="true">
              <SplitHeadline lines={["WHAT'S"]} immediate delay={0.22} />
            </div>

            <div ref={word3Ref} className="hero__word hero__word--3" aria-hidden="true">
              <SplitHeadline
                lines={[
                  <>
                    NEXT<span className="accent-o">.</span>
                  </>,
                ]}
                immediate
                delay={0.32}
              />
            </div>
          </div>

          <p ref={subRef} className="hero__sub">
            Designing and engineering intelligent systems—from computer vision and financial anomaly detection to interactive WebGL worlds.
          </p>

          <div className="hero__actions">
            <Magnetic>
              <button
                type="button"
                className="btn"
                onClick={() => scrollToTarget('#scene-work-intro')}
                data-cursor="WORK"
              >
                <span>EXPLORE WORK</span>
                <span className="btn__arrow" aria-hidden="true">↘</span>
              </button>
            </Magnetic>

            <Magnetic>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => scrollToTarget('#scene-lab')}
                data-cursor="PLAY"
              >
                <span>EXPERIMENT LAB</span>
              </button>
            </Magnetic>
          </div>
        </div>

        {/* Right visual focal plane: Asrar's interactive portrait stage */}
        <div ref={portraitWrapRef} className="hero__portrait-col">
          <HeroPortraitStage ready={ready} />
        </div>
      </div>

      <div className="hero__foot">
        <div className="mono muted">
          DR. D. Y. PATIL INSTITUTE OF TECHNOLOGY · PUNE
        </div>
        <div className="mono muted">SCROLL TO ENTER EXHIBITION ↓</div>
      </div>

      {/* Cream horizon panel rising at end of Hero dive to bridge seamlessly into Scene 02 */}
      <div ref={horizonRef} className="hero__horizon" aria-hidden="true" />
    </section>
  );
}
