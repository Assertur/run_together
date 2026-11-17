// Mise à jour du HUD (score, objet courant, jauge, chrono) et petits messages flottants.
import { BIN_TYPES } from '../config/bins.js';

const $ = (id) => document.getElementById(id);

export const formatTime = (seconds) => {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const hud = {
  show(on) {
    $('hud').classList.toggle('hidden', !on);
  },

  setLevel(index, total, name) {
    $('level-num').textContent = `${index + 1}/${total}`;
    $('level-name').textContent = name;
  },

  setScore(score, streak, mult) {
    $('score').textContent = score;
    $('combo').textContent = streak >= 2 ? `Combo ×${mult}` : '';
  },

  setItem(item) {
    $('item-icon').textContent = item ? item.icon : '';
    $('item-name').textContent = item ? item.name : '—';
    const card = $('item-card');
    card.classList.remove('pop');
    void card.offsetWidth;
    card.classList.add('pop');
  },

  setThrows(total, done, results) {
    const el = $('throws');
    el.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = `dot ${results[i] ?? (i === done ? 'current' : '')}`;
      el.appendChild(dot);
    }
  },

  setTimer(left, max) {
    const ratio = Math.max(0, left / max);
    const fill = $('timer-fill');
    fill.style.transform = `scaleX(${ratio})`;
    fill.classList.toggle('danger', left < Math.min(2, max * 0.4));
    $('timer-text').textContent = `${Math.max(0, left).toFixed(1)} s`;
  },

  setPower(power) {
    $('power-fill').style.transform = `scaleY(${power})`;
    $('power-fill').style.background = `hsl(${120 - power * 120} 80% 50%)`;
  },

  setElapsed(seconds) {
    $('elapsed').textContent = formatTime(seconds);
  },

  setWind(wind) {
    const el = $('wind-value');
    if (Math.abs(wind) < 0.05) {
      el.textContent = 'Aucun';
      return;
    }
    const arrows = Math.abs(wind) > 0.95 ? 3 : Math.abs(wind) > 0.55 ? 2 : 1;
    const arrow = (wind > 0 ? '→' : '←').repeat(arrows);
    el.textContent = `${arrow} ${Math.abs(wind).toFixed(1)}`;
  },

  setHint(text) {
    $('hint').textContent = text;
    $('hint').classList.toggle('hidden', !text);
  },

  /** Message flottant à une position écran (x, y en pixels). */
  popup(text, kind, x, y, sub = '') {
    const el = document.createElement('div');
    el.className = `popup ${kind}`;
    el.innerHTML = `<span>${text}</span>${sub ? `<small>${sub}</small>` : ''}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    $('popups').appendChild(el);
    setTimeout(() => el.remove(), 1600);
  },

  banner(title, subtitle, duration = 1400) {
    const el = $('banner');
    el.innerHTML = `<span>${title}</span><small>${subtitle}</small>`;
    el.classList.remove('hidden', 'show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(() => el.classList.add('hidden'), duration);
  },
};

export const binName = (id) => BIN_TYPES[id].label;
