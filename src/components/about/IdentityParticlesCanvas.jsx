import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../animations/motion';

/**
 * Sparse subtle floating violet micro-particles & gentle ambient shimmer
 * over dark negative space around the portrait artwork (never covers facial features).
 */
export function IdentityParticlesCanvas({ inView = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const reduced = prefersReducedMotion();

    // Pre-seeded specks placed cleanly outside the center face rectangle
    const specks = Array.from({ length: 34 }, (_, i) => {
      const s1 = Math.sin(i * 19.37 + 1.1) * 43758.5453;
      const s2 = Math.sin(i * 73.19 + 4.7) * 43758.5453;
      const s3 = Math.sin(i * 41.83 + 2.3) * 43758.5453;
      const r1 = s1 - Math.floor(s1);
      const r2 = s2 - Math.floor(s2);
      const r3 = s3 - Math.floor(s3);

      // Keep particles in perimeter/ribbon zones, never across central face
      let nx = 0.04 + r1 * 0.44;
      let ny = 0.08 + r2 * 0.84;
      if (nx > 0.16 && nx < 0.4 && ny > 0.2 && ny < 0.62) {
        ny = ny < 0.41 ? ny * 0.4 : 0.72 + (ny - 0.41) * 0.8;
      }

      return {
        nx,
        ny,
        r: 0.6 + r3 * 1.2,
        speed: 0.2 + r3 * 0.45,
        phase: r1 * Math.PI * 2,
        bright: i % 5 === 0,
      };
    });

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      width = p.clientWidth || window.innerWidth;
      height = p.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const draw = (t) => {
      if (!width || !height) return;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      for (const s of specks) {
        const px = s.nx * width + Math.sin(t * s.speed + s.phase) * 5;
        const py = s.ny * height + Math.cos(t * s.speed * 0.8 + s.phase) * 4;
        const alpha = (0.28 + 0.42 * Math.sin(t * 1.25 + s.phase));

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.bright
          ? `rgba(243, 232, 255, ${alpha.toFixed(3)})`
          : `rgba(192, 132, 252, ${(alpha * 0.78).toFixed(3)})`;
        ctx.fill();
      }
      ctx.restore();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const start = performance.now();
    const tick = (now) => {
      const t = reduced ? 0 : (now - start) * 0.001;
      draw(t);
      if (!reduced && inView) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    draw(0);
    if (!reduced && inView) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [inView]);

  return <canvas ref={canvasRef} className="id-particles-canvas" aria-hidden="true" />;
}

