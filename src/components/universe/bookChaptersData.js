import { PROFILE } from '../../data/profile';
import { PROJECTS } from '../../data/projects';
import { DSA_MODULES } from '../../data/dsa';
import { TECH_CATEGORIES, TECH_NODES } from '../../data/stack';

/**
 * Bottom 5-world dock order matching Reference 01 (`01..05`).
 */
export const CHAPTER_DOCK_ORDER = [
  {
    id: 'archive',
    num: '01',
    name: 'THE ARCHIVE',
    subtitle: 'PROJECTS & DEPLOYED SYSTEMS',
    icon: 'folder',
  },
  {
    id: 'lab',
    num: '02',
    name: 'THE LAB',
    subtitle: 'AI / ML, WEBGL & SYSTEMS STACK',
    icon: 'brain',
  },
  {
    id: 'journey',
    num: '03',
    name: 'THE JOURNEY',
    subtitle: 'DOCUMENTED MILESTONES',
    icon: 'mountain',
  },
  {
    id: 'signal',
    num: '04',
    name: 'THE SIGNAL',
    subtitle: 'VERIFIED CHANNELS & PRESENCE',
    icon: 'signal',
  },
  {
    id: 'frontier',
    num: '05',
    name: 'THE NEXT FRONTIER',
    subtitle: 'ACTIVE EXPLORATION & VECTORS',
    icon: 'planet',
  },
];

export const CHAPTER_BY_ID = Object.fromEntries(
  CHAPTER_DOCK_ORDER.map((c) => [c.id, c])
);

/**
 * Physical book turn sequence specified in Section 5:
 * Starts on THE JOURNEY (matching Reference 01 master),
 * first page turn reveals THE ARCHIVE, followed by LAB -> SIGNAL -> FRONTIER.
 */
export const BOOK_PAGE_SEQUENCE = [
  'journey',
  'archive',
  'lab',
  'signal',
  'frontier',
];

/**
 * Verified markers along the glowing golden mountain pathway inside Chapter 03 (THE JOURNEY).
 * `u` in [0..1] (left spine -> right edge), `v` in [-1..1] (top edge -> bottom edge).
 */
export const JOURNEY_MARKERS = [
  {
    id: 'experiments',
    label: 'EXPERIMENTS',
    u: 0.22,
    v: 0.56,
    mobileU: 0.24,
    mobileV: 0.58,
    period: 'ALGORITHMIC CORE · RAAMBAD-ILAAJ',
    title: 'Data Structures & Systems Experiments',
    org: 'github.com/PRINCE-CODER679/raambad-ilaaj',
    detail:
      'Implemented foundational C and Python structures from scratch: binary search, infix-to-postfix expression stacks, singly linked lists, binary search trees, and BFS/DFS city graph traversals.',
    tags: DSA_MODULES.map((m) => m.name),
    repoUrl: 'https://github.com/PRINCE-CODER679/raambad-ilaaj',
  },
  {
    id: 'projects',
    label: 'PROJECTS',
    u: 0.4,
    v: 0.36,
    mobileU: 0.36,
    mobileV: 0.36,
    period: '2026 · PRODUCTION FULL-STACK & ML BUILDS',
    title: 'Deployed AI & Interactive Web Systems',
    org: `${PROJECTS.length} Live Vercel Deployments`,
    detail:
      'Shipped SpendSense AI (personal finance & anomaly forecasting), SignSense AI (MediaPipe + scikit-learn ASL recognition), MediKiosk (multilingual OPD kiosk), and DEVTALKS ’26.',
    tags: PROJECTS.map((p) => p.title),
  },
  {
    id: 'hackathons',
    label: 'HACKATHONS',
    u: 0.55,
    v: 0.2,
    mobileU: 0.56,
    mobileV: 0.14,
    period: 'SMART INDIA HACKATHON 2026',
    title: 'MediKiosk — High-Volume OPD Clinical Triage',
    org: 'Clinical Workflow · SIH 2026',
    detail:
      'Designed and built an accessible multilingual self-check-in Patient Kiosk (English, हिंदी, मराठी) paired with a Physician Portal featuring red-flag triage alerts and clinician summary verification.',
    tags: ['React', 'FastAPI', 'SQLAlchemy', 'Multilingual Kiosk', 'SIH 2026'],
    slug: 'medikiosk',
  },
  {
    id: 'clubs',
    label: 'CLUBS',
    u: 0.67,
    v: 0.08,
    mobileU: 0.78,
    mobileV: -0.02,
    period: PROFILE.club.period.toUpperCase(),
    title: PROFILE.club.name,
    org: `${PROFILE.club.role} · DevKraft (${PROFILE.eventRole.name})`,
    detail: `${PROFILE.club.summary} Also engineered the interactive mystery-speaker reveal and 3D coverflow dossier experience for ${PROFILE.eventRole.name}.`,
    tags: ['Workshops', 'Bootcamps', 'Hackathons', "DEVTALKS '26"],
    slug: 'devtalks',
  },
  {
    id: 'milestones',
    label: 'MILESTONES',
    u: 0.74,
    v: -0.34,
    mobileU: 0.70,
    mobileV: -0.38,
    period: 'ACADEMIC FOUNDATION · PUNE, INDIA',
    title: 'AI & Data Science Engineering',
    org: PROFILE.institution,
    detail:
      'Pursuing undergraduate engineering in Artificial Intelligence & Data Science in Pune, combining machine learning pipelines, FastAPI services, and Awwwards-grade Three.js / WebGL interfaces.',
    tags: [...PROFILE.roles, PROFILE.location],
  },
];

/**
 * Curated scientific clusters for Chapter 02 (THE LAB), grounded strictly in `stack.js` & `dsa.js`.
 */
export const LAB_SYSTEMS = [
  {
    id: 'ai',
    code: 'SPECIMEN 01',
    title: 'AI / ML & Computer Vision',
    subtitle: 'MediaPipe · scikit-learn · OpenCV · Pandas · NumPy',
    summary:
      '21-landmark 3D hand skeleton extraction normalized into 63 scale-invariant vectors, Random Forest/SVM/KNN inference classifiers, and defensive Pandas bank-statement preprocessing.',
    nodes: TECH_NODES.filter((n) => n.cat === 'ai'),
  },
  {
    id: 'frontend',
    code: 'SPECIMEN 02',
    title: 'WebGL, 3D & Motion Architecture',
    subtitle: 'React · Three.js · GSAP · Tailwind CSS · Vite',
    summary:
      'Hardware-accelerated Three.js / React Three Fiber stages, custom GLSL atmospheric & volumetric shaders, procedural `.glb` rigs, and deterministic GSAP scroll choreography.',
    nodes: TECH_NODES.filter((n) => n.cat === 'frontend'),
  },
  {
    id: 'backend',
    code: 'SPECIMEN 03',
    title: 'Backend APIs & Data Layer',
    subtitle: 'FastAPI · MongoDB · SQL / SQLAlchemy · Pydantic',
    summary:
      'Async Python FastAPI inference & clinical workflow endpoints, Pydantic schema contracts, JWT multi-user isolation with Motor (MongoDB), and SQL persistence.',
    nodes: TECH_NODES.filter((n) => n.cat === 'backend'),
  },
  {
    id: 'dsa',
    code: 'SPECIMEN 04',
    title: 'Core Algorithms (C & Python)',
    subtitle: 'raambad-ilaaj · 5 Verified Modules',
    summary:
      'First-principles C and Python implementations covering Binary Search, Infix→Postfix Stacks, Singly Linked Lists, Binary Search Trees, and BFS/DFS City Graph traversal.',
    nodes: TECH_NODES.filter((n) => n.cat === 'core'),
    modules: DSA_MODULES,
  },
];

export const ARCHIVE_PROJECTS = PROJECTS;
export const SIGNAL_PROFILE = PROFILE;
export const LAB_CATEGORIES = TECH_CATEGORIES;
export const ALL_TECH_NODES = TECH_NODES;

