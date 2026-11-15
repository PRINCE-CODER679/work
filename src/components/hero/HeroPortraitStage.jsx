import { useEffect, useRef, useState } from 'react';
import { damp, lerp, prefersReducedMotion } from '../../animations/motion';
import { app, scenes } from '../../utils/store';

const ASCII_RAMP = ' .:-=+*#%@';
const GRID_COLS = 38;
const GRID_ROWS = 48;

/**
 * Hero Portrait Installation — Razorpay-inspired layered studio visual.
 * Combines masked entrance reveal, multi-plane pointer parallax, interactive studio key-light,
 * pre-sampled cobalt/ivory ASCII telemetry aperture on hover, and scroll-linked ASCII dissolve.
 */
export function HeroPortraitStage({ ready }) {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const imgWrapRef = useRef(null);
  const bracketsRef = useRef(null);
  const badgeRef = useRef(null);
  const blockRef = useRef(null);
  const asciiCanvasRef = useRef(null);

  const lumaGridRef = useRef(null);
  const localPtr = useRef({ tx: 0.5, ty: 0.35, x: 0.5, y: 0.35, hover: 0, targetHover: 0 });
  const bootScanRef = useRef(prefersReducedMotion() ? 1 : 0);

  const [revealed, setRevealed] = useState(prefersReducedMotion());
  const [scanLux, setScanLux] = useState('0.84');

  // Trigger masked aperture entrance once Scene 00 completes
  useEffect(() => {
    if (!ready) return;
    if (prefersReducedMotion()) {
      setRevealed(true);
      bootScanRef.current = 1;
      return;
    }
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, [ready]);

  // Pre-sample portrait luminance once on load (zero per-frame getImageData readback cost)
  const handleImgLoad = (e) => {
    const img = e.currentTarget;
    if (!img || !img.naturalWidth) return;
    try {
      const off = document.createElement('canvas');
      off.width = GRID_COLS;
      off.height = GRID_ROWS;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;

      // Match zoomed waist-up editorial framing (~22%..73% vertical span of 576x1024 portrait)
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const cropW = nw * 0.72;
      const cropH = Math.min(nh - 1, cropW * (GRID_ROWS / GRID_COLS));
      const sx = (nw - cropW) * 0.48;
      const sy = Math.max(0, Math.min(nh - cropH, nh * 0.22));

      octx.drawImage(img, sx, sy, cropW, cropH, 0, 0, GRID_COLS, GRID_ROWS);
      const { data } = octx.getImageData(0, 0, GRID_COLS, GRID_ROWS);
      const grid = new Array(GRID_COLS * GRID_ROWS);

      for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const cIdx = Math.min(ASCII_RAMP.length - 1, Math.floor(lum * (ASCII_RAMP.length - 1)));
        grid[i] = { lum, char: ASCII_RAMP[cIdx] };
      }
      lumaGridRef.current = grid;
    } catch {
      // Safe fallback if canvas readback fails
    }
  };

  // Smooth interactive parallax, lighting sweep, ASCII lens, and scroll-exit transition
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let raf = 0;
    let last = performance.now();
    let luxTick = 0;

    const renderAscii = (scrollP, scanProgress) => {
      const canvas = asciiCanvasRef.current;
      const grid = lumaGridRef.current;
      if (!canvas || !grid) return;

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!cw || !ch) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const targetW = Math.round(cw * dpr);
      const targetH = Math.round(ch * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const hoverStrength = localPtr.current.hover;
      const scrollDissolve = Math.max(0, Math.min(1, (scrollP - 0.15) / 0.65));
      const waveActive = scanProgress > 0.01 && scanProgress < 0.99;

      if (hoverStrength <= 0.02 && scrollDissolve <= 0.02 && !waveActive) return;

      const cellW = cw / GRID_COLS;
      const cellH = ch / GRID_ROWS;
      const px = localPtr.current.x * cw;
      const py = localPtr.current.y * ch;
      const lensRadius = Math.min(cw, ch) * 0.34;

      ctx.font = `${Math.max(8, Math.round(cellH * 0.92))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < GRID_ROWS; r++) {
        const cy = (r + 0.5) * cellH;
        const rowNorm = r / GRID_ROWS;

        // Boot scan band weight
        let scanWeight = 0;
        if (waveActive) {
          const distBand = Math.abs(rowNorm - scanProgress);
          if (distBand < 0.18) {
            scanWeight = (1 - distBand / 0.18) * 0.92;
          }
        }

        // Scroll dissolve reveals bottom-to-top matrix silhouette
        const scrollWeight =
          scrollDissolve > 0.02
            ? Math.max(0, Math.min(1, (scrollDissolve * 1.25 - (1 - rowNorm) * 0.55))) * 0.85
            : 0;

        for (let c = 0; c < GRID_COLS; c++) {
          const cx = (c + 0.5) * cellW;
          const cell = grid[r * GRID_COLS + c];
          if (!cell || cell.lum < 0.08) continue;

          let hoverWeight = 0;
          if (hoverStrength > 0.02) {
            const dist = Math.hypot(cx - px, cy - py);
            if (dist < lensRadius) {
              hoverWeight = Math.pow(1 - dist / lensRadius, 1.45) * hoverStrength * 0.9;
            }
          }

          const alpha = Math.min(0.95, Math.max(scanWeight, scrollWeight, hoverWeight));
          if (alpha <= 0.04) continue;

          const isEdge = cell.lum > 0.24 && cell.lum < 0.72;
          ctx.fillStyle = isEdge
            ? `rgba(83, 107, 255, ${(alpha * 0.98).toFixed(2)})`
            : `rgba(245, 242, 235, ${(alpha * (0.45 + cell.lum * 0.52)).toFixed(2)})`;
          ctx.fillText(cell.char, cx, cy);
        }
      }
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const sp = scenes.hero.progress;
      if (sp < 0.99) {
        if (revealed && bootScanRef.current < 1) {
          bootScanRef.current = Math.min(1, bootScanRef.current + dt * 1.65);
        }

        const p = localPtr.current;
        p.x = damp(p.x, p.tx, 10, dt);
        p.y = damp(p.y, p.ty, 10, dt);
        p.hover = damp(p.hover, p.targetHover, 8, dt);

        if (!reduced && frameRef.current) {
          const dx = p.x - 0.5;
          const dy = p.y - 0.5;
          const tiltY = app.touch ? 0 : dx * 5.2;
          const tiltX = app.touch ? 0 : -dy * 4.4;
          const scrollScale = 1 + sp * 0.06;
          const scrollY = -sp * 28;

          frameRef.current.style.transform = `perspective(1200px) translate3d(0, ${scrollY.toFixed(1)}px, 0) scale(${scrollScale.toFixed(3)}) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
          frameRef.current.style.setProperty('--hx', `${(p.x * 100).toFixed(1)}%`);
          frameRef.current.style.setProperty('--hy', `${(p.y * 100).toFixed(1)}%`);
          frameRef.current.style.setProperty('--hactive', p.hover.toFixed(3));
        }

        if (!reduced && imgWrapRef.current) {
          const scrollFade = Math.max(0.25, 1 - sp * 0.72);
          imgWrapRef.current.style.filter = `contrast(1.1) saturate(0.86) brightness(${(0.95 * scrollFade).toFixed(2)})`;
        }

        if (!reduced && bracketsRef.current) {
          const dx = p.x - 0.5;
          const dy = p.y - 0.5;
          bracketsRef.current.style.transform = `translate3d(${(dx * 16).toFixed(1)}px, ${(dy * 12).toFixed(1)}px, 0)`;
        }

        if (!reduced && badgeRef.current) {
          const dx = p.x - 0.5;
          const dy = p.y - 0.5;
          badgeRef.current.style.transform = `translate3d(${(-dx * 14).toFixed(1)}px, ${(-dy * 10).toFixed(1)}px, 0)`;
        }

        if (!reduced && blockRef.current) {
          const dx = p.x - 0.5;
          const dy = p.y - 0.5;
          blockRef.current.style.transform = `translate3d(${(dx * 22).toFixed(1)}px, ${(dy * 18).toFixed(1)}px, 0)`;
        }

        renderAscii(sp, bootScanRef.current);

        // Update live luminance HUD sparingly
        luxTick++;
        if (luxTick % 12 === 0 && lumaGridRef.current && p.hover > 0.08) {
          const gc = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(p.x * GRID_COLS)));
          const gr = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(p.y * GRID_ROWS)));
          const sample = lumaGridRef.current[gr * GRID_COLS + gc];
          if (sample) setScanLux(sample.lum.toFixed(2));
        }
      }

      raf = requestAnimationFrame(tick);
    };

    if (!reduced) {
      raf = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(raf);
  }, [revealed]);

  const onPointerMove = (e) => {
    if (app.touch || prefersReducedMotion() || !rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    localPtr.current.tx = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width)));
    localPtr.current.ty = Math.max(0, Math.min(1, (e.clientY - r.top) / Math.max(1, r.height)));
    localPtr.current.targetHover = 1;
  };

  const onPointerLeave = () => {
    localPtr.current.targetHover = 0;
    localPtr.current.tx = 0.5;
    localPtr.current.ty = 0.35;
  };

  return (
    <div
      ref={rootRef}
      className={`hero-portrait ${revealed ? 'is-revealed' : ''}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      data-cursor="INSPECT"
    >
      {/* Subtle studio ambient backdrop behind figure */}
      <div className="hero-portrait__halo" aria-hidden="true" />

      {/* Outer perspective & mouse tilt container */}
      <div ref={frameRef} className="hero-portrait__stage">
        {/* Masked feathered obsidian portrait envelope */}
        <div ref={imgWrapRef} className="hero-portrait__mask">
          <img
            src="/assets/hero/asrar-hero.jpg"
            alt="Asrar Mulla — AI & Data Science Engineer and Creative Developer"
            className="hero-portrait__img"
            width={576}
            height={1024}
            loading="eager"
            decoding="sync"
            onLoad={handleImgLoad}
          />
          <div className="hero-portrait__vignette" aria-hidden="true" />
        </div>

        {/* Interactive cursor studio spotlight + electric cobalt edge rim */}
        <div className="hero-portrait__light" aria-hidden="true" />

        {/* Dual-layer Razorpay-style ASCII telemetry reveal lens + scroll dissolve */}
        <canvas ref={asciiCanvasRef} className="hero-portrait__ascii" aria-hidden="true" />

        {/* Subtle scanning optical hairline */}
        <div className="hero-portrait__scanline" aria-hidden="true" />
      </div>

      {/* Depth Layer +1: Precision CAD L-brackets & Razorpay-inspired cobalt glyph square */}
      <div ref={bracketsRef} className="hero-portrait__brackets" aria-hidden="true">
        <span className="hero-portrait__corner hero-portrait__corner--tl" />
        <span className="hero-portrait__corner hero-portrait__corner--tr" />
        <span className="hero-portrait__corner hero-portrait__corner--bl" />
        <span className="hero-portrait__corner hero-portrait__corner--br" />
      </div>

      <div ref={blockRef} className="hero-portrait__cobalt-chip mono" aria-hidden="true">
        <span>::+</span>
        <span>01</span>
      </div>

      <div ref={badgeRef} className="hero-portrait__tag mono">
        <span className="hero-portrait__pulse" aria-hidden="true" />
        <span>FIG. 01 // ASRAR MULLA · LUX {scanLux}</span>
      </div>
    </div>
  );
}

