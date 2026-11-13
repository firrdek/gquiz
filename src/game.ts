import { cities, type City } from './data/cities';

export type { City };

export const MAX_SCORE_PER_ROUND = 5000;
export const ROUNDS_PER_DAY = 5;
export const MAX_TOTAL_SCORE = MAX_SCORE_PER_ROUND * ROUNDS_PER_DAY;

export interface AnswerData {
  city: City;
  guess: { lat: number; lon: number };
  distanceKm: number;
  score: number;
}

// Compact format for the share link
export interface SharedResult {
  date: string;
  results: { n: string; c: string; d: number; s: number }[];
}

// Local date key, e.g. "2025-05-17"
export function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Simple string hash (xmur3)
function xmur3(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

// Pseudo-random number generator (mulberry32)
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Selects 5 cities deterministically based on date → same cities for everyone each day
export function getDailyCities(date: Date): City[] {
  const key = `cityquiz-v2-${getDateKey(date)}`;
  const rand = mulberry32(xmur3(key));
  const shuffled = [...cities];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, ROUNDS_PER_DAY);
}

// Haversine — distance in km between two coordinates
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Score for a guess `dist` km from the target city.
 *
 * Anchors:
 *   dist ≤  10 km  → 100 % (full score)
 *   dist ≥ 1000 km →   0 %
 *   dist = 500 km  →  10 %
 *
 * Between 10 and 1000 km the score follows an exponential curve
 * `fraction(d) = A·e^(−k·d) + C` fitted through those three anchor points.
 * The constants A, k and C are solved numerically once at module load.
 */

// Scoring anchors for the curve below (tweak these to adjust difficulty).
const BULLSEYE_KM = 10; // within this distance you get the full score
const CUTOFF_KM = 1000; // at or beyond this distance you get 0 points
const ANCHOR_KM = 500; // 10 % of the score is awarded at this distance
const ANCHOR_FRACTION = 0.1;

// fraction(d) = A·e^(−k·d) + C, with fraction(BULLSEYE_KM) = 1 and fraction(CUTOFF_KM) = 0.
function fitScoreCurve(): { a: number; k: number; c: number } {
  // Given k, pick A and C so the two end anchors are exact:
  const fromK = (k: number) => {
    const eAtBullseye = Math.exp(-BULLSEYE_KM * k);
    const eAtCutoff = Math.exp(-CUTOFF_KM * k);
    const a = 1 / (eAtBullseye - eAtCutoff);
    const c = -a * eAtCutoff;
    return { a, c, fractionAtAnchor: a * Math.exp(-ANCHOR_KM * k) + c };
  };

  // fractionAtAnchor(k) falls monotonically from ~0.5 down towards −∞,
  // so bisect for the k that lands exactly on ANCHOR_FRACTION.
  let lo = 0;
  let hi = 0.01;
  while (fromK(hi).fractionAtAnchor > ANCHOR_FRACTION) hi *= 2;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (fromK(mid).fractionAtAnchor > ANCHOR_FRACTION) lo = mid;
    else hi = mid;
  }
  const k = (lo + hi) / 2;
  const { a, c } = fromK(k);
  return { a, k, c };
}

const SCORE_CURVE = fitScoreCurve();

export function calculateScore(dist: number): number {
  if (!Number.isFinite(dist) || dist <= BULLSEYE_KM) return MAX_SCORE_PER_ROUND;
  if (dist >= CUTOFF_KM) return 0;
  const fraction = SCORE_CURVE.a * Math.exp(-SCORE_CURVE.k * dist) + SCORE_CURVE.c;
  return Math.round(MAX_SCORE_PER_ROUND * Math.max(0, fraction));
}

export function totalScore(answers: AnswerData[]): number {
  return answers.reduce((sum, a) => sum + a.score, 0);
}

export function gradeFor(total: number): string {
  if (total >= 24000) return 'World class!';
  if (total >= 20000) return 'Impressive!';
  if (total >= 15000) return 'Very good!';
  if (total >= 10000) return 'Nice work!';
  if (total >= 5000) return 'Not bad!';
  return 'Better luck next time!';
}

// Build a share link with the result embedded in the URL (#share=...)
export function buildShareLink(payload: SharedResult): string {
  const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
  return `${window.location.origin}${window.location.pathname}#share=${encoded}`;
}

// Parse a shared result from the URL
export function parseShareHash(hash: string): SharedResult | null {
  if (!hash.startsWith('#share=')) return null;
  try {
    const decoded = atob(decodeURIComponent(hash.slice('#share='.length)));
    const data = JSON.parse(decoded) as SharedResult;
    if (
      data &&
      typeof data.date === 'string' &&
      Array.isArray(data.results) &&
      data.results.every(
        (r) =>
          typeof r.n === 'string' &&
          typeof r.c === 'string' &&
          typeof r.d === 'number' &&
          typeof r.s === 'number'
      )
    ) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}