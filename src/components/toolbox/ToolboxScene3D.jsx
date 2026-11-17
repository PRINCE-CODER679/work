import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { damp, lerp, prefersReducedMotion } from '../../animations/motion';
import { TECH_NODES } from '../../data/stack';
import { pointer } from '../../utils/store';
import { getTechTileTexture } from './techTileTextures';
import {
  CHAMBER_BEAM_FRAGMENT,
  CHAMBER_BEAM_VERTEX,
  HERO_CUBE_RIM_FRAGMENT,
  HERO_CUBE_RIM_VERTEX,
} from './toolboxShaders';

useGLTF.preload('/assets/toolbox/asrar-toolbox.glb');

// Foreground 8 constellation slots cleanly centered between open case rim and lifted canopy (Desktop)
const FOREGROUND_SLOTS = [
  { pos: [-1.38, 1.88, 0.22], rot: [0.04, 0.3, 0.04], scale: 0.94 },
  { pos: [-1.18, 1.28, 0.48], rot: [-0.04, 0.26, -0.04], scale: 0.94 },
  { pos: [-0.36, 1.18, 0.84], rot: [-0.06, 0.1, 0.0], scale: 0.82 },
  { pos: [0.56, 1.32, 0.78], rot: [-0.05, -0.22, 0.04], scale: 0.96 },
  { pos: [0.96, 1.9, 0.26], rot: [0.05, -0.24, -0.03], scale: 0.94 },
  { pos: [1.48, 1.82, -0.04], rot: [0.05, -0.36, -0.05], scale: 0.92 },
  { pos: [1.18, 1.28, 0.46], rot: [-0.04, -0.32, 0.04], scale: 0.94 },
  { pos: [-0.74, 1.98, -0.14], rot: [0.06, 0.18, 0.0], scale: 0.85 },
];

// Portrait mobile 8 foreground constellation slots: larger scale, wider vertical arch, zero horizontal clipping on 320px-430px
const MOBILE_FOREGROUND_SLOTS = [
  { pos: [-0.94, 2.02, 0.22], rot: [0.04, 0.22, 0.03], scale: 1.16 },
  { pos: [0.94, 2.02, 0.22], rot: [0.04, -0.22, -0.03], scale: 1.16 },
  { pos: [-1.02, 1.54, 0.38], rot: [0.0, 0.2, 0.0], scale: 1.2 },
  { pos: [1.02, 1.54, 0.38], rot: [0.0, -0.2, 0.0], scale: 1.2 },
  { pos: [-0.82, 1.1, 0.62], rot: [-0.05, 0.16, -0.02], scale: 1.14 },
  { pos: [0.82, 1.1, 0.62], rot: [-0.05, -0.16, 0.02], scale: 1.14 },
  { pos: [-0.46, 2.24, 0.02], rot: [0.06, 0.12, 0.0], scale: 1.08 },
  { pos: [0.46, 2.24, 0.02], rot: [0.06, -0.12, 0.0], scale: 1.08 },
];

// Secondary rear orbit slots cleanly framing behind foreground wings
function getBackOrbitSlot(index, total, portrait = false) {
  const frac = total > 1 ? index / (total - 1) : 0.5;
  const angle = Math.PI * 0.14 + frac * Math.PI * 0.72;
  const r = portrait ? 0.98 : 1.66;
  const x = Math.cos(angle) * r * (index % 2 === 0 ? 1 : -1) * 0.92;
  const y = (portrait ? 1.58 : 1.54) + Math.sin(angle * 2) * (portrait ? 0.36 : 0.28);
  const z = -0.56 - Math.sin(angle) * 0.42;
  return {
    pos: [x, y, z],
    rot: [0.04, -x * 0.18, 0],
    scale: portrait ? 0.8 : 0.7,
  };
}

/**
 * Generates a closed rounded-rectangle loop matching `RoundedBox(0.55, 0.55, 0.044, radius=0.055)`.
 */
function buildRoundedTileLoopPositions(half = 0.272, radius = 0.055, segs = 6) {
  const r = Math.min(radius, half * 0.45);
  const corners = [
    { cx: half - r, cy: half - r, start: 0 },
    { cx: -(half - r), cy: half - r, start: Math.PI * 0.5 },
    { cx: -(half - r), cy: -(half - r), start: Math.PI },
    { cx: half - r, cy: -(half - r), start: Math.PI * 1.5 },
  ];
  const pts = [];
  for (const c of corners) {
    for (let i = 0; i <= segs; i++) {
      const a = c.start + (i / segs) * (Math.PI * 0.5);
      pts.push(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r, 0);
    }
  }
  return new Float32Array(pts);
}

const ROUNDED_TILE_LOOP_POSITIONS = buildRoundedTileLoopPositions();

let cachedGlowTex = null;
function getOrangeGlowTexture() {
  if (cachedGlowTex) return cachedGlowTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 4, 128, 128, 128);
  g.addColorStop(0, 'rgba(255, 200, 120, 0.95)');
  g.addColorStop(0.22, 'rgba(255, 110, 20, 0.65)');
  g.addColorStop(0.55, 'rgba(255, 72, 0, 0.18)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedGlowTex = tex;
  return tex;
}

/**
 * Individual floating crystal-frosted glass technology plaque.
 */
function TechGlassTile({ node, slot, mobileSlot, isPortraitRef, inCategory, emergedRef, isOpened, onSelect, index }) {
  const groupRef = useRef(null);
  const glassMatRef = useRef(null);
  const borderMatRef = useRef(null);
  const iconMatRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const tex = useMemo(() => getTechTileTexture(node.id, node.name, false), [node.id, node.name]);

  const smoothPos = useRef(new THREE.Vector3(0, 0.65, 0));
  const smoothScale = useRef(0.01);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    const emerge = emergedRef.current;

    if (emerge < 0.01) {
      g.visible = false;
      smoothPos.current.set(0, 0.65, 0);
      smoothScale.current = 0.01;
      return;
    }

    const activeSlot = isPortraitRef.current && mobileSlot ? mobileSlot : slot;

    g.visible = true;
    const staggerDelay = Math.min(0.32, index * 0.022);
    const localT = Math.min(1, Math.max(0, (emerge - staggerDelay) / (1 - staggerDelay)));
    const eased = 1 - Math.pow(1 - localT, 3);

    const floatBob = isOpened ? Math.sin(t * 1.45 + index * 0.85) * 0.032 : 0;
    const targetX = lerp(0, activeSlot.pos[0], eased);
    const targetY = lerp(0.75, activeSlot.pos[1] + floatBob, eased);
    const targetZ = lerp(0.0, activeSlot.pos[2], eased);

    smoothPos.current.x = damp(smoothPos.current.x, targetX, 7.5, dt);
    smoothPos.current.y = damp(smoothPos.current.y, targetY, 7.5, dt);
    smoothPos.current.z = damp(smoothPos.current.z, targetZ, 7.5, dt);
    g.position.copy(smoothPos.current);

    g.rotation.x = lerp(0.55, activeSlot.rot[0], eased);
    g.rotation.y = lerp(0, activeSlot.rot[1] + (hovered ? 0.08 : 0), eased);
    g.rotation.z = lerp(0.2, activeSlot.rot[2], eased);

    const focusMult = hovered ? 1.15 : inCategory ? 1.0 : 0.78;
    const tgtScale = activeSlot.scale * focusMult * eased;
    smoothScale.current = damp(smoothScale.current, tgtScale, 8.5, dt);
    g.scale.setScalar(Math.max(0.001, smoothScale.current));

    const visAlpha = (inCategory || hovered ? 0.96 : 0.42) * Math.min(1, eased * 1.3);
    if (glassMatRef.current) glassMatRef.current.opacity = visAlpha * 0.34;
    if (iconMatRef.current) iconMatRef.current.opacity = visAlpha;
    if (borderMatRef.current) {
      borderMatRef.current.color.set(hovered ? '#ffb347' : inCategory ? '#ff9436' : '#8a92a6');
      borderMatRef.current.opacity = (hovered ? 0.95 : inCategory ? 0.65 : 0.25) * eased;
    }
  });

  useEffect(() => {
    if (hovered && isOpened) document.body.style.cursor = 'pointer';
    return () => {
      if (hovered) document.body.style.cursor = '';
    };
  }, [hovered, isOpened]);

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0.002]} renderOrder={1}>
        <planeGeometry args={[0.52, 0.52]} />
        <meshBasicMaterial
          ref={iconMatRef}
          map={tex}
          transparent
          opacity={0.95}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <RoundedBox
        args={[0.55, 0.55, 0.044]}
        radius={0.055}
        smoothness={4}
        renderOrder={2}
        onPointerOver={(e) => {
          if (!isOpened) return;
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          if (!isOpened) return;
          e.stopPropagation();
          onSelect(node.id);
        }}
      >
        <meshPhysicalMaterial
          ref={glassMatRef}
          color="#242733"
          metalness={0.22}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.34}
          depthWrite={false}
        />
      </RoundedBox>

      <lineLoop position={[0, 0, 0.025]} renderOrder={3}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={ROUNDED_TILE_LOOP_POSITIONS.length / 3}
            array={ROUNDED_TILE_LOOP_POSITIONS}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial ref={borderMatRef} color="#ff9436" transparent opacity={0.65} />
      </lineLoop>
    </group>
  );
}

/**
 * Center Glowing Orange Hero Selection Cube (Panel 03 central centerpiece highlighting Python / active node).
 */
function HeroSelectionCube({ selectedNode, emergedRef, isOpened, isPortraitRef, onClickHero }) {
  const cubeGroupRef = useRef(null);
  const rimShaderMatRef = useRef(null);
  const iconMatRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const tex = useMemo(
    () => getTechTileTexture(selectedNode.id, selectedNode.name, true),
    [selectedNode.id, selectedNode.name]
  );

  const rimUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPulse: { value: 1 },
      uAmber: { value: new THREE.Color('#ff5e00') },
      uWhiteHot: { value: new THREE.Color('#ffbe6b') },
    }),
    []
  );

  useFrame((state, delta) => {
    const g = cubeGroupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(0.05, delta);
    const emerge = emergedRef.current;

    if (emerge < 0.01) {
      g.visible = false;
      return;
    }
    g.visible = true;

    const portrait = isPortraitRef.current;
    const localT = Math.min(1, emerge * 1.15);
    const eased = 1 - Math.pow(1 - localT, 3);

    const bob = isOpened ? Math.sin(t * 1.35) * 0.036 : 0;
    const restY = portrait ? 1.54 : 1.66;
    const restZ = portrait ? 0.52 : 0.44;
    g.position.set(0, lerp(0.75, restY + bob, eased), lerp(0, restZ, eased));

    const targetScale = (hovered ? 1.08 : portrait ? 1.12 : 1.0) * eased;
    const curS = damp(g.scale.x, targetScale, 8, dt);
    g.scale.setScalar(Math.max(0.001, curS));

    const baseRotY = -0.32 + (isOpened ? Math.sin(t * 0.6) * 0.08 : 0);
    g.rotation.set(0.16, lerp(0, baseRotY, eased), 0.06);

    if (rimShaderMatRef.current) {
      rimShaderMatRef.current.uniforms.uTime.value = t;
      rimShaderMatRef.current.uniforms.uPulse.value = eased * (hovered ? 1.32 : 1.0);
    }
    if (iconMatRef.current) {
      iconMatRef.current.opacity = Math.min(1, eased * 1.25);
    }
  });

  useEffect(() => {
    if (hovered && isOpened) document.body.style.cursor = 'pointer';
    return () => {
      if (hovered) document.body.style.cursor = '';
    };
  }, [hovered, isOpened]);

  return (
    <group
      ref={cubeGroupRef}
      onPointerOver={(e) => {
        if (!isOpened) return;
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        if (!isOpened) return;
        e.stopPropagation();
        onClickHero();
      }}
    >
      <mesh position={[0, 0, 0.02]} rotation={[0, 0.16, 0]} renderOrder={1}>
        <planeGeometry args={[0.56, 0.56]} />
        <meshBasicMaterial
          ref={iconMatRef}
          map={tex}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <RoundedBox args={[0.74, 0.74, 0.74]} radius={0.075} smoothness={5} renderOrder={2}>
        <meshPhysicalMaterial
          color="#381704"
          emissive="#ff5200"
          emissiveIntensity={0.28}
          metalness={0.18}
          roughness={0.1}
          clearcoat={1}
          transparent
          opacity={0.44}
          depthWrite={false}
        />
      </RoundedBox>

      <mesh renderOrder={3}>
        <boxGeometry args={[0.76, 0.76, 0.76]} />
        <shaderMaterial
          ref={rimShaderMatRef}
          vertexShader={HERO_CUBE_RIM_VERTEX}
          fragmentShader={HERO_CUBE_RIM_FRAGMENT}
          uniforms={rimUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <lineSegments renderOrder={4}>
        <edgesGeometry args={[new THREE.BoxGeometry(0.755, 0.755, 0.755)]} />
        <lineBasicMaterial color="#ffa640" transparent opacity={0.95} />
      </lineSegments>
    </group>
  );
}

/**
 * Inner Three.js Scene driving the `.glb` Toolbox, Volumetric Chamber Light, Glow Sprites & Tech Constellation.
 */
function ToolboxWorld({
  animRef,
  phase,
  selectedId,
  activeCat,
  onSelectNode,
  onUnlockClick,
}) {
  const { scene } = useGLTF('/assets/toolbox/asrar-toolbox.glb');
  const glbRoot = useMemo(() => scene.clone(true), [scene]);

  const masterGroupRef = useRef(null);
  const beamMatRef = useRef(null);
  const chamberLightRef = useRef(null);
  const heroLightRef = useRef(null);
  const chamberSpriteRef = useRef(null);
  const frontBarSpriteRef = useRef(null);
  const sparksRef = useRef(null);
  const emergedProxyRef = useRef(0);

  const glowTex = useMemo(() => getOrangeGlowTexture(), []);

  const rigRefs = useMemo(() => {
    const lidGroup = glbRoot.getObjectByName('LidGroup');
    const latchLeft = glbRoot.getObjectByName('LatchLeft');
    const latchRight = glbRoot.getObjectByName('LatchRight');
    const orbitalRig = glbRoot.getObjectByName('OrbitalRig');
    const orbitalSpinner = glbRoot.getObjectByName('OrbitalSpinner');

    const ledMeshes = [];
    glbRoot.traverse((child) => {
      if (child.isMesh && child.material && (child.material.name === 'OrangeLED' || child.material.name === 'HotAmberChamber')) {
        child.material = child.material.clone();
        ledMeshes.push(child.material);
      }
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return { lidGroup, latchLeft, latchRight, orbitalRig, orbitalSpinner, ledMeshes };
  }, [glbRoot]);

  const beamUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColorHot: { value: new THREE.Color('#ffbe66') },
      uColorWarm: { value: new THREE.Color('#ff5500') },
    }),
    []
  );

  const sparksGeo = useMemo(() => {
    const count = 48;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.9;
      pos[i * 3 + 1] = Math.random() * 2.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const selectedNode = useMemo(
    () => TECH_NODES.find((n) => n.id === selectedId) || TECH_NODES[0],
    [selectedId]
  );

  // Showcase curated plaques in BOTH Desktop and Portrait Mobile configurations seamlessly
  const tileAllocations = useMemo(() => {
    const others = TECH_NODES.filter((n) => n.id !== selectedNode.id);
    const matching = others.filter((n) => activeCat === 'all' || n.cat === activeCat);
    const nonMatching = others.filter((n) => activeCat !== 'all' && n.cat !== activeCat);
    const ordered = [...matching, ...nonMatching];

    const backTotal = Math.max(0, ordered.length - FOREGROUND_SLOTS.length);
    return ordered.map((node, i) => {
      const isFg = i < FOREGROUND_SLOTS.length;
      const slot = isFg ? FOREGROUND_SLOTS[i] : getBackOrbitSlot(i - FOREGROUND_SLOTS.length, backTotal, false);
      const mobileSlot = isFg
        ? MOBILE_FOREGROUND_SLOTS[i]
        : getBackOrbitSlot(i - FOREGROUND_SLOTS.length, backTotal, true);
      const inCategory = activeCat === 'all' || node.cat === activeCat;
      return { node, slot, mobileSlot, inCategory, index: i };
    });
  }, [selectedNode.id, activeCat]);

  const smoothPtr = useRef({ x: 0, y: 0 });
  const lookAtTarget = useRef(new THREE.Vector3(0, -0.15, 0));
  const isPortraitRef = useRef(false);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(0.05, delta);
    const anim = animRef.current;
    const reduced = prefersReducedMotion();

    const aspect = state.size.width / Math.max(1, state.size.height);
    const isPortrait = state.size.width < 768 || aspect < 1.12;
    isPortraitRef.current = isPortrait;

    emergedProxyRef.current = anim.tilesEmerge;

    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;
    smoothPtr.current.x = damp(smoothPtr.current.x, px, 5.5, dt);
    smoothPtr.current.y = damp(smoothPtr.current.y, py, 5.5, dt);

    // Master rig rests flush on reflective floor (`y = -1.05`)
    if (masterGroupRef.current) {
      const vibX = anim.vibration > 0.01 ? Math.sin(t * 72) * 0.025 * anim.vibration : 0;
      const vibZ = anim.vibration > 0.01 ? Math.cos(t * 64) * 0.018 * anim.vibration : 0;
      masterGroupRef.current.position.set(vibX, -1.05, vibZ);
      masterGroupRef.current.rotation.y = (isPortrait ? 0.16 : 0.22) + smoothPtr.current.x * 0.05;
    }

    // Articulate draw latches
    if (rigRefs.latchLeft && rigRefs.latchRight) {
      const latchRot = anim.latchOpen * 1.18;
      const latchDrop = anim.latchOpen * 0.04;
      rigRefs.latchLeft.rotation.x = latchRot;
      rigRefs.latchRight.rotation.x = latchRot;
      rigRefs.latchLeft.position.y = 1.01 - latchDrop;
      rigRefs.latchRight.position.y = 1.01 - latchDrop;
    }

    // Articulate lid: slightly tighter open lift on portrait phones so full canopy + handle stay visible inside frame
    if (rigRefs.lidGroup) {
      const targetLift = isPortrait ? 2.34 : 2.48;
      const liftY = lerp(0.93, targetLift, anim.lidLift);
      const pullZ = lerp(0, -0.58, anim.lidLift);
      const pitchX = lerp(0, isPortrait ? -0.52 : -0.58, anim.lidLift);
      rigRefs.lidGroup.position.set(0, liftY, pullZ);
      rigRefs.lidGroup.rotation.x = pitchX;
    }

    // Orbital wireframe track
    if (rigRefs.orbitalRig && rigRefs.orbitalSpinner) {
      const s = Math.max(0.001, anim.orbitalReveal);
      rigRefs.orbitalRig.visible = anim.orbitalReveal > 0.02;
      rigRefs.orbitalRig.position.set(0, isPortrait ? 1.52 : 1.58, 0.24);
      rigRefs.orbitalRig.rotation.set(0.24, 0, -0.14);
      const xMult = isPortrait ? 0.68 : 0.96;
      rigRefs.orbitalRig.scale.set(s * xMult, s * 0.96, s * 0.68);
      rigRefs.orbitalSpinner.rotation.y = reduced ? 0 : t * 0.14;
    }

    // Intensify LEDs dynamically across states
    const baseEmissive = 1.85 + anim.ledBoost * 1.4;
    for (const mat of rigRefs.ledMeshes) {
      mat.emissiveIntensity = baseEmissive;
    }

    // Update additive orange optical glow sprites & chamber rays
    if (chamberSpriteRef.current) {
      const ci = Math.max(0.02, anim.chamberBeam);
      chamberSpriteRef.current.visible = anim.chamberBeam > 0.02;
      chamberSpriteRef.current.material.opacity = ci * 0.85;
      chamberSpriteRef.current.scale.set(3.2 * (0.65 + 0.35 * ci), 1.9 * (0.65 + 0.35 * ci), 1);
    }
    if (frontBarSpriteRef.current) {
      frontBarSpriteRef.current.material.opacity = 0.58 + anim.ledBoost * 0.35;
    }

    if (beamMatRef.current) {
      beamMatRef.current.uniforms.uTime.value = t;
      beamMatRef.current.uniforms.uIntensity.value = anim.chamberBeam * 1.25;
    }
    if (chamberLightRef.current) {
      chamberLightRef.current.intensity = anim.chamberBeam * 28;
    }
    if (heroLightRef.current) {
      heroLightRef.current.intensity = emergedProxyRef.current * 9.5;
    }

    if (sparksRef.current && anim.chamberBeam > 0.03) {
      sparksRef.current.visible = true;
      const arr = sparksRef.current.geometry.attributes.position.array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] += dt * (0.48 + (i % 5) * 0.12);
        if (arr[i * 3 + 1] > 2.5) arr[i * 3 + 1] = 0.05;
      }
      sparksRef.current.geometry.attributes.position.needsUpdate = true;
    } else if (sparksRef.current) {
      sparksRef.current.visible = false;
    }

    // Analytical fit-to-bounds camera solver: dominates portrait mobile width (~85-92% case width closed, zero tile clipping opened)
    const tanHalfV = 0.30573; // tan(34deg / 2)
    let camZ;
    let lookY;
    let camY;
    let camX;

    if (isPortrait) {
      const closedZ = Math.max(1.42 / (tanHalfV * aspect), 1.05 / tanHalfV);
      const openZ = Math.max(1.56 / (tanHalfV * aspect), 1.96 / tanHalfV);
      camZ = lerp(closedZ, openZ, anim.cameraShift);
      lookY = lerp(-0.28, 0.42, anim.cameraShift);
      camY = lerp(0.55, 0.96, anim.cameraShift) + smoothPtr.current.y * 0.08;
      camX = smoothPtr.current.x * 0.14;
    } else {
      const isShortLandscape = state.size.height < 520;
      const aspectBoost = Math.max(0, (1.84 - aspect) * 2.8);
      const minOpenV = isShortLandscape ? 1.92 / tanHalfV : 0;
      const baseClosed = Math.max(8.35 + aspectBoost, minOpenV * 0.9);
      const baseOpen = Math.max(9.15 + aspectBoost, minOpenV);
      camZ = lerp(baseClosed, baseOpen, anim.cameraShift);
      lookY = lerp(-0.18, 0.45, anim.cameraShift);
      camY = lerp(1.02, 1.38, anim.cameraShift) + smoothPtr.current.y * 0.12;
      camX = -0.1 + smoothPtr.current.x * 0.28;
    }

    state.camera.position.x = damp(state.camera.position.x, camX, 5.2, dt);
    state.camera.position.y = damp(state.camera.position.y, camY, 5.2, dt);
    state.camera.position.z = damp(state.camera.position.z, camZ, 5.2, dt);

    lookAtTarget.current.y = damp(lookAtTarget.current.y, lookY, 5.2, dt);
    state.camera.lookAt(0, lookAtTarget.current.y, 0);
  });

  const isOpened = phase === 'opened';

  return (
    <>
      <color attach="background" args={['#060608']} />
      <fog attach="fog" args={['#060608', 8.5, 19]} />

      {/* Studio Softbox Reflections (Brushed Metallic Rim + Front Fill Lightformers) */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={3.0}
          position={[0, 4.5, 6.2]}
          rotation={[0.45, 0, 0]}
          scale={[9, 3, 1]}
          color="#f2ede4"
        />
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[0, 6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[7, 4, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="rect"
          intensity={2.1}
          position={[0, 3.2, 5.5]}
          rotation={[-0.45, 0, 0]}
          scale={[6, 2.2, 1]}
          color="#dce6f7"
        />
        <Lightformer
          form="rect"
          intensity={2.8}
          position={[-4.5, 2, 2.5]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[4.5, 2.5, 1]}
          color="#ff8c38"
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[4.5, 2.5, -1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[4.5, 2.5, 1]}
          color="#a8b8d8"
        />
      </Environment>

      {/* Studio Key, Front Metallic Fill & Warm Amber Chamber Lighting */}
      <ambientLight intensity={0.68} color="#e2dcd3" />
      <directionalLight position={[2.6, 5.5, 5.2]} intensity={2.6} color="#fff3e6" castShadow />
      <directionalLight position={[-3.2, 3.2, 4.4]} intensity={1.7} color="#dce3f0" />
      <directionalLight position={[0, -1, 4.8]} intensity={0.7} color="#ff8c38" />
      <pointLight
        ref={chamberLightRef}
        position={[0, 0.35, 0.25]}
        color="#ff6a00"
        intensity={0}
        distance={7.5}
        decay={1.6}
      />
      <pointLight
        ref={heroLightRef}
        position={[0, 1.85, 1.2]}
        color="#ff8a24"
        intensity={0}
        distance={5.5}
        decay={1.7}
      />

      {/* Real-Time Reflective Brushed Metal Studio Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <MeshReflectorMaterial
          blur={typeof window !== 'undefined' && window.innerWidth < 768 ? [140, 40] : [220, 70]}
          resolution={typeof window !== 'undefined' && window.innerWidth < 768 ? 256 : 512}
          mixBlur={0.85}
          mixStrength={2.4}
          roughness={0.38}
          depthScale={0.85}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.35}
          color="#0b0c10"
          metalness={0.84}
        />
      </mesh>

      {/* Subtle Dark Concentric Etched Floor Rings around Pedestal */}
      {[2.65, 3.25].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.045, 0]}>
          <ringGeometry args={[radius, radius + 0.012, 96]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
        </mesh>
      ))}

      {/* Main Articulated `.glb` Toolbox + Volumetric Shaders + Floating Stack */}
      <group
        ref={masterGroupRef}
        position={[0, -1.05, 0]}
        rotation={[0, 0.22, 0]}
        onClick={(e) => {
          if (phase === 'closed') {
            e.stopPropagation();
            onUnlockClick();
          }
        }}
        onPointerOver={() => {
          if (phase === 'closed') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (phase === 'closed') document.body.style.cursor = '';
        }}
      >
        <primitive object={glbRoot} />

        {/* Additive Front Center LED Optical Halo Sprite */}
        <sprite ref={frontBarSpriteRef} position={[0, 0.94, 0.92]} scale={[1.35, 0.34, 1]}>
          <spriteMaterial
            map={glowTex}
            color="#ff7a18"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {/* Additive Chamber Radial Bloom Flare */}
        <sprite ref={chamberSpriteRef} position={[0, 1.02, 0.1]} scale={[3.2, 1.9, 1]} visible={false}>
          <spriteMaterial
            map={glowTex}
            color="#ff7315"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {/* Volumetric Orange Chamber Light Cone Erupting Upward */}
        <mesh position={[0, 1.48, 0]}>
          <cylinderGeometry args={[1.72, 0.94, 1.65, 36, 1, true]} />
          <shaderMaterial
            ref={beamMatRef}
            vertexShader={CHAMBER_BEAM_VERTEX}
            fragmentShader={CHAMBER_BEAM_FRAGMENT}
            uniforms={beamUniforms}
            transparent
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Rising Amber Spark Dust */}
        <points ref={sparksRef} geometry={sparksGeo} position={[0, 0.5, 0]}>
          <pointsMaterial
            size={0.032}
            color="#ffb366"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        {/* Central Glowing Orange Hero Selection Cube */}
        <HeroSelectionCube
          selectedNode={selectedNode}
          emergedRef={emergedProxyRef}
          isOpened={isOpened}
          isPortraitRef={isPortraitRef}
          onClickHero={() => onSelectNode(selectedNode.id)}
        />

        {/* Floating Transparent Glass Technology Plaques */}
        {tileAllocations.map(({ node, slot, mobileSlot, inCategory, index }) => (
          <TechGlassTile
            key={node.id}
            node={node}
            slot={slot}
            mobileSlot={mobileSlot}
            isPortraitRef={isPortraitRef}
            inCategory={inCategory}
            emergedRef={emergedProxyRef}
            isOpened={isOpened}
            onSelect={onSelectNode}
            index={index}
          />
        ))}
      </group>
    </>
  );
}

/**
 * Root Canvas component wrapping WebGL context for Scene 08 (The Toolbox).
 */
export function ToolboxScene3D({
  animRef,
  phase,
  selectedId,
  activeCat,
  onSelectNode,
  onUnlockClick,
}) {
  const isCompactViewport = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <div className="tb-canvas-wrap">
      <Canvas
        shadows={!isCompactViewport}
        dpr={isCompactViewport ? [1, 1.5] : [1, 2]}
        camera={{ position: [-0.1, 1.02, 8.35], fov: 34, near: 0.1, far: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      >
        <Suspense fallback={null}>
          <ToolboxWorld
            animRef={animRef}
            phase={phase}
            selectedId={selectedId}
            activeCat={activeCat}
            onSelectNode={onSelectNode}
            onUnlockClick={onUnlockClick}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
