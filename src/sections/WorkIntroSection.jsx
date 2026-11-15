import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../data/projects';
import { gsap, SCRUB, isTouch, prefersReducedMotion } from '../animations/motion';
import { scenes } from '../utils/store';
import { scrollToTarget } from '../hooks/useSmoothScroll';
import { Magnetic } from '../components/ui/Magnetic';
import './workGallery.css';

const SCENE_ANCHOR_BY_SLUG = {
  spendsense: '#scene-spendsense',
  signsense: '#scene-signsense',
  medikiosk: '#scene-medikiosk',
  devtalks: '#scene-devtalks',
};

/**
 * SCENE 03 — POLARITY FLIP & SPATIAL WORK EXHIBITION STAGE
 * High-key bone-cream inversion showcasing all 4 live projects suspended in an interactive
 * 3D perspective carousel controlled via selector pills, pointer tilt, and quick exhibit jumps.
 */
export function WorkIntroSection({ onOpenCase }) {
  const sectionRef = useRef(null);
  const wordRef = useRef(null);
  const stageRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current || !wordRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordRef.current,
        { xPercent: 4 },
        {
          xPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: SCRUB.type,
            onUpdate: (self) => {
              scenes.workIntro.progress = self.progress;
              scenes.workIntro.visible = self.isActive;
            },
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handlePointerMove = (e) => {
    if (isTouch() || prefersReducedMotion() || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
    setTilt({ rx, ry });
  };

  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  const active = PROJECTS[activeIdx];
  const previewSrc = active.screens[0]?.src;

  return (
    <section
      id="scene-work-intro"
      ref={sectionRef}
      className="work-gallery section"
      aria-label="Scene 03: Selected Work Spatial Showcase"
    >
      <div className="work-gallery__top">
        <div className="mono section-index" style={{ color: 'var(--dark)' }}>
          <span>SPATIAL EXHIBITION ARCHIVE</span>
        </div>
        <span className="mono" style={{ color: 'var(--muted-dark)' }}>
          FOUR LIVE DEPLOYED SYSTEMS · 2026
        </span>
      </div>

      <h2 className="work-gallery__mega" aria-label="Selected Work">
        <span className="work-gallery__selected">SELECTED</span>
        <span ref={wordRef} className="work-gallery__word">
          WORK.
        </span>
      </h2>

      {/* Interactive High-Key 3D Perspective Gallery Stage */}
      <div
        ref={stageRef}
        className="work-gallery__stage"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <div className="work-gallery__viewport">
          <div
            className="work-gallery__carousel"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }}
          >
            {PROJECTS.map((proj, idx) => {
              const offset = idx - activeIdx;
              const absOff = Math.abs(offset);
              const isCenter = idx === activeIdx;
              return (
                <button
                  key={proj.slug}
                  type="button"
                  className={`work-gallery__card ${isCenter ? 'is-center' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    transform: `translate3d(${offset * 48}%, ${absOff * 10}px, ${isCenter ? 70 : -absOff * 125}px) rotateY(${offset * -15}deg) scale(${isCenter ? 1 : 0.84})`,
                    opacity: absOff > 2 ? 0 : isCenter ? 1 : 0.44,
                    zIndex: 10 - absOff,
                    borderColor: isCenter ? proj.accent : 'rgba(10,10,10,0.14)',
                  }}
                  aria-label={`Select ${proj.title}`}
                  data-cursor="FOCUS"
                >
                  <div className="work-gallery__card-head mono">
                    <span style={{ color: proj.accent }}>{proj.category}</span>
                    <span>{proj.year}</span>
                  </div>
                  <div className="work-gallery__card-frame">
                    <img
                      src={proj.screens[0]?.src}
                      alt={`${proj.title} interface preview`}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                  <div className="work-gallery__card-foot">
                    <strong className="work-gallery__card-title">{proj.shortTitle}</strong>
                    <span className="mono">{proj.stack.slice(0, 3).join(' · ')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Project Readout + Selector Pill Matrix (desktop strip / 2-col mobile) */}
        <div className="work-gallery__deck">
          <div className="work-gallery__meta">
            <div className="mono" style={{ color: active.accent }}>
              ACTIVE EXHIBIT {active.index} — {active.title.toUpperCase()}
            </div>
            <p className="work-gallery__summary">{active.summary}</p>
          </div>

          <div className="work-gallery__controls">
            <div className="work-gallery__pills" role="tablist" aria-label="Featured projects switcher">
              {PROJECTS.map((proj, idx) => (
                <button
                  key={proj.slug}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIdx}
                  className={`work-gallery__pill ${idx === activeIdx ? 'is-active' : ''}`}
                  style={idx === activeIdx ? { borderColor: proj.accent } : undefined}
                  onClick={() => setActiveIdx(idx)}
                  data-cursor="SELECT"
                >
                  <span className="mono" style={{ color: idx === activeIdx ? '#fff' : proj.accent }}>
                    {proj.index}
                  </span>
                  <span>{proj.shortTitle}</span>
                </button>
              ))}
            </div>

            <div className="work-gallery__cta-row">
              {onOpenCase ? (
                <Magnetic>
                  <button
                    type="button"
                    className="btn btn--dark"
                    onClick={() => onOpenCase(active.slug)}
                    data-cursor="OPEN"
                  >
                    <span>VIEW CASE STUDY</span>
                    <span className="btn__arrow" aria-hidden="true">↗</span>
                  </button>
                </Magnetic>
              ) : null}
              <button
                type="button"
                className="btn btn--dark-ghost"
                onClick={() => scrollToTarget(SCENE_ANCHOR_BY_SLUG[active.slug] || '#scene-spendsense')}
                data-cursor="ENTER"
              >
                <span>EXPLORE EXHIBIT ↓</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">{previewSrc}</span>
    </section>
  );
}
