import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {clamp, ease} from '../lib/anim';
import {C, F, SUNSET_H} from '../theme';
import type {Caption, SceneData, VideoData} from '../types';
import {Icon} from './Icon';
import {Mark} from './ui';

/** Subtítulos quemados: un trozo corto cada vez, siempre en el mismo sitio. */
export const Captions: React.FC<{captions: Caption[]}> = ({captions}) => {
  const frame = useCurrentFrame();
  const cur = captions.find((c) => frame >= c.start && frame < c.end);
  if (!cur) return null;
  const local = frame - cur.start;
  const t = interpolate(local, [0, 4], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 74, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.15,
          color: C.text,
          background: 'rgba(8, 4, 18, 0.86)',
          border: `2px solid ${C.stroke}`,
          borderRadius: 22,
          padding: '14px 36px 16px',
          maxWidth: 1560,
          textAlign: 'center',
          opacity: 0.35 + 0.65 * t,
          transform: `translateY(${(1 - t) * 8}px) scale(${0.97 + 0.03 * t})`,
          boxShadow: '0 10px 34px rgba(0,0,0,0.5)',
        }}
      >
        {cur.text}
      </div>
    </div>
  );
};

/** De dónde sale el dato que hay en pantalla. Solo aparece en escenas con `fuente`. */
export const SourceChip: React.FC<{scene: SceneData; local: number}> = ({scene, local}) => {
  if (!scene.fuente) return null;
  const a = ease(local, 10, 12);
  const b = interpolate(local, [scene.dur - 8, scene.dur], [1, 0], clamp);
  const t = Math.min(a, b);
  return (
    <div
      style={{
        position: 'absolute',
        right: 64,
        top: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: F.mono,
        fontSize: 25,
        fontWeight: 700,
        letterSpacing: 1.5,
        color: C.teal,
        background: 'rgba(8, 4, 18, 0.8)',
        border: `2px solid ${C.teal}88`,
        borderRadius: 999,
        padding: '11px 24px 11px 18px',
        opacity: t,
        transform: `translateX(${(1 - a) * 30}px)`,
      }}
    >
      <Icon name="check" size={28} stroke={3} />
      <span style={{color: C.muted}}>FUENTE ·</span>
      <span style={{textTransform: 'uppercase'}}>{scene.fuente}</span>
    </div>
  );
};

export const Progress: React.FC<{video: VideoData}> = ({video}) => {
  const frame = useCurrentFrame();
  const pct = (frame / Math.max(1, video.frames - 1)) * 100;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: 'rgba(255,255,255,0.1)'}}>
      <div style={{width: `${pct}%`, height: '100%', background: SUNSET_H}} />
      {video.escenas.slice(1).map((s, i) => (
        <div
          key={i}
          style={{position: 'absolute', top: 0, bottom: 0, left: `${(s.start / video.frames) * 100}%`, width: 4, background: C.night}}
        />
      ))}
    </div>
  );
};

export const Bug: React.FC<{name: string; opacity?: number}> = ({name, opacity = 1}) => (
  <div style={{position: 'absolute', left: 60, top: 44, display: 'flex', alignItems: 'center', gap: 16, opacity}}>
    <Mark size={62} />
    <div style={{fontFamily: F.display, fontSize: 31, letterSpacing: 2.5, color: C.text, textTransform: 'uppercase', lineHeight: 1}}>
      {name}
    </div>
  </div>
);
