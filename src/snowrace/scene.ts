import type { LevelDef } from './levels';

export const HALF = 115; // half width of the trail
export const STEP = 34; // spacing of generated forest rows
export const BRIDGE_HALF = 36; // bridge is 2x the sled width (sled is ~36 wide)

export interface Tree { x: number; y: number; s: number; v: 0 | 1 | 2 }
export interface Rock { x: number; y: number; s: number }
export interface Dune { x: number; y: number; rx: number; tone: number }
export interface Stream { y0: number; y1: number; bx: number; hit: boolean }
export interface Spot { x: number; y: number }

export interface Scene {
  trees: Tree[];
  rocks: Rock[];
  dunes: Dune[];
  streams: Stream[];
  clearing: { x: number; y: number; r: number };
  fire: Spot;
  dog: Spot;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Center line of the winding trail (cosine-interpolated hard-coded control points)
export function centerAt(level: LevelDef, y: number): number {
  const p = level.path;
  if (y <= p[0][0]) return p[0][1];
  for (let i = 0; i < p.length - 1; i++) {
    if (y < p[i + 1][0]) {
      const t = (y - p[i][0]) / (p[i + 1][0] - p[i][0]);
      const w = (1 - Math.cos(t * Math.PI)) / 2;
      return p[i][1] + (p[i + 1][1] - p[i][1]) * w;
    }
  }
  return p[p.length - 1][1];
}

export function buildScene(level: LevelDef): Scene {
  const rand = rng(level.seed);
  const c = (y: number) => centerAt(level, y);
  const streams: Stream[] = level.streams.map((s) => ({
    y0: s.y,
    y1: s.y + s.len,
    bx: c(s.y + s.len / 2) + s.bridgeOff,
    hit: false,
  }));
  const clearing = { x: c(level.length), y: level.length + 320, r: 360 };
  const fire = { x: clearing.x - 30, y: level.length + 330 };
  const dog = { x: clearing.x + 34, y: level.length + 300 };

  const inClearing = (x: number, y: number) => {
    const dx = (x - clearing.x) / clearing.r;
    const dy = (y - clearing.y) / clearing.r;
    return dx * dx + dy * dy < 1;
  };
  const nearStream = (y: number) => streams.some((s) => y > s.y0 - 24 && y < s.y1 + 24);
  const variant = (): 0 | 1 | 2 => {
    const r = rand();
    return r < 0.6 ? 0 : r < 0.8 ? 1 : 2;
  };

  const trees: Tree[] = [];
  const add = (x: number, y: number, s: number) => {
    if (inClearing(x, y) || nearStream(y)) return;
    trees.push({ x, y, s, v: variant() });
  };
  for (let y = -500; y < level.length + 1100; y += STEP) {
    const cx = c(y);
    for (const side of [-1, 1]) {
      add(cx + side * (HALF + 10 + rand() * 30), y + rand() * 14, 0.9 + rand() * 0.4);
      add(cx + side * (HALF + 55 + rand() * 60), y + 10 + rand() * 20, 0.9 + rand() * 0.5);
      add(cx + side * (HALF + 130 + rand() * 90), y + rand() * 30, 1 + rand() * 0.5);
      add(cx + side * (HALF + 220 + rand() * 120), y + rand() * 30, 1.1 + rand() * 0.5);
    }
  }
  trees.sort((a, b) => a.y - b.y);

  const dunes: Dune[] = [];
  for (let y = -400; y < level.length + 1100; y += 70) {
    const n = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < n; i++) {
      dunes.push({ x: c(y) + (rand() - 0.5) * 1300, y: y + rand() * 60, rx: 50 + rand() * 110, tone: rand() });
    }
  }
  dunes.sort((a, b) => a.y - b.y);

  const rocks: Rock[] = level.rocks
    .map((r) => ({ x: c(r.y) + r.off, y: r.y, s: r.s }))
    .sort((a, b) => a.y - b.y);

  return { trees, rocks, dunes, streams, clearing, fire, dog };
}

// First index whose y >= value (arrays sorted by y)
export function lowerBound(arr: Array<{ y: number }>, value: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid].y < value) lo = mid + 1; else hi = mid;
  }
  return lo;
}
