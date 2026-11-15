import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CORE_VERTEX, CORE_FRAGMENT } from '../shaders/coreShader';
import { damp, lerp, smooth } from '../animations/motion';
import { app, pointer, scenes } from '../utils/store';

/**
 * Multi-plane Computational Architectural Sculpture.
 * Foreground: Graphite gantry rails & frosted glass baffles (sweep past lens on scroll).
 * Midground: 3 counter-rotating machined datum gimbals, articulated fins, conduit cables,
 *            faceted containment prism, and custom GLSL cobalt lattice core.
 * Background: Receding obsidian architectural monoliths & perspective floor datum grid.
 */
export function HeroSculpture({ wireframe = false, tier = 'high' }) {
  const { camera, scene } = useThree();

  const rootRef = useRef(null);
  const fgLeftRef = useRef(null);
  const fgRightRef = useRef(null);
  const ringOuterRef = useRef(null);
  const ringMidRef = useRef(null);
  const ringInnerRef = useRef(null);
  const gimbalRef = useRef(null);
  const prismRef = useRef(null);
  const keyLightRef = useRef(null);
  const bgGroupRef = useRef(null);

  const smoothPtr = useRef({ x: 0, y: 0 });
  const camTarget = useRef(new THREE.Vector3(0, 0, 0));

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uCobalt: { value: new THREE.Color('#536BFF') },
      uSignal: { value: new THREE.Color('#FF5924') },
    }),
    []
  );

  // Curved signal conduits connecting foreground gantry to central gimbal assembly
  const cables = useMemo(() => {
    const paths = [
      [[-3.1, 2.2, 1.9], [-2.1, 1.5, 0.9], [-1.35, 0.7, 0.25]],
      [[3.1, 2.1, 1.9], [2.05, 1.35, 0.85], [1.35, 0.65, 0.2]],
      [[-3.0, -2.0, 1.8], [-1.95, -1.25, 0.9], [-1.25, -0.55, 0.15]],
      [[3.0, -2.1, 1.8], [1.9, -1.3, 0.85], [1.25, -0.6, 0.15]],
    ];
    return paths.map((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      return new THREE.TubeGeometry(curve, tier === 'low' ? 18 : 34, 0.024, 8, false);
    });
  }, [tier]);

  // Background architectural monolith layout
  const monoliths = useMemo(
    () => [
      { pos: [-6.8, -1.2, -7.5], scale: [1.1, 7.2, 1.4], rot: [0, 0.28, 0] },
      { pos: [6.9, -0.8, -8.2], scale: [1.3, 8.1, 1.2], rot: [0, -0.32, 0] },
      { pos: [-4.1, 2.6, -11.4], scale: [1.8, 5.4, 0.9], rot: [0.06, 0.15, 0] },
      { pos: [4.6, -2.4, -12.0], scale: [2.1, 4.8, 1.0], rot: [-0.04, -0.18, 0] },
      { pos: [0.0, 4.8, -14.5], scale: [8.4, 0.55, 1.1], rot: [0, 0, 0] },
    ],
    []
  );

  // Radial sensor struts mounted around the middle gimbal
  const radialFins = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      arr.push({ angle: a, x: Math.cos(a) * 2.25, y: Math.sin(a) * 2.25 });
    }
    return arr;
  }, []);

  const seg = tier === 'low' ? 32 : 72;

  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    const isMobile = state.size.width < 768;

    // Damped pointer
    const px = app.reducedMotion ? 0 : pointer.x;
    const py = app.reducedMotion ? 0 : pointer.y;
    smoothPtr.current.x = damp(smoothPtr.current.x, px, 6.5, dt);
    smoothPtr.current.y = damp(smoothPtr.current.y, py, 6.5, dt);

    const hp = scenes.hero.progress; // 0..1 during Hero scroll dive
    const intro = smooth(scenes.hero.intro); // 0..1 during Boot pullback
    const cp = scenes.contact.progress; // 0..1 during Contact Finale loop

    // Update shader uniforms
    coreUniforms.uTime.value = t;
    coreUniforms.uScroll.value = hp;
    coreUniforms.uPointer.value.set(smoothPtr.current.x, smoothPtr.current.y);

    // Keep hero stage clear for the photographic installation unless wireframe inspector is enabled;
    // return the 3D computational rig cleanly in Scene 12 Contact Finale.
    const contactActive = Math.min(1, Math.max(0, cp * 1.4));

    if (rootRef.current) {
      rootRef.current.visible = Boolean(wireframe || contactActive > 0.01);
      // During Finale, reposition the rig into serene upper-right twilight orbit
      const targetPosX = lerp(0, isMobile ? 0 : 1.55, contactActive);
      const targetPosY = lerp(0, 0.2, contactActive);
      const targetPosZ = lerp(0, -2.4, contactActive);
      rootRef.current.position.set(targetPosX, targetPosY, targetPosZ);
      const s = lerp(0.95, isMobile ? 0.72 : 0.85, contactActive);
      rootRef.current.scale.setScalar(s);
    }

    // Continuous mechanical motion (respects reduced motion)
    const motionMult = app.reducedMotion ? 0.05 : 1;
    if (ringOuterRef.current) {
      ringOuterRef.current.rotation.z = t * 0.11 * motionMult + hp * 1.4;
      ringOuterRef.current.rotation.x = Math.sin(t * 0.25) * 0.14 * motionMult + hp * 0.55;
    }
    if (ringMidRef.current) {
      ringMidRef.current.rotation.y = -t * 0.19 * motionMult - hp * 2.1;
      ringMidRef.current.rotation.x = 0.42 + smoothPtr.current.y * 0.18;
    }
    if (ringInnerRef.current) {
      ringInnerRef.current.rotation.x = t * 0.28 * motionMult + hp * 1.8;
      ringInnerRef.current.rotation.y = smoothPtr.current.x * 0.25;
    }
    if (gimbalRef.current) {
      gimbalRef.current.rotation.y = smoothPtr.current.x * 0.22 + hp * 0.6;
      gimbalRef.current.rotation.x = -smoothPtr.current.y * 0.16;
    }
    if (prismRef.current) {
      prismRef.current.rotation.y = t * 0.22 * motionMult;
      prismRef.current.rotation.z = Math.cos(t * 0.35) * 0.12 * motionMult;
    }

    // Foreground aperture rails slice outward past the lens during the Hero scroll dive
    const railSpread = smooth(Math.min(1, Math.max(0, (hp - 0.18) / 0.55)));
    if (fgLeftRef.current && fgRightRef.current) {
      const baseX = isMobile ? 2.45 : 3.35;
      fgLeftRef.current.position.x = -baseX - railSpread * 2.8;
      fgLeftRef.current.position.z = 2.6 + railSpread * 2.4;
      fgRightRef.current.position.x = baseX + railSpread * 2.8;
      fgRightRef.current.position.z = 2.6 + railSpread * 2.4;
      fgLeftRef.current.visible = contactActive < 0.3;
      fgRightRef.current.visible = contactActive < 0.3;
    }

    if (bgGroupRef.current) {
      bgGroupRef.current.position.z = -hp * 2.5;
    }

    // Lighting temperature & fog transitions (dark #080808 -> warm transition edge near end of Hero dive)
    if (keyLightRef.current) {
      keyLightRef.current.intensity = lerp(3.4, 5.2, hp);
    }
    if (scene.fog) {
      scene.fog.near = lerp(7.5, 4.5, hp);
      scene.fog.far = lerp(24, 15, hp);
    }

    // 6-DOF CAMERA CHOREOGRAPHY
    const baseZ = isMobile ? 10.6 : 7.6;
    if (contactActive > 0.05) {
      // Finale camera pullback loop
      const cz = lerp(baseZ, isMobile ? 10.2 : 8.2, contactActive);
      camera.position.set(
        smoothPtr.current.x * 0.38,
        0.15 + smoothPtr.current.y * 0.22,
        cz
      );
      camTarget.current.set(isMobile ? 0 : 0.75, 0.05, -2.0);
      camera.lookAt(camTarget.current);
      camera.rotation.z = smoothPtr.current.x * -0.02;
    } else {
      // Intro macro detail -> full reveal -> scroll dive THROUGH aperture
      const introX = lerp(1.35, 0, intro);
      const introY = lerp(0.55, 0.14, intro);
      const introZ = lerp(2.35, baseZ, intro);

      // Scroll dive path through core (-z) with subtle bank
      const diveZ = lerp(introZ, -4.4, smooth(hp));
      const diveY = introY + Math.sin(hp * Math.PI) * 0.42;
      const diveX = introX + Math.sin(hp * Math.PI * 0.85) * -0.55;

      camera.position.set(
        diveX + smoothPtr.current.x * 0.48 * (1 - hp * 0.5),
        diveY + smoothPtr.current.y * 0.28 * (1 - hp * 0.5),
        diveZ
      );

      camTarget.current.set(
        smoothPtr.current.x * 0.2,
        smoothPtr.current.y * 0.12 - hp * 0.18,
        lerp(0, -6.5, hp)
      );
      camera.lookAt(camTarget.current);
      camera.rotation.z = smoothPtr.current.x * -0.032 + Math.sin(hp * Math.PI) * 0.045;
    }
  });

  return (
    <>
      <fog attach="fog" args={['#080808', 7.5, 24]} />

      {/* Studio Three-Point + Cobalt / Signal Rim Lighting */}
      <ambientLight intensity={0.45} color="#f5f2eb" />
      <directionalLight ref={keyLightRef} position={[5, 6, 6]} intensity={3.4} color="#f5f2eb" />
      <pointLight position={[-4.5, -2.5, 3]} intensity={22} distance={14} color="#536BFF" />
      <pointLight position={[4.2, 2.2, 2.5]} intensity={16} distance={12} color="#FF5924" />
      <directionalLight position={[0, -5, -6]} intensity={1.8} color="#536BFF" />

      <group ref={rootRef}>
        {/* FOREGROUND: Brushed Graphite Gantry Columns & Glass Optic Baffles */}
        <group ref={fgLeftRef} position={[-3.35, 0, 2.6]}>
          <mesh>
            <boxGeometry args={[0.26, 6.2, 0.34]} />
            <meshStandardMaterial color="#1b1b1e" metalness={0.82} roughness={0.34} wireframe={wireframe} />
          </mesh>
          <mesh position={[0.22, 0.6, 0.2]}>
            <boxGeometry args={[0.04, 3.8, 0.68]} />
            <meshPhysicalMaterial
              color="#9fb0ff"
              roughness={0.18}
              metalness={0.1}
              transmission={0.62}
              transparent
              opacity={0.48}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0.15, -1.6, 0.22]}>
            <boxGeometry args={[0.14, 0.04, 0.45]} />
            <meshStandardMaterial color="#FF5924" emissive="#FF5924" emissiveIntensity={1.6} wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={fgRightRef} position={[3.35, 0, 2.6]}>
          <mesh>
            <boxGeometry args={[0.26, 6.2, 0.34]} />
            <meshStandardMaterial color="#1b1b1e" metalness={0.82} roughness={0.34} wireframe={wireframe} />
          </mesh>
          <mesh position={[-0.22, -0.5, 0.2]}>
            <boxGeometry args={[0.04, 3.8, 0.68]} />
            <meshPhysicalMaterial
              color="#9fb0ff"
              roughness={0.18}
              metalness={0.1}
              transmission={0.62}
              transparent
              opacity={0.48}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[-0.15, 1.6, 0.22]}>
            <boxGeometry args={[0.14, 0.04, 0.45]} />
            <meshStandardMaterial color="#536BFF" emissive="#536BFF" emissiveIntensity={1.8} wireframe={wireframe} />
          </mesh>
        </group>

        {/* MIDGROUND: Articulated Kinetic Gimbal Assembly */}
        <group ref={gimbalRef}>
          {/* Outer Matte Graphite Datum Ring + Radial Sensor Fins */}
          <group ref={ringOuterRef}>
            <mesh>
              <torusGeometry args={[2.35, 0.055, 14, seg]} />
              <meshStandardMaterial color="#252529" metalness={0.68} roughness={0.45} wireframe={wireframe} />
            </mesh>
            {radialFins.map((fin, idx) => (
              <group key={idx} position={[fin.x, fin.y, 0]} rotation={[0, 0, fin.angle]}>
                <mesh>
                  <boxGeometry args={[0.42, 0.09, 0.18]} />
                  <meshStandardMaterial color="#2b2b30" metalness={0.75} roughness={0.35} wireframe={wireframe} />
                </mesh>
                <mesh position={[0.24, 0, 0]}>
                  <boxGeometry args={[0.08, 0.03, 0.22]} />
                  <meshStandardMaterial
                    color={idx % 2 === 0 ? '#536BFF' : '#FF5924'}
                    emissive={idx % 2 === 0 ? '#536BFF' : '#FF5924'}
                    emissiveIntensity={1.4}
                    wireframe={wireframe}
                  />
                </mesh>
              </group>
            ))}
          </group>

          {/* Middle Brushed Chrome Precision Gimbal */}
          <group ref={ringMidRef}>
            <mesh>
              <torusGeometry args={[1.78, 0.032, 12, seg]} />
              <meshStandardMaterial color="#c8c6c0" metalness={0.94} roughness={0.18} wireframe={wireframe} />
            </mesh>
            {/* Floating technical display plates */}
            <mesh position={[1.78, 0, 0.26]} rotation={[0, -0.35, 0]}>
              <boxGeometry args={[0.44, 0.72, 0.02]} />
              <meshPhysicalMaterial
                color="#dce3ff"
                roughness={0.14}
                transmission={0.7}
                transparent
                opacity={0.55}
                wireframe={wireframe}
              />
            </mesh>
            <mesh position={[-1.78, 0, -0.26]} rotation={[0, 0.35, 0]}>
              <boxGeometry args={[0.44, 0.72, 0.02]} />
              <meshPhysicalMaterial
                color="#ffdcc9"
                roughness={0.16}
                transmission={0.68}
                transparent
                opacity={0.5}
                wireframe={wireframe}
              />
            </mesh>
          </group>

          {/* Inner Signal-Orange Vernier Gimbal */}
          <group ref={ringInnerRef}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.32, 0.018, 10, seg]} />
              <meshStandardMaterial color="#FF5924" emissive="#FF5924" emissiveIntensity={0.85} metalness={0.5} roughness={0.3} wireframe={wireframe} />
            </mesh>
          </group>

          {/* Faceted Glass Containment Prism around Custom GLSL Energy Core */}
          <group ref={prismRef}>
            <mesh>
              <octahedronGeometry args={[0.96, 0]} />
              <meshPhysicalMaterial
                color="#e9ecff"
                roughness={0.12}
                metalness={0.05}
                transmission={0.78}
                ior={1.45}
                thickness={0.6}
                transparent
                opacity={0.52}
                wireframe={wireframe}
              />
            </mesh>

            {/* Custom GLSL Displaced Lattice Core */}
            <mesh>
              <icosahedronGeometry args={[0.58, tier === 'low' ? 2 : 4]} />
              <shaderMaterial
                vertexShader={CORE_VERTEX}
                fragmentShader={CORE_FRAGMENT}
                uniforms={coreUniforms}
                transparent
                wireframe={wireframe || true}
              />
            </mesh>
          </group>

          {/* Conduit Cables */}
          {cables.map((geo, i) => (
            <mesh key={i} geometry={geo}>
              <meshStandardMaterial
                color={i % 2 === 0 ? '#32343d' : '#4a2b24'}
                metalness={0.6}
                roughness={0.4}
                wireframe={wireframe}
              />
            </mesh>
          ))}
        </group>

        {/* BACKGROUND: Receding Monolith Architecture & Perspective Datum Grid */}
        <group ref={bgGroupRef}>
          {monoliths.map((m, idx) => (
            <mesh key={idx} position={m.pos} scale={m.scale} rotation={m.rot}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#121215" metalness={0.45} roughness={0.72} wireframe={wireframe} />
            </mesh>
          ))}

          <gridHelper
            args={[46, 36, '#27315e', '#151519']}
            position={[0, -3.8, -8]}
          />
        </group>
      </group>
    </>
  );
}

