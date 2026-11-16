import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AsrarWorld } from './AsrarWorld';
import { app } from '../utils/store';
import { detectTier, detectWebGL } from '../utils/device';

/**
 * Persistent full-viewport R3F Three.js digital-film canvas (z-index: 0).
 * Falls back gracefully to architectural CSS gradient + fallback portrait when WebGL is disabled.
 */
export function Stage3D({ wireframe = false }) {
  const initialWebgl = useMemo(() => {
    const ok = detectWebGL();
    app.webgl = ok;
    app.tier = detectTier();
    return ok;
  }, []);

  const [webglReady, setWebglReady] = useState(initialWebgl);

  useEffect(() => {
    document.body.classList.toggle('no-webgl', !webglReady);
    return () => document.body.classList.remove('no-webgl');
  }, [webglReady]);

  if (!webglReady) {
    return <div className="webgl-fallback" aria-hidden="true" />;
  }

  const maxDpr = app.tier === 'low' ? 1.25 : app.tier === 'mid' ? 1.5 : 1.65;

  return (
    <div
      className="stage3d"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-canvas)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, maxDpr]}
        camera={{ fov: 44, position: [0, 0.38, 5.65], near: 0.1, far: 65 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#080808', 1);
        }}
        onError={() => {
          app.webgl = false;
          setWebglReady(false);
        }}
      >
        <AsrarWorld wireframe={wireframe} tier={app.tier} />
      </Canvas>
    </div>
  );
}
