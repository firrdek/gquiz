import { theme } from './theme';

const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 24,
  padding: 24,
  maxWidth: 600,
  width: '100%',
} as const;

const appCard = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  textDecoration: 'none',
  backgroundColor: 'rgba(245,243,239,0.92)',
  borderRadius: 16,
  padding: '40px 24px',
  minHeight: 200,
  cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  transition: 'transform 0.15s, box-shadow 0.15s',
  border: 'none',
  color: 'inherit',
} as const;

const appCardTitle = {
  fontSize: 24,
  fontWeight: 700,
  color: theme.textPrimary,
  margin: '0 0 6px',
} as const;

const appCardDescription = {
  fontSize: 14,
  color: theme.textSecondary,
  margin: 0,
} as const;

function StartPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1c140a',
        fontFamily: theme.fontFamily,
      }}
    >
      <div style={cardGrid}>
        {/* CityQuiz card */}
        <a
          href="#cityquiz"
          className="app-card"
          style={appCard}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <h2 style={appCardTitle}>CityQuiz</h2>
          <p style={appCardDescription}>
            Find cities on the world map and score points
          </p>
        </a>

        {/* SnowRace card */}
        <a
          href="#snowrace"
          className="app-card"
          style={appCard}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛷</div>
          <h2 style={appCardTitle}>SnowRace</h2>
          <p style={appCardDescription}>
            Race a snowmobile through the spruce forest
          </p>
        </a>
      </div>
    </div>
  );
}

export default StartPage;