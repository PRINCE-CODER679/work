# REFERENCE ANALYSIS — INTERACTION & CRAFT STUDY

This document records concrete motion, WebGL, typography, and interaction mechanics observed through live browser inspection across all four reference websites (`razorpay.com/ai-builders/`, `toyfight.co/`, `vectors-group.com/en`, and `www.hardikbhansali.com/`), and specifies how each mechanic is **originally re-engineered** for **Asrar Mulla's** portfolio without copying proprietary code, artwork, or branded assets.

---

## Reference Audit Matrix

| Site | Core Stack Observed | Dominant Palette | Typography Voice | Signature Spatial Idea |
| :--- | :--- | :--- | :--- | :--- |
| **Razorpay AI Builders** | GSAP 3.12.5 + ScrollTrigger + Three.js (r160) + Lenis + 2D ASCII Canvases | `#000000`, `#002BFF` Cobalt, `#FFFFFF` | *Instrument Serif* + *Inter Tight* | Character-scramble decoding + cobalt ASCII/dithered blueprint callouts + word-by-word scroll illumination |
| **ToyFight** | Three.js (r149) + Lenis + Custom Command Drawer | `#FAF6EF` Cream, `#0A0A0A` Ink, Pastel Pill Highlight | *SpeziaCondensed*, *FKRasterGrotesk*, *SpeziaMono* | Cream-to-ink contrast flips + floating 3D focal artifact behind pill-framed display words + `/` terminal overlay |
| **Vectors Group** | Three.js (r180) + Lenis + Nuxt + Custom Cursor (`c-mouse-cursor`) | `#E85D2F` Signal Orange, `#0D0D0D`, `#F3F0E8` | *Cy* + *Neue Montreal* | Living architectural coordinate grid + stepped diagonal type + numbered `01–09` hairline index + split two-tone footer |
| **Hardik Bhansali** | Three.js (r176) + Lenis + GLB Scene + Webcam Hand Tracking | `#050505` Pitch Dark, Warm Amber HUD | *Pixel* + *Helvetica Light* | Fixed persistent fullscreen WebGL canvas driven by HTML story scroll + webcam gesture interactive mode |

---

## 18 High-Value Interactions & Original Adaptations

### 1. Character-Scramble Telemetry Decode *(Razorpay AI Builders)*
- **Observed Behavior:** Major headings and labels pass through rapid ASCII/alphanumeric glyph permutations before resolving sequentially left-to-right into crisp letterforms.
- **Technical Mechanism:** Custom `ScrambleText` utility driven by GSAP/RAF timeline mapping character index progress `p` against a curated glyph charset (`01/_[]#X*+`), locking resolved characters progressively while jittering unresolved slots at ~24fps.
- **Original Adaptation:** Used on `SYSTEM://ASRAR` boot telemetry, hero coordinate badges, project index headers (`SPENDSENSE`, `SIGNSENSE`, `MEDIKIOSK`, `DEVTALKS`), and monospace status labels on viewport entry (`prefers-reduced-motion` skips directly to resolved copy).

### 2. Progressive Word-by-Word Scroll Illumination *(Razorpay AI Builders)*
- **Observed Behavior:** Long manifesto copy starts muted (`~22%` opacity) and illuminates word-by-word as the visitor scrolls through the pinned/scrubbed viewport band.
- **Technical Mechanism:** Word-level text splitting (`<span>` per word) paired with GSAP `ScrollTrigger` `scrub: 0.8` staggering opacity (`0.22 -> 1.0`) and subtle color shift (`#F5F2EB` / `#536BFF` accent words) across scroll progress.
- **Original Adaptation:** Core narrative engine of **Scene 02 — About / Identity** (`CURIOUS BY NATURE. BUILDER BY CHOICE.`), highlighting technical identity tokens (`AI & Data Science`, `FastAPI`, `MediaPipe`, `real products`) as the visitor scrubs downward and reversing cleanly upward.

### 3. Blueprint Callout Reticles & Elbow Leaders *(Razorpay AI Builders)*
- **Observed Behavior:** Around a central 3D volumetric form, rectangular CAD selection brackets with corner handles (`x100`) and thin orthogonal-to-diagonal leader lines call out architectural principles.
- **Technical Mechanism:** Synchronized 2D overlay SVG hairline paths (`stroke-dashoffset` reveal) anchored to 3D projection coordinates or percentage-based stage markers with subtle pointer parallax.
- **Original Adaptation:** Framing the **Hero Computational Rig** (Scene 01) and **SpendSense Telemetry Rig** (Scene 04) with live pointer coordinates, focal distance readout (`CAM.Z // +7.40`), and crisp hairline engineering brackets.

### 4. Continuous Fixed-Canvas World + Scrolled Story Layers *(Hardik Bhansali & Vectors Group)*
- **Observed Behavior:** Instead of disjointed boxed canvases per band, the WebGL world stays alive across scenes while HTML editorial typography scrolls cleanly over/around it, modulating camera position, lighting, and object state.
- **Technical Mechanism:** Persistent `<Stage3D />` fixed canvas (`z-index: 0`) reading normalized per-scene progress values (`scenes.hero.progress`, `scenes.about.progress`, etc.) written by GSAP ScrollTrigger into a non-reactive shared mutable store (`src/utils/store.js`), avoiding React re-renders per frame.
- **Original Adaptation:** Powers the continuous visual bridge from **Scene 00 (Intro)** -> **Scene 01 (Hero Computational Rig)** -> **Scene 02 (About)** -> **Scene 03 (Selected Work Transition)** -> **Scene 12 (Contact Finale Loop)** where the hero architectural rings and monoliths re-emerge to close the visual loop.

### 5. Polarity Flip Transitions: Ink `#080808` ↔ Cream `#F3F0E8` *(ToyFight & Vectors Group)*
- **Observed Behavior:** Sharp, intentional polarity reversals between rich matte dark obsidian and warm paper cream reset the visitor's eye without soft washed-out gradients.
- **Technical Mechanism:** GSAP ScrollTrigger scrubbed background/foreground interpolation and/or crisp wipe masks synchronized with WebGL fog/ambient light color shifts.
- **Original Adaptation:** Hero (`#080808`) transitions dynamically as the camera dives through the computational gate into Scene 02 About (`#F3F0E8` warm editorial daylight with `#0A0A0A` ink), snapping back to deep `#080808` for Selected Work (`WORK.`), shifting briefly to clinical `#06201F`/`#F3F0E8` cues inside MediKiosk, crimson/noir inside DEVTALKS, and returning to `#080808` + Cobalt/Signal Orange for the Finale.

### 6. Stepped Asymmetrical Editorial Typography *(Vectors Group)*
- **Observed Behavior:** Oversized display lines break standard centered alignment, stepping diagonally across columns with micro-metadata nestled into the open counter-space.
- **Technical Mechanism:** 12-column CSS Grid editorial tracks (`--col`) with variable `clamp()` scaling (`120px–220px+` on desktop) and opposing horizontal parallax offsets (`data-parallax-x`).
- **Original Adaptation:** Deployed in Hero (`BUILDING / WHAT'S / NEXT.`), About (`CURIOUS / BY NATURE / BUILDER / BY CHOICE`), and Scene 03 (`SELECTED / WORK.`), creating museum-exhibition scale and tension.

### 7. Line-Mask Clip-Path & Baseline Reveal *(Vectors Group & ToyFight)*
- **Observed Behavior:** Display lines emerge from behind an invisible razor-sharp horizontal floor mask rather than fading in lazily.
- **Technical Mechanism:** Overflow-clipped line wrappers (`.line-mask`) translating inner spans from `yPercent: 112` + `rotate: 2deg` to `0` using custom cubic-bezier easing (`EASE.type`).
- **Original Adaptation:** Every major scene header, menu item, and case-study title enters via masked baseline extrusion.

### 8. Keyboard Command Terminal Overlay — `Press / for ?` *(ToyFight)*
- **Observed Behavior:** Pressing `/` opens a sleek side command palette allowing visitors to jump to sections, trigger visual modes (`bw`, `negative`, `reset`), or inspect commands via keyboard.
- **Technical Mechanism:** Global keydown listener (`/` or `Meta+K`) toggling an accessible ARIA drawer with autocomplete command execution and instant Lenis scroll-to or theme state toggles.
- **Original Adaptation:** Implemented as an authentic developer power-user command palette (`/` shortcut + subtle header hint): supports `home`, `about`, `work`, `spendsense`, `signsense`, `medikiosk`, `devtalks`, `stack`, `dsa`, `lab`, `contact`, `grid` (toggle architectural blueprint overlay), and `wireframe` (3D wireframe inspection easter egg!).

### 9. Custom Contextual Interpolated Cursor *(Vectors Group)*
- **Observed Behavior:** Desktop cursor glides smoothly behind the hardware pointer and morphs shape/label (`VIEW`, `OPEN`, `DRAG`, `EXPLORE`) depending on `[data-cursor]` attributes.
- **Technical Mechanism:** `requestAnimationFrame` exponential damping (`damp(cx, px, 14, dt)`), disabled cleanly when `(hover: none)` or `prefers-reduced-motion: reduce`.
- **Original Adaptation:** Minimal 8px central reticle dot + 34px outer ring that expands into crisp pill badges (`VIEW`, `OPEN`, `EXPLORE`, `DRAG`, `PLAY`, `NEXT`) with sub-pixel smoothness.

### 10. Parametric Technical Grid & Corner Registration Brackets *(Vectors Group)*
- **Observed Behavior:** Subtle `1px` coordinate grids with crisp L-shaped corner fiducial marks anchor typography and interactive modules like a precision engineering viewport.
- **Technical Mechanism:** Procedural canvas/CSS hairline grid synced with Lenis scroll offset + lightweight SVG fiducial brackets.
- **Original Adaptation:** Runs throughout dark and cream scenes as an understated drafting coordinate layer, toggleable in full blueprint mode via the `/` command palette.

### 11. Interactive Hardware / Spatial Media Staging *(ToyFight & Hardik Bhansali)*
- **Observed Behavior:** Interactive works sit inside spatial frames or bespoke 3D rigs that respond continuously to pointer tilt and scroll depth rather than static rounded cards.
- **Technical Mechanism:** Dedicated Three.js/R3F project stages (or depth-layered parallax rigs) mapping pointer delta to subtle yaw/pitch and scroll progress to camera zoom/layer explosion.
- **Original Adaptation:**
  - **SpendSense AI** receives a custom 3D floating monolith console + separated telemetry layers (`Statement Parser`, `Categorizer`, `Anomaly Engine`, `Forecast`).
  - **SignSense AI** swaps out screens entirely for a **live interactive 21-point 3D hand landmark skeleton** controlled by the visitor's mouse/touch + real webcam MediaPipe-inspired geometry!
  - **MediKiosk** presents a clean clinical architectural terminal + 5-node spatial patient journey flow (`Identify -> Converse -> Scan -> Structure -> Review`).
  - **DEVTALKS** transforms into an **editorial crimson-and-ink kinetic poster wall** with mouse-driven GLSL paper-ripple distortion and flippable dossier geometry.

### 12. Full-Width Index Table with Spatial Hover Preview *(Vectors Group)*
- **Observed Behavior:** Full-width rows separated by 1px hairlines with right-aligned superscript numbers (`01`..`09`) that shift and surface visual context on hover.
- **Technical Mechanism:** CSS grid rows with expanding underline / arrow translation and floating cursor-tracked preview card.
- **Original Adaptation:** Used in the Fullscreen Index Menu and the interactive Case-Study Specs / DSA Experiments index so recruiters can scan architecture, role, stack, and live links in seconds.

### 13. Non-Blocking Fast Asset-Aware Intro vs. Blocking Gate *(Lesson from Hardik Bhansali & DEVTALKS)*
- **Observed Behavior:** Hardik Bhansali's mandatory "CLICK ANYWHERE TO ENTER" + uncached GLB blocked rendering on software GPUs; DEVTALKS used an optional enter gate.
- **Technical Mechanism:** Procedural WebGL geometry initializes in <120ms with zero large external binary `.glb` bottlenecks, while a crisp **1.35s skippable technical sequence** (`SYSTEM://ASRAR`) reveals the environment smoothly as the hero camera pulls back.
- **Original Adaptation:** Fast, genuine initialization tracker that immediately enters Scene 01 with a smooth camera pullback and an instant `[SKIP INTRO]` / `Esc` affordance.

### 14. Playable WebGL Easter-Egg Experience *(Razorpay AI Builders & Hardik Bhansali)*
- **Observed Behavior:** Razorpay embeds a retro-technical WebGL/ASCII mini-game challenge right in the experience; Hardik turns computer vision into an interactive playground.
- **Technical Mechanism:** Self-contained interactive WebGL/Canvas simulation with real win/completion state, keyboard + pointer controls, and audio toggle off by default.
- **Original Adaptation:** **Scene 10 — Experiment Lab (`SIGNAL RUNNER // DATA UNIVERSE`)**: A genuine interactive 3D/Canvas spatial navigation puzzle where visitors pilot an autonomous signal probe through Asrar's 5 domain nodes (`AI & ML`, `Computer Vision`, `Full-Stack Systems`, `Clinical Tech`, `Creative Web`) to link and stabilize all 5 clusters, featuring WASD/Arrow + Pointer steering, mobile D-pad, Reset, optional synthesized Web Audio chimes (OFF by default), and a secret `OVERCLOCK` Easter Egg state upon completion.

### 15. Split-Polarity Architectural Footer + Back-to-Top Loop *(Vectors Group & ToyFight)*
- **Observed Behavior:** Vectors concludes with an oversized continuous kinetic marquee band above a high-contrast two-tone footer (`#F3F0E8` left + `#FF5924` Signal Orange right) and circular Back-to-Top trigger.
- **Technical Mechanism:** Infinite CSS/GSAP ticker paired with magnetic circular button (`window.scrollTo` / `lenis.scrollTo(0)`) and WebGL scene camera return.
- **Original Adaptation:** **Scene 12 — Contact Finale** merges the returning Hero 3D sculptural ring with giant `HAVE AN IMPOSSIBLE IDEA? / LET'S BUILD IT.` typography, magnetic email/GitHub/LinkedIn CTAs, a real validated contact message composer (local feedback + mailto fallback), and a smooth `BACK TO ORIGIN ↑` loop.

### 16. Magnetic Pill CTA with Directional Fill Wipe *(Vectors Group & ToyFight)*
- **Observed Behavior:** Rounded capsule buttons pull slightly toward the pointer within a 32px halo while a background color slab sweeps upward from `translateY(101%)` to `0`.
- **Technical Mechanism:** Pointer offset relative to button bounding rect multiplied by `0.28` magnetic factor + CSS pseudo-element `transform: translateY(101% -> 0)` on `expo.out`.
- **Original Adaptation:** Applied selectively to primary hero/project CTAs, Nav menu button, and Contact Finale actions.

### 17. Numbered Structural Node Diagrams *(Vectors Group)*
- **Observed Behavior:** Bordered grid cards containing crisp animated geometric/orbital vector telemetry drawings alongside minimal two-line descriptions (`01`, `02`).
- **Technical Mechanism:** Procedural SVG stroke animation + rotation synced to intersection/scroll velocity.
- **Original Adaptation:** Used inside Scene 08 (**Tech Universe** node inspector) and Scene 09 (**DSA / Problem Solving** algorithmic structure cards: BST, Graph BFS/DFS, Hash Table, Stack, Linked List).

### 18. Fluid Lenis + ScrollTrigger Lifecycle Discipline *(All 4 References)*
- **Observed Behavior:** Inertia-smoothed scrolling without native scrollbar jitter, snapping back cleanly on resize or page transitions.
- **Technical Mechanism:** Single `Lenis` instance wired to `gsap.ticker.add((time) => lenis.raf(time * 1000))` with `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.lagSmoothing(0)`. `ScrollTrigger.refresh()` invoked after `document.fonts.ready`, image decode, and debounced resize.
- **Original Adaptation:** Central `<SmoothScrollProvider>` cleanly supporting arbitrary scroll-position reloads, reverse scrubbing, deep-link anchors, and instant disablement under `prefers-reduced-motion: reduce`.

