// Modèles low-poly des objets de sport. Tous centrés à l'origine, taille ≈ 0.3 m.
import { box, cylinder, group, sphere } from './voxel.js';

// Bande fine qui « entoure » un ballon (couture, ligne).
const band = (r, color, opts = {}) => box(r * 2.04, 0.025, r * 2.04, color, { round: 0, shadow: false, ...opts });

const builders = {
  basketball: () =>
    group(
      sphere(0.15, 0xe8742c),
      band(0.15, 0x3a2418),
      band(0.15, 0x3a2418, { rx: Math.PI / 2 }),
      band(0.15, 0x3a2418, { rz: Math.PI / 2 }),
    ),
  miniBasketball: () =>
    group(sphere(0.11, 0xf08a3c), band(0.11, 0x3a2418), band(0.11, 0x3a2418, { rx: Math.PI / 2 })),
  football: () =>
    group(
      sphere(0.15, 0xffffff),
      box(0.08, 0.08, 0.02, 0x222222, { z: 0.14, round: 0.01 }),
      box(0.08, 0.08, 0.02, 0x222222, { z: -0.14, round: 0.01 }),
      box(0.02, 0.08, 0.08, 0x222222, { x: 0.14, round: 0.01 }),
      box(0.02, 0.08, 0.08, 0x222222, { x: -0.14, round: 0.01 }),
      box(0.08, 0.02, 0.08, 0x222222, { y: 0.14, round: 0.01 }),
      box(0.08, 0.02, 0.08, 0x222222, { y: -0.14, round: 0.01 }),
    ),
  cone: () =>
    group(
      box(0.3, 0.03, 0.3, 0xff7a1a, { y: -0.1 }),
      cylinder(0.03, 0.12, 0.22, 0xff8c2e, { y: 0.02, segments: 6 }),
      cylinder(0.075, 0.085, 0.04, 0xffffff, { y: 0.0, segments: 6 }),
    ),
  tennisBall: () =>
    group(sphere(0.085, 0xd7f03a), band(0.085, 0xffffff, { rz: 0.5 }), band(0.085, 0xffffff, { rx: Math.PI / 2 - 0.5 })),
  racket: () =>
    group(
      box(0.26, 0.04, 0.3, 0xe23d4f, { z: -0.08, round: 0.04 }),
      box(0.2, 0.042, 0.24, 0xf4f4f4, { z: -0.08, round: 0.02 }),
      box(0.05, 0.05, 0.22, 0x2b2d42, { z: 0.18 }),
    ),
  volleyball: () =>
    group(
      sphere(0.14, 0xffffff),
      band(0.14, 0x3d8bfd),
      band(0.14, 0xf7c843, { rx: Math.PI / 2 }),
      band(0.14, 0x3d8bfd, { rz: Math.PI / 2 }),
    ),
  beachBall: () =>
    group(
      sphere(0.16, 0xffffff),
      box(0.33, 0.33, 0.06, 0xe8453c, { round: 0.12, shadow: false }),
      box(0.06, 0.33, 0.33, 0x3d8bfd, { round: 0.12, shadow: false }),
      box(0.06, 0.06, 0.06, 0xf7c843, { y: 0.16 }),
    ),
  rugbyBall: () =>
    group(
      box(0.18, 0.18, 0.34, 0xa0522d, { round: 0.08 }),
      box(0.12, 0.12, 0.42, 0xa0522d, { round: 0.05 }),
      box(0.03, 0.02, 0.14, 0xffffff, { y: 0.095 }),
      ...[-0.04, 0, 0.04].map((z) => box(0.06, 0.022, 0.012, 0xffffff, { y: 0.095, z })),
    ),
  tee: () =>
    group(
      cylinder(0.12, 0.14, 0.05, 0xf7c843, { y: -0.08, segments: 6 }),
      cylinder(0.06, 0.1, 0.1, 0xf7c843, { y: 0.0, segments: 6 }),
      cylinder(0.09, 0.06, 0.05, 0xffd84d, { y: 0.07, segments: 6 }),
    ),
};

export const buildItemModel = (shape) => {
  const model = (builders[shape] ?? builders.basketball)();
  model.scale.setScalar(1.25);
  return model;
};

export const ITEM_RADIUS = 0.17;
