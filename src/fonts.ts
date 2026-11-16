import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fuentes locales (licencia SIL OFL 1.1) para que el render no dependa de la red.
const fonts = [
  {family: 'Anton', file: 'anton-latin-400-normal.woff2', weight: '400'},
  {family: 'Inter', file: 'inter-latin-wght-normal.woff2', weight: '100 900'},
  {family: 'JetBrains Mono', file: 'jetbrains-mono-latin-400-normal.woff2', weight: '400'},
  {family: 'JetBrains Mono', file: 'jetbrains-mono-latin-700-normal.woff2', weight: '700'},
];

export const fontsReady = Promise.all(
  fonts.map((f) => loadFont({family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight})),
);
