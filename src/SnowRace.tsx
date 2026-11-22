import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { theme } from './theme';
import { BEST_KEY, meters, newGame, update } from './snowrace/engine';
import type { Game, Phase } from './snowrace/engine';
import { LEVELS } from './snowrace/levels';
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
  const levelRef = useRef(LEVELS[0]);
  const bestKey = `${BEST_KEY}-${levelRef.current.id}`;
  const [result, setResult] = useState({ meters: 0, time: 0 });
  const [best, setBest] = useState<number | null>(() => {
    const v = localStorage.getItem(bestKey);
    return v ? Number(v) : null;
  });
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
    gameRef.current = newGame(levelRef.current, lw, lh);
    phaseRef.current = 'playing';
    setPhase('playing');
  }, []);

  // main loop + sizing
  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    const debug = window.location.search.includes('debug') || window.location.hash.includes('debug');
    let frames = 0;
    let acc = 0;
    let fpsText = '';
    let u = 1;
    let dpr = 1;

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      // Pixel-art style does not need native hi-dpi resolution; cap it to save fill rate
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      u = Math.max(0.7, Math.min(1.4, Math.min(w / 420, h / 760)));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const lw = w / u;
      const lh = h / u;
      if (gameRef.current) {
        gameRef.current.lw = lw;
        gameRef.current.lh = lh;
      } else {
        gameRef.current = newGame(levelRef.current, lw, lh);
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
          const next = update(g, dt, (s.right ? 1 : 0) - (s.left ? 1 : 0));
          if (next !== 'playing') {
            phaseRef.current = next;
            const time = g.finishTime ?? g.time;
            setResult({ meters: meters(g), time });
            if (next === 'finished') {
              const key = `${BEST_KEY}-${g.level.id}`;
              const stored = localStorage.getItem(key);
              if (!stored || time < Number(stored)) localStorage.setItem(key, String(time));
              setBest((b) => (b === null || time < b ? time : b));
            }
            setPhase(next);
          }
        }
        ctx.setTransform(dpr * u, 0, 0, dpr * u, 0, 0);
        const t0 = performance.now();
        render(ctx, g, phaseRef.current, now);
        if (debug) {
          acc += performance.now() - t0;
          frames += 1;
          if (frames === 30) {
            fpsText = `render ${(acc / frames).toFixed(1)} ms`;
            frames = 0;
            acc = 0;
          }
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = '#fff';
          ctx.font = '12px monospace';
          ctx.fillText(`${fpsText}  ${(1 / Math.max(dt, 0.001)).toFixed(0)} fps`, 10, canvas.height - 10);
        }
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
      <Overlays phase={phase} pressed={pressed} result={result} best={best} onStart={start} />
    </div>
  );
}

export default SnowRace;
