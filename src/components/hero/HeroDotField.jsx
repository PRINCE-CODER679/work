import { useEffect, useRef } from 'react';
import { damp, prefersReducedMotion } from '../../animations/motion';
import { app, pointer, scenes } from '../../utils/store';

const GLYPHS = ['·', ':', '+', '·', '·', '·'];

/**
 * Full-bleed obsidian computational dot-matrix backdrop inspired by Razorpay AI Builders.
 * Responds softly to pointer proximity with cobalt highlights and sleeps when Hero exits viewport.
 */
export function HeroDotField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    const smoothPtr = { x: 0.68, y: 0.44 };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth || window.innerWidth;
      h = parent.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
    };

    resize();
    window.addEventListener('resize', resize);

    const drawFrame = (time) => {
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const exitFade = Math.max(0, 1 - scenes.hero.progress * 1.15);
      if (exitFade <= 0.01) return;

      const gap = w < 640 ? 22 : 24;
      const cols = Math.ceil(w / gap);
      const rows = Math.ceil(h / gap);

      const mx = smoothPtr.x * w;
      const my = smoothPtr.y * h;
      const lensR = w < 640 ? 150 : 250;

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let r = 0; r < rows; r++) {
        const y = r * gap + gap * 0.5;
        for (let c = 0; c < cols; c++) {
          const x = c * gap + gap * 0.5;
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.hypot(dx, dy);
          const wave = reduced ? 0 : Math.sin(c * 0.28 + r * 0.22 - time * 1.1) * 0.5 + 0.5;

          const near = Math.max(0, 1 - dist / lensR);
          const alpha = (0.055 + wave * 0.045 + near * 0.34) * exitFade;

          if (near > 0.14) {
            ctx.fillStyle = `rgba(83, 107, 255, ${alpha.toFixed(3)})`;
            const gIdx = (c + r) % GLYPHS.length;
            ctx.fillText(GLYPHS[gIdx], x, y);
          } else {
            ctx.fillStyle = `rgba(245, 242, 235, ${alpha.toFixed(3)})`;
            ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
          }
        }
      }
    };

    if (reduced) {
      drawFrame(0);
      return () => window.removeEventListener('resize', resize);
    }

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (scenes.hero.progress < 0.99) {
        if (pointer.active && !app.touch) {
          const tx = Math.max(0, Math.min(1, pointer.px / Math.max(1, w)));
          const ty = Math.max(0, Math.min(1, pointer.py / Math.max(1, h)));
          smoothPtr.x = damp(smoothPtr.x, tx, 8, dt);
          smoothPtr.y = damp(smoothPtr.y, ty, 8, dt);
        } else {
          smoothPtr.x = 0.68 + Math.sin(now * 0.0005) * 0.08;
          smoothPtr.y = 0.44 + Math.cos(now * 0.0004) * 0.06;
        }
        drawFrame(now * 0.001);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__dotfield" aria-hidden="true" />;
}

