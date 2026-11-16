import { useEffect, useRef } from 'react';
import { gsap, EASE, ScrollTrigger, prefersReducedMotion } from '../animations/motion';
import { scenes } from '../utils/store';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Magnetic } from '../components/ui/Magnetic';
import { HeroCenterpiece } from '../components/hero/HeroCenterpiece';
import { scrollToTarget } from '../hooks/useSmoothScroll';
import './hero.css';

/**
 * SCENE 01 — HERO EXHIBITION ("ASRAR MULLA · BUILDING WHAT'S NEXT.")
 * Features Asrar's ultra-crisp photorealistic 3D portrait integrated inside the
 * persistent WebGL stage, flanked by editorial typography strictly positioned in
 * negative space with ZERO UI overlap across the portrait.
 */
export function HeroSection({ ready }) {
  const sectionRef = useRef(null);
  const ghostRef = useRef(null);
  const leftFlankRef = useRef(null);
  const rightFlankRef = useRef(null);

  // Masked staggered opening reveal & continuous reversible ScrollTrigger camera dive
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduced) {
        scenes.hero.progress = 0;
        return;
      }

      if (ready) {
        gsap.from('[data-hero-reveal]', {
          yPercent: 18,
          opacity: 0,
          duration: 1.05,
          stagger: 0.08,
          ease: EASE.out,
          clearProps: 'transform,opacity',
        });
      }

      const applyHeroScroll = (p) => {
        scenes.hero.progress = p;
        scenes.hero.visible = p < 0.99;
        if (ghostRef.current) {
          const gOp = Math.max(0, 1 - p * 1.45);
          ghostRef.current.style.opacity = String(gOp);
          ghostRef.current.style.transform = `translate(-50%, calc(-50% - ${p * 95}px)) scale(${1 + p * 0.08})`;
        }
        if (leftFlankRef.current) {
          const lOp = Math.max(0, 1 - p * 1.55);
          leftFlankRef.current.style.opacity = String(lOp);
          leftFlankRef.current.style.transform = `translate3d(0, ${-p * 60}px, 0)`;
        }
        if (rightFlankRef.current) {
          const rOp = Math.max(0, 1 - p * 1.65);
          rightFlankRef.current.style.opacity = String(rOp);
          rightFlankRef.current.style.transform = `translate3d(0, ${-p * 50}px, 0)`;
        }
      };

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyHeroScroll(self.progress),
        onRefresh: (self) => applyHeroScroll(window.scrollY <= 2 ? 0 : self.progress),
      });

      const onWinScroll = () => {
        if (window.scrollY <= 2) applyHeroScroll(0);
      };
      window.addEventListener('scroll', onWinScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', onWinScroll);
        st.kill();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      id="scene-hero"
      ref={sectionRef}
      className="hero-film section"
      aria-label="Scene 01: Asrar Mulla Hero"
    >
      <div className="hero-film__pin">
        {/* 7-Layer Art-Directed Centerpiece: Metallic ASRAR Wordmark + Glowing Purple Orbit + High-DPI Portrait */}
        <HeroCenterpiece />

        {/* ===================================================================
            LAYER 7 — EDITORIAL DUAL-FLANK INTERFACE ELEMENTS
            Strictly placed in the negative space on left and right margins.
            =================================================================== */}
        <div className="hero-film__stage-grid">
          {/* LEFT FLANK — Identity, Disciplines & Display Headline */}
          <div ref={leftFlankRef} className="hero-film__flank hero-film__flank--left">
            <div className="hero-film__meta" data-hero-reveal>
              <div className="hero-film__tag mono">
                <span className="hero-film__live-pulse" aria-hidden="true" />
                <span>AI &amp; DATA SCIENCE</span>
              </div>
              <div className="hero-film__role mono muted">
                SOFTWARE / AI / CREATIVE DEV
              </div>
            </div>

            <div className="hero-film__title-wrap" data-hero-reveal>
              <div className="hero-film__name-kicker mono">ASRAR MULLA</div>
              <h1 className="display hero-film__headline">
                <SplitHeadline lines={['BUILDING', "WHAT'S NEXT."]} as="span" immediate={ready} />
              </h1>
            </div>
          </div>

          {/* RIGHT FLANK — Action Triggers & Scroll Invitation */}
          <div ref={rightFlankRef} className="hero-film__flank hero-film__flank--right">
            <div className="hero-film__actions" data-hero-reveal>
              <Magnetic>
                <button
                  type="button"
                  className="btn"
                  onClick={() => scrollToTarget('#scene-work-intro')}
                  data-cursor="WORK"
                >
                  <span>SELECTED WORK</span>
                  <span className="btn__arrow" aria-hidden="true">↓</span>
                </button>
              </Magnetic>

              <Magnetic>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => scrollToTarget('#scene-lab')}
                  data-cursor="WORLD"
                >
                  <span>ENTER DIGITAL WORLD</span>
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </button>
              </Magnetic>
            </div>

            <div className="hero-film__scroll mono muted" data-hero-reveal>
              <span>SCROLL TO EXPLORE</span>
              <span aria-hidden="true">↓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
