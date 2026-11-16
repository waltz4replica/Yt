# Leonida al Día — canal de GTA 6 hecho con Claude Code

Canal de YouTube sobre GTA 6 (lanzamiento: jueves 19 de noviembre de 2026) donde **guion, voz, animaciones y montaje salen de código**. Nadie graba, nadie edita, nadie sale en cámara.

Idea original: el vídeo de TikTok de @martivegara.yt («Quiero un canal de GTA 6 listo para el día que salga…»): investigar qué busca la gente, crear la identidad del canal, escribir 10 guiones con gancho, ponerles voz, imágenes, animaciones y montaje, y dejar título, miniatura y descripción listos.

## Qué hay

| Paso del vídeo | Dónde |
|---|---|
| 1. Qué busca la gente | `investigacion/` y el campo `busquedas` de cada guion |
| 2. Identidad (logo y portada) | `entregables/canal/logo.png`, `portada.png` (`src/brand/`) |
| 3. Diez guiones con gancho | `contenido/videos/*.json` |
| 4. Voz, imágenes, animación, montaje | `scripts/` (voz y audio) + `src/` (Remotion) |
| 5. Título, miniatura, descripción | `entregables/videos/NN-*/` (`ficha.md`, `miniatura.jpg`, `subtitulos.srt`, `video.mp4`) |

Todos los datos salen de fuentes oficiales (Rockstar, Xbox Wire, PlayStation) o prensa citada, y cada vídeo las lista en su descripción. Fecha de comprobación: 16-nov-2026. **Sin rumores.**

## Regenerar todo

```bash
npm install
pip install piper-tts sherpa-onnx numpy soundfile   # voz (Piper) y control de calidad
npm run voz        # guion → voz + tiempos + mezcla (src/generated/videos.json, public/audio)
npm run build      # renderiza vídeos, miniaturas, subtítulos y fichas en entregables/
npm run studio     # vista previa en el navegador
```

Modelo de voz: `modelos/es_ES-davefx-medium.onnx` (Piper, licencia CC0). Si falta, descárgalo de la release `tts-models` de sherpa-onnx.
`python3 scripts/verificar_voz.py` transcribe cada frase y avisa de palabras mal pronunciadas; las correcciones van en `contenido/pronunciacion.json`.

## Antes de subir

- Revisa cada `ficha.md` (título, descripción, etiquetas) y los datos que puedan haber cambiado desde el 16-nov.
- Es un canal **no oficial**: el aviso legal ya va en cada descripción y en el cierre de cada vídeo.
- La voz es sintética; el contenido no imita personas reales.
