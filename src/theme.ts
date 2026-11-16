// Identidad visual del canal: una sola fuente de verdad para colores, tipografías y medidas.

export const C = {
  night: '#090514',
  night2: '#150a2e',
  violet: '#3a1873',
  purple: '#8b2fd8',
  lilac: '#b98cff',
  magenta: '#ff3d81',
  orange: '#ff7a45',
  yellow: '#ffd166',
  teal: '#27e6c8',
  sky: '#57c7ff',
  text: '#fff7fb',
  muted: '#c3b4e0',
  dim: '#8676ad',
  ok: '#3ddc97',
  no: '#ff4d6d',
  warn: '#ffc857',
  card: 'rgba(20, 11, 44, 0.78)',
  cardSolid: '#160c30',
  stroke: 'rgba(255, 255, 255, 0.14)',
} as const;

export const SUNSET = `linear-gradient(180deg, ${C.yellow} 0%, ${C.orange} 40%, ${C.magenta} 78%, ${C.purple} 100%)`;
export const SUNSET_H = `linear-gradient(90deg, ${C.yellow} 0%, ${C.orange} 45%, ${C.magenta} 100%)`;

export const F = {
  display: 'Anton, "Arial Narrow", sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Zona segura: los subtítulos y la barra de progreso viven por debajo de SAFE.bottom.
export const SAFE = {left: 110, right: 110, top: 138, bottom: 190} as const;

export type Tone = 'ok' | 'no' | 'warn' | 'info';

export const toneColor = (tone: Tone | undefined): string => {
  switch (tone) {
    case 'ok':
      return C.ok;
    case 'no':
      return C.no;
    case 'warn':
      return C.warn;
    default:
      return C.teal;
  }
};
