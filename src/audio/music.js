// Musique de fond chiptune « sportive » : basse, accords, mélodie et batterie,
// programmée en avance avec un petit ordonnanceur. Le tempo accélère avec les niveaux.
import { audioContext, midiToFreq, noise, tone } from './engine.js';

// Grille I – vi – IV – V en do majeur, une mesure par accord (16 doubles-croches).
const BARS = [
  { root: 36, chord: [60, 64, 67], melody: [76, 0, 79, 0, 81, 0, 79, 76, 0, 74, 76, 0, 72, 0, 0, 0] },
  { root: 33, chord: [57, 60, 64], melody: [72, 0, 76, 0, 74, 0, 72, 69, 0, 72, 74, 0, 76, 0, 0, 0] },
  { root: 29, chord: [53, 57, 60], melody: [77, 0, 76, 0, 74, 0, 72, 0, 74, 0, 76, 77, 0, 76, 0, 0] },
  { root: 31, chord: [55, 59, 62], melody: [79, 0, 79, 81, 79, 0, 76, 0, 74, 0, 71, 0, 74, 0, 0, 0] },
];
const BASS_PATTERN = [0, 12, 0, 12, 0, 12, 7, 12]; // en croches, relatif à la fondamentale

let timer = null;
let nextTime = 0;
let step = 0;
let bpm = 118;

const playStep = (s, t, stepDur) => {
  const bar = BARS[Math.floor(s / 16) % BARS.length];
  const i = s % 16;
  const loop = Math.floor(s / 64);

  // Batterie
  if (i % 8 === 0) tone(110, 0.18, { type: 'sine', slide: -70, volume: 0.5, at: t, dest: 'music' });
  if (i % 8 === 4) {
    noise(0.14, { at: t, freq: 1800, q: 0.8, volume: 0.28, dest: 'music' });
    tone(190, 0.08, { type: 'triangle', volume: 0.12, at: t, dest: 'music' });
  }
  if (i % 2 === 0) noise(0.04, { at: t, filter: 'highpass', freq: 7000, volume: i % 4 === 2 ? 0.12 : 0.06, dest: 'music' });

  // Basse en croches
  if (i % 2 === 0) {
    tone(midiToFreq(bar.root + BASS_PATTERN[i / 2]), stepDur * 1.8, { type: 'triangle', volume: 0.32, at: t, dest: 'music' });
  }
  // Accords en contretemps
  if (i % 4 === 2) bar.chord.forEach((n) => tone(midiToFreq(n), stepDur * 1.2, { type: 'square', volume: 0.035, at: t, dest: 'music' }));
  // Mélodie (une boucle sur deux, pour laisser respirer)
  const note = bar.melody[i];
  if (note && loop % 2 === 0) tone(midiToFreq(note), stepDur * 1.6, { type: 'square', volume: 0.05, at: t, dest: 'music' });
};

const schedule = () => {
  const ctx = audioContext();
  if (!ctx) return;
  const stepDur = 60 / bpm / 4;
  while (nextTime < ctx.currentTime + 0.12) {
    playStep(step, nextTime, stepDur);
    nextTime += stepDur;
    step += 1;
  }
};

export const music = {
  start(level = 0) {
    const ctx = audioContext();
    if (!ctx) return;
    this.setLevel(level);
    if (timer) return;
    step = 0;
    nextTime = ctx.currentTime + 0.1;
    timer = setInterval(schedule, 25);
  },
  setLevel(level) {
    bpm = 118 + level * 3.5;
  },
  stop() {
    clearInterval(timer);
    timer = null;
  },
  /** Petite fanfare de fin de partie. */
  fanfare() {
    const ctx = audioContext();
    if (!ctx) return;
    const t = ctx.currentTime + 0.05;
    [
      [60, 0, 0.15],
      [64, 0.15, 0.15],
      [67, 0.3, 0.15],
      [72, 0.45, 0.3],
      [67, 0.8, 0.12],
      [72, 0.95, 0.9],
    ].forEach(([n, d, len]) => {
      tone(midiToFreq(n), len, { type: 'square', volume: 0.09, at: t + d, dest: 'sfx' });
      tone(midiToFreq(n - 12), len, { type: 'triangle', volume: 0.12, at: t + d, dest: 'sfx' });
    });
    [60, 64, 67, 72].forEach((n) => tone(midiToFreq(n), 1.2, { type: 'square', volume: 0.04, at: t + 0.95, dest: 'sfx' }));
  },
};
