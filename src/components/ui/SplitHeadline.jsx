import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, EASE, DUR, STAGGER, prefersReducedMotion } from '../../animations/motion';

/**
 * Masked editorial line-by-line baseline extrusion reveal.
 * Lines slide up from behind crisp overflow masks on scroll entry, IntersectionObserver,
 * or immediate trigger — guaranteeing zero headlines ever remain invisible on fast jumps.
 */
export function SplitHeadline({
  lines = [],
  className = '',
  lineClassName = '',
  as: Tag = 'h2',
  immediate = false,
  delay = 0,
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;
    const targets = el.querySelectorAll('[data-split-inner]');
    if (!targets.length) return;

    let done = false;
    const ctx = gsap.context(() => {
      gsap.set(targets, { yPercent: 110, opacity: 0.001 });

      const reveal = () => {
        if (done) return;
        done = true;
        gsap.to(targets, {
          yPercent: 0,
          opacity: 1,
          duration: DUR.type,
          stagger: STAGGER.lines,
          ease: EASE.type,
          delay: immediate ? delay : 0,
          clearProps: 'transform,opacity',
          onComplete: () => {
            el.classList.add('split-revealed');
          },
        });
      };

      if (immediate) {
        reveal();
        return;
      }

      ScrollTrigger.create({
        trigger: el,
        start: 'top 94%',
        onEnter: reveal,
        onEnterBack: reveal,
      });

      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            reveal();
            io.disconnect();
          }
        },
        { threshold: 0.01, rootMargin: '80px 0px' }
      );
      io.observe(el);

      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.96 && rect.bottom >= 0) {
        reveal();
      }
    }, rootRef);

    return () => ctx.revert();
  }, [immediate, delay]);

  return (
    <Tag
      ref={rootRef}
      className={className}
      style={Tag === 'span' ? { display: 'block' } : undefined}
    >
      {lines.map((line, idx) => (
        <span key={idx} className={`line-mask ${lineClassName}`}>
          <span data-split-inner="">{line}</span>
        </span>
      ))}
    </Tag>
  );
}
