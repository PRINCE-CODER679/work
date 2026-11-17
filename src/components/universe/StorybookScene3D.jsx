 import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { damp, lerp, prefersReducedMotion } from '../../animations/motion';
import { JOURNEY_MARKERS } from './bookChaptersData';
import {
  BOOK_DIMS,
  buildTurnSheetIndexArrays,
  createBookLeafGeometry,
  sampleBookPagePoint,
  updateDeformedPageGeometry,
} from './bookGeometry';
import {
  getLeatherBumpTexture,
  getSpreadTextures,
  getTableSurfaceTexture,
} from './bookPageTextures';

useGLTF.preload('/assets/universe/asrar-storybook.glb');

let cachedAmberSprite = null;
function getAmberGlowSprite() {
  if (cachedAmberSprite) return cachedAmberSprite;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 4, 128, 128, 128);
  g.addColorStop(0, 'rgba(255, 240, 200, 1)');
  g.addColorStop(0.22, 'rgba(255, 174, 72, 0.85)');
  g.addColorStop(0.55, 'rgba(220, 108, 28, 0.28)');
  g.addColorStop(1, 'rgba(220, 108, 28, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedAmberSprite = tex;
  return tex;
}

// Upright nearly front-facing gallery display angle (~76.8 deg backward tilt so pages face camera directly)
const BOOK_POS = [0, -0.04, 0];
const BOOK_ROT = [1.34, -0.04, 0];

/**
 * Interactive 3D Storybook World inside R3F `<Canvas>`.
 */
function StorybookWorld({
  turnStateRef,
  currentChapterId,
  targetChapterId,
  portraitFocusSide = 'right',
  cornerHover,
  orbitOffsetRef,
  markerElsRef,
  pageRegionRef,
  onStartCornerDrag,
  onPortraitModeChange,
}) {
  const { scene: baseBookScene } = useGLTF('/assets/universe/asrar-storybook.glb');
  const { camera, size } = useThree();

  const bookGroupRef = useRef(null);
  const turningFrontMeshRef = useRef(null);
  const turningBackMeshRef = useRef(null);
  const sparksRef = useRef(null);
  const spineGlowMatRef = useRef(null);
  const rightMatRef = useRef(null);
  const leftMatRef = useRef(null);
  const frontTurnMatRef = useRef(null);
  const backTurnMatRef = useRef(null);

  const [fontsTick, setFontsTick] = useState(0);

  useEffect(() => {
    let alive = true;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (alive) setFontsTick((t) => t + 1);
      });
    }
    return () => {
      alive = false;
    };
  }, []);

  // Clone base .glb asset once and apply pebbled leather bump texture
  const clonedBaseBook = useMemo(() => {
    const clone = baseBookScene.clone(true);
    const leatherBump = getLeatherBumpTexture();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material?.name === 'HardcoverLeather') {
          child.material = child.material.clone();
          child.material.bumpMap = leatherBump;
          child.material.bumpScale = 0.015;
        }
      }
    });
    return clone;
  }, [baseBookScene]);

  const leftLeafGeo = useMemo(() => createBookLeafGeometry('left', 0.002), []);
  const rightLeafGeo = useMemo(() => createBookLeafGeometry('right', 0.002), []);

  const turnSheetIndices = useMemo(() => buildTurnSheetIndexArrays(), []);
  const turnGeoFront = useMemo(() => createBookLeafGeometry('right', 0.008), []);
  const turnGeoBack = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', turnGeoFront.attributes.position);
    g.setAttribute('normal', turnGeoFront.attributes.normal);
    g.setAttribute('uv', turnGeoFront.attributes.uv);
    g.setIndex(turnSheetIndices.forward);
    return g;
  }, [turnGeoFront, turnSheetIndices]);

  // Lazy spread texture loading for current + target chapter to minimize mobile GPU memory
  const curSpreadTex = useMemo(() => {
    void fontsTick;
    return getSpreadTextures(currentChapterId);
  }, [currentChapterId, fontsTick]);

  const tgtSpreadTex = useMemo(() => {
    void fontsTick;
    return getSpreadTextures(targetChapterId);
  }, [targetChapterId, fontsTick]);

  const tableTex = useMemo(() => getTableSurfaceTexture(), []);
  const amberSprite = useMemo(() => getAmberGlowSprite(), []);

  // Dusk sparkles drifting gently upward in upright book local space (`-z` is UP)
  const sparkPositions = useMemo(() => {
    const count = 34;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.35) * 3.8;
      arr[i * 3 + 1] = 0.32 + Math.random() * 0.48;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    return arr;
  }, []);

  const lastDirRef = useRef('forward');
  const smoothCornerPeek = useRef(0);
  const lastPortraitFlagRef = useRef(null);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const tmpPtA = useMemo(() => new THREE.Vector3(), []);
  const tmpPtB = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(0.06, -0.05, 0.05), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const reduced = prefersReducedMotion();
    const ts = turnStateRef.current;

    const aspect = size.width / Math.max(1, size.height);
    const isPortraitSinglePage = size.width < 768 || aspect < 0.98;
    if (lastPortraitFlagRef.current !== isPortraitSinglePage) {
      lastPortraitFlagRef.current = isPortraitSinglePage;
      onPortraitModeChange?.(isPortraitSinglePage);
    }

    // 1. Subtle interactive corner peel peek or live 3D deformed page turn
    const targetPeek = cornerHover && !ts.active && !reduced ? 0.085 : 0;
    smoothCornerPeek.current = damp(smoothCornerPeek.current, targetPeek, 8, dt);

    const activeProgress = ts.active ? ts.progress : smoothCornerPeek.current;
    const activeDir = ts.active ? ts.direction : 'forward';
    const isDeforming = activeProgress > 0.002;

    if (turningFrontMeshRef.current && turningBackMeshRef.current) {
      turningFrontMeshRef.current.visible = isDeforming;
      turningBackMeshRef.current.visible = isDeforming;

      if (isDeforming) {
        if (lastDirRef.current !== activeDir) {
          const idxArr = activeDir === 'backward' ? turnSheetIndices.backward : turnSheetIndices.forward;
          turnGeoFront.setIndex(idxArr);
          turnGeoBack.setIndex(idxArr);
          lastDirRef.current = activeDir;
        }
        updateDeformedPageGeometry(turnGeoFront, activeProgress, activeDir, 0.01);
        turnGeoBack.attributes.position.needsUpdate = true;
        turnGeoBack.attributes.normal.needsUpdate = true;
        turnGeoBack.attributes.uv.needsUpdate = true;
      }
    }

    if (leftMatRef.current && rightMatRef.current && frontTurnMatRef.current && backTurnMatRef.current) {
      if (ts.active && activeDir === 'forward') {
        leftMatRef.current.map = curSpreadTex.left;
        rightMatRef.current.map = tgtSpreadTex.right;
        frontTurnMatRef.current.map = curSpreadTex.right;
        backTurnMatRef.current.map = tgtSpreadTex.left;
      } else if (ts.active && activeDir === 'backward') {
        leftMatRef.current.map = tgtSpreadTex.left;
        rightMatRef.current.map = curSpreadTex.right;
        frontTurnMatRef.current.map = curSpreadTex.left;
        backTurnMatRef.current.map = tgtSpreadTex.right;
      } else {
        leftMatRef.current.map = curSpreadTex.left;
        rightMatRef.current.map = isDeforming ? tgtSpreadTex.right : curSpreadTex.right;
        frontTurnMatRef.current.map = curSpreadTex.right;
        backTurnMatRef.current.map = tgtSpreadTex.left;
      }
      leftMatRef.current.needsUpdate = true;
      rightMatRef.current.needsUpdate = true;
      frontTurnMatRef.current.needsUpdate = true;
      backTurnMatRef.current.needsUpdate = true;
    }

    // 2. Gentle golden spine glow & ambient spark drift along page vertical (`-z` local)
    if (spineGlowMatRef.current) {
      spineGlowMatRef.current.opacity = reduced ? 0.72 : 0.68 + Math.sin(t * 2.1) * 0.08;
    }

    if (sparksRef.current && !reduced) {
      const posArr = sparksRef.current.geometry.attributes.position.array;
      for (let i = 0; i < posArr.length / 3; i++) {
        posArr[i * 3 + 2] -= dt * (0.045 + (i % 4) * 0.015);
        if (posArr[i * 3 + 2] < -1.35) posArr[i * 3 + 2] = 1.25;
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Analytical Frontal Camera Orientation + Portrait Single-Page Focus Mode
    const tanHalfV = 0.30573; // tan(34deg / 2)
    const orbit = orbitOffsetRef.current;
    orbit.azimuth = damp(orbit.azimuth, orbit.targetAzimuth, 5.5, dt);
    orbit.polar = damp(orbit.polar, orbit.targetPolar, 5.5, dt);

    let desiredLookX = 0.04;
    let desiredLookY = -0.05;
    let baseDist;
    const turnPull = ts.active ? Math.sin(Math.min(1, Math.max(0, ts.progress)) * Math.PI) : 0;

    if (isPortraitSinglePage) {
      // Focus tightly onto a single readable upright 3D page (spine seam + fore-edge depth visible)
      const isWidePortrait = size.width >= 768;
      const sideTargetX = portraitFocusSide === 'left' ? -1.12 : 1.18;
      desiredLookX = lerp(sideTargetX, 0.1, turnPull * 0.65);
      // Offset tablet camera target upward slightly so the 3D book clears `.sb-header` cleanly
      desiredLookY = isWidePortrait ? 0.30 : -0.02;

      const focusHalfW = isWidePortrait ? 1.54 : 1.38;
      const focusHalfH = isWidePortrait ? 2.18 : 1.78;
      const restDist = Math.max(focusHalfW / (tanHalfV * aspect), focusHalfH / tanHalfV);
      // Zoom out subtly mid-turn so the complete 3D curled page turn over the spine stays cleanly framed
      baseDist = lerp(restDist, restDist + 1.45, turnPull);
    } else {
      // Desktop & wide tablets: frame balanced 2-page upright open book cleanly between header & dock
      const isShortLandscape = size.height < 520;
      desiredLookY = isShortLandscape ? 0.24 : 0.25;
      const bookHalfW = 2.52;
      const bookHalfH = 1.62;
      const vMult = isShortLandscape ? 1.68 : 1.48;
      const hMult = 1.24;
      baseDist = Math.max((bookHalfH * vMult) / tanHalfV, (bookHalfW * hMult) / (tanHalfV * aspect));
    }

    lookTarget.x = damp(lookTarget.x, desiredLookX, 6, dt);
    lookTarget.y = damp(lookTarget.y, desiredLookY, 6, dt);

    const az = -0.03 + orbit.azimuth;
    const el = 0.04 + orbit.polar;
    const camX = lookTarget.x + Math.sin(az) * Math.cos(el) * baseDist;
    const camY = lookTarget.y + Math.sin(el) * baseDist;
    const camZ = Math.cos(az) * Math.cos(el) * baseDist;

    camera.position.x = damp(camera.position.x, camX, 6.2, dt);
    camera.position.y = damp(camera.position.y, camY, 6.2, dt);
    camera.position.z = damp(camera.position.z, camZ, 6.2, dt);
    camera.lookAt(lookTarget);
    camera.updateMatrixWorld();

    // 4. Project real 3D page coordinates directly onto interactive DOM pins (zero React state update per frame)
    if (bookGroupRef.current) {
      bookGroupRef.current.updateMatrixWorld(true);
      const projectSurface = (side, u, v, outVec) => {
        sampleBookPagePoint(side, u, v, outVec, 0.016);
        outVec.applyMatrix4(bookGroupRef.current.matrixWorld);
        outVec.project(camera);
        return {
          x: (outVec.x * 0.5 + 0.5) * size.width,
          y: (-outVec.y * 0.5 + 0.5) * size.height,
        };
      };

      for (const m of JOURNEY_MARKERS) {
        const elRef = markerElsRef.current[m.id];
        if (elRef) {
          const uCoord = isPortraitSinglePage && m.mobileU != null ? m.mobileU : m.u;
          const vCoord = isPortraitSinglePage && m.mobileV != null ? m.mobileV : m.v;
          const pt2 = projectSurface('right', uCoord, vCoord, tmpVec);
          elRef.style.transform = `translate3d(${pt2.x.toFixed(1)}px, ${pt2.y.toFixed(1)}px, 0) translate(-50%, calc(-100% + 4px))`;
        }
      }

      if (pageRegionRef.current) {
        const tl = projectSurface('right', 0.072, -0.68, tmpPtA);
        const br = projectSurface('right', 0.928, 0.74, tmpPtB);
        const w = Math.max(175, br.x - tl.x);
        const h = Math.max(150, br.y - tl.y);
        pageRegionRef.current.style.left = `${tl.x.toFixed(1)}px`;
        pageRegionRef.current.style.top = `${tl.y.toFixed(1)}px`;
        pageRegionRef.current.style.width = `${w.toFixed(1)}px`;
        pageRegionRef.current.style.height = `${h.toFixed(1)}px`;
      }
    }
  });

  const isCompactDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      <color attach="background" args={['#060507']} />
      <fog attach="fog" args={['#060507', 11, 28]} />

      {/* Local Procedural Softbox Studio Reflections (zero remote HDR fetch) */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[1.5, 4.5, 6]}
          rotation={[0.3, 0, 0]}
          scale={[7, 4, 1]}
          color="#f3eadf"
        />
        <Lightformer
          form="rect"
          intensity={1.35}
          position={[-5, 2.2, 5]}
          rotation={[0, Math.PI / 3, 0]}
          scale={[5, 3, 1]}
          color="#b8c6de"
        />
        <Lightformer
          form="rect"
          intensity={1.15}
          position={[0, -1.8, 4.5]}
          rotation={[-0.4, 0, 0]}
          scale={[5, 1.8, 1]}
          color="#ff9f45"
        />
      </Environment>

      {/* Atmospheric Upright Gallery Key & Warm Spine Pocket Rig */}
      <ambientLight intensity={0.54} color="#dedce4" />
      <directionalLight
        position={[2.8, 3.6, 7.2]}
        intensity={1.68}
        color="#f2ece2"
        castShadow={!isCompactDevice}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={16}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-3.5}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-4.2, 2.2, 5.5]} intensity={1.12} color="#92a4c2" />
      <pointLight position={[0, -1.25, 1.45]} color="#ff9d42" intensity={5.2} distance={4.2} decay={1.8} />
      <pointLight position={[0.45, 0.25, 1.85]} color="#ffb76b" intensity={2.2} distance={5.0} decay={1.8} />

      {/* Subtle Dark Reflective Gallery Pedestal Plinth Under the Upright Book */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
        <planeGeometry args={[32, 24]} />
        <MeshReflectorMaterial
          map={tableTex}
          blur={isCompactDevice ? [120, 40] : [240, 70]}
          resolution={isCompactDevice ? 256 : 512}
          mixBlur={0.92}
          mixStrength={1.8}
          roughness={0.46}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#100f12"
          metalness={0.72}
        />
      </mesh>

      {/* Subtle Backstage Smoke Halo Behind Book Silhouette */}
      <sprite position={[0, 0.2, -2.2]} scale={[8.4, 5.2, 1]}>
        <spriteMaterial
          map={amberSprite}
          color="#464552"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </sprite>

      {/* Main Physical Upright 3D Storybook Asset + Live Deformable Pages */}
      <group ref={bookGroupRef} position={BOOK_POS} rotation={BOOK_ROT}>
        <primitive object={clonedBaseBook} />

        {/* Spine bottom warm amber pocket flare (stays aligned with upright bottom spine) */}
        <sprite position={[0, 0.14, BOOK_DIMS.pageH * 0.5 + 0.08]} scale={[1.35, 0.55, 1]}>
          <spriteMaterial
            ref={spineGlowMatRef}
            map={amberSprite}
            transparent
            opacity={0.72}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {/* Resting Top Left Curved Leaf */}
        <mesh
          geometry={leftLeafGeo}
          receiveShadow={!isCompactDevice}
          castShadow={!isCompactDevice}
          onPointerDown={(e) => {
            if (e.uv && e.uv.x < 0.38) {
              e.stopPropagation();
              onStartCornerDrag(e.nativeEvent, 'backward');
            }
          }}
        >
          <meshStandardMaterial
            ref={leftMatRef}
            map={curSpreadTex.left}
            roughness={0.86}
            metalness={0.04}
          />
        </mesh>

        {/* Resting Top Right Curved Leaf */}
        <mesh
          geometry={rightLeafGeo}
          receiveShadow={!isCompactDevice}
          castShadow={!isCompactDevice}
          onPointerDown={(e) => {
            if (e.uv && e.uv.x > 0.62) {
              e.stopPropagation();
              onStartCornerDrag(e.nativeEvent, 'forward');
            }
          }}
        >
          <meshStandardMaterial
            ref={rightMatRef}
            map={curSpreadTex.right}
            roughness={0.86}
            metalness={0.04}
          />
        </mesh>

        {/* Live Deformed Turning Paper Sheet — Dual-Faced FrontSide + BackSide */}
        <mesh
          ref={turningFrontMeshRef}
          geometry={turnGeoFront}
          visible={false}
          castShadow={!isCompactDevice}
          receiveShadow={!isCompactDevice}
        >
          <meshStandardMaterial
            ref={frontTurnMatRef}
            map={curSpreadTex.right}
            side={THREE.FrontSide}
            roughness={0.82}
            metalness={0.05}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>

        <mesh
          ref={turningBackMeshRef}
          geometry={turnGeoBack}
          visible={false}
          castShadow={!isCompactDevice}
          receiveShadow={!isCompactDevice}
        >
          <meshStandardMaterial
            ref={backTurnMatRef}
            map={tgtSpreadTex.left}
            side={THREE.BackSide}
            roughness={0.82}
            metalness={0.05}
            polygonOffset
            polygonOffsetFactor={1}
          />
        </mesh>

        {/* Restrained Warm Golden Dust Shimmer over the Spine & Right Spread */}
        <points ref={sparksRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkPositions.length / 3}
              array={sparkPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#ffcb80"
            size={0.024}
            transparent
            opacity={0.48}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      </group>
    </>
  );
}

/**
 * R3F Canvas Wrapper for the Digital Storybook.
 */
export function StorybookScene3D(props) {
  const isCompactViewport = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <div className="sb-canvas-wrap">
      <Canvas
        shadows={!isCompactViewport}
        dpr={isCompactViewport ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0.2, 7.2], fov: 34, near: 0.1, far: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      >
        <Suspense fallback={null}>
          <StorybookWorld {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
