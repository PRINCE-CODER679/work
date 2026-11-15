import { useEffect, useRef, useState } from 'react';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { damp, prefersReducedMotion } from '../animations/motion';
import './sections.css';

const DOMAIN_NODES = [
  { id: 'ai', label: '01 AI / ML', rx: 0.22, ry: 0.28, color: '#536BFF', fact: 'SpendSense & SignSense ML pipelines' },
  { id: 'cv', label: '02 VISION', rx: 0.78, ry: 0.26, color: '#FF5924', fact: '21-landmark 3D hand tracking' },
  { id: 'api', label: '03 FASTAPI', rx: 0.52, ry: 0.52, color: '#F5F2EB', fact: 'Async Python inference & DB APIs' },
  { id: 'med', label: '04 CLINICAL', rx: 0.24, ry: 0.76, color: '#2FD3C4', fact: 'Multilingual patient intake kiosk' },
  { id: 'web', label: '05 WEBGL', rx: 0.78, ry: 0.75, color: '#E8211C', fact: 'Three.js, GLSL shaders & GSAP' },
];

/**
 * SCENE 10 — EXPERIMENT LAB (`SIGNAL RUNNER`)
 * Real playable spatial craft simulation with pointer, keyboard (WASD/Arrows),
 * mobile D-pad, reset, optional audio (OFF by default), completion state, and OVERCLOCK easter egg.
 */
export function ExperimentLabSection() {
  const canvasRef = useRef(null);
  const [syncedCount, setSyncedCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [overclock, setOverclock] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [lastFact, setLastFact] = useState('Steer the telemetry probe across all 5 sector nodes to link the universe.');
  const [runId, setRunId] = useState(0);

  const audioCtxRef = useRef(null);
  const keysRef = useRef({});
  const pointerTargetRef = useRef({ active: false, x: 0, y: 0 });
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
    } catch (e) {}
  };

  const resetGame = () => {
    setSyncedCount(0);
    setCompleted(false);
    setLastFact('Probe reset at origin. Dock all 5 telemetry sectors to synchronize.');
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
      y: 0.14,
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

      const speed = overclock ? 0.68 : 0.44;
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
        if (state.trail.length > (overclock ? 42 : 20)) state.trail.shift();
      }

      // Collision / Docking check
      for (const node of DOMAIN_NODES) {
        if (state.synced.has(node.id)) continue;
        const dist = Math.hypot((state.x - node.rx) * w, (state.y - node.ry) * h);
        if (dist < 34) {
          state.synced.add(node.id);
          const count = state.synced.size;
          setSyncedCount(count);
          setLastFact(`${node.label} LINKED — ${node.fact}`);
          playChime(440 + count * 110);
          if (count === DOMAIN_NODES.length) {
            setCompleted(true);
            setLastFact('UNIVERSE SYNCHRONIZED — ALL 5 SECTORS ONLINE. OVERCLOCK UNLOCKED.');
          }
        }
      }

      // Render arena
      ctx.clearRect(0, 0, w, h);

      // Subtle architectural grid
      ctx.strokeStyle = 'rgba(245, 242, 235, 0.05)';
      ctx.lineWidth = 1;
      for (let gx = 48; gx < w; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 48; gy < h; gy += 48) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Draw links between synced nodes
      const syncedList = DOMAIN_NODES.filter((n) => state.synced.has(n.id));
      if (syncedList.length > 1) {
        ctx.strokeStyle = overclock ? '#FF5924' : '#536BFF';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        syncedList.forEach((n, idx) => {
          if (idx === 0) ctx.moveTo(n.rx * w, n.ry * h);
          else ctx.lineTo(n.rx * w, n.ry * h);
        });
        ctx.stroke();
      }

      // Draw domain beacons
      for (const node of DOMAIN_NODES) {
        const nx = node.rx * w;
        const ny = node.ry * h;
        const isDone = state.synced.has(node.id);
        const pulse = reduced ? 0 : Math.sin(now * 0.004 + nx) * 3;

        ctx.strokeStyle = isDone ? node.color : 'rgba(245,242,235,0.28)';
        ctx.lineWidth = isDone ? 2 : 1;
        ctx.beginPath();
        ctx.arc(nx, ny, (isDone ? 22 : 18) + pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isDone ? node.color : '#16161b';
        ctx.beginPath();
        ctx.arc(nx, ny, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isDone ? '#F5F2EB' : 'rgba(245,242,235,0.65)';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny - 26);
      }

      // Craft trail
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

      // Player probe
      const px = state.x * w;
      const py = state.y * h;
      const angle = Math.hypot(state.vx, state.vy) > 0.01 ? Math.atan2(state.vy, state.vx) : Math.PI / 2;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.fillStyle = overclock ? '#FF5924' : '#F5F2EB';
      ctx.beginPath();
      ctx.moveTo(13, 0);
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
    <section id="scene-lab" className="lab section" aria-label="Scene 10: Interactive Experiment Lab">
      <div className="mono section-index" style={{ marginBottom: '0.8rem' }}>
        <span>10 / PLAYABLE INTERACTION</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem' }}>
        <h2 className="display" style={{ fontSize: 'clamp(2.8rem, 7.6vw, 7.4rem)' }}>
          <SplitHeadline lines={['EXPERIMENT', 'LAB.']} as="span" />
        </h2>
        <p style={{ maxWidth: '28rem', color: 'rgba(245,242,235,0.78)' }}>
          <strong>SIGNAL RUNNER</strong> — Pilot the probe using mouse/touch aim, <kbd>WASD</kbd> / arrow keys, or the touch pad to synchronize all 5 engineering beacons.
        </p>
      </div>

      <div className="lab__wrap">
        <div className="lab__hud">
          <div className="mono" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem' }}>
            <span>
              NODES SYNCED:{' '}
              <strong style={{ color: completed ? 'var(--signal)' : 'var(--cobalt)' }}>
                {syncedCount}/5
              </strong>
            </span>
            <span className="muted">
              STATE: {completed ? 'SYNCHRONIZED' : overclock ? 'OVERCLOCK' : 'NAVIGATING'}
            </span>
          </div>

          <div className="lab__controls">
            <button
              type="button"
              className={`lab__btn ${audioOn ? 'is-on' : ''}`}
              onClick={() => setAudioOn((a) => !a)}
            >
              AUDIO: {audioOn ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              className={`lab__btn ${overclock ? 'is-on' : ''}`}
              onClick={() => setOverclock((o) => !o)}
              title="Easter Egg: Type 'asrar' or click"
            >
              [0xFF] {overclock ? 'OVERCLOCK ON' : 'OVERCLOCK'}
            </button>
            <button type="button" className="lab__btn" onClick={resetGame}>
              RESET
            </button>
          </div>
        </div>

        <div className="lab__arena">
          <canvas
            ref={canvasRef}
            className="lab__canvas"
            tabIndex={0}
            aria-label="Signal Runner interactive probe canvas. Use WASD, arrow keys, or pointer to dock all 5 domain nodes."
            onPointerMove={onCanvasPointer}
            onPointerDown={onCanvasPointer}
            onPointerLeave={() => {
              pointerTargetRef.current.active = false;
            }}
            data-cursor="PILOT"
          />

          {/* Mobile Touch D-Pad */}
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
        </div>

        <div className="lab__banner mono">
          <span style={{ color: completed ? 'var(--signal)' : 'var(--paper)' }}>{lastFact}</span>
          <span className="muted">EASTER EGG: TYPE &ldquo;ASRAR&rdquo;</span>
        </div>
      </div>
    </section>
  );
}

