import { ORANGE } from './engine';
import { grid } from './draw';

type Ctx = CanvasRenderingContext2D;

// Pixelated snowmobile seen from behind and above, with a rider leaning into the turn.
// (x, y) = ground point under the sled, s = perspective scale, lean = -1..1
export function drawSled(ctx: Ctx, x: number, y: number, s: number, angle: number, lean: number) {
  const q = 2.7 * s;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(90,110,120,0.32)';
  ctx.beginPath();
  ctx.ellipse(3 * s, 2 * s, 22 * s, 36 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(angle);
  const r = grid(ctx, 0, 0, q);
  // skis (far end) with snowy tips
  r(-8, -20, 2, 9, '#1d2124'); r(6, -20, 2, 9, '#1d2124');
  r(-8, -21, 2, 1, '#f2f6f7'); r(6, -21, 2, 1, '#f2f6f7');
  // hood
  r(-5, -17, 10, 7, '#c4510f');
  r(-4, -18, 8, 1, '#c4510f');
  r(-4, -17, 8, 6, ORANGE);
  r(-1, -17, 2, 6, '#ff8a45');
  r(-3, -18, 6, 1, '#ff8a45');
  // headlights + windshield
  r(-3, -17, 1, 1, '#fff3b0'); r(2, -17, 1, 1, '#fff3b0');
  r(-4, -10, 8, 2, '#bcd9e6'); r(-3, -11, 6, 1, '#e4f2f8');
  // side panels (darker flank, lighter top edge) for a 3D feel
  r(-7, -9, 2, 12, '#c4510f'); r(5, -9, 2, 12, '#c4510f');
  r(-6, -9, 1, 12, ORANGE); r(5, -9, 1, 12, '#9a3d0a');
  r(-7, -9, 14, 1, '#ff8a45');
  // body mid
  r(-5, -9, 10, 11, ORANGE);
  r(-5, -9, 10, 1, '#ff8a45');
  r(-5, 1, 10, 1, '#9a3d0a');
  // seat
  r(-4, 0, 8, 7, '#23272a'); r(-4, 0, 8, 1, '#3a4045');
  // rear track + tail lights
  r(-5, 7, 10, 4, '#15181a');
  r(-4, 8, 1, 3, '#2a2f33'); r(-1, 8, 1, 3, '#2a2f33'); r(2, 8, 1, 3, '#2a2f33');
  r(-4, 6, 2, 1, '#d81f1f'); r(2, 6, 2, 1, '#d81f1f');
  // handlebar
  r(-7, -6, 14, 1, '#15181a'); r(-7, -7, 1, 2, '#15181a'); r(6, -7, 1, 2, '#15181a');
  // rider: legs, then torso rows shifting progressively (leans into the turn like an MC racer)
  const sh = lean * 2.2;
  r(-4 + sh * 0.2, 0, 3, 5, '#1d2a3a'); r(1 + sh * 0.2, 0, 3, 5, '#1d2a3a');
  for (let i = 0; i < 6; i++) {
    const off = sh * ((6 - i) / 6);
    r(-3 + off, -6 + i, 6, 1, i < 2 ? '#2f5d8a' : '#264d73');
  }
  r(-3 + sh * 0.5, -3, 6, 1, '#d9e24a'); // reflective stripe
  // arms to the handlebar + gloves
  r(-6 + sh * 0.9, -6, 3, 1, '#264d73'); r(3 + sh * 0.9, -6, 3, 1, '#264d73');
  r(-5 + sh * 0.7, -5, 1, 1, '#264d73'); r(4 + sh * 0.7, -5, 1, 1, '#264d73');
  r(-7, -6, 1, 1, '#111'); r(6, -6, 1, 1, '#111');
  // helmet
  const hx = sh * 1.5;
  r(-3 + hx, -11, 6, 5, '#f4f6f7');
  r(-2 + hx, -12, 4, 1, '#f4f6f7');
  r(-3 + hx, -9, 6, 1, '#d81f1f');
  r(2 + hx, -11, 1, 5, '#c9d0d3');
  r(-1 + hx, -7, 2, 1, '#2a2f33');
  ctx.restore();
}
