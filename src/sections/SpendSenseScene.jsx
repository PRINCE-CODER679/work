import { useEffect, useRef, useState } from 'react';
import { PROJECT_BY_SLUG } from '../data/projects';
import { gsap, SCRUB, isTouch, prefersReducedMotion } from '../animations/motion';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Magnetic } from '../components/ui/Magnetic';
import './sections.css';

/**
 * SCENE 04 — PROJECT 01: SPENDSENSE AI
 * Dimensional 3D telemetry installation with separated architecture layers
 * and authentic captured deployment screens.
 */
export function SpendSenseScene({ onOpenCase }) {
  const project = PROJECT_BY_SLUG.spendsense;
  const [activeLayer, setActiveLayer] = useState(0);
  const [screenIdx, setScreenIdx] = useState(0);
  const sectionRef = useRef(null);
  const consoleRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        consoleRef.current,
        { rotateX: 12, rotateY: -8, y: 50, opacity: 0.3 },
        {
          rotateX: 2,
          rotateY: 0,
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'top 25%',
            scrub: SCRUB.type,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMove = (e) => {
    if (isTouch() || prefersReducedMotion() || !consoleRef.current) return;
    const r = consoleRef.current.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
    consoleRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const handleLeave = () => {
    if (consoleRef.current) {
      consoleRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
  };

  const currentLayer = project.architectureLayers[activeLayer];

  return (
    <article
      id="scene-spendsense"
      ref={sectionRef}
      className="proj-scene section"
      style={{ background: '#080808' }}
      aria-label="Project 01: SpendSense AI"
    >
      <div className="proj-scene__head">
        <div className="proj-scene__title-col">
          <div className="mono section-index" style={{ color: 'var(--cobalt)' }}>
            <span>04 / PROJECT 01 — {project.category}</span>
          </div>
          <h3 className="display proj-scene__title">
            <SplitHeadline lines={['SPEND', 'SENSE AI.']} as="span" />
          </h3>
        </div>

        <div className="proj-scene__summary-col">
          <p>{project.summary}</p>
          <div className="proj-stack">
            {project.stack.map((tech) => (
              <span key={tech} className="proj-stack__chip">{tech}</span>
            ))}
          </div>
          <div className="proj-scene__actions">
            <Magnetic>
              <button
                type="button"
                className="btn"
                onClick={() => onOpenCase(project.slug)}
                data-cursor="OPEN"
              >
                <span>CASE STUDY</span>
                <span className="btn__arrow" aria-hidden="true">↗</span>
              </button>
            </Magnetic>
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn btn--ghost" data-cursor="LIVE">
              <span>VIEW LIVE PROJECT</span>
            </a>
            <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn btn--ghost" data-cursor="CODE">
              <span>VIEW SOURCE</span>
            </a>
          </div>
        </div>
      </div>

      <div className="spend-stage">
        <div
          ref={consoleRef}
          className="spend-console"
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          data-cursor="INSPECT"
        >
          <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem', color: 'var(--muted)' }}>
            <span>TELEMETRY RIG // {project.screens[screenIdx].caption.slice(0, 42)}...</span>
            <button
              type="button"
              className="ulink"
              style={{ color: 'var(--cobalt)' }}
              onClick={() => setScreenIdx((i) => (i + 1) % project.screens.length)}
            >
              SWITCH SCREEN ({screenIdx + 1}/{project.screens.length})
            </button>
          </div>

          <figure className="spend-console__frame">
            <img
              src={project.screens[screenIdx].src}
              alt={project.screens[screenIdx].caption}
              loading="lazy"
            />
          </figure>

          <div className="spend-console__float">
            <div className="mono" style={{ color: 'var(--cobalt)', marginBottom: '0.35rem' }}>
              {currentLayer.label}
            </div>
            <div className="mono muted" style={{ fontSize: '0.62rem', marginBottom: '0.45rem' }}>
              {currentLayer.module}
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.4 }}>{currentLayer.detail}</p>
          </div>
        </div>

        <div className="spend-layers" role="tablist" aria-label="SpendSense architecture layers">
          <div className="mono muted" style={{ marginBottom: '0.4rem' }}>
            SEPARATED PIPELINE LAYERS · CLICK TO INSPECT
          </div>
          {project.architectureLayers.map((layer, idx) => (
            <button
              key={layer.id}
              type="button"
              role="tab"
              aria-selected={activeLayer === idx}
              className={`spend-layer ${activeLayer === idx ? 'is-active' : ''}`}
              onClick={() => setActiveLayer(idx)}
              data-cursor="LAYER"
            >
              <div className="mono" style={{ color: activeLayer === idx ? 'var(--cobalt)' : 'var(--paper)' }}>
                {layer.label}
              </div>
              <div className="mono muted" style={{ fontSize: '0.64rem', marginTop: '0.25rem' }}>
                {layer.module}
              </div>
            </button>
          ))}
          <p className="mono muted" style={{ marginTop: '0.5rem', fontSize: '0.64rem' }}>
            NOTE: {project.authNote}
          </p>
        </div>
      </div>
    </article>
  );
}

