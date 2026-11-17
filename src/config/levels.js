// 7 niveaux × 5 objets. `throwTime` décroît de 8 s à 3 s.
// bins: { type, x, z, move?: { amp, speed } }   (le joueur est en z = 0 et lance vers -z)
// trajectory: 'full' | 'short' | 'none'
// wind: { min, max, variable }  (force latérale en m/s²)
// obstacles: [{ kind, x, z }]   colleague: true = un collègue traverse la pièce
export const LEVELS = [
  {
    name: 'Premier jour',
    throwTime: 8,
    bins: [
      { type: 'yellow', x: -1.4, z: -4.5 },
      { type: 'blue', x: 1.4, z: -4.5 },
    ],
    trajectory: 'full',
  },
  {
    name: 'Café du matin',
    throwTime: 7,
    bins: [
      { type: 'yellow', x: -2.6, z: -6 },
      { type: 'blue', x: 0, z: -6.8 },
      { type: 'green', x: 2.6, z: -6 },
    ],
    trajectory: 'full',
  },
  {
    name: 'Pause déjeuner',
    throwTime: 6,
    bins: [
      { type: 'yellow', x: -3.4, z: -6.5 },
      { type: 'blue', x: -1.1, z: -8.5 },
      { type: 'green', x: 1.2, z: -7.2 },
      { type: 'brown', x: 3.5, z: -9 },
    ],
    trajectory: 'short',
  },
  {
    name: 'Open space',
    throwTime: 5,
    bins: [
      { type: 'brown', x: -3.2, z: -8 },
      { type: 'green', x: -0.9, z: -9.5 },
      { type: 'yellow', x: 1.4, z: -8.5 },
      { type: 'blue', x: 3.6, z: -10 },
    ],
    obstacles: [
      { kind: 'cabinet', x: -2.1, z: -5.2 },
      { kind: 'plant', x: 2.4, z: -5.6 },
    ],
    wind: { min: -0.5, max: 0.5, variable: false },
    trajectory: 'short',
  },
  {
    name: 'Réunion surprise',
    throwTime: 4,
    bins: [
      { type: 'yellow', x: -3.6, z: -8.5 },
      { type: 'gray', x: -1.2, z: -10, move: { amp: 0.9, speed: 0.9 } },
      { type: 'blue', x: 1.2, z: -8, move: { amp: 0.7, speed: 1.2 } },
      { type: 'brown', x: 3.6, z: -10.5 },
    ],
    obstacles: [{ kind: 'plant', x: 0, z: -5.5 }],
    wind: { min: -0.7, max: 0.7, variable: false },
    trajectory: 'short',
    trickyBoost: true,
  },
  {
    name: 'Coup de vent',
    throwTime: 3.5,
    bins: [
      { type: 'green', x: -3.8, z: -9.5 },
      { type: 'gray', x: -1.3, z: -11, move: { amp: 1, speed: 1 } },
      { type: 'yellow', x: 1.3, z: -9, move: { amp: 1, speed: 1.3 } },
      { type: 'brown', x: 3.8, z: -11.5 },
    ],
    obstacles: [
      { kind: 'cabinet', x: -2.6, z: -6 },
      { kind: 'cabinet', x: 2.6, z: -6 },
    ],
    wind: { min: -1.1, max: 1.1, variable: true },
    trajectory: 'none',
    trickyBoost: true,
  },
  {
    name: 'Vendredi 17 h 59',
    throwTime: 3,
    bins: [
      { type: 'yellow', x: -3.8, z: -10, move: { amp: 0.8, speed: 1.1 } },
      { type: 'blue', x: -1.3, z: -12, move: { amp: 1, speed: 1.4 } },
      { type: 'green', x: 1.3, z: -9.5 },
      { type: 'brown', x: 3.8, z: -12, move: { amp: 0.8, speed: 0.9 } },
      { type: 'gray', x: 0, z: -13.2, move: { amp: 2, speed: 0.6 } },
    ],
    obstacles: [{ kind: 'plant', x: -1.8, z: -6 }],
    wind: { min: -1.3, max: 1.3, variable: true },
    colleague: true,
    trajectory: 'none',
    trickyBoost: true,
  },
];

export const ITEMS_PER_LEVEL = 5;
