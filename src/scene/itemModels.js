// Modèles low-poly des objets de sport. Tous centrés à l'origine, taille ≈ 0.3 m.
import * as THREE from 'three';
import { box, cylinder, group, ring, sphere } from './voxel.js';

const HALF_PI = Math.PI / 2;
// Couture collée à la surface d'un ballon de rayon r.
const seam = (r, color, opts = {}, tube = r * 0.07) => ring(r + tube * 0.2, tube, color, opts);
const ball = (r, color) => sphere(r, color, { detail: 2 });

/** Ballon à panneaux : chaque facette prend la couleur renvoyée par `colorAt(normale)`. */
const paintedBall = (r, colorAt) => {
  const geo = new THREE.IcosahedronGeometry(r, 2).toNonIndexed();
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    n.set(0, 0, 0);
    for (let k = 0; k < 3; k++) n.add(new THREE.Vector3().fromBufferAttribute(pos, i + k));
    c.set(colorAt(n.normalize()));
    for (let k = 0; k < 3; k++) c.toArray(colors, (i + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  mesh.castShadow = true;
  return mesh;
};

// Volley : 3 bandes de panneaux autour de chaque axe (jaune, bleu, blanc).
const volleyColor = (n) => {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  if (ax >= ay && ax >= az) return 0xf7c843;
  if (ay >= az) return 0x2f6fd1;
  return 0xffffff;
};

// Plage : quartiers verticaux de couleurs vives, pôles blancs.
const BEACH = [0xe8453c, 0xffffff, 0x3d8bfd, 0xf7c843, 0x3fbf6f, 0xffffff];
const beachColor = (n) => {
  if (Math.abs(n.y) > 0.88) return 0xffffff;
  const sector = Math.floor(((Math.atan2(n.z, n.x) + Math.PI) / (Math.PI * 2)) * BEACH.length) % BEACH.length;
  return BEACH[sector];
};

const builders = {
  basketball: () =>
    group(
      ball(0.15, 0xe8742c),
      seam(0.15, 0x2b1a10, { rx: HALF_PI }),
      seam(0.15, 0x2b1a10),
      seam(0.15, 0x2b1a10, { ry: HALF_PI }),
    ),
  miniBasketball: () =>
    group(
      ball(0.11, 0xf08a3c),
      seam(0.11, 0x2b1a10, { rx: HALF_PI }),
      seam(0.11, 0x2b1a10),
      seam(0.11, 0x2b1a10, { ry: HALF_PI }),
    ),
  football: () =>
    group(
      ball(0.15, 0xffffff),
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
    group(
      ball(0.085, 0xd7f03a),
      seam(0.085, 0xffffff, { rx: HALF_PI - 0.6 }, 0.008),
      seam(0.085, 0xffffff, { ry: HALF_PI, rx: 0.6 }, 0.008),
    ),
  racket: () =>
    group(
      box(0.26, 0.04, 0.3, 0xe23d4f, { z: -0.08, round: 0.04 }),
      box(0.2, 0.042, 0.24, 0xf4f4f4, { z: -0.08, round: 0.02 }),
      box(0.05, 0.05, 0.22, 0x2b2d42, { z: 0.18 }),
    ),
  volleyball: () => group(paintedBall(0.14, volleyColor)),
  beachBall: () => group(paintedBall(0.16, beachColor), box(0.05, 0.03, 0.05, 0xf7c843, { y: 0.16 })),
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
