// Écrans titre, récap entre niveaux et fin de partie.
import { BIN_TYPES } from '../config/bins.js';
import { formatTime } from './hud.js';

const $ = (id) => document.getElementById(id);
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

const show = (id) => {
  ['screen-title', 'screen-recap', 'screen-end'].forEach((s) => $(s).classList.toggle('hidden', s !== id));
};

export const screens = {
  hideAll: () => show(null),

  title(best) {
    const legend = $('legend');
    legend.innerHTML = Object.values(BIN_TYPES)
      .map(
        (b) =>
          `<div class="bin-chip" style="--c:${hex(b.color)}"><span class="ico">${b.icon}</span><b>${b.label}</b><small>${b.hint}</small></div>`,
      )
      .join('');
    $('best-title').textContent = best ? `🏆 Meilleur score : ${best}` : '';
    show('screen-title');
  },

  recap(index, total, stats, nextName, duration) {
    $('recap-title').textContent = `Niveau ${index + 1} terminé !`;
    $('recap-hits').textContent = stats.hits;
    $('recap-wrong').textContent = stats.wrong;
    $('recap-miss').textContent = stats.misses;
    $('recap-score').textContent = stats.score > 0 ? `+${stats.score}` : stats.score;
    $('recap-next').textContent = nextName ? `Prochain : niveau ${index + 2}/${total} — ${nextName}` : 'Dernier niveau terminé !';
    const bar = $('recap-bar-fill');
    bar.style.transition = 'none';
    bar.style.transform = 'scaleX(0)';
    void bar.offsetWidth;
    bar.style.transition = `transform ${duration}s linear`;
    bar.style.transform = 'scaleX(1)';
    show('screen-recap');
  },

  end({ levels, total, accuracy, bestCombo, elapsed, best, isRecord }) {
    $('end-rows').innerHTML = levels
      .map(
        (l, i) =>
          `<tr style="--d:${i * 0.12}s"><td><b>${i + 1}.</b> ${l.name}</td><td>${l.hits}</td><td>${l.wrong}</td><td>${l.misses}</td><td class="${l.score >= 0 ? 'pos' : 'neg'}">${l.score}</td></tr>`,
      )
      .join('');
    $('end-accuracy').textContent = `${accuracy} %`;
    $('end-combo').textContent = bestCombo;
    $('end-time').textContent = formatTime(elapsed);
    $('end-best').textContent = isRecord ? '🎉 Nouveau record !' : best != null ? `🏆 Meilleur score : ${best}` : '';
    show('screen-end');

    // Le total « compte » jusqu'à la somme des niveaux
    const el = $('end-total');
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = Math.round(total * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};
