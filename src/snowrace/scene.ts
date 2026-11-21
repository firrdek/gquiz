import type { LevelDef } from './levels';

export const HALF = 115; // half width of the normal trail
export const LANE_HALF = 80; // half width of each trail inside a split
export const BRIDGE_HALF = 36; // bridge is 2x the sled width
const TREE_STEP = 38;
const TREE_MARGIN = 34; // free snow kept between the trail edge and the first trees

export interface Tree { x: number; y: number; s: number; v: 0 | 1 | 2 }
export interface Rock { x: number; y: number; s: number }
export interface Dune { x: number; y: number; rx: number; tone: number }
// A meandering stream: water band is ym(x) +- hw, running across the forest
export interface Stream { ym: number; hw: number; ph: number; bx: number }

export const streamMid = (s: Stream, x: number) => s.ym + 30 * Math.sin(x / 170 + s.ph) + 14 * Math.sin(x / 61 + s.ph * 2);
export const streamHalf = (s: Stream, x: number) => s.hw + 7 * Math.sin(x / 97 + s.ph);
export interface Spot { x: number; y: number }
export interface Lane { c: number; half: number }

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

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

// 0..1 ramp that is 1 between y0 and y1 and eases in/out over `edge` units
const plateau = (y: number, y0: number, y1: number, edge: number) =>
  smooth((y - y0) / edge) * smooth((y1 - y) / edge);

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

// Drivable trail(s) at a given y: one lane, or two while the trail is split
export function lanesAt(level: LevelDef, y: number): Lane[] {
  const c = centerAt(level, y);
  let half = HALF;
  for (const n of level.narrows) half += (n.half - HALF) * plateau(y, n.y0, n.y1, 350);
  let w = 0;
  let sep = 0;
  for (const s of level.splits) {
    const k = plateau(y, s.y0, s.y1, 500);
    if (k > w) { w = k; sep = s.sep; }
  }
  if (w < 0.002) return [{ c, half }];
  const h = half - (half - LANE_HALF) * w;
  return [{ c: c - sep * w, half: h }, { c: c + sep * w, half: h }];
}

// How far from the main center line the sled may travel at y
export function extentAt(level: LevelDef, y: number): number {
  const c = centerAt(level, y);
  let e = 0;
  for (const l of lanesAt(level, y)) e = Math.max(e, Math.abs(l.c - c) + l.half);
  return e + 85;
}

export function buildScene(level: LevelDef): Scene {
  const rand = rng(level.seed);
  const c = (y: number) => centerAt(level, y);
  const streams: Stream[] = level.streams.map((s, i) => ({
    ym: s.y + s.len / 2,
    hw: s.len / 2,
    ph: i * 1.7 + 0.5,
    bx: c(s.y + s.len / 2) + s.bridgeOff,
  }));
  const clearing = { x: c(level.length), y: level.length + 520, r: 430 };
  const fire = { x: clearing.x - 34, y: level.length + 520 };
  const dog = { x: clearing.x + 40, y: level.length + 480 };

  const inClearing = (x: number, y: number) => {
    const dx = (x - clearing.x) / clearing.r;
    const dy = (y - clearing.y) / clearing.r;
    return dx * dx + dy * dy < 1;
  };
  const inWater = (x: number, y: number) =>
    streams.some((s) => Math.abs(y - streamMid(s, x)) < streamHalf(s, x) + 22);
  const variant = (): 0 | 1 | 2 => {
    const r = rand();
    return r < 0.6 ? 0 : r < 0.8 ? 1 : 2;
  };

  const trees: Tree[] = [];
  const end = level.length + 1400;
  for (let y = -900; y < end; y += TREE_STEP) {
    const cy = c(y);
    const lanes = lanesAt(level, y);
    const maxOff = 1700;
    for (let off = -maxOff; off <= maxOff; off += Math.abs(off) < 800 ? 48 : 110) {
      const x = cy + off + (rand() - 0.5) * 36;
      const ty = y + rand() * TREE_STEP;
      const s = 0.9 + rand() * 0.5 + (Math.abs(off) > 500 ? 0.15 : 0);
      const keep = rand() > 0.12; // ragged density
      if (!keep || inClearing(x, ty) || inWater(x, ty)) continue;
      if (lanes.some((l) => Math.abs(x - l.c) < l.half + TREE_MARGIN)) continue;
      trees.push({ x, y: ty, s, v: variant() });
    }
  }
  trees.sort((a, b) => a.y - b.y);

  const dunes: Dune[] = [];
  for (let y = -600; y < end; y += 90) {
    for (let i = 0; i < 3; i++) {
      dunes.push({ x: c(y) + (rand() - 0.5) * 2600, y: y + rand() * 80, rx: 60 + rand() * 140, tone: rand() });
    }
  }
  dunes.sort((a, b) => a.y - b.y);

  const rocks: Rock[] = level.rocks
    .map((r) => {
      const lanes = lanesAt(level, r.y);
      const lane = lanes.length === 1 ? lanes[0] : lanes[(r.lane ?? 1) > 0 ? 1 : 0];
      return { x: lane.c + r.off, y: r.y, s: r.s };
    })
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
