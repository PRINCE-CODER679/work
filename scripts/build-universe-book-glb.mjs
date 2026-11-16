import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { BOOK_DIMS, sampleBookPagePoint } from '../src/components/universe/bookGeometry.js';

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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Computes resting hardcover board surface height at `(side, u)`.
 * Left cover lifts gently (~18 deg) under the thicker left curl; right cover lies near-flat on the table.
 */
function sampleBoardY(side, u) {
  if (side === 'left') {
    return 0.045 + u * 0.24;
  }
  return 0.042 + Math.pow(u, 1.4) * 0.075;
}

/**
 * Creates a thick sculpted leather cover half (`left` or `right`) matching spine hinge.
 */
function createCoverBoardGeometry(side, uSegs = 22, vSegs = 12) {
  const { pageW, pageH } = BOOK_DIMS;
  const coverW = pageW * (side === 'left' ? 0.68 : 1.0) + 0.13;
  const halfH = pageH * 0.5 + 0.085;
  const thickness = 0.055;

  const geo = new THREE.BoxGeometry(coverW, thickness, halfH * 2, uSegs, 1, vSegs);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i); // [-coverW/2 .. +coverW/2]
    const ly = pos.getY(i); // [-t/2 .. +t/2]
    const lz = pos.getZ(i);

    const u = side === 'right' ? (lx + coverW * 0.5) / coverW : (coverW * 0.5 - lx) / coverW;
    const x = side === 'right' ? u * coverW : -u * coverW;
    const boardY = sampleBoardY(side, u);
    const cornerBevel = Math.max(0, u - 0.92) * -0.025;
    pos.setXYZ(i, x, boardY + ly - thickness * 0.4 + cornerBevel, lz);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates an individual stepped paper-block layer `frac in [0..1]` sitting cleanly between
 * hardcover board and top open spread, with outer fanned fore-edge.
 */
function createPageLayerGeometry(side, frac, isUpperRim = false) {
  const { pageW, pageH, spineY } = BOOK_DIMS;
  const uSteps = 26;
  const vSteps = 16;
  const halfH = pageH * 0.5;
  const pt = new THREE.Vector3();

  // Slight organic stepping near fore-edge so individual parchment layers are distinctly visible
  const foreInset = 0.008 * Math.sin(frac * Math.PI * 5);
  const scaleW = 1 - (1 - frac) * 0.012 + foreInset * 0.06;

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let iy = 0; iy <= vSteps; iy++) {
    const vNorm = iy / vSteps;
    const v = -1 + vNorm * 2;
    const z = v * halfH * lerp(0.996, 1.0, frac);

    for (let ix = 0; ix <= uSteps; ix++) {
      const u = ix / uSteps;
      sampleBookPagePoint(side, u, v, pt, -0.01);

      const targetX = pt.x * scaleW;
      const targetY = lerp(sampleBoardY(side, u) + 0.028, pt.y, frac);
      // Taper gently at spine crease
      const spineBlend = Math.min(1, u * 4.5);
      const y = lerp(spineY - (1 - frac) * 0.07, targetY, spineBlend);

      positions.push(targetX, y, z);
      uvs.push(u, 1 - vNorm);
    }
  }

  for (let iy = 0; iy < vSteps; iy++) {
    for (let ix = 0; ix < uSteps; ix++) {
      const a = iy * (uSteps + 1) + ix;
      const b = a + 1;
      const c = a + (uSteps + 1);
      const d = c + 1;
      if (side === 'left') {
        indices.push(a, b, c, b, d, c);
      } else {
        indices.push(a, c, b, b, c, d);
      }
    }
  }

  // Front edge vertical ribbon (visible at v=+1 front bottom of book) & outer fore-edge ribbon (u=1)
  const frontRowStart = vSteps * (uSteps + 1);
  const edgeThick = isUpperRim ? 0.028 : 0.036;

  const ribbonStartIdx = positions.length / 3;
  for (let ix = 0; ix <= uSteps; ix++) {
    const srcIdx = (frontRowStart + ix) * 3;
    const rx = positions[srcIdx];
    const ry = positions[srcIdx + 1];
    const rz = positions[srcIdx + 2];
    positions.push(rx, ry, rz);
    positions.push(rx, Math.max(0.055, ry - edgeThick), rz);
    uvs.push(ix / uSteps, 1, ix / uSteps, 0);
  }
  for (let ix = 0; ix < uSteps; ix++) {
    const t0 = ribbonStartIdx + ix * 2;
    const b0 = t0 + 1;
    const t1 = t0 + 2;
    const b1 = t0 + 3;
    indices.push(t0, b0, t1, t1, b0, b1);
  }

  // Outer fore-edge vertical wall (`ix === uSteps`) catching golden side light
  const foreStartIdx = positions.length / 3;
  for (let iy = 0; iy <= vSteps; iy++) {
    const srcIdx = (iy * (uSteps + 1) + uSteps) * 3;
    const rx = positions[srcIdx];
    const ry = positions[srcIdx + 1];
    const rz = positions[srcIdx + 2];
    positions.push(rx, ry, rz);
    positions.push(rx, Math.max(0.06, ry - edgeThick * 1.15), rz);
    uvs.push(iy / vSteps, 1, iy / vSteps, 0);
  }
  for (let iy = 0; iy < vSteps; iy++) {
    const t0 = foreStartIdx + iy * 2;
    const b0 = t0 + 1;
    const t1 = t0 + 2;
    const b1 = t0 + 3;
    if (side === 'right') {
      indices.push(t0, b0, t1, t1, b0, b1);
    } else {
      indices.push(t0, t1, b0, t1, b1, b0);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildStorybookBaseAsset() {
  const root = new THREE.Group();
  root.name = 'StorybookBaseRoot';

  const leatherMat = new THREE.MeshStandardMaterial({
    name: 'HardcoverLeather',
    color: 0x161414,
    metalness: 0.14,
    roughness: 0.76,
  });

  const spineTrimMat = new THREE.MeshStandardMaterial({
    name: 'BronzeSpineTrim',
    color: 0x614426,
    metalness: 0.78,
    roughness: 0.34,
  });

  const amberPocketMat = new THREE.MeshStandardMaterial({
    name: 'AmberSpineGlow',
    color: 0xffb357,
    emissive: 0xff8a24,
    emissiveIntensity: 2.2,
    metalness: 0.1,
    roughness: 0.3,
  });

  const paperDarkEdgeMat = new THREE.MeshStandardMaterial({
    name: 'PageEdgeCharcoal',
    color: 0x242120,
    metalness: 0.05,
    roughness: 0.88,
  });

  const paperGoldEdgeMat = new THREE.MeshStandardMaterial({
    name: 'PageEdgeWarmGilt',
    color: 0x4b3b2e,
    metalness: 0.2,
    roughness: 0.68,
  });

  // 1. Leather Hardcover Boards & Curved Spine Cradle
  const coverGroup = new THREE.Group();
  coverGroup.name = 'CoverGroup';

  const leftCover = new THREE.Mesh(createCoverBoardGeometry('left'), leatherMat);
  leftCover.name = 'LeatherCoverLeft';
  coverGroup.add(leftCover);

  const rightCover = new THREE.Mesh(createCoverBoardGeometry('right'), leatherMat);
  rightCover.name = 'LeatherCoverRight';
  coverGroup.add(rightCover);

  // Curved semi-cylindrical spine trough
  const spineH = BOOK_DIMS.pageH + 0.17;
  const spineTroughGeo = new THREE.CylinderGeometry(0.18, 0.18, spineH, 16, 1, false, Math.PI * 0.5, Math.PI);
  spineTroughGeo.rotateX(Math.PI * 0.5);
  const spineTrough = new THREE.Mesh(spineTroughGeo, leatherMat);
  spineTrough.position.set(0, 0.08, 0);
  spineTrough.scale.set(1.25, 0.55, 1);
  coverGroup.add(spineTrough);

  // Front illuminated golden oval spine pocket (Reference 01 bottom-center glow cradle)
  const frontLipGeo = new THREE.TorusGeometry(0.14, 0.014, 12, 28);
  frontLipGeo.rotateX(Math.PI * 0.5);
  const frontLip = new THREE.Mesh(frontLipGeo, spineTrimMat);
  frontLip.scale.set(1.25, 0.4, 0.85);
  frontLip.position.set(0, 0.045, BOOK_DIMS.pageH * 0.5 + 0.025);
  coverGroup.add(frontLip);

  const spineEmber = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), amberPocketMat);
  spineEmber.scale.set(1.18, 0.25, 0.65);
  spineEmber.position.set(0, 0.055, BOOK_DIMS.pageH * 0.5 + 0.02);
  spineEmber.name = 'SpineEmberCore';
  coverGroup.add(spineEmber);

  root.add(coverGroup);

  // 2. Layered Physical Paper Stacks (`LeftPaperStack`, `RightPaperStack`)
  const layers = 9;
  const leftStack = new THREE.Group();
  leftStack.name = 'LeftPaperStack';
  const rightStack = new THREE.Group();
  rightStack.name = 'RightPaperStack';

  for (let i = 0; i < layers; i++) {
    const frac = (i + 1) / (layers + 1);
    const mat = i % 2 === 0 ? paperDarkEdgeMat : paperGoldEdgeMat;
    const leftSlice = new THREE.Mesh(createPageLayerGeometry('left', frac, i >= layers - 2), mat);
    leftStack.add(leftSlice);
    const rightSlice = new THREE.Mesh(createPageLayerGeometry('right', frac, i >= layers - 2), mat);
    rightStack.add(rightSlice);
  }

  root.add(leftStack);
  root.add(rightStack);

  return root;
}

const outDir = path.resolve('public/assets/universe');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'asrar-storybook.glb');

const bookAsset = buildStorybookBaseAsset();
const exporter = new GLTFExporter();
exporter.parse(
  bookAsset,
  (binary) => {
    const buffer = Buffer.from(binary);
    fs.writeFileSync(outFile, buffer);
    console.log(`Generated ${outFile} (${buffer.length} bytes)`);
  },
  (err) => {
    console.error('GLTF export failed:', err);
    process.exit(1);
  },
  { binary: true, onlyVisible: true }
);

