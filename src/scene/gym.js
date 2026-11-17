// Le gymnase : parquet, lignes de terrain, gradins, espaliers, paniers… tout en blocs.
import * as THREE from 'three';
import { box, cylinder, group, labelTexture, roundRect } from './voxel.js';

export const ROOM = { minX: -7, maxX: 7, minZ: -16, maxZ: 4, height: 5 };

const aabb = (cx, cy, cz, w, h, d) => ({
  min: new THREE.Vector3(cx - w / 2, cy - h / 2, cz - d / 2),
  max: new THREE.Vector3(cx + w / 2, cy + h / 2, cz + d / 2),
});

const LINE = 0xffffff;
const line = (w, d, x, z, color = LINE) => box(w, 0.012, d, color, { x, y: 0.006, z, round: 0, shadow: false });

// Lignes peintes du terrain
const courtLines = () => {
  const g = new THREE.Group();
  const cz = -6;
  g.add(line(12, 0.08, 0, cz)); // ligne médiane
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const seg = line(0.32, 0.08, Math.cos(a) * 1.6, cz + Math.sin(a) * 1.6);
    seg.rotation.y = -a + Math.PI / 2;
    g.add(seg);
  }
  // raquette au fond
  g.add(box(3.6, 0.01, 4.2, 0xd96c3b, { y: 0.004, z: ROOM.minZ + 2.1, round: 0, shadow: false }));
  g.add(line(3.6, 0.08, 0, ROOM.minZ + 4.2));
  g.add(line(0.08, 4.2, -1.8, ROOM.minZ + 2.1));
  g.add(line(0.08, 4.2, 1.8, ROOM.minZ + 2.1));
  // lignes de touche
  g.add(line(0.08, 19, ROOM.minX + 1.6, -6, 0x3d8bfd));
  g.add(line(0.08, 19, ROOM.maxX - 1.6, -6, 0x3d8bfd));
  return g;
};

const hoop = () =>
  group(
    box(0.12, 1.1, 1.8, 0xffffff, { y: 3.2 }),
    box(0.13, 0.5, 0.6, 0xe8453c, { y: 3.0 }),
    box(0.13, 0.4, 0.4, 0xffffff, { y: 3.0 }),
    box(0.6, 0.05, 0.06, 0xf2802f, { x: 0.36, y: 2.75, z: 0.25 }),
    box(0.6, 0.05, 0.06, 0xf2802f, { x: 0.36, y: 2.75, z: -0.25 }),
    box(0.06, 0.05, 0.56, 0xf2802f, { x: 0.65, y: 2.75 }),
    box(0.4, 0.3, 0.4, 0xffffff, { x: 0.38, y: 2.58, opacity: 0.55, shadow: false }),
  );

const bleachers = () => {
  const g = new THREE.Group();
  const colors = [0x3d8bfd, 0xf7c843, 0xe8453c];
  for (let i = 0; i < 3; i++) {
    g.add(box(0.6, 0.45 * (i + 1), 8, 0x8d99ae, { x: (2 - i) * 0.6, y: (0.45 * (i + 1)) / 2 }));
    g.add(box(0.62, 0.08, 8, colors[i], { x: (2 - i) * 0.6, y: 0.45 * (i + 1) + 0.04 }));
  }
  return g;
};

const wallBars = () => {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    const z = k * 0.9;
    g.add(box(0.08, 3, 0.08, 0xc8955a, { y: 1.5, z: z - 0.4 }));
    g.add(box(0.08, 3, 0.08, 0xc8955a, { y: 1.5, z: z + 0.4 }));
    for (let i = 0; i < 9; i++) g.add(box(0.06, 0.06, 0.8, 0xe0b27a, { y: 0.3 + i * 0.32, z, round: 0.02 }));
  }
  return g;
};

const rope = () =>
  group(box(0.08, 3.6, 0.08, 0xd9b77e, { y: 3.2, round: 0.03 }), box(0.14, 0.18, 0.14, 0xb8925a, { y: 1.45 }));

const bench = () =>
  group(
    box(0.4, 0.06, 3, 0x5aa0e6, { y: 0.45 }),
    box(0.3, 0.42, 0.08, 0x8d99ae, { y: 0.21, z: -1.3 }),
    box(0.3, 0.42, 0.08, 0x8d99ae, { y: 0.21, z: 1.3 }),
  );

const scoreboard = () => {
  const tex = labelTexture((ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 16);
    ctx.fillStyle = '#1d2030';
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd84d';
    ctx.font = '30px "Lilita One","Arial Black",sans-serif';
    ctx.fillText('LOCAUX     VISITEURS', w / 2, 34);
    ctx.fillStyle = '#ff5a4f';
    ctx.font = '68px "Lilita One","Arial Black",sans-serif';
    ctx.fillText('12', w * 0.28, 100);
    ctx.fillText('09', w * 0.72, 100);
    ctx.fillStyle = '#7dff9e';
    ctx.font = '34px "Lilita One","Arial Black",sans-serif';
    ctx.fillText('05:00', w / 2, 100);
  }, 384, 144);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.05), new THREE.MeshBasicMaterial({ map: tex }));
  m.position.set(0, 3.9, ROOM.minZ + 0.06);
  return m;
};

const banner = (text, color, x, y, z, rotY) => {
  const tex = labelTexture((ctx, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px "Lilita One","Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 2);
  }, 512, 96);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ map: tex }));
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  return m;
};

export const buildGym = () => {
  const root = new THREE.Group();
  const colliders = [];

  // Parquet en lattes
  const woods = [0xe8c48f, 0xdeb57c, 0xe3bd86];
  let k = 0;
  for (let x = ROOM.minX; x < ROOM.maxX; x += 1) {
    root.add(box(1, 0.2, ROOM.maxZ - ROOM.minZ, woods[k++ % 3], {
      x: x + 0.5, y: -0.1, z: (ROOM.minZ + ROOM.maxZ) / 2, round: 0.01, shadow: false,
    }));
  }
  root.add(courtLines());
  colliders.push(aabb(0, -0.5, -6, 40, 1, 40));

  // Murs : soubassement bleu, haut crème
  const w = ROOM.maxX - ROOM.minX;
  const d = ROOM.maxZ - ROOM.minZ;
  const midZ = (ROOM.minZ + ROOM.maxZ) / 2;
  const wall = (cx, cz, ww, dd) => {
    root.add(box(ww, 1.6, dd, 0x3b6fc4, { x: cx, y: 0.8, z: cz, round: 0.01, shadow: false }));
    root.add(box(ww, ROOM.height - 1.6, dd, 0xf3efe6, { x: cx, y: 1.6 + (ROOM.height - 1.6) / 2, z: cz, round: 0.01, shadow: false }));
    root.add(box(ww + 0.02, 0.12, dd + 0.02, 0xf7c843, { x: cx, y: 1.62, z: cz, round: 0.01, shadow: false }));
  };
  wall(0, ROOM.minZ - 0.15, w, 0.3);
  wall(ROOM.minX - 0.15, midZ, 0.3, d);
  wall(ROOM.maxX + 0.15, midZ, 0.3, d);
  colliders.push(aabb(0, 2, ROOM.minZ - 0.5, 40, 10, 1));
  colliders.push(aabb(ROOM.minX - 0.5, 2, -6, 1, 10, 40));
  colliders.push(aabb(ROOM.maxX + 0.5, 2, -6, 1, 10, 40));

  // Fenêtres hautes
  for (let x = -5.25; x <= 5.25; x += 2.1) {
    if (Math.abs(x) < 2) continue;
    root.add(box(1.6, 0.9, 0.1, 0xffffff, { x, y: 4.2, z: ROOM.minZ + 0.02 }));
    root.add(box(1.4, 0.75, 0.04, 0xa8dcff, { x, y: 4.2, z: ROOM.minZ + 0.08, emissive: 0x3b6f8f }));
  }
  root.add(scoreboard());
  root.add(banner('ALLEZ LES BLEUS !', '#3d8bfd', ROOM.minX + 0.02, 2.6, -11, Math.PI / 2));
  root.add(banner('RANGE TON MATÉRIEL', '#e8453c', ROOM.maxX - 0.02, 2.6, -3, -Math.PI / 2));

  // Paniers de basket sur les murs latéraux
  const leftHoop = hoop();
  leftHoop.position.set(ROOM.minX + 0.06, 0, -9);
  root.add(leftHoop);
  const rightHoop = hoop();
  rightHoop.rotation.y = Math.PI;
  rightHoop.position.set(ROOM.maxX - 0.06, 0, -9);
  root.add(rightHoop);

  // Gradins à gauche, espaliers + bancs à droite
  const b = bleachers();
  b.position.set(ROOM.minX + 0.3, 0, -3);
  root.add(b);
  colliders.push(aabb(ROOM.minX + 0.9, 0.7, -3, 1.8, 1.4, 8));

  const bars = wallBars();
  bars.position.set(ROOM.maxX - 0.1, 0, -14);
  root.add(bars);
  colliders.push(aabb(ROOM.maxX - 0.15, 1.5, -12.65, 0.3, 3, 3.6));

  [-4.2, -12].forEach((z) => {
    const be = bench();
    be.position.set(ROOM.maxX - 0.6, 0, z + 1.5);
    root.add(be);
    colliders.push(aabb(ROOM.maxX - 0.6, 0.25, z + 1.5, 0.4, 0.5, 3));
  });
  [-1.2, -0.6].forEach((dx) => {
    const r = rope();
    r.position.set(ROOM.minX + 1.4 + dx, 0, -13.5);
    root.add(r);
  });

  // Chariot à ballons du joueur (premier plan)
  const cart = group(
    box(2.6, 0.08, 1.0, 0x8d99ae, { y: 0.7 }),
    box(2.6, 0.5, 0.06, 0x5c6b80, { y: 0.95, z: 0.47 }),
    box(2.6, 0.5, 0.06, 0x5c6b80, { y: 0.95, z: -0.47 }),
    box(0.3, 0.3, 0.3, 0xe8742c, { x: -0.9, y: 0.88, round: 0.12 }),
    box(0.28, 0.28, 0.28, 0xffffff, { x: 0.9, y: 0.88, round: 0.12 }),
    box(0.26, 0.26, 0.26, 0x3d8bfd, { x: 1.1, y: 0.88, z: 0.2, round: 0.12 }),
  );
  cart.position.set(0, 0, 1.25);
  root.add(cart);

  // Projecteurs
  [-2, -8, -13].forEach((z) =>
    [-3, 3].forEach((x) => root.add(box(1.4, 0.12, 0.6, 0xffffff, { x, y: ROOM.height - 0.06, z, emissive: 0xffffff, shadow: false }))),
  );

  return { root, colliders };
};

// --- Obstacles de niveau ---------------------------------------------------

const vaultModel = () =>
  group(
    ...[0, 1, 2, 3].map((i) => box(1.2 - i * 0.06, 0.28, 0.7, i % 2 ? 0xc8955a : 0xb07d48, { y: 0.14 + i * 0.28 })),
    box(1.0, 0.16, 0.66, 0xf2ead8, { y: 1.2 }),
  );

const matsModel = () =>
  group(
    ...[0, 1, 2, 3, 4].map((i) =>
      box(1.3, 0.22, 0.9, [0x3d8bfd, 0x2f6fd1][i % 2], { y: 0.11 + i * 0.22, round: 0.06, rz: (i % 2 ? 0.02 : -0.02) }),
    ),
  );

const hurdleModel = () =>
  group(
    box(0.08, 1.0, 0.08, 0xffffff, { x: -0.6, y: 0.5 }),
    box(0.08, 1.0, 0.08, 0xffffff, { x: 0.6, y: 0.5 }),
    box(1.28, 0.16, 0.06, 0xe8453c, { y: 0.92 }),
    box(1.28, 0.06, 0.06, 0xffffff, { y: 0.98 }),
    cylinder(0.04, 0.16, 0.4, 0xff8c2e, { x: -1.0, y: 0.2, segments: 6 }),
    cylinder(0.04, 0.16, 0.4, 0xff8c2e, { x: 1.0, y: 0.2, segments: 6 }),
  );

export const buildObstacle = ({ kind, x, z }) => {
  if (kind === 'vault') {
    const m = vaultModel();
    m.position.set(x, 0, z);
    return { mesh: m, colliders: [aabb(x, 0.64, z, 1.2, 1.28, 0.7)] };
  }
  if (kind === 'mat') {
    const m = matsModel();
    m.position.set(x, 0, z);
    return { mesh: m, colliders: [aabb(x, 0.55, z, 1.3, 1.1, 0.9)] };
  }
  const m = hurdleModel();
  m.position.set(x, 0, z);
  return { mesh: m, colliders: [aabb(x, 0.92, z, 1.3, 0.2, 0.1), aabb(x - 0.6, 0.5, z, 0.1, 1, 0.1), aabb(x + 0.6, 0.5, z, 0.1, 1, 0.1)] };
};

/** L'entraîneur qui traverse le gymnase, sifflet au cou. */
export class Coach {
  constructor(z = -6.6) {
    this.z = z;
    const suit = 0x2f6fd1;
    this.legL = box(0.18, 0.7, 0.2, 0x1d2a4a, { x: -0.12, y: 0.35 });
    this.legR = box(0.18, 0.7, 0.2, 0x1d2a4a, { x: 0.12, y: 0.35 });
    this.mesh = group(
      this.legL,
      this.legR,
      box(0.55, 0.7, 0.32, suit, { y: 1.05 }),
      box(0.06, 0.66, 0.33, 0xffffff, { x: 0.0, y: 1.05 }),
      box(0.16, 0.6, 0.18, suit, { x: -0.36, y: 1.05 }),
      box(0.16, 0.6, 0.18, suit, { x: 0.36, y: 1.05 }),
      box(0.4, 0.4, 0.4, 0xf5c9a0, { y: 1.62 }),
      box(0.44, 0.12, 0.44, 0xe8453c, { y: 1.86 }),
      box(0.3, 0.05, 0.2, 0xe8453c, { y: 1.82, z: 0.28 }),
      box(0.06, 0.06, 0.02, 0x222222, { x: -0.09, y: 1.65, z: 0.205 }),
      box(0.06, 0.06, 0.02, 0x222222, { x: 0.09, y: 1.65, z: 0.205 }),
      box(0.08, 0.06, 0.08, 0xc0c0c0, { y: 1.2, z: 0.18 }),
    );
    this.collider = { min: new THREE.Vector3(), max: new THREE.Vector3() };
    this.t = Math.random() * 10;
    this.update(0);
  }

  update(dt) {
    this.t += dt;
    const x = Math.sin(this.t * 0.45) * 5;
    const dir = Math.cos(this.t * 0.45) >= 0 ? 1 : -1;
    this.mesh.position.set(x, Math.abs(Math.sin(this.t * 6)) * 0.04, this.z);
    this.mesh.rotation.y = (dir * Math.PI) / 2;
    const swing = Math.sin(this.t * 6) * 0.4;
    this.legL.rotation.x = swing;
    this.legR.rotation.x = -swing;
    this.collider.min.set(x - 0.35, 0, this.z - 0.3);
    this.collider.max.set(x + 0.35, 2, this.z + 0.3);
  }
}
