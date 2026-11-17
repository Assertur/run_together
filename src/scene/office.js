// Le bureau : sol en damier, murs, fenêtres, bureaux, plantes… tout en blocs.
import * as THREE from 'three';
import { box, cylinder, group, labelTexture, roundRect } from './voxel.js';

export const ROOM = { minX: -7, maxX: 7, minZ: -16, maxZ: 4, height: 4.2 };

const aabb = (cx, cy, cz, w, h, d) => ({
  min: new THREE.Vector3(cx - w / 2, cy - h / 2, cz - d / 2),
  max: new THREE.Vector3(cx + w / 2, cy + h / 2, cz + d / 2),
});

const desk = (x, z, rotY = 0) => {
  const g = group(
    box(1.8, 0.08, 0.9, 0xd9a066, { y: 0.76 }),
    box(0.08, 0.72, 0.8, 0x8a8f99, { x: -0.82, y: 0.36 }),
    box(0.08, 0.72, 0.8, 0x8a8f99, { x: 0.82, y: 0.36 }),
    box(0.06, 0.45, 0.06, 0x3b3f47, { y: 1.02, z: -0.25 }),
    box(0.8, 0.5, 0.06, 0x2f3440, { y: 1.3, z: -0.25 }),
    box(0.72, 0.42, 0.02, 0x6ec6ff, { y: 1.3, z: -0.215, emissive: 0x1a3a55 }),
    box(0.5, 0.03, 0.18, 0xeeeeee, { y: 0.81, z: 0.12 }),
    box(0.1, 0.12, 0.1, 0xff8a65, { x: 0.6, y: 0.86, z: 0.1 }),
    // chaise
    box(0.55, 0.08, 0.55, 0x4a6fa5, { y: 0.48, z: 0.75 }),
    box(0.55, 0.6, 0.08, 0x4a6fa5, { y: 0.82, z: 1.0 }),
    box(0.08, 0.42, 0.08, 0x3b3f47, { y: 0.24, z: 0.75 }),
    box(0.6, 0.05, 0.08, 0x3b3f47, { y: 0.04, z: 0.75 }),
    box(0.08, 0.05, 0.6, 0x3b3f47, { y: 0.04, z: 0.75 }),
  );
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
};

export const plantModel = (scale = 1) => {
  const g = group(
    box(0.5, 0.5, 0.5, 0xd8734a, { y: 0.25 }),
    box(0.56, 0.08, 0.56, 0xe98b61, { y: 0.5 }),
    box(0.3, 0.5, 0.3, 0x3c9d4e, { y: 0.8 }),
    box(0.5, 0.35, 0.5, 0x4cb35f, { y: 1.1 }),
    box(0.3, 0.3, 0.3, 0x5fcf72, { y: 1.4, x: 0.05 }),
    box(0.2, 0.25, 0.2, 0x4cb35f, { y: 0.95, x: 0.3, z: 0.1 }),
    box(0.2, 0.25, 0.2, 0x5fcf72, { y: 0.9, x: -0.28, z: -0.1 }),
  );
  g.scale.setScalar(scale);
  return g;
};

export const cabinetModel = () =>
  group(
    box(0.9, 1.5, 0.6, 0x8d99ae, { y: 0.75 }),
    ...[0.35, 0.75, 1.15].map((y) => box(0.8, 0.32, 0.02, 0xa9b4c6, { y, z: 0.305 })),
    ...[0.35, 0.75, 1.15].map((y) => box(0.24, 0.05, 0.04, 0x3b3f47, { y: y + 0.08, z: 0.33 })),
    box(0.3, 0.2, 0.25, 0xf2c14e, { y: 1.6, x: -0.15 }),
  );

const windowPane = (x, y) =>
  group(
    box(2.2, 1.6, 0.1, 0xffffff, { x, y }),
    box(1.0, 1.4, 0.04, 0xa8dcff, { x: x - 0.53, y, z: 0.05, emissive: 0x3b6f8f }),
    box(1.0, 1.4, 0.04, 0xa8dcff, { x: x + 0.53, y, z: 0.05, emissive: 0x3b6f8f }),
  );

const clock = () => {
  const tex = labelTexture((ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#2f3440';
    ctx.stroke();
    ctx.lineCap = 'round';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2);
    ctx.lineTo(w / 2, 26);
    ctx.moveTo(w / 2, h / 2);
    ctx.lineTo(w / 2 + 40, h / 2 + 10);
    ctx.stroke();
  }, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  m.position.set(0, 3.3, ROOM.minZ + 0.06);
  return m;
};

const poster = (text, color, x, y, z, rotY) => {
  const tex = labelTexture((ctx, w, h) => {
    roundRect(ctx, 0, 0, w, h, 18);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '44px "Lilita One","Arial Black",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    text.split('\n').forEach((line, i, all) => ctx.fillText(line, w / 2, h / 2 + (i - (all.length - 1) / 2) * 52));
  }, 256, 192);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.05), new THREE.MeshBasicMaterial({ map: tex }));
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  return m;
};

export const buildOffice = () => {
  const root = new THREE.Group();
  const colliders = [];

  // Sol en damier
  for (let x = ROOM.minX; x < ROOM.maxX; x += 2) {
    for (let z = ROOM.minZ; z < ROOM.maxZ; z += 2) {
      const even = ((x - ROOM.minX) / 2 + (z - ROOM.minZ) / 2) % 2 === 0;
      root.add(box(2, 0.2, 2, even ? 0xe9dcc3 : 0xdccaa8, { x: x + 1, y: -0.1, z: z + 1, round: 0.01, shadow: false }));
    }
  }
  colliders.push(aabb(0, -0.5, -6, 40, 1, 40));

  // Murs
  const wallColor = 0xf3efe6;
  const w = ROOM.maxX - ROOM.minX;
  const d = ROOM.maxZ - ROOM.minZ;
  root.add(box(w, ROOM.height, 0.3, wallColor, { y: ROOM.height / 2, z: ROOM.minZ - 0.15, round: 0.01, shadow: false }));
  root.add(box(0.3, ROOM.height, d, 0xeae4d6, { x: ROOM.minX - 0.15, y: ROOM.height / 2, z: (ROOM.minZ + ROOM.maxZ) / 2, round: 0.01, shadow: false }));
  root.add(box(0.3, ROOM.height, d, 0xeae4d6, { x: ROOM.maxX + 0.15, y: ROOM.height / 2, z: (ROOM.minZ + ROOM.maxZ) / 2, round: 0.01, shadow: false }));
  // plinthes
  root.add(box(w, 0.2, 0.1, 0x8d6e63, { y: 0.1, z: ROOM.minZ + 0.02, shadow: false }));
  root.add(box(0.1, 0.2, d, 0x8d6e63, { x: ROOM.minX + 0.02, y: 0.1, z: (ROOM.minZ + ROOM.maxZ) / 2, shadow: false }));
  root.add(box(0.1, 0.2, d, 0x8d6e63, { x: ROOM.maxX - 0.02, y: 0.1, z: (ROOM.minZ + ROOM.maxZ) / 2, shadow: false }));
  colliders.push(aabb(0, 2, ROOM.minZ - 0.5, 40, 10, 1));
  colliders.push(aabb(ROOM.minX - 0.5, 2, -6, 1, 10, 40));
  colliders.push(aabb(ROOM.maxX + 0.5, 2, -6, 1, 10, 40));

  // Fenêtres, horloge, affiches
  const windows = new THREE.Group();
  [-4.4, 4.4].forEach((x) => windows.add(windowPane(x, 2.3)));
  windows.position.z = ROOM.minZ + 0.02;
  root.add(windows);
  root.add(clock());
  root.add(poster('TRIONS\nMIEUX !', '#3fbf6f', ROOM.minX + 0.02, 2.4, -9, Math.PI / 2));
  root.add(poster('ZÉRO\nDÉCHET', '#3d8bfd', ROOM.maxX - 0.02, 2.4, -9, -Math.PI / 2));
  // tableau blanc
  root.add(box(0.06, 1.2, 2.4, 0xffffff, { x: ROOM.minX + 0.05, y: 1.9, z: -3.5 }));
  root.add(box(0.07, 0.08, 2.5, 0x9aa3b0, { x: ROOM.minX + 0.06, y: 1.28, z: -3.5 }));

  // Bureaux le long des murs latéraux
  [
    [ROOM.minX + 0.9, -1.5, Math.PI / 2],
    [ROOM.minX + 0.9, -6.5, Math.PI / 2],
    [ROOM.minX + 0.9, -11.5, Math.PI / 2],
    [ROOM.maxX - 0.9, -1.5, -Math.PI / 2],
    [ROOM.maxX - 0.9, -6.5, -Math.PI / 2],
    [ROOM.maxX - 0.9, -11.5, -Math.PI / 2],
  ].forEach(([x, z, r]) => {
    root.add(desk(x, z, r));
    colliders.push(aabb(x, 0.4, z, 0.9, 0.8, 1.8));
  });

  // Plantes dans les coins
  [
    [ROOM.minX + 0.5, ROOM.minZ + 0.5],
    [ROOM.maxX - 0.5, ROOM.minZ + 0.5],
  ].forEach(([x, z]) => {
    const p = plantModel(1.2);
    p.position.set(x, 0, z);
    root.add(p);
  });

  // Fontaine à eau
  const cooler = group(
    box(0.5, 1.0, 0.5, 0xeceff1, { y: 0.5 }),
    box(0.36, 0.45, 0.36, 0x81d4fa, { y: 1.25, opacity: 0.85 }),
    box(0.1, 0.06, 0.08, 0x2196f3, { y: 0.8, z: 0.27 }),
  );
  cooler.position.set(0, 0, ROOM.minZ + 0.5);
  root.add(cooler);

  // Bureau du joueur (premier plan)
  const playerDesk = group(
    box(3, 0.1, 1.2, 0xd9a066, { y: 0.78 }),
    box(0.4, 0.06, 0.3, 0xffffff, { x: -1.0, y: 0.86, z: 0.1 }),
    box(0.25, 0.3, 0.25, 0x3d8bfd, { x: 1.1, y: 0.98 }),
  );
  playerDesk.position.set(0, 0, 1.2);
  root.add(playerDesk);

  // Plafonniers (bandes lumineuses)
  [-3, -9].forEach((z) => root.add(box(4, 0.08, 0.5, 0xffffff, { y: ROOM.height - 0.05, z, emissive: 0xffffff, shadow: false })));

  return { root, colliders };
};

// --- Obstacles de niveau ---------------------------------------------------

export const buildObstacle = ({ kind, x, z }) => {
  if (kind === 'cabinet') {
    const m = cabinetModel();
    m.position.set(x, 0, z);
    return { mesh: m, colliders: [aabb(x, 0.85, z, 0.9, 1.7, 0.6)] };
  }
  const m = plantModel(1.25);
  m.position.set(x, 0, z);
  return { mesh: m, colliders: [aabb(x, 0.4, z, 0.65, 0.8, 0.65), aabb(x, 1.3, z, 0.6, 1.0, 0.6)] };
};

/** Collègue qui traverse la pièce avec son mug. */
export class Colleague {
  constructor(z = -6.8) {
    this.z = z;
    const shirt = 0xff7a59;
    this.legL = box(0.18, 0.7, 0.2, 0x34495e, { x: -0.12, y: 0.35 });
    this.legR = box(0.18, 0.7, 0.2, 0x34495e, { x: 0.12, y: 0.35 });
    this.mesh = group(
      this.legL,
      this.legR,
      box(0.55, 0.7, 0.32, shirt, { y: 1.05 }),
      box(0.16, 0.6, 0.18, shirt, { x: -0.36, y: 1.05 }),
      box(0.16, 0.6, 0.18, shirt, { x: 0.36, y: 1.05 }),
      box(0.4, 0.4, 0.4, 0xf5c9a0, { y: 1.62 }),
      box(0.42, 0.14, 0.42, 0x5d4037, { y: 1.85 }),
      box(0.06, 0.06, 0.02, 0x222222, { x: -0.09, y: 1.65, z: 0.205 }),
      box(0.06, 0.06, 0.02, 0x222222, { x: 0.09, y: 1.65, z: 0.205 }),
      box(0.14, 0.16, 0.14, 0xffffff, { x: 0.36, y: 0.75, z: 0.12 }),
    );
    this.collider = { min: new THREE.Vector3(), max: new THREE.Vector3() };
    this.t = Math.random() * 10;
    this.update(0);
  }

  update(dt) {
    this.t += dt;
    const span = 5.2;
    const x = Math.sin(this.t * 0.45) * span;
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
