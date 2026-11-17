// Façade audio du jeu : un appel par événement, qui combine effets, foule, voix et musique.
import { crowd } from './crowd.js';
import { prefs, setMuted, setMusic, tone, unlock } from './engine.js';
import { music } from './music.js';
import { PHRASES, pick, say, stopVoice } from './voice.js';

let onSpeak = null;

const speak = (text, opts) => {
  onSpeak?.(text);
  say(text, opts);
};

// L'entraîneur ne commente pas tous les lancers : seulement de temps en temps.
const maybeSpeak = (list, chance) => {
  if (Math.random() < chance) speak(pick(list));
};

export const audio = {
  get muted() {
    return prefs.muted;
  },
  get musicOn() {
    return prefs.music;
  },
  /** Callback appelé à chaque encouragement (pour afficher la bulle de l'entraîneur). */
  setSpeakListener(fn) {
    onSpeak = fn;
  },
  toggleMute() {
    setMuted(!prefs.muted);
    if (prefs.muted) stopVoice();
    return prefs.muted;
  },
  toggleMusic() {
    setMusic(!prefs.music);
    return prefs.music;
  },

  onStart() {
    if (!unlock()) return;
    crowd.startAmbience();
    music.start(0);
  },
  onLevelStart(index) {
    crowd.whistle();
    music.start(index);
    speak(`Niveau ${index + 1}, c'est parti !`, { force: true });
  },
  onHit({ swish, streak, hard }) {
    tone(523, 0.12, { volume: 0.05 });
    tone(659, 0.12, { volume: 0.05, delay: 0.09 });
    tone(784, 0.2, { volume: 0.05, delay: 0.18 });
    const big = swish || hard || streak >= 3;
    crowd.applause(big ? 0.8 : 0.4, big ? 2 : 1.2);
    if (big) crowd.cheer(streak >= 5 ? 1 : 0.7);
    // Paliers de série (3, 5, 7…) toujours commentés, le reste de temps en temps
    if (streak >= 3 && streak % 2 === 1) speak(pick(PHRASES.combo));
    else if (hard) maybeSpeak(PHRASES.hard, 0.6);
    else if (swish) maybeSpeak(PHRASES.swish, 0.5);
    else maybeSpeak(PHRASES.hit, 0.3);
  },
  onWrong() {
    tone(300, 0.18, { type: 'sawtooth', volume: 0.04 });
    tone(200, 0.3, { type: 'sawtooth', volume: 0.04, delay: 0.15 });
    crowd.ooh(0.9);
    maybeSpeak(PHRASES.wrong, 0.5);
  },
  onMiss() {
    tone(220, 0.35, { type: 'triangle', slide: -150, volume: 0.06 });
    if (Math.random() < 0.5) crowd.ooh(0.6);
    maybeSpeak(PHRASES.miss, 0.35);
  },
  onTimeout() {
    tone(220, 0.35, { type: 'triangle', slide: -150, volume: 0.06 });
    maybeSpeak(PHRASES.timeout, 0.6);
  },
  onTick() {
    tone(880, 0.04, { volume: 0.03 });
  },
  onLevelEnd() {
    crowd.applause(0.5, 1.6);
  },
  onGameEnd(isRecord, player) {
    music.stop();
    music.fanfare();
    crowd.applause(1, 4);
    crowd.cheer(1);
    speak(isRecord ? `Nouveau record, bravo ${player} !` : `Bravo ${player}, le gymnase est rangé !`, { force: true });
  },
};
