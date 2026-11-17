// Modèles voxel des objets à lancer. Tous centrés à l'origine, taille ≈ 0.3 m.
import { box, cylinder, group } from './voxel.js';

const builders = {
  can: () =>
    group(
      cylinder(0.09, 0.09, 0.24, 0xe8453c, { segments: 8 }),
      cylinder(0.08, 0.08, 0.02, 0xd9dde3, { y: 0.13, segments: 8 }),
      cylinder(0.092, 0.092, 0.05, 0xffffff, { y: 0.02, segments: 8 }),
    ),
  plasticBottle: () =>
    group(
      box(0.16, 0.26, 0.16, 0x9fd8ff, { opacity: 0.85, round: 0.05 }),
      box(0.17, 0.08, 0.17, 0x2e86de, { y: -0.02 }),
      box(0.08, 0.07, 0.08, 0x9fd8ff, { y: 0.16, opacity: 0.85 }),
      box(0.09, 0.04, 0.09, 0x1e5fa8, { y: 0.21 }),
    ),
  yogurt: () =>
    group(
      cylinder(0.1, 0.08, 0.16, 0xffffff, { segments: 8 }),
      cylinder(0.105, 0.105, 0.02, 0xf06292, { y: 0.09, segments: 8 }),
    ),
  juice: () =>
    group(
      box(0.14, 0.22, 0.1, 0xffa726),
      box(0.145, 0.07, 0.105, 0x66bb6a, { y: 0.02 }),
      box(0.03, 0.06, 0.03, 0xffffff, { x: 0.03, y: 0.13 }),
    ),
  paperBall: () =>
    group(
      box(0.2, 0.2, 0.2, 0xf7f7f2, { round: 0.06 }),
      box(0.12, 0.12, 0.12, 0xe9e9e0, { x: 0.07, y: 0.06, z: 0.05, round: 0.04 }),
      box(0.1, 0.1, 0.1, 0xffffff, { x: -0.07, y: -0.05, z: 0.06, round: 0.03 }),
    ),
  newspaper: () =>
    group(
      box(0.3, 0.05, 0.22, 0xe6e1d3),
      box(0.12, 0.052, 0.08, 0x4a4a4a, { x: -0.06, z: -0.04 }),
      box(0.1, 0.052, 0.02, 0x888888, { x: 0.08, z: 0.05 }),
    ),
  cardboard: () =>
    group(
      box(0.26, 0.18, 0.22, 0xc8955a),
      box(0.265, 0.03, 0.06, 0xe8d2a6, { y: 0.075 }),
    ),
  envelope: () =>
    group(
      box(0.3, 0.03, 0.18, 0xfafafa),
      box(0.04, 0.032, 0.04, 0xe8453c, { x: 0.1, z: -0.05 }),
    ),
  glassBottle: () =>
    group(
      box(0.14, 0.24, 0.14, 0x2e8b57, { opacity: 0.8, round: 0.04 }),
      box(0.07, 0.12, 0.07, 0x2e8b57, { y: 0.17, opacity: 0.8 }),
      box(0.145, 0.08, 0.145, 0xf3e5ab, { y: -0.01 }),
      box(0.075, 0.03, 0.075, 0xc0a060, { y: 0.24 }),
    ),
  jar: () =>
    group(
      box(0.18, 0.18, 0.18, 0xcfe8ff, { opacity: 0.7, round: 0.04 }),
      box(0.15, 0.12, 0.15, 0xc0392b, { y: -0.02 }),
      box(0.19, 0.05, 0.19, 0xe74c3c, { y: 0.11 }),
    ),
  apple: () =>
    group(
      box(0.14, 0.06, 0.14, 0xd63031, { y: 0.08 }),
      box(0.07, 0.12, 0.07, 0xfff3c4),
      box(0.14, 0.06, 0.14, 0xd63031, { y: -0.08 }),
      box(0.02, 0.06, 0.02, 0x6d4c41, { y: 0.13 }),
    ),
  banana: () =>
    group(
      box(0.08, 0.06, 0.12, 0xf9d71c, { z: 0 }),
      box(0.06, 0.05, 0.12, 0xf9d71c, { x: 0.06, z: -0.08, ry: 0.6 }),
      box(0.06, 0.05, 0.12, 0xf9d71c, { x: -0.06, z: -0.08, ry: -0.6 }),
      box(0.06, 0.05, 0.1, 0xe9c80f, { z: 0.1 }),
      box(0.03, 0.04, 0.03, 0x5d4037, { z: 0.16 }),
    ),
  teabag: () =>
    group(
      box(0.16, 0.04, 0.18, 0xd7b98e),
      box(0.012, 0.012, 0.18, 0xffffff, { y: 0.02, z: -0.15 }),
      box(0.07, 0.015, 0.05, 0xff7043, { y: 0.02, z: -0.25 }),
    ),
  tissue: () =>
    group(
      box(0.18, 0.12, 0.18, 0xf0f4f8, { round: 0.05 }),
      box(0.1, 0.08, 0.1, 0xdde6ee, { x: 0.06, y: 0.05, round: 0.03 }),
    ),
  coffeeCup: () =>
    group(
      cylinder(0.09, 0.07, 0.2, 0xfafafa, { segments: 8 }),
      cylinder(0.095, 0.085, 0.07, 0x8d6e63, { y: 0.0, segments: 8 }),
      cylinder(0.1, 0.1, 0.025, 0x3e2723, { y: 0.11, segments: 8 }),
    ),
  pen: () =>
    group(
      box(0.05, 0.05, 0.3, 0x1e88e5),
      box(0.055, 0.055, 0.06, 0x0d47a1, { z: 0.13 }),
      box(0.02, 0.02, 0.04, 0x9e9e9e, { z: -0.17 }),
    ),
};

export const buildItemModel = (shape) => {
  const model = (builders[shape] ?? builders.paperBall)();
  model.scale.setScalar(1.25);
  return model;
};

export const ITEM_RADIUS = 0.17;
