/**
 * Custom GLSL Shaders for The Toolbox 3D Experience:
 * 1) Volumetric chamber light rays erupting upward when the lid opens.
 * 2) Fresnel warm orange optical containment glow for the active hero tech cube.
 */

export const CHAMBER_BEAM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPos;

  void main() {
    vUv = uv;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const CHAMBER_BEAM_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorHot;
  uniform vec3 uColorWarm;

  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewPos;

  void main() {
    vec3 viewDir = normalize(vViewPos);
    float edgeFade = pow(abs(dot(normalize(vNormalView), viewDir)), 1.65);

    // Cylinder UV y=0 is bottom (chamber bed), y=1 is top fadeout
    float verticalFade = smoothstep(0.0, 0.16, vUv.y) * (1.0 - smoothstep(0.28, 1.0, vUv.y));

    // Subtle rising vertical shafts / light streaks
    float shafts = 0.65 + 0.35 * sin(vUv.x * 37.699 + uTime * 1.1) * cos(vUv.x * 18.849 - uTime * 0.7);
    float shimmer = 0.85 + 0.15 * sin(vUv.y * 12.0 - uTime * 2.4);

    vec3 col = mix(uColorWarm, uColorHot, 1.0 - smoothstep(0.0, 0.55, vUv.y));
    float alpha = verticalFade * edgeFade * shafts * shimmer * uIntensity * 0.62;

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

export const HERO_CUBE_RIM_VERTEX = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

export const HERO_CUBE_RIM_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  uniform vec3 uAmber;
  uniform vec3 uWhiteHot;

  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vNormalView);
    vec3 v = normalize(vViewPos);
    float fresnel = pow(1.0 - max(0.0, dot(n, v)), 2.25);

    // Subtle glowing edge frame boost near cube UV borders
    vec2 border = abs(vUv - 0.5) * 2.0;
    float edgeMask = smoothstep(0.74, 0.99, max(border.x, border.y));

    float rim = clamp(fresnel * 0.92 + edgeMask * 0.85, 0.0, 1.0);
    float breathe = 0.88 + 0.12 * sin(uTime * 2.4);
    vec3 col = mix(uAmber, uWhiteHot, rim * 0.55) * (1.25 + uPulse * 0.4) * breathe;
    float alpha = clamp((0.18 + rim * 0.78) * uPulse, 0.0, 0.95);

    gl_FragColor = vec4(col, alpha);
  }
`;

