import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { theme } from './theme';
import { BEST_KEY, newGame, update } from './snowrace/engine';
import type { Game, Phase } from './snowrace/engine';
import { render } from './snowrace/render';
import Overlays from './snowrace/Overlays';

function SnowRace() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const phaseRef = useRef<Phase>('menu');
  const steerRef = useRef({ left: false, right: false });
  const keysRef = useRef({ left: false, right: false });
  const pointersRef = useRef(new Map<number, 'l' | 'r'>());

  const [phase, setPhase] = useState<Phase>('menu');
  const [final, setFinal] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const [pressed, setPressed] = useState({ left: false, right: false });

  const syncInput = useCallback(() => {
    let l = keysRef.current.left;
    let r = keysRef.current.right;
    for (const side of pointersRef.current.values()) {
      if (side === 'l') l = true; else r = true;
    }
    steerRef.current = { left: l, right: r };
    setPressed((p) => (p.left === l && p.right === r ? p : { left: l, right: r }));
  }, []);

  const start = useCallback(() => {
    const old = gameRef.current;
    const el = wrapRef.current;
    const lw = old?.lw ?? (el ? el.clientWidth : 400);
    const lh = old?.lh ?? (el ? el.clientHeight : 800);
    gameRef.current = newGame(lw, lh);
    phaseRef.current = 'playing';
    setPhase('playing');
  }, []);

  // main loop + sizing
  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext('2d')!;
    let u = 1;
    let dpr = 1;

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      dpr = window.devicePixelRatio || 1;
      u = Math.max(0.7, Math.min(1.4, Math.min(w / 420, h / 760)));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const lw = w / u;
      const lh = h / u;
      if (gameRef.current) {
        gameRef.current.lw = lw;
        gameRef.current.lh = lh;
      } else {
        gameRef.current = newGame(lw, lh);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const g = gameRef.current;
      if (g) {
        if (phaseRef.current === 'playing') {
          const s = steerRef.current;
          const over = update(g, dt, (s.right ? 1 : 0) - (s.left ? 1 : 0));
          if (over) {
            phaseRef.current = 'over';
            const score = g.score;
            setFinal(score);
            setBest((b) => Math.max(b, score));
            const stored = Number(localStorage.getItem(BEST_KEY) || 0);
            if (score > stored) localStorage.setItem(BEST_KEY, String(score));
            setPhase('over');
          }
        }
        ctx.setTransform(dpr * u, 0, 0, dpr * u, 0, 0);
        render(ctx, g, phaseRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // keyboard
  useEffect(() => {
    const handle = (e: KeyboardEvent, down: boolean) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = down; syncInput(); e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = down; syncInput(); e.preventDefault();
      } else if (down && (e.key === 'Enter' || e.key === ' ') && phaseRef.current !== 'playing') {
        start(); e.preventDefault();
      }
    };
    const kd = (e: KeyboardEvent) => handle(e, true);
    const ku = (e: KeyboardEvent) => handle(e, false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [start, syncInput]);

  const sideOf = (e: ReactPointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return e.clientX - rect.left < rect.width / 2 ? 'l' : 'r';
  };
  const onDown = (e: ReactPointerEvent) => {
    pointersRef.current.set(e.pointerId, sideOf(e));
    syncInput();
  };
  const onMove = (e: ReactPointerEvent) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, sideOf(e));
      syncInput();
    }
  };
  const onUp = (e: ReactPointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    syncInput();
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#16211d',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overflow: 'hidden',
        fontFamily: theme.fontFamily,
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <Overlays phase={phase} pressed={pressed} final={final} best={best} onStart={start} />
    </div>
  );
}

export default SnowRace;
