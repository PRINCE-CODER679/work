/**
 * Verified technology stack mapped directly to projects built by Asrar Mulla.
 * Used in Scene 08 (The Toolbox — Interactive Tech Universe).
 */
export const TECH_CATEGORIES = [
  { id: 'all', label: 'ALL SYSTEMS' },
  { id: 'ai', label: 'AI / ML / DATA' },
  { id: 'frontend', label: 'FRONTEND & 3D' },
  { id: 'backend', label: 'BACKEND & DB' },
  { id: 'core', label: 'LANGUAGES & TOOLS' },
];

export const TECH_NODES = [
  // AI / ML / Data
  { id: 'python', name: 'Python', cat: 'ai', x: 0.24, y: 0.34, projects: ['spendsense', 'signsense', 'medikiosk'], note: 'Core language for FastAPI services, ML pipelines, and DSA.' },
  { id: 'mediapipe', name: 'MediaPipe', cat: 'ai', x: 0.14, y: 0.62, projects: ['signsense'], note: '21-landmark 3D hand coordinate extraction at real-time frame rates.' },
  { id: 'sklearn', name: 'scikit-learn', cat: 'ai', x: 0.32, y: 0.72, projects: ['signsense'], note: 'Random Forest (120 trees), SVM, KNN & Logistic Regression ASL classifiers.' },
  { id: 'opencv', name: 'OpenCV', cat: 'ai', x: 0.16, y: 0.82, projects: ['signsense'], note: 'Frame preprocessing and landmark pipeline validation.' },
  { id: 'pandas', name: 'Pandas', cat: 'ai', x: 0.38, y: 0.22, projects: ['spendsense', 'signsense'], note: 'Bank CSV/XLSX data cleaning and structured feature datasets.' },
  { id: 'numpy', name: 'NumPy', cat: 'ai', x: 0.48, y: 0.38, projects: ['spendsense', 'signsense'], note: 'Vectorized distance scaling and numerical spending analytics.' },

  // Frontend & 3D
  { id: 'react', name: 'React', cat: 'frontend', x: 0.54, y: 0.55, projects: ['spendsense', 'signsense', 'medikiosk', 'devtalks'], note: 'Component architecture powering every live web application.' },
  { id: 'three', name: 'Three.js', cat: 'frontend', x: 0.72, y: 0.28, projects: ['devtalks'], note: 'WebGL environments, shaders, and spatial stage rendering.' },
  { id: 'gsap', name: 'GSAP', cat: 'frontend', x: 0.82, y: 0.48, projects: ['signsense'], note: 'Scroll-scrubbed choreography, camera timelines, and masked reveals.' },
  { id: 'tailwind', name: 'Tailwind CSS', cat: 'frontend', x: 0.68, y: 0.68, projects: ['spendsense', 'signsense', 'medikiosk', 'devtalks'], note: 'Rapid utility styling for clinical, fintech, and event interfaces.' },
  { id: 'vite', name: 'Vite', cat: 'frontend', x: 0.62, y: 0.84, projects: ['spendsense', 'signsense', 'medikiosk', 'devtalks'], note: 'Fast ESM bundling across production Vercel builds.' },

  // Backend & DB
  { id: 'fastapi', name: 'FastAPI', cat: 'backend', x: 0.44, y: 0.56, projects: ['spendsense', 'signsense', 'medikiosk'], note: 'Typed Python REST APIs for ML inference, finance, and triage.' },
  { id: 'mongodb', name: 'MongoDB', cat: 'backend', x: 0.56, y: 0.18, projects: ['spendsense'], note: 'Async Motor persistence with strict multi-user isolation.' },
  { id: 'sql', name: 'SQL / SQLAlchemy', cat: 'backend', x: 0.34, y: 0.48, projects: ['medikiosk'], note: 'Relational clinical patient, encounter, and alert models.' },

  // Languages & Tools
  { id: 'cpp', name: 'C / C++', cat: 'core', x: 0.86, y: 0.24, projects: [], note: 'Core DSA implementations: search, sorting, stacks, queues, trees, graphs.' },
  { id: 'js', name: 'JavaScript', cat: 'core', x: 0.78, y: 0.76, projects: ['spendsense', 'signsense', 'medikiosk', 'devtalks'], note: 'Client interactivity, Web APIs, canvas physics, and state.' },
  { id: 'git', name: 'Git & GitHub', cat: 'core', x: 0.88, y: 0.64, projects: ['spendsense', 'signsense', 'medikiosk', 'devtalks'], note: 'Version control, multi-repo architecture, and release hygiene.' },
  { id: 'vercel', name: 'Vercel', cat: 'core', x: 0.74, y: 0.88, projects: ['spendsense', 'signsense', 'medikiosk', 'devtalks'], note: 'Production edge hosting & serverless endpoints for all 4 live builds.' },
];

