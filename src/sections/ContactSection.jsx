import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animations/motion';
import { scenes } from '../utils/store';
import { PROFILE } from '../data/profile';
import { scrollToTarget } from '../hooks/useSmoothScroll';
import { SplitHeadline } from '../components/ui/SplitHeadline';
import { Magnetic } from '../components/ui/Magnetic';
import './sections.css';

/**
 * SCENE 12 — CONTACT FINALE
 * Re-engages the Hero 3D computational rig in background orbit to close the visual loop,
 * pairs oversized typography with verified links, validated contact inquiry, and split footer.
 */
export function ContactSection() {
  const sectionRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      scenes.contact.progress = 1;
      scenes.contact.visible = true;
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scenes.contact.progress = self.progress;
          scenes.contact.visible = self.isActive || self.progress > 0.02;
        },
        onRefresh: (self) => {
          scenes.contact.progress = self.progress;
          scenes.contact.visible = self.isActive || self.progress > 0.02;
        },
        onLeaveBack: () => {
          scenes.contact.progress = 0;
          scenes.contact.visible = false;
        },
      });
    }, sectionRef);

    return () => {
      scenes.contact.progress = 0;
      scenes.contact.visible = false;
      ctx.revert();
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.links.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      window.location.href = `mailto:${PROFILE.links.email}`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.includes('@') || message.trim().length < 5) {
      setStatus('Please enter your name, a valid email, and a short message.');
      return;
    }
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name.trim()}`);
    const body = encodeURIComponent(`From: ${name.trim()} (${email.trim()})\n\n${message.trim()}`);
    setStatus(`Brief prepared for ${PROFILE.links.email} — opening your mail client.`);
    window.location.href = `mailto:${PROFILE.links.email}?subject=${subject}&body=${body}`;
  };

  return (
    <footer
      id="scene-contact"
      ref={sectionRef}
      className="contact section"
      aria-label="Scene 12: Contact Finale"
    >
      <div className="contact__top">
        <div>
          <div className="mono section-index" style={{ marginBottom: '1rem', color: 'var(--signal)' }}>
            <span>CLOSING LOOP</span>
          </div>
          <h2 className="display contact__display">
            <SplitHeadline lines={['HAVE AN', 'IMPOSSIBLE', 'IDEA?']} as="span" />
          </h2>
          <div className="display" style={{ fontSize: 'clamp(2.4rem, 7vw, 7rem)', marginTop: '1rem', color: 'var(--signal)' }}>
            LET&apos;S BUILD IT.
          </div>
        </div>

        <form className="contact__form-wrap" onSubmit={handleSubmit} noValidate>
          <div className="mono muted">DIRECT DISPATCH → {PROFILE.links.email.toUpperCase()}</div>
          <label className="sr-only" htmlFor="c-name">Your name</label>
          <input
            id="c-name"
            className="contact__input"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="sr-only" htmlFor="c-email">Your email</label>
          <input
            id="c-email"
            className="contact__input"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="sr-only" htmlFor="c-msg">Project or role details</label>
          <textarea
            id="c-msg"
            className="contact__input"
            rows={3}
            placeholder="What are we building?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem' }}>
            <Magnetic>
              <button type="submit" className="btn" data-cursor="SEND">
                <span>SEND MESSAGE</span>
                <span className="btn__arrow" aria-hidden="true">↗</span>
              </button>
            </Magnetic>
            <button type="button" className="mono ulink" onClick={copyEmail}>
              {copied ? 'EMAIL COPIED ✓' : 'COPY EMAIL'}
            </button>
          </div>
          {status && (
            <div className="mono" style={{ color: 'var(--cobalt)' }} role="status">
              {status}
            </div>
          )}
        </form>
      </div>

      <div className="contact__links">
        <a
          href={PROFILE.links.github}
          target="_blank"
          rel="noreferrer"
          className="contact__link-tile"
          data-cursor="OPEN"
        >
          <span className="mono muted">SOURCE REPOSITORIES</span>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 800 }}>
            GITHUB · PRINCE-CODER679 ↗
          </span>
        </a>
        <a
          href={PROFILE.links.linkedin}
          target="_blank"
          rel="noreferrer"
          className="contact__link-tile"
          data-cursor="OPEN"
        >
          <span className="mono muted">PROFESSIONAL NETWORK</span>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 800 }}>
            LINKEDIN · ASRAR MULLA ↗
          </span>
        </a>
        <a href={`mailto:${PROFILE.links.email}`} className="contact__link-tile" data-cursor="MAIL">
          <span className="mono muted">DIRECT DISPATCH</span>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 800 }}>
            {PROFILE.links.email.toUpperCase()} ↗
          </span>
        </a>
      </div>

      <div className="footer-split">
        <div className="footer-split__left">
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', fontWeight: 800 }}>
            ASRAR MULLA
          </div>
          <div className="mono" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem' }}>
            <span>{PROFILE.location}</span>
            <span>·</span>
            <span>{PROFILE.club.role}, DSAII CLUB</span>
          </div>
        </div>

        <div className="footer-split__right">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div className="mono">LOOP COMPLETE</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.4rem, 2.4vw, 2.1rem)', fontWeight: 800 }}>
                RETURN TO ORIGIN
              </div>
            </div>
            <Magnetic>
              <button
                type="button"
                className="footer-top-btn"
                onClick={() => scrollToTarget(0)}
                aria-label="Back to top"
                data-cursor="TOP"
              >
                ↑
              </button>
            </Magnetic>
          </div>
          <div className="mono">© 2026 ASRAR MULLA · BUILT WITH REACT, THREE.JS &amp; GSAP</div>
        </div>
      </div>
    </footer>
  );
}

