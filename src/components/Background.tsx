import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {C, H, W} from '../theme';

const HORIZON = 700;

const Palm: React.FC<{x: number; h: number; lean: number; scale: number; phase: number; flip?: boolean}> = ({
  x,
  h,
  lean,
  scale,
  phase,
  flip,
}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 38 + phase) * 1.6;
  const fronds = [-176, -150, -122, -96, -68, -40, -14, 12, 34];
  return (
    <g transform={`translate(${x} ${H + 30}) scale(${flip ? -scale : scale} ${scale}) rotate(${sway})`}>
      <path
        d={`M -17 0 Q ${lean * 0.25 - 10} ${-h * 0.55} ${lean - 7} ${-h} L ${lean + 7} ${-h} Q ${lean * 0.25 + 14} ${-h * 0.55} 17 0 Z`}
        fill="#07030f"
      />
      <g transform={`translate(${lean} ${-h})`}>
        {fronds.map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          const len = 215 + (i % 3) * 34;
          const bend = Math.sin(frame / 30 + phase + i) * 5;
          const ex = Math.cos(a) * len;
          const ey = Math.sin(a) * len * 0.8 + len * 0.36 + bend;
          const cx = Math.cos(a) * len * 0.55;
          const cy = Math.sin(a) * len * 0.95 - 46;
          return (
            <path
              key={deg}
              d={`M 0 0 Q ${cx} ${cy} ${ex} ${ey} Q ${cx * 0.92} ${cy + 46} 0 14 Z`}
              fill="#07030f"
            />
          );
        })}
        <circle r={15} fill="#07030f" />
      </g>
    </g>
  );
};

const Skyline: React.FC = () => {
  const blocks: React.ReactNode[] = [];
  let x = -20;
  let i = 0;
  while (x < W + 20) {
    const w = 34 + random(`sk-w-${i}`) * 62;
    const tall = random(`sk-t-${i}`) > 0.82;
    const h = 22 + random(`sk-h-${i}`) * (tall ? 150 : 62);
    blocks.push(<rect key={`b${i}`} x={x} y={HORIZON - h} width={w} height={h + 2} fill="#0d0620" />);
    const rows = Math.floor(h / 15);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < Math.floor(w / 13); c++) {
        if (random(`sk-l-${i}-${r}-${c}`) > 0.72) {
          blocks.push(
            <rect
              key={`l${i}-${r}-${c}`}
              x={x + 5 + c * 13}
              y={HORIZON - h + 7 + r * 15}
              width={4}
              height={5}
              fill={random(`sk-c-${i}-${r}-${c}`) > 0.5 ? C.yellow : C.magenta}
              opacity={0.55}
            />,
          );
        }
      }
    }
    x += w + 3;
    i++;
  }
  return <g>{blocks}</g>;
};

export type BgProps = {
  /** 0 = protagonista (ganchos, cierres) · 1 = atenuado para que mande el contenido. */
  calm: number;
  /** Posición horizontal del sol, de 0 a 1. */
  sunX?: number;
};

export const Background: React.FC<BgProps> = ({calm, sunX = 0.5}) => {
  const frame = useCurrentFrame();
  const cx = W * sunX + Math.sin(frame / 210) * 8;
  const cy = HORIZON - 120;
  const R = 280;
  const slitPhase = (frame / 150) % 1;
  const gridPhase = (frame / 34) % 1;

  const slits = Array.from({length: 8}, (_, i) => {
    const t = (i + slitPhase) / 8;
    const y = cy - 30 + t * (R + 40);
    return {y, h: 3 + t * 24};
  });

  const hLines = Array.from({length: 13}, (_, i) => {
    const t = (i + gridPhase) / 13;
    return HORIZON + Math.pow(t, 2.3) * (H - HORIZON);
  });
  const vLines = Array.from({length: 33}, (_, i) => i - 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.night}}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#070312" />
            <stop offset="0.45" stopColor="#1a0a3a" />
            <stop offset="0.8" stopColor="#4d1270" />
            <stop offset="1" stopColor="#c02a7a" />
          </linearGradient>
          <linearGradient id="bg-sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.yellow} />
            <stop offset="0.42" stopColor={C.orange} />
            <stop offset="0.8" stopColor={C.magenta} />
            <stop offset="1" stopColor={C.purple} />
          </linearGradient>
          <radialGradient id="bg-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={C.magenta} stopOpacity="0.55" />
            <stop offset="0.5" stopColor={C.magenta} stopOpacity="0.16" />
            <stop offset="1" stopColor={C.magenta} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bg-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a0b4d" />
            <stop offset="1" stopColor="#05020c" />
          </linearGradient>
          <linearGradient id="bg-gridfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.25" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="bg-gridmask">
            <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#bg-gridfade)" />
          </mask>
          <mask id="bg-sunmask">
            <rect x="0" y="0" width={W} height={HORIZON} fill="#fff" />
            {slits.map((s, i) => (
              <rect key={i} x={cx - R - 10} y={s.y} width={R * 2 + 20} height={s.h} fill="#000" />
            ))}
          </mask>
        </defs>

        <rect x="0" y="0" width={W} height={HORIZON + 2} fill="url(#bg-sky)" />

        {Array.from({length: 90}, (_, i) => {
          const x = random(`st-x-${i}`) * W;
          const y = random(`st-y-${i}`) * (HORIZON - 190);
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / 26 + i * 1.7));
          return <circle key={i} cx={x} cy={y} r={0.8 + random(`st-r-${i}`) * 1.7} fill="#fff" opacity={tw * 0.8} />;
        })}

        <circle cx={cx} cy={cy} r={720} fill="url(#bg-glow)" />
        <circle cx={cx} cy={cy} r={R} fill="url(#bg-sun)" mask="url(#bg-sunmask)" />

        <Skyline />

        <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#bg-floor)" />
        <g mask="url(#bg-gridmask)" stroke={C.magenta} strokeWidth={2} opacity={0.75}>
          {hLines.map((y, i) => (
            <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} />
          ))}
          {vLines.map((k) => (
            <line key={`v${k}`} x1={cx + k * 46} y1={HORIZON} x2={cx + k * 560} y2={H} />
          ))}
        </g>
        <rect x="0" y={HORIZON - 2} width={W} height={4} fill={C.yellow} opacity={0.55} />

        <Palm x={150} h={640} lean={110} scale={1.12} phase={0.4} />
        <Palm x={-30} h={470} lean={150} scale={0.9} phase={2.1} />
        <Palm x={W - 120} h={700} lean={120} scale={1.18} phase={1.3} flip />
        <Palm x={W + 40} h={500} lean={170} scale={0.92} phase={3.2} flip />
      </svg>

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 42%, rgba(9,5,20,${0.5 * calm}) 0%, rgba(9,5,20,${0.2 + 0.68 * calm}) 78%)`,
        }}
      />
      <AbsoluteFill style={{backgroundColor: `rgba(9,5,20,${0.34 * calm})`}} />
      <Img
        src={staticFile('img/grano.png')}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0}}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('img/grano.png')})`,
          backgroundSize: '256px 256px',
          mixBlendMode: 'overlay',
          // Grano fijo: evita el bandeado de los degradados sin disparar el peso del vídeo.
          opacity: 0.16,
        }}
      />
    </AbsoluteFill>
  );
};
