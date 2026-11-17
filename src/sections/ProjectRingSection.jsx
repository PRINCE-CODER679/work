import { useCallback, useEffect, useRef, useState } from 'react';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { gsap, ScrollTrigger, damp, prefersReducedMotion } from '../animations/motion';
import './projectRing.css';

const RING_PROJECTS = [
  {
    slug: 'spendsense',
    index: '01',
    title: 'SPENDSENSE AI',
    category: 'AI / FINTECH',
    accent: '#536BFF',
    accentGlow: 'rgba(83, 107, 255, 0.35)',
    screen: '/assets/projects/spendsense-01.webp',
    summary:
      'AI-powered personal finance engine. Upload bank statements for automated categorization, anomaly alerts, budget tracking, and monthly spending forecasting.',
    tech: 'React · FastAPI · Pandas · MongoDB',
    liveUrl: 'https://spendsense-psi-two.vercel.app/',
    repoUrl: 'https://github.com/PRINCE-CODER679/spendsense',
  },
  {
    slug: 'signsense',
    index: '02',
    title: 'SIGNSENSE AI',
    category: 'COMPUTER VISION / ML',
    accent: '#FF5924',
    accentGlow: 'rgba(255, 89, 36, 0.35)',
    screen: '/assets/projects/signsense-01.webp',
    summary:
      'Real-time American Sign Language alphabet recognition using MediaPipe 21-point 3D hand tracking with scikit-learn classification & interactive practice mode.',
    tech: 'React · MediaPipe · OpenCV · FastAPI',
    liveUrl: 'https://sign-sense-blush.vercel.app/',
    repoUrl: 'https://github.com/PRINCE-CODER679/SignSense',
  },
  {
    slug: 'medikiosk',
    index: '03',
    title: 'MEDIKIOSK',
    category: 'AI / HEALTHCARE',
    accent: '#2FD3C4',
    accentGlow: 'rgba(47, 211, 196, 0.35)',
    screen: '/assets/projects/medikiosk-01.webp',
    summary:
      'Accessible multilingual patient intake kiosk (English, हिंदी, मराठी) paired with structured physician dashboard featuring red-flag triage alerts and clinician verification.',
    tech: 'React · Python · FastAPI · SQLAlchemy',
    liveUrl: 'https://github.com/PRINCE-CODER679/MEDIKIOSK',
    repoUrl: 'https://github.com/PRINCE-CODER679/MEDIKIOSK',
  },
];

const CARD_STEP = 120; // 360 / 3

/**
 * SCENE 03 — SELECTED WORK: KAI MARLOW-INSPIRED 3D PROJECT RING
 * Exactly 3 projects distributed circularly in 3D space: SpendSense, SignSense, MediKiosk.
 * Features mouse/touch drag with inertia, snapping to active front card, physical 180° backflip
 * to reveal verified links (Live Demo & GitHub), and keyboard controls.
 */
export function ProjectRingSection({ onOpenCase }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const cylinderRef = useRef(null);

  // Rotation angles in degrees
  const angleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState(null);
  const [radius, setRadius] = useState(340);

  // Continuous scroll-linked depth & parallax entering/leaving Selected Work
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 769px)', () => {
        const bgTitle = el.querySelector('.ring-bg-title');
        const header = el.querySelector('.ring-header');
        const ringStage = el.querySelector('.ring-stage');
        const footer = el.querySelector('.ring-footer');

        if (bgTitle) {
          gsap.fromTo(
            bgTitle,
            { y: 50, scale: 0.94 },
            {
              y: -50,
              scale: 1.04,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.85,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        if (header) {
          gsap.fromTo(
            header,
            { y: 24, opacity: 0.4 },
            {
              y: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                end: 'top 46%',
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        if (ringStage) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 95%',
              end: 'bottom top',
              scrub: 0.75,
              invalidateOnRefresh: true,
            },
          });
          tl.fromTo(
            ringStage,
            { opacity: 0.35, scale: 0.94, y: 26 },
            { opacity: 1, scale: 1, y: 0, duration: 0.34, ease: 'power1.out' }
          )
            .to(ringStage, { opacity: 1, scale: 1, y: 0, duration: 0.36, ease: 'none' })
            .to(ringStage, { opacity: 0.42, scale: 0.95, y: -18, duration: 0.3, ease: 'power1.in' });
        }

        if (footer) {
          gsap.fromTo(
            footer,
            { y: 20, opacity: 0.4 },
            {
              y: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top 76%',
                end: 'center center',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });

      mm.add('(max-width: 768px)', () => {
        const ringStage = el.querySelector('.ring-stage');
        if (ringStage) {
          gsap.fromTo(
            ringStage,
            { opacity: 0.55, scale: 0.97, y: 14 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top 94%',
                end: 'top 42%',
                scrub: 0.55,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Responsive radius calculation
  useEffect(() => {
    const calcRadius = () => {
      const w = window.innerWidth || 1440;
      if (w < 380) setRadius(140);
      else if (w < 480) setRadius(160);
      else if (w < 768) setRadius(220);
      else if (w < 1024) setRadius(270);
      else setRadius(340);
    };
    calcRadius();
    window.addEventListener('resize', calcRadius);
    return () => window.removeEventListener('resize', calcRadius);
  }, []);

  // Compute active front-facing card from target/current angle
  const updateActiveIndex = useCallback((deg) => {
    const raw = -Math.round(deg / CARD_STEP);
    const idx = ((raw % 3) + 3) % 3;
    setActiveIndex(idx);
  }, []);

  // Smooth inertial animation loop
  useEffect(() => {
    let rafId = 0;
    let lastTick = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTick) / 1000);
      lastTick = now;

      if (!isDraggingRef.current) {
        // Smoothly damp toward targetAngle
        angleRef.current = damp(angleRef.current, targetAngleRef.current, 10, dt);
      }

      if (cylinderRef.current) {
        cylinderRef.current.style.transform = `rotateY(${angleRef.current}deg)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Snap to specific project card
  const snapToProject = useCallback(
    (index) => {
      // Find shortest angular path to bring project `index` to front (0deg)
      const current = angleRef.current;
      const targetDeg = -index * CARD_STEP;
      // Account for full revolutions
      const diff = ((targetDeg - current + 180) % 360) - 180;
      targetAngleRef.current = current + diff;
      updateActiveIndex(targetAngleRef.current);
      setFlippedIndex(null);
    },
    [updateActiveIndex]
  );

  // Next / Prev step navigation
  const rotateStep = useCallback(
    (dir) => {
      targetAngleRef.current += dir * CARD_STEP;
      updateActiveIndex(targetAngleRef.current);
      setFlippedIndex(null);
    },
    [updateActiveIndex]
  );

  // Pointer drag event handlers
  const handlePointerDown = (e) => {
    // If user clicked inside an active link or button, don't start dragging
    if (e.target.closest('a') || e.target.closest('.ring-btn--case')) return;

    // If card is currently flipped, clicking outside flips it back
    if (flippedIndex !== null) {
      if (!e.target.closest('.ring-card-face--back')) {
        setFlippedIndex(null);
      }
      return;
    }

    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || flippedIndex !== null) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dx = e.clientX - lastXRef.current;

    lastXRef.current = e.clientX;
    lastTimeRef.current = now;

    // Direct angular drag sensitivity
    const degDelta = dx * 0.38;
    angleRef.current += degDelta;
    targetAngleRef.current = angleRef.current;
    velocityRef.current = degDelta / dt;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Inertial snap with release velocity
    const releaseInertia = velocityRef.current * 180;
    const projected = angleRef.current + releaseInertia;
    const snapTarget = Math.round(projected / CARD_STEP) * CARD_STEP;
    targetAngleRef.current = snapTarget;
    updateActiveIndex(snapTarget);
  };

  // Card click: if inactive -> snap to front; if active -> toggle flip
  const handleCardClick = (idx, e) => {
    // Prevent flip if clicking link or case study button
    if (e.target.closest('a') || e.target.closest('.ring-btn--case')) return;

    if (idx !== activeIndex) {
      snapToProject(idx);
    } else {
      setFlippedIndex((prev) => (prev === idx ? null : idx));
    }
  };

  // Global Keyboard Navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        rotateStep(1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        rotateStep(-1);
      } else if (e.key === 'Escape') {
        setFlippedIndex(null);
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (document.activeElement?.closest('#scene-work-intro')) {
          e.preventDefault();
          setFlippedIndex((prev) => (prev === activeIndex ? null : activeIndex));
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, rotateStep]);

  return (
    <section
      id="scene-work-intro"
      ref={sectionRef}
      className="ring-section section"
      aria-label="Selected Work 3D Project Ring"
    >
      {/* Background Oversized Architectural Typography */}
      <div className="ring-bg-title mono" aria-hidden="true">
        <span>SELECTED</span>
        <span>WORK</span>
      </div>

      {/* Top Header */}
      <header className="ring-header">
        <div>
          <div className="mono section-index" style={{ marginBottom: '0.8rem' }}>
            <span>SELECTED WORK</span>
          </div>
          <h2 className="display ring-header__title">
            <SplitHeadline lines={['SELECTED', 'PROJECTS.']} as="span" />
          </h2>
        </div>

        <div className="ring-header__meta mono">
          <span className="ring-header__hint">
            {flippedIndex !== null ? 'CARD FLIPPED · PRESS ESC TO RETURN' : 'DRAG TO ROTATE · CLICK CARD TO FLIP'}
          </span>
          <span>
            ACTIVE [{RING_PROJECTS[activeIndex].index} / 03] — {RING_PROJECTS[activeIndex].title}
          </span>
        </div>
      </header>

      {/* 3D Cylindrical Ring Stage */}
      <div
        ref={stageRef}
        className={`ring-stage ${flippedIndex !== null ? 'is-locked' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        tabIndex={0}
        role="region"
        aria-label="Interactive 3D project carousel. Use arrow keys to navigate or enter to flip active card."
        data-cursor={flippedIndex !== null ? 'CLOSE' : 'DRAG'}
      >
        <div ref={cylinderRef} className="ring-cylinder">
          {RING_PROJECTS.map((proj, idx) => {
            const cardAngle = idx * CARD_STEP;
            const isActive = idx === activeIndex;
            const isFlipped = flippedIndex === idx;

            return (
              <div
                key={proj.slug}
                className={`ring-slot ${isActive ? 'is-active' : 'is-inactive'}`}
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                  '--accent': proj.accent,
                  '--accent-glow': proj.accentGlow,
                }}
                onClick={(e) => handleCardClick(idx, e)}
              >
                <div className={`ring-card-flipper ${isFlipped ? 'is-flipped' : ''}`}>
                  {/* FRONT FACE (Minimal Architectural Poster) */}
                  <div className="ring-card-face ring-card-face--front">
                    <div className="ring-card__accent-bar" />
                    <div className="ring-card__media">
                      <img
                        src={proj.screen}
                        alt={`${proj.title} preview`}
                        className="ring-card__img"
                        loading="lazy"
                        width="380"
                        height="260"
                      />
                    </div>

                    <div className="ring-card__content">
                      <div className="ring-card__top mono">
                        <span className="ring-card__index">{proj.index}</span>
                        <span className="ring-card__category">{proj.category}</span>
                      </div>

                      <h3 className="ring-card__title">{proj.title}</h3>

                      <div className="ring-card__prompt mono">
                        <span>{isActive ? 'CLICK CARD TO INSPECT' : 'CLICK TO BRING FORWARD'}</span>
                        <span className="ring-card__prompt-flip">[FLIP ↗]</span>
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE (Detailed Technical Dossier & Real Verified Links) */}
                  <div className="ring-card-face ring-card-face--back">
                    <div>
                      <div className="ring-card-back__head mono">
                        <span style={{ color: proj.accent, fontWeight: 700 }}>{proj.index} // DETAILS</span>
                        <span className="muted">{proj.category}</span>
                      </div>

                      <h3 className="ring-card-back__title" style={{ marginTop: '0.8rem' }}>
                        {proj.title}
                      </h3>

                      <p className="ring-card-back__summary">{proj.summary}</p>

                      <div className="ring-card-back__tech mono">
                        <strong>STACK:</strong> {proj.tech}
                      </div>
                    </div>

                    <div className="ring-card-back__actions">
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ring-btn ring-btn--live"
                        onClick={(e) => e.stopPropagation()}
                        data-cursor="VISIT"
                      >
                        <span>LIVE DEMO</span>
                        <span aria-hidden="true">↗</span>
                      </a>

                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ring-btn ring-btn--repo"
                        onClick={(e) => e.stopPropagation()}
                        data-cursor="CODE"
                      >
                        <span>GITHUB REPOSITORY</span>
                        <span aria-hidden="true">↗</span>
                      </a>

                      <button
                        type="button"
                        className="ring-btn ring-btn--case"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenCase) onOpenCase(proj.slug);
                        }}
                        data-cursor="CASE"
                      >
                        <span>VIEW FULL CASE STUDY</span>
                        <span aria-hidden="true">→</span>
                      </button>

                      <button
                        type="button"
                        className="ring-btn ring-btn--flip-back mono"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFlippedIndex(null);
                        }}
                      >
                        FLIP TO FRONT [ESC]
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls & Project Dots */}
      <footer className="ring-footer">
        <div className="ring-nav-controls">
          <button
            type="button"
            className="ring-arrow-btn"
            onClick={() => rotateStep(1)}
            aria-label="Previous project"
            data-cursor="PREV"
          >
            ←
          </button>
          <button
            type="button"
            className="ring-arrow-btn"
            onClick={() => rotateStep(-1)}
            aria-label="Next project"
            data-cursor="NEXT"
          >
            →
          </button>
        </div>

        <div className="ring-pips" role="tablist" aria-label="Select project">
          {RING_PROJECTS.map((proj, idx) => (
            <button
              key={proj.slug}
              type="button"
              className={`ring-pip mono ${idx === activeIndex ? 'is-active' : ''}`}
              onClick={() => snapToProject(idx)}
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Jump to ${proj.title}`}
            >
              {proj.index} {proj.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </footer>
    </section>
  );
}
