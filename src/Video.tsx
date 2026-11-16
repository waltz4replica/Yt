import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Background} from './components/Background';
import {Bug, Captions, Progress, SourceChip} from './components/overlays';
import {clamp} from './lib/anim';
import {Cierre, Dato, Gancho, Nota, Veredicto} from './scenes/basicas';
import {Personaje, Radio, Zona} from './scenes/especiales';
import {Comparar, Linea, Lista, Pasos, Relojes} from './scenes/listas';
import type {Canal, SceneData, SceneProps, VideoData} from './types';

// Cada `tipo` de escena del guion se dibuja con una de estas plantillas.
const PLANTILLAS: Record<string, React.FC<SceneProps>> = {
  gancho: Gancho,
  dato: Dato,
  veredicto: Veredicto,
  nota: Nota,
  lista: Lista,
  pasos: Pasos,
  relojes: Relojes,
  linea: Linea,
  comparar: Comparar,
  zona: Zona,
  personaje: Personaje,
  radio: Radio,
};

/** Cuánto protagonismo tiene el fondo en cada tipo de escena. */
const look = (s: SceneData) => ({
  calm: s.tipo === 'gancho' ? 0.1 : s.tipo === 'cierre' ? 0.5 : 0.88,
  sunX: s.tipo === 'gancho' ? 0.74 : 0.5,
});

export type VideoProps = {video: VideoData; canal: Canal};

export const Video: React.FC<VideoProps> = ({video, canal}) => {
  const frame = useCurrentFrame();
  let idx = video.escenas.findIndex((s) => frame >= s.start && frame < s.start + s.dur);
  if (idx < 0) idx = video.escenas.length - 1;
  const scene = video.escenas[idx];
  const local = frame - scene.start;

  const cur = look(scene);
  const prev = idx > 0 ? look(video.escenas[idx - 1]) : cur;
  const k = interpolate(local, [0, 16], [0, 1], clamp);
  const calm = prev.calm + (cur.calm - prev.calm) * k;
  const sunX = prev.sunX + (cur.sunX - prev.sunX) * k;

  return (
    <AbsoluteFill>
      <Background calm={calm} sunX={sunX} />
      {video.escenas.map((s, i) => {
        const Plantilla = PLANTILLAS[s.tipo];
        return (
          <Sequence key={i} from={s.start} durationInFrames={s.dur} name={`${i + 1} · ${s.tipo}`}>
            {s.tipo === 'cierre' ? (
              <Cierre scene={s} video={video} index={i} canal={canal} />
            ) : Plantilla ? (
              <Plantilla scene={s} video={video} index={i} />
            ) : null}
          </Sequence>
        );
      })}
      <Bug name={canal.nombre} opacity={scene.tipo === 'cierre' ? 0 : 0.95} />
      <SourceChip scene={scene} local={local} />
      <Captions captions={video.subtitulos} />
      <Progress video={video} />
      <Audio src={staticFile(video.audio)} />
    </AbsoluteFill>
  );
};
