import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../animations/motion';
import { pointer, scenes } from '../../utils/store';

/**
 * HERO CENTERPIECE — 7-LAYER ART-DIRECTED COMPOSITION
 *
 * Layering order:
 * 1. Dark background, subtle perspective grid & purple floor halo glow
 * 2. Background stars & cosmic secondary orbital arc
 * 3. Metallic silver-purple "ASRAR" editorial serif wordmark (scalable vector SVG)
 * 4. Rear & mid orbital glow weaving behind/around the typography
 * 5. Full-body high-DPI portrait (<picture> with WebP + PNG srcSet, 1:1 lossless pixels)
 * 6. Front orbital light accents & right-side optical flare (strictly masked away from face & body)
 */

// Sculpted high-contrast luxury editorial serif glyphs in 1024x474 reference coordinate space.
// The center "R" spans x=402..624 so its left stem + top/bottom serifs stand clearly to the left
// of Asrar's right shoulder/hip, while its top bar, rounded upper bowl, and sweeping right leg
// extend clearly to the right of his left shoulder/arm.
const GLYPH_A1 =
  'M 277 141 L 316 247 L 332 258 L 274 258 L 288 247 L 277 219 L 230 219 L 215 247 L 231 258 L 180 258 L 198 247 L 273 141 Z ' +
  'M 264 166 L 235 211 L 274 211 Z';

const GLYPH_S =
  'M 407 143 L 403 175 L 394 175 C 391 159 379 150 364 150 C 349 150 340 158 340 169 ' +
  'C 340 181 353 187 375 195 C 400 204 414 214 414 233 C 414 250 397 260 369 260 ' +
  'C 352 260 340 256 333 254 L 328 258 L 333 224 L 342 224 C 345 242 356 252 372 252 ' +
  'C 388 252 397 244 397 233 C 397 220 385 214 362 205 C 338 196 326 186 326 169 ' +
  'C 326 152 343 142 367 142 C 383 142 395 146 401 148 L 407 143 Z';

const GLYPH_R_CENTER =
  'M 398 144 L 550 144 C 590 144 614 156 614 174 C 614 191 595 202 566 205 ' +
  'L 610 246 L 630 258 L 584 258 L 540 207 L 448 207 L 448 247 L 464 258 L 398 258 L 418 247 L 418 155 L 398 144 Z ' +
  'M 448 153 L 448 198 L 542 198 C 572 198 586 189 586 175 C 586 161 572 153 542 153 Z';

const GLYPH_A2 =
  'M 685 141 L 726 247 L 742 258 L 684 258 L 698 247 L 687 219 L 640 219 L 625 247 L 641 258 L 598 258 L 613 247 L 681 141 Z ' +
  'M 674 166 L 645 211 L 684 211 Z';

const GLYPH_R2 =
  'M 728 144 L 790 144 C 817 144 832 155 832 172 C 832 188 817 199 795 203 ' +
  'L 832 246 L 850 258 L 810 258 L 776 206 L 764 206 L 764 247 L 780 258 L 728 258 L 742 247 L 742 155 L 728 144 Z ' +
  'M 764 153 L 764 197 L 786 197 C 803 197 811 188 811 175 C 811 161 803 153 786 153 Z';

const ALL_GLYPHS = [GLYPH_A1, GLYPH_S, GLYPH_R_CENTER, GLYPH_A2, GLYPH_R2];

// Chiseled 3D inner facet ridge lines
const FACET_RIDGES = [
  'M 275 146 L 304 252',
  'M 201 251 L 272 149',
  'M 344 166 C 344 184 403 198 403 232',
  'M 435 149 L 435 252',
  'M 548 149 C 584 149 595 162 595 174 C 595 187 581 198 551 202 L 602 253',
  'M 683 146 L 713 252',
  'M 616 251 L 680 149',
  'M 753 149 L 753 252',
  'M 790 149 C 813 149 821 160 821 172 C 821 185 810 196 787 201 L 830 253',
];

export function HeroCenterpiece() {
  const stageRef = useRef(null);
  const wordmarkWrapRef = useRef(null);
  const portraitWrapRef = useRef(null);
  const portraitImgRef = useRef(null);
  const frontOrbitWrapRef = useRef(null);
  const floorHaloRef = useRef(null);
  const pulsePathRef = useRef(null);
  const pulseGlowRef = useRef(null);
  const flareGroupRef = useRef(null);
  const orbitBloomRef = useRef(null);

  // Set lowercase fetchpriority="high" directly on DOM node to avoid React 18 camelCase console warning
  useEffect(() => {
    if (portraitImgRef.current) {
      portraitImgRef.current.setAttribute('fetchpriority', 'high');
    }
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduced) return;

      // 1) Continuous smooth traveling light along the elliptical orbit
      if (pulsePathRef.current && pulseGlowRef.current) {
        gsap.to([pulsePathRef.current, pulseGlowRef.current], {
          strokeDashoffset: -1560,
          duration: 15,
          ease: 'none',
          repeat: -1,
        });
      }

      // 2) Subtle breathing glow on the right-side orbital flare & lavender bloom
      if (flareGroupRef.current) {
        gsap.to(flareGroupRef.current, {
          scale: 1.14,
          opacity: 0.96,
          transformOrigin: '838px 158px',
          duration: 3.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      if (orbitBloomRef.current) {
        gsap.to(orbitBloomRef.current, {
          opacity: 0.62,
          duration: 4.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      // 3) 60fps pointer parallax & scroll-dive depth choreography across the layers
      let rafId = 0;
      let sx = 0;
      let sy = 0;

      const tick = () => {
        const tx = pointer.x || 0;
        const ty = pointer.y || 0;
        sx += (tx - sx) * 0.075;
        sy += (ty - sy) * 0.075;

        const p = scenes.hero.progress || 0;
        const fade = Math.max(0, 1 - p * 1.42);
        const lift = p * -72;

        if (stageRef.current) {
          stageRef.current.style.opacity = String(fade);
        }
        if (wordmarkWrapRef.current) {
          wordmarkWrapRef.current.style.transform = `translate3d(${sx * -11}px, ${lift * 0.85 + sy * -5}px, 0) scale(${1 + p * 0.045})`;
        }
        if (portraitWrapRef.current) {
          portraitWrapRef.current.style.transform = `translate3d(${sx * 7}px, ${lift * 0.5 + sy * 3.5}px, 0) scale(${1 + p * 0.02})`;
        }
        if (frontOrbitWrapRef.current) {
          frontOrbitWrapRef.current.style.transform = `translate3d(${sx * -11}px, ${lift * 0.85 + sy * -5}px, 0) scale(${1 + p * 0.045})`;
        }
        if (floorHaloRef.current) {
          floorHaloRef.current.style.transform = `translate3d(calc(-50% + ${sx * 5}px), calc(-50% + ${lift * 0.3}px), 0)`;
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={stageRef} className="hero-centerpiece">
      {/* =====================================================================
          LAYER 1 & 2 — DARK COSMIC GRID, STAR PARTICLES & PURPLE FLOOR HALO
          ===================================================================== */}
      <div className="hero-centerpiece__cosmic-bg" aria-hidden="true">
        <span className="hero-centerpiece__star hero-centerpiece__star--1" />
        <span className="hero-centerpiece__star hero-centerpiece__star--2" />
        <span className="hero-centerpiece__star hero-centerpiece__star--3" />
        <span className="hero-centerpiece__star hero-centerpiece__star--4" />
        <span className="hero-centerpiece__star hero-centerpiece__star--5" />
        <span className="hero-centerpiece__star hero-centerpiece__star--6" />
      </div>

      {/* Luminous purple elliptical floor halo ring beneath Asrar's feet */}
      <div ref={floorHaloRef} className="hero-centerpiece__floor-halo" aria-hidden="true">
        <div className="hero-centerpiece__floor-ring-outer" />
        <div className="hero-centerpiece__floor-ring-core" />
      </div>

      {/* =====================================================================
          LAYER 3 & 4 — METALLIC SILVER-PURPLE "ASRAR" WORDMARK & ORBITAL RING
          Positioned behind the full-body portrait.
          ===================================================================== */}
      <div ref={wordmarkWrapRef} className="hero-centerpiece__wordmark-layer">
        <svg
          className="hero-centerpiece__svg hero-centerpiece__svg--back"
          viewBox="142 94 736 254"
          role="img"
          aria-label="ASRAR"
          preserveAspectRatio="xMidYMid meet"
        >
          <title>ASRAR</title>

          <defs>
            {/* Reference-Matched Brushed Silver-Lavender-Violet Metallic Gradient */}
            <linearGradient id="asrarMetalBody" x1="0%" y1="0%" x2="4%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="12%" stopColor="#F3F0FA" />
              <stop offset="26%" stopColor="#DBD5E9" />
              <stop offset="40%" stopColor="#A698C8" />
              <stop offset="53%" stopColor="#6D5C99" />
              <stop offset="67%" stopColor="#3B2D62" />
              <stop offset="79%" stopColor="#5D5182" />
              <stop offset="91%" stopColor="#B8B0CC" />
              <stop offset="100%" stopColor="#F7F5FC" />
            </linearGradient>

            {/* Subtle Lavender-Silver Studio Reflection Sheen */}
            <linearGradient id="asrarMetalSheen" x1="0%" y1="15%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
              <stop offset="25%" stopColor="#C4B5FD" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#6D28D9" stopOpacity="0.16" />
              <stop offset="75%" stopColor="#DDD6FE" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.32" />
            </linearGradient>

            {/* Crisp Silver-White Specular Rim Bevel */}
            <linearGradient id="asrarBevelRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="24%" stopColor="#EFEAFF" />
              <stop offset="55%" stopColor="#9F8EC9" />
              <stop offset="82%" stopColor="#DFD7F5" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            {/* Luminous Purple Orbital Ring Core Gradient */}
            <linearGradient id="orbitCoreGrad" x1="0%" y1="50%" x2="100%" y2="30%">
              <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.95" />
              <stop offset="24%" stopColor="#C084FC" stopOpacity="0.88" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.96" />
              <stop offset="76%" stopColor="#A855F7" stopOpacity="0.85" />
              <stop offset="93%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#D8B4FE" stopOpacity="0.9" />
            </linearGradient>

            {/* Soft Lavender-Violet Orbital Bloom Gradient */}
            <linearGradient id="orbitBloomGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#9333EA" stopOpacity="0.58" />
              <stop offset="35%" stopColor="#C084FC" stopOpacity="0.72" />
              <stop offset="68%" stopColor="#7C3AED" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#E9D5FF" stopOpacity="0.85" />
            </linearGradient>

            {/* Secondary Cosmic Background Arcs */}
            <linearGradient id="cosmicArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="30%" stopColor="#8B5CF6" stopOpacity="0.28" />
              <stop offset="72%" stopColor="#EC4899" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </linearGradient>

            {/* Mask that weaves the foreground orbit IN FRONT of A1's left leg, lower S, lower center-R, and upper R-A-R,
                while tucking BEHIND A1's thick right leg + upper S (x=266..450, y=125..220) and BEHIND lower A2 & R2 (x=615..855, y=185..265)
                exactly like the reference image! */}
            <mask id="orbitWeaveMask">
              <rect x="100" y="70" width="830" height="310" fill="white" />
              {/* Tuck behind thick right leg of A1, upper S, and left stem of center R */}
              <rect x="266" y="128" width="186" height="92" fill="black" />
              {/* Tuck behind lower-right A2 and R2 stems */}
              <rect x="615" y="186" width="240" height="80" fill="black" />
            </mask>
          </defs>

          {/* LAYER 2B: Subtle diagonal cosmic orbital arcs in deep background */}
          <path
            d="M 255 72 Q 515 212 785 362"
            fill="none"
            stroke="url(#cosmicArcGrad)"
            strokeWidth="1.05"
          />
          <path
            d="M 165 318 Q 360 195 520 110"
            fill="none"
            stroke="url(#cosmicArcGrad)"
            strokeWidth="0.85"
            opacity="0.55"
          />

          {/* LAYER 3A: Rear segment of the purple orbital ring (visible behind the letters where masked) */}
          <g transform="rotate(-8.8 496 212)">
            <ellipse
              cx="496"
              cy="212"
              rx="344"
              ry="56"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="4.5"
              strokeOpacity="0.22"
            />
            <ellipse
              cx="496"
              cy="212"
              rx="344"
              ry="56"
              fill="none"
              stroke="#C4B5FD"
              strokeWidth="0.95"
              strokeOpacity="0.34"
            />
          </g>

          {/* LAYER 3B: METALLIC SILVER-PURPLE "ASRAR" TYPOGRAPHY */}
          <g className="hero-centerpiece__glyphs">
            {/* Pass 1: Subtle Soft Violet Outer Rim Glow */}
            <g
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="4.5"
              strokeOpacity="0.22"
              strokeLinejoin="miter"
              strokeMiterlimit="4"
            >
              {ALL_GLYPHS.map((d, i) => (
                <path key={`glow-${i}`} d={d} fillRule="evenodd" />
              ))}
            </g>

            {/* Pass 2: 3D Dimensional Dark Indigo-Charcoal Extrusion Shadow */}
            <g transform="translate(0, 2.8)" fill="#120D20" fillOpacity="0.92">
              {ALL_GLYPHS.map((d, i) => (
                <path key={`ext-${i}`} d={d} fillRule="evenodd" />
              ))}
            </g>

            {/* Pass 3: Main Brushed Silver-Lavender-Violet Metallic Body Fill */}
            <g fill="url(#asrarMetalBody)">
              {ALL_GLYPHS.map((d, i) => (
                <path key={`fill-${i}`} d={d} fillRule="evenodd" />
              ))}
            </g>

            {/* Pass 4: Horizontal Studio Light Sheen */}
            <g fill="url(#asrarMetalSheen)">
              {ALL_GLYPHS.map((d, i) => (
                <path key={`sheen-${i}`} d={d} fillRule="evenodd" />
              ))}
            </g>

            {/* Pass 5: Inner 3D Chisel Facet Ridges */}
            <g
              fill="none"
              stroke="#EDE9FE"
              strokeWidth="1.15"
              strokeOpacity="0.34"
              strokeLinecap="round"
            >
              {FACET_RIDGES.map((d, i) => (
                <path key={`ridge-${i}`} d={d} />
              ))}
            </g>

            {/* Pass 6: Crisp Silver-White Specular Rim Bevel */}
            <g
              fill="none"
              stroke="url(#asrarBevelRim)"
              strokeWidth="1.85"
              strokeLinejoin="miter"
              strokeMiterlimit="6"
            >
              {ALL_GLYPHS.map((d, i) => (
                <path key={`rim-${i}`} d={d} fillRule="evenodd" />
              ))}
            </g>
          </g>

          {/* LAYER 4: ORBITAL RING WEAVING AROUND TYPOGRAPHY (AND STRICTLY BEHIND PORTRAIT) */}
          <g mask="url(#orbitWeaveMask)">
            <g transform="rotate(-8.8 496 212)">
              {/* Soft lavender-purple outer bloom */}
              <ellipse
                ref={orbitBloomRef}
                cx="496"
                cy="212"
                rx="344"
                ry="56"
                fill="none"
                stroke="url(#orbitBloomGrad)"
                strokeWidth="7.5"
                strokeOpacity="0.46"
              />
              {/* Mid violet halo */}
              <ellipse
                cx="496"
                cy="212"
                rx="344"
                ry="56"
                fill="none"
                stroke="#C084FC"
                strokeWidth="3.2"
                strokeOpacity="0.58"
              />
              {/* Thin luminous purple-white orbital core */}
              <ellipse
                cx="496"
                cy="212"
                rx="344"
                ry="56"
                fill="none"
                stroke="url(#orbitCoreGrad)"
                strokeWidth="1.45"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* =====================================================================
          LAYER 5 — FULL-BODY HIGH-RESOLUTION PORTRAIT (<picture>)
          Layered strictly in front of the ASRAR typography & orbit.
          ===================================================================== */}
      <div ref={portraitWrapRef} className="hero-centerpiece__portrait-layer">
        <picture className="hero-centerpiece__picture">
          <source
            type="image/webp"
            srcSet="/assets/hero/asrar-3d-1x.webp 522w, /assets/hero/asrar-3d.webp 836w"
            sizes="(max-width: 768px) 88vw, 60vw"
          />
          <img
            ref={portraitImgRef}
            src="/assets/hero/asrar-3d.png"
            srcSet="/assets/hero/asrar-3d.png 836w"
            sizes="(max-width: 768px) 88vw, 60vw"
            alt="Asrar Mulla full-body portrait"
            className="hero-centerpiece__portrait-img"
            width="836"
            height="1064"
            decoding="async"
          />
        </picture>
      </div>

      {/* =====================================================================
          LAYER 6 — FRONT ORBITAL LIGHT ACCENTS & RIGHT-SIDE FLARE
          Carefully masked so NOTHING covers Asrar's face, shirt, or blazer.
          ===================================================================== */}
      <div
        ref={frontOrbitWrapRef}
        className="hero-centerpiece__front-accents-layer"
        aria-hidden="true"
      >
        <svg
          className="hero-centerpiece__svg hero-centerpiece__svg--front"
          viewBox="142 94 736 254"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Mask that completely protects Asrar's entire head, face, neck, and torso (x=446..554)
                plus the behind-letter weave zones so front light accents never cross his body */}
            <mask id="protectPortraitBodyMask">
              <rect x="100" y="70" width="830" height="310" fill="white" />
              {/* Protect entire portrait silhouette from head to waist */}
              <ellipse cx="502" cy="128" rx="66" ry="62" fill="black" />
              <rect x="446" y="140" width="110" height="145" rx="18" fill="black" />
              {/* Also respect the behind-letter weave zones */}
              <rect x="266" y="128" width="186" height="92" fill="black" />
              <rect x="615" y="186" width="240" height="80" fill="black" />
            </mask>

            {/* Mask for subtle mobile outer-edge R continuity — keeps face, neck, and entire white shirt 100% clear */}
            <mask id="outerRContinuityMask">
              <rect x="392" y="138" width="244" height="130" fill="white" />
              {/* Protect portrait head, face, neck, and central white shirt */}
              <ellipse cx="502" cy="126" rx="72" ry="58" fill="black" />
              <rect x="466" y="140" width="70" height="132" rx="14" fill="black" />
            </mask>

            <radialGradient id="starburstGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="20%" stopColor="#F5F3FF" stopOpacity="0.92" />
              <stop offset="48%" stopColor="#C084FC" stopOpacity="0.52" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="pinpointGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
              <stop offset="35%" stopColor="#D8B4FE" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle outer-edge wordmark rim for center "R" around the outer shoulder/arm edges */}
          <g mask="url(#outerRContinuityMask)" className="hero-centerpiece__r-bridge">
            <path
              d={GLYPH_R_CENTER}
              fill="none"
              stroke="#E9D5FF"
              strokeWidth="1.4"
              strokeOpacity="0.38"
              fillRule="evenodd"
            />
          </g>

          {/* Front orbital traveling light & specular glints (strictly outside portrait body & face) */}
          <g mask="url(#protectPortraitBodyMask)">
            <g transform="rotate(-8.8 496 212)">
              {/* Animated traveling orbital light comet bloom */}
              <ellipse
                ref={pulseGlowRef}
                cx="496"
                cy="212"
                rx="344"
                ry="56"
                fill="none"
                stroke="#C084FC"
                strokeWidth="4.8"
                strokeLinecap="round"
                strokeDasharray="175 605"
                strokeDashoffset="0"
                strokeOpacity="0.52"
              />
              {/* Animated traveling orbital light comet core */}
              <ellipse
                ref={pulsePathRef}
                cx="496"
                cy="212"
                rx="344"
                ry="56"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeDasharray="125 655"
                strokeDashoffset="0"
                strokeOpacity="0.9"
              />
            </g>

            {/* Specular pinpoint glints matching the reference screenshot */}
            {/* 1. Top apex of first A */}
            <circle cx="275" cy="142" r="12" fill="url(#pinpointGlow)" />
            <circle cx="275" cy="142" r="1.8" fill="#FFFFFF" />

            {/* 2. Left orbital wrap highlight */}
            <circle cx="162" cy="256" r="13" fill="url(#pinpointGlow)" />

            {/* 3. Lower-left orbital hot node at base of center R */}
            <ellipse cx="436" cy="252" rx="22" ry="7.5" fill="url(#pinpointGlow)" />
            <circle cx="436" cy="252" r="2" fill="#FFFFFF" />

            {/* 4. Lower-right orbital hot node at sweeping leg of center R */}
            <ellipse cx="566" cy="240" rx="22" ry="7.5" fill="url(#pinpointGlow)" />
            <circle cx="566" cy="240" r="2" fill="#FFFFFF" />

            {/* 5. Bottom-right serif tip of final R */}
            <circle cx="846" cy="256" r="12" fill="url(#pinpointGlow)" />
            <circle cx="846" cy="256" r="1.8" fill="#FFFFFF" />

            {/* 6. Refined optical light flare at the rightmost orbital apex (x=838, y=158) */}
            <g ref={flareGroupRef}>
              <circle cx="838" cy="158" r="26" fill="url(#starburstGlow)" />
              <circle cx="838" cy="158" r="12" fill="url(#starburstGlow)" />
              <path
                d="M 820 158 L 856 158 M 838 142 L 838 174"
                stroke="#FFFFFF"
                strokeWidth="1.25"
                strokeLinecap="round"
                opacity="0.88"
              />
              <path
                d="M 827 147 L 849 169 M 827 169 L 849 147"
                stroke="#E9D5FF"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0.68"
              />
              <circle cx="838" cy="158" r="3.4" fill="#FFFFFF" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
