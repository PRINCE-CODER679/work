import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animations/motion';
import { PROFILE } from '../data/profile';
import { IdentityParticlesCanvas } from '../components/about/IdentityParticlesCanvas';
import './identity.css';

/**
 * Verified 4 Identity Facets preserving approved copy & interactive portfolio context.
 */
const IDENTITY_FACETS = [
  {
    id: 'ai-ds',
    index: '01',
    shortLabel: 'AI & DS',
    title: 'AI & DATA SCIENCE',
    tags: 'MODELS · DATA · INTELLIGENCE',
    haloAngle: -16,
    detail:
      'B.E. AI & Data Science (DY Patil, Pune) · SignSense AI 21-landmark 3D vision & SpendSense AI forecasting.',
  },
  {
    id: 'software',
    index: '02',
    shortLabel: 'DEVELOPMENT',
    title: 'SOFTWARE DEVELOPMENT',
    tags: 'FULL-STACK · PRODUCTS · SYSTEMS',
    haloAngle: 28,
    detail:
      'React, FastAPI, Python, Node.js, MongoDB & SQL · MediKiosk multilingual triage kiosk & live doctor queue.',
  },
  {
    id: 'creative',
    index: '03',
    shortLabel: 'CREATIVE',
    title: 'CREATIVE ENGINEERING',
    tags: 'WEBGL · 3D · INTERACTIVE WEB',
    haloAngle: 72,
    detail:
      "Three.js, WebGL shaders & GSAP choreography · Built DEVTALKS '26 mystery-speaker reveal for DevKraft.",
  },
  {
    id: 'builder',
    index: '04',
    shortLabel: 'BUILDER',
    title: "BUILDING WHAT'S NEXT",
    tags: 'IDEAS · EXPERIMENTS · REAL IMPACT',
    haloAngle: 118,
    detail:
      `Technical Member, DSAII Club (${PROFILE.club.period}) · Prototyping AI products in ${PROFILE.location}.`,
  },
];

function FacetIcon({ id }) {
  if (id === 'ai-ds') {
    return (
      <svg viewBox="0 0 40 40" className="id-facet__icon-svg" aria-hidden="true">
        <polygon points="20,6 27,10 20,14 13,10" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
        <polyline points="13,10 13,18 20,22 27,18 27,10" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
        <line x1="20" y1="14" x2="20" y2="22" stroke="currentColor" strokeWidth="1.35" />
        <polygon points="13,18 20,22 13,26 6,22" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
        <polyline points="6,22 6,30 13,34 20,30 20,22" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
        <line x1="13" y1="26" x2="13" y2="34" stroke="currentColor" strokeWidth="1.35" />
        <polygon points="27,18 34,22 27,26 20,22" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
        <polyline points="20,22 20,30 27,34 34,30 34,22" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
        <line x1="27" y1="26" x2="27" y2="34" stroke="currentColor" strokeWidth="1.35" />
      </svg>
    );
  }
  if (id === 'software') {
    return (
      <svg viewBox="0 0 40 40" className="id-facet__icon-svg" aria-hidden="true">
        <polyline points="14,13 7,20 14,27" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="26,13 33,20 26,27" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="22.5" y1="11" x2="17.5" y2="29" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'creative') {
    return (
      <svg viewBox="0 0 40 40" className="id-facet__icon-svg" aria-hidden="true">
        <path d="M 7 14 Q 13.5 9, 20 14 T 33 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 7 20 Q 13.5 15, 20 20 T 33 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 7 26 Q 13.5 21, 20 26 T 33 26" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className="id-facet__icon-svg" aria-hidden="true">
      <circle cx="20" cy="20" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse
        cx="20"
        cy="20"
        rx="14.5"
        ry="5.2"
        transform="rotate(-28 20 20)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="29.5" cy="12.5" r="1.35" fill="currentColor" />
    </svg>
  );
}

/**
 * SCENE 02 — IDENTITY ("THE HUMAN BEHIND THE CODE.")
 * Faithful composition preserving the approved purple portrait artwork on the left,
 * separated interactive HTML/CSS/SVG left-module index, Bodoni Moda editorial heading,
 * intro copy, 2x2 corner-bracketed cards, and extracted bottom-right wireframe terrain.
 */
export function AboutSection() {
  const sectionRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [inView, setInView] = useState(true);

  const activeFacet = IDENTITY_FACETS[activeIdx] || IDENTITY_FACETS[0];

  const selectFacet = (idx, isUserInteraction = true) => {
    setActiveIdx(idx);
    if (isUserInteraction) setInteracted(true);
  };

  // Pause particle drift off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '180px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Subtle restrained cursor atmospheric glow (portrait itself never moves or distorts)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return undefined;

    let rafId = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      tx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1));
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty('--id-px', cx.toFixed(4));
      el.style.setProperty('--id-py', cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.003 || Math.abs(ty - cy) > 0.003) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll-triggered soft entrance
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const artwork = el.querySelector('.id-artwork-desktop');
      const mobileArt = el.querySelector('.id-artwork-mobile');
      const headingLines = el.querySelectorAll('.id-heading__line-inner');
      const introBlock = el.querySelector('.id-editorial__intro');
      const facetCards = el.querySelectorAll('.id-facet');

      const playEntrance = () => {
        if (el.dataset.entered === '1') return;
        el.dataset.entered = '1';

        const tl = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } });

        if (artwork) {
          tl.fromTo(artwork, { opacity: 0.25 }, { opacity: 1, duration: 1.15 }, 0);
        }
        if (mobileArt) {
          tl.fromTo(mobileArt, { opacity: 0.25 }, { opacity: 1, duration: 1.05 }, 0);
        }
        if (headingLines.length) {
          tl.fromTo(
            headingLines,
            { yPercent: 100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.09 },
            0.12
          );
        }
        if (introBlock) {
          tl.fromTo(introBlock, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.72 }, 0.34);
        }
        if (facetCards.length) {
          tl.fromTo(
            facetCards,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.62, stagger: 0.075 },
            0.4
          );
        }
      };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: playEntrance,
        onEnterBack: playEntrance,
      });

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        playEntrance();
      }

      // Continuous scrubbed depth glide linking Hero -> Identity -> Selected Work
      const mm = gsap.matchMedia();
      mm.add('(min-width: 769px)', () => {
        const editorialCol = el.querySelector('.id-editorial-col');
        const hudRail = el.querySelector('.id-hud-rail');
        const terrain = el.querySelector('.id-terrain-wrap');

        if (artwork) {
          gsap.fromTo(
            artwork,
            { y: 42 },
            {
              y: -26,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.75,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        const uiTargets = [editorialCol, hudRail].filter(Boolean);
        if (uiTargets.length) {
          gsap.fromTo(
            uiTargets,
            { y: 28 },
            {
              y: -18,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        if (terrain) {
          gsap.fromTo(
            terrain,
            { x: -24, opacity: 0.65 },
            {
              x: 18,
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });

      mm.add('(max-width: 768px)', () => {
        if (mobileArt) {
          gsap.fromTo(
            mobileArt,
            { y: 18 },
            {
              y: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
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

  return (
    <section
      id="scene-about"
      ref={sectionRef}
      className="id-section section"
      aria-label="Identity: The Human Behind The Code"
      style={{ '--id-halo-rot': `${activeFacet.haloAngle}deg` }}
    >
      {/* Subtle dark atmospheric gradient & fine dot/grid texture */}
      <div className="id-bg-grid" aria-hidden="true" />
      <div className="id-bg-atmosphere" aria-hidden="true" />

      {/* Centered 16:9 / full-bleed stage container preserving exact visual composition */}
      <div className="id-stage">
        {/* DESKTOP LEFT ARTWORK LAYER: Extracted high-fidelity approved portrait + purple halo + silk ribbons + smoke */}
        <div className="id-artwork-desktop">
          <picture>
            <source
              srcSet="/assets/about/asrar-identity-artwork.png 1x, /assets/about/asrar-identity-artwork-2x.png 2x"
              type="image/png"
            />
            <img
              src="/assets/about/asrar-identity-artwork-2x.png"
              alt="Asrar Mulla — cinematic monochrome and violet editorial portrait"
              width="524"
              height="576"
              loading="eager"
              decoding="async"
              className="id-artwork-img"
            />
          </picture>

          {/* Subtle interactive halo indicator gliding on facet selection */}
          <svg className="id-halo-pulse-svg" viewBox="0 0 524 576" aria-hidden="true">
            <g className={`id-halo-pulse-rotator ${interacted ? 'is-visible' : ''}`}>
              <circle cx="285" cy="24" r="3" fill="#f3e8ff" opacity="0.88" />
              <circle cx="285" cy="24" r="7.5" fill="none" stroke="rgba(216, 180, 254, 0.52)" strokeWidth="0.9" />
            </g>
          </svg>
        </div>

        {/* Sparse gently drifting luminous particles outside face area */}
        <IdentityParticlesCanvas inView={inView} />

        {/* BOTTOM-RIGHT PURPLE WIREFRAME LANDSCAPE EXTRACTED CLEANLY */}
        <div className="id-terrain-wrap" aria-hidden="true">
          <picture>
            <source
              srcSet="/assets/about/id-terrain.png 1x, /assets/about/id-terrain-2x.png 2x"
              type="image/png"
            />
            <img
              src="/assets/about/id-terrain-2x.png"
              alt=""
              width="480"
              height="118"
              loading="eager"
              decoding="async"
              className="id-terrain-img"
            />
          </picture>
        </div>

        {/* FAR-LEFT UNDERSTATED HUD INDEX RAIL ("IDENTITY MODULE") */}
        <aside className="id-hud-rail mono" aria-label="Identity module index">
          <div className="id-hud-rail__title">
            <span>IDENTITY</span>
            <span>MODULE</span>
            <span className="id-hud-rail__dash" aria-hidden="true" />
          </div>

          <ul className="id-hud-rail__list">
            {IDENTITY_FACETS.map((facet, idx) => {
              const isActive = idx === activeIdx;
              return (
                <li key={facet.id}>
                  <button
                    type="button"
                    className={`id-hud-rail__btn mono ${isActive ? 'is-active' : ''}`}
                    onMouseEnter={() => selectFacet(idx, true)}
                    onFocus={() => selectFacet(idx, true)}
                    onClick={() => selectFacet(idx, true)}
                  >
                    <span>[{facet.index}] {facet.shortLabel}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* MOBILE / TABLET DEDICATED PORTRAIT CROP (hidden on desktop) */}
        <div className="id-artwork-mobile">
          <picture>
            <source
              srcSet="/assets/about/asrar-identity-mobile.png 1x, /assets/about/asrar-identity-mobile-2x.png 2x"
              type="image/png"
            />
            <img
              src="/assets/about/asrar-identity-mobile-2x.png"
              alt="Asrar Mulla — monochrome and violet editorial portrait"
              width="488"
              height="552"
              loading="eager"
              decoding="async"
              className="id-artwork-mobile-img"
            />
          </picture>
        </div>

        {/* RIGHT PORTION: Editorial Heading + Paragraph + 2x2 Interactive Modules */}
        <div className="id-editorial-col">
          {/* Small top label: IDENTITY / 01 + hairline */}
          <div className="id-editorial__eyebrow mono">
            <span>IDENTITY / {activeFacet.index}</span>
            <span className="id-editorial__eyebrow-line" aria-hidden="true" />
          </div>

          {/* Large Editorial Serif Headline + Exact Paragraph alongside CODE. */}
          <div className="id-editorial__hero">
            <h2 className="id-heading" aria-label="The Human Behind The Code.">
              <span className="id-heading__line-mask">
                <span className="id-heading__line-inner">THE HUMAN</span>
              </span>
              <span className="id-heading__line-mask">
                <span className="id-heading__line-inner">BEHIND THE</span>
              </span>
            </h2>

            <div className="id-heading__code-row">
              <div className="id-heading__code-wrap" aria-hidden="true">
                <span className="id-heading__line-mask">
                  <span className="id-heading__line-inner id-heading__code">CODE.</span>
                </span>
              </div>

              <p className="id-editorial__intro">
                An AI &amp; Data Science student, developer and creative engineer who loves turning
                ideas into real, impactful products.
              </p>
            </div>
          </div>

          {/* Four Identity Modules in 2x2 Arrangement matching Reference */}
          <div className="id-facets-grid" role="tablist" aria-label="Asrar Mulla identity modules">
            {IDENTITY_FACETS.map((facet, idx) => {
              const isSelected = idx === activeIdx;
              return (
                <button
                  key={facet.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`id-facet ${isSelected ? 'is-active' : ''}`}
                  onMouseEnter={() => selectFacet(idx, true)}
                  onFocus={() => selectFacet(idx, true)}
                  onClick={() => selectFacet(idx, true)}
                  data-cursor="MODULE"
                >
                  <span className="id-facet__corner id-facet__corner--tl" aria-hidden="true" />
                  <span className="id-facet__corner id-facet__corner--tr" aria-hidden="true" />
                  <span className="id-facet__corner id-facet__corner--bl" aria-hidden="true" />
                  <span className="id-facet__corner id-facet__corner--br" aria-hidden="true" />

                  <div className="id-facet__icon">
                    <FacetIcon id={facet.id} />
                  </div>

                  <div className="id-facet__body">
                    <div className="id-facet__title mono">{facet.title}</div>
                    <div className="id-facet__tags mono">{facet.tags}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Subtle verified detail caption revealed smoothly upon facet interaction */}
          <p className={`id-facet-detail mono ${interacted ? 'is-visible' : ''}`} aria-live="polite">
            <span className="id-facet-detail__pip" aria-hidden="true" />
            <span>{activeFacet.detail}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
