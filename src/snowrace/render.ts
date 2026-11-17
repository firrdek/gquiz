import { theme } from '../theme';
import { HALF, K, MAX_LIVES, ORANGE, center } from './engine';
import type { Game, Phase, Rock, Tree } from './engine';
import { drawRock, drawSled, drawSledIcon, drawTree } from './draw';

type Ctx = CanvasRenderingContext2D;

function drawGround(ctx: Ctx, g: Game, sx: (x: number) => number, worldY: (y: number) => number) {
  const bands: Array<[number, string]> = [[HALF + 32, '#d3e0e5'], [HALF + 6, '#f7fafb']];
  const rows: number[] = [];
  for (let s = -30; s <= g.lh + 30; s += 8) rows.push(s);
  for (const [w, color] of bands) {
    ctx.fillStyle = color;
    ctx.beginPath();
    rows.forEach((s, i) => {
      const px = sx(center(worldY(s)) - w);
      if (i === 0) ctx.moveTo(px, s); else ctx.lineTo(px, s);
    });
    for (let i = rows.length - 1; i >= 0; i--) {
      ctx.lineTo(sx(center(worldY(rows[i])) + w), rows[i]);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawStreams(ctx: Ctx, g: Game, sx: (x: number) => number, sy: (y: number) => number) {
  const { lw, lh } = g;
  for (const s of g.streams) {
    const top = sy(s.y1);
    const bottom = sy(s.y0);
    if (bottom < -40 || top > lh + 40) continue;
    ctx.fillStyle = '#2b3135';
    ctx.fillRect(-20, top, lw + 40, bottom - top);
    ctx.fillStyle = '#e3edf0';
    ctx.fillRect(-20, top - 3, lw + 40, 3);
    ctx.fillRect(-20, bottom, lw + 40, 3);
    ctx.strokeStyle = '#4a545a';
    ctx.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) {
      const yy = top + ((bottom - top) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(-20, yy);
      for (let xx = -20; xx < lw + 20; xx += 30) ctx.lineTo(xx + 15, yy + (xx % 60 === 0 ? -2 : 2));
      ctx.stroke();
    }
    // bridge
    const x1 = sx(s.bx - 40);
    const x2 = sx(s.bx + 40);
    const bt = sy(s.y1 + 16);
    const bb = sy(s.y0 - 16);
    ctx.fillStyle = '#14100e';
    ctx.fillRect(x1, bt + 5, x2 - x1, bb - bt);
    const n = 10;
    const ph = (bb - bt) / n;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i % 2 ? '#4d4139' : '#3c322b';
      ctx.fillRect(x1, bt + i * ph, x2 - x1, ph - 2);
    }
    ctx.fillStyle = '#2a211b';
    ctx.fillRect(x1 - 4, bt - 4, 6, bb - bt + 8);
    ctx.fillRect(x2 - 2, bt - 4, 6, bb - bt + 8);
    ctx.fillStyle = '#f2f6f7';
    ctx.fillRect(x1 - 4, bt - 4, 6, 4);
    ctx.fillRect(x2 - 2, bt - 4, 6, 4);
  }
}

function drawTracks(ctx: Ctx, g: Game, sx: (x: number) => number, sy: (y: number) => number) {
  if (g.track.length < 2) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const layers: Array<[number, string, number]> = [
    [1, 'rgba(38,43,47,0.7)', 4],
    [0.6, 'rgba(38,43,47,0.35)', 2],
  ];
  for (const off of [-10, 10]) {
    for (const [k, color, width] of layers) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      g.track.forEach((p, i) => {
        const x = sx(p.x + off * k);
        const y = sy(p.y);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }
}

function drawHud(ctx: Ctx, g: Game) {
  const { lw } = g;
  const pad = 16;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `700 12px ${theme.fontFamily}`;
  ctx.fillText(`LEVEL ${Math.floor(g.score / 500) + 1}`, pad, pad);
  ctx.fillText('POINTS', pad, pad + 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 28px ${theme.fontFamily}`;
  ctx.fillText(String(g.score), pad, pad + 30);
  ctx.shadowBlur = 0;

  const pw = MAX_LIVES * 32 + 14;
  const px0 = lw - pad - pw;
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.beginPath();
  ctx.roundRect(px0, pad, pw, 30, 8);
  ctx.fill();
  for (let i = 0; i < MAX_LIVES; i++) {
    drawSledIcon(ctx, px0 + 8 + i * 32, pad + 6, i < g.lives ? ORANGE : '#9aa3a8');
  }
}

export function render(ctx: Ctx, g: Game, phase: Phase) {
  const { lw, lh } = g;
  const py = lh * 0.72;
  const sx = (x: number) => lw / 2 + (x - g.camX);
  const sy = (y: number) => py - (y - g.y) * K;
  const worldY = (screenY: number) => g.y + (py - screenY) / K;

  ctx.save();
  if (g.shake > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

  ctx.fillStyle = '#16211d';
  ctx.fillRect(-20, -20, lw + 40, lh + 40);

  drawGround(ctx, g, sx, worldY);
  drawStreams(ctx, g, sx, sy);
  drawTracks(ctx, g, sx, sy);

  // depth-sorted objects (far first)
  type Item = { y: number; kind: 0 | 1 | 2; o?: Tree | Rock };
  const items: Item[] = [{ y: g.y, kind: 2 }];
  for (const t of g.trees) {
    const y = sy(t.y);
    if (y > -20 && y < lh + 140) items.push({ y: t.y, kind: 0, o: t });
  }
  for (const r of g.rocks) {
    const y = sy(r.y);
    if (y > -20 && y < lh + 60) items.push({ y: r.y, kind: 1, o: r });
  }
  items.sort((a, b) => b.y - a.y);
  for (const it of items) {
    if (it.kind === 2) {
      const blink = g.invuln > 0 && Math.floor(g.invuln * 12) % 2 === 0;
      if (!blink) drawSled(ctx, sx(g.x), py, g.heading * 0.8 + Math.atan2(g.vx, g.speed) * 0.4);
    } else if (it.o) {
      const x = sx(it.o.x);
      const y = sy(it.o.y);
      if (it.kind === 0) drawTree(ctx, x, y, it.o.s); else drawRock(ctx, x, y, it.o.s);
    }
  }

  // snowfall
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const f of g.flakes) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (phase === 'playing') drawHud(ctx, g);
}
