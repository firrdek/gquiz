import { grid } from './draw';

type Ctx = CanvasRenderingContext2D;

export function drawFire(ctx: Ctx, x: number, y: number, s: number, t: number) {
  const q = 3 * s;
  ctx.fillStyle = 'rgba(255,170,60,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y - 6 * s, 60 * s, 24 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  const r = grid(ctx, x, y, q);
  r(-5, -2, 10, 2, '#5a3a22'); r(-6, -3, 3, 1, '#3c2616'); r(3, -3, 3, 1, '#3c2616');
  r(-4, -3, 8, 1, '#7a4e2c');
  r(-4, -1, 2, 1, '#8a8f93'); r(2, -1, 2, 1, '#8a8f93');
  const fl = Math.floor(t * 9) % 3;
  r(-3, -5, 6, 2, '#e23a12');
  r(-2, -7 - (fl === 0 ? 1 : 0), 4, 3, '#f5801a');
  r(-1, -9 - fl, 2, 4, '#ffb52e');
  r(0 - (fl === 1 ? 1 : 0), -11 - fl, 1, 2, '#ffe27a');
  r(-1, -5, 2, 2, '#fff0a0');
}

export function drawDog(ctx: Ctx, x: number, y: number, s: number, t: number) {
  const q = 2.6 * s;
  ctx.fillStyle = 'rgba(120,140,150,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 3 * s, y, 18 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  const r = grid(ctx, x, y, q);
  const wag = Math.floor(t * 8) % 2;
  r(-4, -7, 8, 7, '#a8713a');
  r(-3, -7, 6, 1, '#c28a4d');
  r(-3, -3, 6, 3, '#f1e4cf');
  r(-4, -1, 3, 1, '#7a4e22'); r(1, -1, 3, 1, '#7a4e22');
  r(-3, -13, 6, 6, '#b97d41');
  r(-4, -13, 2, 4, '#6e431d'); r(2, -13, 2, 4, '#6e431d');
  r(-2, -10, 4, 3, '#f1e4cf');
  r(-1, -10, 2, 1, '#15181a');
  r(-2, -12, 1, 1, '#15181a'); r(1, -12, 1, 1, '#15181a');
  r(0, -9, 1, 1, '#e8708a');
  r(4 + wag, -3, 3, 1, '#a8713a'); r(6 + wag, -5, 1, 2, '#a8713a');
}

// Pixel-style plank bridge across a stream, built in world space and projected.
export function drawBridge(
  ctx: Ctx,
  pr: (x: number, y: number) => { x: number; y: number },
  bx: number,
  ym: number,
  hw: number,
  half: number,
) {
  const quad = (c: string, x0: number, y0: number, x1: number, y1: number) => {
    const pts = [pr(x0, y0), pr(x1, y0), pr(x1, y1), pr(x0, y1)];
    ctx.fillStyle = c;
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(Math.round(p.x), Math.round(p.y)) : ctx.lineTo(Math.round(p.x), Math.round(p.y))));
    ctx.closePath();
    ctx.fill();
  };
  const ya = ym - hw;
  const yb = ym + hw;
  quad('#14100e', bx - half, ya + 3, bx + half, yb + 3);
  const n = 10;
  const ph = (yb - ya) / n;
  for (let i = 0; i < n; i++) {
    quad(i % 2 ? '#5a4a3d' : '#46382d', bx - half, ya + i * ph, bx + half, ya + (i + 1) * ph - 2);
    quad('#6d5a4a', bx - half, ya + i * ph, bx + half, ya + i * ph + 2);
  }
  quad('#2a211b', bx - half - 6, ya - 3, bx - half, yb + 3);
  quad('#2a211b', bx + half, ya - 3, bx + half + 6, yb + 3);
  quad('#f2f6f7', bx - half - 6, ya - 3, bx - half, ya + 3);
  quad('#f2f6f7', bx + half, ya - 3, bx + half + 6, ya + 3);
}

// Running fox (orange) or raccoon (grey, ringed tail), pixel style, seen from above-behind.
// dir: +1 runs to the right on screen, -1 to the left
export function drawAnimal(ctx: Ctx, x: number, y: number, s: number, kind: 'fox' | 'raccoon', dir: 1 | -1, t: number) {
  const q = 3 * s;
  ctx.fillStyle = 'rgba(90,110,125,0.32)';
  ctx.beginPath();
  ctx.ellipse(x, y + 1 * s, 15 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  const r0 = grid(ctx, x, y, q);
  // mirror in x according to direction
  const r = (px: number, py: number, w: number, h: number, c: string) => r0(dir > 0 ? px : -px - w, py, w, h, c);
  const fox = kind === 'fox';
  const body = fox ? '#e0701e' : '#7b8087';
  const dark = fox ? '#a8480f' : '#3d4146';
  const light = fox ? '#f6e3c8' : '#d9dde0';
  const run = Math.floor(t * 14) % 2;
  // legs (alternate)
  r(-4, -1 + run, 1, 1, dark); r(-2, -1 - run + 1, 1, 1, dark);
  r(2, -1 + run, 1, 1, dark); r(4, -1 - run + 1, 1, 1, dark);
  // body
  r(-5, -4, 10, 3, body);
  r(-4, -5, 8, 1, fox ? '#f08a3a' : '#9aa0a6');
  r(-4, -2, 6, 1, light);
  // head
  r(5, -6, 3, 3, body);
  r(8, -5, 1, 2, light);
  r(9, -5, 1, 1, '#15181a');
  r(5, -7, 1, 1, dark); r(7, -7, 1, 1, dark);
  r(7, -5, 1, 1, '#15181a');
  if (!fox) r(6, -5, 2, 1, '#2a2d31'); // bandit mask
  // tail
  r(-9, -5, 4, 2, fox ? body : '#8a9096');
  r(-10, -6, 2, 2, fox ? light : '#2a2d31');
  if (!fox) { r(-8, -5, 1, 2, '#2a2d31'); r(-6, -5, 1, 2, '#2a2d31'); }
}

export function drawFlag(ctx: Ctx, x: number, y: number, s: number, t: number) {
  const q = 3 * s;
  const r = grid(ctx, x, y, q);
  r(-1, -22, 1, 22, '#3c322b');
  const w = Math.floor(t * 4) % 2;
  for (let i = 0; i < 6; i++) {
    const o = i % 2 === w ? 0 : 1;
    r(i, -22 + o, 1, 3, i % 2 ? '#f4f6f7' : '#222');
    r(i, -19 + o, 1, 3, i % 2 ? '#222' : '#f4f6f7');
  }
}
