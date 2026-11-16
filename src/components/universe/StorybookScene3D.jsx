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

const BOOK_POS = [-0.3, -0.44, 0.02];
const BOOK_ROT = [0.05, -0.15, 0];

/**
 * Interactive 3D Storybook World inside R3F `<Canvas>`.
 */
function StorybookWorld({
  turnStateRef,
  currentChapterId,
  targetChapterId,
  cornerHover,
  orbitOffsetRef,
  markerElsRef,
  pageRegionRef,
  onStartCornerDrag,
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

  // Geometries for static top spreads & single live-deformed turning page
  const leftLeafGeo = useMemo(() => createBookLeafGeometry('left', 0.002), []);
  const rightLeafGeo = useMemo(() => createBookLeafGeometry('right', 0.002), []);

  const turnSheetIndices = useMemo(() => buildTurnSheetIndexArrays(), []);
  const turnGeoFront = useMemo(() => createBookLeafGeometry('right', 0.008), []);
  const turnGeoBack = useMemo(() => {
    // Share vertex buffers with turnGeoFront so updating turnGeoFront positions/normals deforms both sides simultaneously
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', turnGeoFront.attributes.position);
    g.setAttribute('normal', turnGeoFront.attributes.normal);
    g.setAttribute('uv', turnGeoFront.attributes.uv);
    g.setIndex(turnSheetIndices.forward);
    return g;
  }, [turnGeoFront, turnSheetIndices]);

  // Pre-warm all 5 spreads into GPU textures
  const spreads = useMemo(() => {
    void fontsTick;
    return {
      journey: getSpreadTextures('journey'),
      archive: getSpreadTextures('archive'),
      lab: getSpreadTextures('lab'),
      signal: getSpreadTextures('signal'),
      frontier: getSpreadTextures('frontier'),
    };
  }, [fontsTick]);

  const tableTex = useMemo(() => getTableSurfaceTexture(), []);
  const amberSprite = useMemo(() => getAmberGlowSprite(), []);

  // Ambient subtle warm dust sparks rising softly above mountain sunrise / spine pocket
  const sparkPositions = useMemo(() => {
    const count = 42;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.35) * 3.8;
      arr[i * 3 + 1] = 0.25 + Math.random() * 1.45;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2.4;
    }
    return arr;
  }, []);

  // Update triangle winding whenever turn direction flips
  const lastDirRef = useRef('forward');
  const smoothCornerPeek = useRef(0);
  const tmpVec = useMemo(() => new THREE.Vector3(), []);
  const tmpPtA = useMemo(() => new THREE.Vector3(), []);
  const tmpPtB = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(0.05, -0.02, -0.02), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const reduced = prefersReducedMotion();
    const ts = turnStateRef.current;

    // 1. Subtle interactive corner peel peek or live page turn deformation
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

    // Assign textures for static leaves & turning front/back without flickering
    const curSpread = spreads[currentChapterId] || spreads.journey;
    const tgtSpread = spreads[targetChapterId] || spreads.archive;

    if (leftMatRef.current && rightMatRef.current && frontTurnMatRef.current && backTurnMatRef.current) {
      if (ts.active && activeDir === 'forward') {
        leftMatRef.current.map = curSpread.left;
        rightMatRef.current.map = tgtSpread.right;
        frontTurnMatRef.current.map = curSpread.right;
        backTurnMatRef.current.map = tgtSpread.left;
      } else if (ts.active && activeDir === 'backward') {
        leftMatRef.current.map = tgtSpread.left;
        rightMatRef.current.map = curSpread.right;
        frontTurnMatRef.current.map = curSpread.left;
        backTurnMatRef.current.map = tgtSpread.right;
      } else {
        leftMatRef.current.map = curSpread.left;
        rightMatRef.current.map = isDeforming ? tgtSpread.right : curSpread.right;
        frontTurnMatRef.current.map = curSpread.right;
        backTurnMatRef.current.map = tgtSpread.left;
      }
      leftMatRef.current.needsUpdate = true;
      rightMatRef.current.needsUpdate = true;
      frontTurnMatRef.current.needsUpdate = true;
      backTurnMatRef.current.needsUpdate = true;
    }

    // 2. Gentle golden spine breath & micro dust float
    if (spineGlowMatRef.current) {
      spineGlowMatRef.current.opacity = reduced ? 0.72 : 0.68 + Math.sin(t * 2.1) * 0.08;
    }

    if (sparksRef.current && !reduced) {
      const posArr = sparksRef.current.geometry.attributes.position.array;
      for (let i = 0; i < posArr.length / 3; i++) {
        posArr[i * 3 + 1] += dt * (0.04 + (i % 4) * 0.015);
        if (posArr[i * 3 + 1] > 1.75) posArr[i * 3 + 1] = 0.25;
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Restrained camera orbit & responsive framing across desktop/tablet/mobile
    const aspect = size.width / Math.max(1, size.height);
    const narrowBoost = Math.max(0, (1.72 - aspect) * 3.15);
    const orbit = orbitOffsetRef.current;
    orbit.azimuth = damp(orbit.azimuth, orbit.targetAzimuth, 5.5, dt);
    orbit.polar = damp(orbit.polar, orbit.targetPolar, 5.5, dt);

    const baseDist = 6.28 + narrowBoost;
    const az = -0.17 + orbit.azimuth;
    const el = 0.34 + orbit.polar;
    const camX = Math.sin(az) * Math.cos(el) * baseDist;
    const camY = Math.sin(el) * baseDist + 0.14;
    const camZ = Math.cos(az) * Math.cos(el) * baseDist;

    camera.position.x = damp(camera.position.x, camX, 6, dt);
    camera.position.y = damp(camera.position.y, camY, 6, dt);
    camera.position.z = damp(camera.position.z, camZ, 6, dt);
    camera.lookAt(lookTarget);
    camera.updateMatrixWorld();

    // 4. Project real 3D page coordinates directly onto interactive DOM pins (zero React state update per frame)
    if (bookGroupRef.current) {
      bookGroupRef.current.updateMatrixWorld(true);
      const projectSurface = (side, u, v, outVec) => {
        sampleBookPagePoint(side, u, v, outVec, 0.014);
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
          const pt2 = projectSurface('right', m.u, m.v, tmpVec);
          elRef.style.transform = `translate3d(${pt2.x.toFixed(1)}px, ${pt2.y.toFixed(1)}px, 0) translate(-50%, calc(-100% + 4px))`;
        }
      }

      if (pageRegionRef.current) {
        const tl = projectSurface('right', 0.06, -0.82, tmpPtA);
        const br = projectSurface('right', 0.94, 0.7, tmpPtB);
        const w = Math.max(180, br.x - tl.x);
        const h = Math.max(140, br.y - tl.y);
        pageRegionRef.current.style.left = `${tl.x.toFixed(1)}px`;
        pageRegionRef.current.style.top = `${tl.y.toFixed(1)}px`;
        pageRegionRef.current.style.width = `${w.toFixed(1)}px`;
        pageRegionRef.current.style.height = `${h.toFixed(1)}px`;
      }
    }
  });

  return (
    <>
      <color attach="background" args={['#060507']} />
      <fog attach="fog" args={['#060507', 9.5, 24]} />

      {/* Local Procedural Softbox Studio Reflections (zero remote HDR fetch) */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={1.7}
          position={[1.5, 5.5, 2.5]}
          rotation={[Math.PI / 2.2, 0, 0]}
          scale={[6, 3.5, 1]}
          color="#f3eadf"
        />
        <Lightformer
          form="rect"
          intensity={1.35}
          position={[-5, 2.5, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[5, 3, 1]}
          color="#b8c6de"
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[0, 1.2, 4]}
          rotation={[0, 0, 0]}
          scale={[4, 1.4, 1]}
          color="#ff9f45"
        />
      </Environment>

      {/* Atmospheric Charcoal & Warm Amber Book Illumination Rig */}
      <ambientLight intensity={0.48} color="#d9d8df" />
      <directionalLight
        position={[3.6, 5.2, 4.2]}
        intensity={1.65}
        color="#f0eae0"
        castShadow
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
      <directionalLight position={[-4.8, 3.4, 2.8]} intensity={1.15} color="#8fa0bf" />
      <pointLight position={[-0.22, -0.02, 1.66]} color="#ff9d42" intensity={5.4} distance={3.8} decay={1.9} />
      <pointLight position={[0.45, 0.72, 0.2]} color="#ffb76b" intensity={2.4} distance={4.8} decay={1.8} />

      {/* Matte Reflective Textured Dark Stone Tabletop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.445, 0]} receiveShadow>
        <planeGeometry args={[32, 24]} />
        <MeshReflectorMaterial
          map={tableTex}
          blur={[260, 80]}
          resolution={512}
          mixBlur={0.92}
          mixStrength={2.0}
          roughness={0.44}
          depthScale={0.65}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#111013"
          metalness={0.72}
        />
      </mesh>

      {/* Subtle Warm Backstage Smoke Glow behind book spine */}
      <sprite position={[0.3, 0.75, -2.8]} scale={[7.8, 4.4, 1]}>
        <spriteMaterial
          map={amberSprite}
          color="#464552"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </sprite>

      {/* Main Physical 3D Storybook Asset + Live Deformable Pages */}
      <group ref={bookGroupRef} position={BOOK_POS} rotation={BOOK_ROT}>
        <primitive object={clonedBaseBook} />

        {/* Spine bottom warm light flare (Reference 01 golden spine notch pocket) */}
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

        {/* Resting Top Left Curved Leaf (interactive fore-edge corner drag for backward turn) */}
        <mesh
          geometry={leftLeafGeo}
          receiveShadow
          castShadow
          onPointerDown={(e) => {
            if (e.uv && e.uv.x < 0.38) {
              e.stopPropagation();
              onStartCornerDrag(e.nativeEvent, 'backward');
            }
          }}
        >
          <meshStandardMaterial
            ref={leftMatRef}
            map={spreads.journey.left}
            roughness={0.86}
            metalness={0.04}
          />
        </mesh>

        {/* Resting Top Right Curved Leaf (interactive corner click zone near fore-edge) */}
        <mesh
          geometry={rightLeafGeo}
          receiveShadow
          castShadow
          onPointerDown={(e) => {
            if (e.uv && e.uv.x > 0.62) {
              e.stopPropagation();
              onStartCornerDrag(e.nativeEvent, 'forward');
            }
          }}
        >
          <meshStandardMaterial
            ref={rightMatRef}
            map={spreads.journey.right}
            roughness={0.86}
            metalness={0.04}
          />
        </mesh>

        {/* Live Deformed Turning Paper Sheet — Dual-Faced FrontSide + BackSide (Zero Z-Fighting) */}
        <mesh ref={turningFrontMeshRef} geometry={turnGeoFront} visible={false} castShadow receiveShadow>
          <meshStandardMaterial
            ref={frontTurnMatRef}
            map={spreads.journey.right}
            side={THREE.FrontSide}
            roughness={0.82}
            metalness={0.05}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>

        <mesh ref={turningBackMeshRef} geometry={turnGeoBack} visible={false} castShadow receiveShadow>
          <meshStandardMaterial
            ref={backTurnMatRef}
            map={spreads.archive.left}
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
  return (
    <div className="sb-canvas-wrap">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [-1.0, 2.2, 5.88], fov: 34, near: 0.1, far: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      >
        <Suspense fallback={null}>
          <StorybookWorld {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
