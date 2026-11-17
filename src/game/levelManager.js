// Charge un niveau dans la scène : poubelles, obstacles, collègue, vent, file d'objets.
import * as THREE from 'three';
import { ITEMS, itemsForBins } from '../config/items.js';
import { ITEMS_PER_LEVEL } from '../config/levels.js';
import { Bin } from '../scene/bin.js';
import { Colleague, buildObstacle } from '../scene/office.js';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const randomWind = ({ min, max }) => {
  const w = THREE.MathUtils.randFloat(min, max);
  // évite un vent quasi nul quand le niveau en prévoit un
  const floor = Math.max(Math.abs(min), Math.abs(max)) * 0.35;
  return Math.abs(w) < floor ? Math.sign(w || 1) * floor : w;
};

export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.bins = [];
    this.colliders = [];
    this.colleague = null;
    this.wind = 0;
  }

  load(level) {
    this.clear();
    this.level = level;
    this.bins = level.bins.map((b) => new Bin(b));
    this.bins.forEach((b) => this.root.add(b.group));
    (level.obstacles ?? []).forEach((o) => {
      const { mesh, colliders } = buildObstacle(o);
      this.root.add(mesh);
      this.colliders.push(...colliders);
    });
    if (level.colleague) {
      this.colleague = new Colleague(-6.6);
      this.root.add(this.colleague.mesh);
    }
    this.wind = level.wind ? randomWind(level.wind) : 0;
    this.queue = this.buildQueue(level);
  }

  /** 5 objets : au moins un par poubelle présente, plus d'objets « pièges » si trickyBoost. */
  buildQueue(level) {
    const binIds = [...new Set(level.bins.map((b) => b.type))];
    const pool = itemsForBins(binIds);
    const picks = shuffle(binIds).map((id) => shuffle(pool.filter((it) => it.bin === id))[0]);
    if (level.trickyBoost) picks.push(shuffle(ITEMS.filter((it) => it.tricky))[0]);
    while (picks.length < ITEMS_PER_LEVEL) picks.push(pool[Math.floor(Math.random() * pool.length)]);
    return shuffle(picks.slice(0, ITEMS_PER_LEVEL));
  }

  nextThrowWind() {
    if (this.level?.wind?.variable) this.wind = randomWind(this.level.wind);
    return this.wind;
  }

  /** Tous les colliders dynamiques du niveau (obstacles + parois des poubelles + collègue). */
  allColliders() {
    const list = [...this.colliders];
    this.bins.forEach((b) => list.push(...b.colliders));
    if (this.colleague) list.push(this.colleague.collider);
    return list;
  }

  update(time, dt) {
    this.bins.forEach((b) => b.update(time, dt));
    this.colleague?.update(dt);
  }

  clear() {
    this.root.clear();
    this.bins = [];
    this.colliders = [];
    this.colleague = null;
  }
}
