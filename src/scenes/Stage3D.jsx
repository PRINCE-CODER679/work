import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroSculpture } from './HeroSculpture';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { detectTier, detectWebGL } from '../utils/device';
import { app } from '../utils/store';

/**
 * Persistent fullscreen WebGL architectural stage.
 * Automatically degrades cleanly if WebGL is unavailable or context is lost.
 */
export function Stage3D({ wireframe = false }) {
  const [supported, setSupported] = useState(() => detectWebGL());
  const [tier] = useState(() => detectTier());

  useEffect(() => {
    app.webgl = supported;
    app.tier = tier;
  }, [supported, tier]);

  if (!supported) {
    return <div className="webgl-fallback" aria-hidden="true" />;
  }

  const maxDpr = tier === 'low' ? 1.15 : tier === 'mid' ? 1.4 : 1.75;

  return (
    <ErrorBoundary fallback={<div className="webgl-fallback" aria-hidden="true" />}>
      <div
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
          camera={{ fov: 44, near: 0.1, far: 60, position: [0, 0.14, 7.6] }}
          gl={{
            antialias: tier !== 'low',
            powerPreference: 'high-performance',
            alpha: true,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener(
              'webglcontextlost',
              (e) => {
                e.preventDefault();
                setSupported(false);
              },
              false
            );
          }}
        >
          <Suspense fallback={null}>
            <HeroSculpture wireframe={wireframe} tier={tier} />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}

