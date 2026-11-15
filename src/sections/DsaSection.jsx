import { useEffect, useState } from 'react';
import { DSA_MODULES } from '../data/dsa';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import './sections.css';

/**
 * SCENE 09 — DSA & PROBLEM SOLVING
 * Grounded directly in Asrar's verified C/Python practical implementations (`raambad-ilaaj`).
 */
export function DsaSection() {
  const [modIdx, setModIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);

  const mod = DSA_MODULES[modIdx];

  const maxSteps =
    mod.id === 'binary-search'
      ? 4
      : mod.id === 'stack'
      ? 6
      : mod.id === 'linked-list'
      ? mod.nodes.length
      : mod.id === 'bst'
      ? mod.values.length
      : mod.graph.nodes.length;

  useEffect(() => {
    setStep(1);
    setAuto(false);
  }, [modIdx]);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      setStep((s) => (s >= maxSteps ? 1 : s + 1));
    }, 950);
    return () => clearInterval(id);
  }, [auto, maxSteps]);

  const renderVisualization = () => {
    if (mod.id === 'binary-search') {
      const steps = [
        { low: 0, mid: 4, high: 9 },
        { low: 5, mid: 7, high: 9 },
        { low: 5, mid: 6, high: 6 },
        { low: 6, mid: 6, high: 6, found: true },
      ];
      const cur = steps[Math.min(step - 1, steps.length - 1)] || steps[0];
      return (
        <div style={{ width: '100%' }}>
          <div className="mono muted" style={{ marginBottom: '0.8rem', textAlign: 'center' }}>
            TARGET = {mod.target} · LOW[{cur.low}] · MID[{cur.mid}] · HIGH[{cur.high}]
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.45rem' }}>
            {mod.initialData.map((val, i) => {
              const inWin = i >= cur.low && i <= cur.high;
              const isMid = i === cur.mid;
              return (
                <div
                  key={val}
                  className={`dsa__cell ${isMid && cur.found ? 'is-found' : isMid ? 'is-hi' : ''}`}
                  style={{ opacity: inWin ? 1 : 0.28 }}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (mod.id === 'stack') {
      const trace = [
        { char: 'A', stack: '', out: 'A' },
        { char: '+', stack: '+', out: 'A' },
        { char: 'B', stack: '+', out: 'AB' },
        { char: '*', stack: '+*', out: 'AB' },
        { char: 'C', stack: '+*', out: 'ABC' },
        { char: 'POP', stack: '', out: 'ABC*+' },
      ];
      const cur = trace[Math.min(step - 1, trace.length - 1)] || trace[0];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            <div className="mono muted">TOKEN</div>
            <div className="dsa__cell is-hi" style={{ marginTop: '0.4rem' }}>{cur.char}</div>
          </div>
          <div>
            <div className="mono muted">OP STACK</div>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem' }}>
              {(cur.stack || '∅').split('').map((c, idx) => (
                <div key={idx} className="dsa__cell">{c}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="mono muted">POSTFIX OUT</div>
            <div className="dsa__cell is-found" style={{ marginTop: '0.4rem' }}>{cur.out}</div>
          </div>
        </div>
      );
    }

    if (mod.id === 'linked-list') {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          {mod.nodes.slice(0, Math.max(1, step)).map((label, idx) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div className={`dsa__cell ${idx === step - 1 ? 'is-found' : 'is-hi'}`}>{label}</div>
              <span className="mono muted">→</span>
            </div>
          ))}
          <div className="dsa__cell">NULL</div>
        </div>
      );
    }

    if (mod.id === 'bst') {
      const visible = mod.values.slice(0, Math.max(1, step));
      return (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div className="mono muted" style={{ marginBottom: '0.7rem' }}>
            INSERTED KEYS ({visible.length}/{mod.values.length}) · ROOT = 50
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
            {visible.map((v, i) => (
              <div key={v} className={`dsa__cell ${i === visible.length - 1 ? 'is-found' : 'is-hi'}`}>
                {v}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Graph BFS
    const visitedOrder = mod.graph.nodes.slice(0, Math.max(1, step)).map((n) => n.id);
    return (
      <svg viewBox="0 0 100 100" style={{ width: '100%', maxWidth: '300px', height: '165px' }}>
        {mod.graph.edges.map(([a, b]) => {
          const na = mod.graph.nodes.find((n) => n.id === a);
          const nb = mod.graph.nodes.find((n) => n.id === b);
          const lit = visitedOrder.includes(a) && visitedOrder.includes(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={lit ? '#536BFF' : 'rgba(245,242,235,0.2)'}
              strokeWidth={lit ? 1.5 : 0.7}
            />
          );
        })}
        {mod.graph.nodes.map((n) => {
          const seen = visitedOrder.includes(n.id);
          const head = visitedOrder[visitedOrder.length - 1] === n.id;
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={7}
                fill={head ? '#FF5924' : seen ? '#536BFF' : '#141418'}
                stroke="#F5F2EB"
                strokeWidth="0.8"
              />
              <text
                x={n.x}
                y={n.y + 1.8}
                textAnchor="middle"
                fontSize="5"
                fill={head ? '#080808' : '#F5F2EB'}
                fontFamily="JetBrains Mono, monospace"
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <section
      id="scene-dsa"
      className="dsa section"
      aria-label="Scene 09: Algorithms & Problem Solving"
    >
      <div className="mono section-index" style={{ marginBottom: '0.8rem' }}>
        <span>ALGORITHMS &amp; DATA STRUCTURES</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem' }}>
        <h2 className="display" style={{ fontSize: 'clamp(2.6rem, 6.8vw, 6.8rem)' }}>
          <SplitHeadline lines={['CORE', 'ALGORITHMS.']} as="span" />
        </h2>
        <p style={{ maxWidth: '28rem', color: 'rgba(245,242,235,0.75)' }}>
          Interactive execution traces paired directly with verified C and Python implementations from the{' '}
          <a
            href="https://github.com/PRINCE-CODER679/raambad-ilaaj"
            target="_blank"
            rel="noreferrer"
            className="ulink"
            style={{ color: 'var(--signal)' }}
          >
            raambad-ilaaj
          </a>{' '}
          repository.
        </p>
      </div>

      <div className="dsa__layout">
        <div className="dsa__tabs" role="tablist" aria-label="Verified DSA modules">
          {DSA_MODULES.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={modIdx === idx}
              className={`dsa__tab ${modIdx === idx ? 'is-active' : ''}`}
              onClick={() => setModIdx(idx)}
            >
              <div>
                <div className="mono" style={{ color: modIdx === idx ? 'var(--signal)' : 'var(--paper)' }}>
                  {m.index} · {m.name}
                </div>
                <div className="mono muted" style={{ fontSize: '0.64rem', marginTop: '0.2rem' }}>
                  {m.repoFile}
                </div>
              </div>
              <span className="mono muted">{m.complexity.split('·')[0]}</span>
            </button>
          ))}
        </div>

        <div className="dsa__stage">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem' }}>
            <div>
              <div className="mono" style={{ color: 'var(--cobalt)' }}>{mod.complexity}</div>
              <p style={{ marginTop: '0.25rem', fontSize: '0.92rem' }}>{mod.summary}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <button
                type="button"
                className="lab__btn"
                onClick={() => setStep((s) => (s >= maxSteps ? 1 : s + 1))}
              >
                STEP ({step}/{maxSteps})
              </button>
              <button
                type="button"
                className={`lab__btn ${auto ? 'is-on' : ''}`}
                onClick={() => setAuto((a) => !a)}
              >
                {auto ? 'PAUSE' : 'AUTO'}
              </button>
              <button type="button" className="lab__btn" onClick={() => { setAuto(false); setStep(1); }}>
                RESET
              </button>
            </div>
          </div>

          <div className="dsa__viz">{renderVisualization()}</div>

          <pre className="dsa__code">
            <code>{mod.code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

