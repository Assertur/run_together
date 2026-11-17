// Écrans titre, récap entre niveaux et fin de partie.
import { BIN_TYPES } from '../config/bins.js';
import { formatTime } from './hud.js';

const $ = (id) => document.getElementById(id);
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

const show = (id) => {
  ['screen-title', 'screen-recap', 'screen-end'].forEach((s) => $(s).classList.toggle('hidden', s !== id));
};

/** Tableau du classement (noms insérés en texte, jamais en HTML). */
const renderRanking = (rankings, player) => {
  const body = $('ranking-rows');
  body.replaceChildren();
  const current = player.toLocaleLowerCase('fr');
  const meIndex = rankings.findIndex((p) => p.name.toLocaleLowerCase('fr') === current);
  // Top 10, plus la ligne du joueur s'il est plus loin
  const rows = rankings.map((p, i) => ({ ...p, rank: i + 1 })).filter((p, i) => i < 10 || i === meIndex);
  rows.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.style.setProperty('--d', `${0.3 + i * 0.06}s`);
    if (p.rank - 1 === meIndex) tr.className = 'me';
    const medal = ['🥇', '🥈', '🥉'][p.rank - 1] ?? `${p.rank}`;
    [medal, p.name, p.games, p.best].forEach((value) => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
};

export const screens = {
  hideAll: () => show(null),

  title(ranking) {
    const legend = $('legend');
    legend.innerHTML = Object.values(BIN_TYPES)
      .map(
        (b) =>
          `<div class="bin-chip" style="--c:${hex(b.color)}"><span class="ico">${b.icon}</span><b>${b.label}</b><small>${b.hint}</small></div>`,
      )
      .join('');
    // Podium des 3 meilleurs joueurs de cet appareil
    const podium = $('title-ranking');
    podium.replaceChildren();
    ranking.slice(0, 3).forEach((p, i) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = `${['🥇', '🥈', '🥉'][i]} ${p.name} · ${p.best}`;
      podium.appendChild(chip);
    });
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

  end({ levels, total, accuracy, bestCombo, elapsed, best, isRecord, player, rankings }) {
    $('end-title').textContent = `Bravo ${player}, gymnase rangé !`;
    renderRanking(rankings, player);
    $('end-rows').innerHTML = levels
      .map(
        (l, i) =>
          `<tr style="--d:${i * 0.12}s"><td><b>${i + 1}.</b> ${l.name}</td><td>${l.hits}</td><td>${l.wrong}</td><td>${l.misses}</td><td class="${l.score >= 0 ? 'pos' : 'neg'}">${l.score}</td></tr>`,
      )
      .join('');
    $('end-accuracy').textContent = `${accuracy} %`;
    $('end-combo').textContent = bestCombo;
    $('end-time').textContent = formatTime(elapsed);
    $('end-best').textContent = isRecord ? `🎉 Nouveau record pour ${player} !` : `🏆 Ton record : ${best}`;
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
