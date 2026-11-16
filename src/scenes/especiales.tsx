import React from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {Icon} from '../components/Icon';
import {Card, Chip, GradientText, Shell} from '../components/ui';
import {beat, ease, pop, rise} from '../lib/anim';
import {C, F, SUNSET} from '../theme';
import type {SceneProps} from '../types';

// ---------------------------------------------------------------------------
// Zonas de Leonida: tablero ilustrativo (NO es el mapa del juego)
// ---------------------------------------------------------------------------

export const ZONAS: {id: string; nombre: string; color: string; art: React.ReactNode}[] = [
  {
    id: 'vice',
    nombre: 'Vice City',
    color: C.magenta,
    art: (
      <>
        <circle cx="50" cy="60" r="24" fill={C.yellow} opacity="0.9" />
        {[8, 22, 34, 48, 62, 76].map((x, i) => (
          <rect key={x} x={x} y={[52, 34, 58, 26, 44, 60][i]} width="12" height="60" fill="currentColor" />
        ))}
        <rect x="0" y="84" width="100" height="16" fill="currentColor" />
      </>
    ),
  },
  {
    id: 'keys',
    nombre: 'Leonida Keys',
    color: C.teal,
    art: (
      <>
        <path d="M8 78 Q30 58 52 78 Z" fill="currentColor" />
        <path d="M58 84 Q74 70 92 84 Z" fill="currentColor" />
        <path d="M30 70 Q34 44 44 26" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M44 26 Q26 20 16 32 M44 26 Q30 10 20 12 M44 26 Q56 12 70 18 M44 26 Q60 24 68 36 M44 26 Q46 12 54 6" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M4 92 h20 M36 92 h28 M76 92 h20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      </>
    ),
  },
  {
    id: 'grass',
    nombre: 'Grassrivers',
    color: C.ok,
    art: (
      <>
        {[10, 20, 30, 72, 82, 92].map((x, i) => (
          <path key={x} d={`M${x} 82 Q${x + (i % 2 ? 5 : -5)} 50 ${x + (i % 2 ? -3 : 4)} ${22 + (i % 3) * 9}`} stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
        ))}
        <path d="M34 72 Q50 60 66 72 Z" fill="currentColor" />
        <circle cx="42" cy="63" r="6" fill="currentColor" />
        <circle cx="58" cy="63" r="6" fill="currentColor" />
        <circle cx="42" cy="62" r="2.2" fill={C.night} />
        <circle cx="58" cy="62" r="2.2" fill={C.night} />
        <path d="M4 84 h92 M14 93 h72" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      </>
    ),
  },
  {
    id: 'port',
    nombre: 'Port Gellhorn',
    color: C.sky,
    art: (
      <>
        <path d="M22 84 V20 H70 M22 20 L8 34 M46 20 V40" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="38" y="40" width="16" height="12" fill="currentColor" />
        <rect x="40" y="66" width="22" height="16" fill="currentColor" />
        <rect x="66" y="66" width="22" height="16" fill="currentColor" opacity="0.75" />
        <rect x="53" y="48" width="22" height="16" fill="currentColor" opacity="0.55" />
        <path d="M4 90 h92" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: 'ambrosia',
    nombre: 'Ambrosia',
    color: C.orange,
    art: (
      <>
        <path d="M10 88 V56 L30 66 V56 L50 66 V56 L70 66 V88 Z" fill="currentColor" />
        <rect x="72" y="28" width="12" height="60" fill="currentColor" />
        <rect x="56" y="38" width="9" height="24" fill="currentColor" />
        <circle cx="80" cy="18" r="7" fill="currentColor" opacity="0.6" />
        <circle cx="90" cy="9" r="5" fill="currentColor" opacity="0.4" />
        <circle cx="61" cy="29" r="5" fill="currentColor" opacity="0.5" />
      </>
    ),
  },
  {
    id: 'kalaga',
    nombre: 'Mount Kalaga',
    color: C.lilac,
    art: (
      <>
        <path d="M4 86 L36 26 L54 58 L66 40 L96 86 Z" fill="currentColor" />
        <path d="M36 26 L28 42 L36 38 L44 44 Z" fill={C.text} opacity="0.85" />
        <path d="M16 90 l7 -16 l7 16 Z M70 92 l7 -18 l7 18 Z M44 92 l6 -14 l6 14 Z" fill={C.night} opacity="0.7" />
      </>
    ),
  },
];

const Board: React.FC<{active: string | null; intro: boolean; size: number}> = ({active, intro, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gap = 18;
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(3, ${size}px)`, gap}}>
      {ZONAS.map((z, i) => {
        const on = intro || z.id === active;
        const t = intro ? pop(frame, fps, 10 + i * 6, 0.5) : 1;
        const sel = !intro && z.id === active ? pop(frame, fps, 4, 0.55) : 0;
        return (
          <div
            key={z.id}
            style={{
              width: size,
              height: size,
              borderRadius: 26,
              background: on ? `linear-gradient(160deg, ${z.color}55, rgba(8,4,18,0.9) 85%)` : 'rgba(20,11,44,0.6)',
              border: `3px solid ${on ? z.color : C.stroke}`,
              boxShadow: sel ? `0 0 0 3px ${z.color}, 0 0 60px ${z.color}88` : 'none',
              color: on ? z.color : C.dim,
              opacity: (on ? 1 : 0.5) * Math.min(1, t * 1.5),
              transform: `scale(${(0.6 + 0.4 * t) * (1 + sel * 0.07)})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: sel ? 2 : 1,
            }}
          >
            <svg viewBox="0 0 100 100" width={size * 0.6} height={size * 0.6}>
              {z.art}
            </svg>
            <div style={{fontFamily: F.display, fontSize: size * 0.115, letterSpacing: 1, color: on ? C.text : C.dim, textTransform: 'uppercase', marginTop: 4}}>{z.nombre}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Zona: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const p = scene.props as {zona?: string; antetitulo?: string; nombre: string; lema?: string; puntos?: string[]; desde?: number};
  const z = ZONAS.find((x) => x.id === p.zona);
  const idx = z ? ZONAS.indexOf(z) + 1 : 0;
  const color = z?.color ?? C.yellow;
  return (
    <Shell dur={scene.dur} style={{flexDirection: 'row', alignItems: 'center', gap: 64}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <Board active={p.zona ?? null} intro={!z} size={248} />
        <div style={{fontFamily: F.mono, fontSize: 24, color: C.dim, letterSpacing: 1}}>Esquema ilustrativo · no es el mapa del juego</div>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={rise(frame, 4)}>
          <Chip color={color}>{p.antetitulo ?? `Zona ${idx} de ${ZONAS.length}`}</Chip>
        </div>
        <div style={{fontFamily: F.display, fontSize: Math.min(124, 840 / (p.nombre.length * 0.47)), lineHeight: 1.12, textTransform: 'uppercase', marginTop: 12, ...rise(frame, 8)}}>
          <GradientText horizontal>{p.nombre}</GradientText>
        </div>
        {p.lema ? <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 44, lineHeight: 1.2, color, marginTop: 4, ...rise(frame, 13)}}>{p.lema}</div> : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 30}}>
          {p.puntos?.map((pt, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 18, ...rise(frame, beat(scene.beats, i + (p.desde ?? 1)) + 2)}}>
              <div style={{width: 16, height: 16, borderRadius: 4, background: color, marginTop: 20, flexShrink: 0, transform: 'rotate(45deg)'}} />
              <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 44, lineHeight: 1.25, color: C.text, textWrap: 'balance'}}>{pt}</div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ---------------------------------------------------------------------------
// Ficha de personaje (silueta genérica: no se imita el aspecto de nadie)
// ---------------------------------------------------------------------------

export const Personaje: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = scene.props as {nombre: string; rol: string; rasgos?: string[]; puntos: string[]; color?: string; numero?: number; total?: number; desde?: number};
  const color = p.color ?? C.magenta;
  const t = pop(frame, fps, 3, 0.4);
  const initials = p.nombre
    .split(/[\s-]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <Shell dur={scene.dur} style={{flexDirection: 'row', alignItems: 'center', gap: 70}}>
      <div
        style={{
          width: 470,
          height: 640,
          borderRadius: 34,
          background: `linear-gradient(170deg, ${color} 0%, #2a0f55 62%, ${C.night} 100%)`,
          border: `3px solid ${color}`,
          boxShadow: `0 0 70px ${color}55`,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          opacity: Math.min(1, t * 1.5),
          transform: `rotate(${-3 + (1 - t) * -8}deg) scale(${0.85 + 0.15 * t})`,
        }}
      >
        <div style={{position: 'absolute', right: 14, top: -4, fontFamily: F.display, fontSize: 250, lineHeight: 1.1, color: 'rgba(255,255,255,0.16)'}}>{initials}</div>
        <svg viewBox="0 0 200 260" width={470} height={611} style={{position: 'absolute', left: 0, bottom: 62}}>
          <circle cx="100" cy="112" r="46" fill="#0a0416" />
          <path d="M14 262 C14 196 52 168 100 168 C148 168 186 196 186 262 Z" fill="#0a0416" />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 66, background: 'rgba(8,4,18,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'}}>
          <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: C.text}}>
            FICHA {String(p.numero ?? 1).padStart(2, '0')}
            {p.total ? `/${String(p.total).padStart(2, '0')}` : ''}
          </div>
          <div style={{display: 'flex', gap: 4, alignItems: 'center'}}>
            {Array.from({length: 22}, (_, i) => (
              <div key={i} style={{width: 2 + Math.round(random(`bc-${p.nombre}-${i}`) * 5), height: 36, background: C.text, opacity: 0.85}} />
            ))}
          </div>
        </div>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={rise(frame, 5)}>
          <Chip color={color}>{p.rol}</Chip>
        </div>
        <div style={{fontFamily: F.display, fontSize: Math.min(132, 1030 / (p.nombre.length * 0.47)), lineHeight: 1.1, color: C.text, textTransform: 'uppercase', marginTop: 10, ...rise(frame, 9)}}>{p.nombre}</div>
        {p.rasgos ? (
          <div style={{display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8, ...rise(frame, 14)}}>
            {p.rasgos.map((r) => (
              <div key={r} style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, color: C.night, background: C.yellow, borderRadius: 12, padding: '6px 18px'}}>{r}</div>
            ))}
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 34}}>
          {p.puntos.map((pt, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 18, ...rise(frame, beat(scene.beats, i + (p.desde ?? 0)) + (i === 0 && !(p.desde ?? 0) ? 16 : 2))}}>
              <div style={{color, display: 'flex', marginTop: 8}}>
                <Icon name="flecha" size={40} stroke={3} />
              </div>
              <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 44, lineHeight: 1.25, color: C.text}}>{pt}</div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ---------------------------------------------------------------------------
// Emisora de radio
// ---------------------------------------------------------------------------

export const Radio: React.FC<SceneProps> = ({scene}) => {
  const frame = useCurrentFrame();
  const p = scene.props as {emisora: string; genero: string; locutores?: string; nota?: string; numero?: number; total?: number; dial?: string; color?: string};
  const color = p.color ?? C.teal;
  const total = p.total ?? 6;
  const n = p.numero ?? 1;
  const from = ((n - 1.5) / total) * 100;
  const to = ((n - 0.5) / total) * 100;
  const needle = from + (to - from) * ease(frame, 2, 22);
  return (
    <Shell dur={scene.dur} style={{flexDirection: 'row', alignItems: 'center', gap: 64}}>
      <Card glow={color} style={{width: 640, padding: '36px 40px 40px', flexShrink: 0, ...rise(frame, 2)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: C.muted}}>FM · LEONIDA</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.mono, fontWeight: 700, fontSize: 26, color: C.no}}>
            <div style={{width: 16, height: 16, borderRadius: '50%', background: C.no, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 9))}} />
            EN EL AIRE
          </div>
        </div>
        <div style={{position: 'relative', height: 120, marginTop: 26, borderRadius: 18, background: 'rgba(8,4,18,0.8)', border: `2px solid ${C.stroke}`, overflow: 'hidden'}}>
          {Array.from({length: 41}, (_, i) => (
            <div key={i} style={{position: 'absolute', left: `${(i / 40) * 100}%`, bottom: 0, width: 3, height: i % 5 === 0 ? 46 : 24, background: i % 5 === 0 ? C.text : C.dim, marginLeft: -1.5}} />
          ))}
          {[88, 92, 96, 100, 104, 108].map((f, i) => (
            <div key={f} style={{position: 'absolute', left: `${(i / 5) * 86 + 4}%`, top: 12, fontFamily: F.mono, fontSize: 24, color: C.muted}}>{f}</div>
          ))}
          <div style={{position: 'absolute', left: `${needle}%`, top: 0, bottom: 0, width: 8, marginLeft: -4, background: SUNSET, boxShadow: `0 0 26px ${C.orange}`}} />
        </div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 7, height: 210, marginTop: 30}}>
          {Array.from({length: 28}, (_, i) => {
            const a = 0.5 + 0.5 * Math.sin(frame / (3.1 + random(`eq-a-${i}`) * 3) + i * 1.3);
            const b = 0.5 + 0.5 * Math.sin(frame / (7 + random(`eq-b-${i}`) * 5) + i * 0.7);
            const h = 18 + (0.25 + 0.75 * a * b) * 190 * (0.55 + 0.45 * Math.sin((i / 27) * Math.PI));
            return <div key={i} style={{flex: 1, height: h, borderRadius: 5, background: `linear-gradient(180deg, ${C.yellow}, ${C.magenta})`}} />;
          })}
        </div>
      </Card>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={rise(frame, 4)}>
          <Chip color={color}>
            Emisora {n} de {total}
          </Chip>
        </div>
        <div style={{fontFamily: F.display, fontSize: Math.min(136, 950 / (p.emisora.length * 0.47)), lineHeight: 1.1, textTransform: 'uppercase', marginTop: 10, ...rise(frame, 8)}}>
          <GradientText horizontal>{p.emisora}</GradientText>
        </div>
        <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 50, lineHeight: 1.2, color: C.text, ...rise(frame, 13)}}>{p.genero}</div>
        {p.locutores ? (
          <div style={{marginTop: 34, ...rise(frame, beat(scene.beats, 1) + 2)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.mono, fontWeight: 700, fontSize: 27, letterSpacing: 3, color}}>
              <Icon name="micro" size={32} stroke={2.6} /> AL MICRÓFONO
            </div>
            <div style={{fontFamily: F.body, fontWeight: 700, fontSize: 46, lineHeight: 1.25, color: C.text, marginTop: 6}}>{p.locutores}</div>
          </div>
        ) : null}
        {p.nota ? <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 38, lineHeight: 1.3, color: C.muted, marginTop: 22, ...rise(frame, beat(scene.beats, 2) + 2)}}>{p.nota}</div> : null}
      </div>
    </Shell>
  );
};
