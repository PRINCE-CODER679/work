import { useEffect, useRef, useState } from 'react';
import { PROJECT_BY_SLUG } from '../data/projects';
import { damp, isTouch, prefersReducedMotion } from '../animations/motion';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Magnetic } from '../components/ui/Magnetic';
import './sections.css';

// MediaPipe 21 hand-landmark skeleton edges (wrist #0 -> thumb/index/middle/ring/pinky chains)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

// Normalized 3D pose landmarks (x, y, z) representing distinct ASL handshapes
const POSES = {
  OPEN: {
    label: 'PALM',
    classifier: 'MediaPipe 21-Landmark Raw',
    pts: [
      [0, 0.72, 0],
      [-0.25, 0.56, 0.08], [-0.42, 0.36, 0.12], [-0.56, 0.18, 0.14], [-0.68, 0.04, 0.15],
      [-0.22, 0.12, 0], [-0.24, -0.22, -0.02], [-0.25, -0.46, -0.04], [-0.26, -0.66, -0.06],
      [-0.02, 0.08, 0], [-0.02, -0.28, -0.02], [-0.02, -0.54, -0.04], [-0.02, -0.74, -0.06],
      [0.18, 0.12, 0], [0.22, -0.22, -0.02], [0.24, -0.45, -0.04], [0.26, -0.64, -0.06],
      [0.36, 0.22, 0.02], [0.44, -0.06, -0.01], [0.5, -0.24, -0.03], [0.54, -0.4, -0.05],
    ],
  },
  A: {
    label: 'ASL "A"',
    classifier: 'Random Forest · 63 Norm Features',
    pts: [
      [0, 0.72, 0],
      [-0.24, 0.52, 0.14], [-0.36, 0.32, 0.18], [-0.38, 0.12, 0.2], [-0.34, -0.04, 0.22],
      [-0.18, 0.16, 0.02], [-0.18, -0.04, 0.16], [-0.17, 0.14, 0.24], [-0.16, 0.26, 0.18],
      [-0.01, 0.14, 0], [-0.01, -0.06, 0.18], [-0.01, 0.15, 0.25], [-0.01, 0.28, 0.18],
      [0.16, 0.16, 0], [0.16, -0.02, 0.16], [0.16, 0.17, 0.24], [0.15, 0.28, 0.17],
      [0.32, 0.22, 0.02], [0.32, 0.08, 0.14], [0.3, 0.22, 0.22], [0.28, 0.32, 0.16],
    ],
  },
  V: {
    label: 'ASL "V"',
    classifier: 'SVM RBF · Wrist Origin #0',
    pts: [
      [0, 0.72, 0],
      [-0.24, 0.52, 0.1], [-0.3, 0.34, 0.18], [-0.16, 0.2, 0.24], [-0.02, 0.18, 0.26],
      [-0.18, 0.12, 0], [-0.26, -0.22, -0.02], [-0.32, -0.48, -0.04], [-0.36, -0.7, -0.06],
      [0.02, 0.1, 0], [0.1, -0.24, -0.02], [0.16, -0.5, -0.04], [0.2, -0.72, -0.06],
      [0.18, 0.18, 0.02], [0.18, 0.05, 0.18], [0.16, 0.24, 0.26], [0.14, 0.34, 0.18],
      [0.34, 0.24, 0.04], [0.32, 0.12, 0.16], [0.28, 0.28, 0.22], [0.26, 0.36, 0.16],
    ],
  },
  L: {
    label: 'ASL "L"',
    classifier: 'KNN · Scale Invariant Vector',
    pts: [
      [0, 0.72, 0],
      [-0.25, 0.55, 0.06], [-0.46, 0.44, 0.08], [-0.64, 0.38, 0.08], [-0.8, 0.36, 0.08],
      [-0.18, 0.1, 0], [-0.19, -0.24, -0.02], [-0.2, -0.5, -0.04], [-0.2, -0.72, -0.06],
      [0.02, 0.16, 0.02], [0.02, 0.02, 0.2], [0.02, 0.22, 0.26], [0.02, 0.32, 0.18],
      [0.18, 0.18, 0.02], [0.18, 0.06, 0.18], [0.16, 0.24, 0.24], [0.14, 0.34, 0.16],
      [0.34, 0.24, 0.04], [0.32, 0.12, 0.16], [0.28, 0.26, 0.22], [0.26, 0.35, 0.16],
    ],
  },
};

/**
 * SCENE 05 — PROJECT 02: SIGNSENSE AI
 * Interactive 3D projected 21-landmark hand tracking skeleton driven by pointer + ASL pose presets.
 */
export function SignSenseScene({ onOpenCase }) {
  const project = PROJECT_BY_SLUG.signsense;
  const [poseKey, setPoseKey] = useState('V');
  const canvasRef = useRef(null);
  const targetRot = useRef({ rx: 0.12, ry: -0.18 });
  const currentPts = useRef(POSES.V.pts.map((p) => [...p]));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let rx = 0.12;
    let ry = -0.18;
    let last = performance.now();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const reduced = prefersReducedMotion();

      const goalPts = POSES[poseKey].pts;
      for (let i = 0; i < 21; i++) {
        for (let k = 0; k < 3; k++) {
          currentPts.current[i][k] = damp(currentPts.current[i][k], goalPts[i][k], reduced ? 60 : 8.5, dt);
        }
      }

      const idleDrift = reduced ? 0 : Math.sin(now * 0.0012) * 0.14;
      rx = damp(rx, targetRot.current.rx, 7, dt);
      ry = damp(ry, targetRot.current.ry + idleDrift, 7, dt);

      ctx.clearRect(0, 0, w, h);

      // Subtle coordinate crosshair at Wrist Origin #0
      const cx = w * 0.5;
      const cy = h * 0.54;
      const scale = Math.min(w, h) * 0.44;
      ctx.strokeStyle = 'rgba(245, 242, 235, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 16);
      ctx.lineTo(cx, h - 16);
      ctx.moveTo(24, cy);
      ctx.lineTo(w - 24, cy);
      ctx.stroke();

      // 3D rotation projection
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);

      const projected = currentPts.current.map(([x, y, z]) => {
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const persp = 2.6 / (2.6 + z2);
        return {
          sx: cx + x1 * scale * persp,
          sy: cy + y2 * scale * persp,
          z: z2,
        };
      });

      // Bones
      ctx.lineWidth = 2;
      for (const [a, b] of HAND_CONNECTIONS) {
        const pa = projected[a];
        const pb = projected[b];
        const grad = ctx.createLinearGradient(pa.sx, pa.sy, pb.sx, pb.sy);
        grad.addColorStop(0, 'rgba(83, 107, 255, 0.85)');
        grad.addColorStop(1, 'rgba(255, 89, 36, 0.9)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }

      // 21 Landmark Nodes
      projected.forEach((p, idx) => {
        const isWrist = idx === 0;
        const isTip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
        const r = isWrist ? 7 : isTip ? 5.2 : 3.6;
        ctx.fillStyle = isWrist ? '#FF5924' : isTip ? '#F5F2EB' : '#536BFF';
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fill();

        if (isWrist || isTip) {
          ctx.fillStyle = 'rgba(245, 242, 235, 0.72)';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(isWrist ? '#0 WRIST' : `#${idx}`, p.sx + 9, p.sy + 3);
        }
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [poseKey]);

  const onMove = (e) => {
    if (isTouch() || prefersReducedMotion() || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    targetRot.current.ry = ((e.clientX - r.left) / r.width - 0.5) * 1.1;
    targetRot.current.rx = ((e.clientY - r.top) / r.height - 0.5) * 0.7;
  };

  return (
    <article
      id="scene-signsense"
      className="proj-scene section"
      style={{ background: '#080808' }}
      aria-label="Project 02: SignSense AI"
    >
      <div className="proj-scene__head">
        <div className="proj-scene__title-col">
          <div className="mono section-index" style={{ color: 'var(--signal)' }}>
            <span>{project.category}</span>
          </div>
          <h3 className="display proj-scene__title">
            <SplitHeadline lines={['SIGN', 'SENSE AI.']} as="span" />
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

      <div className="sign-stage">
        <div className="sign-tracker" onPointerMove={onMove} data-cursor="DRAG">
          <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>21-LANDMARK 3D RIG // MOVE POINTER TO ORBIT</span>
            <span style={{ color: 'var(--signal)' }}>{POSES[poseKey].classifier}</span>
          </div>

          <canvas
            ref={canvasRef}
            className="sign-tracker__canvas"
            aria-label="Interactive 21-landmark 3D ASL hand tracking visualization"
          />

          <div className="sign-controls">
            <div className="sign-poses" role="group" aria-label="ASL pose presets">
              {Object.entries(POSES).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  className={`sign-pose ${poseKey === key ? 'is-active' : ''}`}
                  onClick={() => setPoseKey(key)}
                >
                  {val.label}
                </button>
              ))}
            </div>
            <span className="mono muted">63 FEATURES · SCALE-INVARIANT</span>
          </div>
        </div>

        <div className="sign-screens">
          <figure className="sign-screen">
            <img src={project.screens[0].src} alt={project.screens[0].caption} loading="lazy" />
            <figcaption className="mono muted">{project.screens[0].caption}</figcaption>
          </figure>
          <figure className="sign-screen">
            <img src={project.screens[2].src} alt={project.screens[2].caption} loading="lazy" />
            <figcaption className="mono muted">{project.screens[2].caption}</figcaption>
          </figure>
        </div>
      </div>
    </article>
  );
}

