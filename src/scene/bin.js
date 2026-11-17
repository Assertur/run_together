// Poubelle de tri cubique : 4 parois colorées, rebord clair, panneau flottant.
import * as THREE from 'three';
import { BIN_TYPES } from '../config/bins.js';
import { box, cylinder, group, labelTexture, roundRect } from './voxel.js';

export const BIN_HALF = 0.55; // demi-largeur extérieure
export const BIN_HEIGHT = 0.85;
const WALL = 0.08;
const DOLLY_HEIGHT = 0.14;

const signTexture = (type) =>
  labelTexture((ctx, w, h) => {
    const hex = `#${type.color.toString(16).padStart(6, '0')}`;
    roundRect(ctx, 6, 6, w - 12, h - 12, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    roundRect(ctx, 14, 14, w - 28, h - 28, 20);
    ctx.fillStyle = hex;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '48px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    ctx.fillText(type.icon, 58, h / 2 + 2);
    ctx.font = '40px "Lilita One", "Arial Black", sans-serif';
    ctx.fillText(type.label, w / 2 + 34, h / 2 + 2);
  }, 320, 112);

const dolly = () =>
  group(
    box(BIN_HALF * 2 + 0.1, 0.06, BIN_HALF * 2 + 0.1, 0x4a4f5a, { y: 0.09 }),
    ...[
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].map(([sx, sz]) =>
      cylinder(0.05, 0.05, 0.06, 0x222222, {
        x: sx * (BIN_HALF - 0.05),
        z: sz * (BIN_HALF - 0.05),
        y: 0.04,
        rz: Math.PI / 2,
        segments: 6,
      }),
    ),
  );

export class Bin {
  constructor({ type, x, z, move }) {
    this.type = type;
    this.info = BIN_TYPES[type];
    this.base = new THREE.Vector3(x, 0, z);
    this.move = move ?? null;
    this.lift = move ? DOLLY_HEIGHT : 0;
    this.phase = Math.random() * Math.PI * 2;
    this.shake = 0;

    const c = this.info.color;
    const h = BIN_HEIGHT;
    const o = BIN_HALF;
    const y = this.lift + h / 2;
    this.body = group(
      box(o * 2, h, WALL, c, { y, z: o - WALL / 2 }),
      box(o * 2, h, WALL, c, { y, z: -o + WALL / 2 }),
      box(WALL, h, o * 2 - WALL * 2, c, { y, x: o - WALL / 2 }),
      box(WALL, h, o * 2 - WALL * 2, c, { y, x: -o + WALL / 2 }),
      box(o * 2 - WALL * 2, 0.04, o * 2 - WALL * 2, 0x2b2d33, { y: this.lift + 0.04 }),
      // rebord clair
      box(o * 2 + 0.04, 0.07, 0.12, this.info.rim, { y: this.lift + h, z: o - 0.05 }),
      box(o * 2 + 0.04, 0.07, 0.12, this.info.rim, { y: this.lift + h, z: -o + 0.05 }),
      box(0.12, 0.07, o * 2 - 0.1, this.info.rim, { y: this.lift + h, x: o - 0.05 }),
      box(0.12, 0.07, o * 2 - 0.1, this.info.rim, { y: this.lift + h, x: -o + 0.05 }),
      // bande blanche sur la face avant
      box(o * 1.2, 0.18, 0.02, 0xffffff, { y: this.lift + h * 0.55, z: o + 0.005, shadow: false }),
    );

    const sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture(this.info), depthWrite: false }));
    sign.scale.set(1.5, 0.52, 1);
    sign.position.y = this.lift + h + 0.75;
    this.sign = sign;

    this.group = group(this.body, sign);
    if (move) this.group.add(dolly());
    this.group.position.copy(this.base);
    this.colliders = [0, 1, 2, 3].map(() => ({ min: new THREE.Vector3(), max: new THREE.Vector3(), bin: this }));
    this.velocityX = 0;
    this.update(0, 0);
  }

  get top() {
    return this.lift + BIN_HEIGHT;
  }

  get position() {
    return this.group.position;
  }

  update(time, dt) {
    if (this.move) {
      const prev = this.group.position.x;
      this.group.position.x = this.base.x + Math.sin(time * this.move.speed + this.phase) * this.move.amp;
      this.velocityX = dt > 0 ? (this.group.position.x - prev) / dt : 0;
    }
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 3);
      const s = Math.sin(time * 40) * 0.08 * this.shake;
      this.body.rotation.z = s;
      this.body.scale.setScalar(1 + this.shake * 0.08);
    } else {
      this.body.rotation.z = 0;
      this.body.scale.setScalar(1);
    }
    this.sign.position.y = this.lift + BIN_HEIGHT + 0.75 + Math.sin(time * 2 + this.phase) * 0.05;
    this.refreshColliders();
  }

  refreshColliders() {
    const p = this.group.position;
    const o = BIN_HALF;
    const y0 = this.lift;
    const y1 = this.lift + BIN_HEIGHT + 0.035;
    const walls = [
      [-o, o, o - WALL, o],
      [-o, o, -o, -o + WALL],
      [o - WALL, o, -o, o],
      [-o, -o + WALL, -o, o],
    ];
    walls.forEach(([x0, x1, z0, z1], i) => {
      this.colliders[i].min.set(p.x + x0, y0, p.z + z0);
      this.colliders[i].max.set(p.x + x1, y1, p.z + z1);
    });
  }

  /** L'objet est-il dans l'ouverture intérieure de la poubelle ? */
  containsXZ(pos, margin = 0) {
    const inner = BIN_HALF - WALL - margin;
    return Math.abs(pos.x - this.group.position.x) < inner && Math.abs(pos.z - this.group.position.z) < inner;
  }
}
