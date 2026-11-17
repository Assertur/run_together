// Sons de foule et de gymnase : murmure d'ambiance, bruits lointains, applaudissements,
// cris de joie, « ooooh » déçu et sifflet de l'entraîneur.
import { audioContext, bus, noise, noiseSource, tone } from './engine.js';

let ambienceStarted = false;

const rand = (a, b) => a + Math.random() * (b - a);

/** Bruits lointains du gymnase : ballon qui rebondit, crissement de basket. */
const distantEvent = () => {
  const ctx = audioContext();
  if (Math.random() < 0.6) {
    let t = ctx.currentTime;
    let gap = rand(0.35, 0.5);
    let vol = rand(0.25, 0.4);
    for (let i = 0; i < 4; i++) {
      tone(rand(85, 110), 0.12, { type: 'sine', slide: -40, volume: vol, at: t, dest: 'ambience' });
      t += gap;
      gap *= 0.7;
      vol *= 0.65;
    }
  } else {
    const t = ctx.currentTime;
    tone(rand(2000, 2600), 0.09, { type: 'sine', slide: 500, volume: 0.05, at: t, dest: 'ambience' });
    tone(rand(2100, 2700), 0.07, { type: 'sine', slide: 400, volume: 0.04, at: t + 0.14, dest: 'ambience' });
  }
  setTimeout(distantEvent, rand(4000, 9000));
};

export const crowd = {
  /** Murmure continu de la salle (bruit filtré qui ondule lentement). */
  startAmbience() {
    const ctx = audioContext();
    if (!ctx || ambienceStarted) return;
    ambienceStarted = true;
    const murmur = noiseSource();
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 550;
    band.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = 0.18;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.13;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.07;
    lfo.connect(lfoDepth).connect(gain.gain);
    murmur.connect(band).connect(gain).connect(bus.ambience);
    murmur.start();
    lfo.start();
    setTimeout(distantEvent, 3000);
  },

  /** Applaudissements : `intensity` 0–1, `duration` en secondes. */
  applause(intensity = 0.5, duration = 1.4) {
    const ctx = audioContext();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const claps = Math.round((25 + intensity * 90) * duration);
    for (let i = 0; i < claps; i++) {
      // plus dense au début, puis ça s'éteint
      const at = t0 + duration * Math.random() ** 1.6;
      noise(rand(0.02, 0.05), { at, freq: rand(1000, 2600), q: rand(0.8, 1.6), volume: rand(0.05, 0.14) * (0.5 + intensity), dest: 'sfx' });
    }
  },

  /** Cri de joie de la foule (souffle filtré qui monte puis retombe). */
  cheer(intensity = 0.6) {
    const ctx = audioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    [700, 1100, 1600].forEach((freq, i) => {
      const src = noiseSource();
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 3;
      f.frequency.setValueAtTime(freq * 0.8, t);
      f.frequency.linearRampToValueAtTime(freq * 1.15, t + 0.35);
      f.frequency.linearRampToValueAtTime(freq, t + 1.3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.18 * intensity / (i + 1), t + 0.18);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      src.connect(f).connect(g).connect(bus.sfx);
      src.start(t, Math.random());
      src.stop(t + 1.5);
    });
  },

  /** « Ooooh » déçu : plusieurs voix graves qui glissent vers le bas. */
  ooh(intensity = 0.7) {
    const ctx = audioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.linearRampToValueAtTime(420, t + 0.9);
    lp.Q.value = 4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05 * intensity, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
    lp.connect(g).connect(bus.sfx);
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const f0 = rand(170, 260);
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.78, t + 0.9);
      osc.connect(lp);
      osc.start(t + rand(0, 0.06));
      osc.stop(t + 1.05);
    }
  },

  /** Deux coups de sifflet de l'entraîneur. */
  whistle() {
    const ctx = audioContext();
    if (!ctx) return;
    [
      [0, 0.18],
      [0.28, 0.45],
    ].forEach(([d, len]) => {
      const t = ctx.currentTime + d;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 2900;
      const trill = ctx.createOscillator();
      trill.frequency.value = 32;
      const depth = ctx.createGain();
      depth.gain.value = 90;
      trill.connect(depth).connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.02);
      g.gain.setValueAtTime(0.09, t + len - 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(g).connect(bus.sfx);
      osc.start(t);
      trill.start(t);
      osc.stop(t + len + 0.02);
      trill.stop(t + len + 0.02);
    });
  },
};
