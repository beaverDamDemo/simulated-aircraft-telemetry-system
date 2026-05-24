import L from 'leaflet';

export const AIRCRAFT_SVG = (
  heading,
  { grayscale = false, opacity = 1 } = {},
) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 64 64"
    style="transform:rotate(${heading}deg);transform-origin:center;filter:${
  grayscale ? 'grayscale(100%) ' : ''
}drop-shadow(0 2px 4px rgba(0,0,0,0.45));opacity:${opacity};">
    <g>
      <rect x="28" y="10" width="8" height="34" rx="4" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
      <path d="M32 4 L38 14 L26 14 Z" fill="#fde047" stroke="#ca8a04" stroke-width="0.8"/>
      <path d="M32 24 L6 35 L32 31 L58 35 Z" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
      <path d="M32 38 L18 48 L32 45 L46 48 Z" fill="#f59e0b" stroke="#ca8a04" stroke-width="0.8"/>
      <ellipse cx="21" cy="34" rx="4" ry="6" fill="#fbbf24" stroke="#ca8a04" stroke-width="0.6"/>
      <ellipse cx="43" cy="34" rx="4" ry="6" fill="#fbbf24" stroke="#ca8a04" stroke-width="0.6"/>
      <ellipse cx="32" cy="9" rx="2" ry="3" fill="#fff7cc" opacity="0.9"/>
    </g>
  </svg>
`;

export const makeAircraftIcon = (heading, options = {}) =>
  L.divIcon({
    html: AIRCRAFT_SVG(heading, options),
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
