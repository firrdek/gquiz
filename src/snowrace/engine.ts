import type { LevelDef } from './levels';
import { BRIDGE_HALF, buildScene, centerAt, lowerBound } from './scene';
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
  heading: number;
  lean: number; // rider lean, -1..1
  lives: number;
  invuln: number;
  shake: number;
  camX: number;
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
    x: x0, y: 0, vx: 0, heading: 0, lean: 0,
    lives: MAX_LIVES, invuln: 0, shake: 0, camX: x0,
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
  g.x = bridgeX ?? centerAt(g.level, g.y);
}

function collide(g: Game): boolean {
  const { trees, rocks } = g.scene;
  for (let i = lowerBound(trees, g.y - 45); i < trees.length && trees[i].y < g.y + 45; i++) {
    const t = trees[i];
    const dx = t.x - g.x;
    const dy = (t.y - g.y) * 0.8;
    const r = PLAYER_R + 12 * t.s;
    if (dx * dx + dy * dy < r * r) return true;
  }
  for (let i = lowerBound(rocks, g.y - 45); i < rocks.length && rocks[i].y < g.y + 45; i++) {
    const r = rocks[i];
    const dx = r.x - g.x;
    const dy = (r.y - g.y) * 0.8;
    const rad = PLAYER_R + 13 * r.s;
    if (dx * dx + dy * dy < rad * rad) return true;
  }
  return false;
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

  // Snow-drift inertia: heading lags the input, lateral velocity lags the heading
  g.heading += (steer * 0.65 - g.heading) * Math.min(1, dt * 2.4);
  const targetVx = Math.sin(g.heading) * g.speed * 1.15;
  g.vx += (targetVx - g.vx) * Math.min(1, dt * 1.8);
  g.x += g.vx * dt;
  g.y += g.speed * dt;
  // rider leans into the turn, a little behind the steering input
  g.lean += (steer - g.lean) * Math.min(1, dt * 4);

  const c = centerAt(g.level, g.y);
  const maxOff = 205;
  if (g.x > c + maxOff) { g.x = c + maxOff; g.vx = Math.min(g.vx, 0); }
  if (g.x < c - maxOff) { g.x = c - maxOff; g.vx = Math.max(g.vx, 0); }

  g.camX += (g.x - g.camX) * Math.min(1, dt * 5);
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

  if (!finishing && g.invuln <= 0 && collide(g)) hit(g);

  if (!finishing) {
    for (const s of g.scene.streams) {
      if (!s.hit && g.y >= s.y0 && g.y <= s.y1) {
        if (Math.abs(g.x - s.bx) > BRIDGE_HALF) {
          s.hit = true;
          if (g.invuln <= 0) hit(g, s.bx);
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
