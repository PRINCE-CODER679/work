import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PROFILE } from '../../data/profile';
import { PROJECTS } from '../../data/projects';
import { scrollToTarget } from '../../hooks/useSmoothScroll';
import './chrome.css';

const MENU_ITEMS = [
  { label: 'INDEX', target: '#scene-hero', desc: 'Volumetric portrait sculpture, orbital lattice & exhibition entrance.', accent: '#536BFF', thumb: null },
  { label: 'IDENTITY', target: '#scene-about', desc: 'The human behind the code — AI & Data Science, Software & Creative Engineering.', accent: '#A855F7', thumb: null },
  { label: 'WORK', target: '#scene-work-intro', desc: 'SpendSense AI, SignSense AI, MediKiosk & DEVTALKS.', accent: '#536BFF', thumb: PROJECTS[1].screens[0].src },
  { label: 'TOOLBOX', target: '#scene-toolbox', desc: 'Interactive spatial constellation of verified engineering tools.', accent: '#536BFF', thumb: null },
  { label: 'DIGITAL WORLD', target: '#scene-lab', desc: "Enter Asrar's Digital World — interactive WebGL exploration.", accent: '#FF5924', thumb: null },
  { label: 'CONTACT', target: '#scene-contact', desc: 'Have an impossible idea? Let’s build it.', accent: '#FF5924', thumb: null },
];

export function FullscreenMenu({ open, onClose }) {
  const [hovered, setHovered] = useState(MENU_ITEMS[2]);
  const closeBtnRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const jumpTo = (target) => {
    onClose();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToTarget(target), 260);
    } else {
      setTimeout(() => scrollToTarget(target), 120);
    }
  };

  return (
    <div
      className={`fs-menu ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation menu"
      aria-hidden={!open}
    >
      <div
        className="fs-menu__glow"
        style={{
          background: `radial-gradient(60% 60% at 75% 50%, ${hovered.accent}33, transparent 70%)`,
        }}
      />

      <div className="fs-menu__head">
        <span className="mono muted">EXHIBITION DIRECTORY // ASRAR MULLA</span>
        <button
          ref={closeBtnRef}
          type="button"
          className="fs-menu__close"
          onClick={onClose}
          data-cursor="CLOSE"
        >
          CLOSE [ESC]
        </button>
      </div>

      <div className="fs-menu__body">
        <nav aria-label="Exhibition sections">
          <ul className="fs-menu__list">
            {MENU_ITEMS.map((item) => (
              <li key={item.label} className="fs-menu__item">
                <button
                  type="button"
                  className="fs-menu__link"
                  onMouseEnter={() => setHovered(item)}
                  onFocus={() => setHovered(item)}
                  onClick={() => jumpTo(item.target)}
                  data-cursor="JUMP"
                >
                  <span className="fs-menu__label">{item.label}</span>
                  <span className="mono muted fs-menu__arrow" aria-hidden="true">↗</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <aside className="fs-menu__preview" aria-live="polite">
          <div className="mono muted">SECTOR PREVIEW</div>
          <div className="fs-menu__preview-title">{hovered.label}</div>
          <p>{hovered.desc}</p>
          {hovered.thumb ? (
            <div className="fs-menu__preview-thumb">
              <img src={hovered.thumb} alt={`${hovered.label} preview`} loading="lazy" />
            </div>
          ) : (
            <div className="mono" style={{ paddingTop: '1rem', borderTop: '1px solid var(--hair)', color: hovered.accent }}>
              ACTIVE LAYER // READY
            </div>
          )}
        </aside>
      </div>

      <div className="fs-menu__foot mono">
        <span>{PROFILE.institution}</span>
        <div className="fs-menu__socials">
          <a href={PROFILE.links.github} target="_blank" rel="noreferrer" className="ulink">
            GITHUB
          </a>
          <a href={PROFILE.links.linkedin} target="_blank" rel="noreferrer" className="ulink">
            LINKEDIN
          </a>
          <a href={`mailto:${PROFILE.links.email}`} className="ulink">
            {PROFILE.links.email.toUpperCase()}
          </a>
        </div>
      </div>
    </div>
  );
}

