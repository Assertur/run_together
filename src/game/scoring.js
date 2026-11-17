// Système de points : réussite, mauvais bac, raté, combo. Un score par niveau.
export const POINTS = {
  correct: 100,
  maxDistanceBonus: 50,
  swish: 25,
  wrongBin: -50,
  miss: -20,
};

export const comboMultiplier = (streak) => Math.min(3, 1 + 0.5 * Math.max(0, streak - 1));

export const distanceBonus = (distance) =>
  Math.round(Math.max(0, Math.min(1, (distance - 4) / 9)) * POINTS.maxDistanceBonus);

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

  /** Bon bac. Renvoie le détail des points gagnés. */
  correct({ distance, swish }) {
    this.streak += 1;
    this.bestCombo = Math.max(this.bestCombo, this.streak);
    const mult = comboMultiplier(this.streak);
    const base = POINTS.correct + distanceBonus(distance) + (swish ? POINTS.swish : 0);
    const points = Math.round(base * mult);
    this.current.score += points;
    this.current.hits += 1;
    return { points, mult, swish, streak: this.streak };
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
