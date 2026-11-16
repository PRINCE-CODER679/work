import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../animations/motion';
import { TECH_NODES } from '../data/stack';
import { PROJECT_BY_SLUG } from '../data/projects';
import { ToolboxScene3D } from '../components/toolbox/ToolboxScene3D';
import './toolbox.css';

// Ordered categories matching Panel 01, 02, and 03 reference sequence
const ORDERED_CATEGORIES = [
  { id: 'frontend', num: '01', label: 'FRONTEND & 3D', tag: 'Frontend' },
  { id: 'backend', num: '02', label: 'BACKEND & DB', tag: 'Backend' },
  { id: 'ai', num: '03', label: 'AI / ML / DATA', tag: 'AI / ML' },
  { id: 'core', num: '04', label: 'LANGUAGES & TOOLS', tag: 'Core' },
];

// Curated verified roles & reference copy per verified stack node
const NODE_DETAILS = {
  python: {
    badge: '// Core',
    description:
      'My primary language for building AI models, data pipelines, and backend services.',
    roles: [
      'AI / ML model development',
      'Data processing & analysis',
      'Backend APIs (FastAPI)',
      'Automation and scripting',
    ],
  },
  react: {
    badge: '// Frontend',
    description:
      'Declarative UI architecture powering all 4 deployed clinical, fintech, CV, and event web applications.',
    roles: [
      'Interactive stateful UIs & SPAs',
      'Kiosk & Physician portals (MediKiosk)',
      'Real-time telemetry dashboards',
      'Three.js & R3F component orchestration',
    ],
  },
  fastapi: {
    badge: '// Backend',
    description:
      'High-speed async Python REST APIs serving ML inference, clinical triage, and personal finance telemetry.',
    roles: [
      'RESTful inference endpoints',
      'Pydantic schema & payload validation',
      'JWT auth & multi-user isolation',
      'Async database integration (Motor)',
    ],
  },
  three: {
    badge: '// 3D & WebGL',
    description:
      'Real-time WebGL stages, custom GLSL shaders, optical lighting chambers, and kinetic 3D objects.',
    roles: [
      'Cinematic 3D hero & portfolio rig',
      'Custom GLSL shader & glass materials',
      'CoverFlow 3D dossier ring (DEVTALKS)',
      'Interactive particle & spatial scenes',
    ],
  },
  sklearn: {
    badge: '// AI / ML',
    description:
      'Supervised ASL fingerspelling classifiers benchmarked across Random Forest (120 trees), SVM, KNN & Logistic Regression.',
    roles: [
      '63-feature ASL hand classification',
      'Cross-model accuracy benchmarking',
      'Scikit-learn inference pipelines',
      'Feature normalization & preprocessing',
    ],
  },
  mediapipe: {
    badge: '// Vision',
    description:
      'Real-time 21-landmark 3D hand skeleton extraction running directly in browser WASM for SignSense AI.',
    roles: [
      '21-point 3D hand landmark tracking',
      'Origin- & scale-invariant normalization',
      'Low-latency browser camera inference',
      'Interactive ASL gesture feedback',
    ],
  },
  mongodb: {
    badge: '// Database',
    description:
      'Async Motor document persistence backing isolated user workspaces and transaction histories in SpendSense AI.',
    roles: [
      'Multi-user financial telemetry store',
      'Async CRUD pipelines with Motor',
      'Transaction indexing & aggregations',
      'Budget & anomaly state persistence',
    ],
  },
  pandas: {
    badge: '// Data',
    description:
      'Tabular cleaning, transformation, and normalization across inconsistent CSV/XLSX financial statements.',
    roles: [
      'CSV/XLSX bank export ingestion',
      'Defensive schema normalization',
      'Monthly category aggregation',
      'ML training feature structuring',
    ],
  },
  numpy: {
    badge: '// Numerical',
    description:
      'Vectorized Euclidean scaling, matrix transforms, and anomaly statistics across CV and FinTech pipelines.',
    roles: [
      'Wrist-centered coordinate scaling',
      'Fast array math for anomaly bounds',
      'Feature vector preparation',
      'Trend projection calculations',
    ],
  },
  opencv: {
    badge: '// Vision',
    description:
      'Webcam frame decoding, color-space alignment, and dataset validation supporting ASL vision workflows.',
    roles: [
      'Frame preprocessing & validation',
      'Landmark pipeline calibration',
      'Sample image capture workflows',
      'Vision testing utilities',
    ],
  },
  gsap: {
    badge: '// Motion',
    description:
      'Deterministic timeline choreography, scroll-scrubbed camera arcs, and masked typography reveals.',
    roles: [
      'Synchronized multi-stage timelines',
      'ScrollTrigger section choreography',
      'Precision UI state transitions',
      'High-FPS GPU property animation',
    ],
  },
  tailwind: {
    badge: '// Styling',
    description:
      'Utility styling system structuring high-contrast clinical kiosks, financial analytics, and dark-stage UIs.',
    roles: [
      'Accessible clinical kiosk design',
      'Responsive dashboard layouts',
      'Dark editorial theme tokens',
      'Rapid component iteration',
    ],
  },
  vite: {
    badge: '// Build',
    description:
      'Modern ESM bundling and asset optimization pipeline powering production deployments across Vercel.',
    roles: [
      'Instant HMR development builds',
      'Chunk splitting for R3F & GSAP',
      'Optimized font & GLB delivery',
      'Production Vercel build output',
    ],
  },
  sql: {
    badge: '// Database',
    description:
      'Relational clinical encounter schemas and Pydantic/SQLAlchemy models designed for MediKiosk OPD workflows.',
    roles: [
      'Patient & ABHA relational schemas',
      'Triage alert & vitals records',
      'Clinician review state tracking',
      'Structured SQLAlchemy ORM layer',
    ],
  },
  cpp: {
    badge: '// Core DSA',
    description:
      'Foundational data structures and algorithms implemented in C & C++ from academic coursework (raambad-ilaaj).',
    roles: [
      'Binary search & sorting traces',
      'Linked lists, stacks & infix/postfix',
      'Binary search trees & traversals',
      'BFS/DFS graph exploration',
    ],
  },
  js: {
    badge: '// Language',
    description:
      'Core client-side engineering driving interactive WebGL canvases, DOM orchestration, and async APIs.',
    roles: [
      'Interactive React & WebGL apps',
      'Web Audio & Canvas procedural FX',
      'REST API client integration',
      'Custom motion & DOM hooks',
    ],
  },
  git: {
    badge: '// Workflow',
    description:
      'Multi-repository engineering workflow across SpendSense, SignSense, MediKiosk, DEVTALKS, and portfolio builds.',
    roles: [
      'Clean branch & release hygiene',
      'Multi-repo CI/CD triggers',
      'Open-source portfolio codebases',
      'Collaborative team development',
    ],
  },
  vercel: {
    badge: '// Deploy',
    description:
      'Edge production deployments and serverless API endpoints (including DEVTALKS prediction submissions).',
    roles: [
      'Production live app hosting',
      'Serverless /api/ endpoints',
      'Automatic GitHub previews',
      'Edge asset & WebGL caching',
    ],
  },
};

function CategoryIcon({ id }) {
  if (id === 'frontend') {
    return (
      <svg viewBox="0 0 24 24" className="tb-cat__svg" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (id === 'backend') {
    return (
      <svg viewBox="0 0 24 24" className="tb-cat__svg" aria-hidden="true">
        <rect x="4" y="4" width="16" height="4.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="10" width="16" height="4.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="16" width="16" height="4.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7" cy="6.25" r="0.8" fill="currentColor" />
        <circle cx="7" cy="12.25" r="0.8" fill="currentColor" />
        <circle cx="7" cy="18.25" r="0.8" fill="currentColor" />
      </svg>
    );
  }
  if (id === 'ai') {
    return (
      <svg viewBox="0 0 24 24" className="tb-cat__svg" aria-hidden="true">
        <path
          d="M9.5 4.5C7 4.5 5 6.3 5 8.6c0 1 .35 1.9 1 2.6-.7.8-1 1.7-1 2.8 0 2.3 1.9 4.2 4.3 4.2h1.2V4.5h-1zM14.5 4.5c2.5 0 4.5 1.8 4.5 4.1 0 1-.35 1.9-1 2.6.7.8 1 1.7 1 2.8 0 2.3-1.9 4.2-4.3 4.2h-1.2V4.5h1z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line x1="12" y1="4.5" x2="12" y2="18.2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="tb-cat__svg" aria-hidden="true">
      <polygon points="12,3 20,7.5 12,12 4,7.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points="4,7.5 4,16.5 12,21 20,16.5 20,7.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * SCENE 08 — THE TOOLBOX
 * 3-State Physical 3D Toolbox Reconstruction (`Closed` -> `Opening Animation` -> `Opened Interactive`)
 * powered by React Three Fiber, Drei, custom GLB asset, GLSL chamber lighting, and GSAP timeline choreography.
 */
export function TechUniverseSection({ onOpenCase }) {
  const [phase, setPhase] = useState('closed'); // 'closed' | 'opening' | 'opened' | 'closing'
  const [unlockStep, setUnlockStep] = useState(0); // 0..3 checklist progress during State 02
  const [activeCat, setActiveCat] = useState('ai'); // Matches Panel 01/02/03 default `03 AI / ML / DATA`
  const [selectedId, setSelectedId] = useState('python'); // Matches Panel 03 default `PYTHON` hero cube

  const timelineRef = useRef(null);
  const animStateRef = useRef({
    vibration: 0,
    latchOpen: 0,
    ledBoost: 0,
    lidLift: 0,
    chamberBeam: 0,
    tilesEmerge: 0,
    orbitalReveal: 0,
    cameraShift: 0,
  });

  const categoryCounts = useMemo(() => {
    const map = {};
    for (const c of ORDERED_CATEGORIES) {
      map[c.id] = TECH_NODES.filter((n) => n.cat === c.id).length;
    }
    return map;
  }, []);

  const selected = useMemo(
    () => TECH_NODES.find((n) => n.id === selectedId) || TECH_NODES[0],
    [selectedId]
  );

  const selectedMeta = useMemo(() => {
    const custom = NODE_DETAILS[selected.id];
    if (custom) return custom;
    const catInfo = ORDERED_CATEGORIES.find((c) => c.id === selected.cat);
    return {
      badge: `// ${catInfo ? catInfo.tag : 'Stack'}`,
      description: selected.note,
      roles: ['Production system architecture', 'Verified portfolio deployment'],
    };
  }, [selected]);

  // Helper exposed for deterministic visual validation & QA inspection at exact state snapshots
  const jumpToSnapshot = useCallback((targetState) => {
    if (timelineRef.current) timelineRef.current.kill();
    const s = animStateRef.current;

    if (targetState === 'closed') {
      Object.assign(s, {
        vibration: 0,
        latchOpen: 0,
        ledBoost: 0,
        lidLift: 0,
        chamberBeam: 0,
        tilesEmerge: 0,
        orbitalReveal: 0,
        cameraShift: 0,
      });
      setUnlockStep(0);
      setPhase('closed');
    } else if (targetState === 'opening') {
      Object.assign(s, {
        vibration: 0,
        latchOpen: 1,
        ledBoost: 1,
        lidLift: 0.44,
        chamberBeam: 1,
        tilesEmerge: 0,
        orbitalReveal: 0,
        cameraShift: 0.16,
      });
      setUnlockStep(2);
      setPhase('opening');
    } else if (targetState === 'opened') {
      Object.assign(s, {
        vibration: 0,
        latchOpen: 1,
        ledBoost: 0.65,
        lidLift: 1,
        chamberBeam: 0.62,
        tilesEmerge: 1,
        orbitalReveal: 1,
        cameraShift: 1,
      });
      setUnlockStep(3);
      setPhase('opened');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__asrarToolbox = { setState: jumpToSnapshot };
    }
    return () => {
      if (timelineRef.current) timelineRef.current.kill();
      if (typeof window !== 'undefined') delete window.__asrarToolbox;
    };
  }, [jumpToSnapshot]);

  // Deterministic 3.30-second Opening Animation Choreography (Rule 3)
  const triggerUnlock = useCallback(() => {
    if (phase !== 'closed') return;
    if (timelineRef.current) timelineRef.current.kill();

    if (prefersReducedMotion()) {
      jumpToSnapshot('opened');
      return;
    }

    const s = animStateRef.current;
    setPhase('opening');
    setUnlockStep(0);

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('opened');
      },
    });
    timelineRef.current = tl;

    // 0.00 - 0.35s: Orange light intensifies, mechanical latches unlock, subtle physical vibration
    tl.to(s, { ledBoost: 1, vibration: 1, duration: 0.16, ease: 'power2.out' }, 0)
      .to(s, { latchOpen: 1, duration: 0.32, ease: 'back.out(1.4)' }, 0.02)
      .to(s, { vibration: 0, duration: 0.2, ease: 'power2.inOut' }, 0.16)
      .add(() => setUnlockStep(1), 0.35);

    // 0.35 - 1.30s: Lid rises preserving orientation, intense volumetric chamber beam erupts
    tl.to(s, { lidLift: 0.44, duration: 0.95, ease: 'power2.inOut' }, 0.35)
      .to(s, { cameraShift: 0.16, duration: 0.95, ease: 'power2.inOut' }, 0.35)
      .to(s, { chamberBeam: 1, duration: 0.72, ease: 'power2.out' }, 0.42)
      .add(() => setUnlockStep(2), 1.3);

    // 1.30 - 2.20s: Lid finishes canopy ascent, camera adjusts, tech tiles + Hero Python cube emerge smoothly
    tl.to(s, { lidLift: 1, duration: 0.9, ease: 'power3.out' }, 1.3)
      .to(s, { cameraShift: 1, duration: 1.05, ease: 'power2.inOut' }, 1.3)
      .to(s, { tilesEmerge: 0.78, duration: 0.9, ease: 'power2.out' }, 1.3)
      .add(() => setUnlockStep(3), 2.2);

    // 2.20 - 3.30s: Tiles settle deterministically, orbital wireframe ring reveals, lighting stabilizes
    tl.to(s, { tilesEmerge: 1, duration: 1.05, ease: 'power3.out' }, 2.2)
      .to(s, { orbitalReveal: 1, duration: 0.9, ease: 'power3.out' }, 2.25)
      .to(s, { chamberBeam: 0.62, ledBoost: 0.65, duration: 0.9, ease: 'power2.inOut' }, 2.3);
  }, [phase, jumpToSnapshot]);

  // Smooth Close Interaction returning every component deterministically to State 01
  const triggerClose = useCallback(() => {
    if (phase !== 'opened') return;
    if (timelineRef.current) timelineRef.current.kill();

    if (prefersReducedMotion()) {
      jumpToSnapshot('closed');
      return;
    }

    const s = animStateRef.current;
    setPhase('closing');

    const tl = gsap.timeline({
      onComplete: () => {
        setUnlockStep(0);
        setPhase('closed');
      },
    });
    timelineRef.current = tl;

    tl.to(s, { orbitalReveal: 0, tilesEmerge: 0, duration: 0.65, ease: 'power2.in' }, 0)
      .to(s, { cameraShift: 0, duration: 0.9, ease: 'power2.inOut' }, 0.25)
      .to(s, { lidLift: 0, chamberBeam: 0, duration: 0.85, ease: 'power2.inOut' }, 0.35)
      .to(s, { latchOpen: 0, ledBoost: 0, duration: 0.32, ease: 'power2.out' }, 1.15);
  }, [phase, jumpToSnapshot]);

  // Selecting a category highlights matching nodes in 3D and promotes its lead tech into focus when opened
  const handleSelectCategory = (catId) => {
    const nextCat = activeCat === catId && phase === 'opened' ? 'all' : catId;
    setActiveCat(nextCat);

    if (nextCat !== 'all') {
      const currentInCat = selected.cat === nextCat;
      if (!currentInCat) {
        const firstInCat = TECH_NODES.find((n) => n.cat === nextCat);
        if (firstInCat) setSelectedId(firstInCat.id);
      }
    }
  };

  // Nodes displayed in quick mobile/keyboard strip inside Opened state
  const visibleNodesList = useMemo(() => {
    if (activeCat === 'all') return TECH_NODES;
    return TECH_NODES.filter((n) => n.cat === activeCat);
  }, [activeCat]);

  return (
    <section
      id="scene-toolbox"
      className={`tb-section tb-section--${phase}`}
      aria-label="Scene 08: The Toolbox"
    >
      {/* Subtle architectural corner dot textures */}
      <div className="tb-bg-dots" aria-hidden="true" />

      {/* Full-Bleed Real Interactive 3D Stage */}
      <ToolboxScene3D
        animRef={animStateRef}
        phase={phase}
        selectedId={selected.id}
        activeCat={activeCat}
        onSelectNode={(id) => setSelectedId(id)}
        onUnlockClick={triggerUnlock}
      />

      {/* OVERLAY HUD GRID matching exact reference proportions */}
      <div className="tb-hud">
        {/* LEFT COLUMN: Title + Subtitle + 4 Vertical Category Selectors */}
        <div className="tb-left-col">
          <div className="tb-eyebrow mono">/ TOOLBOX</div>

          <h2 className="tb-heading display">
            <span>THE</span>
            <span>TOOLBOX.</span>
          </h2>

          <p className="tb-subtitle mono">
            THE SYSTEMS, TOOLS AND TECHNOLOGIES THAT POWER MY WORK.
          </p>

          <div className="tb-categories" role="tablist" aria-label="Technology categories">
            {ORDERED_CATEGORIES.map((c) => {
              const isSelected = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`tb-cat ${isSelected ? 'is-active' : ''}`}
                  onClick={() => handleSelectCategory(c.id)}
                  data-cursor="FILTER"
                >
                  <span className="tb-cat__icon">
                    <CategoryIcon id={c.id} />
                  </span>
                  <span className="tb-cat__row mono">
                    <span className="tb-cat__num">{c.num}</span>
                    <span className="tb-cat__label">{c.label}</span>
                    <span className="tb-cat__count">({categoryCounts[c.id]})</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER TOP INTERACTIVE PROMPT (Visible exclusively in State 01 — Closed) */}
        {phase === 'closed' && (
          <div className="tb-unlock-center">
            <svg className="tb-unlock-rings-svg" viewBox="0 0 200 200" aria-hidden="true">
              <circle
                cx="100"
                cy="100"
                r="42"
                fill="none"
                stroke="rgba(255, 138, 36, 0.2)"
                strokeWidth="0.9"
              />
              <circle
                cx="100"
                cy="100"
                r="68"
                fill="none"
                stroke="rgba(255, 138, 36, 0.12)"
                strokeWidth="0.85"
              />
              <circle
                cx="100"
                cy="100"
                r="94"
                fill="none"
                stroke="rgba(245, 242, 235, 0.07)"
                strokeWidth="0.8"
              />
            </svg>
            <button
              type="button"
              className="tb-unlock-btn mono"
              onClick={triggerUnlock}
              data-cursor="UNLOCK"
            >
              <span className="tb-unlock-btn__tl" aria-hidden="true" />
              <span className="tb-unlock-btn__tr" aria-hidden="true" />
              <span className="tb-unlock-btn__bl" aria-hidden="true" />
              <span className="tb-unlock-btn__br" aria-hidden="true" />
              <span>CLICK TO UNLOCK MY STACK</span>
              <svg className="tb-unlock-pointer" viewBox="0 0 24 28" aria-hidden="true">
                <path
                  d="M4 2 L19 15 L12.5 16.2 L16.2 24.4 L13.4 25.8 L9.7 17.6 L4.5 21.8 Z"
                  fill="rgba(14, 12, 10, 0.85)"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* RIGHT CHAMFERED INFORMATION PANEL (Adapts dynamically across States 01 / 02 / 03) */}
        <aside className="tb-right-wrap" aria-live="polite">
          <div className="tb-right-card">
            {/* Chamfered Octagonal SVG Frame Matching Reference Border Style */}
            <svg
              className="tb-right-frame"
              viewBox="0 0 320 420"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon
                points="22,1 319,1 319,398 298,419 1,419 1,22"
                fill="rgba(10, 10, 13, 0.78)"
                stroke="rgba(245, 242, 235, 0.22)"
                strokeWidth="1.1"
              />
              {/* Warm amber corner bevel accent lines */}
              <polyline
                points="2,54 2,22 22,2 64,2"
                fill="none"
                stroke="#ff8a24"
                strokeWidth="1.5"
                opacity="0.82"
              />
              <polyline
                points="318,366 318,398 298,418 256,418"
                fill="none"
                stroke="#ff8a24"
                strokeWidth="1.5"
                opacity="0.82"
              />
            </svg>

            {/* STATE 01 PANEL: TOOLBOX LOCKED */}
            {phase === 'closed' && (
              <div className="tb-panel-state tb-panel-locked">
                <button
                  type="button"
                  className="tb-padlock-btn"
                  onClick={triggerUnlock}
                  aria-label="Unlock toolbox to explore technologies"
                  data-cursor="UNLOCK"
                >
                  <svg viewBox="0 0 48 56" className="tb-padlock-svg" aria-hidden="true">
                    <path
                      d="M14 23V16a10 10 0 0 1 20 0v7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <rect
                      x="8"
                      y="23"
                      width="32"
                      height="26"
                      rx="3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    />
                  </svg>
                </button>
                <div className="tb-panel-locked__title mono">TOOLBOX LOCKED</div>
                <p className="tb-panel-locked__desc">
                  Click to open and explore the technologies, frameworks, and tools behind my projects.
                </p>
              </div>
            )}

            {/* STATE 02 PANEL: UNLOCKING STACK... */}
            {(phase === 'opening' || phase === 'closing') && (
              <div className="tb-panel-state tb-panel-loading">
                <div className="tb-loader-ring" aria-hidden="true">
                  <svg viewBox="0 0 56 56" className="tb-loader-svg">
                    <circle
                      cx="28"
                      cy="28"
                      r="20"
                      fill="none"
                      stroke="rgba(255, 138, 36, 0.2)"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 28 8 A 20 20 0 1 1 10 36"
                      fill="none"
                      stroke="#ff8a24"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="tb-panel-loading__title mono">
                  {phase === 'closing' ? 'LOCKING STACK...' : 'UNLOCKING STACK...'}
                </div>
                <div className="tb-panel-loading__rule" aria-hidden="true" />
                <ul className="tb-checklist">
                  <li className={unlockStep >= 1 ? 'is-done' : ''}>
                    <span className="tb-check-mark">✓</span>
                    <span>Releasing Modules</span>
                  </li>
                  <li className={unlockStep >= 2 ? 'is-done' : ''}>
                    <span className="tb-check-mark">✓</span>
                    <span>Loading Technologies</span>
                  </li>
                  <li className={unlockStep >= 3 ? 'is-done' : ''}>
                    <span className="tb-check-mark">✓</span>
                    <span>Preparing Systems</span>
                  </li>
                </ul>
              </div>
            )}

            {/* STATE 03 PANEL: SELECTED NODE DETAIL */}
            {phase === 'opened' && (
              <div className="tb-panel-state tb-panel-detail">
                <div className="tb-detail__top">
                  <span className="mono tb-detail__kicker">SELECTED NODE</span>
                  <button
                    type="button"
                    className="tb-close-btn mono"
                    onClick={triggerClose}
                    aria-label="Close toolbox"
                    data-cursor="CLOSE"
                  >
                    CLOSE ×
                  </button>
                </div>

                <div className="tb-detail__title-row">
                  <h3 className="tb-detail__title">{selected.name.toUpperCase()}</h3>
                  <span className="tb-detail__badge mono">{selectedMeta.badge}</span>
                </div>

                <p className="tb-detail__desc">{selectedMeta.description}</p>

                <div className="tb-detail__section">
                  <div className="tb-detail__subhead mono">
                    <span className="tb-mini-ico" aria-hidden="true">▤</span>
                    <span>USED IN</span>
                  </div>

                  {selected.projects.length === 0 ? (
                    <span className="tb-proj-pill is-static">raambad-ilaaj · Core Algorithms</span>
                  ) : (
                    <div className="tb-detail__pills">
                      {selected.projects.map((slug) => {
                        const p = PROJECT_BY_SLUG[slug];
                        if (!p) return null;
                        return (
                          <button
                            key={slug}
                            type="button"
                            className="tb-proj-pill"
                            onClick={() => onOpenCase(slug)}
                            data-cursor="CASE"
                          >
                            {p.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="tb-detail__section">
                  <div className="tb-detail__subhead mono">
                    <span className="tb-mini-ico" aria-hidden="true">〰</span>
                    <span>ROLE</span>
                  </div>
                  <ul className="tb-detail__roles">
                    {selectedMeta.roles.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Bottom Accessible Tech Selector Strip (State 03 only, aids mobile & keyboard focus) */}
        {phase === 'opened' && (
          <div className="tb-quick-bar" aria-label="Select stack technology">
            {visibleNodesList.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`tb-quick-chip mono ${selected.id === n.id ? 'is-active' : ''}`}
                onClick={() => setSelectedId(n.id)}
              >
                {n.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
