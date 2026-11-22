type Ctx = CanvasRenderingContext2D;

function tri(ctx: Ctx, fill: string, pts: Array<[number, number]>) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

// Pixel-art helper: rectangles in a unit grid of size q anchored at (ox, oy)
export function grid(ctx: Ctx, ox: number, oy: number, q: number) {
  return (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    const x0 = Math.round(ox + x * q);
    const y0 = Math.round(oy + y * q);
    ctx.fillRect(x0, y0, Math.round(ox + (x + w) * q) - x0, Math.round(oy + (y + h) * q) - y0);
  };
}

// Three spruce shades: 60% original, 20% and 20% slightly different
const TREE_COLORS: Array<[string, string]> = [
  ['#1f3d31', '#122a20'],
  ['#25452f', '#16301f'],
  ['#1b3a38', '#0f2827'],
];

// Each tree variant is pre-rendered once to an offscreen canvas and then blitted with drawImage
const SPR_SCALE = 2;
const SPR_W = 100;
const SPR_H = 520;
const SPR_OX = SPR_W / 2;
const SPR_OY = SPR_H - 14;
const treeSprites: Array<HTMLCanvasElement | undefined> = [];

export function drawTree(ctx: Ctx, x: number, y: number, s: number, v = 0) {
  let spr = treeSprites[v];
  if (!spr) {
    spr = document.createElement('canvas');
    spr.width = SPR_W * SPR_SCALE;
    spr.height = SPR_H * SPR_SCALE;
    const c = spr.getContext('2d')!;
    c.scale(SPR_SCALE, SPR_SCALE);
    drawTreeVector(c, SPR_OX, SPR_OY, 1, v);
    treeSprites[v] = spr;
  }
  ctx.drawImage(spr, x - SPR_OX * s, y - SPR_OY * s, SPR_W * s, SPR_H * s);
}

function drawTreeVector(ctx: Ctx, x: number, y: number, s: number, v: number) {
  const [lit, dark] = TREE_COLORS[v];
  ctx.fillStyle = 'rgba(120,140,150,0.25)';
  ctx.beginPath();
  ctx.ellipse(x + 8 * s, y, 24 * s, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  const k = 1.75; // trees are tall compared to the sled
  ctx.fillStyle = '#2a211b';
  ctx.fillRect(x - 3 * s, y - 12 * s * k, 6 * s, 12 * s * k);
  for (let i = 0; i < 4; i++) {
    const baseY = y - (9 + i * 27) * s * k;
    const w = (31 - i * 6) * s;
    const h = (50 - i * 3) * s * k;
    const apexY = baseY - h;
    tri(ctx, lit, [[x, apexY], [x - w, baseY], [x, baseY + 4 * s]]);
    tri(ctx, dark, [[x, apexY], [x + w, baseY], [x, baseY + 4 * s]]);
    const f = i === 3 ? 0.42 : 0.2;
    tri(ctx, '#f2f6f7', [[x, apexY], [x - w * f, apexY + h * f], [x, apexY + h * f + 2 * s]]);
    tri(ctx, '#c9d6dc', [[x, apexY], [x + w * f, apexY + h * f], [x, apexY + h * f + 2 * s]]);
  }
}

export function drawRock(ctx: Ctx, x: number, y: number, s: number) {
  const q = 3.2 * s;
  ctx.fillStyle = 'rgba(120,140,150,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + 6 * s, y, 20 * s, 6 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  const r = grid(ctx, x, y, q);
  r(-5, -3, 10, 3, '#343a3e');
  r(-4, -5, 8, 2, '#4a5156');
  r(-5, -4, 2, 2, '#4a5156');
  r(2, -5, 3, 4, '#343a3e');
  r(-3, -6, 6, 1, '#f4f8f9');
  r(-2, -7, 3, 1, '#f4f8f9');
  r(-4, -5, 2, 1, '#6a7378');
  r(-1, -3, 2, 1, '#5b6368');
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
