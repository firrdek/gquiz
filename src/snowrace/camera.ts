// Pinhole camera behind and above the sled, pitched ~60 degrees down and
// yawed to follow the sled's direction so it is always seen from straight behind.
const PITCH = (60 * Math.PI) / 180;
const SIN = Math.sin(PITCH);
const COS = Math.cos(PITCH);
export const CAM_H = 600; // camera height
export const CAM_BACK = 300; // camera distance behind the sled
export const FOCAL = CAM_BACK * COS + CAM_H * SIN; // makes the sled scale 1

export interface Cam {
  ox: number; // camera world position
  oy: number;
  sy: number; // sin(yaw)
  cyaw: number; // cos(yaw)
  cx: number; // screen center x
  cy: number; // screen y of the optical axis
}

export interface P { x: number; y: number; s: number; d: number }

export function makeCam(x: number, y: number, yaw: number, lw: number, lh: number): Cam {
  const sy = Math.sin(yaw);
  const cyaw = Math.cos(yaw);
  return { ox: x - sy * CAM_BACK, oy: y - cyaw * CAM_BACK, sy, cyaw, cx: lw / 2, cy: lh * 0.68 };
}

// World ground point (z = 0) -> screen. `d` is the depth along the view direction.
export function project(c: Cam, x: number, y: number, z = 0): P {
  const dx = x - c.ox;
  const dy = y - c.oy;
  const fwd = dx * c.sy + dy * c.cyaw;
  const rgt = dx * c.cyaw - dy * c.sy;
  const depth = fwd * COS + (CAM_H - z) * SIN;
  const up = fwd * SIN - (CAM_H - z) * COS;
  const s = FOCAL / Math.max(depth, 60);
  return { x: c.cx + rgt * s, y: c.cy - up * s, s, d: depth };
}
