import { PROFILE } from '../data/profile';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import './sections.css';

/**
 * SCENE 11 — CURRENT DIRECTION (#F3F0E8 Cream Breath)
 */
export function DirectionSection() {
  return (
    <section
      id="scene-direction"
      className="direction section"
      aria-label="Scene 11: Current Direction"
    >
      <div className="mono section-index" style={{ marginBottom: '1rem' }}>
        <span>CURRENT VECTOR</span>
      </div>

      <h2 className="display" style={{ fontSize: 'clamp(2.8rem, 8vw, 8.2rem)', lineHeight: 0.85 }}>
        <SplitHeadline lines={['CURRENTLY', 'BUILDING', 'THE NEXT THING.']} as="span" />
      </h2>

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

