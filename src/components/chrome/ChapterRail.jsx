import { scrollToTarget } from '../../hooks/useSmoothScroll';
import './chrome.css';

const CHAPTERS = [
  { id: 'scene-hero', label: 'INDEX', match: 'hero' },
  { id: 'scene-about', label: 'ABOUT', match: 'about' },
  { id: 'scene-work-intro', label: 'WORK', match: 'work' },
  { id: 'scene-toolbox', label: 'TOOLBOX', match: 'toolbox' },
  { id: 'scene-dsa', label: 'DSA', match: 'dsa' },
  { id: 'scene-lab', label: 'DIGITAL WORLD', match: 'lab' },
  { id: 'scene-contact', label: 'CONTACT', match: 'contact' },
];

/**
 * Right-edge digital-film chapter dot rail for spatial progress orientation & direct jumps.
 */
export function ChapterRail({ activeScene }) {
  return (
    <nav className="chapter-rail" aria-label="Film chapter progress">
      {CHAPTERS.map((ch) => {
        const active =
          activeScene === ch.match ||
          (ch.match === 'lab' && (activeScene === 'dsa' || activeScene === 'direction'));
        return (
          <button
            key={ch.id}
            type="button"
            className={`chapter-rail__dot ${active ? 'is-active' : ''}`}
            onClick={() => scrollToTarget(`#${ch.id}`)}
            aria-label={`Jump to ${ch.label}`}
            title={ch.label}
            data-cursor="CHAPTER"
          >
            <span className="chapter-rail__pip" />
            <span className="chapter-rail__tag mono">{ch.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

