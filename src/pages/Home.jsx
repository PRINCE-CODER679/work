import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animations/motion';
import { scenes } from '../utils/store';
import { scrollToTarget } from '../hooks/useSmoothScroll';
import { HeroSection } from '../sections/HeroSection';
import { AboutSection } from '../sections/AboutSection';
import { ProjectRingSection } from '../sections/ProjectRingSection';
import { TechUniverseSection } from '../sections/TechUniverseSection';
import { ExperimentLabSection } from '../sections/ExperimentLabSection';
import { DirectionSection } from '../sections/DirectionSection';
import { ContactSection } from '../sections/ContactSection';

/**
 * Connected exhibition stream rendering Scenes in continuous sequence
 * featuring the Kai Marlow-inspired 3D Project Ring for Selected Work.
 */
export function Home({ ready, onOpenCase }) {
  const location = useLocation();

  useEffect(() => {
    const syncList = [
      ['#scene-about', 'about', 'top 90%', 'bottom 15%'],
      ['#scene-work-intro', 'workIntro', 'top 85%', 'bottom 15%'],
      ['#scene-toolbox', 'universe', 'top 88%', 'bottom 15%'],
      ['#scene-lab', 'lab', 'top 84%', 'bottom 20%'],
      ['#scene-direction', 'direction', 'top 88%', 'bottom 15%'],
    ];

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      for (const [selector, key, start, end] of syncList) {
        const target = document.querySelector(selector);
        if (!target || !scenes[key]) continue;
        ScrollTrigger.create({
          trigger: target,
          start,
          end,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scenes[key].progress = self.progress;
            scenes[key].visible = self.isActive;
          },
          onToggle: (self) => {
            scenes[key].visible = self.isActive;
            if (!self.isActive && self.progress < 0.05) {
              scenes[key].progress = 0;
            }
          },
        });
      }
    });

    const refreshId = setTimeout(() => {
      ScrollTrigger.refresh();
      if (location.state?.scrollTo) {
        scrollToTarget(location.state.scrollTo);
      }
    }, 80);

    return () => {
      clearTimeout(refreshId);
      ctx.revert();
    };
  }, [location.state]);

  return (
    <main id="main-content">
      <HeroSection ready={ready} />
      <AboutSection />
      <ProjectRingSection onOpenCase={onOpenCase} />
      <TechUniverseSection onOpenCase={onOpenCase} />
      <ExperimentLabSection onOpenCase={onOpenCase} />
      <DirectionSection />
      <ContactSection />
    </main>
  );
}
