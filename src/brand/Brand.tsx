import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background} from '../components/Background';
import {Icon} from '../components/Icon';
import {GradientText, Mark} from '../components/ui';
import {C, F, H, SUNSET, toneColor, W} from '../theme';
import type {Canal, VideoData} from '../types';

/** Avatar del canal (800 × 800). YouTube lo recorta en círculo. */
export const Logo: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.night}}>
    <Mark size={800} square />
  </AbsoluteFill>
);

/** Portada del canal (2560 × 1440). Todo lo importante cabe en la zona segura central de 1546 × 423. */
export const Portada: React.FC<{canal: Canal}> = ({canal}) => (
  <AbsoluteFill style={{backgroundColor: C.night}}>
    <div style={{position: 'relative', flexShrink: 0, width: W, height: H, transform: `scale(${2560 / W})`, transformOrigin: '0 0'}}>
      <Background calm={0.18} sunX={0.5} />
    </div>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 34% at 50% 50%, rgba(8,4,18,0.82) 0%, rgba(8,4,18,0.55) 55%, rgba(8,4,18,0) 100%)'}} />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1546, height: 423, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50}}>
        <Mark size={300} />
        <div>
          <div style={{fontFamily: F.display, fontSize: 196, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: 2, filter: 'drop-shadow(0 10px 0 rgba(6,3,14,0.6))'}}>
            <GradientText horizontal>{canal.nombre}</GradientText>
          </div>
          <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 60, color: C.text, marginTop: 2}}>{canal.lema}</div>
          <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: C.teal, marginTop: 14}}>MAPA · PERSONAJES · GUÍAS · SIN RUMORES</div>
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** Miniatura (1280 × 720): poco texto, muy grande, y un sello con el dato clave. */
export const Miniatura: React.FC<{video: VideoData; canal: Canal}> = ({video, canal}) => {
  const m = video.miniatura;
  const longest = Math.max(...m.lineas.map((l) => l.length));
  const size = Math.min(230, 1090 / (longest * 0.5), 560 / m.lineas.length);
  const color = toneColor(m.tono ?? 'warn');
  return (
    <AbsoluteFill style={{backgroundColor: C.night}}>
      <div style={{position: 'relative', flexShrink: 0, width: W, height: H, transform: `scale(${1280 / W})`, transformOrigin: '0 0'}}>
        <AbsoluteFill>
          <Background calm={0.06} sunX={0.8} />
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(8,4,18,0.72) 0%, rgba(8,4,18,0.38) 52%, rgba(8,4,18,0) 78%)'}} />
          <div style={{position: 'absolute', left: 84, top: 70, right: 80, bottom: 70, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <div
              style={{
                alignSelf: 'flex-start',
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 46,
                letterSpacing: 4,
                color: C.night,
                background: C.yellow,
                borderRadius: 16,
                padding: '8px 28px',
                marginBottom: 14,
              }}
            >
              {m.etiqueta}
            </div>
            <div style={{filter: 'drop-shadow(0 14px 0 rgba(6,3,14,0.7)) drop-shadow(0 0 30px rgba(6,3,14,0.6))'}}>
              {m.lineas.map((l, i) => (
                <div key={i} style={{fontFamily: F.display, fontSize: size, lineHeight: 1.1, color: C.text, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
                  {l.split(' ').map((w, k) => (
                    <React.Fragment key={k}>
                      {k > 0 ? ' ' : ''}
                      {m.acento && w.replace(/[¿?¡!.,:]/g, '') === m.acento ? <GradientText>{w}</GradientText> : w}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {m.sello ? (
            <div
              style={{
                position: 'absolute',
                right: 96,
                top: 300,
                transform: 'rotate(7deg)',
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                fontFamily: F.display,
                fontSize: Math.min(170, 620 / (m.sello.length * 0.5)),
                lineHeight: 1.12,
                color,
                background: 'rgba(8,4,18,0.92)',
                border: `14px solid ${color}`,
                borderRadius: 40,
                padding: '10px 44px 16px',
                boxShadow: `0 0 90px ${color}88, 0 20px 0 rgba(6,3,14,0.6)`,
                whiteSpace: 'nowrap',
              }}
            >
              {m.icono ? <Icon name={m.icono} size={120} stroke={2.4} /> : null}
              {m.sello}
            </div>
          ) : null}
          <div style={{position: 'absolute', left: 84, bottom: 56, display: 'flex', alignItems: 'center', gap: 18}}>
            <Mark size={84} />
            <div style={{fontFamily: F.display, fontSize: 44, letterSpacing: 3, color: C.text, textTransform: 'uppercase'}}>{canal.nombre}</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 18, background: SUNSET}} />
        </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
