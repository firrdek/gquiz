import { HALF, BRIDGE_HALF, centerAt } from './scene';
import { groundY, project, scaleAt } from './camera';
import type { Cam } from './camera';
import type { Game } from './engine';
import { drawBridge } from './props';

type Ctx = CanvasRenderingContext2D;

export function drawGround(ctx: Ctx, g: Game, cam: Cam) {
  const { lw, lh } = g;
  const lvl = g.level;
  const rows: number[] = [];
  for (let s = -10; s <= lh + 30; s += 6) rows.push(s);
  const wy = rows.map((s) => groundY(cam, s));
  const sc = wy.map((y) => scaleAt(cam, y));
  const px = (x: number, i: number) => cam.cx + (x - cam.x) * sc[i];

  const bands: Array<[number, string]> = [[HALF + 420, '#dbe7ec'], [HALF + 40, '#e9f1f4'], [HALF + 6, '#f7fafb']];
  for (const [w, color] of bands) {
    ctx.fillStyle = color;
    ctx.beginPath();
    rows.forEach((s, i) => {
      const x = px(centerAt(lvl, wy[i]) - w, i);
      if (i === 0) ctx.moveTo(x, s); else ctx.lineTo(x, s);
    });
    for (let i = rows.length - 1; i >= 0; i--) ctx.lineTo(px(centerAt(lvl, wy[i]) + w, i), rows[i]);
    ctx.closePath();
    ctx.fill();
  }

  // rolling snow: soft shaded waves across the snow
  rows.forEach((s, i) => {
    const y = wy[i];
    const a = 0.5 + 0.5 * Math.sin(y / 85) * Math.cos(y / 230 + 1);
    const c = centerAt(lvl, y);
    const l = px(c - HALF - 420, i);
    const r = px(c + HALF + 420, i);
    ctx.fillStyle = `rgba(150,175,195,${(0.1 * a).toFixed(3)})`;
    ctx.fillRect(l, s, r - l, 6);
    const b = 0.5 + 0.5 * Math.sin(y / 53 + 2);
    ctx.fillStyle = `rgba(255,255,255,${(0.14 * b * (1 - a)).toFixed(3)})`;
    ctx.fillRect(l, s, r - l, 6);
  });

  // dunes
  for (const d of g.scene.dunes) {
    if (d.y < wy[rows.length - 1] - 60 || d.y > wy[0] + 100) continue;
    const p = project(cam, d.x, d.y);
    if (p.y < -20 || p.y > lh + 40) continue;
    const rx = d.rx * p.s;
    const ry = rx * 0.28;
    ctx.fillStyle = 'rgba(150,175,195,0.22)';
    ctx.beginPath();
    ctx.ellipse(p.x + rx * 0.12, p.y + ry * 0.2, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = d.tone > 0.5 ? 'rgba(255,255,255,0.75)' : 'rgba(250,253,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(p.x - rx * 0.06, p.y - ry * 0.1, rx * 0.9, ry * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // goal clearing
  const cl = g.scene.clearing;
  ctx.fillStyle = '#f9fcfd';
  ctx.beginPath();
  for (let a = 0; a <= 24; a++) {
    const t = (a / 24) * Math.PI * 2;
    const p = project(cam, cl.x + Math.cos(t) * cl.r, cl.y + Math.sin(t) * cl.r * 0.9);
    if (a === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.fill();

  // finish line
  const fa = project(cam, centerAt(lvl, lvl.length) - HALF, lvl.length);
  const fb = project(cam, centerAt(lvl, lvl.length) + HALF, lvl.length);
  const n = 12;
  for (let i = 0; i < n; i++) {
    const x0 = fa.x + ((fb.x - fa.x) * i) / n;
    const w = (fb.x - fa.x) / n;
    const h = 8 * fa.s;
    ctx.fillStyle = i % 2 ? '#1d2124' : '#f4f6f7';
    ctx.fillRect(x0, fa.y - h, w + 1, h);
    ctx.fillStyle = i % 2 ? '#f4f6f7' : '#1d2124';
    ctx.fillRect(x0, fa.y, w + 1, h);
  }

  // streams (dark water across the trail) with bridges
  for (const s of g.scene.streams) {
    const far = project(cam, 0, s.y1);
    const near = project(cam, 0, s.y0);
    if (near.y < -40 || far.y > lh + 40) continue;
    ctx.fillStyle = '#e3edf0';
    ctx.fillRect(-20, far.y - 4 * far.s, lw + 40, near.y - far.y + 8 * near.s);
    ctx.fillStyle = '#2b3135';
    ctx.fillRect(-20, far.y, lw + 40, near.y - far.y);
    ctx.strokeStyle = '#4a545a';
    ctx.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) {
      const yy = far.y + ((near.y - far.y) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(-20, yy);
      for (let xx = -20; xx < lw + 20; xx += 30) ctx.lineTo(xx + 15, yy + (xx % 60 === 0 ? -2 : 2));
      ctx.stroke();
    }
    const mid = (s.y0 + s.y1) / 2;
    const bl = project(cam, s.bx - BRIDGE_HALF, mid);
    const br = project(cam, s.bx + BRIDGE_HALF, mid);
    const bt = project(cam, s.bx, s.y1 + 14);
    const bb = project(cam, s.bx, s.y0 - 14);
    drawBridge(ctx, bl.x, br.x, bt.y, bb.y);
  }
}
