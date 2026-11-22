import { BRIDGE_HALF, HALF, centerAt, lanesAt, streamHalf, streamMid } from './scene';
import { project } from './camera';
import type { Cam } from './camera';
import type { Game } from './engine';
import { drawBridge } from './props';
import { skyBottom } from './sky';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

// Fill a world-space polygon
function poly(ctx: Ctx, cam: Cam, fill: string, pts: Pt[]) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const p = project(cam, x, y);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fill();
}

function drawSnow(ctx: Ctx, g: Game, cam: Cam, y0: number, y1: number) {
  const { lw, lh } = g;
  const fy = skyBottom(cam);
  ctx.fillStyle = '#dde8ed';
  ctx.fillRect(-20, fy, lw + 40, lh + 40 - fy);
  // rolling snow: soft light and shadow waves across the whole ground
  const x0 = g.x - 1100;
  const x1 = g.x + 1100;
  for (let y = Math.floor(y0 / 120) * 120; y < y1; y += 120) {
    const a = Math.sin(y / 131) * Math.cos(y / 337 + 1);
    if (a > 0.15) poly(ctx, cam, `rgba(255,255,255,${(0.35 * a).toFixed(2)})`, [[x0, y], [x1, y], [x1, y + 120], [x0, y + 120]]);
    else if (a < -0.15) poly(ctx, cam, `rgba(140,165,190,${(-0.16 * a).toFixed(2)})`, [[x0, y], [x1, y], [x1, y + 120], [x0, y + 120]]);
  }
  // dunes
  for (const d of g.scene.dunes) {
    if (d.y < y0 || d.y > y1) continue;
    const p = project(cam, d.x, d.y);
    if (p.y < -30 || p.y > lh + 60 || p.x < -150 || p.x > lw + 150) continue;
    const rx = d.rx * p.s;
    if (rx < 6) continue;
    const ry = rx * 0.34;
    ctx.fillStyle = 'rgba(150,175,195,0.24)';
    ctx.beginPath();
    ctx.ellipse(p.x + rx * 0.12, p.y + ry * 0.2, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = d.tone > 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(250,253,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(p.x - rx * 0.06, p.y - ry * 0.1, rx * 0.9, ry * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTrail(ctx: Ctx, g: Game, cam: Cam, y0: number, y1: number) {
  const lvl = g.level;
  const step = 72;
  const start = Math.floor(y0 / step) * step;
  for (const [grow, color] of [[30, '#e9f1f4'], [0, '#f8fbfc']] as Array<[number, string]>) {
    for (let y = start; y < y1; y += step) {
      const a = lanesAt(lvl, y);
      const b = lanesAt(lvl, y + step);
      const n = Math.max(a.length, b.length);
      for (let k = 0; k < n; k++) {
        const la = a[Math.min(k, a.length - 1)];
        const lb = b[Math.min(k, b.length - 1)];
        const ha = la.half + grow + 1;
        const hb = lb.half + grow + 1;
        poly(ctx, cam, color, [[la.c - ha, y], [la.c + ha, y], [lb.c + hb, y + step + 1], [lb.c - hb, y + step + 1]]);
      }
    }
  }
}

function drawGoal(ctx: Ctx, g: Game, cam: Cam) {
  const lvl = g.level;
  const cl = g.scene.clearing;
  ctx.fillStyle = '#f9fcfd';
  ctx.beginPath();
  for (let a = 0; a <= 28; a++) {
    const t = (a / 28) * Math.PI * 2;
    const p = project(cam, cl.x + Math.cos(t) * cl.r, cl.y + Math.sin(t) * cl.r * 0.9);
    if (a === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.fill();
  const cx = centerAt(lvl, lvl.length);
  const n = 14;
  const w = (HALF * 2) / n;
  for (let i = 0; i < n; i++) {
    const x = cx - HALF + i * w;
    poly(ctx, cam, i % 2 ? '#1d2124' : '#f4f6f7', [[x, lvl.length], [x + w, lvl.length], [x + w, lvl.length + 12], [x, lvl.length + 12]]);
    poly(ctx, cam, i % 2 ? '#f4f6f7' : '#1d2124', [[x, lvl.length + 12], [x + w, lvl.length + 12], [x + w, lvl.length + 24], [x, lvl.length + 24]]);
  }
}

function drawStreams(ctx: Ctx, g: Game, cam: Cam) {
  const x0 = g.x - 1100;
  const x1 = g.x + 1100;
  for (const s of g.scene.streams) {
    if (s.ym < g.y - 400 || s.ym > g.y + 2600) continue;
    const xs: number[] = [];
    for (let x = x0; x <= x1; x += 40) xs.push(x);
    const band = (grow: number, color: string) => {
      const top: Pt[] = xs.map((x) => [x, streamMid(s, x) + streamHalf(s, x) + grow]);
      const bot: Pt[] = xs.map((x) => [x, streamMid(s, x) - streamHalf(s, x) - grow]).reverse() as Pt[];
      poly(ctx, cam, color, [...top, ...bot]);
    };
    band(5, '#eef4f6'); // snowy banks
    band(0, '#0d2147'); // dark blue water
    // ripples
    ctx.strokeStyle = '#2c5190';
    ctx.lineWidth = 1.5;
    for (const f of [-0.5, 0, 0.5]) {
      ctx.beginPath();
      xs.forEach((x, i) => {
        const p = project(cam, x, streamMid(s, x) + streamHalf(s, x) * f + (i % 2 ? 3 : -3));
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
    drawBridge(ctx, (x, y) => project(cam, x, y), s.bx, streamMid(s, s.bx), streamHalf(s, s.bx) + 16, BRIDGE_HALF);
  }
}

export function drawGround(ctx: Ctx, g: Game, cam: Cam) {
  const y0 = g.y - 400;
  const y1 = g.y + 2600;
  drawSnow(ctx, g, cam, y0, y1);
  drawTrail(ctx, g, cam, y0, y1);
  drawGoal(ctx, g, cam);
  drawStreams(ctx, g, cam);
}
