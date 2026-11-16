import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease, envelope} from '../lib/anim';
import {C, F, SAFE, SUNSET, SUNSET_H} from '../theme';

/** Emblema del canal: sol de atardecer con una palmera. Sirve como avatar y como mosca. */
export const Mark: React.FC<{size: number; plain?: boolean; square?: boolean}> = ({size, plain, square}) => {
  const fronds = [-172, -140, -108, -74, -40, -8, 24];
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{flexShrink: 0}}>
      <defs>
        <linearGradient id="mk-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0518" />
          <stop offset="0.62" stopColor="#3a1573" />
          <stop offset="1" stopColor="#b62a7c" />
        </linearGradient>
        <linearGradient id="mk-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.yellow} />
          <stop offset="0.45" stopColor={C.orange} />
          <stop offset="1" stopColor={C.magenta} />
        </linearGradient>
        <clipPath id="mk-clip">
          <circle cx="100" cy="100" r="100" />
        </clipPath>
        <mask id="mk-slits">
          <rect x="0" y="0" width="200" height="200" fill="#fff" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="20" y={112 + i * 12.5} width="160" height={2.4 + i * 1.5} fill="#000" />
          ))}
        </mask>
      </defs>
      <g clipPath={plain || square ? undefined : 'url(#mk-clip)'}>
        {plain ? null : <rect x="0" y="0" width="200" height="200" fill="url(#mk-bg)" />}
        <circle cx="108" cy="104" r="64" fill="url(#mk-sun)" mask="url(#mk-slits)" />
        <g fill="#0a0416">
          <path d="M 44 206 Q 60 150 82 78 L 91 80 Q 72 152 62 206 Z" />
          <g transform="translate(86 78)">
            {fronds.map((deg, i) => {
              const a = (deg * Math.PI) / 180;
              const len = 58 + (i % 2) * 10;
              const ex = Math.cos(a) * len;
              const ey = Math.sin(a) * len * 0.8 + len * 0.38;
              const cx = Math.cos(a) * len * 0.55;
              const cy = Math.sin(a) * len * 0.95 - 13;
              return <path key={deg} d={`M 0 0 Q ${cx} ${cy} ${ex} ${ey} Q ${cx * 0.86} ${cy + 22} 0 7 Z`} />;
            })}
            <circle r="5" />
          </g>
        </g>
      </g>
    </svg>
  );
};

export const GradientText: React.FC<{children: React.ReactNode; style?: React.CSSProperties; horizontal?: boolean}> = ({
  children,
  style,
  horizontal,
}) => (
  <span
    style={{
      backgroundImage: horizontal ? SUNSET_H : SUNSET,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      // deja sitio a tildes y descendentes dentro del recorte del degradado
      paddingTop: '0.12em',
      paddingBottom: '0.06em',
      ...style,
    }}
  >
    {children}
  </span>
);

export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties; glow?: string}> = ({children, style, glow}) => (
  <div
    style={{
      background: C.card,
      border: `2px solid ${glow ?? C.stroke}`,
      borderRadius: 30,
      boxShadow: glow ? `0 0 0 1px ${glow}55, 0 18px 60px ${glow}33` : '0 18px 50px rgba(0,0,0,0.45)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{children: React.ReactNode; color?: string; solid?: boolean; style?: React.CSSProperties}> = ({
  children,
  color = C.teal,
  solid,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: F.mono,
      fontWeight: 700,
      fontSize: 28,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: solid ? C.night : color,
      background: solid ? color : `${color}1f`,
      border: `2px solid ${color}`,
      borderRadius: 999,
      padding: '10px 24px',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Título de escena con una barra de atardecer que se dibuja al entrar. */
export const SceneTitle: React.FC<{children: React.ReactNode; size?: number; start?: number}> = ({children, size = 76, start = 2}) => {
  const frame = useCurrentFrame();
  const t = ease(frame, start, 16);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 26, opacity: t, transform: `translateX(${(1 - t) * -30}px)`}}>
      <div style={{width: 14, height: size * 0.92, borderRadius: 7, background: SUNSET, transform: `scaleY(${t})`}} />
      <div style={{fontFamily: F.display, fontSize: size, lineHeight: 1.08, color: C.text, textTransform: 'uppercase', letterSpacing: 1}}>
        {children}
      </div>
    </div>
  );
};

/** Marco común de toda escena: respeta la zona segura y aplica la entrada y la salida. */
export const Shell: React.FC<{dur: number; children: React.ReactNode; style?: React.CSSProperties; pad?: boolean}> = ({
  dur,
  children,
  style,
  pad = true,
}) => {
  const frame = useCurrentFrame();
  const e = envelope(frame, dur);
  const out = frame > dur / 2;
  return (
    <AbsoluteFill
      style={{
        opacity: e,
        transform: `scale(${out ? 1 + (1 - e) * 0.03 : 0.985 + e * 0.015})`,
        padding: pad ? `${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px` : 0,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
