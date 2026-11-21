import { theme } from '../theme';
import { MAX_LIVES, ORANGE, meters } from './engine';
import type { Game, Phase } from './engine';
import { drawRock, drawSledIcon, drawTree } from './draw';
import { drawSled } from './sled';
import { drawDog, drawFire, drawFlag } from './props';
import { drawGround } from './ground';
import { lowerBound } from './scene';
import { makeCam, project } from './camera';

type Ctx = CanvasRenderingContext2D;

function drawHud(ctx: Ctx, g: Game) {
  const { lw, lh } = g;
  const pad = 16;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 4;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `700 12px ${theme.fontFamily}`;
  ctx.fillText('POINTS', pad, pad);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 28px ${theme.fontFamily}`;
  ctx.fillText(String(meters(g)), pad, pad + 14);
  ctx.font = `700 13px ${theme.fontFamily}`;
  ctx.fillText(`${g.time.toFixed(1)} s`, pad, pad + 46);
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

  if (g.notice > 0) {
    const a = Math.min(1, g.notice * 2);
    const pop = 1 + Math.max(0, g.notice - 1.9) * 2;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(lw / 2, lh * 0.28);
    ctx.scale(pop, pop);
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#ffb52e';
    ctx.font = `900 34px ${theme.fontFamily}`;
    ctx.fillText('Speed up!', 0, 0);
    ctx.restore();
  }
}

type Item = { y: number; kind: 0 | 1 | 2 | 3 | 4 | 5; i: number };

export function render(ctx: Ctx, g: Game, phase: Phase, now: number) {
  const { lw, lh, scene } = g;
  const cam = makeCam(g.camX, g.y, lw, lh);
  const t = now / 1000;

  ctx.save();
  if (g.shake > 0) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
  ctx.fillStyle = '#16211d';
  ctx.fillRect(-20, -20, lw + 40, lh + 40);

  drawGround(ctx, g, cam);

  // depth-sorted objects (far first)
  const yMin = g.y - 330;
  const yMax = g.y + 1900;
  const items: Item[] = [{ y: g.y, kind: 2, i: 0 }];
  for (let i = lowerBound(scene.trees, yMin); i < scene.trees.length && scene.trees[i].y < yMax; i++) {
    items.push({ y: scene.trees[i].y, kind: 0, i });
  }
  for (let i = lowerBound(scene.rocks, yMin); i < scene.rocks.length && scene.rocks[i].y < yMax; i++) {
    items.push({ y: scene.rocks[i].y, kind: 1, i });
  }
  if (scene.fire.y > yMin && scene.fire.y < yMax) {
    items.push({ y: scene.fire.y, kind: 3, i: 0 }, { y: scene.dog.y, kind: 4, i: 0 });
  }
  const fy = g.level.length;
  if (fy > yMin && fy < yMax) {
    items.push({ y: fy, kind: 5, i: 0 }, { y: fy, kind: 5, i: 1 });
  }
  items.sort((a, b) => b.y - a.y);

  for (const it of items) {
    switch (it.kind) {
      case 0: {
        const o = scene.trees[it.i];
        const p = project(cam, o.x, o.y);
        if (p.y > -40 && p.y < lh + 140) drawTree(ctx, p.x, p.y, o.s * p.s, o.v);
        break;
      }
      case 1: {
        const o = scene.rocks[it.i];
        const p = project(cam, o.x, o.y);
        if (p.y > -20 && p.y < lh + 60) drawRock(ctx, p.x, p.y, o.s * p.s);
        break;
      }
      case 2: {
        const blink = g.invuln > 0 && Math.floor(g.invuln * 12) % 2 === 0;
        if (blink) break;
        const p = project(cam, g.x, g.y);
        drawSled(ctx, p.x, p.y, p.s, g.heading * 0.5 + Math.atan2(g.vx, g.speed) * 0.4, g.lean);
        break;
      }
      case 3: {
        const p = project(cam, scene.fire.x, scene.fire.y);
        drawFire(ctx, p.x, p.y, p.s, t);
        break;
      }
      case 4: {
        const p = project(cam, scene.dog.x, scene.dog.y);
        drawDog(ctx, p.x, p.y, p.s, t);
        break;
      }
      default: {
        const side = it.i === 0 ? -1 : 1;
        const p = project(cam, scene.clearing.x + side * 135, fy);
        drawFlag(ctx, p.x, p.y, p.s, t);
      }
    }
  }

  // snow spray thrown up behind the sled
  for (const sp of g.spray) {
    const p = project(cam, sp.x, sp.y);
    const a = Math.min(1, sp.life * 2.2);
    ctx.fillStyle = `rgba(250,253,255,${a.toFixed(2)})`;
    const sz = Math.max(2, Math.round((2 + sp.life * 4) * p.s));
    ctx.fillRect(Math.round(p.x), Math.round(p.y - sp.z * p.s), sz, sz);
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
