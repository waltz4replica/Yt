#!/usr/bin/env node
// Lo monta todo: voz → vídeo → miniatura → subtítulos → ficha de subida.
//
//   node scripts/build.mjs              todos los vídeos + identidad del canal
//   node scripts/build.mjs 03 07        solo esos vídeos
//   node scripts/build.mjs --solo-canal solo logo y portada
//   node scripts/build.mjs --sin-voz    no regenera el audio (usa el que ya hay)
//   node scripts/build.mjs --sin-video  solo miniaturas, subtítulos y fichas
//
// Variables: CHROME_PATH (navegador a usar), PYTHON (intérprete con piper-tts), HILOS (núcleos).
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const ids = args.filter((a) => !a.startsWith('--'));
const out = path.join(root, 'entregables');
const browserExecutable = process.env.CHROME_PATH || undefined;
const concurrency = Number(process.env.HILOS) || null;

const AVISO =
  'Canal no oficial hecho por fans. Grand Theft Auto, GTA y Rockstar Games son marcas registradas de Take-Two Interactive Software. ' +
  'Este canal no está afiliado, patrocinado ni respaldado por Rockstar Games ni por Take-Two.';

// ---------- 1. voz y tiempos ----------
if (!flags.has('--sin-voz') && !flags.has('--solo-canal')) {
  const venv = path.join(root, '.venv/bin/python');
  const py = process.env.PYTHON || (fs.existsSync(venv) ? venv : 'python3');
  console.log('▸ Voz y tiempos');
  const r = spawnSync(py, [path.join(root, 'scripts/tts.py'), ...ids], {stdio: 'inherit'});
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const {canal, videos} = JSON.parse(fs.readFileSync(path.join(root, 'src/generated/videos.json'), 'utf8'));
const selected = videos.filter((v) => ids.length === 0 || ids.includes(v.id));

// ---------- 2. empaquetado ----------
console.log('▸ Empaquetando el proyecto');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const comp = (id) => selectComposition({serveUrl, id, browserExecutable});
const still = async (id, output, opts = {}) =>
  renderStill({composition: await comp(id), serveUrl, output, browserExecutable, logLevel: 'error', ...opts});

// ---------- 3. identidad del canal ----------
if (ids.length === 0 || flags.has('--solo-canal')) {
  const dir = path.join(out, 'canal');
  fs.mkdirSync(dir, {recursive: true});
  await still('logo', path.join(dir, 'logo.png'));
  await still('portada', path.join(dir, 'portada.png'));
  console.log('  ✓ canal/logo.png · canal/portada.png');
}
if (flags.has('--solo-canal')) process.exit(0);

// ---------- 4. vídeos ----------
const pad = (n, w = 2) => String(n).padStart(w, '0');
const srtTime = (frame, fps) => {
  const ms = Math.round((frame / fps) * 1000);
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
};
const clock = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

function chapters(v) {
  const list = [];
  for (const s of v.escenas) {
    if (!s.capitulo) continue;
    const t = s.start / v.fps;
    if (list.length === 0) list.push({t: 0, name: s.capitulo});
    else if (t - list[list.length - 1].t >= 10) list.push({t, name: s.capitulo});
  }
  return list.length >= 3 ? list : [];
}

function description(v) {
  const ch = chapters(v);
  const hashtags = ['#GTA6', '#GTAVI', '#GrandTheftAuto6'].join(' ');
  return [
    v.descripcion,
    '',
    ...(ch.length ? ['CAPÍTULOS', ...ch.map((c) => `${clock(c.t)} ${c.name}`), ''] : []),
    'FUENTES (todo lo que se dice en el vídeo sale de aquí)',
    ...v.fuentes.map((f) => `· ${f.texto}: ${f.url}`),
    '',
    `Datos comprobados el 16 de noviembre de 2026. Si Rockstar actualiza algo, lo corrijo en el comentario fijado.`,
    '',
    AVISO,
    '',
    hashtags,
  ].join('\n');
}

function ficha(v, dir) {
  const secs = v.frames / v.fps;
  const aviso = v.titulo.length > 70 ? `\n> ⚠️ El título tiene ${v.titulo.length} caracteres; YouTube suele cortar a partir de ~70.\n` : '';
  return `# ${v.id} · ${v.titulo}

- **Duración:** ${clock(secs)}
- **Cuándo publicarlo:** ${v.publicar ?? 'Cuando quieras'}
- **Búsquedas a las que responde:** ${(v.busquedas ?? []).map((b) => `«${b}»`).join(', ')}
${aviso}
## Título

\`\`\`
${v.titulo}
\`\`\`

## Descripción

\`\`\`
${description(v)}
\`\`\`

## Etiquetas

\`\`\`
${v.etiquetas.join(', ')}
\`\`\`

## Al subirlo

- Vídeo: \`video.mp4\` · Miniatura: \`miniatura.jpg\` · Subtítulos: \`subtitulos.srt\` (idioma: español)
- Categoría: Videojuegos · Título del juego: Grand Theft Auto VI
- Público: «No, no es contenido creado para niños»
- Contenido alterado o sintético: la voz es sintética, pero el vídeo no simula personas ni hechos reales, así que YouTube no exige la etiqueta. Si prefieres curarte en salud, márcala.
`;
}

function guion(v) {
  const parts = [`# Guion ${v.id} · ${v.titulo}\n`];
  v.escenas.forEach((s, i) => {
    parts.push(`## ${i + 1}. ${s.capitulo ?? s.tipo} _(${s.tipo}, ${clock(s.start / v.fps)})_\n`);
    parts.push(s.lineas.map((l) => l.text).join(' ') + '\n');
    if (s.fuente) parts.push(`> Fuente en pantalla: ${s.fuente}\n`);
  });
  return parts.join('\n');
}

for (const v of selected) {
  const dir = path.join(out, 'videos', `${v.id}-${v.slug}`);
  fs.mkdirSync(dir, {recursive: true});
  console.log(`▸ ${v.id} · ${v.titulo}`);

  fs.writeFileSync(
    path.join(dir, 'subtitulos.srt'),
    v.subtitulos.map((c, i) => `${i + 1}\n${srtTime(c.start, v.fps)} --> ${srtTime(c.end, v.fps)}\n${c.text}\n`).join('\n'),
  );
  fs.writeFileSync(path.join(dir, 'ficha.md'), ficha(v, dir));
  fs.writeFileSync(path.join(dir, 'guion.md'), guion(v));
  await still(`miniatura-${v.id}`, path.join(dir, 'miniatura.jpg'), {imageFormat: 'jpeg', jpegQuality: 92});

  if (!flags.has('--sin-video')) {
    const t0 = Date.now();
    let last = -1;
    await renderMedia({
      composition: await comp(`video-${v.id}`),
      serveUrl,
      codec: 'h264',
      outputLocation: path.join(dir, 'video.mp4'),
      imageFormat: 'jpeg',
      jpegQuality: 90,
      crf: 20,
      pixelFormat: 'yuv420p',
      colorSpace: 'bt709',
      audioCodec: 'aac',
      audioBitrate: '192k',
      concurrency,
      browserExecutable,
      logLevel: 'error',
      onProgress: ({progress}) => {
        const p = Math.floor(progress * 10);
        if (p !== last) {
          last = p;
          process.stdout.write(`  ${p * 10}%`);
        }
      },
    });
    const mb = fs.statSync(path.join(dir, 'video.mp4')).size / 1e6;
    console.log(`\n  ✓ video.mp4 · ${clock(v.frames / v.fps)} · ${mb.toFixed(1)} MB · ${((Date.now() - t0) / 1000).toFixed(0)} s de render`);
  }
}
console.log(`\nListo → ${path.relative(root, out)}/`);
