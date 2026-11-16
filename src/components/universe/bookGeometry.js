import * as THREE from 'three';

/**
 * Shared geometric parameterization for Asrar's 3D Digital Storybook.
 * Used identically by:
 *   1. `scripts/build-universe-book-glb.mjs` (leather hardcover, curved spine cradle, fanned page stack edges)
 *   2. `StorybookScene3D.jsx` (static left/right top leaves + live vertex-deformed turning page + 3D->2D DOM projection)
 */
export const BOOK_DIMS = {
  pageW: 2.52,
  pageH: 3.18,
  spineY: 0.16,
  cols: 48,
  rows: 32,
};

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Exact cross-sectional `(x, y, z)` position of any `(u, v)` point on the resting RIGHT or LEFT page.
 * - `u` in [0..1] from center spine (0) to outer page fore-edge (1)
 * - `v` in [-1..1] from top page edge (-1) to bottom page edge (+1)
 */
export function sampleBookPagePoint(side, u, v, target = new THREE.Vector3(), yBias = 0) {
  const { pageW, pageH, spineY } = BOOK_DIMS;
  const halfH = pageH * 0.5;
  const zBase = v * halfH;

  if (side === 'right') {
    // Graceful broad S-curve arch matching Reference 01's wide open right page
    const xSpread = u * pageW * 0.96 + Math.sin(u * Math.PI) * 0.06;
    const spineRise = Math.sin(Math.pow(u, 0.7) * Math.PI * 0.9) * 0.36;
    const outerCurl = Math.pow(u, 3.2) * 0.09;
    // Slight sculptural lift along upper spine & subtle lower corner curl
    const edgeWave = (v < 0 ? -v * 0.04 : v * 0.025) * Math.sin(u * Math.PI * 0.85);
    const cornerTip = u > 0.78 && v > 0.65 ? ((u - 0.78) / 0.22) * ((v - 0.65) / 0.35) * 0.045 : 0;

    target.set(
      xSpread,
      spineY + spineRise + outerCurl + edgeWave + cornerTip + yBias,
      zBase - Math.sin(u * Math.PI) * 0.04 * (v * 0.5)
    );
    return target;
  }

  // Left page: compact upright curved fan matching Reference 01 left third
  const xSpread = -(u * pageW * 0.64 + Math.sin(u * Math.PI * 0.88) * 0.05);
  const ramp = Math.pow(u, 1.04) * 0.66;
  const arch = Math.sin(u * Math.PI * 0.92) * 0.26;
  const zPull = Math.sin(u * Math.PI) * 0.04;
  target.set(
    xSpread,
    spineY + ramp + arch + yBias,
    zBase + zPull * (v > 0 ? 0.55 : -0.25)
  );
  return target;
}

const _pRight = new THREE.Vector3();
const _pLeft = new THREE.Vector3();

/**
 * Updates vertex positions & smooth shading normals of a high-resolution sheet mesh
 * so it physically peels, bends, curls over the spine, and settles cleanly in 3D.
 *
 * @param {THREE.BufferGeometry} geo
 * @param {number} progress Normalized turn amount `[0..1]` (`0` = resting at origin side, `1` = landed on opposite side)
 * @param {'forward'|'backward'} direction `'forward'` sweeps Right -> Left; `'backward'` sweeps Left -> Right
 * @param {number} yBias Small elevation offset above resting top leaves
 */
export function updateDeformedPageGeometry(geo, progress, direction = 'forward', yBias = 0.008) {
  const { cols, rows, spineY } = BOOK_DIMS;
  const posAttr = geo.attributes.position;
  const uvAttr = geo.attributes.uv;
  const p = clamp01(progress);

  for (let iy = 0; iy <= rows; iy++) {
    const vNorm = iy / rows; // 0 (top) .. 1 (bottom)
    const v = -1 + vNorm * 2; // -1 (top) .. +1 (bottom)

    for (let ix = 0; ix <= cols; ix++) {
      const u = ix / cols; // 0 (spine) .. 1 (outer edge)
      const idx = iy * (cols + 1) + ix;

      sampleBookPagePoint('right', u, v, _pRight, yBias);
      sampleBookPagePoint('left', u, v, _pLeft, yBias);

      // Phase lag per vertex: outer lower corner initiates curl, spine anchors and trails smoothly
      const cornerFactor = (1 - u) * 0.24 + (1 - vNorm) * u * 0.14;
      const span = 0.72;
      const tLinear = clamp01((p - cornerFactor) / span);
      const tLocal = easeInOutCubic(tLinear);

      const startPt = direction === 'forward' ? _pRight : _pLeft;
      const endPt = direction === 'forward' ? _pLeft : _pRight;

      const uCoord = direction === 'forward' ? u : 1 - u;

      if (p <= 0.0001) {
        posAttr.setXYZ(idx, startPt.x, startPt.y, startPt.z);
        uvAttr.setXY(idx, uCoord, 1 - vNorm);
        continue;
      }
      if (p >= 0.9999) {
        posAttr.setXYZ(idx, endPt.x, endPt.y, endPt.z);
        uvAttr.setXY(idx, uCoord, 1 - vNorm);
        continue;
      }

      // Convert resting points into spine-centered polar coordinates `(radius, angle)` so paper arcs OVER spine
      const dx0 = startPt.x;
      const dy0 = startPt.y - spineY;
      const r0 = Math.hypot(dx0, dy0);
      const a0 = Math.atan2(dy0, dx0);

      const dx1 = endPt.x;
      const dy1 = endPt.y - spineY;
      const r1 = Math.hypot(dx1, dy1);
      const a1 = Math.atan2(dy1, dx1);

      const angle = lerp(a0, a1, tLocal);
      const radius = lerp(r0, r1, tLocal);

      // Dynamic aerodynamic arch during mid-flight + diagonal corner curl lift during early peel
      const flightSin = Math.sin(tLocal * Math.PI);
      const radiusBoost = flightSin * Math.sin(u * Math.PI) * 0.18;
      const curlWaveZ = flightSin * Math.sin(u * Math.PI * 0.9) * (v > 0 ? 0.16 : -0.1);

      const x = Math.cos(angle) * (radius + radiusBoost);
      const y = spineY + Math.sin(angle) * (radius + radiusBoost) + flightSin * Math.sin(u * Math.PI) * 0.18;
      const z = lerp(startPt.z, endPt.z, tLocal) + curlWaveZ;

      posAttr.setXYZ(idx, x, y, z);
      uvAttr.setXY(idx, uCoord, 1 - vNorm);
    }
  }

  posAttr.needsUpdate = true;
  uvAttr.needsUpdate = true;
  geo.computeVertexNormals();
}

/**
 * Allocates a blank `(cols x rows)` indexed grid `BufferGeometry` ready for live deformation
 * or static book leaf construction.
 */
export function createBookLeafGeometry(side = 'right', yBias = 0) {
  const { cols, rows } = BOOK_DIMS;
  const count = (cols + 1) * (rows + 1);
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices = [];

  const pt = new THREE.Vector3();
  for (let iy = 0; iy <= rows; iy++) {
    const vNorm = iy / rows;
    const v = -1 + vNorm * 2;
    for (let ix = 0; ix <= cols; ix++) {
      const u = ix / cols;
      const idx = iy * (cols + 1) + ix;
      sampleBookPagePoint(side, u, v, pt, yBias);
      positions[idx * 3] = pt.x;
      positions[idx * 3 + 1] = pt.y;
      positions[idx * 3 + 2] = pt.z;
      uvs[idx * 2] = side === 'left' ? 1 - u : u;
      uvs[idx * 2 + 1] = 1 - vNorm;
    }
  }

  for (let iy = 0; iy < rows; iy++) {
    for (let ix = 0; ix < cols; ix++) {
      const a = iy * (cols + 1) + ix;
      const b = a + 1;
      const c = a + (cols + 1);
      const d = c + 1;

      if (side === 'left') {
        indices.push(a, b, c);
        indices.push(b, d, c);
      } else {
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds pre-indexed turning geometries sharing winding maps so both `FrontSide` (starting top)
 * and `BackSide` (landing top on opposite half) read upright L->R with smooth curvature normals.
 */
export function buildTurnSheetIndexArrays() {
  const { cols, rows } = BOOK_DIMS;
  const forward = [];
  const backward = [];
  for (let iy = 0; iy < rows; iy++) {
    for (let ix = 0; ix < cols; ix++) {
      const a = iy * (cols + 1) + ix;
      const b = a + 1;
      const c = a + (cols + 1);
      const d = c + 1;
      forward.push(a, c, b, b, c, d);
      backward.push(a, b, c, b, d, c);
    }
  }
  return { forward, backward };
}
