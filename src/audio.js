// Petits sons synthétisés avec WebAudio (aucun fichier à charger).
let ctx = null;
let muted = false;

const ac = () => {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  if (ctx?.state === 'suspended') ctx.resume();
  return ctx;
};

const tone = (freq, duration, { type = 'square', volume = 0.08, slide = 0, delay = 0 } = {}) => {
  const a = ac();
  if (!a || muted) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + duration);
  gain.gain.setValueAtTime(volume, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
};

export const sfx = {
  unlock: () => ac(),
  toggleMute: () => (muted = !muted),
  get muted() {
    return muted;
  },
  throw: () => tone(320, 0.18, { type: 'triangle', slide: 300, volume: 0.07 }),
  bounce: () => tone(160, 0.06, { type: 'square', volume: 0.03 }),
  success: () => {
    tone(523, 0.12, { type: 'square', volume: 0.06 });
    tone(659, 0.12, { type: 'square', volume: 0.06, delay: 0.09 });
    tone(784, 0.2, { type: 'square', volume: 0.06, delay: 0.18 });
  },
  wrong: () => {
    tone(300, 0.18, { type: 'sawtooth', volume: 0.05 });
    tone(200, 0.3, { type: 'sawtooth', volume: 0.05, delay: 0.15 });
  },
  miss: () => tone(220, 0.35, { type: 'triangle', slide: -150, volume: 0.07 }),
  tick: () => tone(880, 0.04, { type: 'square', volume: 0.03 }),
  level: () => {
    [392, 523, 659, 784].forEach((f, i) => tone(f, 0.15, { type: 'square', volume: 0.05, delay: i * 0.08 }));
  },
};
