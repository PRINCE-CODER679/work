import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToTarget } from '../../hooks/useSmoothScroll';
import './chrome.css';

/**
 * ToyFight-inspired developer command terminal (`Press /` or `Ctrl+K`).
 * Supports scene jumps, direct case study routes, and architectural/wireframe visual modes.
 */
export function CommandPalette({ open, onClose, blueprint, onToggleBlueprint, wireframe, onToggleWireframe }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const commands = [
    { id: 'home', label: 'home', desc: 'Jump to Hero', tag: 'HERO', run: () => go('#scene-hero') },
    { id: 'about', label: 'about', desc: 'Jump to About Identity', tag: 'ABOUT', run: () => go('#scene-about') },
    { id: 'work', label: 'work', desc: 'Jump to Selected Work', tag: 'WORK', run: () => go('#scene-work-intro') },
    { id: 'spendsense', label: 'spendsense', desc: 'Open SpendSense AI Case Study', tag: 'PROJECT', run: () => nav('/work/spendsense') },
    { id: 'signsense', label: 'signsense', desc: 'Open SignSense AI Case Study', tag: 'PROJECT', run: () => nav('/work/signsense') },
    { id: 'medikiosk', label: 'medikiosk', desc: 'Open MediKiosk Case Study', tag: 'PROJECT', run: () => nav('/work/medikiosk') },
    { id: 'devtalks', label: 'devtalks', desc: "Open DEVTALKS '26 Case Study", tag: 'PROJECT', run: () => nav('/work/devtalks') },
    { id: 'stack', label: 'toolbox', desc: 'Jump to Systems Graph & Toolbox', tag: 'SYSTEMS', run: () => go('#scene-toolbox') },
    { id: 'lab', label: 'lab', desc: "Jump to Enter Asrar's Digital World", tag: 'WORLD', run: () => go('#scene-lab') },
    { id: 'contact', label: 'contact', desc: 'Jump to Closing Loop & Contact', tag: 'CONTACT', run: () => go('#scene-contact') },
    { id: 'grid', label: 'blueprint', desc: `Toggle architectural coordinate grid (${blueprint ? 'ON' : 'OFF'})`, tag: 'MODE', run: () => { onClose(); onToggleBlueprint(); } },
    { id: 'wireframe', label: 'wireframe', desc: `Toggle 3D WebGL wireframe inspection (${wireframe ? 'ON' : 'OFF'})`, tag: '3D MODE', run: () => { onClose(); onToggleWireframe(); } },
    { id: 'reset', label: 'reset', desc: 'Reset visual modes & return to Hero', tag: 'SYS', run: () => { if (blueprint) onToggleBlueprint(); if (wireframe) onToggleWireframe(); go('#scene-hero'); } },
  ];

  function go(selector) {
    onClose();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToTarget(selector), 260);
    } else {
      scrollToTarget(selector);
    }
  }

  function nav(path) {
    onClose();
    navigate(path);
  }

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const filtered = commands.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.label.includes(q) || c.desc.toLowerCase().includes(q);
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (filtered[0]) filtered[0].run();
  };

  return (
    <div
      className="cmd-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Developer command terminal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="cmd-drawer">
        <div className="cmd-drawer__head">
          <span className="mono">ASRAR // COMMAND TERMINAL</span>
          <button type="button" className="mono muted" onClick={onClose}>
            ESC
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="cmd-drawer__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type command (work, lab, wireframe, blueprint...)"
            aria-label="Command filter"
          />
        </form>

        <div className="cmd-drawer__list">
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              type="button"
              className="cmd-item"
              onClick={cmd.run}
            >
              <div>
                <div className="mono" style={{ color: 'var(--paper)' }}>/ {cmd.label}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{cmd.desc}</div>
              </div>
              <span className="cmd-item__tag">{cmd.tag}</span>
            </button>
          ))}
        </div>

        <div className="mono muted" style={{ borderTop: '1px solid var(--hair)', paddingTop: '0.8rem' }}>
          TIP: PRESS [/] ANYWHERE TO TOGGLE · ENTER TO EXECUTE
        </div>
      </div>
    </div>
  );
}

