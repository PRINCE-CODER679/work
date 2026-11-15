import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CORE_VERTEX,
  CORE_FRAGMENT,
  PORTRAIT_VERTEX,
  PORTRAIT_FRAGMENT,
  WATER_VERTEX,
  WATER_FRAGMENT,
  FILM_POST_VERTEX,
  FILM_POST_FRAGMENT,
} from '../shaders/coreShader';
import { damp, lerp, smooth } from '../animations/motion';
import { app, pointer, scenes, scroll } from '../utils/store';

/**
 * ASRAR MULLA — UNIFIED PERSISTENT 3D DIGITAL FILM WORLD
 * Continuous camera & lighting choreography from Hero Portrait Monolith (0%)
 * through orbital exhibition corridors and Lab wireframe space into the
 * full-circle Contact Halo Bust Finale over calm water ripples (100%).
 */
export function AsrarWorld({ wireframe = false, tier = 'high' }) {
  const { camera, scene, gl, size } = useThree();

  const rootRef = useRef(null);
  const portraitRef = useRef(null);
  const nameBackdropRef = useRef(null);
  const nameMatRef = useRef(null);
  const fgLeftRef = useRef(null);
  const fgRightRef = useRef(null);
  const ringOuterRef = useRef(null);
  const ringMidRef = useRef(null);
  const ringInnerRef = useRef(null);
  const haloRingRef = useRef(null);
  const coreGroupRef = useRef(null);
  const bgGroupRef = useRef(null);
  const waterRef = useRef(null);
  const dustRef = useRef(null);
  const keyLightRef = useRef(null);
  const rimOrangeRef = useRef(null);
  const rimCobaltRef = useRef(null);

  const smoothPtr = useRef({ x: 0, y: 0 });
  const smoothLab = useRef(0);
  const camTarget = useRef(new THREE.Vector3(0, 0.25, 0));
  const fboRef = useRef(null);

  // Load high-resolution 3D portrait asset (`public/assets/hero/asrar-3d.png`) into WebGL with maximum anisotropy
  const portraitTex = useMemo(() => {
    const tex = new THREE.TextureLoader().load('/assets/hero/asrar-3d.png', (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      const maxAniso = gl?.capabilities?.getMaxAnisotropy?.() || 16;
      loaded.anisotropy = Math.min(16, maxAniso);
      loaded.minFilter = THREE.LinearMipmapLinearFilter;
      loaded.magFilter = THREE.LinearFilter;
      loaded.generateMipmaps = true;
      loaded.needsUpdate = true;
      if (typeof window !== 'undefined' && window.__asrar) {
        window.__asrar.heroTexture = {
          loaded: true,
          width: loaded.image?.naturalWidth || loaded.image?.width || 768,
          height: loaded.image?.naturalHeight || loaded.image?.height || 1024,
        };
      }
    });
    tex.colorSpace = THREE.SRGBColorSpace;
    const maxAniso = gl?.capabilities?.getMaxAnisotropy?.() || 16;
    tex.anisotropy = Math.min(16, maxAniso);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    return tex;
  }, [gl]);

  useEffect(() => () => portraitTex.dispose(), [portraitTex]);

  // Monumental "ASRAR" spatial typography rendered behind the 3D full-body figure
  const nameBackdropTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const paint = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f5f2eb';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 355px "Archivo Variable", "Archivo", "Inter Tight", "Arial Black", sans-serif';
      ctx.fillText('ASRAR', canvas.width / 2, canvas.height / 2 + 10);
      tex.needsUpdate = true;
    };

    paint();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(paint);
    }
    return tex;
  }, []);

  useEffect(() => () => nameBackdropTex.dispose(), [nameBackdropTex]);

  const portraitUniforms = useMemo(
    () => ({
      uTexture: { value: portraitTex },
      uTime: { value: 0 },
      uDepth: { value: 0.42 },
      uReveal: { value: 0.15 },
      uFinale: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uCobalt: { value: new THREE.Color('#536BFF') },
      uSignal: { value: new THREE.Color('#FF5924') },
    }),
    [portraitTex]
  );

  const waterUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFinale: { value: 0 },
      uCobalt: { value: new THREE.Color('#536BFF') },
      uSignal: { value: new THREE.Color('#FF5924') },
    }),
    []
  );

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

  // Fullscreen cinema optical post-pass (vignette, grain, chromatic edge, subtle barrel)
  const postData = useMemo(() => {
    const postScene = new THREE.Scene();
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postUniforms = {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uCurve: { value: 0.022 },
    };
    const postMat = new THREE.ShaderMaterial({
      vertexShader: FILM_POST_VERTEX,
      fragmentShader: FILM_POST_FRAGMENT,
      uniforms: postUniforms,
      depthTest: false,
      depthWrite: false,
    });
    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
    postScene.add(postQuad);
    return { postScene, postCam, postMat, postUniforms, postQuad };
  }, []);

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, tier === 'low' ? 1 : 1.75);
    const w = Math.max(2, Math.round(size.width * dpr));
    const h = Math.max(2, Math.round(size.height * dpr));
    const rt = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    fboRef.current = rt;
    postData.postUniforms.tDiffuse.value = rt.texture;
    return () => {
      rt.dispose();
      fboRef.current = null;
    };
  }, [size.width, size.height, tier, postData]);

  useEffect(
    () => () => {
      postData.postMat.dispose();
      postData.postQuad.geometry.dispose();
    },
    [postData]
  );

  // Conduits & background monolith architecture
  const cables = useMemo(() => {
    const paths = [
      [[-3.8, 2.5, 1.5], [-2.5, 1.6, 0.4], [-1.9, 0.7, -0.4]],
      [[3.8, 2.4, 1.5], [2.45, 1.5, 0.4], [1.9, 0.65, -0.4]],
      [[-3.6, -2.1, 1.4], [-2.4, -1.2, 0.3], [-1.75, -0.5, -0.4]],
      [[3.6, -2.2, 1.4], [2.35, -1.3, 0.3], [1.75, -0.55, -0.4]],
    ];
    return paths.map((pts) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      return new THREE.TubeGeometry(curve, tier === 'low' ? 16 : 30, 0.02, 8, false);
    });
  }, [tier]);

  const monoliths = useMemo(
    () => [
      { pos: [-6.4, -0.8, -7.8], scale: [1.05, 8.2, 1.3], rot: [0, 0.25, 0] },
      { pos: [6.5, -0.6, -8.4], scale: [1.2, 8.6, 1.2], rot: [0, -0.28, 0] },
      { pos: [-4.4, 2.1, -11.6], scale: [1.6, 6.2, 0.9], rot: [0.04, 0.14, 0] },
      { pos: [4.8, -1.9, -12.2], scale: [1.8, 5.4, 1.0], rot: [-0.04, -0.16, 0] },
      { pos: [0.0, 5.1, -14.8], scale: [9.2, 0.48, 1.0], rot: [0, 0, 0] },
    ],
    []
  );

  // Subtle depth photon dust field kept cleanly behind focal portrait plane (z < -1.2)
  const dustGeo = useMemo(() => {
    const count = tier === 'low' ? 90 : 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.35) * 9.5;
      const z = -(Math.random() * 11 + 1.25);
      // Keep center halo aperture clear
      if (Math.abs(x) < 2.2 && z > -2.5) {
        x = x < 0 ? x - 2.4 : x + 2.4;
      }
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [tier]);

  const radialFins = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      arr.push({ angle: a, x: Math.cos(a) * 2.95, y: Math.sin(a) * 2.95 });
    }
    return arr;
  }, []);

  const seg = tier === 'low' ? 32 : 76;

  // Priority 1 render loop -> animates 3D film world + renders optical post-FX buffer cleanly
  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    const isMobile = state.size.width < 768;

    const px = app.reducedMotion ? 0 : pointer.x;
    const py = app.reducedMotion ? 0 : pointer.y;
    smoothPtr.current.x = damp(smoothPtr.current.x, px, 6.2, dt);
    smoothPtr.current.y = damp(smoothPtr.current.y, py, 6.2, dt);

    const hp = scenes.hero.progress; // 0..1 Hero scroll dive
    const intro = smooth(scenes.hero.intro); // 0..1 Opening dolly pullback
    const sp = scroll.progress; // 0..1 Global digital-film progress
    const labActive = scenes.lab.visible ? 1 : 0;
    smoothLab.current = damp(smoothLab.current, labActive, app.reducedMotion ? 20 : 4.5, dt);
    const labMix = smooth(Math.min(1, Math.max(0, smoothLab.current)));
    const cp = scenes.contact.progress; // 0..1 Contact Finale loop
    const contactActive = Math.min(1, Math.max(0, cp * 1.45));
    const contactMix = smooth(contactActive);

    // Portrait prominence: luminous Hero (hp < 0.9) and calm Contact Halo Bust Finale (contactActive > 0.02)
    const portraitHeroVis = 1 - smooth(Math.min(1, Math.max(0, (hp - 0.55) / 0.42)));
    const showPortrait = wireframe || portraitHeroVis > 0.02 || contactActive > 0.02;

    if (portraitRef.current) {
      portraitRef.current.visible = showPortrait;
      // Position vertical center so head has generous headroom below nav, and mobile CTA dock leaves full figure clear
      const pyOffset = lerp(isMobile ? 0.16 : -0.06, isMobile ? 0.42 : 0.45, contactActive);
      const pzOffset = lerp(0.12, -0.75, contactActive);
      portraitRef.current.position.set(
        smoothPtr.current.x * 0.12,
        pyOffset + smoothPtr.current.y * 0.07,
        pzOffset
      );
      portraitRef.current.rotation.y = smoothPtr.current.x * 0.22;
      portraitRef.current.rotation.x = -smoothPtr.current.y * 0.10;
      const pScale = isMobile ? 0.85 : 0.96;
      portraitRef.current.scale.setScalar(pScale * lerp(1.0, 0.94, contactActive));
    }

    // Spatial "ASRAR" typography behind the portrait figure with true depth parallax
    if (nameBackdropRef.current && nameMatRef.current) {
      const nameFade = (1 - smooth(Math.min(1, Math.max(0, hp / 0.52)))) * (1 - contactMix) * (1 - labMix);
      nameBackdropRef.current.visible = !wireframe && nameFade > 0.01;
      nameBackdropRef.current.position.set(
        -smoothPtr.current.x * 0.18,
        lerp(isMobile ? 0.42 : 0.56, 0.95, hp) - smoothPtr.current.y * 0.06,
        -1.05
      );
      const nameScale = isMobile ? 0.42 : 1.0;
      nameBackdropRef.current.scale.setScalar(nameScale * (1 + hp * 0.12));
      nameMatRef.current.opacity = 0.19 * Math.min(1, intro * 1.15) * nameFade;
    }

    // Shader uniforms
    portraitUniforms.uTime.value = t;
    portraitUniforms.uPointer.value.set(smoothPtr.current.x, smoothPtr.current.y);
    portraitUniforms.uReveal.value = Math.max(contactActive, Math.min(1, intro * 1.15));
    portraitUniforms.uFinale.value = contactActive;
    portraitUniforms.uDepth.value = app.reducedMotion ? 0.18 : 0.42;

    waterUniforms.uTime.value = t;
    waterUniforms.uFinale.value = contactActive;

    coreUniforms.uTime.value = t;
    coreUniforms.uScroll.value = hp;
    coreUniforms.uPointer.value.set(smoothPtr.current.x, smoothPtr.current.y);

    // Architectural rings orbit during Lab / contact modes only (hidden during Hero to keep 3D portrait clean & free of circular bullseye)
    const motionMult = app.reducedMotion ? 0.04 : 1;
    const gimbalsVis = Boolean(wireframe || labMix > 0.02 || (hp > 0.45 && contactActive < 0.2));
    if (ringOuterRef.current) {
      ringOuterRef.current.visible = gimbalsVis;
      ringOuterRef.current.rotation.z = t * 0.08 * motionMult + hp * 1.1 + sp * 1.6;
      ringOuterRef.current.rotation.x = Math.sin(t * 0.22) * 0.1 * motionMult + hp * 0.35;
    }
    if (ringMidRef.current) {
      ringMidRef.current.visible = gimbalsVis;
      ringMidRef.current.rotation.z = -t * 0.12 * motionMult - hp * 1.3;
      ringMidRef.current.rotation.y = smoothPtr.current.x * 0.28 + Math.sin(t * 0.35) * 0.18;
      ringMidRef.current.rotation.x = 0.2 + smoothPtr.current.y * 0.14;
    }
    if (ringInnerRef.current) {
      ringInnerRef.current.visible = gimbalsVis;
      ringInnerRef.current.rotation.z = t * 0.18 * motionMult + hp * 1.4;
      ringInnerRef.current.rotation.y = smoothPtr.current.x * 0.22;
      ringInnerRef.current.rotation.x = 0.16 + smoothPtr.current.y * 0.16;
    }
    if (haloRingRef.current) {
      haloRingRef.current.visible = Boolean(wireframe || contactActive > 0.05 || labMix > 0.05);
      haloRingRef.current.position.set(0, lerp(0.86, 0.88, contactActive), lerp(-0.95, -1.35, contactActive));
      haloRingRef.current.rotation.z = t * 0.05 * motionMult;
      haloRingRef.current.rotation.y = smoothPtr.current.x * 0.1;
      haloRingRef.current.scale.setScalar(isMobile ? 0.8 : lerp(0.95, 1.08, contactActive));
    }

    // Core lattice visible during Lab / wireframe inspector so mid-film digital world glows behind arena
    if (coreGroupRef.current) {
      coreGroupRef.current.visible = Boolean(wireframe || labMix > 0.02 || (hp > 0.55 && contactActive < 0.2));
      coreGroupRef.current.position.set(
        smoothPtr.current.x * 0.24 * labMix,
        lerp(0.35, -0.06 + smoothPtr.current.y * 0.14, labMix),
        lerp(-1.8, -1.55, labMix)
      );
      coreGroupRef.current.scale.setScalar(lerp(1.0, isMobile ? 1.15 : 1.48, labMix));
      coreGroupRef.current.rotation.y = t * 0.22 * motionMult + smoothPtr.current.x * 0.42;
      coreGroupRef.current.rotation.x = -smoothPtr.current.y * 0.28;
    }

    // Foreground architectural framing rails slide open on Hero scroll dive
    const railSpread = smooth(Math.min(1, Math.max(0, (hp - 0.1) / 0.55)));
    if (fgLeftRef.current && fgRightRef.current) {
      const baseX = isMobile ? 2.5 : 3.65;
      fgLeftRef.current.position.x = -baseX - railSpread * 3.1;
      fgLeftRef.current.position.z = 2.4 + railSpread * 2.2;
      fgRightRef.current.position.x = baseX + railSpread * 3.1;
      fgRightRef.current.position.z = 2.4 + railSpread * 2.2;
      fgLeftRef.current.visible = contactActive < 0.35 && portraitHeroVis > 0.05;
      fgRightRef.current.visible = contactActive < 0.35 && portraitHeroVis > 0.05;
    }

    if (waterRef.current) {
      waterRef.current.visible = portraitHeroVis > 0.02 || contactActive > 0.02 || labMix > 0.02;
    }
    if (dustRef.current && !app.reducedMotion) {
      dustRef.current.rotation.y = t * 0.018 + sp * 0.4;
    }

    // Dynamic lights shift warmth between Hero (#FF5924) and Contact Halo Finale (#536BFF)
    if (rimOrangeRef.current && rimCobaltRef.current && keyLightRef.current) {
      rimOrangeRef.current.intensity = lerp(24, 10, contactActive);
      rimCobaltRef.current.intensity = lerp(18, 28, contactActive);
      keyLightRef.current.intensity = lerp(3.2, 2.4, contactActive);
    }
    if (scene.fog) {
      scene.fog.near = lerp(7.0, 5.2, hp);
      scene.fog.far = lerp(23.0, 17.5, contactActive);
    }

    // 6-DOF CONTINUOUS DIGITAL FILM CAMERA CHOREOGRAPHY (zero discontinuity Hero -> Lab -> Contact)
    const baseZ = isMobile ? 8.2 : 6.45;
    const introX = lerp(0.65, 0, intro);
    const introY = lerp(0.35, 0.05, intro);
    const introZ = lerp(3.8, baseZ, intro);

    const diveZ = lerp(introZ, -3.4, smooth(hp));
    const diveY = introY + Math.sin(hp * Math.PI) * 0.35;
    const diveX = introX + Math.sin(hp * Math.PI * 0.85) * -0.45;

    const ptrAmp = 1 - hp * 0.45;
    const heroCamX = diveX + smoothPtr.current.x * 0.38 * ptrAmp;
    const heroCamY = diveY + smoothPtr.current.y * 0.18 * ptrAmp;
    const heroTgtX = smoothPtr.current.x * 0.14;
    const heroTgtY = 0.05 + smoothPtr.current.y * 0.08 - hp * 0.2;
    const heroTgtZ = lerp(0, -4.8, hp);

    // Lab exhibit vantage frames core lattice & orbital rings directly in front of camera
    const labCamX = smoothPtr.current.x * 0.55;
    const labCamY = 0.36 + smoothPtr.current.y * 0.26;
    const labCamZ = isMobile ? 5.9 : 4.25;

    const midCamX = lerp(heroCamX, labCamX, labMix);
    const midCamY = lerp(heroCamY, labCamY, labMix);
    const midCamZ = lerp(diveZ, labCamZ, labMix);
    const midTgtX = lerp(heroTgtX, smoothPtr.current.x * 0.16, labMix);
    const midTgtY = lerp(heroTgtY, 0.25, labMix);
    const midTgtZ = lerp(heroTgtZ, -1.65, labMix);

    // Full-circle finale pullback framing luminous Halo Bust over reflective water ripples
    const finaleZ = lerp(isMobile ? 7.4 : 5.8, isMobile ? 6.8 : 4.9, contactActive);
    const finaleCamX = smoothPtr.current.x * 0.34;
    const finaleCamY = 0.52 + smoothPtr.current.y * 0.18;

    camera.position.set(
      lerp(midCamX, finaleCamX, contactMix),
      lerp(midCamY, finaleCamY, contactMix),
      lerp(midCamZ, finaleZ, contactMix)
    );
    camTarget.current.set(
      lerp(midTgtX, smoothPtr.current.x * 0.08, contactMix),
      lerp(midTgtY, 0.42, contactMix),
      lerp(midTgtZ, -0.8, contactMix)
    );
    camera.lookAt(camTarget.current);
    camera.rotation.z = lerp(
      smoothPtr.current.x * -0.022 + Math.sin(hp * Math.PI) * 0.032,
      smoothPtr.current.x * -0.018,
      contactMix
    );

    // Composite scene through Cinema Optical Post-FX pass
    postData.postUniforms.uTime.value = t;
    postData.postUniforms.uVelocity.value = app.reducedMotion ? 0 : scroll.velocity;
    postData.postUniforms.uCurve.value = app.reducedMotion || isMobile ? 0.008 : 0.022;

    const rt = fboRef.current;
    if (rt && tier !== 'low') {
      gl.setRenderTarget(rt);
      gl.clear();
      gl.render(scene, camera);
      gl.setRenderTarget(null);
      gl.render(postData.postScene, postData.postCam);
    } else {
      gl.setRenderTarget(null);
      gl.render(scene, camera);
    }
  }, 1);

  return (
    <>
      <fog attach="fog" args={['#080808', 7.0, 23]} />

      <ambientLight intensity={0.42} color="#f5f2eb" />
      <directionalLight ref={keyLightRef} position={[4, 6, 5]} intensity={3.2} color="#f5f2eb" />
      <pointLight ref={rimCobaltRef} position={[-4.2, 1.2, 2.4]} intensity={18} distance={15} color="#536BFF" />
      <pointLight ref={rimOrangeRef} position={[3.8, 2.6, 2.2]} intensity={24} distance={14} color="#FF5924" />
      <directionalLight position={[0, -4, -5]} intensity={1.6} color="#536BFF" />

      <group ref={rootRef}>
        {/* ARCHITECTURAL NAME WORDMARK STRICTLY BEHIND 3D PORTRAIT FIGURE */}
        <mesh ref={nameBackdropRef} position={[0, 0.56, -1.05]} renderOrder={1}>
          <planeGeometry args={[8.4, 2.1]} />
          <meshBasicMaterial
            ref={nameMatRef}
            map={nameBackdropTex}
            transparent
            opacity={0.19}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* CENTRAL HERO & FINALE VOLUMETRIC RELIT PORTRAIT MONOLITH */}
        <mesh ref={portraitRef} position={[0, -0.06, 0.05]} renderOrder={2}>
          <planeGeometry args={[3.25, 4.06, tier === 'low' ? 28 : 54, tier === 'low' ? 36 : 68]} />
          <shaderMaterial
            vertexShader={PORTRAIT_VERTEX}
            fragmentShader={PORTRAIT_FRAGMENT}
            uniforms={portraitUniforms}
            transparent
            depthWrite={false}
            wireframe={wireframe}
          />
        </mesh>

        {/* LUMINOUS ARCHITECTURAL HALO RING FRAMING THE FIGURE */}
        <group ref={haloRingRef} position={[0, 0.55, -0.55]}>
          <mesh>
            <torusGeometry args={[2.02, 0.032, 14, seg]} />
            <meshStandardMaterial
              color="#d8d6cf"
              emissive="#536BFF"
              emissiveIntensity={0.68}
              metalness={0.85}
              roughness={0.22}
              wireframe={wireframe}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 6]}>
            <torusGeometry args={[2.22, 0.012, 10, seg]} />
            <meshStandardMaterial
              color="#FF5924"
              emissive="#FF5924"
              emissiveIntensity={0.85}
              wireframe={wireframe}
            />
          </mesh>
        </group>

        {/* OUTER & INNER KINETIC DATUM GIMBALS (positioned strictly behind portrait plane) */}
        <group position={[0, 0.72, -2.85]}>
          <group ref={ringOuterRef}>
            <mesh>
              <torusGeometry args={[2.95, 0.048, 12, seg]} />
              <meshStandardMaterial color="#232329" metalness={0.78} roughness={0.38} wireframe={wireframe} />
            </mesh>
            {radialFins.map((fin, idx) => (
              <group key={idx} position={[fin.x, fin.y, 0]} rotation={[0, 0, fin.angle]}>
                <mesh>
                  <boxGeometry args={[0.36, 0.075, 0.16]} />
                  <meshStandardMaterial color="#2a2a30" metalness={0.76} roughness={0.35} wireframe={wireframe} />
                </mesh>
                <mesh position={[0.21, 0, 0]}>
                  <boxGeometry args={[0.07, 0.025, 0.2]} />
                  <meshStandardMaterial
                    color={idx % 2 === 0 ? '#536BFF' : '#FF5924'}
                    emissive={idx % 2 === 0 ? '#536BFF' : '#FF5924'}
                    emissiveIntensity={1.5}
                    wireframe={wireframe}
                  />
                </mesh>
              </group>
            ))}
          </group>

          <group ref={ringMidRef}>
            <mesh>
              <torusGeometry args={[2.42, 0.024, 12, seg]} />
              <meshStandardMaterial color="#b9b7b0" metalness={0.92} roughness={0.18} wireframe={wireframe} />
            </mesh>
            <mesh position={[2.42, 0, 0.2]} rotation={[0, -0.35, 0]}>
              <boxGeometry args={[0.38, 0.65, 0.018]} />
              <meshPhysicalMaterial
                color="#dce3ff"
                roughness={0.14}
                transmission={0.68}
                transparent
                opacity={0.45}
                wireframe={wireframe}
              />
            </mesh>
            <mesh position={[-2.42, 0, -0.2]} rotation={[0, 0.35, 0]}>
              <boxGeometry args={[0.38, 0.65, 0.018]} />
              <meshPhysicalMaterial
                color="#ffdcc9"
                roughness={0.16}
                transmission={0.65}
                transparent
                opacity={0.42}
                wireframe={wireframe}
              />
            </mesh>
          </group>

          <group ref={ringInnerRef}>
            <mesh>
              <torusGeometry args={[1.95, 0.014, 10, seg]} />
              <meshStandardMaterial
                color="#FF5924"
                emissive="#FF5924"
                emissiveIntensity={0.75}
                wireframe={wireframe}
              />
            </mesh>
          </group>

          {cables.map((geo, i) => (
            <mesh key={i} geometry={geo}>
              <meshStandardMaterial
                color={i % 2 === 0 ? '#2b2d36' : '#402621'}
                metalness={0.65}
                roughness={0.42}
                wireframe={wireframe}
              />
            </mesh>
          ))}
        </group>

        {/* CONTAINED COMPUTATIONAL CORE LATTICE (revealed on mid-scroll / Lab wireframe mode) */}
        <group ref={coreGroupRef} visible={false}>
          <mesh>
            <octahedronGeometry args={[1.05, 0]} />
            <meshPhysicalMaterial
              color="#e9ecff"
              roughness={0.14}
              metalness={0.08}
              transmission={0.74}
              transparent
              opacity={0.46}
              wireframe={wireframe}
            />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.64, tier === 'low' ? 2 : 3]} />
            <shaderMaterial
              vertexShader={CORE_VERTEX}
              fragmentShader={CORE_FRAGMENT}
              uniforms={coreUniforms}
              transparent
              wireframe
            />
          </mesh>
        </group>

        {/* FOREGROUND FRAMING APERTURE COLUMNS */}
        <group ref={fgLeftRef} position={[-3.65, 0.1, 2.4]}>
          <mesh>
            <boxGeometry args={[0.2, 5.8, 0.28]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.32} wireframe={wireframe} />
          </mesh>
          <mesh position={[0.18, 0.45, 0.16]}>
            <boxGeometry args={[0.032, 3.6, 0.56]} />
            <meshPhysicalMaterial
              color="#9fb0ff"
              roughness={0.18}
              transmission={0.62}
              transparent
              opacity={0.42}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[0.12, -1.45, 0.18]}>
            <boxGeometry args={[0.12, 0.035, 0.36]} />
            <meshStandardMaterial color="#FF5924" emissive="#FF5924" emissiveIntensity={1.6} wireframe={wireframe} />
          </mesh>
        </group>

        <group ref={fgRightRef} position={[3.65, 0.1, 2.4]}>
          <mesh>
            <boxGeometry args={[0.2, 5.8, 0.28]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.32} wireframe={wireframe} />
          </mesh>
          <mesh position={[-0.18, -0.45, 0.16]}>
            <boxGeometry args={[0.032, 3.6, 0.56]} />
            <meshPhysicalMaterial
              color="#9fb0ff"
              roughness={0.18}
              transmission={0.62}
              transparent
              opacity={0.42}
              wireframe={wireframe}
            />
          </mesh>
          <mesh position={[-0.12, 1.45, 0.18]}>
            <boxGeometry args={[0.12, 0.035, 0.36]} />
            <meshStandardMaterial color="#536BFF" emissive="#536BFF" emissiveIntensity={1.7} wireframe={wireframe} />
          </mesh>
        </group>

        {/* REFLECTIVE HORIZON WATER RIPPLE FLOOR */}
        <mesh ref={waterRef} position={[0, -1.85, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[28, 28, tier === 'low' ? 16 : 36, tier === 'low' ? 16 : 36]} />
          <shaderMaterial
            vertexShader={WATER_VERTEX}
            fragmentShader={WATER_FRAGMENT}
            uniforms={waterUniforms}
            transparent
            wireframe={wireframe}
          />
        </mesh>

        {/* ATMOSPHERIC DEPTH DUST & BACKGROUND MONOLITHS */}
        <points ref={dustRef} geometry={dustGeo}>
          <pointsMaterial size={0.045} color="#a9b4ff" transparent opacity={0.48} sizeAttenuation />
        </points>

        <group ref={bgGroupRef}>
          {monoliths.map((m, idx) => (
            <mesh key={idx} position={m.pos} scale={m.scale} rotation={m.rot}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#111114" metalness={0.45} roughness={0.72} wireframe={wireframe} />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}

