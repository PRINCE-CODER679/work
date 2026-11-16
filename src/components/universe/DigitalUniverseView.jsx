import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { PROFILE } from '../../data/profile';
import { PROJECTS, PROJECT_BY_SLUG } from '../../data/projects';
import { TECH_CATEGORIES, TECH_NODES } from '../../data/stack';
import { DSA_MODULES } from '../../data/dsa';
import { damp, prefersReducedMotion } from '../../animations/motion';
import { detectWebGL, isMobileWidth } from '../../utils/device';
import { scrollToTarget } from '../../hooks/useSmoothScroll';
import { universeAudio } from '../../utils/universeAudio';

export const UNIVERSE_WORLDS = [
  {
    id: 'archive',
    index: '01',
    name: 'THE ARCHIVE',
    subtitle: 'PROJECTS & DEPLOYED SYSTEMS',
    color: '#536BFF',
    angle: 0,
    radius: 4.35,
    yOffset: 0.25,
    summary: 'Explore Asrar’s 4 deployed AI, Computer Vision, Clinical, and Creative Web applications.',
  },
  {
    id: 'lab',
    index: '02',
    name: 'THE LAB',
    subtitle: 'AI / ML, WEBGL & SYSTEMS STACK',
    color: '#A855F7',
    angle: (Math.PI * 2) / 5,
    radius: 4.35,
    yOffset: -0.22,
    summary: 'Interactive technology constellation and algorithmic architecture powering production builds.',
  },
  {
    id: 'journey',
    index: '03',
    name: 'THE JOURNEY',
    subtitle: 'DOCUMENTED MILESTONES',
    color: '#2FD3C4',
    angle: (Math.PI * 4) / 5,
    radius: 4.35,
    yOffset: 0.32,
    summary: 'Spatial timeline of academic foundations, DSAII Club initiatives, and shipped engineering systems.',
  },
  {
    id: 'signal',
    index: '04',
    name: 'THE SIGNAL',
    subtitle: 'VERIFIED CHANNELS & PRESENCE',
    color: '#FF5924',
    angle: (Math.PI * 6) / 5,
    radius: 4.35,
    yOffset: -0.28,
    summary: 'Direct communication Uplinks: GitHub, LinkedIn, Email, and Pune engineering coordinates.',
  },
  {
    id: 'frontier',
    index: '05',
    name: 'THE NEXT FRONTIER',
    subtitle: 'ACTIVE EXPLORATION & VECTORS',
    color: '#EC4899',
    angle: (Math.PI * 8) / 5,
    radius: 4.35,
    yOffset: 0.18,
    summary: 'What Asrar is currently researching and building across AI products, ML, and interactive 3D.',
  },
];

const JOURNEY_MILESTONES = [
  {
    step: '01',
    period: 'ACADEMIC FOUNDATION · PUNE',
    title: 'AI & Data Science Engineering',
    org: PROFILE.institution,
    detail:
      'Pursuing undergraduate engineering in Artificial Intelligence & Data Science in Pune, Maharashtra, focusing on machine learning systems, full-stack architecture, and computational problem solving.',
    tags: ['AI & Data Science', 'Python', 'C / C++', 'Pune, India'],
  },
  {
    step: '02',
    period: 'ALGORITHMIC CORE · RAAMBAD-ILAAJ',
    title: 'Data Structures & Systems Lab',
    org: 'github.com/PRINCE-CODER679/raambad-ilaaj',
    detail:
      'Implemented foundational C and Python data structures from scratch: binary search, infix-to-postfix expression stacks, singly linked lists, binary search trees, and BFS/DFS city graph traversals.',
    tags: ['Binary Search', 'Stacks', 'Linked Lists', 'BST', 'Graph BFS/DFS'],
  },
  {
    step: '03',
    period: PROFILE.club.period.toUpperCase(),
    title: PROFILE.club.name,
    org: PROFILE.club.role,
    detail: PROFILE.club.summary,
    tags: ['Workshops', 'Bootcamps', 'Hackathons', 'Collaborative AI/ML'],
  },
  {
    step: '04',
    period: "JAN 2026 · DEVKRAFT FLAGSHIP EVENT",
    title: PROFILE.eventRole.name,
    org: 'Creative Web Engineer',
    detail: PROFILE.eventRole.summary,
    tags: ['Three.js', 'React', '3D Coverflow Ring', 'Serverless Google Sheets API'],
  },
  {
    step: '05',
    period: '2026 · PRODUCTION AI & CLINICAL SYSTEMS',
    title: 'SpendSense AI, SignSense AI & MediKiosk',
    org: 'Full-Stack & ML Pipeline Architecture',
    detail:
      'Shipped three live full-stack AI applications: automated CSV/XLSX bank statement forecasting (SpendSense AI), real-time 21-landmark 3D ASL hand tracking (SignSense AI), and multilingual OPD clinical triage for Smart India Hackathon 2026 (MediKiosk).',
    tags: ['FastAPI', 'MediaPipe', 'scikit-learn', 'MongoDB', 'SIH 2026'],
  },
];

/**
 * UNLOCKED 3D DIGITAL UNIVERSE VIEW
 * Features a real Three.js 3D interactive solar/orbital installation (with automatic 2D projection fallback),
 * central luminous ASRAR monolith, 5 orbiting holographic world structures, drag-to-orbit camera controls,
 * and rich interactive inspection views for all 5 destinations.
 */
export function DigitalUniverseView({
  audioOn,
  onToggleAudio,
  onReplayUnlock,
  onExitUniverse,
  onOpenCase,
}) {
  const mountRef = useRef(null);
  const pinRefs = useRef([]);

  const [activeWorldId, setActiveWorldId] = useState(null);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState(PROJECTS[0].slug);
  const [selectedTechCat, setSelectedTechCat] = useState('all');
  const [selectedTechId, setSelectedTechId] = useState('python');
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState(0);
  const [selectedFrontierIdx, setSelectedFrontierIdx] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const activeWorld = useMemo(
    () => UNIVERSE_WORLDS.find((w) => w.id === activeWorldId) || null,
    [activeWorldId]
  );

  const activeWorldRef = useRef(null);
  useEffect(() => {
    activeWorldRef.current = activeWorldId;
  }, [activeWorldId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && activeWorldRef.current) {
        setActiveWorldId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Manage optional ambient drone while inside the universe
  useEffect(() => {
    if (audioOn) {
      universeAudio.startAmbient();
    } else {
      universeAudio.stopAmbient();
    }
    return () => universeAudio.stopAmbient();
  }, [audioOn]);

  // Select a world with audio feedback
  const handleSelectWorld = (worldId, index = 0) => {
    universeAudio.playWorldSelect(index);
    setActiveWorldId((prev) => (prev === worldId ? null : worldId));
  };

  // Copy email helper in THE SIGNAL world
  const handleCopyEmail = () => {
    try {
      navigator.clipboard?.writeText(PROFILE.links.email);
    } catch {}
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Three.js 3D Interactive Universe Renderer (with automatic 2D Canvas fallback if WebGL is disabled)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reduced = prefersReducedMotion();
    const canWebGL = detectWebGL();
    const orbitDrag = {
      isDown: false,
      startX: 0,
      startY: 0,
      moved: 0,
      targetAzimuth: 0.25,
      azimuth: 0.25,
      targetPolar: 0.32,
      polar: 0.32,
    };

    const onPointerDown = (e) => {
      if (e.target.closest('button, a, .universe-panel')) return;
      orbitDrag.isDown = true;
      orbitDrag.startX = e.clientX;
      orbitDrag.startY = e.clientY;
      orbitDrag.moved = 0;
    };

    const onPointerMove = (e) => {
      if (!orbitDrag.isDown) return;
      const dx = e.clientX - orbitDrag.startX;
      const dy = e.clientY - orbitDrag.startY;
      orbitDrag.moved += Math.hypot(dx, dy);
      orbitDrag.startX = e.clientX;
      orbitDrag.startY = e.clientY;
      orbitDrag.targetAzimuth -= dx * 0.0055;
      orbitDrag.targetPolar = Math.max(0.08, Math.min(0.68, orbitDrag.targetPolar + dy * 0.004));
    };

    const onPointerUp = () => {
      orbitDrag.isDown = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    let rafId = 0;
    let cleanupRenderer = () => {};

    if (canWebGL) {
      let renderer = null;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        });
      } catch {
        renderer = null;
      }

      if (renderer) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#05040a');
        scene.fog = new THREE.FogExp2('#05040a', 0.042);

        const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 80);
        camera.position.set(0, 2.6, 9.2);

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileWidth() ? 1.5 : 1.75));
        renderer.domElement.className = 'universe-stage__canvas';
        container.appendChild(renderer.domElement);

        // Lighting
        const ambient = new THREE.AmbientLight('#dcd6f7', 0.65);
        const coreLight = new THREE.PointLight('#9333EA', 24, 18);
        coreLight.position.set(0, 0.5, 0);
        const rimBlue = new THREE.DirectionalLight('#536BFF', 2.4);
        rimBlue.position.set(-6, 5, 4);
        const rimViolet = new THREE.DirectionalLight('#C084FC', 2.0);
        rimViolet.position.set(6, 4, -4);
        scene.add(ambient, coreLight, rimBlue, rimViolet);

        // Disposables tracker
        const disposables = [];
        const track = (obj) => {
          if (obj) disposables.push(obj);
          return obj;
        };

        // 1) Central Luminous ASRAR Core Structure
        const coreGroup = new THREE.Group();
        scene.add(coreGroup);

        const crystalGeo = track(new THREE.OctahedronGeometry(0.92, 0));
        const crystalMat = track(
          new THREE.MeshStandardMaterial({
            color: '#e9d5ff',
            emissive: '#6d28d9',
            emissiveIntensity: 0.75,
            metalness: 0.85,
            roughness: 0.18,
          })
        );
        const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
        coreGroup.add(crystalMesh);

        const wireGeo = track(new THREE.IcosahedronGeometry(1.22, 1));
        const wireMat = track(
          new THREE.MeshBasicMaterial({
            color: '#a855f7',
            wireframe: true,
            transparent: true,
            opacity: 0.42,
          })
        );
        const wireMesh = new THREE.Mesh(wireGeo, wireMat);
        coreGroup.add(wireMesh);

        const coreRing1Geo = track(new THREE.TorusGeometry(1.58, 0.018, 12, 72));
        const coreRing1Mat = track(
          new THREE.MeshBasicMaterial({ color: '#c084fc', transparent: true, opacity: 0.75 })
        );
        const coreRing1 = new THREE.Mesh(coreRing1Geo, coreRing1Mat);
        coreRing1.rotation.x = Math.PI / 2.4;
        coreGroup.add(coreRing1);

        const coreRing2Geo = track(new THREE.TorusGeometry(1.88, 0.014, 12, 72));
        const coreRing2Mat = track(
          new THREE.MeshBasicMaterial({ color: '#536BFF', transparent: true, opacity: 0.58 })
        );
        const coreRing2 = new THREE.Mesh(coreRing2Geo, coreRing2Mat);
        coreRing2.rotation.x = -Math.PI / 3;
        coreRing2.rotation.y = Math.PI / 5;
        coreGroup.add(coreRing2);

        // 2) Main Orbital Pathway Rings
        const orbitTrackGeo = track(new THREE.TorusGeometry(4.35, 0.012, 8, 120));
        const orbitTrackMat = track(
          new THREE.MeshBasicMaterial({
            color: '#7c3aed',
            transparent: true,
            opacity: 0.34,
          })
        );
        const orbitTrack = new THREE.Mesh(orbitTrackGeo, orbitTrackMat);
        orbitTrack.rotation.x = Math.PI / 2;
        scene.add(orbitTrack);

        const outerTrackGeo = track(new THREE.TorusGeometry(6.1, 0.008, 8, 120));
        const outerTrackMat = track(
          new THREE.MeshBasicMaterial({
            color: '#536BFF',
            transparent: true,
            opacity: 0.18,
          })
        );
        const outerTrack = new THREE.Mesh(outerTrackGeo, outerTrackMat);
        outerTrack.rotation.x = Math.PI / 2.08;
        scene.add(outerTrack);

        // 3) Five Distinct 3D Holographic World Sculptures
        const worldNodes = UNIVERSE_WORLDS.map((w, idx) => {
          const group = new THREE.Group();
          const col = new THREE.Color(w.color);

          // Unique 3D sculpture per world
          let mainGeo;
          if (w.id === 'archive') {
            mainGeo = track(new THREE.BoxGeometry(0.62, 0.82, 0.62));
          } else if (w.id === 'lab') {
            mainGeo = track(new THREE.IcosahedronGeometry(0.52, 0));
          } else if (w.id === 'journey') {
            mainGeo = track(new THREE.ConeGeometry(0.48, 0.92, 6));
          } else if (w.id === 'signal') {
            mainGeo = track(new THREE.OctahedronGeometry(0.52, 1));
          } else {
            mainGeo = track(new THREE.DodecahedronGeometry(0.5, 0));
          }

          const mat = track(
            new THREE.MeshStandardMaterial({
              color: col,
              emissive: col,
              emissiveIntensity: 0.55,
              metalness: 0.72,
              roughness: 0.24,
            })
          );
          const mesh = new THREE.Mesh(mainGeo, mat);
          group.add(mesh);

          // Local orbital halo + wireframe shell around each world
          const wireShellGeo = track(new THREE.IcosahedronGeometry(0.68, 0));
          const wireShellMat = track(
            new THREE.MeshBasicMaterial({
              color: col,
              wireframe: true,
              transparent: true,
              opacity: 0.34,
            })
          );
          const wireShell = new THREE.Mesh(wireShellGeo, wireShellMat);
          group.add(wireShell);

          const haloGeo = track(new THREE.TorusGeometry(0.86, 0.016, 10, 48));
          const haloMat = track(
            new THREE.MeshBasicMaterial({
              color: col,
              transparent: true,
              opacity: 0.78,
            })
          );
          const halo = new THREE.Mesh(haloGeo, haloMat);
          halo.rotation.x = Math.PI / 2.3;
          group.add(halo);

          scene.add(group);
          return { data: w, idx, group, mesh, halo, wireShell };
        });

        // 4) Starfield Particles
        const starCount = isMobileWidth() ? 420 : 950;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
          const r = 8 + Math.random() * 24;
          const theta = Math.random() * Math.PI * 2;
          const phi = (Math.random() - 0.5) * Math.PI * 0.85;
          starPositions[i * 3] = r * Math.cos(phi) * Math.cos(theta);
          starPositions[i * 3 + 1] = r * Math.sin(phi);
          starPositions[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
        }
        const starGeo = track(new THREE.BufferGeometry());
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = track(
          new THREE.PointsMaterial({
            size: 0.055,
            color: '#d8b4fe',
            transparent: true,
            opacity: 0.65,
            sizeAttenuation: true,
          })
        );
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        const resize = () => {
          const rect = container.getBoundingClientRect();
          const w = Math.max(1, rect.width);
          const h = Math.max(1, rect.height);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
        };
        resize();
        window.addEventListener('resize', resize);

        const camPos = new THREE.Vector3(0, 2.8, 9.5);
        const camLook = new THREE.Vector3(0, 0, 0);
        const targetPos = new THREE.Vector3();
        const targetLook = new THREE.Vector3();
        const projVec = new THREE.Vector3();

        let lastTime = performance.now();
        const animate = (now) => {
          const dt = Math.min(0.05, (now - lastTime) / 1000);
          lastTime = now;
          const t = now * 0.001;
          const motionScale = reduced ? 0.05 : 1;

          if (!orbitDrag.isDown && !activeWorldRef.current && !reduced) {
            orbitDrag.targetAzimuth += dt * 0.075;
          }
          orbitDrag.azimuth = damp(orbitDrag.azimuth, orbitDrag.targetAzimuth, 6, dt);
          orbitDrag.polar = damp(orbitDrag.polar, orbitDrag.targetPolar, 6, dt);

          // Animate central ASRAR core
          crystalMesh.rotation.y = t * 0.45 * motionScale;
          crystalMesh.rotation.x = Math.sin(t * 0.6) * 0.18 * motionScale;
          wireMesh.rotation.y = -t * 0.28 * motionScale;
          coreRing1.rotation.z = t * 0.35 * motionScale;
          coreRing2.rotation.z = -t * 0.25 * motionScale;
          stars.rotation.y = t * 0.015 * motionScale;

          // Update 5 world positions
          let focusedWorldGroup = null;
          worldNodes.forEach((wn) => {
            const a = wn.data.angle + t * 0.06 * motionScale;
            const wx = Math.cos(a) * wn.data.radius;
            const wz = Math.sin(a) * wn.data.radius;
            const wy = wn.data.yOffset + Math.sin(t * 1.4 + wn.idx) * 0.14 * motionScale;
            wn.group.position.set(wx, wy, wz);
            wn.mesh.rotation.y = t * 0.7 * motionScale + wn.idx;
            wn.mesh.rotation.x = t * 0.4 * motionScale;
            if (wn.wireShell) {
              wn.wireShell.rotation.y = -t * 0.45 * motionScale;
              wn.wireShell.rotation.z = t * 0.3 * motionScale;
            }
            wn.halo.rotation.z = -t * 0.5 * motionScale;

            const isSelected = activeWorldRef.current === wn.data.id;
            const targetScale = isSelected ? 1.42 : 1.0;
            wn.group.scale.setScalar(damp(wn.group.scale.x, targetScale, 8, dt));
            if (isSelected) focusedWorldGroup = wn.group;
          });

          // Camera choreography: overview orbit vs focused world close-up
          const isMob = isMobileWidth();
          if (focusedWorldGroup) {
            const wp = focusedWorldGroup.position;
            const radial = wp.clone().normalize();
            const dist = isMob ? 4.2 : 3.2;
            targetPos.copy(wp).addScaledVector(radial, dist);
            targetPos.y = wp.y + (isMob ? 1.6 : 1.05);
            // Offset look target slightly so 3D sculpture sits nicely beside the inspection panel
            targetLook.set(wp.x + (isMob ? 0 : radial.z * -0.85), wp.y - (isMob ? 0.4 : 0), wp.z);
          } else {
            const dist = isMob ? 11.4 : 9.2;
            targetPos.set(
              Math.sin(orbitDrag.azimuth) * Math.cos(orbitDrag.polar) * dist,
              Math.sin(orbitDrag.polar) * dist + 0.5,
              Math.cos(orbitDrag.azimuth) * Math.cos(orbitDrag.polar) * dist
            );
            targetLook.set(0, 0, 0);
          }

          camPos.lerp(targetPos, 1 - Math.exp(-5.5 * dt));
          camLook.lerp(targetLook, 1 - Math.exp(-6.5 * dt));
          camera.position.copy(camPos);
          camera.lookAt(camLook);

          renderer.render(scene, camera);

          // Project 3D world positions to 2D spatial HUD pins
          const cw = container.clientWidth;
          const ch = container.clientHeight;
          worldNodes.forEach((wn, i) => {
            const pinEl = pinRefs.current[i];
            if (!pinEl) return;
            projVec.copy(wn.group.position);
            projVec.y += 0.92;
            projVec.project(camera);
            if (projVec.z > 1) {
              pinEl.style.opacity = '0';
              pinEl.style.pointerEvents = 'none';
            } else {
              const sx = (projVec.x * 0.5 + 0.5) * cw;
              const sy = (-projVec.y * 0.5 + 0.5) * ch;
              // Clamp inside container with safe padding so pins never cause horizontal overflow
              const clampedX = Math.max(58, Math.min(cw - 58, sx));
              const clampedY = Math.max(76, Math.min(ch - 115, sy));
              pinEl.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0) translate(-50%, -50%)`;
              pinEl.style.opacity = activeWorldRef.current && activeWorldRef.current !== wn.data.id ? '0.42' : '1';
              pinEl.style.pointerEvents = 'auto';
            }
          });

          rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);

        cleanupRenderer = () => {
          window.removeEventListener('resize', resize);
          disposables.forEach((d) => d.dispose?.());
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        };
      }
    }

    // Graceful 2D Perspective Canvas Fallback when WebGL is disabled (--disable-webgl)
    if (!container.querySelector('.universe-stage__canvas')) {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.className = 'universe-stage__canvas';
      container.appendChild(fallbackCanvas);
      const ctx = fallbackCanvas.getContext('2d');

      const resize2D = () => {
        const r = container.getBoundingClientRect();
        fallbackCanvas.width = Math.max(1, r.width);
        fallbackCanvas.height = Math.max(1, r.height);
      };
      resize2D();
      window.addEventListener('resize', resize2D);

      const animate2D = (now) => {
        const t = now * 0.001;
        const w = fallbackCanvas.width;
        const h = fallbackCanvas.height;
        ctx.fillStyle = '#05040a';
        ctx.fillRect(0, 0, w, h);

        const cx = w * 0.5;
        const cy = h * 0.48;
        const rx = Math.min(w, h) * 0.34;
        const ry = rx * 0.42;

        // Draw orbital path
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Central ASRAR Core
        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 46);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#a855f7');
        grad.addColorStop(1, 'rgba(109, 40, 217, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 46, 0, Math.PI * 2);
        ctx.fill();

        UNIVERSE_WORLDS.forEach((world, i) => {
          const a = world.angle + t * 0.1 + orbitDrag.targetAzimuth;
          const wx = cx + Math.cos(a) * rx;
          const wy = cy + Math.sin(a) * ry;

          ctx.fillStyle = world.color;
          ctx.beginPath();
          ctx.arc(wx, wy, 9, 0, Math.PI * 2);
          ctx.fill();

          const pinEl = pinRefs.current[i];
          if (pinEl) {
            const clampedX = Math.max(58, Math.min(w - 58, wx));
            const clampedY = Math.max(76, Math.min(h - 115, wy - 24));
            pinEl.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0) translate(-50%, -50%)`;
            pinEl.style.opacity = '1';
            pinEl.style.pointerEvents = 'auto';
          }
        });

        rafId = requestAnimationFrame(animate2D);
      };
      rafId = requestAnimationFrame(animate2D);

      cleanupRenderer = () => {
        window.removeEventListener('resize', resize2D);
        if (fallbackCanvas.parentNode === container) {
          container.removeChild(fallbackCanvas);
        }
      };
    }

    return () => {
      cancelAnimationFrame(rafId);
      cleanupRenderer();
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const selectedProject = PROJECT_BY_SLUG[selectedProjectSlug] || PROJECTS[0];
  const selectedTech = TECH_NODES.find((n) => n.id === selectedTechId) || TECH_NODES[0];
  const filteredTechNodes = useMemo(
    () => (selectedTechCat === 'all' ? TECH_NODES : TECH_NODES.filter((n) => n.cat === selectedTechCat)),
    [selectedTechCat]
  );

  return (
    <div className="universe-stage" role="region" aria-label="Asrar's Unlocked 3D Digital Universe">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="universe-stage__viewport" />

      {/* Projected 3D Spatial World Pins */}
      <div className="universe-stage__pins">
        {UNIVERSE_WORLDS.map((w, idx) => {
          const isSelected = activeWorldId === w.id;
          return (
            <button
              key={w.id}
              ref={(el) => (pinRefs.current[idx] = el)}
              type="button"
              className={`universe-pin ${isSelected ? 'is-active' : ''}`}
              style={{ '--world-accent': w.color }}
              onClick={() => handleSelectWorld(w.id, idx)}
            >
              <span className="universe-pin__dot" aria-hidden="true" />
              <span className="universe-pin__idx mono">{w.index}</span>
              <span className="universe-pin__name mono">{w.name}</span>
            </button>
          );
        })}
      </div>

      {/* Top Universe Bar & Welcome Title */}
      <header className="universe-header">
        <div className="universe-header__left">
          <div className="universe-header__kicker mono">
            <span className="universe-header__pulse" aria-hidden="true" />
            <span>DIMENSION UNLOCKED · ASRAR // CORE</span>
          </div>
          <h3 className="display universe-header__title">WELCOME TO MY DIGITAL UNIVERSE</h3>
          <p className="universe-header__hint mono">
            {activeWorld
              ? `EXPLORING WORLD ${activeWorld.index} — ${activeWorld.name}`
              : 'DRAG TO ORBIT IN 3D · SELECT ANY OF THE 5 WORLDS TO EXPLORE'}
          </p>
        </div>

        <div className="universe-header__actions mono">
          {activeWorld && (
            <button
              type="button"
              className="universe-ctrl-btn is-primary"
              onClick={() => setActiveWorldId(null)}
            >
              ← OVERVIEW
            </button>
          )}
          <button
            type="button"
            className={`universe-ctrl-btn ${audioOn ? 'is-active' : ''}`}
            onClick={onToggleAudio}
          >
            AUDIO: {audioOn ? 'ON' : 'OFF'}
          </button>
          <button type="button" className="universe-ctrl-btn" onClick={onReplayUnlock}>
            REPLAY PORTAL
          </button>
          <button type="button" className="universe-ctrl-btn" onClick={onExitUniverse}>
            EXIT TO PORTFOLIO
          </button>
        </div>
      </header>

      {/* =====================================================================
          INTERACTIVE HOLOGRAPHIC WORLD INSPECTION PANEL (WORLDS 01 — 05)
          ===================================================================== */}
      {activeWorld && (
        <aside
          className="universe-panel"
          style={{ '--world-accent': activeWorld.color }}
          aria-label={`${activeWorld.name} Interactive Destination`}
        >
          <div className="universe-panel__top">
            <div>
              <div className="mono universe-panel__tag">
                WORLD {activeWorld.index} · {activeWorld.subtitle}
              </div>
              <h4 className="display universe-panel__heading">{activeWorld.name}</h4>
            </div>
            <button
              type="button"
              className="universe-panel__close mono"
              onClick={() => setActiveWorldId(null)}
              aria-label="Return to Universe Overview"
            >
              CLOSE [ESC]
            </button>
          </div>

          {/* WORLD 01 — THE ARCHIVE (VERIFIED PROJECTS) */}
          {activeWorld.id === 'archive' && (
            <div className="universe-panel__body">
              <div className="universe-tabs" role="tablist" aria-label="Select Project">
                {PROJECTS.map((proj) => (
                  <button
                    key={proj.slug}
                    type="button"
                    role="tab"
                    aria-selected={selectedProject.slug === proj.slug}
                    className={`universe-tab mono ${selectedProject.slug === proj.slug ? 'is-active' : ''}`}
                    onClick={() => setSelectedProjectSlug(proj.slug)}
                  >
                    <span>{proj.index}</span>
                    <span>{proj.shortTitle}</span>
                  </button>
                ))}
              </div>

              <div className="universe-archive-card">
                <div className="universe-archive-card__media">
                  <img
                    src={selectedProject.screens[0]?.src}
                    alt={selectedProject.title}
                    loading="lazy"
                  />
                  <span className="universe-archive-card__badge mono">
                    {selectedProject.category} · {selectedProject.year}
                  </span>
                </div>

                <div className="universe-archive-card__info">
                  <h5 className="display universe-archive-card__title">{selectedProject.title}</h5>
                  <p className="universe-archive-card__summary">{selectedProject.summary}</p>
                  <p className="universe-archive-card__impl">{selectedProject.implementation}</p>

                  <div className="universe-chip-row">
                    {selectedProject.stack.map((tech) => (
                      <span key={tech} className="universe-chip mono">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="universe-archive-card__links mono">
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="universe-action-link is-solid"
                    >
                      LIVE DEPLOYMENT ↗
                    </a>
                    <a
                      href={selectedProject.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="universe-action-link"
                    >
                      GITHUB REPO ↗
                    </a>
                    {onOpenCase && (
                      <button
                        type="button"
                        className="universe-action-link"
                        onClick={() => onOpenCase(selectedProject.slug)}
                      >
                        FULL CASE STUDY →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORLD 02 — THE LAB (VERIFIED TECH STACK & DSA SYSTEMS) */}
          {activeWorld.id === 'lab' && (
            <div className="universe-panel__body">
              <div className="universe-tabs" role="group" aria-label="Filter Technology Category">
                {TECH_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`universe-tab mono ${selectedTechCat === cat.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedTechCat(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="universe-lab-grid">
                <div className="universe-lab-nodes">
                  {filteredTechNodes.map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      className={`universe-tech-pill mono ${selectedTech.id === node.id ? 'is-active' : ''}`}
                      onClick={() => setSelectedTechId(node.id)}
                    >
                      {node.name}
                    </button>
                  ))}
                </div>

                <div className="universe-lab-detail">
                  <div className="mono muted">ACTIVE LAB MODULE</div>
                  <h5 className="display universe-lab-detail__title">{selectedTech.name}</h5>
                  <p className="universe-lab-detail__note">{selectedTech.note}</p>

                  <div className="mono muted" style={{ marginTop: '0.75rem', fontSize: '0.68rem' }}>
                    POWERING DEPLOYED SYSTEMS:
                  </div>
                  <div className="universe-chip-row" style={{ marginTop: '0.4rem' }}>
                    {selectedTech.projects.length === 0 ? (
                      <span className="universe-chip mono">DSA &amp; C/Python Algorithms (raambad-ilaaj)</span>
                    ) : (
                      selectedTech.projects.map((slug) => {
                        const p = PROJECT_BY_SLUG[slug];
                        if (!p) return null;
                        return (
                          <button
                            key={slug}
                            type="button"
                            className="universe-chip mono is-clickable"
                            onClick={() => {
                              setSelectedProjectSlug(slug);
                              setActiveWorldId('archive');
                            }}
                          >
                            {p.index} · {p.title} →
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="universe-dsa-strip">
                    <div className="mono muted" style={{ fontSize: '0.66rem', marginBottom: '0.35rem' }}>
                      VERIFIED DSA MODULES (PRINCE-CODER679/raambad-ilaaj):
                    </div>
                    <div className="universe-chip-row">
                      {DSA_MODULES.map((m) => (
                        <span key={m.id} className="universe-chip mono">
                          {m.index} · {m.name} ({m.complexity.split('·')[0].trim()})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORLD 03 — THE JOURNEY (GENUINE SPATIAL TIMELINE) */}
          {activeWorld.id === 'journey' && (
            <div className="universe-panel__body">
              <div className="universe-tabs" role="tablist" aria-label="Select Milestone">
                {JOURNEY_MILESTONES.map((ms, i) => (
                  <button
                    key={ms.step}
                    type="button"
                    role="tab"
                    aria-selected={selectedMilestoneIdx === i}
                    className={`universe-tab mono ${selectedMilestoneIdx === i ? 'is-active' : ''}`}
                    onClick={() => setSelectedMilestoneIdx(i)}
                  >
                    STEP {ms.step}
                  </button>
                ))}
              </div>

              {(() => {
                const ms = JOURNEY_MILESTONES[selectedMilestoneIdx] || JOURNEY_MILESTONES[0];
                return (
                  <div className="universe-journey-card">
                    <div className="mono universe-journey-card__period">{ms.period}</div>
                    <h5 className="display universe-journey-card__title">{ms.title}</h5>
                    <div className="mono universe-journey-card__org">{ms.org}</div>
                    <p className="universe-journey-card__detail">{ms.detail}</p>
                    <div className="universe-chip-row">
                      {ms.tags.map((tag) => (
                        <span key={tag} className="universe-chip mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* WORLD 04 — THE SIGNAL (VERIFIED PROFESSIONAL PRESENCE) */}
          {activeWorld.id === 'signal' && (
            <div className="universe-panel__body">
              <p className="universe-signal-intro">
                Direct verified communication channels and engineering repositories for{' '}
                <strong>{PROFILE.name}</strong> ({PROFILE.location}).
              </p>

              <div className="universe-signal-grid">
                <a
                  href={PROFILE.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="universe-signal-card"
                >
                  <span className="mono universe-signal-card__label">01 // GITHUB REPOSITORIES</span>
                  <strong className="display universe-signal-card__val">@{PROFILE.handle}</strong>
                  <span className="mono universe-signal-card__cta">OPEN GITHUB PROFILE ↗</span>
                </a>

                <a
                  href={PROFILE.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="universe-signal-card"
                >
                  <span className="mono universe-signal-card__label">02 // LINKEDIN NETWORK</span>
                  <strong className="display universe-signal-card__val">ASRAR MULLA</strong>
                  <span className="mono universe-signal-card__cta">CONNECT ON LINKEDIN ↗</span>
                </a>

                <div className="universe-signal-card">
                  <span className="mono universe-signal-card__label">03 // DIRECT TRANSMISSION</span>
                  <strong className="display universe-signal-card__val">{PROFILE.links.email}</strong>
                  <div className="universe-signal-card__row mono">
                    <a href={`mailto:${PROFILE.links.email}`} className="universe-action-link is-solid">
                      SEND EMAIL ↗
                    </a>
                    <button type="button" className="universe-action-link" onClick={handleCopyEmail}>
                      {copiedEmail ? 'COPIED ✓' : 'COPY ADDRESS'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="universe-signal-footer mono">
                <span>INSTITUTION: {PROFILE.institution}</span>
                <button
                  type="button"
                  className="universe-action-link"
                  onClick={() => {
                    onExitUniverse();
                    setTimeout(() => scrollToTarget('#scene-contact'), 100);
                  }}
                >
                  JUMP TO PORTFOLIO CONTACT FORM →
                </button>
              </div>
            </div>
          )}

          {/* WORLD 05 — THE NEXT FRONTIER (ACTIVE FOCUS VECTORS) */}
          {activeWorld.id === 'frontier' && (
            <div className="universe-panel__body">
              <div className="universe-tabs" role="tablist" aria-label="Select Frontier Vector">
                {PROFILE.focusAreas.map((area, idx) => (
                  <button
                    key={area.index}
                    type="button"
                    role="tab"
                    aria-selected={selectedFrontierIdx === idx}
                    className={`universe-tab mono ${selectedFrontierIdx === idx ? 'is-active' : ''}`}
                    onClick={() => setSelectedFrontierIdx(idx)}
                  >
                    VECTOR {area.index}
                  </button>
                ))}
              </div>

              {(() => {
                const area = PROFILE.focusAreas[selectedFrontierIdx] || PROFILE.focusAreas[0];
                return (
                  <div className="universe-frontier-card">
                    <div className="mono universe-frontier-card__idx">
                      ACTIVE RESEARCH &amp; BUILD VECTOR // {area.index}
                    </div>
                    <h5 className="display universe-frontier-card__title">{area.title}</h5>
                    <p className="universe-frontier-card__note">{area.note}</p>

                    <div className="universe-frontier-all">
                      {PROFILE.focusAreas.map((item, idx) => (
                        <button
                          key={item.index}
                          type="button"
                          className={`universe-frontier-mini ${selectedFrontierIdx === idx ? 'is-active' : ''}`}
                          onClick={() => setSelectedFrontierIdx(idx)}
                        >
                          <span className="mono" style={{ color: 'var(--signal)' }}>
                            {item.index}
                          </span>
                          <strong>{item.title}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </aside>
      )}

      {/* =====================================================================
          BOTTOM 5-WORLD NAVIGATION DOCK
          ===================================================================== */}
      <nav className="universe-dock" aria-label="Five Interactive Universe Worlds">
        {UNIVERSE_WORLDS.map((w, idx) => {
          const isSelected = activeWorldId === w.id;
          return (
            <button
              key={w.id}
              type="button"
              className={`universe-dock__btn ${isSelected ? 'is-active' : ''}`}
              style={{ '--world-accent': w.color }}
              onClick={() => handleSelectWorld(w.id, idx)}
            >
              <span className="universe-dock__idx mono">WORLD {w.index}</span>
              <span className="universe-dock__name">{w.name}</span>
              <span className="universe-dock__sub mono">{w.subtitle}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
