import { useRef } from 'react';
import { gsap, EASE, isTouch, prefersReducedMotion } from '../../animations/motion';

/**
 * Magnetic pull interaction wrapper for pill CTAs and architectural controls.
 * Disabled automatically on touch devices or reduced-motion.
 */
export function Magnetic({ children, strength = 0.28, className = '' }) {
  const ref = useRef(null);

  const onMove = (e) => {
    if (isTouch() || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    gsap.to(el, { x: dx, y: dy, duration: 0.45, ease: EASE.ui });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: EASE.elastic });
  };

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={className}
      style={{ display: 'inline-flex' }}
    >
      {children}
    </span>
  );
}

