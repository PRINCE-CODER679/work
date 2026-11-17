import { useEffect, useRef } from 'react';
import { PROFILE } from '../data/profile';
import { gsap, prefersReducedMotion } from '../animations/motion';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import './sections.css';

/**
 * SCENE 11 — CURRENT DIRECTION (#F3F0E8 Luminous Paper Transition)
 */
export function DirectionSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 769px)', () => {
        const items = el.querySelectorAll('.direction__item');
        const head = el.querySelector('.direction__head');

        if (head) {
          gsap.fromTo(
            head,
            { y: 24 },
            {
              y: -14,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        if (items.length) {
          gsap.fromTo(
            items,
            { y: 36, opacity: 0.25 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.08,
              ease: 'none',
              scrollTrigger: {
                trigger: el.querySelector('.direction__list') || el,
                start: 'top 92%',
                end: 'top 44%',
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });

      mm.add('(max-width: 768px)', () => {
        const items = el.querySelectorAll('.direction__item');
        if (items.length) {
          gsap.fromTo(
            items,
            { y: 18, opacity: 0.45 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.06,
              ease: 'none',
              scrollTrigger: {
                trigger: el.querySelector('.direction__list') || el,
                start: 'top 94%',
                end: 'top 52%',
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="scene-direction"
      ref={sectionRef}
      className="direction section"
      aria-label="Scene 11: Current Direction"
    >
      <div className="direction__head">
        <div className="mono section-index" style={{ marginBottom: '1rem' }}>
          <span>CURRENT VECTOR</span>
        </div>

        <h2 className="display" style={{ fontSize: 'clamp(2.2rem, 6.8vw, 7.2rem)', lineHeight: 0.94 }}>
          <SplitHeadline lines={['CURRENTLY', 'BUILDING', 'THE NEXT THING.']} as="span" />
        </h2>
      </div>

      <div className="direction__list">
        {PROFILE.focusAreas.map((item) => (
          <div key={item.index} className="direction__item">
            <div className="mono" style={{ color: 'var(--signal)', marginBottom: '0.6rem' }}>
              {item.index}
            </div>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase' }}>
              {item.title}
            </h3>
            <p style={{ marginTop: '0.55rem', color: 'rgba(10, 10, 10, 0.78)', fontSize: '0.96rem' }}>
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

