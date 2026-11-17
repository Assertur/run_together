// Physique maison très simple : une sphère (l'objet lancé) contre des boîtes alignées (AABB).
import * as THREE from 'three';
import { BIN_HALF } from '../scene/bin.js';

export const GRAVITY = 9.8;
export const AIR_DRAG = 0.08;
const SUBSTEP = 1 / 240;

const closest = new THREE.Vector3();
const normal = new THREE.Vector3();

/** Collision sphère / AABB. Renvoie true si contact (et corrige position + vitesse). */
export const resolveSphereBox = (body, box) => {
  const r = body.radius;
  const p = body.pos;
  if (p.x < box.min.x - r || p.x > box.max.x + r) return false;
  if (p.y < box.min.y - r || p.y > box.max.y + r) return false;
  if (p.z < box.min.z - r || p.z > box.max.z + r) return false;

  closest.set(
    THREE.MathUtils.clamp(p.x, box.min.x, box.max.x),
    THREE.MathUtils.clamp(p.y, box.min.y, box.max.y),
    THREE.MathUtils.clamp(p.z, box.min.z, box.max.z),
  );
  normal.subVectors(p, closest);
  const dist = normal.length();
  if (dist >= r) return false;

  if (dist > 1e-6) {
    normal.divideScalar(dist);
  } else {
    // Centre à l'intérieur de la boîte : on sort par la face la plus proche.
    const pen = [
      [p.x - box.min.x, -1, 0, 0],
      [box.max.x - p.x, 1, 0, 0],
      [p.y - box.min.y, 0, -1, 0],
      [box.max.y - p.y, 0, 1, 0],
      [p.z - box.min.z, 0, 0, -1],
      [box.max.z - p.z, 0, 0, 1],
    ].sort((a, b) => a[0] - b[0])[0];
    normal.set(pen[1], pen[2], pen[3]);
    closest.copy(p).addScaledVector(normal, pen[0]);
  }

  p.copy(closest).addScaledVector(normal, r + 1e-4);
  const vn = body.vel.dot(normal);
  if (vn < 0) {
    // Les parois des bacs amortissent davantage : la balle ressort moins.
    const bounce = box.bin ? body.bounce * 0.5 : body.bounce;
    body.vel.addScaledVector(normal, -(1 + bounce) * vn);
    // frottement tangentiel (plus fort au sol pour que la balle s'arrête vite)
    const tangential = body.vel.clone().addScaledVector(normal, -body.vel.dot(normal));
    body.vel.addScaledVector(tangential, normal.y > 0.7 ? -0.35 : -0.18);
  }
  if (normal.y > 0.7) body.grounded = true;
  return true;
};

const ASSIST_RANGE = BIN_HALF + 0.45; // rayon horizontal de l'aimant autour d'un bac
const ASSIST_HEIGHT = 1.8; // hauteur au-dessus du rebord où l'aimant agit
const ASSIST_STRENGTH = 7; // m/s²

/**
 * Aide à la visée : une balle qui redescend près d'un bac est attirée vers son centre.
 */
export const applyAssist = (body, bins, h) => {
  if (body.vel.y >= 0) return;
  for (const bin of bins) {
    const above = body.pos.y - bin.top;
    if (above < -0.05 || above > ASSIST_HEIGHT) continue;
    const dx = bin.position.x - body.pos.x;
    const dz = bin.position.z - body.pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist > ASSIST_RANGE || dist < 1e-3) continue;
    const strength = ASSIST_STRENGTH * (1 - (dist / ASSIST_RANGE) * 0.5);
    body.vel.x += (dx / dist) * strength * h;
    body.vel.z += (dz / dist) * strength * h;
    return;
  }
};

/**
 * Avance la simulation de `dt` secondes. `onSubstep(body, h)` est appelé après chaque sous-pas
 * (aide à la visée, détection d'entrée dans les bacs) et peut renvoyer true pour arrêter.
 */
export const stepBody = (body, dt, colliders, onSubstep) => {
  let remaining = dt;
  while (remaining > 1e-6) {
    const h = Math.min(SUBSTEP, remaining);
    remaining -= h;
    body.grounded = false;
    body.vel.y -= GRAVITY * h;
    body.vel.multiplyScalar(1 - AIR_DRAG * h);
    body.pos.addScaledVector(body.vel, h);
    for (const c of colliders) {
      if (resolveSphereBox(body, c) && c.bin) body.touchedRim = true;
    }
    if (onSubstep && onSubstep(body, h)) return true;
  }
  return false;
};

/** Trajectoire prédite (sans collisions) pour l'aide à la visée. */
export const predictPath = (origin, velocity, count, dt = 0.045) => {
  const pts = [];
  const p = origin.clone();
  const v = velocity.clone();
  for (let i = 0; i < count; i++) {
    for (let k = 0; k < 4; k++) {
      const h = dt / 4;
      v.y -= GRAVITY * h;
      v.multiplyScalar(1 - AIR_DRAG * h);
      p.addScaledVector(v, h);
    }
    if (p.y < 0) break;
    pts.push(p.clone());
  }
  return pts;
};
