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
  hit: [
    'Bravo !', 'Joli tir !', 'Bien rangé !', 'Super !', 'Dans le mille !', 'Bien joué !', 'Nickel !',
    'Propre !', 'Pile dedans !', 'Excellent !', 'Tranquille !', 'Ça, c\'est rangé !', 'Belle adresse !',
    'Impeccable !', 'Et un de plus !',
  ],
  hard: [
    'Quel lancer !', 'Superbe, et de loin !', 'Ça, c\'était pas facile !', 'Chapeau !', 'Tir de champion !',
    'Du grand art !', 'Quelle précision !', 'Exceptionnel !',
  ],
  swish: ['Swish ! Parfait !', 'Sans toucher le bord !', 'Tout en douceur !', 'Même pas touché le bord !', 'Magnifique !'],
  combo: [
    'Quelle série !', 'Tu es en feu !', 'Incroyable !', 'Continue comme ça !', 'Rien ne t\'arrête !',
    'La série continue !', 'Inarrêtable !', 'Quelle forme aujourd\'hui !',
  ],
  wrong: [
    'Oups, mauvais bac !', 'Pas ce bac-là !', 'Attention au sport !', 'Regarde bien les étiquettes !',
    'Mauvais rangement !', 'Ce n\'est pas sa place !', 'Raté, c\'est l\'autre bac !',
  ],
  miss: [
    'Presque !', 'Allez, on se reprend !', 'Pas loin !', 'Courage !', 'Ça arrive !', 'Concentre-toi !',
    'Un peu plus de force !', 'La prochaine sera la bonne !', 'On ne lâche rien !', 'Respire, et on recommence !',
  ],
  timeout: ['Plus vite !', 'Allez, on lance !', 'Le temps file !', 'Ne traîne pas !', 'Il faut se décider !', 'Trop tard !'],
};

const lastPicked = new Map();

/** Tire une phrase au hasard en évitant de répéter les dernières de la même liste. */
export const pick = (list) => {
  const recent = lastPicked.get(list) ?? [];
  const choices = list.filter((p) => !recent.includes(p));
  const phrase = choices[Math.floor(Math.random() * choices.length)] ?? list[0];
  lastPicked.set(list, [phrase, ...recent].slice(0, Math.min(4, list.length - 1)));
  return phrase;
};

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
