/**
 * Custom GLSL shaders powering Asrar Mulla's continuous WebGL digital-film world:
 * 1) CORE_VERTEX / CORE_FRAGMENT — Displaced cobalt/signal harmonic energy lattice
 * 2) PORTRAIT_VERTEX / PORTRAIT_FRAGMENT — 3D depth-relief portrait relighting shader
 *    turning `asrar-hero.jpg` from a studio photo into a volumetric backlit silhouette monolith
 * 3) WATER_VERTEX / WATER_FRAGMENT — Reflective atmospheric ripple floor for Hero & Contact Finale
 * 4) FILM_POST_VERTEX / FILM_POST_FRAGMENT — Fullscreen cinema optical vignette, subtle RGB
 *    dispersion on scroll velocity, 16mm grain, and curved bezel frame
 * 5) POSTER_VERTEX / POSTER_FRAGMENT — DEVTALKS pointer-driven wave distortion poster shader
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

export const PORTRAIT_VERTEX = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uDepth;
  uniform vec2 uPointer;

  varying vec2 vUv;
  varying vec2 vImgUv;
  varying float vRelief;

  void main() {
    vUv = uv;
    // Direct 1:1 UV mapping ensures full body (hair down to shoes) is displayed without any artificial crop
    vImgUv = uv;

    vec4 tex = texture2D(uTexture, clamp(vImgUv, 0.001, 0.999));

    vec2 center = vec2(0.50, 0.50);
    vec2 scaled = (uv - center) * vec2(1.7, 1.1);
    float radial = exp(-dot(scaled, scaled) * 1.8);

    // Natural subtle volumetric depth relief across torso and head
    float figureDepth = radial * 0.55 * smoothstep(0.05, 0.75, tex.a);
    float disp = figureDepth * uDepth + sin(uv.y * 3.5 + uTime * 0.65) * 0.005 * radial;

    vec3 pos = position;
    pos.z += disp;
    pos.x += uPointer.x * 0.035 * radial;
    pos.y += uPointer.y * 0.020 * radial;

    vRelief = figureDepth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const PORTRAIT_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uReveal;
  uniform float uFinale;
  uniform vec2 uPointer;
  uniform vec3 uCobalt;
  uniform vec3 uSignal;

  varying vec2 vUv;
  varying vec2 vImgUv;
  varying float vRelief;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec2 uv = vUv;
    vec2 suv = clamp(vImgUv, 0.0005, 0.9995);

    vec4 sampC = texture2D(uTexture, suv);
    vec3 raw = sampC.rgb;
    float charAlpha = sampC.a;

    // Subpixel guard at outer perimeter to prevent texture wrapping while keeping hair & shoes 100% sharp
    float borderGuard = smoothstep(0.0, 0.003, uv.x) * smoothstep(1.0, 0.997, uv.x)
                      * smoothstep(0.0, 0.003, uv.y) * smoothstep(1.0, 0.997, uv.y);
    float subjectAlpha = charAlpha * borderGuard;

    // Pointer-steered dynamic ambient rim lights & studio atmosphere
    vec2 warmOrigin = vec2(0.30 + uPointer.x * 0.32, 0.72 + uPointer.y * 0.18);
    float warmHalo = exp(-length((uv - warmOrigin) * vec2(0.92, 1.05)) * 2.1) * 1.05;
    vec2 cobaltOrigin = vec2(0.72 - uPointer.x * 0.28, 0.44 - uPointer.y * 0.16);
    float cobaltHalo = exp(-length((uv - cobaltOrigin) * vec2(0.92, 0.88)) * 2.0) * 0.82;

    // Subtle rim lighting along the silhouette perimeter
    float edgeRim = smoothstep(0.1, 0.6, charAlpha) * (1.0 - smoothstep(0.75, 0.99, charAlpha));
    vec3 rimCol = mix(uCobalt * 0.85, uSignal * 1.05, warmHalo);

    // Natural photographic lighting — preserves real skin tones, crisp white shirt & navy blazer
    vec3 litSubject = raw * (1.04 + warmHalo * 0.14 + cobaltHalo * 0.10) + rimCol * edgeRim * 0.28;

    // Cinematic scan reveal on entrance
    float revealBand = smoothstep(0.0, 1.0, uReveal);
    float scanFeather = smoothstep(uv.y - 0.18, uv.y + 0.06, revealBand * 1.18);

    // Full body stays 100% solid in Hero (uFinale == 0); softly transitions to Halo Bust in Contact Finale
    float finaleBustMask = mix(1.0, smoothstep(0.34, 0.62, uv.y), clamp(uFinale, 0.0, 1.0));

    float outAlpha = clamp(subjectAlpha * scanFeather * finaleBustMask, 0.0, 1.0);
    gl_FragColor = vec4(litSubject, outAlpha);
  }
`;

export const WATER_VERTEX = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float d = length(uv - 0.5) * 20.0;
    float w = sin(d - uTime * 1.4) * 0.035 + cos(pos.x * 1.6 + uTime * 0.7) * 0.02;
    pos.z += w;
    vWave = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const WATER_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uFinale;
  uniform vec3 uCobalt;
  uniform vec3 uSignal;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec2 centered = (vUv - 0.5) * 2.0;
    float dist = length(centered);
    float rings = sin(dist * 26.0 - uTime * 1.6) * 0.5 + 0.5;
    float shimmer = pow(clamp(rings * (1.0 - dist * 0.85), 0.0, 1.0), 4.0);

    vec3 base = mix(vec3(0.025, 0.028, 0.042), vec3(0.04, 0.05, 0.08), uFinale);
    vec3 glow = mix(uCobalt, uSignal, 0.22) * shimmer * (0.35 + 0.45 * uFinale);
    float radialFade = 1.0 - smoothstep(0.28, 0.98, dist);

    gl_FragColor = vec4(base + glow, radialFade * 0.88);
  }
`;

export const FILM_POST_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const FILM_POST_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uVelocity;
  uniform float uCurve;
  varying vec2 vUv;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    // Gentle cinema CRT aperture barrel curvature (subtle on desktop, zero clipping of inner content)
    vec2 centered = vUv * 2.0 - 1.0;
    float r2 = dot(centered, centered);
    vec2 curved = vUv + centered * r2 * uCurve;

    if (curved.x < 0.0 || curved.x > 1.0 || curved.y < 0.0 || curved.y > 1.0) {
      gl_FragColor = vec4(0.02, 0.02, 0.022, 1.0);
      return;
    }

    // ZERO chromatic aberration in the central portrait area (r2 < 0.65)
    // Only feathers subtly at extreme display corners on scroll impulse
    float cornerEdge = max(0.0, r2 - 0.70);
    float aberr = cornerEdge * (0.0016 + min(0.003, abs(uVelocity) * 0.00012));
    float r = texture2D(tDiffuse, clamp(curved + vec2(aberr, 0.0), 0.001, 0.999)).r;
    float g = texture2D(tDiffuse, curved).g;
    float b = texture2D(tDiffuse, clamp(curved - vec2(aberr, 0.0), 0.001, 0.999)).b;
    vec3 col = vec3(r, g, b);

    // Subtle film vignette with crystal clarity across central portrait area
    float vig = 1.0 - smoothstep(0.55, 1.5, length(centered));
    col *= mix(0.82, 1.0, vig);

    // Subtle 16mm grain confined to dark shadows only, zero noise over face or clothing
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float grain = (hash12(gl_FragCoord.xy + fract(uTime * 13.7) * 120.0) - 0.5) * 0.018 * (1.0 - smoothstep(0.12, 0.65, lum));
    col += grain;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
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
