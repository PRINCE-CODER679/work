import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from '../animations/motion';
import { scrollToTarget } from '../hooks/useSmoothScroll';
import { HeroSection } from '../sections/HeroSection';
import { AboutSection } from '../sections/AboutSection';
import { WorkIntroSection } from '../sections/WorkIntroSection';
import { SpendSenseScene } from '../sections/SpendSenseScene';
import { SignSenseScene } from '../sections/SignSenseScene';
import { MediKioskScene } from '../sections/MediKioskScene';
import { DevTalksScene } from '../sections/DevTalksScene';
import { TechUniverseSection } from '../sections/TechUniverseSection';
import { DsaSection } from '../sections/DsaSection';
import { ExperimentLabSection } from '../sections/ExperimentLabSection';
import { DirectionSection } from '../sections/DirectionSection';
import { ContactSection } from '../sections/ContactSection';

/**
 * Connected exhibition stream rendering Scenes 01–12 in continuous sequence.
 */
export function Home({ ready, onOpenCase }) {
  const location = useLocation();

  useEffect(() => {
    const refreshId = setTimeout(() => {
      ScrollTrigger.refresh();
      if (location.state?.scrollTo) {
        scrollToTarget(location.state.scrollTo);
      }
    }, 80);
    return () => clearTimeout(refreshId);
  }, [location.state]);

  return (
    <main id="main-content">
      <HeroSection ready={ready} />
      <AboutSection />
      <WorkIntroSection />
      <SpendSenseScene onOpenCase={onOpenCase} />
      <SignSenseScene onOpenCase={onOpenCase} />
      <MediKioskScene onOpenCase={onOpenCase} />
      <DevTalksScene onOpenCase={onOpenCase} />
      <TechUniverseSection onOpenCase={onOpenCase} />
      <DsaSection />
      <ExperimentLabSection />
      <DirectionSection />
      <ContactSection />
    </main>
  );
}

