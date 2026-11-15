import { useMemo, useState } from 'react';
import { TECH_CATEGORIES, TECH_NODES } from '../data/stack';
import { PROJECT_BY_SLUG } from '../data/projects';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { scrollToTarget } from '../hooks/useSmoothScroll';
import './sections.css';

/**
 * SCENE 08 — THE TOOLBOX (INTERACTIVE TECH CONSTELLATION)
 * Spatial technology graph connecting verified tools directly to the projects they power.
 */
export function TechUniverseSection({ onOpenCase }) {
  const [cat, setCat] = useState('all');
  const [selectedId, setSelectedId] = useState('fastapi');

  const selected = TECH_NODES.find((n) => n.id === selectedId) || TECH_NODES[0];

  // Build structural constellation links between nodes sharing projects
  const edges = useMemo(() => {
    const list = [];
    for (let i = 0; i < TECH_NODES.length; i++) {
      for (let j = i + 1; j < TECH_NODES.length; j++) {
        const a = TECH_NODES[i];
        const b = TECH_NODES[j];
        const shared = a.projects.filter((p) => b.projects.includes(p));
        if (shared.length >= 2 || (a.id === 'python' && b.cat === 'ai') || (a.id === 'react' && b.cat === 'frontend')) {
          list.push({ from: a, to: b, key: `${a.id}-${b.id}` });
        }
      }
    }
    return list;
  }, []);

  return (
    <section
      id="scene-toolbox"
      className="toolbox section"
      aria-label="Scene 08: Technology Universe"
    >
      <div className="toolbox__head">
        <div>
          <div className="mono section-index" style={{ marginBottom: '0.8rem' }}>
            <span>08 / VERIFIED SYSTEMS GRAPH</span>
          </div>
          <h2 className="display" style={{ fontSize: 'clamp(2.8rem, 7.6vw, 7.4rem)' }}>
            <SplitHeadline lines={['THE', 'TOOLBOX.']} as="span" />
          </h2>
        </div>

        <div className="toolbox__filters" role="group" aria-label="Filter technologies by category">
          {TECH_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`toolbox__filter ${cat === c.id ? 'is-active' : ''}`}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbox__grid">
        <div className="toolbox__map">
          <svg className="toolbox__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {edges.map((e) => {
              const hot = e.from.id === selected.id || e.to.id === selected.id;
              return (
                <line
                  key={e.key}
                  x1={e.from.x * 100}
                  y1={e.from.y * 100}
                  x2={e.to.x * 100}
                  y2={e.to.y * 100}
                  stroke={hot ? '#536BFF' : 'rgba(245, 242, 235, 0.14)'}
                  strokeWidth={hot ? 0.35 : 0.15}
                />
              );
            })}
          </svg>

          {TECH_NODES.map((node) => {
            const dimmed = cat !== 'all' && node.cat !== cat;
            const active = node.id === selected.id;
            return (
              <button
                key={node.id}
                type="button"
                className={`toolbox__node ${active ? 'is-active' : ''} ${dimmed ? 'is-dim' : ''}`}
                style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
                onMouseEnter={() => setSelectedId(node.id)}
                onFocus={() => setSelectedId(node.id)}
                onClick={() => setSelectedId(node.id)}
                data-cursor="NODE"
              >
                {node.name}
              </button>
            );
          })}
        </div>

        <aside className="toolbox__inspector" aria-live="polite">
          <div>
            <div className="mono muted">SELECTED NODE</div>
            <h3 className="display" style={{ fontSize: 'clamp(1.9rem, 3vw, 2.7rem)', marginTop: '0.5rem' }}>
              {selected.name}
            </h3>
            <p style={{ marginTop: '0.9rem', color: 'rgba(245, 242, 235, 0.8)' }}>
              {selected.note}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--hair)', paddingTop: '1rem' }}>
            <div className="mono muted" style={{ marginBottom: '0.7rem' }}>
              VERIFIED DEPLOYMENTS USING {selected.name.toUpperCase()}
            </div>
            {selected.projects.length === 0 ? (
              <p className="mono muted">Foundation algorithms &amp; DSA coursework (raambad-ilaaj).</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selected.projects.map((slug) => {
                  const p = PROJECT_BY_SLUG[slug];
                  if (!p) return null;
                  return (
                    <div
                      key={slug}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0.75rem',
                        border: '1px solid var(--hair)',
                        gap: '0.5rem',
                      }}
                    >
                      <button
                        type="button"
                        className="ulink mono"
                        onClick={() => scrollToTarget(`#scene-${slug}`)}
                      >
                        {p.index} · {p.title}
                      </button>
                      <button
                        type="button"
                        className="mono"
                        style={{ color: 'var(--cobalt)' }}
                        onClick={() => onOpenCase(slug)}
                      >
                        CASE →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

