import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Icon} from '../components/Icon';
import {Card, Chip, GradientText, Mark, Shell} from '../components/ui';
import {beat, clamp, ease, pop, rise} from '../lib/anim';
import {C, F, SUNSET_H, toneColor, type Tone} from '../theme';
import type {SceneProps} from '../types';

const bare = (w: string) => w.replace(/[¿?¡!.,:;]/g, '');

/** Gancho: la pregunta del vídeo, a toda pantalla. */
export const Gancho: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {etiqueta?: string; lineas: string[]; acento?: string[]; ancho?: number};
  const longest = Math.max(...p.lineas.map((l) => l.length));
  const size = Math.min(218, (p.ancho ?? 1500) / (longest * 0.5));
  const zoom = 1 + (frame / scene.dur) * 0.04;
  let k = 0;
  return (
    <Shell dur={scene.dur} style={{justifyContent: 'center'}}>
      <div style={{transform: `scale(${zoom})`, transformOrigin: '0% 55%', paddingTop: 40}}>
        {p.etiqueta ? (
          <div style={{...rise(frame, 1), marginBottom: 30}}>
            <Chip color={C.yellow}>{p.etiqueta}</Chip>
          </div>
        ) : null}
        <div style={{filter: 'drop-shadow(0 10px 0 rgba(6,3,14,0.45))'}}>
          {p.lineas.map((line, li) => (
            <div key={li} style={{display: 'flex', gap: size * 0.2, overflow: 'hidden'}}>
              {line.split(' ').map((w, wi) => {
                const i = k++;
                const t = pop(frame, fps, 3 + i * 3, 0.2);
                const accent = p.acento?.includes(bare(w));
                return (
                  <div
                    key={wi}
                    style={{
                      fontFamily: F.display,
                      fontSize: size,
                      lineHeight: 1.12,
                      color: C.text,
                      transform: `translateY(${(1 - t) * 105}%)`,
                    }}
                  >
                    {accent ? <GradientText>{w}</GradientText> : w}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div
          style={{
            height: 14,
            width: 420 * ease(frame, beat(scene.beats, 1) - 4, 18),
            marginTop: 26,
            borderRadius: 7,
            background: SUNSET_H,
          }}
        />
      </div>
    </Shell>
  );
};

/** Dato: una cifra enorme con su contexto. */
export const Dato: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {
    antetitulo?: string;
    prefijo?: string;
    valor: string;
    unidad?: string;
    texto?: string;
    nota?: string;
    golpe?: number;
    tono?: Tone;
  };
  const hit = beat(scene.beats, p.golpe ?? 0) + 3;
  const t = pop(frame, fps, hit, 0.5);
  const isNum = /^\d+$/.test(p.valor);
  const shown = isNum ? String(Math.round(Number(p.valor) * ease(frame, hit, 20))) : p.valor;
  const ring = interpolate(frame, [hit, hit + 22], [0, 1], clamp);
  const size = Math.min(380, 1500 / ((p.valor.length + (p.unidad?.length ?? 0) * 0.5) * 0.52));
  return (
    <Shell dur={scene.dur} style={{alignItems: 'center', justifyContent: 'center'}}>
      {p.antetitulo ? (
        <div style={rise(frame, 3)}>
          <Chip>{p.antetitulo}</Chip>
        </div>
      ) : null}
      <div style={{position: 'relative', display: 'flex', alignItems: 'baseline', gap: 30, marginTop: 6}}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 500,
            height: 500,
            marginLeft: -250,
            marginTop: -250,
            borderRadius: '50%',
            border: `6px solid ${C.yellow}`,
            opacity: (1 - ring) * 0.7 * (frame >= hit ? 1 : 0),
            transform: `scale(${0.5 + ring * 1.6})`,
          }}
        />
        {/* Mientras la voz prepara el dato, tres puntos laten en su sitio */}
        {frame < hit ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: '50%', marginTop: -20, display: 'flex', justifyContent: 'center', gap: 34, opacity: ease(frame, 8, 10)}}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: C.yellow,
                  opacity: 0.25 + 0.6 * Math.max(0, Math.sin(frame / 5 - i * 0.9)),
                  transform: `scale(${0.8 + 0.3 * Math.max(0, Math.sin(frame / 5 - i * 0.9))})`,
                }}
              />
            ))}
          </div>
        ) : null}
        {p.prefijo ? (
          <div style={{fontFamily: F.display, fontSize: size * 0.27, color: C.muted, textTransform: 'uppercase', opacity: t}}>
            {p.prefijo}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: F.display,
            fontSize: size,
            lineHeight: 1.08,
            opacity: Math.min(1, t * 1.6),
            transform: `scale(${0.55 + 0.45 * t})`,
            filter: 'drop-shadow(0 12px 0 rgba(6,3,14,0.5))',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <GradientText>{shown}</GradientText>
        </div>
        {p.unidad ? (
          <div style={{fontFamily: F.display, fontSize: size * 0.46, color: C.text, opacity: t, transform: `translateX(${(1 - t) * 40}px)`}}>
            {p.unidad}
          </div>
        ) : null}
      </div>
      {p.texto ? (
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 60, color: C.text, textAlign: 'center', marginTop: 2, ...rise(frame, hit + 8)}}>
          {p.texto}
        </div>
      ) : null}
      {p.nota ? (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 31,
            color: C.muted,
            marginTop: 30,
            padding: '14px 30px',
            borderRadius: 18,
            background: 'rgba(8,4,18,0.6)',
            border: `2px solid ${C.stroke}`,
            ...rise(frame, p.golpe ? 8 : hit + 16),
          }}
        >
          {p.nota}
        </div>
      ) : null}
    </Shell>
  );
};

/** Veredicto: una pregunta y un sello que cae encima. */
export const Veredicto: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {pregunta: string; sello: string; tono?: Tone; detalle?: string; icono?: string; golpe?: number};
  const color = toneColor(p.tono);
  const g = Math.min(p.golpe ?? 1, scene.beats.length - 1);
  const hit = beat(scene.beats, g) + 4;
  const t = pop(frame, fps, hit, 0.6);
  const shake = frame >= hit + 3 && frame < hit + 9 ? Math.sin(frame * 2.6) * 5 * (1 - (frame - hit - 3) / 6) : 0;
  const stampSize = Math.min(190, 1300 / (p.sello.length * 0.5));
  const detailAt = scene.beats.length > g + 1 ? beat(scene.beats, g + 1) : hit + 16;
  return (
    <Shell dur={scene.dur} style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${shake}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, ...rise(frame, 3)}}>
        {p.icono ? (
          <div style={{width: 120, height: 120, borderRadius: 30, background: `${color}22`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color}}>
            <Icon name={p.icono} size={72} stroke={2.2} />
          </div>
        ) : null}
        <div style={{fontFamily: F.display, fontSize: Math.min(112, 1500 / (p.pregunta.length * 0.46)), color: C.text, textTransform: 'uppercase', lineHeight: 1.1, textAlign: 'center'}}>
          {p.pregunta}
        </div>
      </div>
      <div
        style={{
          marginTop: 44,
          padding: '6px 64px 10px',
          border: `12px solid ${color}`,
          borderRadius: 30,
          color,
          fontFamily: F.display,
          fontSize: stampSize,
          lineHeight: 1.15,
          textTransform: 'uppercase',
          letterSpacing: 3,
          background: 'rgba(8,4,18,0.72)',
          boxShadow: `0 0 80px ${color}55, inset 0 0 0 4px rgba(8,4,18,0.9), inset 0 0 0 8px ${color}66`,
          opacity: Math.min(1, t * 2),
          transform: `rotate(-4deg) scale(${2.4 - 1.4 * t})`,
          whiteSpace: 'nowrap',
        }}
      >
        {p.sello}
      </div>
      {p.detalle ? (
        <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 50, lineHeight: 1.25, color: C.muted, textAlign: 'center', maxWidth: 1400, marginTop: 50, textWrap: 'balance', ...rise(frame, detailAt)}}>
          {p.detalle}
        </div>
      ) : null}
    </Shell>
  );
};

/** Nota: una idea en una tarjeta, con puntos opcionales que entran con cada frase. */
export const Nota: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {icono?: string; titulo: string; cuerpo?: string; puntos?: string[]; tono?: Tone; desde?: number};
  const color = toneColor(p.tono);
  const t = pop(frame, fps, 3, 0.3);
  return (
    <Shell dur={scene.dur} style={{alignItems: 'center', justifyContent: 'center'}}>
      <Card glow={color} style={{padding: '60px 76px', maxWidth: 1600, minWidth: 1180, opacity: Math.min(1, t * 1.5), transform: `scale(${0.9 + 0.1 * t})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          {p.icono ? (
            <div style={{width: 132, height: 132, borderRadius: 34, background: `${color}22`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0}}>
              <Icon name={p.icono} size={80} stroke={2.1} />
            </div>
          ) : null}
          <div style={{fontFamily: F.display, fontSize: Math.min(104, 1320 / (p.titulo.length * 0.44)), lineHeight: 1.12, color: C.text, textTransform: 'uppercase'}}>{p.titulo}</div>
        </div>
        {p.cuerpo ? (
          <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 54, lineHeight: 1.3, color: C.muted, marginTop: 34, textWrap: 'balance', ...rise(frame, 12)}}>{p.cuerpo}</div>
        ) : null}
        {p.puntos?.map((pt, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: i === 0 ? 34 : 20, ...rise(frame, beat(scene.beats, i + (p.desde ?? 1)))}}>
            <div style={{color, display: 'flex'}}>
              <Icon name="flecha" size={44} stroke={2.8} />
            </div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 54, lineHeight: 1.2, color: C.text, textWrap: 'balance'}}>{pt}</div>
          </div>
        ))}
      </Card>
    </Shell>
  );
};

/** Cierre: marca, llamada a suscribirse y siguiente vídeo. */
export const Cierre: React.FC<SceneProps & {canal: {nombre: string; lema: string}}> = ({scene, canal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {siguiente?: string};
  const t = pop(frame, fps, 2, 0.5);
  const sub = beat(scene.beats, scene.beats.length - 1);
  const pulse = 1 + 0.05 * Math.max(0, Math.sin((frame - sub) / 5)) * (frame > sub ? 1 : 0);
  return (
    <Shell dur={scene.dur} style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 44}}>
        <div style={{transform: `scale(${t}) rotate(${(1 - t) * -20}deg)`}}>
          <Mark size={230} />
        </div>
        <div>
          <div style={{fontFamily: F.display, fontSize: 132, lineHeight: 1.05, textTransform: 'uppercase', ...rise(frame, 6)}}>
            <GradientText horizontal>{canal.nombre}</GradientText>
          </div>
          <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 44, color: C.text, ...rise(frame, 12)}}>{canal.lema}</div>
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'stretch', gap: 30, marginTop: 56}}>
        <div style={{display: 'flex', ...rise(frame, 16)}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              background: SUNSET_H,
              color: C.night,
              fontFamily: F.display,
              fontSize: 60,
              letterSpacing: 2,
              padding: '16px 46px',
              borderRadius: 24,
              transform: `scale(${pulse})`,
              boxShadow: `0 0 60px ${C.magenta}66`,
            }}
          >
            <Icon name="campana" size={56} stroke={2.6} />
            SUSCRÍBETE
          </div>
        </div>
        {p.siguiente ? (
          <Card style={{padding: '14px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', ...rise(frame, 22)}}>
            <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: C.teal}}>SIGUIENTE VÍDEO</div>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.text, marginTop: 4}}>{p.siguiente}</div>
          </Card>
        ) : null}
      </div>
      <div style={{fontFamily: F.mono, fontSize: 23, color: C.dim, marginTop: 44, textAlign: 'center', ...rise(frame, 28)}}>
        Canal no oficial hecho por fans · Sin afiliación con Rockstar Games ni Take-Two Interactive
      </div>
    </Shell>
  );
};
