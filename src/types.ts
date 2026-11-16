import type {Tone} from './theme';

export type Caption = {start: number; end: number; text: string};
export type Line = {start: number; end: number; text: string};

export type SceneData = {
  tipo: string;
  capitulo?: string;
  fuente?: string;
  // Cada plantilla define sus propias propiedades; ver src/scenes.
  props: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  start: number;
  dur: number;
  /** Fotograma (relativo a la escena) en que empieza cada frase de la narración. */
  beats: number[];
  lineas: Line[];
};

export type Thumb = {etiqueta: string; lineas: string[]; acento?: string; sello?: string; icono?: string; tono?: Tone};

export type VideoData = {
  id: string;
  slug: string;
  titulo: string;
  publicar?: string;
  busquedas?: string[];
  miniatura: Thumb;
  descripcion: string;
  etiquetas: string[];
  fuentes: {texto: string; url: string}[];
  fps: number;
  frames: number;
  audio: string;
  escenas: SceneData[];
  subtitulos: Caption[];
};

export type Canal = {nombre: string; alias: string; lema: string};

export type SceneProps = {scene: SceneData; video: VideoData; index: number};
