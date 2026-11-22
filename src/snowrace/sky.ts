import { farLineY } from './camera';
import type { Cam } from './camera';
import type { Game } from './engine';

type Ctx = CanvasRenderingContext2D;

export const FAR = 2500; // distance (along the view direction) where the ground fades into the treeline

// Fixed pseudo-random stars
const STARS = Array.from({ length: 34 }, (_, i) => {
  const a = Math.sin(i * 127.1) * 43758.5453;
  const b = Math.sin(i * 311.7) * 12543.231;
  return { x: a - Math.floor(a), y: b - Math.floor(b), r: i % 7 === 0 ? 2 : 1, ph: i * 1.3 };
});

let skyGrad: CanvasGradient | null = null;
let skyH = 0;

export function skyBottom(cam: Cam): number {
  return farLineY(cam, FAR);
}

// Very dark blue night sky with a few stars, and a dark spruce silhouette along the far edge
export function drawSky(ctx: Ctx, g: Game, cam: Cam, t: number) {
  const { lw, lh } = g;
  const fy = skyBottom(cam);
  const h = Math.round(Math.max(40, fy));
  if (!skyGrad || skyH !== h) {
    skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#02060f');
    skyGrad.addColorStop(1, '#0a1a33');
    skyH = h;
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-20, -20, lw + 40, lh + 40);

  for (const s of STARS) {
    const sy = s.y * Math.max(10, fy - 20);
    const tw = 0.55 + 0.45 * Math.sin(t * 1.5 + s.ph);
    ctx.fillStyle = `rgba(235,240,255,${(0.9 * tw).toFixed(2)})`;
    ctx.fillRect(Math.round(s.x * lw), Math.round(sy), s.r, s.r);
  }

  // far treeline silhouette (shifts with the camera heading so it feels attached to the world)
  const shift = -(g.yaw * 900) % 60;
  ctx.fillStyle = '#0c1914';
  ctx.beginPath();
  ctx.moveTo(-80, fy + 30);
  for (let x = -80; x < lw + 100; x += 30) {
    const k = Math.round((x - shift) / 30);
    const h = 26 + ((k * 37) % 5) * 7;
    ctx.lineTo(x + shift % 30, fy + 6);
    ctx.lineTo(x + 15 + (shift % 30), fy - h);
  }
  ctx.lineTo(lw + 100, fy + 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-20, fy + 4, lw + 40, 30);
}
