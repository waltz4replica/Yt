// Herramienta de revisión: renderiza fotogramas sueltos de una composición.
//   node scripts/fotogramas.mjs video-01 60 300 900
//   node scripts/fotogramas.mjs video-01 escenas     (un fotograma al final de cada escena)
//   node scripts/fotogramas.mjs todos escenas        (lo mismo, para los diez vídeos)
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const [, , compId, ...args] = process.argv;
const root = path.resolve(import.meta.dirname, '..');
const browserExecutable = process.env.CHROME_PATH || undefined;
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const {videos} = JSON.parse(fs.readFileSync(path.join(root, 'src/generated/videos.json'), 'utf8'));
const dir = path.join(root, 'out/stills');
fs.mkdirSync(dir, {recursive: true});

// «todos» recorre los diez vídeos; si no, la composición indicada
const comps = compId === 'todos' ? videos.map((v) => `video-${v.id}`) : [compId];
for (const id of comps) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  let frames = args.map(Number);
  if (args[0] === 'escenas') {
    const v = videos.find((x) => `video-${x.id}` === id);
    frames = v.escenas.map((s) => s.start + s.dur - 14);
  }
  for (const f of frames) {
    const output = path.join(dir, `${id}-${String(f).padStart(5, '0')}.jpg`);
    await renderStill({composition, serveUrl, output, frame: f, browserExecutable, imageFormat: 'jpeg', jpegQuality: 88, logLevel: 'error'});
    console.log(path.relative(root, output));
  }
}
