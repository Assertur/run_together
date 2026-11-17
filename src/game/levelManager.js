// Charge un niveau dans la scène : bacs, obstacles, entraîneur, file d'objets.
import * as THREE from 'three';
import { itemsForBins } from '../config/items.js';
import { ITEMS_PER_LEVEL } from '../config/levels.js';
import { Bin } from '../scene/bin.js';
import { Coach, buildObstacle } from '../scene/gym.js';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.bins = [];
    this.colliders = [];
    this.coach = null;
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
    if (level.coach) {
      this.coach = new Coach(-6.6);
      this.root.add(this.coach.mesh);
    }
    this.queue = this.buildQueue(level);
  }

  /** 5 objets : au moins un par bac présent, le reste tiré au hasard. */
  buildQueue(level) {
    const binIds = [...new Set(level.bins.map((b) => b.type))];
    const pool = itemsForBins(binIds);
    const picks = shuffle(binIds).map((id) => shuffle(pool.filter((it) => it.bin === id))[0]);
    while (picks.length < ITEMS_PER_LEVEL) picks.push(pool[Math.floor(Math.random() * pool.length)]);
    return shuffle(picks.slice(0, ITEMS_PER_LEVEL));
  }

  /** Tous les colliders dynamiques du niveau (obstacles + parois des bacs + entraîneur). */
  allColliders() {
    const list = [...this.colliders];
    this.bins.forEach((b) => list.push(...b.colliders));
    if (this.coach) list.push(this.coach.collider);
    return list;
  }

  update(time, dt) {
    this.bins.forEach((b) => b.update(time, dt));
    this.coach?.update(dt);
  }

  clear() {
    this.root.clear();
    this.bins = [];
    this.colliders = [];
    this.coach = null;
  }
}
