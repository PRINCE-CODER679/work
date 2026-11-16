import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onloadend) this.onloadend({ target: this });
        if (this.onload) this.onload({ target: this });
      });
    }
  };
}

function createChamferRectShape(w, d, chamfer = 0.24) {
  const hw = w * 0.5;
  const hd = d * 0.5;
  const c = Math.min(chamfer, hw * 0.45, hd * 0.45);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + c, -hd);
  shape.lineTo(hw - c, -hd);
  shape.lineTo(hw, -hd + c);
  shape.lineTo(hw, hd - c);
  shape.lineTo(hw - c, hd);
  shape.lineTo(-hw + c, hd);
  shape.lineTo(-hw, hd - c);
  shape.lineTo(-hw, -hd + c);
  shape.closePath();
  return shape;
}

function createHollowChamferShape(w, d, chamfer, thickness) {
  const outer = createChamferRectShape(w, d, chamfer);
  const iw = w - thickness * 2;
  const id = d - thickness * 2;
  const ic = Math.max(0.06, chamfer - thickness * 0.65);
  const hw = iw * 0.5;
  const hd = id * 0.5;

  const hole = new THREE.Path();
  hole.moveTo(-hw + ic, -hd);
  hole.lineTo(-hw, -hd + ic);
  hole.lineTo(-hw, hd - ic);
  hole.lineTo(-hw + ic, hd);
  hole.lineTo(hw - ic, hd);
  hole.lineTo(hw, hd - ic);
  hole.lineTo(hw, -hd + ic);
  hole.lineTo(hw - ic, -hd);
  hole.closePath();

  outer.holes.push(hole);
  return outer;
}

function createStarEmblemShape(outerR = 0.145, innerR = 0.038) {
  const shape = new THREE.Shape();
  const pts = 8;
  for (let i = 0; i < pts; i++) {
    const angle = (i / pts) * Math.PI * 2 - Math.PI * 0.5;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function buildToolboxAsset() {
  const root = new THREE.Group();
  root.name = 'ToolboxRoot';

  // Calibrated brushed gunmetal & dark titanium materials so bevels catch clear specular rim highlights
  const armorDarkMat = new THREE.MeshStandardMaterial({
    name: 'ArmorDark',
    color: 0x353a46,
    metalness: 0.72,
    roughness: 0.38,
  });

  const armorTrimMat = new THREE.MeshStandardMaterial({
    name: 'ArmorTrim',
    color: 0x4c5364,
    metalness: 0.82,
    roughness: 0.3,
  });

  const chromeLatchMat = new THREE.MeshStandardMaterial({
    name: 'ChromeLatch',
    color: 0x9aa3b5,
    metalness: 0.88,
    roughness: 0.22,
  });

  const gripRubberMat = new THREE.MeshStandardMaterial({
    name: 'GripRubber',
    color: 0x17181d,
    metalness: 0.25,
    roughness: 0.68,
  });

  const chamberDarkMat = new THREE.MeshStandardMaterial({
    name: 'ChamberDark',
    color: 0x0f1014,
    metalness: 0.5,
    roughness: 0.52,
  });

  // Rich saturated amber-orange (avoids ACES blowout to pale yellow)
  const orangeLedMat = new THREE.MeshStandardMaterial({
    name: 'OrangeLED',
    color: 0xff6200,
    emissive: 0xff5200,
    emissiveIntensity: 1.9,
    metalness: 0.1,
    roughness: 0.25,
  });

  const hotAmberMat = new THREE.MeshStandardMaterial({
    name: 'HotAmberChamber',
    color: 0xff8c1a,
    emissive: 0xff5e00,
    emissiveIntensity: 2.2,
    metalness: 0.15,
    roughness: 0.3,
  });

  // =========================================================================
  // 1. CIRCULAR MECHANICAL DISPLAY PLATFORM (`PlatformGroup`)
  // =========================================================================
  const platformGroup = new THREE.Group();
  platformGroup.name = 'PlatformGroup';

  const platOuter = new THREE.Mesh(new THREE.CylinderGeometry(2.14, 2.24, 0.12, 64), armorDarkMat);
  platOuter.position.y = 0.06;
  platformGroup.add(platOuter);

  const platRim = new THREE.Mesh(new THREE.TorusGeometry(2.14, 0.028, 12, 64), chromeLatchMat);
  platRim.rotation.x = Math.PI * 0.5;
  platRim.position.y = 0.12;
  platformGroup.add(platRim);

  const platDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.74, 1.8, 0.13, 64), chamberDarkMat);
  platDeck.position.y = 0.065;
  platformGroup.add(platDeck);

  // Subtle recessed thin amber energy ring inside pedestal groove
  const platGlowRing = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.014, 10, 64), orangeLedMat);
  platGlowRing.rotation.x = Math.PI * 0.5;
  platGlowRing.position.y = 0.122;
  platformGroup.add(platGlowRing);

  // 12 Heavy brushed armor clamp lugs spanning across the recessed glow channel
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.12;
    const lug = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.055, 0.34), armorTrimMat);
    lug.position.set(Math.cos(a) * 1.9, 0.13, Math.sin(a) * 1.9);
    lug.rotation.y = -a + Math.PI * 0.5;
    platformGroup.add(lug);

    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 8), chromeLatchMat);
    bolt.position.set(Math.cos(a) * 2.0, 0.16, Math.sin(a) * 2.0);
    platformGroup.add(bolt);
  }

  root.add(platformGroup);

  // =========================================================================
  // 2. LOWER HEAVY INDUSTRIAL CASE (`BaseGroup`)
  // =========================================================================
  const baseGroup = new THREE.Group();
  baseGroup.name = 'BaseGroup';
  baseGroup.position.y = 0.13;

  const caseW = 2.46;
  const caseD = 1.6;
  const caseChamfer = 0.24;

  const skirtShape = createChamferRectShape(caseW - 0.08, caseD - 0.08, caseChamfer);
  const skirtGeo = new THREE.ExtrudeGeometry(skirtShape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.035,
    bevelSegments: 2,
  });
  skirtGeo.rotateX(-Math.PI * 0.5);
  const skirtMesh = new THREE.Mesh(skirtGeo, armorDarkMat);
  skirtMesh.position.y = 0.04;
  baseGroup.add(skirtMesh);

  const wallShape = createHollowChamferShape(caseW, caseD, caseChamfer, 0.15);
  const wallGeo = new THREE.ExtrudeGeometry(wallShape, {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  wallGeo.rotateX(-Math.PI * 0.5);
  const wallMesh = new THREE.Mesh(wallGeo, armorDarkMat);
  wallMesh.position.y = 0.3;
  baseGroup.add(wallMesh);

  // Internal glowing optical bed
  const chamberFloorShape = createChamferRectShape(caseW - 0.34, caseD - 0.34, 0.14);
  const chamberFloorGeo = new THREE.ExtrudeGeometry(chamberFloorShape, { depth: 0.06, bevelEnabled: false });
  chamberFloorGeo.rotateX(-Math.PI * 0.5);
  const chamberFloor = new THREE.Mesh(chamberFloorGeo, hotAmberMat);
  chamberFloor.position.y = 0.42;
  baseGroup.add(chamberFloor);

  for (let i = -3; i <= 3; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, caseD - 0.38), armorTrimMat);
    bar.position.set(i * 0.28, 0.48, 0);
    baseGroup.add(bar);
  }

  // 4 Vertical titanium corner reinforcement pillars with bolt fasteners
  const cornerOffsets = [
    [-caseW * 0.44, -caseD * 0.42, Math.PI * 0.25],
    [caseW * 0.44, -caseD * 0.42, -Math.PI * 0.25],
    [-caseW * 0.44, caseD * 0.42, -Math.PI * 0.25],
    [caseW * 0.44, caseD * 0.42, Math.PI * 0.25],
  ];
  cornerOffsets.forEach(([cx, cz, ry]) => {
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.72, 0.16), armorTrimMat);
    guard.position.set(cx, 0.41, cz);
    guard.rotation.y = ry;
    baseGroup.add(guard);

    [-0.22, 0.22].forEach((by) => {
      const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6), chromeLatchMat);
      stud.rotation.x = Math.PI * 0.5;
      stud.position.set(cx * 0.99, 0.41 + by, cz + (cz > 0 ? 0.075 : -0.075));
      baseGroup.add(stud);
    });
  });

  // Side recessed grip bumper plates
  [-1, 1].forEach((sx) => {
    const sidePlate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.46, 0.88), armorTrimMat);
    sidePlate.position.set(sx * (caseW * 0.5 + 0.01), 0.46, 0);
    baseGroup.add(sidePlate);
  });

  // Front armored recess & Glowing 4-Point Star Emblem
  const frontRecess = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.44, 0.05), chamberDarkMat);
  frontRecess.position.set(0, 0.46, caseD * 0.5 + 0.015);
  baseGroup.add(frontRecess);

  const emblemGeo = new THREE.ExtrudeGeometry(createStarEmblemShape(0.145, 0.038), {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 1,
  });
  const emblemMesh = new THREE.Mesh(emblemGeo, orangeLedMat);
  emblemMesh.position.set(0, 0.44, caseD * 0.5 + 0.035);
  emblemMesh.name = 'FrontEmblem';
  baseGroup.add(emblemMesh);

  // Subtle orange seam rim strip around base upper lip
  const ledRimShape = createHollowChamferShape(caseW + 0.02, caseD + 0.02, caseChamfer, 0.02);
  const ledRimGeo = new THREE.ExtrudeGeometry(ledRimShape, { depth: 0.026, bevelEnabled: false });
  ledRimGeo.rotateX(-Math.PI * 0.5);
  const ledRimMesh = new THREE.Mesh(ledRimGeo, orangeLedMat);
  ledRimMesh.position.y = 0.77;
  baseGroup.add(ledRimMesh);

  // Bright center front horizontal amber slit bar between latches
  const frontCenterBar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.038, 0.05), orangeLedMat);
  frontCenterBar.position.set(0, 0.79, caseD * 0.5 + 0.022);
  baseGroup.add(frontCenterBar);

  // Tucked-under low amber underglow slits (clean recessed notches instead of big front bricks)
  [-0.58, 0.58].forEach((fx) => {
    const footGuard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.1), armorTrimMat);
    footGuard.position.set(fx, 0.06, caseD * 0.5 - 0.02);
    baseGroup.add(footGuard);

    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.024, 0.06), orangeLedMat);
    vent.position.set(fx, 0.02, caseD * 0.5 + 0.015);
    baseGroup.add(vent);
  });

  root.add(baseGroup);

  // =========================================================================
  // 3. UPPER REMOVABLE THICK MECHANICAL LID (`LidGroup`)
  // =========================================================================
  const lidGroup = new THREE.Group();
  lidGroup.name = 'LidGroup';
  lidGroup.position.set(0, 0.93, 0);

  const lidMainShape = createHollowChamferShape(caseW + 0.04, caseD + 0.04, caseChamfer, 0.16);
  const lidMainGeo = new THREE.ExtrudeGeometry(lidMainShape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.032,
    bevelSize: 0.032,
    bevelSegments: 2,
  });
  lidMainGeo.rotateX(-Math.PI * 0.5);
  const lidMain = new THREE.Mesh(lidMainGeo, armorDarkMat);
  lidMain.position.y = 0.02;
  lidGroup.add(lidMain);

  const lidCapShape = createChamferRectShape(caseW - 0.16, caseD - 0.16, 0.16);
  const lidCapGeo = new THREE.ExtrudeGeometry(lidCapShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  lidCapGeo.rotateX(-Math.PI * 0.5);
  const lidCap = new THREE.Mesh(lidCapGeo, armorTrimMat);
  lidCap.position.y = 0.26;
  lidGroup.add(lidCap);

  // Interior glowing amber rim strip visible when lifted
  const lidUnderRimShape = createHollowChamferShape(caseW - 0.28, caseD - 0.28, 0.14, 0.026);
  const lidUnderRimGeo = new THREE.ExtrudeGeometry(lidUnderRimShape, { depth: 0.018, bevelEnabled: false });
  lidUnderRimGeo.rotateX(-Math.PI * 0.5);
  const lidUnderRim = new THREE.Mesh(lidUnderRimGeo, orangeLedMat);
  lidUnderRim.position.y = 0.038;
  lidGroup.add(lidUnderRim);

  // Stepped armor shoulder bolsters + thin orange accent slots + machined edge rails & rivets
  [-0.86, 0.86].forEach((rx) => {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.13, caseD - 0.24), armorTrimMat);
    rib.position.set(rx, 0.35, 0);
    lidGroup.add(rib);

    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, caseD - 0.32), chromeLatchMat);
    rail.position.set(rx + (rx > 0 ? 0.18 : -0.18), 0.415, 0);
    lidGroup.add(rail);

    [-0.46, 0.46].forEach((rz) => {
      const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.028, 6), chromeLatchMat);
      rivet.position.set(rx - (rx > 0 ? 0.12 : -0.12), 0.42, rz);
      lidGroup.add(rivet);
    });

    const topSlot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.024, 0.07), orangeLedMat);
    topSlot.position.set(rx * 0.96, 0.415, 0.34);
    lidGroup.add(topSlot);
  });

  const lidFrontBar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.038, 0.05), orangeLedMat);
  lidFrontBar.position.set(0, 0.06, caseD * 0.5 + 0.028);
  lidGroup.add(lidFrontBar);

  // Heavy Top Carry Handle
  const handleGroup = new THREE.Group();
  handleGroup.name = 'TopHandle';
  handleGroup.position.set(0, 0.42, 0.04);

  const gripBar = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.16), gripRubberMat);
  gripBar.position.y = 0.14;
  handleGroup.add(gripBar);

  [-0.44, 0.44].forEach((hx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.18), chromeLatchMat);
    post.position.set(hx, 0.06, 0);
    handleGroup.add(post);
  });

  lidGroup.add(handleGroup);
  root.add(lidGroup);

  // =========================================================================
  // 4. ARTICULATED FRONT DRAW-LATCHES (`LatchLeft`, `LatchRight`)
  // =========================================================================
  [-0.56, 0.56].forEach((lx, idx) => {
    const latchGroup = new THREE.Group();
    latchGroup.name = idx === 0 ? 'LatchLeft' : 'LatchRight';
    latchGroup.position.set(lx, 1.01, caseD * 0.5 + 0.055);

    const upperCap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.085), chromeLatchMat);
    upperCap.position.set(0, 0.035, 0);
    latchGroup.add(upperCap);

    const claspBody = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.34, 0.075), armorTrimMat);
    claspBody.position.set(0, -0.14, 0.01);
    latchGroup.add(claspBody);

    const catchPlate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.088), chromeLatchMat);
    catchPlate.position.set(0, -0.14, 0.02);
    latchGroup.add(catchPlate);

    const hingePin = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.24, 8), chromeLatchMat);
    hingePin.rotation.z = Math.PI * 0.5;
    hingePin.position.set(0, -0.26, 0.03);
    latchGroup.add(hingePin);

    root.add(latchGroup);
  });

  // =========================================================================
  // 5. ORBITAL TELEMETRY TRACK (`OrbitalRig` with tilted outer pivot & horizontal inner track)
  // =========================================================================
  const orbitalPivot = new THREE.Group();
  orbitalPivot.name = 'OrbitalRig';

  const orbitalSpinner = new THREE.Group();
  orbitalSpinner.name = 'OrbitalSpinner';

  const orbitRingOuter = new THREE.Mesh(new THREE.TorusGeometry(1.92, 0.014, 10, 96), chromeLatchMat);
  orbitRingOuter.rotation.x = Math.PI * 0.5;
  orbitalSpinner.add(orbitRingOuter);

  const orbitRingGlow = new THREE.Mesh(new THREE.TorusGeometry(1.86, 0.008, 8, 96), orangeLedMat);
  orbitRingGlow.rotation.x = Math.PI * 0.5;
  orbitalSpinner.add(orbitRingGlow);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const nodeBracket = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.045, 0.06), chromeLatchMat);
    nodeBracket.position.set(Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9);
    nodeBracket.rotation.y = -a;
    orbitalSpinner.add(nodeBracket);
  }

  orbitalPivot.add(orbitalSpinner);
  root.add(orbitalPivot);

  return root;
}

const outDir = path.resolve('public/assets/toolbox');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'asrar-toolbox.glb');

const scene = new THREE.Scene();
const model = buildToolboxAsset();
scene.add(model);

const exporter = new GLTFExporter();
const glbBuffer = await exporter.parseAsync(scene, { binary: true });
fs.writeFileSync(outPath, Buffer.from(glbBuffer));

console.log(`Generated ${outPath} (${glbBuffer.byteLength} bytes)`);
