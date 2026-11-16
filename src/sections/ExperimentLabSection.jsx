import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, damp, prefersReducedMotion } from '../animations/motion';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { HandPanToggle } from '../components/ui/HandPanToggle';
import { DigitalUniverseView } from '../components/universe/DigitalUniverseView';
import { universeAudio } from '../utils/universeAudio';
import './sections.css';
import './digitalUniverse.css';

export const DOMAIN_NODES = [
  { id: 'ai', label: 'AI / ML', rx: 0.22, ry: 0.40, color: '#536BFF', fact: 'SpendSense & SignSense ML pipelines' },
  { id: 'cv', label: 'VISION', rx: 0.78, ry: 0.38, color: '#FF5924', fact: '21-landmark 3D hand tracking' },
  { id: 'api', label: 'FASTAPI', rx: 0.50, ry: 0.51, color: '#F5F2EB', fact: 'Async Python inference & DB APIs' },
  { id: 'med', label: 'CLINICAL', rx: 0.25, ry: 0.64, color: '#2FD3C4', fact: 'Multilingual patient intake kiosk' },
  { id: 'web', label: 'WEBGL', rx: 0.75, ry: 0.63, color: '#A855F7', fact: 'Three.js, GLSL shaders & GSAP' },
];

/**
 * SCENE 10 — ENTER ASRAR'S DIGITAL WORLD & CINEMATIC UNLOCK EXPERIENCE
 *
 * State Machine:
 * PLAYING -> COMPLETED -> CINEMATIC_UNLOCK (0-1.5s Sync, 1.5-3.5s Core Implosion, 3.5-5.5s Portal Fly-Through) -> UNIVERSE_ACTIVE
 */
export function ExperimentLabSection({ onOpenCase }) {
  const canvasRef = useRef(null);

  // State machine: 'PLAYING' | 'COMPLETED' | 'CINEMATIC_UNLOCK' | 'UNIVERSE_ACTIVE'
  const [gameState, setGameState] = useState('PLAYING');
  const [syncedCount, setSyncedCount] = useState(0);
  const [overclock, setOverclock] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [unlockBanner, setUnlockBanner] = useState('');
  const [unlockSub, setUnlockSub] = useState('');
  const [lastFact, setLastFact] = useState(
    'Move pointer, tap nodes, or use WASD / D-Pad to connect all 5 domain beacons.'
  );
  const [runId, setRunId] = useState(0);

  const gameStateRef = useRef('PLAYING');
  const unlockTriggeredRef = useRef(false);
  const unlockTlRef = useRef(null);
  const keysRef = useRef({});
  const pointerTargetRef = useRef({ active: false, x: 0.5, y: 0.5 });
  const dpadVecRef = useRef({ x: 0, y: 0 });

  // Continuous animation state shared with canvas render loop during CINEMATIC_UNLOCK
  const unlockAnimRef = useRef({
    time: 0, // 0..5.5s
    fifthNode: { rx: 0.75, ry: 0.72, color: '#A855F7' },
    particles: [],
  });

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const handleToggleAudio = useCallback(() => {
    setAudioOn((prev) => {
      const next = !prev;
      universeAudio.setEnabled(next);
      return next;
    });
  }, []);

  // Build 160 orbital / portal particles once
  useEffect(() => {
    const pts = [];
    for (let i = 0; i < 160; i++) {
      pts.push({
        angle: Math.random() * Math.PI * 2,
        radius: 0.08 + Math.random() * 0.48,
        speed: (0.6 + Math.random() * 1.4) * (i % 2 === 0 ? 1 : -1),
        size: 1.2 + Math.random() * 2.4,
        z: Math.random(),
        color: i % 3 === 0 ? '#C084FC' : i % 3 === 1 ? '#536BFF' : '#F5F3FF',
      });
    }
    unlockAnimRef.current.particles = pts;
    return () => {
      if (unlockTlRef.current) unlockTlRef.current.kill();
      universeAudio.stopAmbient();
    };
  }, []);

  // Launch the 3-stage 5.5s cinematic sequence (PLAYING -> COMPLETED -> CINEMATIC_UNLOCK -> UNIVERSE_ACTIVE)
  const triggerCinematicUnlock = useCallback((finalNode) => {
    if (unlockTriggeredRef.current) return;
    unlockTriggeredRef.current = true;

    if (finalNode) {
      unlockAnimRef.current.fifthNode = {
        rx: finalNode.rx,
        ry: finalNode.ry,
        color: finalNode.color,
      };
    }

    setGameState('COMPLETED');
    setLastFact('CONNECTION ESTABLISHED — ALL 5 DOMAINS SYNCHRONIZED.');

    if (unlockTlRef.current) {
      unlockTlRef.current.kill();
    }

    const reduced = prefersReducedMotion();
    unlockAnimRef.current.time = 0;
    setGameState('CINEMATIC_UNLOCK');
    setUnlockBanner('CONNECTION ESTABLISHED');
    setUnlockSub('NETWORK SYNCHRONIZATION // 5 OF 5 NODES LINKED');
    universeAudio.playSystemAwakening();

    if (reduced) {
      const tl = gsap.timeline({
        onComplete: () => {
          setUnlockBanner('');
          setUnlockSub('');
          setGameState('UNIVERSE_ACTIVE');
        },
      });
      tl.to(unlockAnimRef.current, { time: 1.5, duration: 0.6, ease: 'none' })
        .call(() => {
          setUnlockBanner('ALL SYSTEMS ONLINE');
          setUnlockSub('OPENING DIGITAL UNIVERSE');
        })
        .to(unlockAnimRef.current, { time: 5.5, duration: 0.8, ease: 'power1.inOut' });
      unlockTlRef.current = tl;
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setUnlockBanner('');
        setUnlockSub('');
        setGameState('UNIVERSE_ACTIVE');
      },
    });

    // 0.0s -> 0.8s: "CONNECTION ESTABLISHED"
    tl.to(unlockAnimRef.current, {
      time: 0.8,
      duration: 0.8,
      ease: 'none',
    })
      // 0.8s -> 1.5s: "ALL SYSTEMS ONLINE"
      .call(() => {
        setUnlockBanner('ALL SYSTEMS ONLINE');
        setUnlockSub('SYNCHRONIZING FIVE-DOMAIN NEURAL LATTICE');
      })
      .to(unlockAnimRef.current, {
        time: 1.5,
        duration: 0.7,
        ease: 'none',
      })
      // 1.5s -> 3.5s: THE DIGITAL CORE — ENERGY IMPLOSION
      .call(() => {
        setUnlockBanner('CONVERGING DIGITAL CORE');
        setUnlockSub('ENERGY IMPLOSION // FORMING SINGULARITY');
        universeAudio.playEnergyImplosion();
      })
      .to(unlockAnimRef.current, {
        time: 3.5,
        duration: 2.0,
        ease: 'none',
      })
      // 3.5s -> 5.5s: PORTAL ACTIVATION — CAMERA FLY-THROUGH
      .call(() => {
        setUnlockBanner('ENTERING DIGITAL UNIVERSE');
        setUnlockSub('DIMENSIONAL PORTAL ACTIVE');
        universeAudio.playPortalActivation();
      })
      .to(unlockAnimRef.current, {
        time: 5.5,
        duration: 2.0,
        ease: 'none',
      });

    unlockTlRef.current = tl;
  }, []);

  // Reset back to playable 5-node puzzle
  const resetToPuzzle = useCallback(() => {
    if (unlockTlRef.current) {
      unlockTlRef.current.kill();
      unlockTlRef.current = null;
    }
    universeAudio.stopAmbient();
    unlockTriggeredRef.current = false;
    unlockAnimRef.current.time = 0;
    setSyncedCount(0);
    setUnlockBanner('');
    setUnlockSub('');
    setGameState('PLAYING');
    setLastFact('Simulation reset. Move pointer, tap nodes, or use WASD to connect all 5 beacons.');
    setRunId((r) => r + 1);
  }, []);

  // Replay the 5.5s cinematic portal sequence from inside the unlocked universe
  const replayPortalSequence = useCallback(() => {
    if (unlockTlRef.current) {
      unlockTlRef.current.kill();
      unlockTlRef.current = null;
    }
    universeAudio.stopAmbient();
    unlockTriggeredRef.current = false;
    setSyncedCount(DOMAIN_NODES.length);
    triggerCinematicUnlock(DOMAIN_NODES[DOMAIN_NODES.length - 1]);
  }, [triggerCinematicUnlock]);

  // Secret keyboard easter egg ("asrar") + movement keys
  useEffect(() => {
    let buffer = '';
    const onDown = (e) => {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        document.activeElement?.closest('#scene-lab')
      ) {
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

  // Main Canvas Loop: renders both the 5-node puzzle (PLAYING) and the 3-stage 5.5s Cinematic Unlock (CINEMATIC_UNLOCK)
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
      const mode = gameStateRef.current;

      ctx.clearRect(0, 0, w, h);

      // =======================================================================
      // MODE A: CINEMATIC UNLOCK SEQUENCE (0.0s -> 5.5s)
      // =======================================================================
      if (mode === 'CINEMATIC_UNLOCK' || mode === 'COMPLETED') {
        const ut = unlockAnimRef.current.time; // 0 .. 5.5
        const cx = w * 0.5;
        const cy = h * 0.5;
        const minDim = Math.min(w, h);

        // Phase weights:
        // p1: 0.0 -> 1.5s (Network Synchronization)
        // p2: 1.5 -> 3.5s (Digital Core / Energy Implosion)
        // p3: 3.5 -> 5.5s (Portal Activation & Camera Fly-Through)
        const p1 = Math.min(1, Math.max(0, ut / 1.5));
        const p2 = Math.min(1, Math.max(0, (ut - 1.5) / 2.0));
        const p3 = Math.min(1, Math.max(0, (ut - 3.5) / 2.0));

        // 1) Surrounding environment darkens into deep cosmic space
        const bgAlpha = Math.min(0.97, 0.35 + p1 * 0.45 + p2 * 0.17);
        ctx.fillStyle = `rgba(5, 4, 10, ${bgAlpha})`;
        ctx.fillRect(0, 0, w, h);

        // Camera smooth push during Phase 1 & 2, then accelerated portal fly-through in Phase 3
        const camZoom = 1 + p1 * 0.12 + p2 * 0.18 + Math.pow(p3, 2.3) * 4.8;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(camZoom, camZoom);
        ctx.translate(-cx, -cy);

        // Compute dynamic node positions (converging smoothly to center during Phase 2: 1.5s..3.5s)
        const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        const conv = easeInOut(p2);
        const spiralAngle = conv * Math.PI * 1.65;

        const dynNodes = DOMAIN_NODES.map((n) => {
          const ox = n.rx * w - cx;
          const oy = n.ry * h - cy;
          const rScale = 1 - conv;
          const cosA = Math.cos(spiralAngle);
          const sinA = Math.sin(spiralAngle);
          const rx = (ox * cosA - oy * sinA) * rScale;
          const ry = (ox * sinA + oy * cosA) * rScale;
          return {
            ...n,
            x: cx + rx,
            y: cy + ry,
          };
        });

        // STAGE 1 (0–1.5s): Fifth node electrical shockwave & all-to-all glowing energy streams
        if (ut < 3.4) {
          const netAlpha = (1 - Math.pow(p2, 1.6)) * 0.9;
          // 5th node shockwave pulse
          const fn = unlockAnimRef.current.fifthNode;
          const fx = fn.rx * w;
          const fy = fn.ry * h;
          const shockR = p1 * minDim * 0.85;
          const shockAlpha = Math.max(0, (1 - p1) * 0.85);
          if (shockAlpha > 0.01) {
            ctx.strokeStyle = `rgba(192, 132, 252, ${shockAlpha})`;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(fx, fy, shockR, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Glowing purple-blue energy streams connecting every node pair + traveling pulses
          for (let i = 0; i < dynNodes.length; i++) {
            for (let j = i + 1; j < dynNodes.length; j++) {
              const a = dynNodes[i];
              const b = dynNodes[j];
              const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
              grad.addColorStop(0, `rgba(168, 85, 247, ${netAlpha * 0.78})`);
              grad.addColorStop(0.5, `rgba(83, 107, 255, ${netAlpha * 0.95})`);
              grad.addColorStop(1, `rgba(192, 132, 252, ${netAlpha * 0.78})`);

              ctx.strokeStyle = grad;
              ctx.lineWidth = 2.2;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();

              // Traveling electrical packet along each connection
              const packetT = (ut * 1.4 + (i + j) * 0.19) % 1;
              const px = a.x + (b.x - a.x) * packetT;
              const py = a.y + (b.y - a.y) * packetT;
              ctx.fillStyle = `rgba(255, 255, 255, ${netAlpha})`;
              ctx.beginPath();
              ctx.arc(px, py, 3.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Five synchronized light trails converging toward center during Phase 2
          if (p2 > 0.01) {
            dynNodes.forEach((n, idx) => {
              ctx.strokeStyle = n.color;
              ctx.lineWidth = 2.6;
              ctx.beginPath();
              for (let s = 0; s <= 16; s++) {
                const trailT = Math.max(0, conv - (s / 16) * 0.24);
                const tAng = easeInOut(trailT) * Math.PI * 1.65;
                const trScale = 1 - easeInOut(trailT);
                const ox = DOMAIN_NODES[idx].rx * w - cx;
                const oy = DOMAIN_NODES[idx].ry * h - cy;
                const tx = cx + (ox * Math.cos(tAng) - oy * Math.sin(tAng)) * trScale;
                const ty = cy + (ox * Math.sin(tAng) + oy * Math.cos(tAng)) * trScale;
                if (s === 0) ctx.moveTo(tx, ty);
                else ctx.lineTo(tx, ty);
              }
              ctx.stroke();
            });
          }

          // Illuminated nodes
          dynNodes.forEach((n) => {
            const halo = ctx.createRadialGradient(n.x, n.y, 2, n.x, n.y, 28);
            halo.addColorStop(0, '#FFFFFF');
            halo.addColorStop(0.35, n.color);
            halo.addColorStop(1, 'rgba(139, 92, 246, 0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 28, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // STAGE 2 (1.5–3.5s) & STAGE 3 (3.5–5.5s): DIGITAL CORE & DIMENSIONAL PORTAL
        const coreStrength = Math.min(1, p1 * 0.35 + p2 * 0.95);
        const portalRadius = minDim * (0.04 + p2 * 0.14 + Math.pow(p3, 1.55) * 0.58);

        // Central plasma bloom
        const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, portalRadius * 2.1);
        if (p3 > 0.1) {
          // Deep cosmic interior inside portal aperture
          coreGrad.addColorStop(0, '#070412');
          coreGrad.addColorStop(0.45, 'rgba(30, 14, 68, 0.94)');
          coreGrad.addColorStop(0.72, 'rgba(147, 51, 234, 0.85)');
          coreGrad.addColorStop(0.86, 'rgba(83, 107, 255, 0.55)');
          coreGrad.addColorStop(1, 'rgba(83, 107, 255, 0)');
        } else {
          coreGrad.addColorStop(0, `rgba(255, 255, 255, ${coreStrength})`);
          coreGrad.addColorStop(0.3, `rgba(192, 132, 252, ${coreStrength * 0.9})`);
          coreGrad.addColorStop(0.65, `rgba(83, 107, 255, ${coreStrength * 0.55})`);
          coreGrad.addColorStop(1, 'rgba(83, 107, 255, 0)');
        }
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, portalRadius * 2.1, 0, Math.PI * 2);
        ctx.fill();

        // Intersecting 3D Holographic Gyroscope Rings & Concentric Portal Rings
        const ringCount = p3 > 0 ? 6 : 4;
        for (let rIdx = 0; rIdx < ringCount; rIdx++) {
          const rRatio = 0.45 + rIdx * 0.22;
          const r = portalRadius * rRatio;
          const rot = ut * (rIdx % 2 === 0 ? 1.4 : -1.1) + rIdx * 0.8;
          const tilt = p3 > 0 ? 0.88 + 0.12 * Math.sin(ut + rIdx) : 0.38 + 0.45 * Math.abs(Math.sin(ut * 0.9 + rIdx));

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rot);
          ctx.strokeStyle =
            rIdx % 2 === 0
              ? `rgba(192, 132, 252, ${0.45 + coreStrength * 0.45})`
              : `rgba(83, 107, 255, ${0.45 + coreStrength * 0.45})`;
          ctx.lineWidth = rIdx === 3 ? 2.6 : 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * tilt, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Orbiting & Reactive Portal Particles
        const pts = unlockAnimRef.current.particles;
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i];
          const a = pt.angle + ut * pt.speed;
          const baseDist = pt.radius * minDim * (1 - p2 * 0.52 + p3 * 0.95);
          const px = cx + Math.cos(a) * baseDist;
          const py = cy + Math.sin(a) * baseDist * (0.72 + p3 * 0.28);

          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(px, py, pt.size * (0.8 + p3 * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        raf = requestAnimationFrame(step);
        return;
      }

      // =======================================================================
      // MODE B: NORMAL 5-NODE PUZZLE GAMEPLAY ('PLAYING')
      // =======================================================================
      const k = keysRef.current;
      let ax = dpadVecRef.current.x;
      let ay = dpadVecRef.current.y;
      if (k.w || k.arrowup) ay -= 1;
      if (k.s || k.arrowdown) ay += 1;
      if (k.a || k.arrowleft) ax -= 1;
      if (k.d || k.arrowright) ax += 1;

      const speed = overclock ? 0.74 : 0.5;
      if (ax !== 0 || ay !== 0) {
        const len = Math.hypot(ax, ay) || 1;
        state.vx = damp(state.vx, (ax / len) * speed, 9, dt);
        state.vy = damp(state.vy, (ay / len) * speed, 9, dt);
      } else if (pointerTargetRef.current.active) {
        const dx = pointerTargetRef.current.x - state.x;
        const dy = pointerTargetRef.current.y - state.y;
        const d = Math.hypot(dx, dy);
        if (d > 0.012) {
          state.vx = damp(state.vx, (dx / d) * Math.min(speed, d * 2.5), 10, dt);
          state.vy = damp(state.vy, (dy / d) * Math.min(speed, d * 2.5), 10, dt);
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
        if (state.trail.length > (overclock ? 42 : 24)) state.trail.shift();
      }

      // Collision / Docking check against all 5 domain nodes
      const hitRadius = w < 768 ? 44 : 38;
      for (const node of DOMAIN_NODES) {
        if (state.synced.has(node.id)) continue;
        const dist = Math.hypot((state.x - node.rx) * w, (state.y - node.ry) * h);
        if (dist < hitRadius) {
          state.synced.add(node.id);
          const count = state.synced.size;
          setSyncedCount(count);
          setLastFact(`${node.label} LINKED — ${node.fact}`);
          universeAudio.playNodeConnect(count);

          if (count === DOMAIN_NODES.length) {
            triggerCinematicUnlock(node);
          }
        }
      }

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
        ctx.strokeStyle = overclock ? 'rgba(255, 89, 36, 0.78)' : 'rgba(139, 92, 246, 0.82)';
        ctx.lineWidth = 2;
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

        if (isDone) {
          const glow = ctx.createRadialGradient(nx, ny, 2, nx, ny, 34);
          glow.addColorStop(0, node.color);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(nx, ny, 34, 0, Math.PI * 2);
          ctx.fill();
        }

        // Outer beacon ring
        ctx.strokeStyle = isDone ? node.color : 'rgba(245, 242, 235, 0.26)';
        ctx.lineWidth = isDone ? 2.2 : 1.2;
        ctx.beginPath();
        ctx.arc(nx, ny, (isDone ? 25 : 19) + pulse * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = isDone ? node.color : 'rgba(245, 242, 235, 0.42)';
        ctx.beginPath();
        ctx.arc(nx, ny, isDone ? 7.5 : 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Subtle pill backdrop for node text
        ctx.fillStyle = 'rgba(8, 8, 12, 0.72)';
        const textW = 78;
        ctx.fillRect(nx - textW / 2, ny - 38, textW, 18);

        // Text label
        ctx.fillStyle = isDone ? '#F5F2EB' : 'rgba(245, 242, 235, 0.72)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny - 26);
      }

      // Probe craft trail
      if (state.trail.length > 1) {
        for (let i = 1; i < state.trail.length; i++) {
          const a = i / state.trail.length;
          ctx.strokeStyle = overclock
            ? `rgba(255, 89, 36, ${a * 0.85})`
            : `rgba(139, 92, 246, ${a * 0.78})`;
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
      const angle =
        Math.hypot(state.vx, state.vy) > 0.01 ? Math.atan2(state.vy, state.vx) : Math.PI / 2;
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
  }, [runId, overclock, triggerCinematicUnlock]);

  const onCanvasPointer = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || gameStateRef.current !== 'PLAYING') return;
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    // Snap slightly toward nearest node when tapping/clicking near a beacon for effortless mobile touch
    let targetX = px;
    let targetY = py;
    for (const node of DOMAIN_NODES) {
      if (Math.hypot((px - node.rx) * r.width, (py - node.ry) * r.height) < 54) {
        targetX = node.rx;
        targetY = node.ry;
        break;
      }
    }
    pointerTargetRef.current = {
      active: true,
      x: targetX,
      y: targetY,
    };
  };

  const stopDpad = () => {
    dpadVecRef.current = { x: 0, y: 0 };
  };

  const isUnlocking = gameState === 'CINEMATIC_UNLOCK' || gameState === 'COMPLETED';
  const isUniverse = gameState === 'UNIVERSE_ACTIVE';

  return (
    <section
      id="scene-lab"
      className={`lab section ${isUnlocking ? 'is-unlocking' : ''} ${isUniverse ? 'is-universe-active' : ''}`}
      aria-label="Enter Asrar's Digital World"
    >
      {/* Full-bleed interactive probe & portal canvas (kept in DOM so QA and transitions stay seamless) */}
      <canvas
        ref={canvasRef}
        className="lab__canvas"
        tabIndex={0}
        aria-label="Enter Asrar's Digital World interactive probe canvas. Connect all 5 domain nodes to unlock Asrar's 3D Digital Universe."
        onPointerMove={onCanvasPointer}
        onPointerDown={onCanvasPointer}
        data-cursor="PILOT"
      />

      {/* ===================================================================
          CINEMATIC UNLOCK KINETIC TYPOGRAPHY OVERLAY (0.0s -> 5.5s)
          =================================================================== */}
      {isUnlocking && unlockBanner && (
        <div className="lab-unlock-hud" role="status" aria-live="assertive">
          <div className="lab-unlock-hud__kicker mono">{unlockSub}</div>
          <div key={unlockBanner} className="display lab-unlock-hud__headline">
            {unlockBanner}
          </div>
          <div className="lab-unlock-hud__bar">
            <span className="lab-unlock-hud__bar-fill" />
          </div>
        </div>
      )}

      {/* ===================================================================
          UNLOCKED 3D DIGITAL UNIVERSE (FIVE INTERACTIVE WORLDS)
          =================================================================== */}
      {isUniverse && (
        <DigitalUniverseView
          audioOn={audioOn}
          onToggleAudio={handleToggleAudio}
          onReplayUnlock={replayPortalSequence}
          onExitUniverse={resetToPuzzle}
          onOpenCase={onOpenCase}
        />
      )}

      {/* ===================================================================
          PUZZLE MODE HEADER & FOOTER CONTROLS (Fades out during Portal & Universe)
          =================================================================== */}
      <div className={`lab__header ${isUnlocking || isUniverse ? 'is-hidden' : ''}`}>
        <h2 className="display lab__title">
          <SplitHeadline lines={["ENTER ASRAR'S", 'DIGITAL WORLD.']} as="span" />
        </h2>
        <div className="lab__subline mono">
          <span>MOVE OR TAP BEACONS TO CONNECT THE SYSTEM</span>
          <span className="lab__counter">
            <strong style={{ color: syncedCount === 5 ? 'var(--signal)' : 'var(--cobalt)' }}>
              {syncedCount} / 5 CONNECTED
            </strong>
          </span>
        </div>
      </div>

      <div className={`lab__bottom-dock ${isUnlocking || isUniverse ? 'is-hidden' : ''}`}>
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
              onClick={handleToggleAudio}
            >
              AUDIO: {audioOn ? 'ON' : 'OFF'}
            </button>
            <HandPanToggle
              className="lab__ctrl-btn"
              onVector={(nx, ny, active) => {
                pointerTargetRef.current = { x: nx, y: ny, active };
              }}
            />
            <button type="button" className="lab__ctrl-btn" onClick={resetToPuzzle}>
              RESET EXPERIENCE
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
