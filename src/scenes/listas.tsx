import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Icon} from '../components/Icon';
import {Card, GradientText, SceneTitle, Shell} from '../components/ui';
import {beat, clamp, ease, pop, rise} from '../lib/anim';
import {C, F, SUNSET, SUNSET_H, toneColor, type Tone} from '../theme';
import type {SceneProps} from '../types';

type Item = {icono?: string; texto: string; detalle?: string; tono?: Tone; estado?: string};

/** Lista: cada elemento entra cuando la voz lo nombra. */
export const Lista: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const p = scene.props as {titulo: string; desde?: number; columnas?: number; items: Item[]};
  const cols = p.columnas ?? (p.items.length > 4 ? 2 : 1);
  const big = p.items.length <= 3 && cols === 1;
  const starts = p.items.map((_, i) => beat(scene.beats, i + (p.desde ?? 0)) + (i === 0 && !(p.desde ?? 0) ? 8 : 0));
  return (
    <Shell dur={scene.dur}>
      <SceneTitle>{p.titulo}</SceneTitle>
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: big ? 26 : 20,
          alignContent: 'center',
          marginTop: 18,
        }}
      >
        {p.items.map((it, i) => {
          const s = starts[i];
          const t = ease(frame, s, 13);
          const next = starts[i + 1] ?? Infinity;
          const active = frame >= s && frame < next;
          const color = toneColor(it.tono);
          return (
            <Card
              key={i}
              glow={active ? color : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: big ? '26px 38px' : '18px 30px',
                opacity: t * (active || frame < s ? 1 : 0.78),
                transform: `translateX(${(1 - t) * 70}px)`,
              }}
            >
              <div
                style={{
                  width: big ? 104 : 84,
                  height: big ? 104 : 84,
                  borderRadius: 24,
                  background: `${color}22`,
                  border: `3px solid ${color}`,
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={it.icono ?? 'check'} size={big ? 62 : 50} stroke={2.3} />
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: big ? 58 : cols > 1 ? 42 : 50, lineHeight: 1.15, color: C.text}}>{it.texto}</div>
                {it.detalle ? (
                  <div style={{fontFamily: F.body, fontWeight: 600, fontSize: big ? 36 : cols > 1 ? 28 : 32, lineHeight: 1.25, color: C.muted, marginTop: 4}}>{it.detalle}</div>
                ) : null}
              </div>
              {it.estado ? (
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: cols > 1 ? 36 : 44,
                    letterSpacing: 2,
                    color: C.night,
                    background: color,
                    borderRadius: 16,
                    padding: '6px 24px 8px',
                    whiteSpace: 'nowrap',
                    transform: `scale(${interpolate(frame, [s + 6, s + 14], [0.4, 1], clamp)})`,
                    opacity: interpolate(frame, [s + 6, s + 12], [0, 1], clamp),
                  }}
                >
                  {it.estado}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </Shell>
  );
};

/** Pasos numerados: se marca cada uno al pasar al siguiente. */
export const Pasos: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {titulo: string; desde?: number; pasos: {texto: string; detalle?: string}[]};
  const starts = p.pasos.map((_, i) => beat(scene.beats, i + (p.desde ?? 0)) + (i === 0 && !(p.desde ?? 0) ? 8 : 0));
  return (
    <Shell dur={scene.dur}>
      <SceneTitle>{p.titulo}</SceneTitle>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, marginTop: 14}}>
        {p.pasos.map((st, i) => {
          const s = starts[i];
          const next = starts[i + 1] ?? scene.dur - 26;
          const t = ease(frame, s, 13);
          const done = pop(frame, fps, next - 4, 0.6);
          const active = frame >= s && frame < next;
          return (
            <Card
              key={i}
              glow={active ? C.yellow : undefined}
              style={{display: 'flex', alignItems: 'center', gap: 32, padding: '18px 34px', opacity: t, transform: `translateX(${(1 - t) * 70}px)`}}
            >
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: '50%',
                  background: SUNSET,
                  color: C.night,
                  fontFamily: F.display,
                  fontSize: 58,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 52, lineHeight: 1.15, color: C.text}}>{st.texto}</div>
                {st.detalle ? <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 32, color: C.muted, marginTop: 2}}>{st.detalle}</div> : null}
              </div>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: C.ok,
                  color: C.night,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${done})`,
                }}
              >
                <Icon name="check" size={46} stroke={3.6} />
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
};

/** Relojes: la misma medianoche llegando a cada zona horaria. */
export const Relojes: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {titulo: string; desde?: number; items: {lugar: string; extra?: string}[]};
  const d = p.desde ?? 0;
  return (
    <Shell dur={scene.dur}>
      <SceneTitle>{p.titulo}</SceneTitle>
      <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 22, marginTop: 10}}>
        {p.items.map((it, i) => {
          const s = beat(scene.beats, i + d) + 2;
          const t = pop(frame, fps, s, 0.4);
          const spin = (1 - ease(frame, s, 26)) * 360;
          const first = i === 0;
          const color = first ? C.yellow : C.teal;
          return (
            <Card
              key={i}
              glow={frame >= s && frame < beat(scene.beats, i + d + 1) && i + d + 1 < scene.beats.length ? color : undefined}
              style={{flex: 1, padding: '30px 14px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, t * 1.6), transform: `translateY(${(1 - t) * 60}px)`}}
            >
              <svg viewBox="0 0 160 160" width={172} height={172}>
                <circle cx="80" cy="80" r="72" fill="rgba(8,4,18,0.7)" stroke={color} strokeWidth="5" />
                {Array.from({length: 12}, (_, h) => (
                  <line key={h} x1="80" y1="16" x2="80" y2={h % 3 === 0 ? 30 : 24} stroke={C.muted} strokeWidth={h % 3 === 0 ? 4 : 2} transform={`rotate(${h * 30} 80 80)`} />
                ))}
                <line x1="80" y1="80" x2="80" y2="42" stroke={C.text} strokeWidth="7" strokeLinecap="round" transform={`rotate(${-spin / 12} 80 80)`} />
                <line x1="80" y1="80" x2="80" y2="26" stroke={color} strokeWidth="5" strokeLinecap="round" transform={`rotate(${-spin} 80 80)`} />
                <circle cx="80" cy="80" r="7" fill={C.text} />
              </svg>
              <div style={{fontFamily: F.display, fontSize: 74, lineHeight: 1.15, marginTop: 8}}>
                <GradientText>00:00</GradientText>
              </div>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 33, lineHeight: 1.2, color: C.text, textAlign: 'center', minHeight: 82, display: 'flex', alignItems: 'center'}}>{it.lugar}</div>
              {it.extra ? (
                <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: first ? C.night : color, background: first ? color : `${color}22`, border: `2px solid ${color}`, borderRadius: 999, padding: '6px 22px', marginTop: 10}}>
                  {it.extra}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </Shell>
  );
};

/** Línea de tiempo horizontal. */
export const Linea: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {titulo: string; desde?: number; puntos: {fecha: string; texto: string; tono?: Tone}[]};
  const d = p.desde ?? 0;
  const n = p.puntos.length;
  const starts = p.puntos.map((_, i) => beat(scene.beats, i + d) + (i === 0 && !d ? 8 : 0));
  // la línea avanza hasta el último punto que ya ha entrado
  let reach = 0;
  starts.forEach((s, i) => {
    reach = Math.max(reach, ((i + 0.5) / n) * ease(frame, s - 6, 16));
  });
  return (
    <Shell dur={scene.dur}>
      <SceneTitle>{p.titulo}</SceneTitle>
      <div style={{flex: 1, position: 'relative', marginTop: 10}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 8, marginTop: -4, borderRadius: 4, background: 'rgba(255,255,255,0.12)'}} />
        <div style={{position: 'absolute', left: 0, width: `${reach * 100}%`, top: '50%', height: 8, marginTop: -4, borderRadius: 4, background: SUNSET_H}} />
        {p.puntos.map((pt, i) => {
          const s = starts[i];
          const t = pop(frame, fps, s, 0.5);
          const color = toneColor(pt.tono);
          const active = frame >= s && frame < (starts[i + 1] ?? Infinity);
          return (
            <div key={i} style={{position: 'absolute', left: `${((i + 0.5) / n) * 100}%`, top: 0, bottom: 0, width: 0}}>
              <div style={{position: 'absolute', left: -170, width: 340, bottom: '50%', marginBottom: 44, textAlign: 'center', ...rise(frame, s, 24)}}>
                <div style={{fontFamily: F.display, fontSize: n > 3 ? 62 : 74, lineHeight: 1.1, color: active ? C.yellow : C.text, textTransform: 'uppercase'}}>{pt.fecha}</div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: -24,
                  top: '50%',
                  marginTop: -24,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: color,
                  border: `7px solid ${C.night}`,
                  boxShadow: active ? `0 0 0 5px ${color}, 0 0 40px ${color}` : `0 0 0 4px ${color}`,
                  transform: `scale(${t})`,
                }}
              />
              <div style={{position: 'absolute', left: -200, width: 400, top: '50%', marginTop: 46, textAlign: 'center', ...rise(frame, s + 4, -24)}}>
                <div style={{fontFamily: F.body, fontWeight: 700, fontSize: n > 3 ? 35 : 40, lineHeight: 1.22, color: active ? C.text : C.muted, textWrap: 'balance'}}>{pt.texto}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

type Col = {nombre: string; precio?: string; sub?: string; puntos: string[]; tono?: Tone; pie?: string};

/** Comparativa a dos columnas. */
export const Comparar: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {titulo?: string; desde?: number; a: Col; b: Col};
  const d = p.desde ?? 0;
  const cols = [p.a, p.b];
  return (
    <Shell dur={scene.dur}>
      {p.titulo ? <SceneTitle>{p.titulo}</SceneTitle> : null}
      <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 36, marginTop: 14, position: 'relative'}}>
        {cols.map((c, i) => {
          const s = beat(scene.beats, i + d) + (i === 0 && !d ? 8 : 0);
          const t = pop(frame, fps, s, 0.35);
          const color = toneColor(c.tono ?? (i === 0 ? 'info' : 'warn'));
          const active = frame >= s && (i === 1 || frame < beat(scene.beats, 1 + d));
          return (
            <Card key={i} glow={active ? color : undefined} style={{flex: 1, alignSelf: 'stretch', padding: '34px 44px', display: 'flex', flexDirection: 'column', opacity: Math.min(1, t * 1.5), transform: `translateY(${(1 - t) * 70}px)`}}>
              <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 30, letterSpacing: 4, color, textTransform: 'uppercase'}}>{c.sub ?? ' '}</div>
              <div style={{fontFamily: F.display, fontSize: 82, lineHeight: 1.1, color: C.text, textTransform: 'uppercase'}}>{c.nombre}</div>
              {c.precio ? (
                <div style={{fontFamily: F.display, fontSize: 150, lineHeight: 1.1}}>
                  <GradientText>{c.precio}</GradientText>
                </div>
              ) : null}
              <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8}}>
                {c.puntos.map((pt, k) => (
                  <div key={k} style={{display: 'flex', alignItems: 'flex-start', gap: 16, ...rise(frame, s + 10 + k * 5, 20)}}>
                    <div style={{color, display: 'flex', marginTop: 5}}>
                      <Icon name="check" size={38} stroke={3.2} />
                    </div>
                    <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 38, lineHeight: 1.22, color: C.text}}>{pt}</div>
                  </div>
                ))}
              </div>
              {c.pie ? <div style={{fontFamily: F.mono, fontSize: 26, color: C.muted, marginTop: 'auto', paddingTop: 16}}>{c.pie}</div> : null}
            </Card>
          );
        })}
      </div>
    </Shell>
  );
};
