import React from 'react';

// Iconos propios, de trazo, sobre una cuadrícula de 24 × 24.
const PATHS: Record<string, React.ReactNode> = {
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  descarga: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  enlace: (
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  ),
  mando: (
    <>
      <path d="M7.5 8h9a5 5 0 0 1 5 5 3.6 3.6 0 0 1-6.6 2L14 14h-4l-.9 1A3.6 3.6 0 0 1 2.5 13a5 5 0 0 1 5-5z" />
      <path d="M7.5 10.3v2.8M6.1 11.7h2.8" />
      <circle cx="16" cy="11" r="0.6" />
      <circle cx="17.9" cy="12.7" r="0.6" />
    </>
  ),
  pc: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  nube: <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5z" />,
  disco: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  mapa: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  persona: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  grupo: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8M17.8 14.2a6.2 6.2 0 0 1 3.4 5.3" />
    </>
  ),
  radio: (
    <>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M7 8l9-4M14 12.5h4M14 15.5h4" />
      <circle cx="8.5" cy="14" r="2.5" />
    </>
  ),
  musica: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  euro: <path d="M17.5 7.2a6.2 6.2 0 1 0 0 9.6M4.5 10.5h8.5M4.5 13.5h8.5" />,
  alerta: <path d="M12 4l9 16H3zM12 10v4.2M12 17.2v.3" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  cruz: <path d="M6 6l12 12M18 6L6 18" />,
  pregunta: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9.4a2.7 2.7 0 1 1 4 2.4c-.8.5-1.4 1.1-1.4 2.2M12 17v.3" />
    </>
  ),
  candado: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  micro: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </>
  ),
  mundo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  rayo: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" />,
  coche: (
    <>
      <path d="M3.5 16v-3.2L6 8h12l2.5 4.8V16M3.5 13h17" />
      <circle cx="7.5" cy="16.5" r="1.9" />
      <circle cx="16.5" cy="16.5" r="1.9" />
    </>
  ),
  caja: <path d="M3 8l9-4 9 4v9l-9 4-9-4zM3 8l9 4 9-4M12 12v9" />,
  subtitulos: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 12h4M13 12h4M7 15.5h7" />
    </>
  ),
  voz: <path d="M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />,
  escudo: <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />,
  prohibido: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" />
    </>
  ),
  ojo: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  dinero: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v5M18 9.5v5" />
    </>
  ),
  campana: <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2.2 2.2 0 0 0 4 0" />,
  play: <path d="M8 5.5v13l11-6.5z" />,
  flecha: <path d="M4 12h15M13 6l6 6-6 6" />,
  estrella: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />,
  telefono: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M11 18.2h2" />
    </>
  ),
  libro: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />,
  cascos: <path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5.5A1.5 1.5 0 0 1 4 18.5zM20 14h-3v6h1.5a1.5 1.5 0 0 0 1.5-1.5z" />,
};

export type IconName = keyof typeof PATHS;

export const Icon: React.FC<{name: string; size?: number; color?: string; stroke?: number; style?: React.CSSProperties}> = ({
  name,
  size = 48,
  color = 'currentColor',
  stroke = 2,
  style,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{flexShrink: 0, ...style}}
  >
    {PATHS[name] ?? PATHS.pregunta}
  </svg>
);
