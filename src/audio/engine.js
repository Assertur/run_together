// Moteur audio : contexte WebAudio, bus de mixage, réverbération de « grande salle »,
// préférences (son / musique) et petits générateurs de sons (bips, bruit filtré).
const PREF_KEY = 'gym-express-audio';

export const prefs = { muted: false, music: true };
try {
  Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}'));
} catch {
  /* stockage indisponible */
}
export const savePrefs = () => {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  } catch {
    /* stockage indisponible */
  }
};

let ctx = null;
export const bus = {};
let noiseBuffer = null;

const VOLUMES = { music: 0.2, sfx: 0.9, ambience: 0.35, reverb: 0.3 };

const impulseResponse = (seconds, decay) => {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
};

const buildGraph = () => {
  bus.master = ctx.createGain();
  bus.master.gain.value = prefs.muted ? 0 : 1;
  bus.master.connect(ctx.destination);

  bus.reverb = ctx.createConvolver();
  bus.reverb.buffer = impulseResponse(1.8, 3);
  const reverbReturn = ctx.createGain();
  reverbReturn.gain.value = VOLUMES.reverb;
  bus.reverb.connect(reverbReturn).connect(bus.master);

  for (const name of ['music', 'sfx', 'ambience']) {
    bus[name] = ctx.createGain();
    bus[name].gain.value = name === 'music' && !prefs.music ? 0 : VOLUMES[name];
    bus[name].connect(bus.master);
  }
  bus.sfx.connect(bus.reverb);
  bus.ambience.connect(bus.reverb);

  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
};

/** Crée (au premier geste du joueur) ou relance le contexte audio. */
export const unlock = () => {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      buildGraph();
    } catch {
      ctx = null;
    }
  }
  if (ctx?.state === 'suspended') ctx.resume();
  return ctx;
};

export const audioContext = () => ctx;

export const setMuted = (muted) => {
  prefs.muted = muted;
  savePrefs();
  if (ctx) bus.master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05);
};

export const setMusic = (on) => {
  prefs.music = on;
  savePrefs();
  if (ctx) bus.music.gain.setTargetAtTime(on ? VOLUMES.music : 0, ctx.currentTime, 0.1);
};

export const midiToFreq = (m) => 440 * 2 ** ((m - 69) / 12);

/** Note simple avec enveloppe. */
export const tone = (freq, duration, { type = 'square', volume = 0.08, slide = 0, delay = 0, at, dest = 'sfx' } = {}) => {
  if (!ctx) return;
  const t0 = at ?? ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(bus[dest]);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
};

/** Bruit blanc filtré (claps, charleston, caisse claire, souffle…). */
export const noise = (
  duration,
  { at, delay = 0, filter = 'bandpass', freq = 1500, q = 1, volume = 0.1, attack = 0.002, dest = 'sfx' } = {},
) => {
  if (!ctx) return;
  const t0 = at ?? ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(f).connect(gain).connect(bus[dest]);
  src.start(t0, Math.random() * 1.5);
  src.stop(t0 + duration + 0.02);
};

export const noiseSource = () => {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  return src;
};
