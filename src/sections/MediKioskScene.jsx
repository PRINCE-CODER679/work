import { useState } from 'react';
import { PROJECT_BY_SLUG } from '../data/projects';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Magnetic } from '../components/ui/Magnetic';
import './sections.css';

const GREETINGS = {
  en: { label: 'English', prompt: '"Please describe your symptoms before seeing the doctor."' },
  hi: { label: 'हिंदी', prompt: '"कृपया डॉक्टर से मिलने से पहले अपने लक्षण बताएं।"' },
  mr: { label: 'मराठी', prompt: '"कृपया डॉक्टरांना भेटण्यापूर्वी आपली लक्षणे सांगा."' },
};

/**
 * SCENE 06 — PROJECT 03: MEDIKIOSK
 * Scoped clinical information environment (#06201F / #2FD3C4) showcasing
 * the 5-step patient intake journey, multilingual kiosk preview, and physician portal captures.
 */
export function MediKioskScene({ onOpenCase }) {
  const project = PROJECT_BY_SLUG.medikiosk;
  const [stepIdx, setStepIdx] = useState(0);
  const [lang, setLang] = useState('en');

  const activeStep = project.journeySteps[stepIdx];

  return (
    <article
      id="scene-medikiosk"
      className="proj-scene medi-scene section"
      aria-label="Project 03: MediKiosk"
    >
      <div className="proj-scene__head">
        <div className="proj-scene__title-col">
          <div className="mono section-index" style={{ color: 'var(--clinic)' }}>
            <span>06 / PROJECT 03 — {project.category}</span>
          </div>
          <h3 className="display proj-scene__title">
            <SplitHeadline lines={['MEDI', 'KIOSK.']} as="span" />
          </h3>
        </div>

        <div className="proj-scene__summary-col">
          <p>{project.summary}</p>
          <div className="proj-stack">
            {project.stack.map((tech) => (
              <span key={tech} className="proj-stack__chip" style={{ borderColor: 'rgba(47,211,196,0.32)' }}>
                {tech}
              </span>
            ))}
          </div>
          <div className="proj-scene__actions">
            <Magnetic>
              <button type="button" className="btn" onClick={() => onOpenCase(project.slug)} data-cursor="OPEN">
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

      <div className="medi-stage">
        <div className="medi-stepper" role="tablist" aria-label="MediKiosk 5-step patient journey">
          <div className="mono" style={{ color: 'var(--clinic)', marginBottom: '0.35rem' }}>
            CLINICAL PATIENT JOURNEY · 01 → 05
          </div>
          {project.journeySteps.map((st, idx) => (
            <button
              key={st.step}
              type="button"
              role="tab"
              aria-selected={stepIdx === idx}
              className={`medi-step ${stepIdx === idx ? 'is-active' : ''}`}
              onClick={() => setStepIdx(idx)}
              data-cursor="STEP"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ color: 'var(--clinic)' }}>
                  {st.step} // {st.title}
                </span>
                <span className="mono muted">{stepIdx === idx ? 'ACTIVE' : 'VIEW'}</span>
              </div>
              <p style={{ marginTop: '0.35rem', fontSize: '0.88rem', color: 'rgba(245,242,235,0.8)' }}>
                {st.caption}
              </p>
            </button>
          ))}
        </div>

        <div className="medi-viewport">
          <div className="medi-viewport__bar">
            <div>
              <div className="mono" style={{ color: 'var(--clinic)' }}>
                SURFACE PREVIEW · STEP {activeStep.step} ({activeStep.title})
              </div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{GREETINGS[lang].prompt}</div>
            </div>

            <div className="medi-langs" role="group" aria-label="Kiosk language toggle">
              {Object.entries(GREETINGS).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  className={`medi-lang ${lang === k ? 'is-active' : ''}`}
                  onClick={() => setLang(k)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <figure className="medi-viewport__img">
            <img src={activeStep.screen} alt={`MediKiosk ${activeStep.title}: ${activeStep.caption}`} loading="lazy" />
          </figure>
        </div>
      </div>
    </article>
  );
}

