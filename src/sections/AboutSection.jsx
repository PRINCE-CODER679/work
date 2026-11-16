import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, EASE, SCRUB, prefersReducedMotion } from '../animations/motion';
import { PROFILE } from '../data/profile';
import { IdentitySculpture3D } from '../components/about/IdentitySculpture3D';
import './identity.css';

const ENTRANCE_WORDS = ['THE', 'HUMAN', 'BEHIND', 'THE', 'CODE.'];

const MANIFESTO_WORDS = [
  { text: "I'm", accent: false },
  { text: 'Asrar', accent: true },
  { text: 'Mulla—an', accent: false },
  { text: 'AI', accent: true },
  { text: '&', accent: true },
  { text: 'Data', accent: true },
  { text: 'Science', accent: true },
  { text: 'student', accent: false },
  { text: 'in', accent: false },
  { text: 'Pune', accent: false },
  { text: 'turning', accent: false },
  { text: 'machine', accent: false },
  { text: 'learning', accent: false },
  { text: 'pipelines,', accent: false },
  { text: 'FastAPI', accent: true },
  { text: 'architectures,', accent: false },
  { text: 'and', accent: false },
  { text: 'real-time', accent: false },
  { text: '3D', accent: true },
  { text: 'WebGL', accent: true },
  { text: 'into', accent: false },
  { text: 'living', accent: false },
  { text: 'digital', accent: false },
  { text: 'products.', accent: false },
];

export const IDENTITY_CHAPTERS = [
  {
    index: '01',
    title: 'AI & DATA SCIENCE',
    kicker: 'INTELLIGENT PIPELINES & APPLIED ML',
    accent: '#A855F7',
    narrative:
      'Pursuing AI & Data Science at Dr. D. Y. Patil Institute of Technology, Pimpri, Pune and contributing as a Technical Member of the DSAII Club (2026 — Present). Engineering origin- and scale-invariant 21-landmark 3D hand tracking with MediaPipe & scikit-learn (SignSense AI) alongside automated CSV/XLSX spending categorization, anomaly alerts, and monthly forecasting (SpendSense AI).',
    metrics: [
      { label: 'INSTITUTION', value: PROFILE.institution },
      { label: 'INITIATIVE', value: `${PROFILE.club.role} · ${PROFILE.club.name}` },
    ],
    tags: ['MediaPipe 3D Vision', 'scikit-learn', 'Pandas & NumPy', 'Anomaly Detection'],
  },
  {
    index: '02',
    title: 'SOFTWARE DEVELOPMENT',
    kicker: 'FULL-STACK & CLINICAL SYSTEMS ARCHITECTURE',
    accent: '#536BFF',
    narrative:
      'Architecting resilient full-stack applications that pair typed FastAPI REST services, Pydantic contracts, and async MongoDB / SQLAlchemy persistence with responsive React + Vite interfaces—including MediKiosk for Smart India Hackathon 2026, bridging multilingual (English, हिंदी, मराठी) patient self-check-in kiosks with physician red-flag triage portals, grounded in C and Python data structures (raambad-ilaaj).',
    metrics: [
      { label: 'BACKEND CORE', value: 'FastAPI · Pydantic · MongoDB (Motor) · SQLAlchemy' },
      { label: 'ALGORITHMIC BASE', value: 'C & Python DSA (PRINCE-CODER679/raambad-ilaaj)' },
    ],
    tags: ['FastAPI', 'React & Vite', 'MongoDB & SQL', 'SIH 2026 MediKiosk'],
  },
  {
    index: '03',
    title: 'CREATIVE ENGINEERING',
    kicker: 'WEBGL, SHADERS & KINETIC STORYTELLING',
    accent: '#FF5924',
    narrative:
      "Where systems engineering meets cinema-grade art direction. Crafting custom Three.js 3D stages, GLSL shaders, GSAP ScrollTrigger choreography, and tactile interactive installations—including the 3D coverflow mystery-speaker dossier ring and community prediction platform built for DevKraft's flagship event DEVTALKS '26.",
    metrics: [
      { label: 'FEATURED INSTALLATION', value: PROFILE.eventRole.name },
      { label: 'GRAPHICS STACK', value: 'Three.js · React Three Fiber · Custom GLSL · GSAP' },
    ],
    tags: ['Three.js & WebGL', 'Custom GLSL Shaders', 'GSAP Choreography', "DEVTALKS '26"],
  },
  {
    index: '04',
    title: "BUILDING WHAT'S NEXT",
    kicker: 'FROM ALGORITHMS TO LIVING EXPERIENCES',
    accent: '#C084FC',
    narrative:
      'Focused on closing the gap between raw technical capability and human experience—turning complex workflows across personal finance, sign language accessibility, outpatient clinical intake, and interactive 3D web architecture into fast, expressive tools people genuinely enjoy using.',
    metrics: [
      { label: 'BASE COORDINATES', value: PROFILE.location },
      { label: 'OPEN SOURCE', value: `github.com/${PROFILE.handle}` },
    ],
    tags: ['AI Products', 'Machine Learning', 'Creative Frontend', 'Full-Stack Systems'],
  },
];

/**
 * SCENE 02 — IDENTITY ("THE HUMAN BEHIND THE CODE.")
 * Four-part scroll-driven personal introduction:
 * 1) Cinematic Entrance ("THE HUMAN BEHIND THE CODE." word-by-word reveal)
 * 2) Interactive 3D Identity Sculpture (metallic core + frosted glass + orbital rings)
 * 3) Paced 4-Chapter Scroll Story (01 AI & Data Science -> 04 Building What's Next)
 * 4) Final Identity Reveal ("I DON'T JUST WRITE CODE. I BUILD EXPERIENCES.")
 */
export function AboutSection() {
  const sectionRef = useRef(null);
  const entranceRef = useRef(null);
  const wordsWrapRef = useRef(null);
  const storyStageRef = useRef(null);
  const storyPinRef = useRef(null);
  const finaleRef = useRef(null);
  const orbitArcRef = useRef(null);

  const sculptureProgressRef = useRef(0);
  const activeChapterRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const entranceWords = el.querySelectorAll('[data-id-entrance-word]');
      const manifestoWords = el.querySelectorAll('[data-manifesto-word]');
      const finaleLines = el.querySelectorAll('[data-id-finale-line]');

      if (reduced) {
        gsap.set([entranceWords, manifestoWords, finaleLines], {
          yPercent: 0,
          opacity: 1,
          clearProps: 'all',
        });
        return;
      }

      // EXPERIENCE 1: Word-by-word entrance reveal for "THE HUMAN BEHIND THE CODE."
      let entranceDone = false;
      const revealEntrance = () => {
        if (entranceDone || !entranceWords.length) return;
        entranceDone = true;
        gsap.to(entranceWords, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: EASE.type,
          clearProps: 'transform,opacity',
        });
      };

      if (entranceWords.length && entranceRef.current) {
        gsap.set(entranceWords, { yPercent: 108, opacity: 0.001 });
        ScrollTrigger.create({
          trigger: entranceRef.current,
          start: 'top 92%',
          onEnter: revealEntrance,
          onEnterBack: revealEntrance,
        });
        const io1 = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              revealEntrance();
              io1.disconnect();
            }
          },
          { threshold: 0.02, rootMargin: '80px 0px' }
        );
        io1.observe(entranceRef.current);
      }

      // Progressive word illumination on the editorial manifesto
      if (manifestoWords.length && wordsWrapRef.current) {
        gsap.to(manifestoWords, {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: wordsWrapRef.current,
            start: 'top 92%',
            end: 'bottom 45%',
            scrub: SCRUB.type,
          },
        });
      }

      // EXPERIENCE 2 & 3: Scroll-driven progression across the 4 Identity Chapters
      if (storyStageRef.current) {
        ScrollTrigger.create({
          trigger: storyStageRef.current,
          start: 'top 65%',
          end: 'bottom 35%',
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            sculptureProgressRef.current = p;

            if (orbitArcRef.current) {
              const offset = 628 * (1 - p);
              orbitArcRef.current.style.strokeDashoffset = String(offset);
            }

            const idx = Math.min(3, Math.max(0, Math.floor(p * 4)));
            if (idx !== activeChapterRef.current) {
              activeChapterRef.current = idx;
              setActiveChapter(idx);
            }
          },
        });
      }

      // EXPERIENCE 4: Final Identity Statement ("I DON'T JUST WRITE CODE. I BUILD EXPERIENCES.")
      let finaleDone = false;
      const revealFinale = () => {
        if (finaleDone || !finaleLines.length) return;
        finaleDone = true;
        gsap.to(finaleLines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.14,
          ease: EASE.type,
          clearProps: 'transform,opacity',
        });
      };

      if (finaleLines.length && finaleRef.current) {
        gsap.set(finaleLines, { yPercent: 105, opacity: 0.001 });
        ScrollTrigger.create({
          trigger: finaleRef.current,
          start: 'top 92%',
          onEnter: revealFinale,
          onEnterBack: revealFinale,
        });
        const io2 = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              revealFinale();
              io2.disconnect();
            }
          },
          { threshold: 0.02, rootMargin: '80px 0px' }
        );
        io2.observe(finaleRef.current);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const currentChapter = IDENTITY_CHAPTERS[activeChapter] || IDENTITY_CHAPTERS[0];

  const handleSelectChapter = (idx) => {
    activeChapterRef.current = idx;
    sculptureProgressRef.current = idx / 3;
    setActiveChapter(idx);
  };

  return (
    <section
      id="scene-about"
      ref={sectionRef}
      className="about id-section section"
      style={{ '--id-accent': currentChapter.accent }}
      aria-label="Identity — The Human Behind The Code"
    >
      {/* Subtle Background Orbital Telemetry Lines */}
      <svg
        className="id-section__bg-orbits"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <ellipse
          cx="720"
          cy="450"
          rx="620"
          ry="210"
          transform="rotate(-11 720 450)"
          stroke="rgba(168, 85, 247, 0.14)"
          strokeWidth="1.2"
        />
        <ellipse
          cx="720"
          cy="450"
          rx="480"
          ry="150"
          transform="rotate(9 720 450)"
          stroke="rgba(83, 107, 255, 0.12)"
          strokeWidth="1"
          strokeDasharray="6 8"
        />
      </svg>

      {/* =====================================================================
          EXPERIENCE 1 — CINEMATIC ENTRANCE ("THE HUMAN BEHIND THE CODE.")
          ===================================================================== */}
      <div ref={entranceRef} className="id-entrance">
        <div className="id-entrance__top mono">
          <div className="section-index">
            <span>01 // IDENTITY</span>
          </div>
          <div className="id-entrance__coords">
            <span>{PROFILE.location.toUpperCase()}</span>
            <span className="id-entrance__sep">·</span>
            <span>@{PROFILE.handle}</span>
          </div>
        </div>

        <h2 className="display id-entrance__headline" aria-label="The Human Behind The Code.">
          <span className="id-entrance__row">
            {ENTRANCE_WORDS.slice(0, 2).map((w, i) => (
              <span key={i} className="id-word-mask">
                <span data-id-entrance-word="" className="id-word-inner">
                  {w}
                </span>
              </span>
            ))}
          </span>
          <span className="id-entrance__row id-entrance__row--accent">
            {ENTRANCE_WORDS.slice(2).map((w, i) => (
              <span key={i} className="id-word-mask">
                <span data-id-entrance-word="" className="id-word-inner">
                  {w}
                </span>
              </span>
            ))}
          </span>
        </h2>

        <div className="id-entrance__manifesto-grid">
          <p ref={wordsWrapRef} className="id-entrance__manifesto">
            {MANIFESTO_WORDS.map((w, i) => (
              <span
                key={i}
                data-manifesto-word=""
                className={`id-manifesto-word ${w.accent ? 'is-accent' : ''}`}
              >
                {w.text}
              </span>
            ))}
          </p>

          <div className="id-entrance__credentials mono">
            <div className="id-credential">
              <span className="id-credential__label">INSTITUTION</span>
              <span className="id-credential__val">{PROFILE.institution}</span>
            </div>
            <div className="id-credential">
              <span className="id-credential__label">COMMUNITY LEADERSHIP</span>
              <span className="id-credential__val">
                {PROFILE.club.role} · {PROFILE.club.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          EXPERIENCE 2 & 3 — INTERACTIVE 3D IDENTITY SCULPTURE & SCROLL STORY
          ===================================================================== */}
      <div ref={storyStageRef} className="id-story">
        <div ref={storyPinRef} className="id-story__sticky">
          {/* Left Column: 4 Identity Chapter Index & Progress */}
          <nav className="id-story__nav" aria-label="Four Facets of Asrar's Identity">
            <div className="mono id-story__nav-label">IDENTITY SPECTRUM // 01 — 04</div>
            {IDENTITY_CHAPTERS.map((chap, idx) => {
              const isActive = idx === activeChapter;
              return (
                <button
                  key={chap.index}
                  type="button"
                  className={`id-chapter-tab ${isActive ? 'is-active' : ''}`}
                  style={{ '--chap-color': chap.accent }}
                  onClick={() => handleSelectChapter(idx)}
                >
                  <span className="id-chapter-tab__idx mono">{chap.index}</span>
                  <span className="id-chapter-tab__text">
                    <span className="id-chapter-tab__title">{chap.title}</span>
                    <span className="id-chapter-tab__kicker mono">{chap.kicker}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Center Column: Interactive 3D Identity Sculpture & SVG Progress Orbit */}
          <div className="id-story__centerpiece">
            <svg className="id-story__orbit-svg" viewBox="0 0 240 240" aria-hidden="true">
              <circle
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke="rgba(245, 242, 235, 0.08)"
                strokeWidth="1"
              />
              <circle
                ref={orbitArcRef}
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke={currentChapter.accent}
                strokeWidth="1.75"
                strokeDasharray="628"
                strokeDashoffset="471"
                strokeLinecap="round"
                transform="rotate(-90 120 120)"
              />
            </svg>

            <IdentitySculpture3D
              progressRef={sculptureProgressRef}
              activeChapter={activeChapter}
            />

            <div className="id-story__core-badge mono" aria-hidden="true">
              <span>FACET {currentChapter.index} / 04</span>
              <span>·</span>
              <span>{currentChapter.title}</span>
            </div>
          </div>

          {/* Right Column: Synchronized Active Chapter Dossier Panel */}
          <article
            key={currentChapter.index}
            className="id-story__dossier"
            aria-live="polite"
          >
            <div className="id-story__dossier-head mono">
              <span className="id-story__dossier-idx" style={{ color: currentChapter.accent }}>
                {currentChapter.index} — {currentChapter.kicker}
              </span>
            </div>

            <h3 className="display id-story__dossier-title">{currentChapter.title}</h3>

            <p className="id-story__dossier-body">{currentChapter.narrative}</p>

            <div className="id-story__metrics">
              {currentChapter.metrics.map((m) => (
                <div key={m.label} className="id-story__metric">
                  <span className="mono id-story__metric-label">{m.label}</span>
                  <span className="id-story__metric-val">{m.value}</span>
                </div>
              ))}
            </div>

            <div className="id-story__tags">
              {currentChapter.tags.map((tag) => (
                <span key={tag} className="id-story__tag mono">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>

      {/* =====================================================================
          EXPERIENCE 4 — THE FINAL IDENTITY REVEAL
          ("I DON'T JUST WRITE CODE. I BUILD EXPERIENCES.")
          ===================================================================== */}
      <div ref={finaleRef} className="id-finale">
        <div className="id-finale__orbit-line" aria-hidden="true" />
        <div className="mono id-finale__kicker">PHILOSOPHY // ASRAR MULLA</div>

        <h3
          className="display id-finale__statement"
          aria-label="I don't just write code. I build experiences."
        >
          <span className="id-finale__mask">
            <span data-id-finale-line="" className="id-finale__line">
              I DON&apos;T JUST WRITE CODE.
            </span>
          </span>
          <span className="id-finale__mask">
            <span
              data-id-finale-line=""
              className="id-finale__line id-finale__line--metallic"
            >
              I BUILD EXPERIENCES.
            </span>
          </span>
        </h3>
      </div>
    </section>
  );
}
