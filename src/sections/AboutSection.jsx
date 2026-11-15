import { useEffect, useRef } from 'react';
import { gsap, SCRUB, prefersReducedMotion } from '../animations/motion';
import { PROFILE } from '../data/profile';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import './sections.css';

const STATEMENT = [
  { text: "I'm", accent: false },
  { text: 'an', accent: false },
  { text: 'AI', accent: true },
  { text: '&', accent: true },
  { text: 'Data', accent: true },
  { text: 'Science', accent: true },
  { text: 'student', accent: false },
  { text: 'turning', accent: false },
  { text: 'algorithms,', accent: false },
  { text: 'FastAPI', accent: true },
  { text: 'pipelines,', accent: false },
  { text: 'and', accent: false },
  { text: 'real-time', accent: false },
  { text: 'WebGL', accent: true },
  { text: 'interfaces', accent: false },
  { text: 'into', accent: false },
  { text: 'products', accent: false },
  { text: 'people', accent: false },
  { text: 'can', accent: false },
  { text: 'actually', accent: false },
  { text: 'use.', accent: false },
];

const DISCIPLINES = [
  'AI & Data Science',
  'Software Development',
  'Machine Learning',
  'Creative Development',
  'Problem Solving',
];

/**
 * SCENE 02 — ABOUT / IDENTITY (#F3F0E8 Light Polarity)
 * Progressive scroll-scrubbed word manifestation + editorial facts & orbital diagram.
 */
export function AboutSection() {
  const sectionRef = useRef(null);
  const wordsWrapRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    const wrap = wordsWrapRef.current;
    if (!el || !wrap) return;

    const words = wrap.querySelectorAll('[data-manifesto-word]');
    if (prefersReducedMotion()) {
      gsap.set(words, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(words, {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top 86%',
          end: 'top 34%',
          scrub: SCRUB.type,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="scene-about"
      ref={sectionRef}
      className="about section"
      aria-label="About Asrar Mulla"
    >
      <div className="about__grid">
        <div className="about__head">
          <div className="mono section-index" style={{ marginBottom: '1.2rem' }}>
            <span>IDENTITY</span>
          </div>
          <h2 className="display about__display">
            <SplitHeadline lines={['CURIOUS', 'BY NATURE.']} as="span" />
            <SplitHeadline
              lines={['BUILDER', 'BY CHOICE.']}
              as="span"
              className="about__display--offset"
            />
          </h2>
        </div>

        <p ref={wordsWrapRef} className="about__manifesto">
          {STATEMENT.map((w, i) => (
            <span
              key={i}
              data-manifesto-word=""
              className={`about__word ${w.accent ? 'is-accent' : ''}`}
            >
              {w.text}
            </span>
          ))}
        </p>

        <aside className="about__aside">
          <svg
            className="about__orbital"
            viewBox="0 0 140 140"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="70" cy="70" r="62" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="3 4" />
            <circle cx="70" cy="70" r="40" stroke="currentColor" strokeOpacity="0.55" />
            <line x1="8" y1="70" x2="132" y2="70" stroke="currentColor" strokeOpacity="0.25" />
            <line x1="70" y1="8" x2="70" y2="132" stroke="currentColor" strokeOpacity="0.25" />
            <circle cx="110" cy="70" r="5" fill="#FF5924" />
            <circle cx="70" cy="30" r="4" fill="#536BFF" />
          </svg>

          <div className="about__facts">
            <div className="about__fact">
              <div className="mono" style={{ color: 'var(--muted-dark)' }}>INSTITUTE</div>
              <div>{PROFILE.institution}</div>
            </div>
            <div className="about__fact">
              <div className="mono" style={{ color: 'var(--muted-dark)' }}>COMMUNITY</div>
              <div>{PROFILE.club.role} · {PROFILE.club.name}</div>
            </div>
            <div className="about__fact">
              <div className="mono" style={{ color: 'var(--muted-dark)' }}>BASE</div>
              <div>{PROFILE.location}</div>
            </div>
          </div>

          <div className="about__tags">
            {DISCIPLINES.map((tag) => (
              <span key={tag} className="about__tag">
                {tag}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

