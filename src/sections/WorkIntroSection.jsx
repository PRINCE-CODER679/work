import { useEffect, useRef } from 'react';
import { gsap, SCRUB, prefersReducedMotion } from '../animations/motion';
import './sections.css';

/**
 * SCENE 03 — SELECTED WORK INTRODUCTION
 * Dramatic scale anticipation before revealing the four distinct project worlds.
 */
export function WorkIntroSection() {
  const sectionRef = useRef(null);
  const workRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        workRef.current,
        { xPercent: -10, letterSpacing: '-0.08em' },
        {
          xPercent: 8,
          letterSpacing: '-0.02em',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: SCRUB.type,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="scene-work-intro"
      ref={sectionRef}
      className="work-intro section"
      aria-label="Selected Work"
    >
      <div className="work-intro__top mono">
        <span className="section-index">03 / EXHIBITION ARCHIVE</span>
        <span className="muted">04 VERIFIED PRODUCTION BUILDS</span>
      </div>

      <h2 className="work-intro__mega">
        <span className="work-intro__selected">SELECTED</span>
        <span ref={workRef} className="work-intro__work">
          WORK<span className="accent-c">.</span>
        </span>
      </h2>

      <div className="work-intro__rail mono muted">
        <span>01 SPENDSENSE AI</span>
        <span>02 SIGNSENSE AI</span>
        <span>03 MEDIKIOSK</span>
        <span>04 DEVTALKS &apos;26</span>
      </div>
    </section>
  );
}

