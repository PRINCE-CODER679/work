import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { gsap, ScrollTrigger, prefersReducedMotion } from './animations/motion';
import { useSmoothScroll, scrollToTarget } from './hooks/useSmoothScroll';
import { app, scenes } from './utils/store';
import { Stage3D } from './scenes/Stage3D';
import { BootIntro } from './components/chrome/BootIntro';
import { CustomCursor } from './components/chrome/CustomCursor';
import { Navbar } from './components/chrome/Navbar';
import { FullscreenMenu } from './components/chrome/FullscreenMenu';
import { CommandPalette } from './components/chrome/CommandPalette';
import { BlueprintGrid } from './components/chrome/BlueprintGrid';
import { Home } from './pages/Home';
import { CaseStudy } from './pages/CaseStudy';

const SCENE_READOUTS = [
  { id: 'scene-hero', label: '01 / HERO' },
  { id: 'scene-about', label: '02 / ABOUT' },
  { id: 'scene-work-intro', label: '03 / WORK' },
  { id: 'scene-spendsense', label: '04 / SPENDSENSE' },
  { id: 'scene-signsense', label: '05 / SIGNSENSE' },
  { id: 'scene-medikiosk', label: '06 / MEDIKIOSK' },
  { id: 'scene-devtalks', label: '07 / DEVTALKS' },
  { id: 'scene-toolbox', label: '08 / TOOLBOX' },
  { id: 'scene-dsa', label: '09 / DSA' },
  { id: 'scene-lab', label: '10 / LAB' },
  { id: 'scene-direction', label: '11 / NEXT' },
  { id: 'scene-contact', label: '12 / CONTACT' },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [blueprint, setBlueprint] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [activeScene, setActiveScene] = useState('01 / HERO');

  const curtainRef = useRef(null);
  const transitioningRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Mount Lenis smooth scroll synced cleanly with GSAP ScrollTrigger
  useSmoothScroll(true);

  // Pause underlying smooth scroll while fullscreen modals are open
  useEffect(() => {
    if (!app.lenis) return;
    if (menuOpen || paletteOpen) {
      app.lenis.stop();
    } else {
      app.lenis.start();
    }
  }, [menuOpen, paletteOpen]);

  // Global keyboard shortcuts (`/` and `Ctrl+K` / `Cmd+K` for developer command palette)
  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMenuOpen(false);
        setPaletteOpen((v) => !v);
        return;
      }

      if (!typing && e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setMenuOpen(false);
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Track active exhibition scene label & toggle Hero 3D visibility on routes
  useEffect(() => {
    const isCaseRoute = location.pathname.startsWith('/work/');
    scenes.hero.visible = !isCaseRoute;

    if (isCaseRoute) {
      const slug = location.pathname.replace('/work/', '').toUpperCase() || 'CASE';
      setActiveScene(`CASE // ${slug}`);
      return undefined;
    }

    const visibleMap = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleMap.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        // Pick topmost visible or highest intersecting band near viewport top
        let best = null;
        for (const item of SCENE_READOUTS) {
          const el = document.getElementById(item.id);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.top <= window.innerHeight * 0.48 && r.bottom >= window.innerHeight * 0.15) {
            best = item.label;
          }
        }
        if (best) setActiveScene(best);
      },
      { threshold: [0, 0.1, 0.25, 0.5], rootMargin: '-12% 0px -35% 0px' }
    );

    const onScrollSync = () => {
      let best = SCENE_READOUTS[0].label;
      for (const item of SCENE_READOUTS) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.45 && r.bottom >= 60) {
          best = item.label;
        }
      }
      setActiveScene(best);
    };

    for (const { id } of SCENE_READOUTS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    window.addEventListener('scroll', onScrollSync, { passive: true });
    onScrollSync();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScrollSync);
    };
  }, [location.pathname, ready]);

  // Signal-orange vertical shutter page transition between Home and /work/:slug
  const transitionTo = useCallback(
    (path, state = null, postScrollSelector = null) => {
      if (transitioningRef.current) return;
      const curtain = curtainRef.current;

      if (prefersReducedMotion() || !curtain) {
        navigate(path, state ? { state } : undefined);
        window.scrollTo(0, 0);
        if (postScrollSelector) {
          setTimeout(() => scrollToTarget(postScrollSelector), 140);
        }
        return;
      }

      transitioningRef.current = true;
      gsap.killTweensOf(curtain);
      gsap
        .timeline({
          onComplete: () => {
            transitioningRef.current = false;
            ScrollTrigger.refresh();
          },
        })
        .set(curtain, { transformOrigin: 'bottom center' })
        .to(curtain, { scaleY: 1, duration: 0.36, ease: 'power3.inOut' })
        .add(() => {
          navigate(path, state ? { state } : undefined);
          window.scrollTo(0, 0);
          if (app.lenis) app.lenis.scrollTo(0, { immediate: true });
        })
        .set(curtain, { transformOrigin: 'top center' })
        .to(curtain, { scaleY: 0, duration: 0.48, delay: 0.05, ease: 'power3.out' })
        .add(() => {
          if (postScrollSelector) scrollToTarget(postScrollSelector);
        }, '-=0.18');
    },
    [navigate]
  );

  const handleOpenCase = useCallback(
    (slug) => transitionTo(`/work/${slug}`),
    [transitionTo]
  );

  const handleBackHome = useCallback(
    (scrollToSelector = null) => {
      if (location.pathname === '/' && scrollToSelector) {
        scrollToTarget(scrollToSelector);
        return;
      }
      transitionTo('/', scrollToSelector ? { scrollTo: scrollToSelector } : null, scrollToSelector);
    },
    [location.pathname, transitionTo]
  );

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Stage3D wireframe={wireframe} />
      <BlueprintGrid loud={blueprint} />

      <BootIntro onReady={() => setReady(true)} />
      <CustomCursor />

      <Navbar
        activeScene={activeScene}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        blueprint={blueprint}
        onToggleBlueprint={() => setBlueprint((v) => !v)}
        wireframe={wireframe}
        onToggleWireframe={() => setWireframe((v) => !v)}
      />

      <Routes>
        <Route path="/" element={<Home ready={ready} onOpenCase={handleOpenCase} />} />
        <Route
          path="/work/:slug"
          element={<CaseStudy onOpenCase={handleOpenCase} onBackHome={handleBackHome} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <div className="grain" aria-hidden="true" />
      <div ref={curtainRef} className="route-curtain" aria-hidden="true" />
    </>
  );
}

