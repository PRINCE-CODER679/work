import { useEffect, useRef, useState } from 'react';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { HandPanToggle } from '../components/ui/HandPanToggle';
import { damp, prefersReducedMotion } from '../animations/motion';
import './sections.css';

const DOMAIN_NODES = [
  { id: 'ai', label: 'AI / ML', rx: 0.20, ry: 0.35, color: '#536BFF', fact: 'SpendSense & SignSense ML pipelines' },
  { id: 'cv', label: 'VISION', rx: 0.80, ry: 0.30, color: '#FF5924', fact: '21-landmark 3D hand tracking' },
  { id: 'api', label: 'FASTAPI', rx: 0.50, ry: 0.52, color: '#F5F2EB', fact: 'Async Python inference & DB APIs' },
  { id: 'med', label: 'CLINICAL', rx: 0.24, ry: 0.72, color: '#2FD3C4', fact: 'Multilingual patient intake kiosk' },
  { id: 'web', label: 'WEBGL', rx: 0.76, ry: 0.72, color: '#E8211C', fact: 'Three.js, GLSL shaders & GSAP' },
];

/**
 * ENTER ASRAR'S DIGITAL WORLD — FULL-BLEED INTERACTIVE SPATIAL ARENA
 * Floating spatial nodes over transparent WebGL core, pointer/WASD/touch/hand-pan steering,
 * subtle corner controls, and overclock unlocked upon synchronizing all 5 nodes.
 */
export function ExperimentLabSection() {
  const canvasRef = useRef(null);
  const [syncedCount, setSyncedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [overclock, setOverclock] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [lastFact, setLastFact] = useState('Move pointer or use WASD to connect all 5 domain beacons.');
  const [runId, setRunId] = useState(0);

  const audioCtxRef = useRef(null);
  const keysRef = useRef({});
  const pointerTargetRef = useRef({ active: false, x: 0.5, y: 0.5 });
  const dpadVecRef = useRef({ x: 0, y: 0 });

  const playChime = (freq = 520) => {
    if (!audioOn) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    } catch (e) { }
  };

  const resetGame = () => {
    setSyncedCount(0);
    setCompleted(false);
    setLastFact('Simulation reset. Move pointer or use keys to link all 5 beacons.');
    setRunId((r) => r + 1);
  };

  // Secret keyboard easter egg ("asrar") + movement keys
  useEffect(() => {
    let buffer = '';
    const onDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && document.activeElement?.closest('#scene-lab')) {
        e.preventDefault();
      }
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key.length === 1) {
        buffer = (buffer + e.key.toLowerCase()).slice(-5);
        if (buffer === 'asrar') {
          setOverclock((o) => !o);
        }
      }
    };
    const onUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let raf = 0;
    let last = performance.now();
    const state = {
      x: 0.5,
      y: 0.18,
      vx: 0,
      vy: 0,
      trail: [],
      synced: new Set(),
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const reduced = prefersReducedMotion();

      // Input force
      const k = keysRef.current;
      let ax = dpadVecRef.current.x;
      let ay = dpadVecRef.current.y;
      if (k.w || k.arrowup) ay -= 1;
      if (k.s || k.arrowdown) ay += 1;
      if (k.a || k.arrowleft) ax -= 1;
      if (k.d || k.arrowright) ax += 1;

      const speed = overclock ? 0.72 : 0.46;
      if (ax !== 0 || ay !== 0) {
        const len = Math.hypot(ax, ay) || 1;
        state.vx = damp(state.vx, (ax / len) * speed, 9, dt);
        state.vy = damp(state.vy, (ay / len) * speed, 9, dt);
      } else if (pointerTargetRef.current.active) {
        const dx = pointerTargetRef.current.x - state.x;
        const dy = pointerTargetRef.current.y - state.y;
        const d = Math.hypot(dx, dy);
        if (d > 0.015) {
          state.vx = damp(state.vx, (dx / d) * Math.min(speed, d * 2.2), 10, dt);
          state.vy = damp(state.vy, (dy / d) * Math.min(speed, d * 2.2), 10, dt);
        } else {
          state.vx = damp(state.vx, 0, 10, dt);
          state.vy = damp(state.vy, 0, 10, dt);
        }
      } else {
        state.vx = damp(state.vx, 0, 6, dt);
        state.vy = damp(state.vy, 0, 6, dt);
      }

      state.x = Math.min(0.95, Math.max(0.05, state.x + state.vx * dt));
      state.y = Math.min(0.92, Math.max(0.08, state.y + state.vy * dt));

      if (!reduced) {
        state.trail.push({ x: state.x * w, y: state.y * h });
        if (state.trail.length > (overclock ? 42 : 22)) state.trail.shift();
      }

      // Collision / Docking check
      for (const node of DOMAIN_NODES) {
        if (state.synced.has(node.id)) continue;
        const dist = Math.hypot((state.x - node.rx) * w, (state.y - node.ry) * h);
        if (dist < 36) {
          state.synced.add(node.id);
          const count = state.synced.size;
          setSyncedCount(count);
          setLastFact(`${node.label} LINKED — ${node.fact}`);
          playChime(440 + count * 110);
          if (count === DOMAIN_NODES.length) {
            setCompleted(true);
            setLastFact('SYSTEM SYNCHRONIZED — ALL 5 DOMAINS ACTIVE. OVERCLOCK READY.');
          }
        }
      }

      // Render arena with clear transparency to reveal underlying 3D world
      ctx.clearRect(0, 0, w, h);

      // Subtle architectural coordinates grid
      ctx.strokeStyle = 'rgba(245, 242, 235, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      for (let gx = gridSize; gx < w; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = gridSize; gy < h; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Draw connection vectors between synced nodes
      const syncedList = DOMAIN_NODES.filter((n) => state.synced.has(n.id));
      if (syncedList.length > 1) {
        ctx.strokeStyle = overclock ? 'rgba(255, 89, 36, 0.75)' : 'rgba(83, 107, 255, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        syncedList.forEach((n, idx) => {
          if (idx === 0) ctx.moveTo(n.rx * w, n.ry * h);
          else ctx.lineTo(n.rx * w, n.ry * h);
        });
        ctx.stroke();
      }

      // Draw floating domain beacons
      for (let i = 0; i < DOMAIN_NODES.length; i++) {
        const node = DOMAIN_NODES[i];
        const floatX = reduced ? 0 : Math.sin(now * 0.0016 + i * 1.5) * 4;
        const floatY = reduced ? 0 : Math.cos(now * 0.0018 + i * 1.3) * 4;
        const nx = node.rx * w + floatX;
        const ny = node.ry * h + floatY;
        const isDone = state.synced.has(node.id);
        const pulse = reduced ? 0 : Math.sin(now * 0.004 + nx) * 3;

        // Outer beacon ring
        ctx.strokeStyle = isDone ? node.color : 'rgba(245, 242, 235, 0.22)';
        ctx.lineWidth = isDone ? 2 : 1;
        ctx.beginPath();
        ctx.arc(nx, ny, (isDone ? 24 : 18) + pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = isDone ? node.color : 'rgba(245, 242, 235, 0.35)';
        ctx.beginPath();
        ctx.arc(nx, ny, isDone ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();

        // Subtle pill backdrop for node text
        ctx.fillStyle = 'rgba(8, 8, 12, 0.65)';
        const textW = 76;
        ctx.fillRect(nx - textW / 2, ny - 36, textW, 18);

        // Text label
        ctx.fillStyle = isDone ? '#F5F2EB' : 'rgba(245, 242, 235, 0.68)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny - 24);
      }

      // Probe craft trail
      if (state.trail.length > 1) {
        for (let i = 1; i < state.trail.length; i++) {
          const a = i / state.trail.length;
          ctx.strokeStyle = overclock
            ? `rgba(255, 89, 36, ${a * 0.85})`
            : `rgba(83, 107, 255, ${a * 0.7})`;
          ctx.lineWidth = a * 3;
          ctx.beginPath();
          ctx.moveTo(state.trail[i - 1].x, state.trail[i - 1].y);
          ctx.lineTo(state.trail[i].x, state.trail[i].y);
          ctx.stroke();
        }
      }

      // Player probe craft
      const px = state.x * w;
      const py = state.y * h;
      const angle = Math.hypot(state.vx, state.vy) > 0.01 ? Math.atan2(state.vy, state.vx) : Math.PI / 2;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.fillStyle = overclock ? '#FF5924' : '#F5F2EB';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-9, -7);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-9, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [runId, overclock, audioOn]);

  const onCanvasPointer = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    pointerTargetRef.current = {
      active: true,
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    };
  };

  const stopDpad = () => {
    dpadVecRef.current = { x: 0, y: 0 };
  };

  return (
    <section id="scene-lab" className="lab section" aria-label="Enter Asrar's Digital World">
      {/* Full-bleed interactive probe canvas */}
      <canvas
        ref={canvasRef}
        className="lab__canvas"
        tabIndex={0}
        aria-label="Enter Asrar's Digital World interactive probe canvas. Use pointer, WASD/arrows, or touch to connect all 5 domain nodes."
        onPointerMove={onCanvasPointer}
        onPointerDown={onCanvasPointer}
        onPointerLeave={() => {
          pointerTargetRef.current.active = false;
        }}
        data-cursor="PILOT"
      />

      {/* Minimal Top Header */}
      <div className="lab__header">
        <h2 className="display lab__title">
          <SplitHeadline lines={["ENTER ASRAR'S", "DIGITAL WORLD."]} as="span" />
        </h2>
        <div className="lab__subline mono">
          <span>MOVE TO CONNECT THE SYSTEM</span>
          <span className="lab__counter">
            <strong style={{ color: completed ? 'var(--signal)' : 'var(--cobalt)' }}>
              {syncedCount} / 5 CONNECTED
            </strong>
          </span>
        </div>
      </div>

      {/* Synchronized Completion Reveal with Overclock */}
      {completed && (
        <div className="lab__sync-overlay mono" role="status">
          <span className="lab__sync-tag">SYSTEM SYNCHRONIZED.</span>
          <button
            type="button"
            className={`lab__overclock-btn ${overclock ? 'is-active' : ''}`}
            onClick={() => setOverclock((o) => !o)}
          >
            {overclock ? 'OVERCLOCK ACTIVE [0xFF]' : 'ACTIVATE OVERCLOCK'}
          </button>
        </div>
      )}

      {/* Subtle Bottom Controls, Touch D-Pad & Status */}
      <div className="lab__bottom-dock">
        <div className="lab__dpad" aria-label="Touch steering controls">
          <span />
          <button
            type="button"
            aria-label="Steer Up"
            onPointerDown={() => (dpadVecRef.current = { x: 0, y: -1 })}
            onPointerUp={stopDpad}
            onPointerLeave={stopDpad}
          >
            ▲
          </button>
          <span />
          <button
            type="button"
            aria-label="Steer Left"
            onPointerDown={() => (dpadVecRef.current = { x: -1, y: 0 })}
            onPointerUp={stopDpad}
            onPointerLeave={stopDpad}
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Steer Down"
            onPointerDown={() => (dpadVecRef.current = { x: 0, y: 1 })}
            onPointerUp={stopDpad}
            onPointerLeave={stopDpad}
          >
            ▼
          </button>
          <button
            type="button"
            aria-label="Steer Right"
            onPointerDown={() => (dpadVecRef.current = { x: 1, y: 0 })}
            onPointerUp={stopDpad}
            onPointerLeave={stopDpad}
          >
            ▶
          </button>
        </div>

        <div className="lab__footer">
          <div className="lab__status mono muted">
            <span>{lastFact}</span>
          </div>

          <div className="lab__corner-controls mono">
            <button
              type="button"
              className={`lab__ctrl-btn ${audioOn ? 'is-active' : ''}`}
              onClick={() => setAudioOn((a) => !a)}
            >
              AUDIO: {audioOn ? 'ON' : 'OFF'}
            </button>
            <HandPanToggle
              className="lab__ctrl-btn"
              onVector={(nx, ny, active) => {
                pointerTargetRef.current = { x: nx, y: ny, active };
              }}
            />
            <button type="button" className="lab__ctrl-btn" onClick={resetGame}>
              RESET EXPERIENCE
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
