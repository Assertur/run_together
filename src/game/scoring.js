// Système de points : réussite, mauvais bac, raté, combo. Un score par niveau.
export const POINTS = {
  correct: 100,
  maxDistanceBonus: 100,
  maxMovingBonus: 80,
  obstacle: 40,
  hiddenTrajectory: 30,
  shortTrajectory: 15,
  swish: 25,
  wrongBin: -50,
  miss: -20,
};

export const comboMultiplier = (streak) => Math.min(3, 1 + 0.5 * Math.max(0, streak - 1));

export const distanceBonus = (distance) =>
  Math.round(Math.max(0, Math.min(1, (distance - 4) / 9)) * POINTS.maxDistanceBonus);

/** Bonus de difficulté du lancer, avec un libellé court pour chacun. */
export const difficultyBonuses = ({ distance, moving, obstacle, trajectory, swish }) => {
  const list = [];
  const far = distanceBonus(distance);
  if (far > 0) list.push({ label: 'Loin', points: far });
  if (moving) {
    // moving = { amp, speed } du bac : plus il va vite et loin, plus ça rapporte
    const pts = Math.min(POINTS.maxMovingBonus, Math.round(40 + moving.amp * moving.speed * 30));
    list.push({ label: 'Bac mobile', points: pts });
  }
  if (obstacle) list.push({ label: 'Par-dessus l\'obstacle', points: POINTS.obstacle });
  if (trajectory === 'none') list.push({ label: 'À l\'aveugle', points: POINTS.hiddenTrajectory });
  if (trajectory === 'short') list.push({ label: 'Sans guide', points: POINTS.shortTrajectory });
  if (swish) list.push({ label: 'Swish', points: POINTS.swish });
  return list;
};

export class ScoreKeeper {
  constructor() {
    this.reset();
  }

  reset() {
    this.levels = [];
    this.streak = 0;
    this.bestCombo = 0;
  }

  startLevel(index, name) {
    this.levels[index] = { name, score: 0, hits: 0, wrong: 0, misses: 0 };
    this.current = this.levels[index];
  }

  /** Bon bac. Plus le lancer est difficile, plus il rapporte. Renvoie le détail des points. */
  correct(shot) {
    this.streak += 1;
    this.bestCombo = Math.max(this.bestCombo, this.streak);
    const mult = comboMultiplier(this.streak);
    const bonuses = difficultyBonuses(shot);
    const base = POINTS.correct + bonuses.reduce((sum, b) => sum + b.points, 0);
    const points = Math.round(base * mult);
    this.current.score += points;
    this.current.hits += 1;
    return { points, mult, bonuses, swish: shot.swish, streak: this.streak };
  }

  wrong() {
    this.streak = 0;
    this.current.score += POINTS.wrongBin;
    this.current.wrong += 1;
    return { points: POINTS.wrongBin };
  }

  miss() {
    this.streak = 0;
    this.current.score += POINTS.miss;
    this.current.misses += 1;
    return { points: POINTS.miss };
  }

  get total() {
    return this.levels.reduce((sum, l) => sum + (l?.score ?? 0), 0);
  }

  get accuracy() {
    const throws = this.levels.reduce((s, l) => s + l.hits + l.wrong + l.misses, 0);
    const hits = this.levels.reduce((s, l) => s + l.hits, 0);
    return throws ? Math.round((hits / throws) * 100) : 0;
  }
}
