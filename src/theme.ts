import type { CSSProperties } from 'react';

// ─── Centralt tema för hela appen ─────────────────────────
// Ändra värden här för att styra designen på alla ställen.
export const theme = {
  // Accentfärg – används för primära knappar och highlight
  accent: '#d97706',
  accentHover: '#b45309',
  accentLight: '#fef3c7',
  accentText: '#ffffff',

  // Ytor
  overlay: 'rgba(28, 20, 10, 0.55)',
  card: '#f5f3ef92',
  topCard: 'rgba(245,243,239,0.97)',

  // Text
  textPrimary: '#292524',
  textSecondary: '#78716c',
  textMuted: '#a8a29e',

  // Avgränsningar
  border: '#e7e5e4',
  borderLight: '#f5f0eb',

  // Typografi
  fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  borderRadius: 0,

  // Tabell & komponenter
  tableStripe: '#f5f0eb',
  totalRow: '#fef3c7',
  shareUrlBg: '#f5f0eb',

  // Ghost-knapp
  ghostBorder: '#d6d3d1',
  ghostText: '#57534e',

  // Card-skugga
  cardShadow: '0 12px 40px rgba(0,0,0,0.35)',
  topCardShadow: '0 4px 20px rgba(0,0,0,0.25)',
} as const;

// ─── Grundläggande återanvändbara CSS-stilobjekt ────────────

export const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.overlay,
  zIndex: 1000,
  padding: 'max(16px, env(safe-area-inset-left, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))',
  pointerEvents: 'none',
};

export const cardStyle: CSSProperties = {
  pointerEvents: 'auto',
  backgroundColor: theme.card,
  borderRadius: theme.borderRadius,
  padding: 24,
  maxWidth: 540,
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: theme.cardShadow,
  boxSizing: 'border-box',
};

export const topOverlayStyle: CSSProperties = {
  position: 'fixed',
  top: 'max(12px, env(safe-area-inset-top, 12px))',
  left: 'max(12px, env(safe-area-inset-left, 12px))',
  right: 'max(12px, env(safe-area-inset-right, 12px))',
  display: 'flex',
  justifyContent: 'center',
  zIndex: 1000,
  pointerEvents: 'none',
};

export const topCardStyle: CSSProperties = {
  pointerEvents: 'auto',
  backgroundColor: theme.topCard,
  borderRadius: theme.borderRadius,
  padding: '12px 18px',
  maxWidth: 640,
  width: '100%',
  boxSizing: 'border-box',
  boxShadow: theme.topCardShadow,
};

export const primaryBtn: CSSProperties = {
  backgroundColor: theme.accent,
  color: theme.accentText,
  border: 'none',
  borderRadius: theme.borderRadius,
  padding: '12px 20px',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  minHeight: 44,
};

export const ghostBtn: CSSProperties = {
  backgroundColor: 'transparent',
  color: theme.ghostText,
  border: `1px solid ${theme.ghostBorder}`,
  borderRadius: theme.borderRadius,
  padding: '12px 18px',
  fontSize: 15,
  cursor: 'pointer',
  minHeight: 44,
};

export const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: `2px solid ${theme.border}`,
  fontSize: 13,
  color: theme.textSecondary,
};

export const tdStyle: CSSProperties = {
  padding: '8px 10px',
  borderBottom: `1px solid ${theme.border}`,
  fontSize: 14,
};

// ─── Inline-hjälpfunktioner ────────────────────────────────

export const totalRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.totalRow,
  borderRadius: theme.borderRadius,
  padding: '12px 16px',
  margin: '8px 0 4px',
  fontWeight: 700,
};

export const gradeStyle: CSSProperties = {
  fontSize: 16,
  color: theme.accentHover,
  fontWeight: 700,
  marginBottom: 10,
};

export const shareUrlStyle: CSSProperties = {
  backgroundColor: theme.shareUrlBg,
  borderRadius: theme.borderRadius,
  padding: '8px 10px',
  fontSize: 12,
  wordBreak: 'break-all',
  marginBottom: 10,
  color: theme.textSecondary,
};