import * as THREE from 'three';
import { JOURNEY_MARKERS, LAB_SYSTEMS, ARCHIVE_PROJECTS, SIGNAL_PROFILE } from './bookChaptersData';

const TEX_W = 1440;
const TEX_H = 1008;

const spreadCache = new Map();
let cachedPaperNoise = null;
let cachedLeatherBump = null;
let cachedTableTex = null;

function getNoiseCanvas() {
  if (cachedPaperNoise) return cachedPaperNoise;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 128 + (Math.random() - 0.5) * 34;
    img.data[i] = n;
    img.data[i + 1] = n;
    img.data[i + 2] = n + 3;
    img.data[i + 3] = 22;
  }
  ctx.putImageData(img, 0, 0);
  cachedPaperNoise = c;
  return c;
}

/**
 * Generates seamless pebbled leather bump texture for hardcover boards & spine.
 */
export function getLeatherBumpTexture() {
  if (cachedLeatherBump) return cachedLeatherBump;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#707070';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1.4 + Math.random() * 2.6;
    const shade = 85 + Math.floor(Math.random() * 90);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  cachedLeatherBump = tex;
  return tex;
}

/**
 * Generates dark charcoal studio tabletop texture with subtle horizontal stone grain.
 */
export function getTableSurfaceTexture() {
  if (cachedTableTex) return cachedTableTex;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 2) {
    const v = 10 + Math.floor(Math.random() * 14);
    ctx.fillStyle = `rgba(${v + 4}, ${v + 2}, ${v}, 0.28)`;
    ctx.fillRect(0, y, 512, 1.5);
  }
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = `rgba(255, 220, 175, ${Math.random() * 0.035})`;
    ctx.fillRect(x, y, 2 + Math.random() * 14, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  cachedTableTex = tex;
  return tex;
}

/**
 * Shared dark charcoal book paper background + spine AO + warm amber spine light wash + subtle hairline border.
 */
function paintCharcoalPageBase(ctx, side) {
  const grad = ctx.createLinearGradient(side === 'right' ? 0 : TEX_W, TEX_H * 0.75, side === 'right' ? TEX_W : 0, 0);
  grad.addColorStop(0, '#222126');
  grad.addColorStop(0.28, '#1a1b20');
  grad.addColorStop(0.7, '#14151a');
  grad.addColorStop(1, '#0e0f13');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Tight warm bronze bounce radiating locally out from bottom spine pocket
  const spineX = side === 'right' ? 0 : TEX_W;
  const spineGlow = ctx.createRadialGradient(spineX, TEX_H * 0.94, 8, spineX, TEX_H * 0.84, TEX_W * 0.42);
  spineGlow.addColorStop(0, 'rgba(255, 178, 86, 0.42)');
  spineGlow.addColorStop(0.32, 'rgba(204, 128, 60, 0.14)');
  spineGlow.addColorStop(1, 'rgba(20, 20, 24, 0)');
  ctx.fillStyle = spineGlow;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle spine gutter crease ambient shadow
  const creaseGrad = ctx.createLinearGradient(
    side === 'right' ? 0 : TEX_W - 110,
    0,
    side === 'right' ? 110 : TEX_W,
    0
  );
  if (side === 'right') {
    creaseGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    creaseGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)');
    creaseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    creaseGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    creaseGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
    creaseGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  }
  ctx.fillStyle = creaseGrad;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Tile fine paper grain noise
  const noise = getNoiseCanvas();
  const pattern = ctx.createPattern(noise, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
  }

  // Faint gilded hairline inner margin
  ctx.strokeStyle = 'rgba(222, 176, 114, 0.14)';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(36, 36, TEX_W - 72, TEX_H - 72);
}

/**
 * Draws the wireframe 3D glowing cerebral network seen in Reference 01 left page (`02 THE LAB`).
 */
function paintWireframeBrain(ctx, cx, cy, scale = 1, alpha = 0.85) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Ambient mist glow behind brain
  const glow = ctx.createRadialGradient(0, -10, 20, 0, 0, 290);
  glow.addColorStop(0, `rgba(255, 224, 185, ${0.22 * alpha})`);
  glow.addColorStop(0.45, `rgba(176, 154, 134, ${0.09 * alpha})`);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 290, 0, Math.PI * 2);
  ctx.fill();

  // Generate anatomical side-profile cerebral nodes inside elliptical cortical envelope
  const nodes = [];
  const rings = 10;
  for (let r = 0; r < rings; r++) {
    const frac = (r + 1) / rings;
    const count = 6 + r * 2;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + r * 0.25;
      // Shape lobe envelope: flatter base, temporal bump lower-left, vaulted upper parietal arch
      const pinch = Math.sin(a) > 0.35 ? 0.72 + Math.cos(a * 2) * 0.14 : 1.0;
      const rx = 215 * frac * (1 + 0.08 * Math.cos(a * 3));
      const ry = 148 * frac * pinch;
      const jitterX = Math.sin(i * 17.3 + r * 9.1) * 14 * frac;
      const jitterY = Math.cos(i * 11.7 + r * 5.3) * 11 * frac;
      nodes.push({
        x: Math.cos(a) * rx + jitterX,
        y: Math.sin(a) * ry + jitterY - 12,
        inner: 1 - frac,
      });
    }
  }
  // Cerebellum cluster lower-right
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    nodes.push({
      x: 92 + Math.cos(a) * (36 + (i % 3) * 16),
      y: 92 + Math.sin(a) * (24 + (i % 2) * 12),
      inner: 0.45,
    });
  }

  // Draw wireframe edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (d < 56) {
        const edgeAlpha = (1 - d / 56) * (0.28 + 0.26 * nodes[i].inner) * alpha;
        ctx.strokeStyle = `rgba(242, 232, 218, ${edgeAlpha.toFixed(3)})`;
        ctx.lineWidth = 0.9 + nodes[i].inner * 0.7;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  // Synaptic nodes
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const r = 1.4 + n.inner * 2.0;
    ctx.fillStyle = n.inner > 0.45
      ? `rgba(255, 224, 178, ${0.75 * alpha})`
      : `rgba(235, 228, 218, ${0.42 * alpha})`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws layered craggy dusk mountains, glowing golden sunrise orb, drifting mist valleys,
 * luminous S-curve pathway, summit flag, and subtle marker nodes matching Reference 01 (`THE JOURNEY`).
 */
function paintJourneyMountainArtwork(ctx) {
  // 1. Sunrise Warm Halo Orb behind main ridge saddle (exact Reference 01 placement)
  const sunX = TEX_W * 0.57;
  const sunY = TEX_H * 0.36;
  const skyBloom = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, TEX_W * 0.48);
  skyBloom.addColorStop(0, 'rgba(255, 245, 215, 0.98)');
  skyBloom.addColorStop(0.11, 'rgba(255, 206, 128, 0.85)');
  skyBloom.addColorStop(0.28, 'rgba(222, 128, 52, 0.42)');
  skyBloom.addColorStop(0.55, 'rgba(130, 68, 30, 0.16)');
  skyBloom.addColorStop(1, 'rgba(20, 18, 22, 0)');
  ctx.fillStyle = skyBloom;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Crisp glowing solar disc
  ctx.fillStyle = '#fff9eb';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 48, 0, Math.PI * 2);
  ctx.fill();

  // 2. Distant hazy mountain silhouettes
  const paintRidge = (pts, fillStyle, sunRimColor = null) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0] * TEX_W, TEX_H);
    for (const [px, py] of pts) {
      ctx.lineTo(px * TEX_W, py * TEX_H);
    }
    ctx.lineTo(pts[pts.length - 1][0] * TEX_W, TEX_H);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();

    // Sunward golden edge facet highlights
    if (sunRimColor) {
      ctx.strokeStyle = sunRimColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const [px, py] = pts[i];
        if (i === 0) ctx.moveTo(px * TEX_W, py * TEX_H);
        else ctx.lineTo(px * TEX_W, py * TEX_H);
      }
      ctx.stroke();
    }
    ctx.restore();
  };

  // Back horizon ridges bathed in subtle cool mist
  paintRidge(
    [
      [0.0, 0.72],
      [0.12, 0.62],
      [0.24, 0.56],
      [0.33, 0.49],
      [0.43, 0.47],
      [0.54, 0.43],
      [0.64, 0.37],
      [0.74, 0.24],
      [0.86, 0.35],
      [0.95, 0.42],
      [1.0, 0.4],
    ],
    '#1f222a',
    'rgba(220, 178, 130, 0.32)'
  );

  // Atmospheric valley mist between back & mid ridges
  const midMist = ctx.createLinearGradient(0, TEX_H * 0.4, 0, TEX_H * 0.72);
  midMist.addColorStop(0, 'rgba(220, 224, 232, 0.14)');
  midMist.addColorStop(0.55, 'rgba(165, 175, 190, 0.18)');
  midMist.addColorStop(1, 'rgba(18, 20, 26, 0)');
  ctx.fillStyle = midMist;
  ctx.fillRect(0, TEX_H * 0.38, TEX_W, TEX_H * 0.35);

  // Main Sculpted Summit Peak & Jagged Slate Ridges with Sunlit vs Cool Graphite Faces
  const mainPeak = [
    [0.04, 0.96],
    [0.14, 0.81],
    [0.22, 0.7],
    [0.32, 0.62],
    [0.39, 0.56],
    [0.47, 0.52],
    [0.56, 0.44],
    [0.65, 0.35],
    [0.74, 0.235],
    [0.82, 0.34],
    [0.91, 0.46],
    [1.0, 0.56],
  ];
  const peakGrad = ctx.createLinearGradient(sunX, TEX_H * 0.23, TEX_W * 0.92, TEX_H * 0.85);
  peakGrad.addColorStop(0, '#3e332c');
  peakGrad.addColorStop(0.28, '#23262e');
  peakGrad.addColorStop(0.7, '#151820');
  peakGrad.addColorStop(1, '#0c0d12');
  paintRidge(mainPeak, peakGrad, 'rgba(255, 198, 128, 0.72)');

  // Faceted rocky ridge creases & golden sunlit slopes vs cool slate shadows
  const facets = [
    [
      [0.74, 0.235],
      [0.66, 0.43],
      [0.74, 0.55],
      'rgba(255, 185, 108, 0.32)',
    ],
    [
      [0.74, 0.235],
      [0.74, 0.55],
      [0.9, 0.5],
      'rgba(10, 12, 18, 0.78)',
    ],
    [
      [0.56, 0.44],
      [0.48, 0.65],
      [0.64, 0.68],
      'rgba(218, 175, 124, 0.18)',
    ],
    [
      [0.38, 0.56],
      [0.31, 0.74],
      [0.45, 0.78],
      'rgba(182, 165, 148, 0.16)',
    ],
    [
      [0.22, 0.7],
      [0.14, 0.86],
      [0.32, 0.88],
      'rgba(165, 152, 142, 0.14)',
    ],
  ];
  for (const [p1, p2, p3, col] of facets) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(p1[0] * TEX_W, p1[1] * TEX_H);
    ctx.lineTo(p2[0] * TEX_W, p2[1] * TEX_H);
    ctx.lineTo(p3[0] * TEX_W, p3[1] * TEX_H);
    ctx.closePath();
    ctx.fill();
  }

  // Foreground dark craggy shoulders framing bottom-right & bottom-left
  paintRidge(
    [
      [0.55, 0.99],
      [0.68, 0.76],
      [0.79, 0.67],
      [0.92, 0.6],
      [1.0, 0.54],
    ],
    '#12141a',
    'rgba(220, 198, 172, 0.24)'
  );
  paintRidge(
    [
      [0.0, 0.92],
      [0.08, 0.82],
      [0.18, 0.85],
      [0.28, 0.94],
      [0.42, 0.99],
    ],
    '#121318',
    'rgba(212, 172, 126, 0.18)'
  );

  // Lush billowing cool-white valley clouds across lower slopes matching Reference 01 fog layer
  const cloudPuffs = [
    [0.18, 0.85, 220, 0.22],
    [0.36, 0.86, 260, 0.26],
    [0.54, 0.79, 230, 0.28],
    [0.72, 0.82, 260, 0.28],
    [0.88, 0.77, 210, 0.24],
    [0.45, 0.66, 175, 0.16],
    [0.64, 0.64, 165, 0.15],
  ];
  for (const [cx, cy, rad, op] of cloudPuffs) {
    const cg = ctx.createRadialGradient(cx * TEX_W, cy * TEX_H, rad * 0.1, cx * TEX_W, cy * TEX_H, rad);
    cg.addColorStop(0, `rgba(228, 232, 238, ${op})`);
    cg.addColorStop(0.5, `rgba(170, 178, 192, ${op * 0.52})`);
    cg.addColorStop(1, 'rgba(16, 18, 24, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(cx * TEX_W, cy * TEX_H, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Winding Luminous Golden Trail synced with updated `JOURNEY_MARKERS` through Summit `(0.74, 0.24)`
  const trailPts = [
    [0.025, 0.965],
    [0.13, 0.855],
    [0.22, 0.78], // EXPERIMENTS (u=0.22, v=0.56 -> yNorm=0.78)
    [0.34, 0.73],
    [0.4, 0.68], // PROJECTS (u=0.40, v=0.36 -> yNorm=0.68)
    [0.52, 0.64],
    [0.55, 0.6], // HACKATHONS (u=0.55, v=0.20 -> yNorm=0.60)
    [0.64, 0.57],
    [0.67, 0.54], // CLUBS (u=0.67, v=0.08 -> yNorm=0.54)
    [0.77, 0.44],
    [0.74, 0.33], // MILESTONES (u=0.74, v=-0.34 -> yNorm=0.33)
    [0.74, 0.24], // SUMMIT
  ];

  const drawTrail = (color, width, blur = 0) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (blur > 0) {
      ctx.shadowColor = '#ffa43b';
      ctx.shadowBlur = blur;
    }
    ctx.beginPath();
    ctx.moveTo(trailPts[0][0] * TEX_W, trailPts[0][1] * TEX_H);
    for (let i = 1; i < trailPts.length; i++) {
      const [px, py] = trailPts[i];
      const [prevX, prevY] = trailPts[i - 1];
      const cx = (prevX + px) * 0.5 * TEX_W;
      const cy = (prevY + py) * 0.5 * TEX_H;
      ctx.quadraticCurveTo(prevX * TEX_W, prevY * TEX_H, cx, cy);
    }
    const last = trailPts[trailPts.length - 1];
    ctx.lineTo(last[0] * TEX_W, last[1] * TEX_H);
    ctx.stroke();
    ctx.restore();
  };

  drawTrail('rgba(255, 136, 36, 0.45)', 18, 22);
  drawTrail('rgba(255, 190, 96, 0.85)', 6.5, 10);
  drawTrail('#fff6db', 2.4, 0);

  // Glowing circular nodes under exact `JOURNEY_MARKERS` `(u, v)` positions
  for (const m of JOURNEY_MARKERS) {
    const nx = m.u * TEX_W;
    const ny = ((m.v + 1) * 0.5) * TEX_H;
    const ng = ctx.createRadialGradient(nx, ny, 2, nx, ny, 26);
    ng.addColorStop(0, '#ffffff');
    ng.addColorStop(0.28, '#ffc875');
    ng.addColorStop(0.65, 'rgba(255, 132, 36, 0.35)');
    ng.addColorStop(1, 'rgba(255, 132, 36, 0)');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.arc(nx, ny, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden Summit Flag waving above peak (`0.74, 0.235`)
  const fx = 0.74 * TEX_W;
  const fy = 0.235 * TEX_H;
  ctx.save();
  ctx.strokeStyle = '#ffdf9e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(fx, fy - 42);
  ctx.stroke();
  ctx.fillStyle = '#ffbe66';
  ctx.shadowColor = '#ff9838';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(fx, fy - 42);
  ctx.quadraticCurveTo(fx + 14, fy - 46, fx + 28, fy - 39);
  ctx.quadraticCurveTo(fx + 14, fy - 33, fx, fy - 27);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to draw consistent editorial chapter title block on charcoal page canvas.
 */
function paintPageHeading(ctx, { num, title, subtitle = '', x = 92, y = 112, scale = 1, align = 'left' }) {
  ctx.save();
  ctx.textAlign = align;
  ctx.fillStyle = 'rgba(235, 224, 208, 0.88)';
  ctx.font = `italic 400 ${Math.round(52 * scale)}px "Bodoni Moda", Didot, Georgia, serif`;
  ctx.fillText(num, x, y);

  ctx.fillStyle = '#f6eee1';
  ctx.font = `italic 400 ${Math.round(74 * scale)}px "Bodoni Moda", Didot, Georgia, serif`;
  ctx.fillText(title, x, y + Math.round(70 * scale));

  if (subtitle) {
    ctx.fillStyle = 'rgba(232, 224, 212, 0.78)';
    ctx.font = `400 ${Math.round(22 * scale)}px "Inter Tight", system-ui, sans-serif`;
    const lines = subtitle.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(line, x, y + Math.round((112 + idx * 30) * scale));
    });

    const ruleY = y + Math.round((128 + lines.length * 30) * scale);
    ctx.strokeStyle = 'rgba(222, 174, 108, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, ruleY);
    ctx.lineTo(x + 64 * scale, ruleY);
    ctx.stroke();
  }
  ctx.restore();
}

function paintArchiveLeftPage(ctx) {
  paintCharcoalPageBase(ctx, 'left');
  paintPageHeading(ctx, {
    num: '01',
    title: 'THE ARCHIVE',
    subtitle: 'Deployed AI, Computer Vision,\nClinical & Creative Web Systems.',
    x: 130,
    y: 130,
    scale: 0.94,
  });

  // Classical dark architectural archway motif nodding subtly to Reference 03 inside dark gold aesthetic
  ctx.save();
  ctx.translate(TEX_W * 0.52, TEX_H * 0.76);
  const g = ctx.createRadialGradient(0, -80, 15, 0, -80, 220);
  g.addColorStop(0, 'rgba(255, 184, 102, 0.24)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -80, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(232, 185, 118, 0.42)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -80, 128, Math.PI, 0);
  ctx.lineTo(128, 70);
  ctx.moveTo(-128, -80);
  ctx.lineTo(-128, 70);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(232, 185, 118, 0.22)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -80, 152, Math.PI, 0);
  ctx.stroke();

  // Mountain peak framing inside the archway
  ctx.fillStyle = 'rgba(30, 28, 32, 0.9)';
  ctx.beginPath();
  ctx.moveTo(-110, 68);
  ctx.lineTo(-32, -26);
  ctx.lineTo(14, 12);
  ctx.lineTo(54, -52);
  ctx.lineTo(110, 68);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 190, 104, 0.45)';
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = 'rgba(220, 208, 192, 0.55)';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText('VERIFIED DEPLOYMENTS // VERCEL & GITHUB', 130, TEX_H - 90);
}

function paintArchiveRightPage(ctx) {
  paintCharcoalPageBase(ctx, 'right');
  ctx.fillStyle = 'rgba(224, 182, 122, 0.72)';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText('ARCHIVE FOLIO · 04 SYSTEMS INDEXED', 92, 92);

  ctx.strokeStyle = 'rgba(224, 182, 122, 0.22)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(92, 112);
  ctx.lineTo(TEX_W - 92, 112);
  ctx.stroke();

  // Tactile specimen plate outlines on dark paper framing interactive cards
  const boxes = [
    [92, 150, 580, 340],
    [712, 150, 620, 340],
    [92, 530, 580, 340],
    [712, 530, 620, 340],
  ];
  boxes.forEach(([bx, by, bw, bh], i) => {
    ctx.fillStyle = 'rgba(14, 14, 18, 0.72)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = 'rgba(224, 178, 114, 0.34)';
    ctx.strokeRect(bx, by, bw, bh);

    // Tactile gold corner L-ticks
    ctx.strokeStyle = 'rgba(255, 196, 116, 0.72)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, by + 22);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + 22, by);
    ctx.moveTo(bx + bw - 22, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - 22);
    ctx.stroke();

    const p = ARCHIVE_PROJECTS[i];
    if (p) {
      ctx.fillStyle = 'rgba(235, 224, 210, 0.25)';
      ctx.font = 'italic 400 44px "Bodoni Moda", Georgia, serif';
      ctx.fillText(p.title, bx + 28, by + 76);
    }
  });
}

function paintLabLeftPage(ctx) {
  paintCharcoalPageBase(ctx, 'left');
  paintPageHeading(ctx, {
    num: '02',
    title: 'THE LAB',
    subtitle: 'AI / ML, WebGL & Systems Architecture',
    x: 130,
    y: 130,
    scale: 0.94,
  });

  // Calibration circles framing neural diagram
  ctx.save();
  ctx.translate(TEX_W * 0.5, TEX_H * 0.57);
  ctx.strokeStyle = 'rgba(224, 178, 114, 0.16)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.arc(0, 0, 275, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 325, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  paintWireframeBrain(ctx, TEX_W * 0.5, TEX_H * 0.57, 1.05, 0.96);

  ctx.fillStyle = 'rgba(220, 208, 192, 0.65)';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText('18 PRODUCTION TECHNOLOGIES · 5 DSA MODULES', 130, TEX_H - 86);
}

function paintLabRightPage(ctx) {
  paintCharcoalPageBase(ctx, 'right');
  ctx.fillStyle = 'rgba(224, 182, 122, 0.75)';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText('SCIENTIFIC SPECIMEN INDEX // STACK & ALGORITHMS', 92, 92);

  // Subtle blueprint axes + rings under interactive scientific callout cards
  ctx.save();
  ctx.strokeStyle = 'rgba(222, 176, 114, 0.12)';
  ctx.lineWidth = 1;
  for (let gx = 120; gx < TEX_W - 80; gx += 120) {
    ctx.beginPath();
    ctx.moveTo(gx, 130);
    ctx.lineTo(gx, TEX_H - 90);
    ctx.stroke();
  }
  for (let gy = 160; gy < TEX_H - 90; gy += 120) {
    ctx.beginPath();
    ctx.moveTo(92, gy);
    ctx.lineTo(TEX_W - 92, gy);
    ctx.stroke();
  }
  ctx.restore();

  LAB_SYSTEMS.forEach((sys, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = 92 + col * 620;
    const by = 152 + row * 370;
    ctx.fillStyle = 'rgba(14, 14, 18, 0.66)';
    ctx.fillRect(bx, by, 580, 330);
    ctx.strokeStyle = 'rgba(222, 176, 114, 0.3)';
    ctx.strokeRect(bx, by, 580, 330);

    ctx.fillStyle = 'rgba(255, 190, 108, 0.55)';
    ctx.font = '500 18px "JetBrains Mono", monospace';
    ctx.fillText(sys.code, bx + 26, by + 42);
  });
}

function paintSignalLeftPage(ctx) {
  paintCharcoalPageBase(ctx, 'left');
  paintPageHeading(ctx, {
    num: '04',
    title: 'THE SIGNAL',
    subtitle: `Direct Uplinks · ${SIGNAL_PROFILE.location}`,
    x: 130,
    y: 130,
    scale: 0.94,
  });

  // Concentric radio signal wave arcs
  const cx = TEX_W * 0.52;
  const cy = TEX_H * 0.6;
  [90, 150, 215, 280, 345].forEach((r, idx) => {
    ctx.strokeStyle = `rgba(255, 188, 104, ${0.42 - idx * 0.065})`;
    ctx.lineWidth = idx === 0 ? 2 : 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
  });

  // Signal beacon core
  const sg = ctx.createRadialGradient(cx, cy, 4, cx, cy, 70);
  sg.addColorStop(0, '#fff3d6');
  sg.addColorStop(0.35, '#ffaa46');
  sg.addColorStop(1, 'rgba(255, 140, 40, 0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(220, 208, 192, 0.65)';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText('18.6298 N · 73.7997 E // PUNE, INDIA', 130, TEX_H - 90);
}

function paintSignalRightPage(ctx) {
  paintCharcoalPageBase(ctx, 'right');
  ctx.fillStyle = 'rgba(224, 182, 122, 0.72)';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText('VERIFIED COMMUNICATION CHANNELS', 92, 92);

  [150, 370, 590].forEach((yPos) => {
    ctx.fillStyle = 'rgba(14, 14, 18, 0.7)';
    ctx.fillRect(92, yPos, TEX_W - 184, 184);
    ctx.strokeStyle = 'rgba(224, 178, 114, 0.34)';
    ctx.strokeRect(92, yPos, TEX_W - 184, 184);
  });
}

function paintFrontierLeftPage(ctx) {
  paintCharcoalPageBase(ctx, 'left');
  paintPageHeading(ctx, {
    num: '05',
    title: 'FRONTIER',
    subtitle: "Looking Ahead · Building What's Next",
    x: 130,
    y: 130,
    scale: 0.94,
  });

  // Minimalist dusk horizon glow + architectural monolith silhouette
  const hg = ctx.createRadialGradient(TEX_W * 0.55, TEX_H * 0.62, 15, TEX_W * 0.55, TEX_H * 0.62, 340);
  hg.addColorStop(0, 'rgba(255, 198, 118, 0.48)');
  hg.addColorStop(0.5, 'rgba(210, 124, 52, 0.16)');
  hg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, TEX_H * 0.3, TEX_W, TEX_H * 0.7);

  ctx.strokeStyle = 'rgba(255, 200, 126, 0.45)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(100, TEX_H * 0.64);
  ctx.lineTo(TEX_W - 80, TEX_H * 0.64);
  ctx.stroke();

  // Architectural stepped canyon / horizon strata
  ctx.fillStyle = '#111115';
  ctx.fillRect(TEX_W * 0.24, TEX_H * 0.52, 160, 280);
  ctx.fillRect(TEX_W * 0.46, TEX_H * 0.46, 200, 340);
  ctx.strokeStyle = 'rgba(255, 194, 112, 0.35)';
  ctx.strokeRect(TEX_W * 0.24, TEX_H * 0.52, 160, 280);
  ctx.strokeRect(TEX_W * 0.46, TEX_H * 0.46, 200, 340);
}

function paintFrontierRightPage(ctx) {
  paintCharcoalPageBase(ctx, 'right');
  // Dusk horizon continuity across spread gutter
  const hg = ctx.createRadialGradient(TEX_W * 0.28, TEX_H * 0.52, 10, TEX_W * 0.28, TEX_H * 0.52, 420);
  hg.addColorStop(0, 'rgba(255, 186, 98, 0.25)');
  hg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.fillStyle = 'rgba(224, 182, 122, 0.72)';
  ctx.font = '500 20px "JetBrains Mono", monospace';
  ctx.fillText('FOUR ACTIVE RESEARCH & BUILD VECTORS', 92, 92);

  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = 92 + col * 620;
    const by = 152 + row * 370;
    ctx.fillStyle = 'rgba(14, 14, 18, 0.68)';
    ctx.fillRect(bx, by, 580, 330);
    ctx.strokeStyle = 'rgba(224, 178, 114, 0.3)';
    ctx.strokeRect(bx, by, 580, 330);
  }
}

function createCanvasTex(painter) {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext('2d');
  painter(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Returns cached left and right page `THREE.CanvasTexture` pair for any chapter ID.
 */
export function getSpreadTextures(chapterId) {
  if (spreadCache.has(chapterId)) {
    return spreadCache.get(chapterId);
  }

  let leftPainter;
  let rightPainter;

  switch (chapterId) {
    case 'journey':
      // Reference 01 Master: left shows 02 THE LAB wireframe brain; right shows 03 THE JOURNEY mountains + golden trail
      leftPainter = (ctx) => {
        paintCharcoalPageBase(ctx, 'left');
        paintPageHeading(ctx, { num: '02', title: 'THE LAB', x: 165, y: 155, scale: 0.92 });
        paintWireframeBrain(ctx, TEX_W * 0.56, TEX_H * 0.55, 0.96, 0.88);
        ctx.fillStyle = 'rgba(218, 208, 194, 0.72)';
        ctx.font = '500 22px "JetBrains Mono", monospace';
        ctx.fillText('AI / ML, WEBGL &', 210, TEX_H * 0.81);
        ctx.fillText('SYSTEMS STACK', 210, TEX_H * 0.845);
      };
      rightPainter = (ctx) => {
        paintCharcoalPageBase(ctx, 'right');
        paintJourneyMountainArtwork(ctx);
        paintPageHeading(ctx, {
          num: '03',
          title: 'THE JOURNEY',
          subtitle: 'Documented milestones, key\nlearnings and the path so far.',
          x: 92,
          y: 122,
          scale: 0.96,
        });
      };
      break;
    case 'archive':
      leftPainter = paintArchiveLeftPage;
      rightPainter = paintArchiveRightPage;
      break;
    case 'lab':
      leftPainter = paintLabLeftPage;
      rightPainter = paintLabRightPage;
      break;
    case 'signal':
      leftPainter = paintSignalLeftPage;
      rightPainter = paintSignalRightPage;
      break;
    case 'frontier':
    default:
      leftPainter = paintFrontierLeftPage;
      rightPainter = paintFrontierRightPage;
      break;
  }

  const pair = {
    left: createCanvasTex(leftPainter),
    right: createCanvasTex(rightPainter),
  };
  spreadCache.set(chapterId, pair);
  return pair;
}

export function clearSpreadTextureCache() {
  for (const pair of spreadCache.values()) {
    pair.left?.dispose();
    pair.right?.dispose();
  }
  spreadCache.clear();
}

