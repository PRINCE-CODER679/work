import { useEffect, useRef, useState } from 'react';
import { damp, isTouch, prefersReducedMotion } from '../../animations/motion';
import { pointer } from '../../utils/store';
import './chrome.css';

/**
 * Subtle desktop-only damped cursor with contextual `[data-cursor]` labels
 * (`VIEW`, `OPEN`, `DRAG`, `EXPLORE`, `NEXT`, `PLAY`).
 */
export function CustomCursor() {
  const rootRef = useRef(null);
  const [label, setLabel] = useState('');
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return;
    document.body.classList.add('has-cursor');

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let last = performance.now();
    let raf = 0;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (pointer.active) {
        cx = damp(cx, pointer.px, 16, dt);
        cy = damp(cy, pointer.py, 16, dt);
        if (rootRef.current) {
          rootRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onOver = (e) => {
      setVisible(true);
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      const labelled = target.closest('[data-cursor]');
      const interactive = target.closest('a, button, [role="button"], input, textarea');
      setLabel(labelled ? labelled.getAttribute('data-cursor') || '' : '');
      setHover(Boolean(labelled || interactive));
    };

    const onLeave = () => setVisible(false);

    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointermove', () => setVisible(true), { passive: true, once: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      document.body.classList.remove('has-cursor');
      cancelAnimationFrame(raf);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`cursor ${visible ? 'is-visible' : ''} ${hover ? 'is-hover' : ''} ${label ? 'has-label' : ''}`}
    >
      <div className="cursor__dot" />
      <div className="cursor__ring">{label}</div>
    </div>
  );
}

