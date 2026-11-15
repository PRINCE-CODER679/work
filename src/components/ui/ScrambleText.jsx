import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../animations/motion';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/_[]#*+';

/**
 * Razorpay-inspired telemetry character scramble reveal.
 * Resolves cleanly left-to-right; skips straight to final text under reduced motion.
 */
export function ScrambleText({
  text,
  trigger = true,
  duration = 750,
  delay = 0,
  className = '',
  as: Tag = 'span',
}) {
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? text : text));
  const rafRef = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    if (prefersReducedMotion()) {
      setDisplay(text);
      return;
    }

    let start = 0;
    let timerId = 0;

    const run = (now) => {
      if (!start) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const lockedCount = Math.floor(t * text.length);

      let out = '';
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === ' ' || ch === '\n' || ch === '·' || ch === '/') {
          out += ch;
        } else if (i < lockedCount) {
          out += ch;
        } else {
          out += GLYPHS[Math.floor((Math.random() * GLYPHS.length))];
        }
      }
      setDisplay(out);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(run);
      } else {
        setDisplay(text);
      }
    };

    timerId = window.setTimeout(() => {
      rafRef.current = requestAnimationFrame(run);
    }, delay);

    return () => {
      clearTimeout(timerId);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, trigger, duration, delay]);

  return <Tag className={className}>{display}</Tag>;
}

