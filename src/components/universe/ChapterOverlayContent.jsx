import { useEffect, useState } from 'react';
import {
  ARCHIVE_PROJECTS,
  CHAPTER_BY_ID,
  JOURNEY_MARKERS,
  LAB_SYSTEMS,
  SIGNAL_PROFILE,
} from './bookChaptersData';
import { scrollToTarget } from '../../hooks/useSmoothScroll';

/**
 * Interactive real DOM chapter overlays synchronized cleanly onto settled 3D storybook spreads.
 * Fades out automatically during 3D page-turning transitions and fades in smoothly once settled.
 */
export function ChapterOverlayContent({
  currentChapterId,
  isSettled,
  markerElsRef,
  pageRegionRef,
  onOpenCase,
  onExitUniverse,
}) {
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSpecimen, setSelectedSpecimen] = useState(null);
  const [activeFrontierIdx, setActiveFrontierIdx] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    setActiveMarkerId(null);
    setSelectedProject(null);
    setSelectedSpecimen(null);
  }, [currentChapterId]);

  const chapter = CHAPTER_BY_ID[currentChapterId] || CHAPTER_BY_ID.journey;
  const activeMarker = JOURNEY_MARKERS.find((m) => m.id === activeMarkerId) || null;

  const handleCopyEmail = () => {
    try {
      navigator.clipboard?.writeText(SIGNAL_PROFILE.links.email);
    } catch {}
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <>
      {/* =====================================================================
          DESKTOP 3D-PROJECTED INTERACTIVE PAGE LAYER (`is-settled` fades cleanly)
          ===================================================================== */}
      <div
        className={`sb-overlay-layer ${isSettled ? 'is-settled' : 'is-turning'}`}
        aria-hidden={!isSettled}
      >
        {/* CHAPTER 03 — THE JOURNEY: 5 projected glowing pathway milestone pins */}
        {currentChapterId === 'journey' && (
          <div className="sb-journey-pins">
            {JOURNEY_MARKERS.map((m) => {
              const isSelected = activeMarkerId === m.id;
              return (
                <div
                  key={m.id}
                  ref={(el) => {
                    markerElsRef.current[m.id] = el;
                  }}
                  className={`sb-marker-anchor ${isSelected ? 'is-active' : ''}`}
                >
                  <button
                    type="button"
                    className="sb-marker-pill mono"
                    onClick={() => setActiveMarkerId((prev) => (prev === m.id ? null : m.id))}
                    aria-expanded={isSelected}
                  >
                    <span>{m.label}</span>
                  </button>
                  <span className="sb-marker-stem" aria-hidden="true" />
                  <span className="sb-marker-dot" aria-hidden="true" />
                </div>
              );
            })}

            {activeMarker && (
              <div className="sb-detail-drawer" role="dialog" aria-label={activeMarker.title}>
                <div className="sb-detail-drawer__top">
                  <span className="mono sb-detail-drawer__kicker">{activeMarker.period}</span>
                  <button
                    type="button"
                    className="mono sb-detail-drawer__close"
                    onClick={() => setActiveMarkerId(null)}
                  >
                    CLOSE ×
                  </button>
                </div>
                <h4 className="sb-detail-drawer__title">{activeMarker.title}</h4>
                <div className="mono sb-detail-drawer__org">{activeMarker.org}</div>
                <p className="sb-detail-drawer__text">{activeMarker.detail}</p>
                <div className="sb-chip-row">
                  {activeMarker.tags.map((tag) => (
                    <span key={tag} className="sb-chip mono">
                      {tag}
                    </span>
                  ))}
                </div>
                {(activeMarker.slug || activeMarker.repoUrl) && (
                  <div className="sb-detail-drawer__actions mono">
                    {activeMarker.slug && (
                      <button
                        type="button"
                        className="sb-action-btn is-gold"
                        onClick={() => onOpenCase?.(activeMarker.slug)}
                      >
                        OPEN CASE STUDY →
                      </button>
                    )}
                    {activeMarker.repoUrl && (
                      <a
                        href={activeMarker.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="sb-action-btn"
                      >
                        GITHUB REPO ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RIGHT PAGE REGION CONTAINER FOR CHAPTERS 01, 02, 04, 05 */}
        {currentChapterId !== 'journey' && (
          <div ref={pageRegionRef} className="sb-right-page-slot">
            {/* CHAPTER 01 — THE ARCHIVE */}
            {currentChapterId === 'archive' && !selectedProject && (
              <div className="sb-folio-grid" aria-label="Deployed systems in The Archive">
                {ARCHIVE_PROJECTS.map((proj) => (
                  <button
                    key={proj.slug}
                    type="button"
                    className="sb-folio-card"
                    onClick={() => setSelectedProject(proj)}
                  >
                    <div className="sb-folio-card__thumb">
                      <img src={proj.screens[0]?.src} alt={proj.title} loading="lazy" />
                      <span className="sb-folio-card__idx mono">{proj.index}</span>
                    </div>
                    <div className="sb-folio-card__meta">
                      <strong className="sb-folio-card__title">{proj.title}</strong>
                      <span className="mono sb-folio-card__cat">{proj.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentChapterId === 'archive' && selectedProject && (
              <div className="sb-folio-inspect">
                <div className="sb-folio-inspect__head">
                  <div>
                    <div className="mono sb-folio-inspect__kicker">
                      ARCHIVE {selectedProject.index} · {selectedProject.category} · {selectedProject.year}
                    </div>
                    <h4 className="sb-folio-inspect__title">{selectedProject.title}</h4>
                  </div>
                  <button
                    type="button"
                    className="mono sb-action-btn"
                    onClick={() => setSelectedProject(null)}
                  >
                    ← ALL RECORDS
                  </button>
                </div>
                <p className="sb-folio-inspect__summary">{selectedProject.summary}</p>
                <p className="sb-folio-inspect__impl">{selectedProject.implementation}</p>
                <div className="sb-chip-row">
                  {selectedProject.stack.slice(0, 7).map((tech) => (
                    <span key={tech} className="sb-chip mono">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="sb-detail-drawer__actions mono">
                  <button
                    type="button"
                    className="sb-action-btn is-gold"
                    onClick={() => onOpenCase?.(selectedProject.slug)}
                  >
                    FULL CASE STUDY →
                  </button>
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="sb-action-btn"
                  >
                    LIVE SITE ↗
                  </a>
                  <a
                    href={selectedProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="sb-action-btn"
                  >
                    GITHUB ↗
                  </a>
                </div>
              </div>
            )}

            {/* CHAPTER 02 — THE LAB */}
            {currentChapterId === 'lab' && !selectedSpecimen && (
              <div className="sb-lab-grid" aria-label="Scientific Specimens in The Lab">
                {LAB_SYSTEMS.map((sys) => (
                  <button
                    key={sys.id}
                    type="button"
                    className="sb-lab-plate"
                    onClick={() => setSelectedSpecimen(sys)}
                  >
                    <span className="mono sb-lab-plate__code">{sys.code}</span>
                    <strong className="sb-lab-plate__title">{sys.title}</strong>
                    <span className="mono sb-lab-plate__sub">{sys.subtitle}</span>
                    <span className="mono sb-lab-plate__cta">INSPECT SPECIMEN →</span>
                  </button>
                ))}
              </div>
            )}

            {currentChapterId === 'lab' && selectedSpecimen && (
              <div className="sb-folio-inspect">
                <div className="sb-folio-inspect__head">
                  <div>
                    <div className="mono sb-folio-inspect__kicker">{selectedSpecimen.code}</div>
                    <h4 className="sb-folio-inspect__title">{selectedSpecimen.title}</h4>
                  </div>
                  <button
                    type="button"
                    className="mono sb-action-btn"
                    onClick={() => setSelectedSpecimen(null)}
                  >
                    ← SPECIMENS
                  </button>
                </div>
                <p className="sb-folio-inspect__summary">{selectedSpecimen.summary}</p>
                <div className="sb-chip-row">
                  {selectedSpecimen.nodes?.map((n) => (
                    <span key={n.id} className="sb-chip mono">
                      {n.name} · {n.note}
                    </span>
                  ))}
                </div>
                {selectedSpecimen.modules && (
                  <div className="sb-lab-dsa-list">
                    {selectedSpecimen.modules.map((mod) => (
                      <div key={mod.id} className="sb-lab-dsa-item">
                        <strong className="mono">{mod.name}</strong>
                        <span className="mono">{mod.complexity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CHAPTER 04 — THE SIGNAL */}
            {currentChapterId === 'signal' && (
              <div className="sb-signal-stack" aria-label="Verified Contact Channels">
                <a
                  href={SIGNAL_PROFILE.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="sb-signal-plate"
                >
                  <div>
                    <div className="mono sb-signal-plate__idx">01 // GITHUB REPOSITORIES</div>
                    <strong className="sb-signal-plate__val">@{SIGNAL_PROFILE.handle}</strong>
                  </div>
                  <span className="mono sb-signal-plate__cta">OPEN PROFILE ↗</span>
                </a>

                <a
                  href={SIGNAL_PROFILE.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="sb-signal-plate"
                >
                  <div>
                    <div className="mono sb-signal-plate__idx">02 // LINKEDIN NETWORK</div>
                    <strong className="sb-signal-plate__val">ASRAR MULLA</strong>
                  </div>
                  <span className="mono sb-signal-plate__cta">CONNECT ↗</span>
                </a>

                <div className="sb-signal-plate sb-signal-plate--email">
                  <div>
                    <div className="mono sb-signal-plate__idx">03 // DIRECT TRANSMISSION</div>
                    <strong className="sb-signal-plate__val">{SIGNAL_PROFILE.links.email}</strong>
                  </div>
                  <div className="sb-signal-plate__btns mono">
                    <a href={`mailto:${SIGNAL_PROFILE.links.email}`} className="sb-action-btn is-gold">
                      EMAIL ↗
                    </a>
                    <button type="button" className="sb-action-btn" onClick={handleCopyEmail}>
                      {copiedEmail ? 'COPIED ✓' : 'COPY'}
                    </button>
                    <button
                      type="button"
                      className="sb-action-btn"
                      onClick={() => {
                        onExitUniverse?.();
                        setTimeout(() => scrollToTarget('#scene-contact'), 100);
                      }}
                    >
                      FORM →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 05 — THE NEXT FRONTIER */}
            {currentChapterId === 'frontier' && (
              <div className="sb-lab-grid" aria-label="Future Exploration Vectors">
                {SIGNAL_PROFILE.focusAreas.map((area, idx) => {
                  const isActive = activeFrontierIdx === idx;
                  return (
                    <button
                      key={area.index}
                      type="button"
                      className={`sb-lab-plate ${isActive ? 'is-active' : ''}`}
                      onClick={() => setActiveFrontierIdx(idx)}
                    >
                      <span className="mono sb-lab-plate__code">VECTOR {area.index}</span>
                      <strong className="sb-lab-plate__title">{area.title}</strong>
                      <p className="sb-frontier-note">{area.note}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          RESPONSIVE MOBILE CHAPTER READER PANEL (`<= 767px`)
          ===================================================================== */}
      <div className="sb-mobile-reader" aria-label={`${chapter.name} Interactive Reader`}>
        <div className="sb-mobile-reader__head">
          <span className="mono sb-mobile-reader__idx">
            CHAPTER {chapter.num} · {chapter.subtitle}
          </span>
          <h4 className="sb-mobile-reader__title">{chapter.name}</h4>
        </div>

        {currentChapterId === 'journey' && (
          <div className="sb-mobile-list">
            {JOURNEY_MARKERS.map((m) => (
              <div key={m.id} className="sb-mobile-item">
                <div className="mono sb-mobile-item__tag">{m.label}</div>
                <strong>{m.title}</strong>
                <p>{m.detail}</p>
              </div>
            ))}
          </div>
        )}

        {currentChapterId === 'archive' && (
          <div className="sb-mobile-list">
            {ARCHIVE_PROJECTS.map((proj) => (
              <div key={proj.slug} className="sb-mobile-item">
                <div className="mono sb-mobile-item__tag">
                  {proj.index} · {proj.category}
                </div>
                <strong>{proj.title}</strong>
                <p>{proj.summary}</p>
                <div className="sb-detail-drawer__actions mono">
                  <button
                    type="button"
                    className="sb-action-btn is-gold"
                    onClick={() => onOpenCase?.(proj.slug)}
                  >
                    CASE STUDY →
                  </button>
                  <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="sb-action-btn">
                    LIVE ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentChapterId === 'lab' && (
          <div className="sb-mobile-list">
            {LAB_SYSTEMS.map((sys) => (
              <div key={sys.id} className="sb-mobile-item">
                <div className="mono sb-mobile-item__tag">{sys.code}</div>
                <strong>{sys.title}</strong>
                <p>{sys.summary}</p>
              </div>
            ))}
          </div>
        )}

        {currentChapterId === 'signal' && (
          <div className="sb-mobile-list">
            <a href={SIGNAL_PROFILE.links.github} target="_blank" rel="noreferrer" className="sb-mobile-item">
              <div className="mono sb-mobile-item__tag">GITHUB</div>
              <strong>@{SIGNAL_PROFILE.handle} ↗</strong>
            </a>
            <a href={SIGNAL_PROFILE.links.linkedin} target="_blank" rel="noreferrer" className="sb-mobile-item">
              <div className="mono sb-mobile-item__tag">LINKEDIN</div>
              <strong>ASRAR MULLA ↗</strong>
            </a>
            <a href={`mailto:${SIGNAL_PROFILE.links.email}`} className="sb-mobile-item">
              <div className="mono sb-mobile-item__tag">EMAIL</div>
              <strong>{SIGNAL_PROFILE.links.email} ↗</strong>
            </a>
          </div>
        )}

        {currentChapterId === 'frontier' && (
          <div className="sb-mobile-list">
            {SIGNAL_PROFILE.focusAreas.map((area) => (
              <div key={area.index} className="sb-mobile-item">
                <div className="mono sb-mobile-item__tag">VECTOR {area.index}</div>
                <strong>{area.title}</strong>
                <p>{area.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
