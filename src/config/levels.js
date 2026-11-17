// 7 niveaux × 5 objets. `throwTime` décroît de 8 s à 3 s.
// bins: { type, x, z, move?: { amp, speed } }   (le joueur est en z = 0 et lance vers -z)
// trajectory: 'full' | 'short' | 'none'
// obstacles: [{ kind: 'vault' | 'mat' | 'cones', x, z }]   coach: true = l'entraîneur traverse le gymnase
export const LEVELS = [
  {
    name: 'Échauffement',
    throwTime: 8,
    bins: [
      { type: 'basket', x: -1.4, z: -4.5 },
      { type: 'foot', x: 1.4, z: -4.5 },
    ],
    trajectory: 'full',
  },
  {
    name: 'Premier set',
    throwTime: 7,
    bins: [
      { type: 'basket', x: -2.6, z: -6 },
      { type: 'tennis', x: 0, z: -6.8 },
      { type: 'foot', x: 2.6, z: -6 },
    ],
    trajectory: 'full',
  },
  {
    name: 'Tous au filet',
    throwTime: 6,
    bins: [
      { type: 'foot', x: -3.4, z: -6.5 },
      { type: 'volley', x: -1.1, z: -8.5 },
      { type: 'basket', x: 1.2, z: -7.2 },
      { type: 'tennis', x: 3.5, z: -9 },
    ],
    trajectory: 'full',
  },
  {
    name: 'Parcours gym',
    throwTime: 5,
    bins: [
      { type: 'tennis', x: -3.2, z: -8 },
      { type: 'basket', x: -0.9, z: -9.5 },
      { type: 'volley', x: 1.4, z: -8.5 },
      { type: 'foot', x: 3.6, z: -10 },
    ],
    obstacles: [
      { kind: 'vault', x: -2.1, z: -5.2 },
      { kind: 'mat', x: 2.4, z: -5.6 },
    ],
    trajectory: 'short',
  },
  {
    name: 'Mêlée générale',
    throwTime: 4,
    bins: [
      { type: 'basket', x: -3.6, z: -8.5 },
      { type: 'rugby', x: -1.2, z: -10, move: { amp: 0.9, speed: 0.8 } },
      { type: 'foot', x: 1.2, z: -8, move: { amp: 0.7, speed: 1.0 } },
      { type: 'volley', x: 3.6, z: -10.5 },
    ],
    obstacles: [{ kind: 'cones', x: 0, z: -5.5 }],
    trajectory: 'short',
  },
  {
    name: 'Prolongations',
    throwTime: 3.5,
    bins: [
      { type: 'tennis', x: -3.8, z: -9.5 },
      { type: 'rugby', x: -1.3, z: -11, move: { amp: 1, speed: 0.9 } },
      { type: 'basket', x: 1.3, z: -9, move: { amp: 1, speed: 1.1 } },
      { type: 'volley', x: 3.8, z: -11.5 },
    ],
    obstacles: [
      { kind: 'vault', x: -2.6, z: -6 },
      { kind: 'mat', x: 2.6, z: -6 },
    ],
    trajectory: 'none',
  },
  {
    name: 'Coup de sifflet final',
    throwTime: 3,
    bins: [
      { type: 'basket', x: -3.8, z: -10, move: { amp: 0.8, speed: 1.0 } },
      { type: 'foot', x: -1.3, z: -12, move: { amp: 1, speed: 1.2 } },
      { type: 'tennis', x: 1.3, z: -9.5 },
      { type: 'volley', x: 3.8, z: -12, move: { amp: 0.8, speed: 0.8 } },
      { type: 'rugby', x: 0, z: -13.2, move: { amp: 2, speed: 0.5 } },
    ],
    obstacles: [{ kind: 'cones', x: -1.8, z: -6 }],
    coach: true,
    trajectory: 'none',
  },
];

export const ITEMS_PER_LEVEL = 5;
