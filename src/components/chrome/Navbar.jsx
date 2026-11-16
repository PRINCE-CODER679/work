import { Link, useLocation, useNavigate } from 'react-router-dom';
import { scrollToTarget } from '../../hooks/useSmoothScroll';
import './chrome.css';

/**
 * Fixed minimalist editorial HUD header.
 */
export function Navbar({ activeScene, onOpenMenu, onOpenPalette }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isVioletBar = activeScene === 'about' || activeScene === 'hero';

  const handleBrandClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      scrollToTarget(0);
    } else {
      navigate('/');
    }
  };

  return (
    <header className={`nav ${isVioletBar ? 'nav--violet' : ''}`} aria-label="Primary navigation">
      <Link
        to="/"
        onClick={handleBrandClick}
        className="nav__brand mono"
        data-cursor="HOME"
      >
        <span className="nav__mark" aria-hidden="true" />
        <span>ASRAR MULLA</span>
      </Link>

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

