// Pinhole camera behind and above the sled, pitched ~60 degrees down.
const PITCH = (60 * Math.PI) / 180;
const SIN = Math.sin(PITCH);
const COS = Math.cos(PITCH);
export const CAM_H = 600; // camera height
export const CAM_BACK = 300; // camera distance behind the sled
export const FOCAL = CAM_BACK * COS + CAM_H * SIN; // makes the sled scale 1

export interface Cam {
  x: number; // camera world x
  y: number; // camera world y (forward)
  cy: number; // screen y of the optical axis
  cx: number;
}

export interface P { x: number; y: number; s: number }

export function makeCam(camX: number, sledY: number, lw: number, lh: number): Cam {
  return { x: camX, y: sledY - CAM_BACK, cx: lw / 2, cy: lh * 0.68 };
}

// World ground point (z = 0) -> screen
export function project(c: Cam, x: number, y: number): P {
  const dy = y - c.y;
  const depth = dy * COS + CAM_H * SIN;
  const up = dy * SIN - CAM_H * COS;
  const s = FOCAL / Math.max(depth, 40);
  return { x: c.cx + (x - c.x) * s, y: c.cy - up * s, s };
}

// Screen row -> world y on the ground plane
export function groundY(c: Cam, sy: number): number {
  const k = Math.min(1.6, (c.cy - sy) / FOCAL);
  const dy = (CAM_H * (SIN * k + COS)) / (SIN - COS * k);
  return c.y + dy;
}

export function scaleAt(c: Cam, y: number): number {
  return FOCAL / Math.max((y - c.y) * COS + CAM_H * SIN, 40);
}
