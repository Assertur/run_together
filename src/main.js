import * as THREE from 'three';
import './style.css';
import { ITEMS_PER_LEVEL, LEVELS } from './config/levels.js';
import { sfx } from './audio.js';
import { LevelManager } from './game/levelManager.js';
import { applyAssist, stepBody } from './game/physics.js';
import { ScoreKeeper, comboMultiplier } from './game/scoring.js';
import { HAND, Thrower } from './game/thrower.js';
import { buildItemModel, ITEM_RADIUS } from './scene/itemModels.js';
import { ROOM, buildGym } from './scene/gym.js';
import { binName, hud } from './ui/hud.js';
import { screens } from './ui/screens.js';

// --- Rendu -----------------------------------------------------------------
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfe3f5);
scene.fog = new THREE.Fog(0xcfe3f5, 24, 42);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
const CAMERA_POS = new THREE.Vector3(0, 3.1, 3.7);
const CAMERA_LOOK = new THREE.Vector3(0, 0.4, -6.5);
camera.position.copy(CAMERA_POS);
const lookAt = CAMERA_LOOK.clone();
camera.lookAt(lookAt);

scene.add(new THREE.HemisphereLight(0xffffff, 0xc9b38f, 1.6));
const sun = new THREE.DirectionalLight(0xfff4e0, 1.9);
sun.position.set(5, 11, 4);
sun.target.position.set(0, 0, -6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 12, bottom: -12, near: 1, far: 40 });
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.02;
scene.add(sun, sun.target);

const gym = buildGym();
scene.add(gym.root);

const resize = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // Sur écran étroit (portrait), on élargit le champ pour garder tous les bacs visibles
  camera.fov = w / h < 1 ? 72 : 55;
  camera.updateProjectionMatrix();
};
window.addEventListener('resize', resize);
resize();

// --- Confettis cubiques -------------------------------------------------------
const confetti = [];
const confettiGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
const spawnConfetti = (pos, color) => {
  const colors = [color, 0xffffff, 0xffd84d, 0xff7a59];
  for (let i = 0; i < 36; i++) {
    const m = new THREE.Mesh(confettiGeo, new THREE.MeshLambertMaterial({ color: colors[i % colors.length], transparent: true }));
    m.position.copy(pos);
    scene.add(m);
    confetti.push({
      mesh: m,
      vel: new THREE.Vector3((Math.random() - 0.5) * 4, 3 + Math.random() * 3.5, (Math.random() - 0.5) * 4),
      spin: new THREE.Vector3(Math.random() * 10, Math.random() * 10, 0),
      life: 1.2 + Math.random() * 0.4,
    });
  }
};
const updateConfetti = (dt) => {
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.life -= dt;
    c.vel.y -= 9.8 * dt;
    c.mesh.position.addScaledVector(c.vel, dt);
    c.mesh.rotation.x += c.spin.x * dt;
    c.mesh.rotation.y += c.spin.y * dt;
    c.mesh.material.opacity = Math.min(1, c.life * 2);
    if (c.life <= 0 || c.mesh.position.y < 0) {
      scene.remove(c.mesh);
      c.mesh.material.dispose();
      confetti.splice(i, 1);
    }
  }
};

// --- Jeu -------------------------------------------------------------------------
const levels = new LevelManager(scene);
const score = new ScoreKeeper();
const thrower = new Thrower(scene, canvas, camera);

const BEST_KEY = 'gym-express-best';
const loadBest = () => {
  try {
    const v = localStorage.getItem(BEST_KEY);
    return v == null ? null : Number(v);
  } catch {
    return null;
  }
};
const saveBest = (v) => {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* stockage indisponible : on ignore */
  }
};

const game = {
  state: 'title', // title | intro | aiming | flying | result | recap | end
  levelIndex: 0,
  itemIndex: 0,
  item: null,
  model: null,
  body: null,
  timer: 0,
  throwTimeLeft: 0,
  elapsed: 0,
  results: [],
  leftovers: [],
  lastTick: 0,
};

const level = () => LEVELS[game.levelIndex];

const toScreen = (pos) => {
  const v = pos.clone().project(camera);
  return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight };
};

const refreshScore = () => hud.setScore(score.total, score.streak, comboMultiplier(score.streak));

const clearLeftovers = () => {
  game.leftovers.forEach((m) => m.parent?.remove(m));
  game.leftovers = [];
};

const startGame = () => {
  sfx.unlock();
  score.reset();
  game.levelIndex = 0;
  game.elapsed = 0;
  screens.hideAll();
  hud.show(true);
  hud.setHint('🖱️ Visez avec la souris · maintenez le clic pour charger · relâchez pour lancer');
  refreshScore();
  startLevel();
};

const startLevel = () => {
  const lvl = level();
  clearLeftovers();
  levels.load(lvl);
  score.startLevel(game.levelIndex, lvl.name);
  thrower.configure({ trajectory: lvl.trajectory, gaugePeriod: game.levelIndex >= 5 ? 2.2 : 2.6 });
  game.itemIndex = 0;
  game.results = [];
  hud.setLevel(game.levelIndex, LEVELS.length, lvl.name);
  hud.setThrows(ITEMS_PER_LEVEL, 0, game.results);
  hud.setTimer(lvl.throwTime, lvl.throwTime);
  hud.setItem(null);
  hud.banner(`Niveau ${game.levelIndex + 1}`, `${lvl.name} · ${lvl.throwTime} s par lancer`);
  sfx.level();
  game.state = 'intro';
  game.timer = 1.5;
};

const nextItem = () => {
  if (game.itemIndex >= ITEMS_PER_LEVEL) {
    endLevel();
    return;
  }
  if (game.model && !game.leftovers.includes(game.model)) scene.remove(game.model);
  game.item = levels.queue[game.itemIndex];
  game.model = buildItemModel(game.item.shape);
  game.model.position.copy(HAND);
  scene.add(game.model);
  game.throwTimeLeft = level().throwTime;
  game.lastTick = Math.ceil(game.throwTimeLeft);
  hud.setItem(game.item);
  hud.setThrows(ITEMS_PER_LEVEL, game.itemIndex, game.results);
  thrower.setEnabled(true);
  game.state = 'aiming';
};

const launchBody = (velocity, dropped = false) => {
  game.body = {
    pos: HAND.clone(),
    vel: velocity,
    dropped,
    radius: ITEM_RADIUS,
    bounce: game.item.bounce,
    touchedRim: false,
    grounded: false,
    restTime: 0,
    flightTime: 0,
    spin: new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10),
    inBin: null,
  };
  hud.setPower(0);
  game.state = 'flying';
};

thrower.onRelease = (velocity) => {
  if (game.state !== 'aiming') return;
  sfx.throw();
  launchBody(velocity);
};

const resolveThrow = (kind, bin = null) => {
  const pos = game.body ? game.body.pos.clone() : HAND.clone();
  const screen = toScreen(bin ? bin.position.clone().setY(bin.top + 0.6) : pos.clone().setY(pos.y + 0.4));
  if (kind === 'hit') {
    const distance = Math.hypot(bin.position.x - HAND.x, bin.position.z - HAND.z);
    const r = score.correct({ distance, swish: !game.body.touchedRim });
    const sub = [r.swish ? 'Swish ! +25' : 'Bien rangé !', r.mult > 1 ? `Combo ×${r.mult}` : ''].filter(Boolean).join(' · ');
    hud.popup(`+${r.points}`, 'good', screen.x, screen.y, sub);
    spawnConfetti(bin.position.clone().setY(bin.top + 0.2), bin.info.color);
    bin.shake = 1;
    sfx.success();
    game.results.push('hit');
  } else if (kind === 'wrong') {
    const r = score.wrong();
    hud.popup(`${r.points}`, 'bad', screen.x, screen.y, `Mauvais bac ! ${game.item.name} → ${binName(game.item.bin)}`);
    bin.shake = 0.6;
    sfx.wrong();
    game.results.push('wrong');
  } else {
    const r = score.miss();
    const label = kind === 'timeout' ? 'Trop lent !' : 'Raté !';
    hud.popup(`${r.points}`, 'meh', screen.x, screen.y, `${label} (${binName(game.item.bin)})`);
    sfx.miss();
    game.results.push('miss');
  }
  if (game.model && kind !== 'hit' && kind !== 'wrong') game.leftovers.push(game.model);
  refreshScore();
  hud.setThrows(ITEMS_PER_LEVEL, game.itemIndex + 1, game.results);
  game.state = 'result';
  game.timer = kind === 'timeout' ? 0.9 : 1.1;
};

const endLevel = () => {
  thrower.setEnabled(false);
  const stats = score.levels[game.levelIndex];
  const next = LEVELS[game.levelIndex + 1];
  const duration = 2.6;
  screens.recap(game.levelIndex, LEVELS.length, stats, next?.name, duration);
  game.state = 'recap';
  game.timer = duration;
};

const endGame = () => {
  game.state = 'end';
  thrower.setEnabled(false);
  hud.show(false);
  const total = score.total;
  const prev = loadBest();
  const isRecord = prev == null || total > prev;
  if (isRecord) saveBest(total);
  screens.end({
    levels: score.levels,
    total,
    accuracy: score.accuracy,
    bestCombo: score.bestCombo,
    elapsed: game.elapsed,
    best: isRecord ? total : prev,
    isRecord: isRecord && prev != null,
  });
};

// Aide à la visée puis détection : l'objet est-il passé sous le rebord, dans un bac ?
const checkBins = (body, h) => {
  applyAssist(body, levels.bins, h);
  for (const bin of levels.bins) {
    if (body.pos.y < bin.top - 0.12 && body.pos.y > bin.lift && bin.containsXZ(body.pos, ITEM_RADIUS * 0.2)) {
      body.inBin = bin;
      return true;
    }
  }
  return false;
};

const updateFlight = (dt) => {
  const body = game.body;
  body.flightTime += dt;
  const colliders = [...gym.colliders, ...levels.allColliders()];
  const entered = stepBody(body, dt, colliders, checkBins);

  game.model.position.copy(body.pos);
  game.model.rotation.x += body.spin.x * dt;
  game.model.rotation.y += body.spin.y * dt;
  game.model.rotation.z += body.spin.z * dt;
  if (body.grounded) body.spin.multiplyScalar(0.9);

  if (entered) {
    const bin = body.inBin;
    // L'objet reste dans le bac (et le suit s'il bouge)
    bin.group.attach(game.model);
    game.model.position.set(
      THREE.MathUtils.clamp(game.model.position.x, -0.25, 0.25),
      bin.lift + 0.3,
      THREE.MathUtils.clamp(game.model.position.z, -0.25, 0.25),
    );
    resolveThrow(bin.type === game.item.bin ? 'hit' : 'wrong', bin);
    return;
  }

  const speed = body.vel.length();
  body.restTime = body.pos.y < 0.6 && speed < 0.8 ? body.restTime + dt : 0;
  const outside =
    body.pos.y < -1 || body.pos.x < ROOM.minX - 1 || body.pos.x > ROOM.maxX + 1 || body.pos.z < ROOM.minZ - 1 || body.pos.z > 5;
  if (body.restTime > 0.25 || body.flightTime > 4.5 || outside) resolveThrow(body.dropped ? 'timeout' : 'miss');
};

// --- Boucle principale ------------------------------------------------------------
const clock = new THREE.Clock();
let time = 0;

const tick = () => {
  const dt = Math.min(clock.getDelta(), 0.1);
  time += dt;

  if (game.state !== 'title' && game.state !== 'end') {
    game.elapsed += dt;
    hud.setElapsed(game.elapsed);
  }
  levels.update(time, dt);
  updateConfetti(dt);

  switch (game.state) {
    case 'intro':
      game.timer -= dt;
      if (game.timer <= 0) nextItem();
      break;
    case 'aiming': {
      game.throwTimeLeft -= dt;
      hud.setTimer(game.throwTimeLeft, level().throwTime);
      thrower.update(dt);
      hud.setPower(thrower.power);
      // L'objet tenu flotte devant le joueur
      game.model.position.set(HAND.x, HAND.y + Math.sin(time * 4) * 0.04, HAND.z);
      game.model.rotation.y += dt * 1.2;
      const sec = Math.ceil(game.throwTimeLeft);
      if (sec < game.lastTick && sec <= 3 && sec > 0) sfx.tick();
      game.lastTick = sec;
      if (game.throwTimeLeft <= 0) {
        if (thrower.charging) thrower.release();
        else {
          // Trop tard : l'objet échappe des mains et tombe au sol devant le joueur
          thrower.setEnabled(false);
          launchBody(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.4, -2.4), true);
        }
      }
      break;
    }
    case 'flying':
      updateFlight(dt);
      break;
    case 'result':
      game.timer -= dt;
      if (game.timer <= 0) {
        game.itemIndex += 1;
        nextItem();
      }
      break;
    case 'recap':
      game.timer -= dt;
      if (game.timer <= 0) {
        screens.hideAll();
        if (game.levelIndex >= LEVELS.length - 1) endGame();
        else {
          game.levelIndex += 1;
          startLevel();
        }
      }
      break;
    default:
      break;
  }

  // Caméra : léger suivi de l'objet en vol
  const target = CAMERA_LOOK.clone();
  if (game.state === 'flying' && game.body) target.lerp(game.body.pos, 0.25);
  lookAt.lerp(target, 1 - Math.exp(-dt * 4));
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, (lookAt.x - CAMERA_LOOK.x) * 0.3, 1 - Math.exp(-dt * 3));
  camera.lookAt(lookAt);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

// --- Boutons -------------------------------------------------------------------------
document.getElementById('play').addEventListener('click', startGame);
document.getElementById('replay').addEventListener('click', startGame);
document.getElementById('mute').addEventListener('click', (e) => {
  sfx.toggleMute();
  e.currentTarget.textContent = sfx.muted ? '🔇' : '🔊';
});
document.getElementById('screen-recap').addEventListener('click', () => {
  if (game.state === 'recap') game.timer = 0;
});

// Aperçu : bacs du niveau 1 visibles derrière l'écran titre
levels.load(LEVELS[0]);
screens.title(loadBest());
tick();
