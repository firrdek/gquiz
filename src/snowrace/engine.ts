export const K = 0.62; // world-forward -> screen-up factor (isometric tilt)
export const HALF = 115; // half width of the trail
export const STEP = 34; // spacing of generated forest rows
export const PLAYER_R = 11;
export const MAX_LIVES = 3;
export const ORANGE = '#ee6a1f';
export const BEST_KEY = 'snowrace-best';

export type Phase = 'menu' | 'playing' | 'over';

export interface Tree { x: number; y: number; s: number }
export interface Rock { x: number; y: number; s: number }
export interface Stream { y0: number; y1: number; bx: number; hit: boolean }
export interface Flake { x: number; y: number; r: number; v: number }
export interface TrackPoint { x: number; y: number }

export interface Game {
  lw: number;
  lh: number;
  x: number;
  y: number;
  vx: number;
  heading: number;
  lives: number;
  invuln: number;
  shake: number;
  camX: number;
  genY: number;
  nextStream: number;
  trees: Tree[];
  rocks: Rock[];
  streams: Stream[];
  track: TrackPoint[];
  flakes: Flake[];
  score: number;
  speed: number;
}

// Center line of the winding trail
export function center(y: number): number {
  const ramp = Math.min(1, Math.max(0, y) / 500);
  return ramp * (150 * Math.sin(y / 900) + 60 * Math.sin(y / 330 + 1));
}

export function newGame(lw: number, lh: number): Game {
  const flakes: Flake[] = [];
  for (let i = 0; i < 70; i++) {
    flakes.push({ x: Math.random() * lw, y: Math.random() * lh, r: 1 + Math.random() * 1.6, v: 20 + Math.random() * 40 });
  }
  const g: Game = {
    lw, lh,
    x: center(0), y: 0, vx: 0, heading: 0,
    lives: MAX_LIVES, invuln: 0, shake: 0,
    camX: center(0),
    genY: -460, nextStream: 1500,
    trees: [], rocks: [], streams: [], track: [], flakes,
    score: 0, speed: 240,
  };
  generate(g);
  return g;
}

export function generate(g: Game) {
  const limit = g.y + g.lh / K + 220;
  while (g.genY < limit) {
    const y = g.genY;
    if (y >= g.nextStream) {
      const y0 = y;
      const y1 = y + 120;
      g.streams.push({ y0, y1, bx: center(y0 + 60) + (Math.random() - 0.5) * 120, hit: false });
      g.nextStream = y1 + 1800 + Math.random() * 1200;
      g.genY = y1 + STEP;
      continue;
    }
    g.genY += STEP;
    const c = center(y);
    for (const side of [-1, 1]) {
      g.trees.push({ x: c + side * (HALF + 10 + Math.random() * 30), y: y + Math.random() * 14, s: 0.9 + Math.random() * 0.4 });
      g.trees.push({ x: c + side * (HALF + 55 + Math.random() * 60), y: y + 10 + Math.random() * 20, s: 0.9 + Math.random() * 0.5 });
      g.trees.push({ x: c + side * (HALF + 130 + Math.random() * 90), y: y + Math.random() * 30, s: 1 + Math.random() * 0.5 });
      g.trees.push({ x: c + side * (HALF + 220 + Math.random() * 120), y: y + Math.random() * 30, s: 1.1 + Math.random() * 0.5 });
      if (Math.random() < 0.08) {
        g.trees.push({ x: c + side * (HALF - 18 - Math.random() * 10), y, s: 0.8 + Math.random() * 0.3 });
      }
    }
    if (y > 600 && y < g.nextStream - 220 && Math.random() < 0.07) {
      g.rocks.push({ x: c + (Math.random() - 0.5) * 2 * (HALF - 35), y, s: 0.9 + Math.random() * 0.5 });
    }
  }
}

function hit(g: Game, bridgeX?: number) {
  g.lives -= 1;
  g.invuln = 1.7;
  g.shake = 0.3;
  g.vx = 0;
  g.heading = 0;
  g.x = bridgeX ?? center(g.y);
}

// Returns true when the game is over
export function update(g: Game, dt: number, steer: number): boolean {
  g.score = Math.floor(g.y / 10);
  g.speed = Math.min(560, 240 + g.score * 0.12);

  // Snow-drift inertia: heading lags the input, lateral velocity lags the heading
  const targetHeading = steer * 0.65;
  g.heading += (targetHeading - g.heading) * Math.min(1, dt * 2.4);
  const targetVx = Math.sin(g.heading) * g.speed * 1.15;
  g.vx += (targetVx - g.vx) * Math.min(1, dt * 1.8);
  g.x += g.vx * dt;
  g.y += g.speed * dt;

  const c = center(g.y);
  const maxOff = HALF + 90;
  if (g.x > c + maxOff) { g.x = c + maxOff; g.vx = Math.min(g.vx, 0); }
  if (g.x < c - maxOff) { g.x = c - maxOff; g.vx = Math.max(g.vx, 0); }

  g.camX += (g.x - g.camX) * Math.min(1, dt * 5);
  g.invuln = Math.max(0, g.invuln - dt);
  g.shake = Math.max(0, g.shake - dt);

  const last = g.track[g.track.length - 1];
  if (!last || g.y - last.y > 5) {
    g.track.push({ x: g.x, y: g.y });
    if (g.track.length > 160) g.track.shift();
  }

  generate(g);
  g.trees = g.trees.filter((t) => t.y > g.y - 480);
  g.rocks = g.rocks.filter((r) => r.y > g.y - 480);
  g.streams = g.streams.filter((s) => s.y1 > g.y - 480);

  if (g.invuln <= 0) {
    let crashed = false;
    for (const t of g.trees) {
      if (Math.abs(t.y - g.y) > 40) continue;
      const dx = t.x - g.x;
      const dy = (t.y - g.y) * 0.8;
      const r = PLAYER_R + 12 * t.s;
      if (dx * dx + dy * dy < r * r) { crashed = true; break; }
    }
    if (!crashed) {
      for (const r of g.rocks) {
        if (Math.abs(r.y - g.y) > 40) continue;
        const dx = r.x - g.x;
        const dy = (r.y - g.y) * 0.8;
        const rad = PLAYER_R + 13 * r.s;
        if (dx * dx + dy * dy < rad * rad) { crashed = true; break; }
      }
    }
    if (crashed) hit(g);
  }

  for (const s of g.streams) {
    if (!s.hit && g.y >= s.y0 && g.y <= s.y1) {
      if (Math.abs(g.x - s.bx) > 34) {
        s.hit = true;
        if (g.invuln <= 0) hit(g, s.bx);
      }
    }
  }

  for (const f of g.flakes) {
    f.y += f.v * dt;
    f.x += Math.sin(f.y * 0.02) * 6 * dt;
    if (f.y > g.lh) { f.y = -4; f.x = Math.random() * g.lw; }
  }

  return g.lives <= 0;
}
