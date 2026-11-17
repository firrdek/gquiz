import { ORANGE } from './engine';

type Ctx = CanvasRenderingContext2D;

function tri(ctx: Ctx, fill: string, pts: Array<[number, number]>) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

export function drawTree(ctx: Ctx, x: number, y: number, s: number) {
  ctx.fillStyle = 'rgba(120,140,150,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + 8 * s, y, 24 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a211b';
  ctx.fillRect(x - 3 * s, y - 10 * s, 6 * s, 10 * s);
  for (let i = 0; i < 3; i++) {
    const baseY = y - 8 * s - i * 26 * s;
    const w = (30 - i * 7) * s;
    const h = (46 - i * 4) * s;
    const apexY = baseY - h;
    tri(ctx, '#1f3d31', [[x, apexY], [x - w, baseY], [x, baseY + 4 * s]]);
    tri(ctx, '#122a20', [[x, apexY], [x + w, baseY], [x, baseY + 4 * s]]);
    // snowy tip
    const f = i === 2 ? 0.42 : 0.2;
    tri(ctx, '#f2f6f7', [[x, apexY], [x - w * f, apexY + h * f], [x, apexY + h * f + 2 * s]]);
    tri(ctx, '#c9d6dc', [[x, apexY], [x + w * f, apexY + h * f], [x, apexY + h * f + 2 * s]]);
  }
}

export function drawRock(ctx: Ctx, x: number, y: number, s: number) {
  ctx.fillStyle = 'rgba(120,140,150,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 6 * s, y, 20 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  tri(ctx, '#4a5156', [
    [x - 16 * s, y], [x - 11 * s, y - 14 * s], [x + 4 * s, y - 19 * s], [x + 16 * s, y - 8 * s], [x + 15 * s, y],
  ]);
  tri(ctx, '#343a3e', [
    [x + 4 * s, y - 19 * s], [x + 16 * s, y - 8 * s], [x + 15 * s, y], [x + 3 * s, y - 4 * s],
  ]);
  tri(ctx, '#f4f8f9', [
    [x - 11 * s, y - 14 * s], [x + 4 * s, y - 19 * s], [x + 11 * s, y - 13 * s], [x - 2 * s, y - 10 * s],
  ]);
}

export function drawSled(ctx: Ctx, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(90,110,120,0.3)';
  ctx.beginPath();
  ctx.ellipse(4, 4, 20, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(angle);
  // rear track
  ctx.fillStyle = '#23272a';
  ctx.fillRect(-9, 6, 18, 24);
  // skis
  ctx.fillStyle = '#2e3337';
  ctx.fillRect(-17, -38, 5, 34);
  ctx.fillRect(12, -38, 5, 34);
  ctx.fillStyle = '#f2f6f7';
  ctx.fillRect(-17, -40, 5, 4);
  ctx.fillRect(12, -40, 5, 4);
  // body
  tri(ctx, '#c4510f', [[-12, -32], [12, -32], [15, 12], [-15, 12]]);
  tri(ctx, ORANGE, [[-9, -32], [9, -32], [12, 4], [-12, 4]]);
  ctx.fillStyle = '#ff8a45';
  ctx.fillRect(-4, -30, 8, 22);
  // windshield
  ctx.fillStyle = 'rgba(200,225,235,0.8)';
  ctx.fillRect(-8, -12, 16, 4);
  // seat
  ctx.fillStyle = '#2b2f32';
  ctx.fillRect(-8, 2, 16, 18);
  // rider
  ctx.fillStyle = '#3a2a22';
  ctx.beginPath();
  ctx.ellipse(0, 4, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d95a12';
  ctx.beginPath();
  ctx.arc(0, -2, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e2225';
  ctx.fillRect(-4, -5, 8, 3);
  ctx.restore();
}

export function drawSledIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.fillStyle = '#2b2f32';
  ctx.fillRect(x, y + 11, 24, 3);
  tri(ctx, color, [[x + 2, y + 10], [x + 4, y + 4], [x + 17, y + 4], [x + 22, y + 10]]);
  ctx.fillStyle = '#2b2f32';
  ctx.beginPath();
  ctx.arc(x + 11, y + 1, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x + 8, y + 3, 6, 5);
}
