/**
 * Verified case studies for Asrar Mulla's 4 flagship projects.
 * Screenshots are real captures from the live Vercel deployments stored in /public/assets/projects/.
 */
export const PROJECTS = [
  {
    slug: 'spendsense',
    index: '01',
    title: 'SpendSense AI',
    shortTitle: 'SPENDSENSE',
    year: '2026',
    category: 'AI & FinTech',
    accent: '#536BFF',
    liveUrl: 'https://spendsense-psi-two.vercel.app/',
    repoUrl: 'https://github.com/PRINCE-CODER679/spendsense',
    summary:
      'An AI-powered personal finance platform where users log expenses or upload CSV/XLSX bank statements for automated categorization, anomaly alerts, budget tracking, and monthly spending forecasting.',
    problem:
      'Raw bank statements and ad-hoc expense notes rarely show where money actually leaks each month. Manually tagging transactions across spreadsheets breaks down quickly, leaving users without clear forecasting or early budget warnings.',
    role:
      'Full-Stack & AI Pipeline Developer — built the React/Vite dashboard, FastAPI REST backend, statement ingestion pipeline, categorization engine, forecasting logic, and MongoDB multi-user isolation.',
    stack: ['React', 'Vite', 'Tailwind CSS', 'Recharts', 'Python', 'FastAPI', 'Pandas', 'NumPy', 'MongoDB', 'Motor'],
    implementation:
      'Built an async FastAPI backend backed by Motor (MongoDB) with Pydantic validation and JWT multi-user isolation. Statement uploads run through a Pandas/NumPy cleaning processor before rule-based categorization, anomaly detection, and monthly trend projections surface on Recharts views.',
    features: [
      'Authenticated multi-user workspace with isolated transaction histories',
      'CSV and XLSX bank statement upload, cleaning, and preview pipeline',
      'Rule-based automated expense categorization and budget tracking',
      'Unusual spending anomaly detection and monthly spending forecasts',
      'Optional LLM-powered financial assistant for contextual insights',
    ],
    learned:
      'Handling inconsistent real-world bank statement schemas taught me defensive Pandas preprocessing, clean API schema contracts with Pydantic, and structuring async database queries for responsive dashboard charts.',
    architectureLayers: [
      {
        id: 'ingest',
        label: '01 / Statement Ingestion',
        module: 'statement_processor.py · UploadDropzone',
        detail: 'Parses raw CSV/XLSX bank exports, normalizes date/amount columns, and validates preview rows before persistence.',
      },
      {
        id: 'categorize',
        label: '02 / Rule Categorizer',
        module: 'categorizer.py · TransactionService',
        detail: 'Classifies transactions across spending categories and aggregates daily, monthly, and category distributions.',
      },
      {
        id: 'forecast',
        label: '03 / Forecast & Anomalies',
        module: 'forecast_service.py · anomaly_service.py',
        detail: 'Computes category spend projections and flags out-of-pattern transactions via anomaly thresholds.',
      },
      {
        id: 'insights',
        label: '04 / AI Financial Assistant',
        module: 'insights_service.py · Assistant.jsx',
        detail: 'Synthesizes structured user spending summaries with optional LLM conversational guidance.',
      },
    ],
    screens: [
      {
        src: '/assets/projects/spendsense-01.webp',
        caption: 'Live deployment entry — authenticated sign-in gate protecting personal financial telemetry.',
      },
      {
        src: '/assets/projects/spendsense-r1.webp',
        caption: 'Account registration flow connecting users to isolated MongoDB financial workspaces.',
      },
    ],
    authNote: 'Live deployment gates analytics behind user login; dashboard modules above reflect the verified GitHub repository.',
  },
  {
    slug: 'signsense',
    index: '02',
    title: 'SignSense AI',
    shortTitle: 'SIGNSENSE',
    year: '2026',
    category: 'Computer Vision & ML',
    accent: '#FF5924',
    liveUrl: 'https://sign-sense-blush.vercel.app/',
    repoUrl: 'https://github.com/PRINCE-CODER679/SignSense',
    summary:
      'Real-time American Sign Language (ASL) alphabet and fingerspelling recognition system combining MediaPipe 21-point 3D hand tracking with scikit-learn classification and interactive practice mode.',
    problem:
      'Learning and testing ASL fingerspelling without immediate feedback is slow, and naive pixel-based classifiers break whenever camera distance, lighting, or hand position shifts.',
    role:
      'ML Pipeline & Frontend Engineer — engineered the 21-landmark normalization pipeline, benchmarked Random Forest / SVM / KNN / Logistic Regression classifiers, built the FastAPI inference API, and created the interactive React practice UI.',
    stack: ['React', 'Vite', 'MediaPipe', 'OpenCV', 'Python', 'FastAPI', 'scikit-learn', 'NumPy', 'Pandas'],
    implementation:
      'Webcam frames via getUserMedia() pass through MediaPipe Hands Vision WASM to extract 21 3D coordinates (x, y, z). Coordinates translate to wrist landmark #0 and divide by maximum Euclidean distance—producing 63 origin- and scale-invariant features classified across Random Forest (120 trees), SVM, KNN, or Logistic Regression.',
    features: [
      '21-landmark 3D hand skeleton extraction via browser MediaPipe Vision WASM',
      'Origin- and scale-invariant 63-feature vector normalization pipeline',
      'Selectable inference engines: deterministic client geometry + FastAPI ML classifiers',
      'Interactive ASL flashcard Practice Mode with live word-builder buffer',
      '6-stage interactive Pipeline Architecture explainer inside the web app',
    ],
    learned:
      'Transforming raw 3D coordinates into wrist-centered normalized feature vectors eliminated hand-size and framing variance far better than raw pixel approaches—and keeping client fallback inference makes the UI immediately responsive.',
    screens: [
      {
        src: '/assets/projects/signsense-01.webp',
        caption: 'SignSense AI hero stage introducing real-time sign translation.',
      },
      {
        src: '/assets/projects/signsense-engine.webp',
        caption: 'Live Recognition Engine view with webcam hand-tracking and classifier controls.',
      },
      {
        src: '/assets/projects/signsense-pipeline.webp',
        caption: '6-stage MediaPipe 21-landmark to 63-feature ML architecture breakdown.',
      },
      {
        src: '/assets/projects/signsense-practice.webp',
        caption: 'Word Builder & ASL Flashcards interactive practice studio.',
      },
    ],
  },
  {
    slug: 'medikiosk',
    index: '03',
    title: 'MediKiosk',
    shortTitle: 'MEDIKIOSK',
    year: '2026',
    category: 'Clinical Workflow · SIH 2026',
    accent: '#2FD3C4',
    liveUrl: 'https://medikiosk-wine-rho.vercel.app/',
    repoUrl: 'https://github.com/PRINCE-CODER679/Medikiosk',
    summary:
      'AI-powered multilingual clinical intake platform designed for high-volume Indian OPDs, bridging accessible self-check-in kiosks with physician-ready triage summaries.',
    problem:
      'High-volume outpatient clinics spend precious consultation minutes collecting basic symptom history, deciphering paper prescriptions, and navigating language barriers across patients.',
    role:
      'Full-Stack & Product Interface Developer — designed and built the accessible multilingual Patient Kiosk (/kiosk), Physician Dashboard (/dashboard), Patient Clinical Summary reviewer (/patients/:id), and FastAPI backend shell for Smart India Hackathon 2026.',
    stack: ['React', 'Vite', 'React Router', 'Tailwind CSS', 'Python', 'FastAPI', 'Pydantic', 'SQLAlchemy'],
    implementation:
      'Architected a dual-surface React + FastAPI platform separating a low-literacy, high-contrast touch/voice Patient Kiosk (English, हिंदी, मराठी) from a structured Physician Portal featuring priority red-flag triage alerts, extracted vitals/OCR sections, and clinician verification controls (Edit, Confirm, Reject, Save).',
    features: [
      '5-step patient intake journey: Identify (ABHA ID), Converse, Scan, Structure, Review',
      'Multilingual patient interface supporting English, हिंदी, and मराठी',
      'Accessible high-contrast kiosk mode with large touch targets and voice-guidance toggle',
      'Physician dashboard with intake volume telemetry, red-flag priority alerts, and encounter queue',
      'Clinician summary verification workflow with Edit, Confirm, Reject, and Save states',
    ],
    learned:
      'Designing for high-throughput public clinics flips typical web assumptions: contrast, oversized touch targets, explicit clinician confirmation over black-box AI summaries, and vernacular clarity matter more than decorative UI.',
    journeySteps: [
      {
        step: '01',
        title: 'IDENTIFY',
        caption: 'Link ABHA ID, scan queue code, or locate existing patient records.',
        screen: '/assets/projects/medikiosk-01.webp',
      },
      {
        step: '02',
        title: 'CONVERSE',
        caption: 'Capture chief complaints and symptoms in English, हिंदी, or मराठी via voice & touch.',
        screen: '/assets/projects/medikiosk-kiosk.webp',
      },
      {
        step: '03',
        title: 'SCAN',
        caption: 'Capture physical paper prescriptions, lab reports, and prior discharge notes.',
        screen: '/assets/projects/medikiosk-02.webp',
      },
      {
        step: '04',
        title: 'STRUCTURE',
        caption: 'Extract medications, vitals, allergies, and risk red flags into structured clinical fields.',
        screen: '/assets/projects/medikiosk-dashboard.webp',
      },
      {
        step: '05',
        title: 'REVIEW',
        caption: 'Physician validates the structured clinical draft before consultation begins.',
        screen: '/assets/projects/medikiosk-patient.webp',
      },
    ],
    screens: [
      {
        src: '/assets/projects/medikiosk-01.webp',
        caption: 'MediKiosk hub introducing multilingual patient intake and clinical framing.',
      },
      {
        src: '/assets/projects/medikiosk-kiosk.webp',
        caption: 'Accessible Kiosk Touch Terminal (/kiosk) with high-contrast controls and voice guidance.',
      },
      {
        src: '/assets/projects/medikiosk-dashboard.webp',
        caption: 'Physician Clinical Portal (/dashboard) with OPD telemetry and priority red-flag alerts.',
      },
      {
        src: '/assets/projects/medikiosk-patient.webp',
        caption: 'Patient Profile (/patients/PAT-10928) showing extracted vitals, allergies, and summary review.',
      },
    ],
  },
  {
    slug: 'devtalks',
    index: '04',
    title: "DEVTALKS '26",
    shortTitle: 'DEVTALKS',
    year: '2026',
    category: 'Creative Web · DevKraft',
    accent: '#E8211C',
    liveUrl: 'https://devtalks-beta.vercel.app/',
    repoUrl: 'https://github.com/PRINCE-CODER679/DEVTALKS',
    summary:
      "Interactive mystery-speaker reveal and community prediction experience built for DevKraft's flagship 2-day tech event DEVTALKS '26 (10–11 Jan 2026).",
    problem:
      'Static college event pages announce speakers in plain grids and fail to build anticipation or encourage student participation before doors open.',
    role:
      'Creative Web Engineer — built the audio-reactive entrance gate, Three.js atmosphere, 3D coverflow dossier ring, flippable clue cards, and serverless guess submission backed by Google Sheets.',
    stack: ['React', 'Vite', 'Three.js', 'Framer Motion', 'Lenis', 'Tailwind CSS', 'Vercel API', 'Google Sheets API'],
    implementation:
      'Combined Lenis smooth scroll with a Three.js atmospheric particle/stage backdrop, an interactive 3D coverflow ring cycling three confidential speaker dossiers, flippable clue cards, and a serverless /api/submit-guess endpoint logging predictions directly to Google Sheets.',
    features: [
      'Cinematic teaser entrance with unmute toggle and smooth reveal into the event stage',
      'Interactive 3D coverflow reconstruction ring across 3 keynote speaker archetypes',
      'Tap-to-flip confidential dossier clue cards with signal reconstruction HUD',
      'Community Prediction Challenge allowing attendees to submit guesses & claim free passes',
    ],
    learned:
      'Balancing dramatic dark-stage theater with crisp typography and lightweight serverless submission flows showed how creative frontend engineering directly drives student engagement.',
    dossiers: [
      {
        caseId: 'CASE #01 · TECH TITAN',
        title: 'THE TECH VISIONARY',
        hint: 'FINTECH UNICORN',
        quote: 'An iconic founder whose viral frameworks and product-first philosophy redefined consumer tech.',
        clues: ['Pioneered fintech & high-trust consumer networks', 'Keynote voice across premier tech forums', 'Known for delta-4 product philosophies'],
      },
      {
        caseId: 'CASE #02 · ROUND TABLE',
        title: 'THE VENTURE ARCHITECT',
        hint: 'SHARK INVESTOR',
        quote: 'A trailblazing investor and entrepreneur known for fiery debate, sharp instincts, and backing 100+ high-growth companies.',
        clues: ['Unfiltered venture roundtable host', 'Early investor across D2C, Web3 & AI', 'Household Indian business TV figure'],
      },
      {
        caseId: 'CASE #03 · AI & SCALE',
        title: 'THE AI & DEEP TECH ARCHITECT',
        hint: 'AI ARCHITECT',
        quote: 'A world-renowned AI researcher and software educator who taught millions how neural nets think.',
        clues: ['Helped build foundational LLMs & vision systems', 'Led AI teams at Tesla & OpenAI', 'Authored iconic zero-to-hero deep learning courses'],
      },
    ],
    screens: [
      {
        src: '/assets/projects/devtalks-s0.webp',
        caption: "DEVTALKS '26 atmospheric hero unveiling silhouetted keynote intrigue.",
      },
      {
        src: '/assets/projects/devtalks-s1.webp',
        caption: '3D Coverflow Reconstruction Ring showcasing confidential speaker dossiers.',
      },
      {
        src: '/assets/projects/devtalks-s2.webp',
        caption: "About DEVTALKS '26 pillars: Raw & Unfiltered, High-Trust Network, Next-Gen Frontier.",
      },
      {
        src: '/assets/projects/devtalks-s4.webp',
        caption: 'Community Prediction Challenge interactive submission interface.',
      },
    ],
  },
];

export const PROJECT_BY_SLUG = Object.fromEntries(PROJECTS.map((p) => [p.slug, p]));

