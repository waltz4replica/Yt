import {Easing, interpolate, spring} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 entre `start` y `start + dur`, con salida suave. */
export const ease = (frame: number, start: number, dur = 14): number =>
  interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

/** Muelle 0→1 que arranca en `start`. Un poco de rebote da vida a tarjetas y sellos. */
export const pop = (frame: number, fps: number, start: number, bounce = 0.35): number =>
  spring({frame: frame - start, fps, config: {damping: 12 + (1 - bounce) * 14, mass: 0.7, stiffness: 140}});

/** Aparición estándar: opacidad + desplazamiento. Devuelve un estilo listo para usar. */
export const rise = (frame: number, start: number, dist = 36, dur = 14) => {
  const t = ease(frame, start, dur);
  return {opacity: t, transform: `translateY(${(1 - t) * dist}px)`};
};

export const slide = (frame: number, start: number, dist = 60, dur = 14) => {
  const t = ease(frame, start, dur);
  return {opacity: t, transform: `translateX(${(1 - t) * dist}px)`};
};

/** Envolvente de escena: entra en `inDur` fotogramas y sale en los últimos `outDur`. */
export const envelope = (frame: number, duration: number, inDur = 9, outDur = 7): number => {
  const a = interpolate(frame, [0, inDur], [0, 1], clamp);
  const b = interpolate(frame, [duration - outDur, duration], [1, 0], clamp);
  return Math.min(a, b);
};

/** Fotograma en que empieza la frase `i` de la escena (o el último disponible). */
export const beat = (beats: number[], i: number): number => beats[Math.min(Math.max(i, 0), beats.length - 1)] ?? 0;
