import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../animations/motion';
import { universeAudio } from '../../utils/universeAudio';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import {
  BOOK_PAGE_SEQUENCE,
  CHAPTER_DOCK_ORDER,
} from './bookChaptersData';
import { StorybookScene3D } from './StorybookScene3D';
import {
  StorybookMobileReader,
  StorybookPageOverlays,
} from './ChapterOverlayContent';
import { SIGNAL_PROFILE } from './bookChaptersData';
import './storybook.css';

export const UNIVERSE_WORLDS = CHAPTER_DOCK_ORDER;

function DockIcon({ type }) {
  switch (type) {
    case 'folder':
      return (
        <svg viewBox="0 0 24 24" className="sb-dock__svg" aria-hidden="true">
          <path
            d="M3 6.5a2 2 0 0 1 2-2h4.2l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-10Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'brain':
      return (
        <svg viewBox="0 0 24 24" className="sb-dock__svg" aria-hidden="true">
          <path
            d="M9.5 4.5a3 3 0 0 0-3 3c-1.5.5-2.5 2-2.5 3.7 0 1.4.8 2.7 2 3.3a3.1 3.1 0 0 0 3 3.5h2.2V5.5a2.5 2.5 0 0 0-1.7-1Zm5 0a3 3 0 0 1 3 3c1.5.5 2.5 2 2.5 3.7 0 1.4-.8 2.7-2 3.3a3.1 3.1 0 0 1-3 3.5h-2.2V5.5a2.5 2.5 0 0 1 1.7-1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'mountain':
      return (
        <svg viewBox="0 0 24 24" className="sb-dock__svg" aria-hidden="true">
          <path
            d="M2.5 18.5 8.8 7.2l4.4 6.6 2.8-3.8 5.5 8.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'signal':
      return (
        <svg viewBox="0 0 24 24" className="sb-dock__svg" aria-hidden="true">
          <circle cx="12" cy="11" r="1.6" fill="currentColor" />
          <path
            d="M12 12.6V19.5M8.8 19.5h6.4M8.6 7.8a4.8 4.8 0 0 0 0 6.4M15.4 7.8a4.8 4.8 0 0 1 0 6.4M5.8 5a8.6 8.6 0 0 0 0 12M18.2 5a8.6 8.6 0 0 1 0 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'planet':
    default:
      return (
        <svg viewBox="0 0 24 24" className="sb-dock__svg" aria-hidden="true">
          <circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.45" />
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="3.4"
            transform="rotate(-24 12 12)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      );
  }
}

/**
 * UNLOCKED CINEMATIC 3D DIGITAL STORYBOOK
 * Replaces the post-unlock Universe view while preserving 100% of the node-connection game,
 * unlock sequence, top controls contract, project routes, and verified data.
 */
export function DigitalUniverseView({
  audioOn,
  onToggleAudio,
  onReplayUnlock,
  onExitUniverse,
  onOpenCase,
}) {
  const stageRef = useRef(null);
  const markerElsRef = useRef({});
  const pageRegionRef = useRef(null);
  const turnTweenRef = useRef(null);

  // Initial spread MUST showcase Chapter 03 — THE JOURNEY matching Reference 01 master
  const [currentChapterId, setCurrentChapterId] = useState('journey');
  const [targetChapterId, setTargetChapterId] = useState('archive');
  const [turnPhase, setTurnPhase] = useState('idle'); // 'idle' | 'dragging' | 'turning'
  const [cornerHover, setCornerHover] = useState(false);
  const [isPortraitMode, setIsPortraitMode] = useState(
    () => typeof window !== 'undefined' && (window.innerWidth < 768 || window.innerWidth / Math.max(1, window.innerHeight) < 0.98)
  );
  const [portraitFocusSide, setPortraitFocusSide] = useState('right');

  const turnStateRef = useRef({
    active: false,
    progress: 0,
    direction: 'forward',
  });

  const orbitOffsetRef = useRef({
    azimuth: 0,
    targetAzimuth: 0,
    polar: 0,
    targetPolar: 0,
  });

  const dragSessionRef = useRef({
    mode: 'none', // 'none' | 'orbit' | 'turn'
    direction: 'forward',
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });

  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [mobileProjectIdx, setMobileProjectIdx] = useState(0);
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [activeFrontierIdx, setActiveFrontierIdx] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const curChapterRef = useRef('journey');
  const turnPhaseRef = useRef('idle');
  const isPortraitRef = useRef(isPortraitMode);
  const portraitFocusSideRef = useRef(portraitFocusSide);

  useEffect(() => {
    isPortraitRef.current = isPortraitMode;
  }, [isPortraitMode]);

  useEffect(() => {
    portraitFocusSideRef.current = portraitFocusSide;
  }, [portraitFocusSide]);

  useEffect(() => {
    curChapterRef.current = currentChapterId;
    setPortraitFocusSide('right');
    setActiveMarkerId(null);
    setSelectedProject(null);
    setSelectedSpecimen(null);
  }, [currentChapterId]);

  const handleCopyEmail = useCallback(() => {
    try {
      navigator.clipboard?.writeText(SIGNAL_PROFILE.links.email);
    } catch {}
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }, []);

  useEffect(() => {
    turnPhaseRef.current = turnPhase;
  }, [turnPhase]);

  // Ambient sound hook preserved verbatim
  useEffect(() => {
    if (audioOn) {
      universeAudio.startAmbient();
    } else {
      universeAudio.stopAmbient();
    }
    return () => universeAudio.stopAmbient();
  }, [audioOn]);

  const finishTurnTo = useCallback((nextId) => {
    turnStateRef.current.active = false;
    turnStateRef.current.progress = 0;
    setCurrentChapterId(nextId);
    setTurnPhase('idle');
  }, []);

  /**
   * Executes a full animated 3D curved page turn from `currentChapterId` -> `nextChapterId`.
   */
  const animatePageTurnTo = useCallback(
    (nextChapterId, explicitDirection = null) => {
      const curId = curChapterRef.current;
      if (nextChapterId === curId || turnPhaseRef.current === 'turning') return;

      const curIdx = BOOK_PAGE_SEQUENCE.indexOf(curId);
      const tgtIdx = BOOK_PAGE_SEQUENCE.indexOf(nextChapterId);
      const direction =
        explicitDirection ||
        (tgtIdx > curIdx ? 'forward' : 'backward');

      if (turnTweenRef.current) turnTweenRef.current.kill();

      const dockIdx = Math.max(0, CHAPTER_DOCK_ORDER.findIndex((c) => c.id === nextChapterId));
      universeAudio.playWorldSelect(dockIdx);

      if (prefersReducedMotion()) {
        finishTurnTo(nextChapterId);
        return;
      }

      setTargetChapterId(nextChapterId);
      setTurnPhase('turning');
      turnStateRef.current = {
        active: true,
        progress: turnPhaseRef.current === 'dragging' ? turnStateRef.current.progress : 0.01,
        direction,
      };

      const remaining = 1 - turnStateRef.current.progress;
      turnTweenRef.current = gsap.to(turnStateRef.current, {
        progress: 1,
        duration: Math.max(0.42, 0.92 * remaining),
        ease: 'power2.inOut',
        onComplete: () => finishTurnTo(nextChapterId),
      });
    },
    [finishTurnTo]
  );

  const springCancelTurn = useCallback(() => {
    if (turnTweenRef.current) turnTweenRef.current.kill();
    setTurnPhase('turning');
    turnTweenRef.current = gsap.to(turnStateRef.current, {
      progress: 0,
      duration: 0.36,
      ease: 'power3.out',
      onComplete: () => {
        turnStateRef.current.active = false;
        turnStateRef.current.progress = 0;
        setTurnPhase('idle');
      },
    });
  }, []);

  const turnNext = useCallback(() => {
    const idx = BOOK_PAGE_SEQUENCE.indexOf(curChapterRef.current);
    const nextIdx = (idx + 1) % BOOK_PAGE_SEQUENCE.length;
    animatePageTurnTo(BOOK_PAGE_SEQUENCE[nextIdx], 'forward');
  }, [animatePageTurnTo]);

  const turnPrev = useCallback(() => {
    const idx = BOOK_PAGE_SEQUENCE.indexOf(curChapterRef.current);
    const prevIdx = (idx - 1 + BOOK_PAGE_SEQUENCE.length) % BOOK_PAGE_SEQUENCE.length;
    animatePageTurnTo(BOOK_PAGE_SEQUENCE[prevIdx], 'backward');
  }, [animatePageTurnTo]);

  // Keyboard navigation (`ArrowRight`, `ArrowLeft`, `1..5`)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        turnNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        turnPrev();
      } else if (e.key >= '1' && e.key <= '5') {
        const chosen = CHAPTER_DOCK_ORDER[Number(e.key) - 1];
        if (chosen) animatePageTurnTo(chosen.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [turnNext, turnPrev, animatePageTurnTo]);

  // Interactive Corner / Touch Swipe Drag Initiation
  const beginCornerDrag = useCallback((clientEvent, dir = 'forward') => {
    if (turnPhaseRef.current === 'turning') return;
    if (turnTweenRef.current) turnTweenRef.current.kill();

    const curIdx = BOOK_PAGE_SEQUENCE.indexOf(curChapterRef.current);
    const nextIdx =
      dir === 'forward'
        ? (curIdx + 1) % BOOK_PAGE_SEQUENCE.length
        : (curIdx - 1 + BOOK_PAGE_SEQUENCE.length) % BOOK_PAGE_SEQUENCE.length;
    const nextId = BOOK_PAGE_SEQUENCE[nextIdx];

    setTargetChapterId(nextId);
    setTurnPhase('dragging');
    turnStateRef.current = {
      active: true,
      progress: 0.06,
      direction: dir,
    };

    const cx = clientEvent.touches ? clientEvent.touches[0].clientX : clientEvent.clientX;
    const cy = clientEvent.touches ? clientEvent.touches[0].clientY : clientEvent.clientY;
    dragSessionRef.current = {
      mode: 'turn',
      direction: dir,
      nextId,
      startX: cx,
      startY: cy,
      lastX: cx,
      lastY: cy,
    };
  }, []);

  const handleStagePointerDown = (e) => {
    if (e.target.closest('button, a, .sb-detail-drawer, .sb-folio-inspect, .sb-mobile-reader')) return;
    if (turnPhaseRef.current === 'turning') return;

    dragSessionRef.current = {
      mode: 'orbit',
      direction: 'forward',
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    };
  };

  useEffect(() => {
    const onPointerMove = (e) => {
      const ds = dragSessionRef.current;
      if (ds.mode === 'none') return;

      const dxTotal = e.clientX - ds.startX;

      if (ds.mode === 'turn') {
        const delta = ds.direction === 'forward' ? -dxTotal : dxTotal;
        const dragSpan = window.innerWidth < 768 ? Math.min(240, window.innerWidth * 0.62) : 320;
        const p = Math.max(0.02, Math.min(0.96, 0.06 + delta / dragSpan));
        turnStateRef.current.progress = p;
        return;
      }

      if (ds.mode === 'orbit') {
        const dyTotal = e.clientY - ds.startY;
        const dx = e.clientX - ds.lastX;
        const dy = e.clientY - ds.lastY;
        ds.lastX = e.clientX;
        ds.lastY = e.clientY;

        if (e.pointerType === 'touch') {
          // If the user is intentionally scrolling vertically on mobile, disengage book drag cleanly
          if (Math.abs(dyTotal) > 16 && Math.abs(dyTotal) > Math.abs(dxTotal) * 1.1) {
            dragSessionRef.current.mode = 'none';
            return;
          }
          // Intentional horizontal swipe triggers real 3D curled page turn
          if (Math.abs(dxTotal) > 20 && Math.abs(dxTotal) > Math.abs(dyTotal) * 1.18) {
            const dir = dxTotal < 0 ? 'forward' : 'backward';
            beginCornerDrag(e, dir);
            return;
          }
        }

        const orbit = orbitOffsetRef.current;
        orbit.targetAzimuth = Math.max(-0.14, Math.min(0.14, orbit.targetAzimuth - dx * 0.0016));
        orbit.targetPolar = Math.max(-0.07, Math.min(0.08, orbit.targetPolar + dy * 0.0012));
      }
    };

    const onPointerUp = () => {
      const ds = dragSessionRef.current;
      if (ds.mode === 'turn') {
        const p = turnStateRef.current.progress;
        if (p >= 0.24 && ds.nextId) {
          if (turnTweenRef.current) turnTweenRef.current.kill();
          setTurnPhase('turning');
          turnTweenRef.current = gsap.to(turnStateRef.current, {
            progress: 1,
            duration: Math.max(0.32, (1 - p) * 0.8),
            ease: 'power2.out',
            onComplete: () => finishTurnTo(ds.nextId),
          });
        } else {
          springCancelTurn();
        }
      }
      dragSessionRef.current.mode = 'none';
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [beginCornerDrag, finishTurnTo, springCancelTurn]);

  // Deterministic QA / Visual Verification Hook
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__asrarStorybook = {
        getState: () => ({
          currentChapterId: curChapterRef.current,
          turnPhase: turnPhaseRef.current,
          progress: turnStateRef.current.progress,
          isPortraitMode: isPortraitRef.current,
          portraitFocusSide: portraitFocusSideRef.current,
        }),
        goToChapter: (id, immediate = false) => {
          if (immediate) {
            if (turnTweenRef.current) turnTweenRef.current.kill();
            turnStateRef.current = { active: false, progress: 0, direction: 'forward' };
            setCurrentChapterId(id);
            setTurnPhase('idle');
          } else {
            animatePageTurnTo(id);
          }
        },
        setPortraitSide: setPortraitFocusSide,
        turnNext,
        turnPrev,
        setDragPreview: (progress, direction = 'forward', targetId = 'archive') => {
          if (turnTweenRef.current) turnTweenRef.current.kill();
          setTargetChapterId(targetId);
          setTurnPhase('dragging');
          turnStateRef.current = {
            active: progress > 0.002,
            progress,
            direction,
          };
        },
      };
    }
    return () => {
      if (turnTweenRef.current) turnTweenRef.current.kill();
      if (typeof window !== 'undefined') delete window.__asrarStorybook;
    };
  }, [animatePageTurnTo, turnNext, turnPrev]);

  const isSettled = turnPhase === 'idle';
  const isRightPageFocused = !isPortraitMode || portraitFocusSide === 'right';

  const sharedChapterProps = {
    currentChapterId,
    isSettled,
    isRightPageFocused,
    markerElsRef,
    pageRegionRef,
    activeMarkerId,
    setActiveMarkerId,
    selectedProject,
    setSelectedProject,
    mobileProjectIdx,
    setMobileProjectIdx,
    selectedSpecimen,
    setSelectedSpecimen,
    activeFrontierIdx,
    setActiveFrontierIdx,
    copiedEmail,
    onCopyEmail: handleCopyEmail,
    onOpenCase,
    onExitUniverse,
  };

  return (
    <div
      ref={stageRef}
      className={`sb-stage ${isPortraitMode ? 'is-portrait-mode' : ''}`}
      role="region"
      aria-label="Asrar's Unlocked 3D Digital Storybook"
      onPointerDown={handleStagePointerDown}
    >
      {/* 1. REAL 3D WEBGL BOOK STAGE + PROJECTED OVERLAY LAYER */}
      <div className="sb-book-viewport">
        <ErrorBoundary
          fallback={
            <div className="sb-fallback mono">
              DIGITAL UNIVERSE STORYBOOK · ENABLE WEBGL FOR FULL 3D PAGE TURNS
            </div>
          }
        >
          <StorybookScene3D
            turnStateRef={turnStateRef}
            currentChapterId={currentChapterId}
            targetChapterId={targetChapterId}
            portraitFocusSide={portraitFocusSide}
            cornerHover={cornerHover}
            orbitOffsetRef={orbitOffsetRef}
            markerElsRef={markerElsRef}
            pageRegionRef={pageRegionRef}
            onStartCornerDrag={beginCornerDrag}
            onPortraitModeChange={setIsPortraitMode}
          />
        </ErrorBoundary>

        {/* Subtle corner curl hover + grab hotzone on lower-right page corner */}
        <div
          className="sb-corner-hotzone"
          role="button"
          tabIndex={-1}
          aria-label="Drag page corner to turn forward"
          onMouseEnter={() => setCornerHover(true)}
          onMouseLeave={() => setCornerHover(false)}
          onPointerDown={(e) => {
            e.stopPropagation();
            beginCornerDrag(e.nativeEvent, 'forward');
          }}
        />

        {/* Projected interactive hotspots / buttons anchored to 3D book coordinates */}
        <StorybookPageOverlays {...sharedChapterProps} />
      </div>

      {/* 2. TOP HUD HEADER & TOP-RIGHT CONTROLS (MATCHING REFERENCE 01) */}
      <header className="sb-header">
        <div className="sb-header__left">
          <div className="sb-kicker mono">
            <span className="sb-kicker__dot" aria-hidden="true" />
            <span>DIMENSION UNLOCKED · ASRAR // CORE</span>
          </div>
          <h3 className="sb-title">
            <span>Welcome to my</span>
            <em>Digital Universe</em>
          </h3>
          <p className="sb-subtitle mono">
            DRAG TO ORBIT IN 3D · SELECT ANY OF THE 5 WORLDS TO EXPLORE
          </p>
        </div>

        <div className="sb-actions mono">
          <button
            type="button"
            className={`sb-ctrl-btn ${audioOn ? 'is-active' : ''}`}
            onClick={onToggleAudio}
          >
            <svg viewBox="0 0 20 20" className="sb-ctrl-btn__ico" aria-hidden="true">
              <path
                d="M3 10h2M7 6v8M11 4v12M15 7v6M18 10h-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>AUDIO: {audioOn ? 'ON' : 'OFF'}</span>
          </button>

          <button type="button" className="sb-ctrl-btn" onClick={onReplayUnlock}>
            <svg viewBox="0 0 20 20" className="sb-ctrl-btn__ico" aria-hidden="true">
              <path
                d="M4.5 10a5.5 5.5 0 1 0 1.4-3.7L4 8m0-4v4h4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>REPLAY PORTAL</span>
          </button>

          <button type="button" className="sb-ctrl-btn" onClick={onExitUniverse}>
            <svg viewBox="0 0 20 20" className="sb-ctrl-btn__ico" aria-hidden="true">
              <path
                d="M8.5 4H5a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 5 16h3.5M12 6.5 16 10l-4 3.5M7.5 10H16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>EXIT TO PORTFOLIO</span>
          </button>
        </div>
      </header>

      {/* 3. PREVIOUS / NEXT CIRCULAR BOOK NAVIGATION ARROWS & TURN PAGE CUE (DESKTOP / LANDSCAPE) */}
      {!isPortraitMode && (
        <>
          <button
            type="button"
            className="sb-arrow sb-arrow--prev"
            onClick={turnPrev}
            aria-label="Turn to previous chapter"
            disabled={turnPhase === 'turning'}
          >
            ←
          </button>

          <div className="sb-right-nav-rail">
            <button
              type="button"
              className="sb-arrow sb-arrow--next"
              onClick={turnNext}
              aria-label="Turn to next chapter"
              disabled={turnPhase === 'turning'}
            >
              →
            </button>

            <button
              type="button"
              className="sb-turn-hint mono"
              onClick={turnNext}
              aria-label="Turn page"
            >
              <svg viewBox="0 0 32 32" className="sb-turn-hint__svg" aria-hidden="true">
                <path
                  d="M9 11c2-4 10-4 13 0M20 7l2.5 4.2-4.4-.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.5 14.5v8.5m0 0c-1.8 0-3-1.2-3-2.6v-2c0-.9 1.4-.9 1.4 0v1.2m1.6-5.1c0-1.1 1.6-1.1 1.6 0v3.6m0-2.5c0-1.1 1.6-1.1 1.6 0v3.3m0-2.2c0-1.1 1.5-1.1 1.5 0v3.6c0 2.5-1.8 4.4-4.7 4.4s-4.5-1.7-4.5-3.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>TURN PAGE</span>
            </button>
          </div>
        </>
      )}

      {/* 3B. PORTRAIT SINGLE-PAGE FOCUS CONTROLS BAR (MOBILE & PORTRAIT TABLET) */}
      {isPortraitMode && (
        <div className="sb-portrait-controls mono" role="toolbar" aria-label="Portrait Storybook Page Navigation">
          <button
            type="button"
            className="sb-portrait-ctrl-btn"
            onClick={turnPrev}
            aria-label="Turn to previous chapter"
            disabled={turnPhase === 'turning'}
          >
            ← PREV
          </button>

          <button
            type="button"
            className={`sb-portrait-ctrl-btn sb-portrait-ctrl-btn--toggle ${portraitFocusSide === 'left' ? 'is-left' : ''}`}
            onClick={() => setPortraitFocusSide((s) => (s === 'right' ? 'left' : 'right'))}
            aria-pressed={portraitFocusSide === 'left'}
          >
            {portraitFocusSide === 'right' ? 'VIEW LEFT PAGE' : 'ACTIVE PAGE →'}
          </button>

          <button
            type="button"
            className="sb-portrait-ctrl-btn"
            onClick={turnNext}
            aria-label="Turn to next chapter"
            disabled={turnPhase === 'turning'}
          >
            NEXT →
          </button>
        </div>
      )}

      {/* 4. RESPONSIVE MOBILE READER CARDS BELOW BOOK (<= 767px) */}
      <StorybookMobileReader {...sharedChapterProps} />

      {/* 5. BOTTOM FIVE-WORLD NAVIGATION BAR (01..05, REFERENCE 01 MATCH) */}
      <nav className="sb-dock" aria-label="Five Storybook Chapters">
        {CHAPTER_DOCK_ORDER.map((chap) => {
          const isActive = currentChapterId === chap.id;
          return (
            <button
              key={chap.id}
              type="button"
              className={`sb-dock__item ${isActive ? 'is-active' : ''}`}
              onClick={() => animatePageTurnTo(chap.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="sb-dock__icon">
                <DockIcon type={chap.icon} />
              </span>
              <span className="sb-dock__meta">
                <span className="sb-dock__num mono">{chap.num}</span>
                <span className="sb-dock__name">{chap.name}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
