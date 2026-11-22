// Small pixel-style snowmobile icon (side view), used instead of an emoji
function SnowmobileIcon({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.66}
      viewBox="0 0 24 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* ski */}
      <rect x="1" y="13" width="9" height="1" fill="#2b2f32" />
      <rect x="0" y="12" width="2" height="1" fill="#2b2f32" />
      <rect x="4" y="11" width="1" height="2" fill="#2b2f32" />
      {/* track */}
      <rect x="11" y="12" width="12" height="3" fill="#15181a" />
      <rect x="12" y="13" width="1" height="1" fill="#3a4045" />
      <rect x="15" y="13" width="1" height="1" fill="#3a4045" />
      <rect x="18" y="13" width="1" height="1" fill="#3a4045" />
      <rect x="21" y="13" width="1" height="1" fill="#3a4045" />
      {/* body */}
      <rect x="3" y="9" width="9" height="3" fill="#ee6a1f" />
      <rect x="5" y="8" width="6" height="1" fill="#ff8a45" />
      <rect x="11" y="9" width="10" height="3" fill="#c4510f" />
      <rect x="3" y="11" width="18" height="1" fill="#9a3d0a" />
      {/* windshield + light */}
      <rect x="9" y="5" width="1" height="3" fill="#bcd9e6" />
      <rect x="2" y="9" width="1" height="1" fill="#fff3b0" />
      {/* seat */}
      <rect x="12" y="8" width="8" height="1" fill="#23272a" />
      {/* rider */}
      <rect x="13" y="4" width="3" height="4" fill="#2f5d8a" />
      <rect x="11" y="5" width="3" height="1" fill="#264d73" />
      <rect x="14" y="1" width="3" height="3" fill="#f4f6f7" />
      <rect x="14" y="3" width="3" height="1" fill="#d81f1f" />
      <rect x="16" y="8" width="3" height="1" fill="#1d2a3a" />
    </svg>
  );
}

export default SnowmobileIcon;
