import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { pointer } from '../../utils/store';
import { scrollToTarget } from '../../hooks/useSmoothScroll';
import './chrome.css';

/**
 * Fixed minimalist editorial HUD header.
 */
export function Navbar({ activeScene = '01 / HERO', onOpenMenu, onOpenPalette }) {
  const [coords, setCoords] = useState('X:000 Y:000');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let raf = 0;
    let tick = 0;
    const loop = () => {
      tick++;
      if (tick % 4 === 0 && pointer.active) {
        const x = String(Math.round(pointer.px)).padStart(4, '0');
        const y = String(Math.round(pointer.py)).padStart(4, '0');
        setCoords(`X:${x} Y:${y}`);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleBrandClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      scrollToTarget(0);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="nav" aria-label="Primary navigation">
      <Link
        to="/"
        onClick={handleBrandClick}
        className="nav__brand mono"
        data-cursor="HOME"
      >
        <span className="nav__mark" aria-hidden="true" />
        <span>ASRAR MULLA</span>
      </Link>

      <div className="nav__status mono">
        <span>{activeScene}</span>
        <span className="muted" aria-hidden="true">{coords}</span>
      </div>

      <div className="nav__right">
        <button
          type="button"
          className="nav__pill mono nav__cmd-btn"
          onClick={onOpenPalette}
          aria-label="Open command terminal (shortcut slash)"
          data-cursor="CMD"
        >
          <span>PRESS /</span>
        </button>

        <button
          type="button"
          className="nav__menu-btn"
          onClick={onOpenMenu}
          aria-label="Open full-screen menu"
          data-cursor="MENU"
        >
          <span>MENU</span>
          <span className="nav__burger" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>
  );
}

