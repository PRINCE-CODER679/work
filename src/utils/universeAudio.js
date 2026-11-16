/**
 * PROCEDURAL WEB AUDIO API SOUND ENGINE FOR ASRAR'S DIGITAL WORLD
 * Zero external audio assets required; respects browser autoplay restrictions
 * and remains 100% optional / user-controllable.
 */
class UniverseAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.ambientNodes = null;
  }

  initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setEnabled(on) {
    this.enabled = Boolean(on);
    if (this.enabled) {
      this.initContext();
    } else {
      this.stopAmbient();
    }
  }

  /** Subtle crystalline tone when a domain node connects (nodes 1..5) */
  playNodeConnect(count = 1) {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [440, 523.25, 587.33, 659.25, 783.99];
      const baseFreq = notes[Math.min(notes.length - 1, Math.max(0, count - 1))];

      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      sub.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.04, now + 0.26);
      sub.frequency.setValueAtTime(baseFreq * 0.5, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.065, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

      osc.connect(gain);
      sub.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.36);
      sub.stop(now + 0.36);
    } catch {}
  }

  /** 0–1.5s: Fifth node electrical synchronization chord */
  playSystemAwakening() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [220, 329.63, 440, 659.25, 880];

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        const start = now + idx * 0.07;
        osc.frequency.setValueAtTime(f * 0.98, start);
        osc.frequency.exponentialRampToValueAtTime(f, start + 0.4);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.032, start + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 1.4);
      });
    } catch {}
  }

  /** 1.5–3.5s: Energy implosion & converging digital core hum */
  playEnergyImplosion() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 1.85);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(12, now);
      lfoGain.gain.setValueAtTime(18, now);
      lfo.connect(osc.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 1.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.95);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      lfo.start(now);
      osc.stop(now + 2.0);
      lfo.stop(now + 2.0);
    } catch {}
  }

  /** 3.5–5.5s: Low-frequency cinematic portal activation & fly-through swell */
  playPortalActivation() {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Sub-bass dimensional drop
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(110, now);
      sub.frequency.exponentialRampToValueAtTime(48, now + 1.8);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.09, now + 0.25);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 2.15);

      // Shimmering portal harmonic pad
      [293.66, 440, 554.37, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 2.0);

        gain.gain.setValueAtTime(0.0001, now + 0.15);
        gain.gain.linearRampToValueAtTime(0.025, now + 0.65);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.15);
        osc.stop(now + 2.25);
      });
    } catch {}
  }

  /** Subtle UI chime when selecting one of the 5 worlds inside the universe */
  playWorldSelect(index = 0) {
    if (!this.enabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const scale = [523.25, 587.33, 659.25, 783.99, 880];
      const freq = scale[index % scale.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  /** Gentle ambient cosmic drone inside the unlocked universe */
  startAmbient() {
    if (!this.enabled || this.ambientNodes) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(110, now);
      osc2.frequency.setValueAtTime(164.81, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.018, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      this.ambientNodes = { osc1, osc2, gain };
    } catch {}
  }

  stopAmbient() {
    if (!this.ambientNodes) return;
    try {
      const { osc1, osc2, gain } = this.ambientNodes;
      if (this.ctx) {
        gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);
      }
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
        } catch {}
      }, 280);
    } catch {}
    this.ambientNodes = null;
  }

  dispose() {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const universeAudio = new UniverseAudioEngine();

