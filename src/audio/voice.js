// Encouragements de l'entraîneur prononcés par la synthèse vocale du navigateur (fr-FR).
import { prefs } from './engine.js';

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
let voice = null;
let lastAt = 0;
const MIN_GAP_MS = 1500;

const pickVoice = () => {
  const voices = synth.getVoices();
  const fr = voices.filter((v) => v.lang?.toLowerCase().startsWith('fr'));
  voice =
    fr.find((v) => /natural|neural|google|online/i.test(v.name)) ??
    fr.find((v) => v.lang === 'fr-FR') ??
    fr[0] ??
    null;
};
if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export const PHRASES = {
  hit: ['Bravo !', 'Joli tir !', 'Bien rangé !', 'Super !', 'Dans le mille !', 'Bien joué !'],
  swish: ['Swish ! Parfait !', 'Sans toucher le bord !', 'Magnifique !'],
  combo: ['Quelle série !', 'Tu es en feu !', 'Incroyable !', 'Continue comme ça !'],
  wrong: ['Oups, mauvais bac !', 'Pas ce bac-là !', 'Attention au sport !'],
  miss: ['Presque !', 'Allez, on se reprend !', 'Pas loin !', 'Courage !'],
  timeout: ['Plus vite !', 'Allez, on lance !', 'Le temps file !'],
};

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** Prononce `text`. `force` passe outre l'anti-spam (début de niveau, fin de partie). */
export const say = (text, { force = false } = {}) => {
  if (!synth || prefs.muted) return false;
  const now = performance.now();
  if (!force && now - lastAt < MIN_GAP_MS) return false;
  lastAt = now;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  if (voice) u.voice = voice;
  u.rate = 1.05;
  u.pitch = 1.1;
  u.volume = 0.95;
  synth.speak(u);
  return true;
};

export const stopVoice = () => synth?.cancel();
