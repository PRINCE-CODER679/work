import * as THREE from 'three';

const textureCache = new Map();

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPythonLogo(ctx, cx, cy, s) {
  // Top blue serpent
  ctx.save();
  ctx.translate(cx, cy);
  const scale = s / 100;
  ctx.scale(scale, scale);

  const blueGrad = ctx.createLinearGradient(-45, -45, 25, 25);
  blueGrad.addColorStop(0, '#5a9fd4');
  blueGrad.addColorStop(1, '#306998');
  ctx.fillStyle = blueGrad;

  ctx.beginPath();
  ctx.moveTo(-2, -46);
  ctx.bezierCurveTo(-24, -46, -26, -34, -26, -24);
  ctx.lineTo(-26, -14);
  ctx.lineTo(2, -14);
  ctx.lineTo(2, -9);
  ctx.lineTo(-34, -9);
  ctx.bezierCurveTo(-48, -9, -48, 8, -48, 12);
  ctx.bezierCurveTo(-48, 30, -34, 30, -24, 30);
  ctx.lineTo(-24, 18);
  ctx.bezierCurveTo(-24, 6, -14, 2, -2, 2);
  ctx.lineTo(20, 2);
  ctx.bezierCurveTo(32, 2, 34, -8, 34, -20);
  ctx.lineTo(34, -32);
  ctx.bezierCurveTo(34, -44, 16, -46, -2, -46);
  ctx.closePath();
  ctx.fill();

  // Bottom yellow serpent
  const yellowGrad = ctx.createLinearGradient(-15, -15, 45, 45);
  yellowGrad.addColorStop(0, '#ffd43b');
  yellowGrad.addColorStop(1, '#ffe873');
  ctx.fillStyle = yellowGrad;

  ctx.beginPath();
  ctx.moveTo(2, 46);
  ctx.bezierCurveTo(24, 46, 26, 34, 26, 24);
  ctx.lineTo(26, 14);
  ctx.lineTo(-2, 14);
  ctx.lineTo(-2, 9);
  ctx.lineTo(34, 9);
  ctx.bezierCurveTo(48, 9, 48, -8, 48, -12);
  ctx.bezierCurveTo(48, -30, 34, -30, 24, -30);
  ctx.lineTo(24, -18);
  ctx.bezierCurveTo(24, -6, 14, -2, 2, -2);
  ctx.lineTo(-20, -2);
  ctx.bezierCurveTo(-32, -2, -34, 8, -34, 20);
  ctx.lineTo(-34, 32);
  ctx.bezierCurveTo(-34, 44, -16, 46, 2, 46);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0c1016';
  ctx.beginPath();
  ctx.arc(-13, -33, 4.2, 0, Math.PI * 2);
  ctx.arc(13, 33, 4.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawReactLogo(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = '#61dafb';
  ctx.lineWidth = s * 0.052;

  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.46, s * 0.175, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#61dafb';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.095, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFastApiLogo(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(s * 0.06, -s * 0.25);
  ctx.lineTo(-s * 0.16, s * 0.03);
  ctx.lineTo(s * 0.0, s * 0.03);
  ctx.lineTo(-s * 0.07, s * 0.25);
  ctx.lineTo(s * 0.17, -s * 0.04);
  ctx.lineTo(s * 0.01, -s * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMongoLogo(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  const leafGrad = ctx.createLinearGradient(0, -s * 0.44, 0, s * 0.44);
  leafGrad.addColorStop(0, '#58c953');
  leafGrad.addColorStop(1, '#2a8f34');
  ctx.fillStyle = leafGrad;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.44);
  ctx.bezierCurveTo(s * 0.28, -s * 0.18, s * 0.28, s * 0.18, s * 0.02, s * 0.36);
  ctx.lineTo(0, s * 0.46);
  ctx.lineTo(-s * 0.02, s * 0.36);
  ctx.bezierCurveTo(-s * 0.28, s * 0.18, -s * 0.28, -s * 0.18, 0, -s * 0.44);
  ctx.fill();

  ctx.strokeStyle = '#d1fae5';
  ctx.lineWidth = s * 0.028;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.3);
  ctx.lineTo(0, s * 0.44);
  ctx.stroke();
  ctx.restore();
}

function drawSklearnLogo(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(-s * 0.18, -s * 0.06, s * 0.21, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(s * 0.18, s * 0.04, s * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(s * 0.28)}px "Inter Tight", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('learn', s * 0.04, s * 0.12);
  ctx.restore();
}

function drawGitLogo(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#f5f3ff';
  // Clean crisp Octocat silhouette
  ctx.beginPath();
  ctx.arc(0, s * 0.03, s * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0e0f14';
  ctx.beginPath();
  ctx.arc(0, s * 0.05, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5f3ff';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.06, s * 0.16, s * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  // Ears
  ctx.beginPath();
  ctx.moveTo(-s * 0.16, -s * 0.05);
  ctx.lineTo(-s * 0.18, -s * 0.22);
  ctx.lineTo(-s * 0.05, -s * 0.12);
  ctx.moveTo(s * 0.16, -s * 0.05);
  ctx.lineTo(s * 0.18, -s * 0.22);
  ctx.lineTo(s * 0.05, -s * 0.12);
  ctx.fill();
  ctx.restore();
}

function drawPandasLogo(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  const cols = [
    { x: -0.24, y: -0.26, h: 0.56, c: '#a855f7' },
    { x: -0.08, y: -0.08, h: 0.44, c: '#c084fc' },
    { x: 0.08, y: -0.32, h: 0.6, c: '#818cf8' },
    { x: 0.24, y: -0.14, h: 0.46, c: '#e9d5ff' },
  ];
  cols.forEach((b) => {
    ctx.fillStyle = b.c;
    ctx.fillRect(s * b.x - s * 0.055, s * b.y, s * 0.11, s * b.h);
  });
  ctx.fillStyle = '#ff9800';
  ctx.fillRect(-s * 0.09, -s * 0.34, s * 0.12, s * 0.09);
  ctx.restore();
}

function drawThreeLogo(ctx, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = '#f5f2eb';
  ctx.lineWidth = s * 0.042;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.34, -s * 0.34);
  ctx.lineTo(s * 0.38, -s * 0.14);
  ctx.lineTo(-s * 0.14, s * 0.38);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.24);
  ctx.lineTo(s * 0.12, s * 0.12);
  ctx.lineTo(-s * 0.24, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawGenericTechLogo(ctx, id, name, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);

  if (id === 'vite') {
    const g = ctx.createLinearGradient(-s * 0.3, -s * 0.35, s * 0.3, s * 0.35);
    g.addColorStop(0, '#41d1ff');
    g.addColorStop(1, '#bd34fe');
    ctx.strokeStyle = g;
    ctx.lineWidth = s * 0.06;
    ctx.beginPath();
    ctx.moveTo(-s * 0.34, -s * 0.28);
    ctx.lineTo(0, s * 0.36);
    ctx.lineTo(s * 0.34, -s * 0.28);
    ctx.stroke();
    ctx.fillStyle = '#ffea83';
    ctx.beginPath();
    ctx.moveTo(s * 0.05, -s * 0.36);
    ctx.lineTo(-s * 0.14, 0);
    ctx.lineTo(s * 0.02, 0);
    ctx.lineTo(-s * 0.04, s * 0.24);
    ctx.lineTo(s * 0.16, -s * 0.08);
    ctx.lineTo(0, -s * 0.08);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'tailwind') {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(-s * 0.12, -s * 0.06, s * 0.18, Math.PI, 0);
    ctx.arc(s * 0.12, -s * 0.06, s * 0.18, Math.PI, 0, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-s * 0.22, s * 0.16, s * 0.16, Math.PI, 0);
    ctx.arc(0, s * 0.16, s * 0.16, Math.PI, 0, true);
    ctx.fill();
  } else if (id === 'gsap') {
    ctx.fillStyle = '#88ce02';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.38, 0, Math.PI * 2);
    ctx.strokeStyle = '#88ce02';
    ctx.lineWidth = s * 0.05;
    ctx.stroke();
    ctx.font = `800 ${Math.round(s * 0.24)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GSAP', 0, 0);
  } else if (id === 'vercel') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.34);
    ctx.lineTo(s * 0.36, s * 0.3);
    ctx.lineTo(-s * 0.36, s * 0.3);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'js') {
    ctx.fillStyle = '#facc15';
    drawRoundedRect(ctx, -s * 0.34, -s * 0.34, s * 0.68, s * 0.68, s * 0.08);
    ctx.fill();
    ctx.fillStyle = '#111216';
    ctx.font = `800 ${Math.round(s * 0.38)}px "Archivo", sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('JS', s * 0.28, s * 0.3);
  } else if (id === 'cpp') {
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * s * 0.4;
      const y = Math.sin(a) * s * 0.4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(s * 0.26)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C++', 0, 2);
  } else if (id === 'sql') {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = s * 0.045;
    [-0.18, 0, 0.18].forEach((dy) => {
      ctx.beginPath();
      ctx.ellipse(0, s * dy, s * 0.28, s * 0.09, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else if (id === 'mediapipe') {
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = s * 0.04;
    const pts = [
      [0, 0.28],
      [-0.22, -0.05],
      [-0.08, -0.28],
      [0.08, -0.26],
      [0.24, -0.04],
    ];
    pts.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.28);
      ctx.lineTo(s * px, s * py);
      ctx.stroke();
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(s * px, s * py, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (id === 'opencv') {
    const rings = [
      { x: 0, y: -0.2, c: '#ef4444' },
      { x: -0.2, y: 0.15, c: '#22c55e' },
      { x: 0.2, y: 0.15, c: '#3b82f6' },
    ];
    rings.forEach((r) => {
      ctx.strokeStyle = r.c;
      ctx.lineWidth = s * 0.09;
      ctx.beginPath();
      ctx.arc(s * r.x, s * r.y, s * 0.13, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else {
    // NumPy / fallback isometric mark
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = s * 0.05;
    ctx.strokeRect(-s * 0.24, -s * 0.24, s * 0.48, s * 0.48);
    ctx.fillStyle = '#f5f2eb';
    ctx.font = `700 ${Math.round(s * 0.22)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.slice(0, 3).toUpperCase(), 0, 0);
  }

  ctx.restore();
}

/**
 * Generates or returns cached high-DPI CanvasTexture for a technology tile icon
 * with crystal-translucent smoked-glass backing matching Panel 03 reference.
 */
export function getTechTileTexture(id, name, isHero = false) {
  const key = `${id}:${isHero ? 'hero' : 'tile'}`;
  if (textureCache.has(key)) return textureCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Crystal translucent smoked glass gradient (lets orange chamber glow shine right through!)
  const bgGrad = ctx.createRadialGradient(256, 236, 20, 256, 256, 280);
  if (isHero) {
    bgGrad.addColorStop(0, 'rgba(72, 28, 6, 0.56)');
    bgGrad.addColorStop(1, 'rgba(20, 10, 4, 0.68)');
  } else {
    bgGrad.addColorStop(0, 'rgba(38, 42, 54, 0.42)');
    bgGrad.addColorStop(1, 'rgba(14, 16, 24, 0.54)');
  }
  drawRoundedRect(ctx, 18, 18, 476, 476, 56);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Soft diagonal glass sheen highlight across top-left bevel
  const sheen = ctx.createLinearGradient(20, 20, 320, 320);
  sheen.addColorStop(0, isHero ? 'rgba(255, 200, 130, 0.24)' : 'rgba(255, 255, 255, 0.16)');
  sheen.addColorStop(0.45, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = sheen;
  ctx.fill();

  // Crisp glowing rim outline inside tile
  ctx.strokeStyle = isHero ? 'rgba(255, 162, 64, 0.92)' : 'rgba(245, 242, 235, 0.42)';
  ctx.lineWidth = isHero ? 8 : 5;
  ctx.stroke();

  // Draw pure crisp vector emblem centered cleanly in tile
  const cy = 256;
  const size = isHero ? 268 : 254;

  if (id === 'python') drawPythonLogo(ctx, 256, cy, size);
  else if (id === 'react') drawReactLogo(ctx, 256, cy, size);
  else if (id === 'fastapi') drawFastApiLogo(ctx, 256, cy, size);
  else if (id === 'mongodb') drawMongoLogo(ctx, 256, cy, size);
  else if (id === 'sklearn') drawSklearnLogo(ctx, 256, cy, size);
  else if (id === 'git') drawGitLogo(ctx, 256, cy, size);
  else if (id === 'pandas') drawPandasLogo(ctx, 256, cy, size);
  else if (id === 'three') drawThreeLogo(ctx, 256, cy, size);
  else drawGenericTechLogo(ctx, id, name, 256, cy, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;

  textureCache.set(key, tex);
  return tex;
}

