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

// Pixel bridge across a stream; screen-space rectangle between near/far edges
export function drawBridge(ctx: Ctx, xl: number, xr: number, yTop: number, yBot: number) {
  const h = yBot - yTop;
  const w = xr - xl;
  const n = 9;
  const ph = h / n;
  ctx.fillStyle = '#14100e';
  ctx.fillRect(Math.round(xl), Math.round(yTop + 4), Math.round(w), Math.round(h));
  for (let i = 0; i < n; i++) {
    const y0 = Math.round(yTop + i * ph);
    ctx.fillStyle = i % 2 ? '#5a4a3d' : '#46382d';
    ctx.fillRect(Math.round(xl), y0, Math.round(w), Math.max(1, Math.round(ph) - 2));
    ctx.fillStyle = '#6d5a4a';
    ctx.fillRect(Math.round(xl), y0, Math.round(w), 1);
  }
  const rw = Math.max(3, Math.round(w * 0.07));
  ctx.fillStyle = '#2a211b';
  ctx.fillRect(Math.round(xl) - rw, Math.round(yTop) - 3, rw, Math.round(h) + 6);
  ctx.fillRect(Math.round(xr), Math.round(yTop) - 3, rw, Math.round(h) + 6);
  ctx.fillStyle = '#f2f6f7';
  ctx.fillRect(Math.round(xl) - rw, Math.round(yTop) - 3, rw, 3);
  ctx.fillRect(Math.round(xr), Math.round(yTop) - 3, rw, 3);
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
