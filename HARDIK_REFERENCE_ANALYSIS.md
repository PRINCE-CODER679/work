# HARDIK BHANSALI — EMPIRICAL REFERENCE ANALYSIS

Inspected URL: `https://www.hardikbhansali.com/`  
Capture viewports: Desktop `1440×900` (`docHeight: 8100px`) and Mobile `390×844` (`docHeight: 7596px`)  
Core runtime observed: Vite + Three.js `r176` (`WebGLRenderer`, persistent `#fixed-canvas` at `z-index: -1`) + Lenis smooth scroll + pinned `.section-container*` DOM layers (`z-index: 100`) driven by continuous normalized scroll progress.

---

## 1. Hero Composition
- The entire desktop viewport is framed inside a subtle black curved-bezel vignette (`CRT / 16mm cinema monitor` feel) rather than edge-to-edge SaaS sections.
- Top chrome stays light and airy: a centered uppercase display title (`HARDIK BHANSALI`) above a slim single-row yellow hairline bordered bio box (`1px solid`), with zero heavy multi-column navbars or CTAs cluttering the upper edge.
- A minimal vertical dot rail along the right margin tracks active narrative beats (`9` discrete chapter indicators).
- The center frame pairs warm amber-orange atmospheric light gradients and silhouette depth in WebGL with stacked serif typography (`THE WORLD WITNESSED THE BIRTH OF`), a clean subline (`a designer, and his power to bend reality with his craft.`), and a giant bottom-spanning `Pixel` display numeral (`22.09.2000`) anchoring the bottom third.

## 2. Initial Animation
- Load opens behind a full-viewport entry gate (`CLICK ANYWHERE TO ENTER`) showing only the centered header name + slim yellow bordered intro box, ensuring WebGL assets (`scene2-v1.glb`, shaders, fonts, audio) finish staging and unlocking audio interaction cleanly.
- On click/enter, the overlay dissolves into the lit atmospheric hero (`02-opening-0` through `02-opening-5`), revealing the warm amber glow, silhouette contour, grain/dispersion pass, and hero copy without jarring layout jumps.

## 3. Typography Movement
- Uses strong typographic contrast rather than uniform font weights: uppercase `HelveticaLight` / geometric sans for atmospheric statements, monospace/pixel display (`Pixel`) for high-impact numerals, project buttons, and clickable contact address, and clean sans (`Helvetica`) for compact metadata pills.
- Short lines are staggered diagonally (top-left paired with bottom-right in mid-film narrative beats such as `HE NEVER THOUGHT OF BEING A DESIGNER` / `HE WAS ALWAYS DESTINED TO BE ONE`) so eye travel sweeps across the center 3D subject instead of fighting centered walls of copy.

## 4. Image Treatment
- Images, textures, and video frames sit inside the WebGL post-processing pipeline rather than raw HTML cards: subtle film grain noise, vignette falloff toward frame borders, and gentle horizontal RGB chromatic fringe along high-contrast edges (especially visible in dark scenes, archival split clips, and project media floating inside the white gallery).
- Because textures exist inside the same lighting & grain shader space as 3D objects, photography and WebGL forms never look like separate cut-outs pasted onto a dark background.

## 5. Pointer Interaction
- Desktop pointer motion subtly shifts the camera azimuth/elevation and volumetric rim glow (`03-mouse-left.jpg` vs `04-mouse-right.jpg`), keeping the centerpiece fluid and responsive even when scroll is idle.
- Interactive buttons (testimonial selectors, project pills, audio track pills) maintain restrained outline states until active/focused, switching cleanly to solid contrast fill when selected (`OSCAR PÉREZ PINAZO` active state).

## 6. Scroll Choreography
- Uses Lenis smooth inertial scroll over an ~`8100px` timeline where DOM layers cross-fade or hold position relative to continuous `0% -> 100%` scroll progress instead of abrupt block boundaries.
- Reverse scroll (`85% -> 55% -> 25% -> 0%`) smoothly rewinds camera position, lighting state, and overlaid typography back to the opening frame (`15-reverse-0pct.jpg`) with zero stuck overlays or broken triggers.

## 7. Camera Paths
- The camera acts like an invisible dolly operator across one continuous spatial stage:
  - Opening / Hero (`0%–8%`): frontal atmospheric close-to-mid framing.
  - Waveform & origin beat (`8%–17%`): pulls back along the horizon as chromatic ribbon wave crosses center.
  - Polarity flip (`17%–29%`): accelerates into the high-key white spatial gallery.
  - Interactive sculpture (`29%–42%`): centers on a wireframe figurine (`scene2-v1.glb`).
  - Cosmic vortex / figure (`42%–54%`): pulls to a lone reflective silhouette on rippled floor beneath a bright overhead disk vortex.
  - Finale (`79%–100%`): pushes into an iridescent halo bust rising out of slow dark water ripples.

## 8. 3D Depth
- True foreground/midground/background layering is maintained at every stop: horizon haze + particle/grain atmosphere in the rear, reflective water plane / orbital gallery rings in midground, silhouette or sculpture at focal plane, and crisp HUD typography riding cleanly on front or diagonally offset safe zones.

## 9. Lighting
- Restraint gives highlights impact: mostly near-black (`#050505`–`#080808`) atmospheric spaces illuminated by one strong directional rim source (warm gold-orange in Hero, rainbow spectral dispersion on Waveform, crisp overhead key + floor bounce in Vortex, soft radial white aura in Finale), broken by one stark bright-white inversion during the Selected Work gallery (`#F3F0E8`–`#FFFFFF` contrast shift).

## 10. Scene Transitions
- Transitions feel optical rather than swipe-cut: grain density + chromatic aberration pulse between scenes as lighting temperature shifts from warm amber darkness (`Hero` / `Waveform`) into pure high-key white (`Work Gallery`), then collapses back into deep obsidian (`Lucid` / `Vortex`) and finishes in calm slate-silver reflection (`Contact`).

## 11. Project Presentation
- Featured work abandons conventional stacked portfolio cards: a pure white WebGL room suspends interactive curved/orbital project previews around a central axis, controlled by compact bottom pill buttons (`WTF - Nikhil Kamath`, `NoCode Shader`, `The Grid`, `Actress Becky Armstrong`, `Skull Crusher`, `Goofy Dev`) and a single crisp `View Project` action button.
- Clicking a project pill rotates/focuses that project's live preview in 3D space without leaving the spatial flow.

## 12. Navigation Behavior
- Minimal distraction chrome while scrolling: persistent top identity mark (`HARDIK BHANSALI` + short framing statement pill) and right-side chapter dots (`9` steps) keep location legible without persistent sidebars or mega-headers blocking the canvas.
- Adapting this for Asrar adds clean accessible keyboard navigation (`INDEX`, `ABOUT`, `WORK`, `LAB`, `CONTACT`, `Cmd/Ctrl+K` palette) tucked behind a sleek top bar & full-screen spatial index that dims the live 3D scene rather than fighting it.

## 13. Micro-Interactions
- Subtle cursor/pointer response on 3D camera damping.
- Audio waveform visualizer responds to active testimonial clip selection.
- Selected project pill toggles high-contrast highlight while orbited card snaps forward.
- Personal chapter track buttons swap background video/grain ambiance smoothly on demand.

## 14. Interactive Experience (`Experience Hardik's Dreams`)
- Centers an obsidian translucent/wireframe 3D figure (`scene2-v1.glb`) under bold single-line typography (`EXPERIENCE HARDIK'S DREAMS`).
- Places a hairline bordered instruction card below (`NO DATA IS BEING SAVED IN THIS INTERACTIVE EXPERIENCE. HAVE FUN`), pairing clear left/right gesture diagrams (`Pan left hand to orbit`, `Fist -> move forward / Open -> stop`) with a prominent primary CTA (`Start lucid dreaming`) plus `Refresh Webcam` secondary action.
- **Adaptation takeaway for Asrar:** Mouse + keyboard (`WASD`/Arrows) + touch D-pad MUST work out of the box with zero hardware barrier, while optional opt-in camera tracking remains strictly secondary so every visitor reaches the completion state reliably.

## 15. Contact Finale & Mobile Adaptation
- **Contact Finale (`79%–100%`):** Strips away all extra chrome except the top header, right dot indicator, calm water-ripple bust encircled by a glowing halo ring (`10-scroll-24-100pct.jpg`), centered direct email (`HARDIK@LUCERRA.CO`), and tight icon links (`LinkedIn`, `X`). Full-circle symmetry closes the film where human silhouette motifs began.
- **Mobile (`390×844`):** Preserves the exact atmospheric visual continuity (curved dark frame, grain shader, centered stacked typography, `2`-column project selector grid on mobile in `21-mobile-projects.jpg`, single `View Project` bottom button, simplified stacked instruction block, and unobstructed centered portrait/email finale) with `0px` horizontal overflow (`scrollWidth === 390`).

---

## Translation Blueprint for Asrar Mulla's Redesign
| Hardik Mechanics Preserved | Asrar Original Adaptation (`#080808` / `#F3F0E8` / `#536BFF` / `#FF5924`) |
|---|---|
| Persistent `WebGLRenderer` + CRT vignette / film grain / edge chromatic shader | Unified `Stage3D` continuous camera rail + custom GLSL atmosphere & optical pass |
| Entry/Opening sequence | `ASRAR://DIGITAL ENVIRONMENT` `0–4s` optical lock -> depth mask reveal of Asrar portrait & spatial geometry |
| Central atmospheric silhouette hero | `public/assets/hero/asrar-hero.jpg` integrated into a WebGL depth-lit 3D stage (cobalt `#536BFF` + orange `#FF5924` rim light + seamless obsidian background fade + architectural depth frames + spatial `BUILDING / WHAT'S / NEXT.`) |
| Polarity-flipped bright spatial work showcase | Cream `#F3F0E8` About chapter -> `SELECTED WORK.` camera acceleration -> connected `SpendSense AI` -> `SignSense AI` -> `MediKiosk` -> `DEVTALKS` 3D spatial exhibits using real screenshots & verified CTAs |
| Interactive 3D wireframe world | `ENTER ASRAR'S DIGITAL WORLD` 3D neural/orbital explorer with universal Mouse + Keyboard + Touch D-pad controls, Reset, and completion state |
| Full-circle calm halo finale | Camera pullback returning Hero architectural rings & glowing monolith silhouette around verified Email / GitHub / LinkedIn / Dispatch actions |

