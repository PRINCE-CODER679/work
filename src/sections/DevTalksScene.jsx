import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PROJECT_BY_SLUG } from '../data/projects';
import { POSTER_VERTEX, POSTER_FRAGMENT } from '../shaders/coreShader';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Magnetic } from '../components/ui/Magnetic';
import { app } from '../utils/store';
import { prefersReducedMotion } from '../animations/motion';
import './sections.css';

/**
 * GLSL WebGL interactive poster distortion surface for DEVTALKS '26.
 * Falls back cleanly to a sharp static <img> if WebGL is disabled or reduced-motion is set.
 */
function PosterDistortCanvas({ src, alt }) {
  const hostRef = useRef(null);
  const [fallback, setFallback] = useState(!app.webgl || prefersReducedMotion());

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !app.webgl || prefersReducedMotion()) {
      setFallback(true);
      return;
    }

    let renderer;
    let scene;
    let camera;
    let mat;
    let raf = 0;
    let destroyed = false;

    try {
      const w = host.clientWidth || 720;
      const h = host.clientHeight || 450;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h);
      host.innerHTML = '';
      host.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const loader = new THREE.TextureLoader();
      const tex = loader.load(src, () => {
        if (!destroyed) renderer.render(scene, camera);
      });
      tex.minFilter = THREE.LinearFilter;

      mat = new THREE.ShaderMaterial({
        vertexShader: POSTER_VERTEX,
        fragmentShader: POSTER_FRAGMENT,
        uniforms: {
          uTexture: { value: tex },
          uPointer: { value: new THREE.Vector2(0.5, 0.5) },
          uHover: { value: 0 },
          uTime: { value: 0 },
        },
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      scene.add(mesh);

      let targetHover = 0;
      const onMove = (e) => {
        const r = host.getBoundingClientRect();
        mat.uniforms.uPointer.value.set(
          (e.clientX - r.left) / r.width,
          1 - (e.clientY - r.top) / r.height
        );
        targetHover = 1;
      };
      const onLeave = () => {
        targetHover = 0;
      };
      const onResize = () => {
        const nw = host.clientWidth || 720;
        const nh = host.clientHeight || 450;
        renderer.setSize(nw, nh);
      };

      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      const loop = () => {
        if (destroyed) return;
        mat.uniforms.uTime.value = clock.getElapsedTime();
        mat.uniforms.uHover.value += (targetHover - mat.uniforms.uHover.value) * 0.1;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      return () => {
        destroyed = true;
        cancelAnimationFrame(raf);
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('resize', onResize);
        tex.dispose();
        mat.dispose();
        renderer.dispose();
      };
    } catch (e) {
      setFallback(true);
    }
  }, [src]);

  if (fallback) {
    return <img src={src} alt={alt} loading="lazy" />;
  }
  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} aria-label={alt} />;
}

/**
 * SCENE 07 — PROJECT 04: DEVTALKS '26
 * Editorial crimson & noir poster wall with GLSL pointer wave distortion
 * and flippable confidential keynote speaker dossier posters.
 */
export function DevTalksScene({ onOpenCase }) {
  const project = PROJECT_BY_SLUG.devtalks;
  const [screenIdx, setScreenIdx] = useState(1);
  const [flipped, setFlipped] = useState({ 0: false, 1: false, 2: false });

  const toggleFlip = (idx) => {
    setFlipped((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <article
      id="scene-devtalks"
      className="proj-scene dt-scene section"
      aria-label="Project 04: DEVTALKS 26"
    >
      <div className="proj-scene__head">
        <div className="proj-scene__title-col">
          <div className="mono section-index" style={{ color: 'var(--dt-red)' }}>
            <span>{project.category}</span>
          </div>
          <h3 className="display proj-scene__title">
            <SplitHeadline lines={['DEV', "TALKS '26."]} as="span" />
          </h3>
        </div>

        <div className="proj-scene__summary-col">
          <p>{project.summary}</p>
          <div className="proj-stack">
            {project.stack.map((tech) => (
              <span key={tech} className="proj-stack__chip" style={{ borderColor: 'rgba(232,33,28,0.35)' }}>
                {tech}
              </span>
            ))}
          </div>
          <div className="proj-scene__actions">
            <Magnetic>
              <button type="button" className="btn" onClick={() => onOpenCase(project.slug)} data-cursor="OPEN">
                <span>CASE STUDY</span>
                <span className="btn__arrow" aria-hidden="true">↗</span>
              </button>
            </Magnetic>
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn btn--ghost" data-cursor="LIVE">
              <span>VIEW LIVE PROJECT</span>
            </a>
            <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn btn--ghost" data-cursor="CODE">
              <span>VIEW SOURCE</span>
            </a>
          </div>
        </div>
      </div>

      <div className="dt-wall">
        <div className="dt-poster-gl" data-cursor="WARP">
          <PosterDistortCanvas
            src={project.screens[screenIdx].src}
            alt={project.screens[screenIdx].caption}
          />
          <div className="dt-poster-gl__hud mono">
            <span>{project.screens[screenIdx].caption}</span>
            <button
              type="button"
              className="ulink"
              style={{ color: 'var(--dt-red)', whiteSpace: 'nowrap' }}
              onClick={() => setScreenIdx((i) => (i + 1) % project.screens.length)}
            >
              NEXT POSTER ({screenIdx + 1}/{project.screens.length})
            </button>
          </div>
        </div>

        <div className="dt-dossiers">
          <div className="mono muted">
            CONFIDENTIAL SPEAKER DOSSIERS · CLICK TO FLIP CLUES
          </div>
          {project.dossiers.map((card, idx) => {
            const isOpen = !!flipped[idx];
            return (
              <button
                key={card.caseId}
                type="button"
                className={`dt-card ${isOpen ? 'is-flipped' : ''}`}
                onClick={() => toggleFlip(idx)}
                data-cursor={isOpen ? 'FRONT' : 'FLIP'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ color: 'var(--dt-red)' }}>{card.caseId}</span>
                  <span className="mono muted">{isOpen ? 'CLUES UNLOCKED' : `HINT: ${card.hint}`}</span>
                </div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.45rem', fontWeight: 800, marginTop: '0.45rem' }}>
                  {card.title}
                </div>
                {!isOpen ? (
                  <p style={{ marginTop: '0.45rem', fontSize: '0.9rem', color: 'rgba(245,242,235,0.78)' }}>
                    &ldquo;{card.quote}&rdquo;
                  </p>
                ) : (
                  <ul style={{ marginTop: '0.6rem', display: 'grid', gap: '0.3rem', fontSize: '0.86rem' }}>
                    {card.clues.map((c) => (
                      <li key={c}>→ {c}</li>
                    ))}
                  </ul>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

