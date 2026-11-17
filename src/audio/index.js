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
  onThrow() {
    tone(320, 0.18, { type: 'triangle', slide: 300, volume: 0.07 });
  },
  onHit({ swish, streak }) {
    tone(523, 0.12, { volume: 0.05 });
    tone(659, 0.12, { volume: 0.05, delay: 0.09 });
    tone(784, 0.2, { volume: 0.05, delay: 0.18 });
    const big = swish || streak >= 3;
    crowd.applause(big ? 0.8 : 0.45, big ? 2 : 1.3);
    if (big) crowd.cheer(streak >= 5 ? 1 : 0.7);
    speak(pick(streak >= 3 ? PHRASES.combo : swish ? PHRASES.swish : PHRASES.hit));
  },
  onWrong() {
    tone(300, 0.18, { type: 'sawtooth', volume: 0.04 });
    tone(200, 0.3, { type: 'sawtooth', volume: 0.04, delay: 0.15 });
    crowd.ooh(0.9);
    speak(pick(PHRASES.wrong));
  },
  onMiss() {
    tone(220, 0.35, { type: 'triangle', slide: -150, volume: 0.06 });
    crowd.ooh(0.6);
    speak(pick(PHRASES.miss));
  },
  onTimeout() {
    tone(220, 0.35, { type: 'triangle', slide: -150, volume: 0.06 });
    speak(pick(PHRASES.timeout));
  },
  onTick() {
    tone(880, 0.04, { volume: 0.03 });
  },
  onLevelEnd() {
    crowd.applause(0.5, 1.6);
  },
  onGameEnd(isRecord) {
    music.stop();
    music.fanfare();
    crowd.applause(1, 4);
    crowd.cheer(1);
    speak(isRecord ? 'Nouveau record ! Bravo !' : 'Bravo, le gymnase est rangé !', { force: true });
  },
};
