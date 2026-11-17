import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Phase } from './engine';
import { arrowStyle, bigBtn, btnBase, homeLink, overlayBox, sideLabel } from './styles';

interface Props {
  phase: Phase;
  pressed: { left: boolean; right: boolean };
  final: number;
  best: number;
  onStart: () => void;
}

const stop = (e: ReactPointerEvent) => e.stopPropagation();

function Overlays({ phase, pressed, final, best, onStart }: Props) {
  return (
    <>
      {phase === 'playing' && (
        <>
          <div style={{ ...sideLabel, left: 16 }}>TURN LEFT</div>
          <div style={{ ...sideLabel, right: 16 }}>TURN RIGHT</div>
          <div
            style={{
              ...btnBase,
              left: 0,
              borderTopRightRadius: '100%',
              alignItems: 'flex-start',
              paddingLeft: 'min(8vw, 36px)',
              background: pressed.left ? 'rgba(238,106,31,0.8)' : btnBase.background,
            }}
          >
            <span>HOLD</span>
            <span style={arrowStyle}>↶</span>
          </div>
          <div
            style={{
              ...btnBase,
              right: 0,
              borderTopLeftRadius: '100%',
              alignItems: 'flex-end',
              paddingRight: 'min(8vw, 36px)',
              background: pressed.right ? 'rgba(238,106,31,0.8)' : btnBase.background,
            }}
          >
            <span>HOLD</span>
            <span style={arrowStyle}>↷</span>
          </div>
        </>
      )}

      <a href="#" onPointerDown={stop} style={homeLink}>← HOME</a>

      {phase === 'menu' && (
        <div style={overlayBox} onPointerDown={stop}>
          <div style={{ fontSize: 56 }}>🛷</div>
          <h1 style={{ margin: 0, fontSize: 44, fontWeight: 900, letterSpacing: 3 }}>SNOWRACE</h1>
          <p style={{ margin: 0, maxWidth: 320, opacity: 0.85 }}>
            Hold the left or right side of the screen to steer. Dodge trees and rocks, and line up with the
            bridges to cross the streams.
          </p>
          <button style={bigBtn} onClick={onStart}>START</button>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.6 }}>Desktop: ← / → arrow keys</p>
        </div>
      )}

      {phase === 'over' && (
        <div style={overlayBox} onPointerDown={stop}>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, letterSpacing: 2 }}>GAME OVER</h1>
          <div style={{ fontSize: 13, letterSpacing: 2, opacity: 0.75 }}>POINTS</div>
          <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{final}</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>BEST: {best}</div>
          <button style={bigBtn} onClick={onStart}>PLAY AGAIN</button>
        </div>
      )}
    </>
  );
}

export default Overlays;
