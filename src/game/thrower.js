// Visée à la souris + jauge de puissance (clic maintenu = la jauge fait des allers-retours).
import * as THREE from 'three';
import { box } from '../scene/voxel.js';
import { AIR_DRAG, GRAVITY, predictPath } from './physics.js';

export const HAND = new THREE.Vector3(0, 1.35, 0.4);
const MAX_YAW = THREE.MathUtils.degToRad(50);
const PITCH = THREE.MathUtils.degToRad(52); // angle de tir fixe : la distance se règle à la puissance
const TARGET_HEIGHT = 0.9; // hauteur visée (rebord des bacs)
const MIN_SPEED = 3.5;
const MAX_SPEED = 14.5;
const DOTS = 40;

export class Thrower {
  constructor(scene, canvas, camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.yaw = 0;
    this.pitch = PITCH;
    this.power = 0;
    this.guidePower = 0.5; // puissance qui ferait arriver l'objet sur le curseur
    this.target = new THREE.Vector3(0, TARGET_HEIGHT, -6);
    this.charging = false;
    this.chargeTime = 0;
    this.enabled = false;
    this.gaugePeriod = 2.6;
    this.onRelease = null;
    this.raycaster = new THREE.Raycaster();
    // Plan horizontal à hauteur des rebords : pointer un bac vise bien son ouverture
    this.aimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -TARGET_HEIGHT);

    // Repère carré sous le curseur, à hauteur des rebords
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    this.marker = new THREE.Group();
    [
      [0.7, 0.08, 0, -0.31],
      [0.7, 0.08, 0, 0.31],
      [0.08, 0.7, -0.31, 0],
      [0.08, 0.7, 0.31, 0],
    ].forEach(([w, d, x, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), markerMat);
      m.position.set(x, 0, z);
      this.marker.add(m);
    });
    this.marker.visible = false;
    scene.add(this.marker);

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

  /** Vise le point (à hauteur des bacs) situé sous le curseur. */
  aimFromPointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.aimPlane, hit)) {
      // Curseur au-dessus de l'horizon : on prend un point lointain dans la même direction
      hit.copy(this.raycaster.ray.direction).setY(0).normalize().multiplyScalar(16).add(this.camera.position);
    }
    const dx = hit.x - HAND.x;
    const dz = hit.z - HAND.z;
    this.yaw = THREE.MathUtils.clamp(Math.atan2(-dx, -dz), -MAX_YAW, MAX_YAW);
    const dist = THREE.MathUtils.clamp(Math.hypot(dx, dz), 2, 16);
    this.target.set(HAND.x - Math.sin(this.yaw) * dist, TARGET_HEIGHT, HAND.z - Math.cos(this.yaw) * dist);
    this.guidePower = this.powerForDistance(dist);
  }

  /** Distance horizontale parcourue avant de redescendre à la hauteur des bacs. */
  static reach(speed) {
    let x = 0;
    let y = HAND.y;
    let vx = Math.cos(PITCH) * speed;
    let vy = Math.sin(PITCH) * speed;
    const h = 1 / 120;
    for (let i = 0; i < 600; i++) {
      vy -= GRAVITY * h;
      vx *= 1 - AIR_DRAG * h;
      vy *= 1 - AIR_DRAG * h;
      x += vx * h;
      y += vy * h;
      if (vy < 0 && y <= TARGET_HEIGHT) break;
    }
    return x;
  }

  powerForDistance(dist) {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (Thrower.reach(MIN_SPEED + mid * (MAX_SPEED - MIN_SPEED)) < dist) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  configure({ trajectory, gaugePeriod }) {
    this.dotCount = trajectory === 'full' ? DOTS : trajectory === 'short' ? 11 : 0;
    this.gaugePeriod = gaugePeriod;
  }

  setEnabled(on) {
    this.enabled = on;
    this.arrow.visible = on;
    this.marker.visible = on;
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

    this.marker.position.copy(this.target);
    this.marker.rotation.y = this.yaw;

    // Trajectoire : vers le curseur au repos, puissance actuelle pendant la charge
    if (this.dotCount > 0) {
      const v = this.velocity(this.charging ? this.power : this.guidePower);
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
