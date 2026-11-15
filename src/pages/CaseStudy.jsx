import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PROJECTS, PROJECT_BY_SLUG } from '../data/projects';
import { gsap, EASE, prefersReducedMotion } from '../animations/motion';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Magnetic } from '../components/ui/Magnetic';
import '../sections/sections.css';

/**
 * Full Case Study route (/work/:slug).
 * Presents authentic problem framing, verified role, technical implementation,
 * project-specific system architecture, captured deployment screens, and circular next-project routing.
 */
export function CaseStudy({ onOpenCase, onBackHome }) {
  const { slug } = useParams();
  const pageRef = useRef(null);
  const project = PROJECT_BY_SLUG[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (prefersReducedMotion() || !pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-case-reveal]', {
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.06,
        ease: EASE.out,
        clearProps: 'transform,opacity',
      });
    }, pageRef);

    return () => ctx.revert();
  }, [slug]);

  if (!project) {
    return (
      <main id="main-content" className="case" ref={pageRef}>
        <span className="mono muted">404 // CASE NOT FOUND</span>
        <h1 className="display" style={{ fontSize: 'var(--t-xl)', margin: '1.5rem 0' }}>
          PROJECT RECORD UNAVAILABLE.
        </h1>
        <button type="button" className="btn" onClick={() => onBackHome('#scene-work-intro')}>
          <span>RETURN TO EXHIBITION</span>
          <span className="btn__arrow" aria-hidden="true">↗</span>
        </button>
      </main>
    );
  }

  const currentIndex = PROJECTS.findIndex((p) => p.slug === project.slug);
  const nextProject = PROJECTS[(currentIndex + 1) % PROJECTS.length];
  const primaryScreen = project.screens[0];

  return (
    <main id="main-content" className="case" ref={pageRef}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          paddingBottom: '1.6rem',
          borderBottom: '1px solid var(--hair)',
        }}
        data-case-reveal
      >
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onBackHome('#scene-work-intro')}
          data-cursor="BACK"
        >
          <span>← EXHIBITION INDEX</span>
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.4rem', alignItems: 'center' }}>
          <span className="mono" style={{ color: project.accent }}>
            PROJECT {project.index} // {project.category}
          </span>
          <span className="mono muted">{project.year}</span>
        </div>
      </div>

      <header style={{ paddingTop: '2.5rem' }} data-case-reveal>
        <h1 className="display" style={{ fontSize: 'var(--t-xl)', lineHeight: 0.88 }}>
          <SplitHeadline lines={[project.shortTitle]} as="span" />
        </h1>
        <p
          style={{
            marginTop: '1.4rem',
            fontSize: 'var(--t-m)',
            lineHeight: 1.35,
            maxWidth: '48rem',
            color: 'rgba(245, 242, 235, 0.88)',
          }}
        >
          {project.summary}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '1.8rem' }}>
          <Magnetic>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="btn"
              data-cursor="LIVE"
            >
              <span>LAUNCH LIVE PROJECT</span>
              <span className="btn__arrow" aria-hidden="true">↗</span>
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost"
              data-cursor="CODE"
            >
              <span>GITHUB REPOSITORY</span>
              <span className="btn__arrow" aria-hidden="true">↗</span>
            </a>
          </Magnetic>
        </div>
      </header>

      {primaryScreen && (
        <figure className="case__hero-img" data-case-reveal>
          <img src={primaryScreen.src} alt={`${project.title} primary screenshot`} />
        </figure>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
        data-case-reveal
      >
        <figcaption className="mono muted">{primaryScreen?.caption}</figcaption>
        {project.authNote && (
          <span className="mono" style={{ color: project.accent }}>
            NOTE // {project.authNote}
          </span>
        )}
      </div>

      <section className="case__cols" aria-label="Case study technical dossier" data-case-reveal>
        <div>
          <span className="mono muted" style={{ color: project.accent }}>01 // THE PROBLEM</span>
          <p style={{ marginTop: '0.8rem', lineHeight: 1.65 }}>{project.problem}</p>
        </div>

        <div>
          <span className="mono muted" style={{ color: project.accent }}>02 // MY ROLE & OWNERSHIP</span>
          <p style={{ marginTop: '0.8rem', lineHeight: 1.65 }}>{project.role}</p>
        </div>

        <div>
          <span className="mono muted" style={{ color: project.accent }}>03 // IMPLEMENTATION & ARCHITECTURE</span>
          <p style={{ marginTop: '0.8rem', lineHeight: 1.65 }}>{project.implementation}</p>
        </div>

        <div>
          <span className="mono muted" style={{ color: project.accent }}>04 // VERIFIED STACK</span>
          <div className="proj-stack" style={{ marginTop: '0.9rem' }}>
            {project.stack.map((tech) => (
              <span key={tech} className="proj-stack__chip">{tech}</span>
            ))}
          </div>
        </div>

        <div>
          <span className="mono muted" style={{ color: project.accent }}>05 // KEY FEATURES DELIVERED</span>
          <ul style={{ marginTop: '0.9rem', display: 'grid', gap: '0.55rem' }}>
            {project.features.map((feat) => (
              <li
                key={feat}
                style={{
                  paddingLeft: '1.1rem',
                  position: 'relative',
                  color: 'rgba(245, 242, 235, 0.85)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ position: 'absolute', left: 0, color: project.accent }}
                >
                  —
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="mono muted" style={{ color: project.accent }}>06 // WHAT I LEARNED</span>
          <p style={{ marginTop: '0.8rem', lineHeight: 1.65 }}>{project.learned}</p>
        </div>
      </section>

      {project.architectureLayers && (
        <section style={{ marginTop: '3.5rem', borderTop: '1px solid var(--hair)', paddingTop: '2.2rem' }} data-case-reveal>
          <span className="mono muted">VERIFIED REPOSITORY MODULE BREAKDOWN</span>
          <div
            style={{
              marginTop: '1.2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            {project.architectureLayers.map((layer) => (
              <div
                key={layer.id}
                style={{
                  border: '1px solid var(--hair)',
                  background: '#101014',
                  padding: '1.2rem',
                }}
              >
                <div className="mono" style={{ color: project.accent }}>{layer.label}</div>
                <div className="mono muted" style={{ fontSize: '0.62rem', margin: '0.4rem 0 0.65rem' }}>
                  {layer.module}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.48 }}>{layer.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {project.journeySteps && (
        <section style={{ marginTop: '3.5rem', borderTop: '1px solid var(--hair)', paddingTop: '2.2rem' }} data-case-reveal>
          <span className="mono muted">5-STEP CLINICAL INTAKE WORKFLOW</span>
          <div
            style={{
              marginTop: '1.2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '1rem',
            }}
          >
            {project.journeySteps.map((step) => (
              <div
                key={step.step}
                style={{
                  border: '1px solid var(--hair)',
                  background: '#081b1a',
                  padding: '1.1rem',
                }}
              >
                <div className="mono" style={{ color: project.accent }}>
                  {step.step} // {step.title}
                </div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.48, marginTop: '0.55rem' }}>
                  {step.caption}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {project.dossiers && (
        <section style={{ marginTop: '3.5rem', borderTop: '1px solid var(--hair)', paddingTop: '2.2rem' }} data-case-reveal>
          <span className="mono muted">KEYNOTE SPEAKER DOSSIER SYSTEM</span>
          <div
            style={{
              marginTop: '1.2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {project.dossiers.map((dos) => (
              <div
                key={dos.caseId}
                style={{
                  border: '1px solid var(--hair)',
                  background: '#141112',
                  padding: '1.2rem',
                }}
              >
                <div className="mono" style={{ color: project.accent }}>{dos.caseId}</div>
                <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.25rem', marginTop: '0.4rem' }}>
                  {dos.title}
                </h2>
                <p style={{ fontSize: '0.88rem', marginTop: '0.55rem', color: 'rgba(245,242,235,0.78)' }}>
                  {dos.quote}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginTop: '3.5rem', borderTop: '1px solid var(--hair)', paddingTop: '2.2rem' }} data-case-reveal>
        <span className="mono muted">AUTHENTIC DEPLOYMENT SCREENS</span>
        <div className="case__gallery">
          {project.screens.map((screen) => (
            <figure
              key={screen.src}
              style={{
                border: '1px solid var(--hair)',
                background: '#0f0f12',
                overflow: 'hidden',
              }}
            >
              <div style={{ aspectRatio: '16 / 10', overflow: 'hidden', borderBottom: '1px solid var(--hair)' }}>
                <img
                  src={screen.src}
                  alt={screen.caption}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                />
              </div>
              <figcaption className="mono muted" style={{ padding: '0.9rem 1rem', fontSize: '0.68rem' }}>
                {screen.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <footer
        style={{
          marginTop: '4.5rem',
          paddingTop: '2.5rem',
          borderTop: '1px solid var(--hair)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
        }}
        data-case-reveal
      >
        <div>
          <span className="mono muted">NEXT CASE STUDY // {nextProject.index}</span>
          <div className="display" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.8rem)', marginTop: '0.35rem' }}>
            {nextProject.title}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <Magnetic>
            <button
              type="button"
              className="btn"
              onClick={() => onOpenCase(nextProject.slug)}
              data-cursor="NEXT"
            >
              <span>OPEN NEXT PROJECT</span>
              <span className="btn__arrow" aria-hidden="true">↗</span>
            </button>
          </Magnetic>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onBackHome('#scene-contact')}
            data-cursor="CONTACT"
          >
            <span>JUMP TO CONTACT</span>
          </button>
        </div>
      </footer>
    </main>
  );
}

