import { theme } from '../theme';
import { ORANGE } from './engine';

export const btnBase = {
  position: 'absolute',
  bottom: 0,
  width: 'min(42vw, 190px)',
  height: 'min(42vw, 190px)',
  background: 'rgba(238,106,31,0.45)',
  border: '2px solid rgba(255,255,255,0.25)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 1,
  pointerEvents: 'none',
  transition: 'background 0.08s',
} as const;

export const arrowStyle = { fontSize: 56, lineHeight: 1, marginTop: 4 } as const;

export const sideLabel = {
  position: 'absolute',
  bottom: 'min(43vw, 198px)',
  color: 'rgba(255,255,255,0.85)',
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: 1,
  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
  pointerEvents: 'none',
} as const;

export const overlayBox = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  background: 'rgba(16,24,22,0.62)',
  color: '#fff',
  textAlign: 'center',
  padding: 24,
} as const;

export const bigBtn = {
  background: ORANGE,
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '14px 36px',
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: 1.5,
  cursor: 'pointer',
  minHeight: 52,
  fontFamily: theme.fontFamily,
} as const;

export const homeLink = {
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  color: 'rgba(255,255,255,0.8)',
  background: 'rgba(0,0,0,0.3)',
  borderRadius: 8,
  padding: '4px 12px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1,
  textDecoration: 'none',
  zIndex: 5,
} as const;
