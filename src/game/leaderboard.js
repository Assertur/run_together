// Classement local : les parties sont gardées dans le navigateur (localStorage).
const SCORES_KEY = 'gym-express-scores';
const NAME_KEY = 'gym-express-name';
const MAX_GAMES = 200;
export const MAX_NAME_LENGTH = 16;

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : le classement ne durera que le temps de la page */
  }
};

let games = read(SCORES_KEY, []);
if (!Array.isArray(games)) games = [];

export const cleanName = (name) => (name ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH) || 'Joueur';

export const lastName = () => {
  const n = read(NAME_KEY, '');
  return typeof n === 'string' ? n : '';
};
export const rememberName = (name) => write(NAME_KEY, name);

const sameName = (a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }) === 0;

/** Meilleur score d'un joueur avant la partie en cours (null s'il n'a jamais joué). */
export const bestOf = (name) => {
  const mine = games.filter((g) => sameName(g.name, name));
  return mine.length ? Math.max(...mine.map((g) => g.total)) : null;
};

/** Enregistre une partie terminée. */
export const recordGame = ({ name, total, accuracy }) => {
  games.push({ name, total, accuracy, date: Date.now() });
  if (games.length > MAX_GAMES) games = games.slice(-MAX_GAMES);
  write(SCORES_KEY, games);
};

/** Classement : meilleur score de chaque joueur, du plus haut au plus bas. */
export const rankings = () => {
  const byPlayer = new Map();
  for (const g of games) {
    const key = g.name.toLocaleLowerCase('fr');
    const p = byPlayer.get(key) ?? { name: g.name, best: -Infinity, games: 0, last: 0 };
    p.games += 1;
    if (g.total > p.best) p.best = g.total;
    if (g.date >= p.last) {
      p.last = g.date;
      p.name = g.name;
    }
    byPlayer.set(key, p);
  }
  return [...byPlayer.values()].sort((a, b) => b.best - a.best);
};
