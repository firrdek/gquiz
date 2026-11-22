import type { LevelDef } from './levels';
import { ANIMAL_LEAD, ANIMAL_SPEED, BRIDGE_HALF, buildScene, centerAt, extentAt, lanesAt, lowerBound, streamHalf, streamMid } from './scene';
import type { Scene } from './scene';

export const PLAYER_R = 11;
export const MAX_LIVES = 3;
export const ORANGE = '#ee6a1f';
export const BEST_KEY = 'snowrace-best-time'; // per level: `${BEST_KEY}-${levelId}`

export type Phase = 'menu' | 'playing' | 'finished' | 'over';

export interface Flake { x: number; y: number; r: number; v: number }
export interface Spray { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number }

export interface Game {
  level: LevelDef;
  scene: Scene;
  lw: number;
  lh: number;
  x: number;
  y: number;
  vx: number;
  heading: number; // direction the sled points (rad, 0 = world +y); persists on flat snow
  dir: number; // direction of travel; lags heading (drift)
  turn: number; // current turn rate (rad/s)
  lean: number; // rider lean, -1..1
  lives: number;
  invuln: number;
  shake: number;
  camX: number;
  yaw: number; // camera/sled direction in radians (0 = straight up the world y axis)
  time: number;
  speed: number;
  targetSpeed: number;
  nextSpeedUp: number;
  notice: number; // seconds left to show "Speed up!"
  finishTime: number | null;
  flakes: Flake[];
  spray: Spray[];
}

export function newGame(level: LevelDef, lw: number, lh: number): Game {
  const flakes: Flake[] = [];
  for (let i = 0; i < 70; i++) {
    flakes.push({ x: Math.random() * lw, y: Math.random() * lh, r: 1 + Math.random() * 1.6, v: 20 + Math.random() * 40 });
  }
  const x0 = centerAt(level, 0);
  return {
    level, scene: buildScene(level), lw, lh,
    x: x0, y: 0, vx: 0, heading: 0, dir: 0, turn: 0, lean: 0,
    lives: MAX_LIVES, invuln: 0, shake: 0, camX: x0, yaw: 0,
    time: 0, speed: level.startSpeed, targetSpeed: level.startSpeed,
    nextSpeedUp: 0, notice: 0, finishTime: null, flakes, spray: [],
  };
}

export function meters(g: Game): number {
  return Math.floor(Math.max(0, g.y) / 10);
}

function hit(g: Game, bridgeX?: number) {
  g.lives -= 1;
  g.invuln = 1.7;
  g.shake = 0.3;
  g.vx = 0;
  g.heading = 0;
  g.dir = 0;
  g.turn = 0;
  if (bridgeX !== undefined) {
    g.x = bridgeX;
  } else {
    // respawn in the middle of the nearest trail
    const lanes = lanesAt(g.level, g.y);
    g.x = lanes.reduce((a, l) => (Math.abs(l.c - g.x) < Math.abs(a - g.x) ? l.c : a), lanes[0].c);
  }
}

function collide(g: Game): boolean {
  const { trees, animals } = g.scene;
  for (let i = lowerBound(trees, g.y - 45); i < trees.length && trees[i].y < g.y + 45; i++) {
    const t = trees[i];
    const dx = t.x - g.x;
    const dy = (t.y - g.y) * 0.8;
    const r = PLAYER_R + 12 * t.s;
    if (dx * dx + dy * dy < r * r) return true;
  }
  for (const a of animals) {
    if (!a.started) continue;
    const dx = a.x - g.x;
    const dy = (a.y - g.y) * 0.8;
    const r = PLAYER_R + 15;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

// Animals start running across the trail shortly before the sled arrives
function updateAnimals(g: Game, dt: number) {
  for (const a of g.scene.animals) {
    if (!a.started) {
      if (g.y >= a.y - g.speed * ANIMAL_LEAD && g.y < a.y) {
        a.started = true;
        a.x = a.x0;
      }
    } else {
      a.x += a.dir * ANIMAL_SPEED * dt;
      a.t += dt;
    }
  }
}

// Returns the resulting phase after this step
export function update(g: Game, dt: number, steerIn: number): Phase {
  const finishing = g.finishTime !== null;
  const steer = finishing ? 0 : steerIn;
  if (!finishing) g.time += dt;

  const ups = g.level.speedUps;
  if (!finishing && g.nextSpeedUp < ups.length && g.y >= ups[g.nextSpeedUp].y) {
    g.targetSpeed = ups[g.nextSpeedUp].speed;
    g.nextSpeedUp += 1;
    g.notice = 2.2;
  }
  g.notice = Math.max(0, g.notice - dt);
  if (finishing) g.speed *= Math.exp(-dt * 1.6);
  else g.speed += (g.targetSpeed - g.speed) * Math.min(1, dt * 1.5);

  // Flat snow: steering turns the sled and it keeps pointing that way when released.
  // The turn rate and the direction of travel both lag a little (snow drift).
  g.turn += (steer * 1.25 - g.turn) * Math.min(1, dt * 5);
  g.heading = Math.max(-1.2, Math.min(1.2, g.heading + g.turn * dt));
  g.dir += (g.heading - g.dir) * Math.min(1, dt * 3.2);
  g.vx = Math.sin(g.dir) * g.speed;
  g.x += g.vx * dt;
  g.y += Math.cos(g.dir) * g.speed * dt;
  // rider leans into the turn, a little behind the steering input
  g.lean += (steer - g.lean) * Math.min(1, dt * 4);

  const c = centerAt(g.level, g.y);
  const maxOff = extentAt(g.level, g.y);
  if ((g.x > c + maxOff && g.dir > 0) || (g.x < c - maxOff && g.dir < 0)) {
    g.x = Math.max(c - maxOff, Math.min(c + maxOff, g.x));
    g.heading = 0; g.dir = 0; g.vx = 0;
  }

  g.camX += (g.x - g.camX) * Math.min(1, dt * 5);
  // the camera turns with the sled so it is always seen from straight behind
  g.yaw += (g.dir - g.yaw) * Math.min(1, dt * 6);
  g.invuln = Math.max(0, g.invuln - dt);
  g.shake = Math.max(0, g.shake - dt);

  // snow spray thrown backwards from the rear of the sled
  const n = Math.round(g.speed / 90);
  for (let i = 0; i < n && g.spray.length < 140; i++) {
    g.spray.push({
      x: g.x + (Math.random() - 0.5) * 14, y: g.y - 26, z: 4 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 50 - g.vx * 0.2, vy: -40 - Math.random() * 90 + g.speed * 0.2,
      vz: 30 + Math.random() * 60, life: 0.5 + Math.random() * 0.4,
    });
  }
  for (const p of g.spray) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    p.vz -= 220 * dt; p.life -= dt;
    if (p.z < 0) { p.z = 0; p.vz = 0; }
  }
  g.spray = g.spray.filter((p) => p.life > 0);

  updateAnimals(g, dt);
  if (!finishing && g.invuln <= 0 && collide(g)) hit(g);

  if (!finishing) {
    if (g.invuln <= 0) {
      for (const s of g.scene.streams) {
        if (Math.abs(g.y - streamMid(s, g.x)) < streamHalf(s, g.x) && Math.abs(g.x - s.bx) > BRIDGE_HALF) {
          hit(g, s.bx);
          break;
        }
      }
    }
  }

  for (const f of g.flakes) {
    f.y += f.v * dt;
    f.x += Math.sin(f.y * 0.02) * 6 * dt;
    if (f.y > g.lh) { f.y = -4; f.x = Math.random() * g.lw; }
  }

  if (g.lives <= 0) return 'over';
  if (!finishing && g.y >= g.level.length) g.finishTime = g.time;
  if (g.finishTime !== null && g.speed < 12) return 'finished';
  return 'playing';
}
