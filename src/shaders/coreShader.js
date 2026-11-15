/**
 * Custom GLSL shaders used purposefully where procedural materials fall short:
 * 1) Hero Computational Lattice Core — harmonic displacement & cobalt/signal Fresnel pulse
 * 2) DEVTALKS Poster Paper Distortion — pointer-driven wave shear & chromatic edge
 */

export const CORE_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vPulse;

  void main() {
    vec3 pos = position;
    float harmonic = sin(pos.x * 3.4 + uTime * 1.4)
                   * cos(pos.y * 3.1 - uTime * 1.1)
                   * sin(pos.z * 3.2 + uTime * 0.9);
    float disp = harmonic * (0.08 + uScroll * 0.12);
    pos += normal * disp;

    // subtle attraction ripple toward pointer ray
    pos.x += uPointer.x * 0.04 * sin(pos.y * 4.0 + uTime);
    pos.y += uPointer.y * 0.04 * cos(pos.x * 4.0 + uTime);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPos = -mvPos.xyz;
    vPulse = harmonic;
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const CORE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec3 uCobalt;
  uniform vec3 uSignal;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vPulse;

  void main() {
    vec3 viewDir = normalize(vViewPos);
    float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), viewDir)), 2.2);
    float band = smoothstep(-0.35, 0.55, vPulse + sin(uTime * 0.8) * 0.18);

    vec3 base = mix(vec3(0.06, 0.08, 0.16), uCobalt, band * 0.85);
    vec3 rim = mix(uCobalt, uSignal, smoothstep(0.25, 0.9, fresnel + uScroll * 0.45));
    vec3 col = base + rim * (fresnel * 1.4 + 0.18);

    gl_FragColor = vec4(col, 0.92);
  }
`;

export const POSTER_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const POSTER_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec2 uPointer;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float d = distance(uv, uPointer);
    float wave = sin(d * 18.0 - uTime * 4.2) * exp(-d * 3.5) * 0.022 * uHover;
    vec2 dir = normalize(uv - uPointer + vec2(0.0001));
    vec2 distorted = clamp(uv + dir * wave, 0.002, 0.998);

    float shift = 0.005 * uHover * exp(-d * 2.2);
    float r = texture2D(uTexture, clamp(distorted + vec2(shift, 0.0), 0.002, 0.998)).r;
    float g = texture2D(uTexture, distorted).g;
    float b = texture2D(uTexture, clamp(distorted - vec2(shift, 0.0), 0.002, 0.998)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

