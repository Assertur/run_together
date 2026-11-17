// Visée à la souris + jauge de puissance (clic maintenu = la jauge fait des allers-retours).
import * as THREE from 'three';
import { box } from '../scene/voxel.js';
import { predictPath } from './physics.js';

export const HAND = new THREE.Vector3(0, 1.35, 0.4);
const MAX_YAW = THREE.MathUtils.degToRad(38);
const MIN_PITCH = THREE.MathUtils.degToRad(22);
const MAX_PITCH = THREE.MathUtils.degToRad(68);
const MIN_SPEED = 3.5;
const MAX_SPEED = 14.5;
const DOTS = 40;

export class Thrower {
  constructor(scene, canvas) {
    this.canvas = canvas;
    this.yaw = 0;
    this.pitch = THREE.MathUtils.degToRad(45);
    this.power = 0;
    this.charging = false;
    this.chargeTime = 0;
    this.enabled = false;
    this.gaugePeriod = 1.4;
    this.onRelease = null;

    // Flèche de visée faite de petits cubes
    this.arrow = new THREE.Group();
    this.arrowCubes = [];
    for (let i = 0; i < 6; i++) {
      const c = box(0.09, 0.09, 0.09, 0xffffff, { z: -0.3 - i * 0.16, shadow: false });
      this.arrowCubes.push(c);
      this.arrow.add(c);
    }
    this.arrow.add(box(0.2, 0.09, 0.09, 0xffffff, { z: -1.25, shadow: false }));
    this.arrow.position.copy(HAND);
    scene.add(this.arrow);
    this.arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.arrow.traverse((o) => {
      if (o.isMesh) o.material = this.arrowMaterial;
    });

    // Pointillés de trajectoire
    this.dots = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.07, 0.07, 0.07),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
      DOTS,
    );
    this.dots.count = 0;
    this.dots.frustumCulled = false;
    scene.add(this.dots);
    this.dotCount = DOTS;

    canvas.addEventListener('pointermove', (e) => this.aimFromPointer(e));
    canvas.addEventListener('pointerdown', (e) => {
      if (!this.enabled || e.button !== 0) return;
      this.aimFromPointer(e);
      canvas.setPointerCapture?.(e.pointerId);
      this.charging = true;
      this.chargeTime = 0;
    });
    const release = () => {
      if (this.charging) this.release();
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
  }

  aimFromPointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    this.yaw = THREE.MathUtils.clamp(-nx * 1.25, -1, 1) * MAX_YAW;
    const t = THREE.MathUtils.clamp((ny + 0.9) / 1.6, 0, 1); // haut de l'écran = tir en cloche
    this.pitch = THREE.MathUtils.lerp(MAX_PITCH, MIN_PITCH, t);
  }

  configure({ trajectory, gaugePeriod }) {
    this.dotCount = trajectory === 'full' ? DOTS : trajectory === 'short' ? 11 : 0;
    this.gaugePeriod = gaugePeriod;
  }

  setEnabled(on) {
    this.enabled = on;
    this.arrow.visible = on;
    if (!on) {
      this.charging = false;
      this.power = 0;
      this.dots.count = 0;
    }
  }

  velocity(power = this.power, target = new THREE.Vector3()) {
    const speed = MIN_SPEED + power * (MAX_SPEED - MIN_SPEED);
    const cp = Math.cos(this.pitch);
    return target.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp).multiplyScalar(speed);
  }

  release() {
    if (!this.charging) return;
    this.charging = false;
    const v = this.velocity();
    const p = this.power;
    this.setEnabled(false);
    this.onRelease?.(v, p);
  }

  update(dt) {
    if (!this.enabled) return;
    if (this.charging) {
      this.chargeTime += dt;
      const phase = (this.chargeTime / this.gaugePeriod) % 1;
      this.power = phase < 0.5 ? phase * 2 : 2 - phase * 2;
    } else {
      this.power = 0;
    }
    this.arrow.rotation.set(0, 0, 0);
    this.arrow.rotateY(this.yaw);
    this.arrow.rotateX(this.pitch * 0.6);
    const color = new THREE.Color().setHSL(0.33 - this.power * 0.33, 0.85, 0.55);
    this.arrowMaterial.color.copy(this.charging ? color : new THREE.Color(0xffffff));
    this.arrow.scale.setScalar(1 + this.power * 0.4);

    // Trajectoire affichée pour la puissance « moyenne » (ou actuelle si on charge)
    if (this.dotCount > 0) {
      const v = this.velocity(this.charging ? this.power : 0.5);
      const pts = predictPath(HAND, v, this.dotCount);
      const m = new THREE.Matrix4();
      pts.forEach((pt, i) => {
        m.makeTranslation(pt.x, pt.y, pt.z);
        this.dots.setMatrixAt(i, m);
      });
      this.dots.count = pts.length;
      this.dots.instanceMatrix.needsUpdate = true;
    } else {
      this.dots.count = 0;
    }
  }
}
