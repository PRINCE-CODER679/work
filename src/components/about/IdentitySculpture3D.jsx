import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { damp, lerp, prefersReducedMotion } from '../../animations/motion';
import { detectWebGL, isMobileWidth } from '../../utils/device';
import { pointer } from '../../utils/store';

const CHAPTER_PALETTES = [
  { primary: '#A855F7', secondary: '#536BFF', rim: '#E9D5FF' }, // 01 — AI & DATA SCIENCE
  { primary: '#536BFF', secondary: '#2FD3C4', rim: '#DCE3FF' }, // 02 — SOFTWARE DEVELOPMENT
  { primary: '#FF5924', secondary: '#A855F7', rim: '#FFE4D6' }, // 03 — CREATIVE ENGINEERING
  { primary: '#C084FC', secondary: '#FF5924', rim: '#FFFFFF' }, // 04 — BUILDING WHAT'S NEXT
];

/**
 * EXPERIENCE 2 — INTERACTIVE 3D IDENTITY SCULPTURE
 * Combines a polished metallic morphing core, a frosted-glass outer polyhedral shell,
 * three counter-rotating metallic/luminous orbital rings, and dynamic lighting that
 * shifts across the 4 Identity chapters in response to scroll progress and cursor motion.
 * Includes an automatic 2D perspective fallback when WebGL is unavailable.
 */
export function IdentitySculpture3D({ progressRef, activeChapter = 0 }) {
  const mountRef = useRef(null);
  const chapterRef = useRef(activeChapter);

  useEffect(() => {
    chapterRef.current = activeChapter;
  }, [activeChapter]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reduced = prefersReducedMotion();
    const canWebGL = detectWebGL();
    let rafId = 0;
    let cleanup = () => {};

    if (canWebGL) {
      let renderer = null;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        renderer = null;
      }

      if (renderer) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
        camera.position.set(0, 0, 6.2);

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileWidth() ? 1.5 : 1.75));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.className = 'id-sculpture__canvas';
        container.appendChild(renderer.domElement);

        const disposables = [];
        const track = (obj) => {
          if (obj) disposables.push(obj);
          return obj;
        };

        // Lights that shift color across the 4 identity chapters
        const ambient = new THREE.AmbientLight('#e9d5ff', 0.72);
        const keyLight = new THREE.DirectionalLight('#ffffff', 2.8);
        keyLight.position.set(3.5, 4.5, 4.0);
        const primaryLight = new THREE.PointLight('#A855F7', 22, 14);
        primaryLight.position.set(-2.6, 1.8, 2.5);
        const secondaryLight = new THREE.PointLight('#536BFF', 18, 14);
        secondaryLight.position.set(2.8, -1.6, 2.2);
        scene.add(ambient, keyLight, primaryLight, secondaryLight);

        const root = new THREE.Group();
        scene.add(root);

        // 1) Inner Polished Metallic Core
        const coreGeo = track(new THREE.OctahedronGeometry(0.92, 1));
        const coreMat = track(
          new THREE.MeshStandardMaterial({
            color: '#e6e0f8',
            emissive: '#3b1d70',
            emissiveIntensity: 0.48,
            metalness: 0.92,
            roughness: 0.14,
            flatShading: true,
          })
        );
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        root.add(coreMesh);

        // 2) Frosted Glass Faceted Outer Shell + Luminous Wireframe Edges
        const shellGeo = track(new THREE.IcosahedronGeometry(1.32, 0));
        const shellMat = track(
          new THREE.MeshPhysicalMaterial({
            color: '#dcd2ff',
            roughness: 0.18,
            metalness: 0.12,
            transmission: 0.68,
            transparent: true,
            opacity: 0.36,
            flatShading: true,
          })
        );
        const shellMesh = new THREE.Mesh(shellGeo, shellMat);
        root.add(shellMesh);

        const wireGeo = track(new THREE.IcosahedronGeometry(1.34, 0));
        const wireMat = track(
          new THREE.MeshBasicMaterial({
            color: '#c084fc',
            wireframe: true,
            transparent: true,
            opacity: 0.42,
          })
        );
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        root.add(wireMesh);

        // 3) Three Elegant Intersecting Metallic & Luminous Rings
        const ring1Geo = track(new THREE.TorusGeometry(1.78, 0.02, 16, 96));
        const ring1Mat = track(
          new THREE.MeshStandardMaterial({
            color: '#f5f3ff',
            emissive: '#a855f7',
            emissiveIntensity: 0.65,
            metalness: 0.88,
            roughness: 0.18,
          })
        );
        const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
        root.add(ring1);

        const ring2Geo = track(new THREE.TorusGeometry(2.08, 0.014, 14, 96));
        const ring2Mat = track(
          new THREE.MeshStandardMaterial({
            color: '#c4b5fd',
            emissive: '#536BFF',
            emissiveIntensity: 0.55,
            metalness: 0.85,
            roughness: 0.22,
          })
        );
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        root.add(ring2);

        const ring3Geo = track(new THREE.TorusGeometry(2.36, 0.01, 12, 96));
        const ring3Mat = track(
          new THREE.MeshBasicMaterial({
            color: '#FF5924',
            transparent: true,
            opacity: 0.55,
          })
        );
        const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
        root.add(ring3);

        // 4) Orbiting Micro-Nodes along the rings
        const satGroup = new THREE.Group();
        root.add(satGroup);
        const satGeo = track(new THREE.SphereGeometry(0.055, 12, 12));
        const satMat = track(new THREE.MeshBasicMaterial({ color: '#ffffff' }));
        for (let i = 0; i < 4; i++) {
          const sat = new THREE.Mesh(satGeo, satMat);
          const a = (i / 4) * Math.PI * 2;
          sat.position.set(Math.cos(a) * 1.78, Math.sin(a) * 1.78, 0);
          satGroup.add(sat);
        }

        const resize = () => {
          const r = container.getBoundingClientRect();
          const w = Math.max(1, r.width);
          const h = Math.max(1, r.height);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        };
        resize();
        window.addEventListener('resize', resize);

        const targetPrimaryCol = new THREE.Color();
        const targetSecondaryCol = new THREE.Color();
        let smoothX = 0;
        let smoothY = 0;
        let smoothProg = 0;
        let lastTime = performance.now();

        const animate = (now) => {
          const dt = Math.min(0.05, (now - lastTime) / 1000);
          lastTime = now;
          const t = now * 0.001;
          const motionMult = reduced ? 0.05 : 1;

          const rawProg = progressRef?.current ?? chapterRef.current / 3;
          smoothProg = damp(smoothProg, rawProg, 6, dt);

          const px = reduced ? 0 : pointer.x || 0;
          const py = reduced ? 0 : pointer.y || 0;
          smoothX = damp(smoothX, px, 5.5, dt);
          smoothY = damp(smoothY, py, 5.5, dt);

          // Active chapter palette interpolation
          const pal = CHAPTER_PALETTES[chapterRef.current] || CHAPTER_PALETTES[0];
          targetPrimaryCol.set(pal.primary);
          targetSecondaryCol.set(pal.secondary);
          primaryLight.color.lerp(targetPrimaryCol, 1 - Math.exp(-5 * dt));
          secondaryLight.color.lerp(targetSecondaryCol, 1 - Math.exp(-5 * dt));
          ring1Mat.emissive.lerp(targetPrimaryCol, 1 - Math.exp(-5 * dt));
          ring2Mat.emissive.lerp(targetSecondaryCol, 1 - Math.exp(-5 * dt));
          wireMat.color.lerp(targetPrimaryCol, 1 - Math.exp(-5 * dt));

          // Sculpture transformation driven by scroll progress + pointer parallax
          root.rotation.y = smoothX * 0.38 + smoothProg * Math.PI * 1.2;
          root.rotation.x = -smoothY * 0.28 + Math.sin(smoothProg * Math.PI) * 0.25;

          coreMesh.rotation.y = t * 0.45 * motionMult + smoothProg * 2.2;
          coreMesh.rotation.z = t * 0.28 * motionMult;
          const corePulse = 1 + Math.sin(t * 1.8) * 0.035 * motionMult;
          coreMesh.scale.setScalar(corePulse);

          shellMesh.rotation.y = -t * 0.24 * motionMult - smoothProg * 1.6;
          shellMesh.rotation.x = t * 0.18 * motionMult;
          wireMesh.rotation.copy(shellMesh.rotation);
          const shellScale = lerp(1.0, 1.12, Math.sin(smoothProg * Math.PI));
          shellMesh.scale.setScalar(shellScale);
          wireMesh.scale.setScalar(shellScale * 1.015);

          // Rings articulate into distinct geometric configurations per chapter
          ring1.rotation.x = Math.PI / 2.6 + smoothProg * 1.4 + Math.sin(t * 0.5) * 0.12 * motionMult;
          ring1.rotation.y = smoothProg * 0.9 + t * 0.22 * motionMult;

          ring2.rotation.x = -Math.PI / 3.1 - smoothProg * 1.2;
          ring2.rotation.y = Math.PI / 4 + t * -0.3 * motionMult;

          ring3.rotation.x = Math.PI / 5 + smoothProg * 1.8;
          ring3.rotation.z = t * 0.35 * motionMult;

          satGroup.rotation.copy(ring1.rotation);
          satGroup.rotation.z += t * 0.6 * motionMult;

          renderer.render(scene, camera);
          rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);

        cleanup = () => {
          window.removeEventListener('resize', resize);
          disposables.forEach((d) => d.dispose?.());
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        };
      }
    }

    // Graceful 2D Canvas Perspective Fallback when WebGL is disabled
    if (!container.querySelector('.id-sculpture__canvas')) {
      const canvas = document.createElement('canvas');
      canvas.className = 'id-sculpture__canvas';
      container.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      const resize2D = () => {
        const r = container.getBoundingClientRect();
        canvas.width = Math.max(1, r.width);
        canvas.height = Math.max(1, r.height);
      };
      resize2D();
      window.addEventListener('resize', resize2D);

      const draw2D = (now) => {
        const t = now * 0.001;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const cx = w * 0.5;
        const cy = h * 0.5;
        const baseR = Math.min(w, h) * 0.32;
        const pal = CHAPTER_PALETTES[chapterRef.current] || CHAPTER_PALETTES[0];

        const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, baseR * 1.15);
        glow.addColorStop(0, pal.rim);
        glow.addColorStop(0.35, pal.primary);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 1.15, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(t * (i % 2 === 0 ? 0.3 : -0.25) + i * 0.9);
          ctx.strokeStyle = i === 0 ? pal.primary : i === 1 ? pal.secondary : '#FF5924';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.ellipse(0, 0, baseR * (0.75 + i * 0.16), baseR * (0.32 + i * 0.08), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        rafId = requestAnimationFrame(draw2D);
      };
      rafId = requestAnimationFrame(draw2D);

      cleanup = () => {
        window.removeEventListener('resize', resize2D);
        if (canvas.parentNode === container) {
          container.removeChild(canvas);
        }
      };
    }

    return () => {
      cancelAnimationFrame(rafId);
      cleanup();
    };
  }, [progressRef]);

  return (
    <div ref={mountRef} className="id-sculpture" aria-hidden="true">
      <div className="id-sculpture__ambient" />
    </div>
  );
}

