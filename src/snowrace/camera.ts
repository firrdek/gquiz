// Pinhole camera behind and above the sled, pitched 45 degrees down and
// yawed to follow the sled's direction so it is always seen from straight behind.
export const PITCH = (45 * Math.PI) / 180;
const SIN = Math.sin(PITCH);
const COS = Math.cos(PITCH);
export const CAM_H = 205; // camera height above the ground
export const CAM_BACK = 205; // camera distance behind the sled (== height keeps the sled on the optical axis)

export interface Cam {
  ox: number; // camera world position
  oy: number;
  sy: number; // sin(yaw)
  cyaw: number; // cos(yaw)
  cx: number; // screen center x
  cy: number; // screen y of the optical axis (and of the sled)
  f: number; // focal length in screen units
}

export interface P { x: number; y: number; s: number; d: number }

export function makeCam(x: number, y: number, yaw: number, lw: number, lh: number): Cam {
  const sy = Math.sin(yaw);
  const cyaw = Math.cos(yaw);
  return { ox: x - sy * CAM_BACK, oy: y - cyaw * CAM_BACK, sy, cyaw, cx: lw / 2, cy: lh * 0.7, f: lh * 0.5 };
}

// World point (ground z = 0) -> screen. `d` is the depth along the view direction.
export function project(c: Cam, x: number, y: number, z = 0): P {
  const dx = x - c.ox;
  const dy = y - c.oy;
  const fwd = dx * c.sy + dy * c.cyaw;
  const rgt = dx * c.cyaw - dy * c.sy;
  const depth = fwd * COS + (CAM_H - z) * SIN;
  const up = fwd * SIN - (CAM_H - z) * COS;
  const s = c.f / Math.max(depth, 60);
  return { x: c.cx + rgt * s, y: c.cy - up * s, s, d: depth };
}

// Screen y of the horizon line
export function horizonY(c: Cam): number {
  return c.cy - c.f * (SIN / COS);
}

// Screen y of the ground line at a given view-space forward distance
export function farLineY(c: Cam, fwd: number): number {
  return c.cy - (c.f * (fwd * SIN - CAM_H * COS)) / (fwd * COS + CAM_H * SIN);
}
