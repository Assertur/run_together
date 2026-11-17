// Petits utilitaires pour construire des modèles « cubiques » façon Kenney :
// des blocs aux arêtes légèrement arrondies, ombrage plat, couleurs franches.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const geometries = new Map();
const materials = new Map();

export const material = (color, { opacity = 1, emissive = 0 } = {}) => {
  const key = `${color}-${opacity}-${emissive}`;
  if (!materials.has(key)) {
    materials.set(
      key,
      new THREE.MeshLambertMaterial({
        color,
        flatShading: true,
        transparent: opacity < 1,
        opacity,
        emissive,
      }),
    );
  }
  return materials.get(key);
};

const roundedGeometry = (w, h, d, round) => {
  const radius = Math.max(0, Math.min(round, Math.min(w, h, d) / 2 - 0.002));
  const key = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}|${radius.toFixed(3)}`;
  if (!geometries.has(key)) {
    const geo = radius > 0.001 ? new RoundedBoxGeometry(w, h, d, 2, radius) : new THREE.BoxGeometry(w, h, d);
    geometries.set(key, geo);
  }
  return geometries.get(key);
};

const place = (mesh, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true }) => {
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  return mesh;
};

/** Bloc centré en (x, y, z). */
export const box = (w, h, d, color, opts = {}) =>
  place(new THREE.Mesh(roundedGeometry(w, h, d, opts.round ?? 0.03), material(color, opts)), opts);

/** Cylindre à facettes (6–10 côtés) pour garder le style low-poly. */
export const cylinder = (radiusTop, radiusBottom, h, color, opts = {}) => {
  const seg = opts.segments ?? 8;
  const key = `cyl|${radiusTop}|${radiusBottom}|${h}|${seg}`;
  if (!geometries.has(key)) geometries.set(key, new THREE.CylinderGeometry(radiusTop, radiusBottom, h, seg));
  return place(new THREE.Mesh(geometries.get(key), material(color, opts)), opts);
};

export const group = (...children) => {
  const g = new THREE.Group();
  children.forEach((c) => g.add(c));
  return g;
};

/** Texture canvas pour les panneaux (étiquettes de poubelle, affiches…). */
export const labelTexture = (draw, width = 256, height = 128) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

export const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};
