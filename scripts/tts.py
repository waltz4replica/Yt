#!/usr/bin/env python3
"""Guion → voz, tiempos y mezcla final de audio.

Para cada vídeo de `contenido/videos/*.json`:
  1. sintetiza cada frase de la narración (con caché),
  2. calcula en qué fotograma empieza y acaba cada frase, escena y subtítulo,
  3. mezcla voz + base musical + efectos y normaliza el volumen,
  4. escribe `public/audio/<id>.m4a` y actualiza `src/generated/videos.json`,
     que es lo que lee Remotion para animar en sincronía con la voz.

Uso:  python3 scripts/tts.py            (todos los vídeos)
      python3 scripts/tts.py 01 05      (solo esos)
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sonido  # noqa: E402
import voz as V  # noqa: E402

ROOT = V.ROOT
FPS = 30
SR = sonido.SR
OUT_AUDIO = ROOT / "public" / "audio"
GENERATED = ROOT / "src" / "generated" / "videos.json"

# Ritmo de la narración (segundos)
LEAD = 0.34  # aire al entrar en una escena
LEAD_FIRST = 0.3
GAP = 0.24  # entre frases de una misma escena
TAIL = 0.3  # aire al salir de una escena
TAIL_LAST = 1.6  # la última escena se queda un momento en pantalla

TOKEN = re.compile(r"(?:\{[^{}]*\}|[^\s{}])+")


def caption_chunks(line: str, lex: V.Lexicon, max_chars: int = 40) -> list[tuple[str, float]]:
    """Parte una frase en trozos de subtítulo y estima el peso (duración relativa) de cada uno."""
    tokens = TOKEN.findall(line)

    def shown(ts: list[str]) -> str:
        return V.display_text(" ".join(ts))

    # 1) cláusulas: se corta en la puntuación fuerte y, si ya hay cuerpo, en las comas
    clauses: list[list[str]] = []
    cur: list[str] = []
    for tok in tokens:
        cur.append(tok)
        last = V.display_text(tok)
        length = len(shown(cur))
        if (re.search(r"[.:;!?…]$", last) and length >= 12) or (last.endswith(",") and length >= 22):
            clauses.append(cur)
            cur = []
    if cur:
        clauses.append(cur)
    # una cláusula final muy corta se une a la anterior si cabe
    fused: list[list[str]] = []
    for c in clauses:
        if fused and len(shown(c)) < 10 and len(shown(fused[-1] + c)) <= max_chars:
            fused[-1] = fused[-1] + c
        else:
            fused.append(c)

    # 2) cada cláusula larga se reparte en trozos equilibrados (nada de palabras huérfanas)
    merged: list[list[str]] = []
    for c in fused:
        total_len = len(shown(c))
        k = max(1, int(np.ceil(total_len / max_chars)))
        target = total_len / k
        part: list[str] = []
        for i, tok in enumerate(c):
            if part and len(shown(part + [tok])) > target + 6 and k > 1:
                merged.append(part)
                part = [tok]
                k -= 1
                target = len(shown(c[i:])) / max(k, 1)
            else:
                part.append(tok)
        if part:
            merged.append(part)

    out = []
    for g in merged:
        spoken = lex.spoken(" ".join(g))
        weight = len(re.sub(r"[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]", "", spoken))
        weight += 4 * len(re.findall(r"[.:;!?…]", spoken)) + 2 * spoken.count(",")
        out.append((shown(g), float(max(weight, 1))))
    return out


def ffmpeg(*args: str) -> str:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"ffmpeg falló:\n{r.stderr[-1500:]}")
    return r.stderr


def process_voice(x: np.ndarray) -> np.ndarray:
    """Limpieza y presencia de la voz (48 kHz mono)."""
    chain = (
        "highpass=f=70,"
        "equalizer=f=220:t=q:w=1.0:g=-1.5,"
        "equalizer=f=3600:t=q:w=1.1:g=2.5,"
        "acompressor=threshold=-21dB:ratio=3:attack=6:release=140:makeup=3,"
        "alimiter=limit=0.9"
    )
    with tempfile.TemporaryDirectory() as d:
        a, b = Path(d) / "a.wav", Path(d) / "b.wav"
        sf.write(a, x, SR, subtype="FLOAT")
        ffmpeg("-i", str(a), "-af", chain, "-ar", str(SR), "-c:a", "pcm_f32le", str(b))
        y, _ = sf.read(b, dtype="float32")
    return y[: len(x)] if len(y) >= len(x) else np.pad(y, (0, len(x) - len(y)))


def rms_db(x: np.ndarray) -> float:
    x = x[np.abs(x) > 1e-4]
    return 20 * np.log10(np.sqrt(np.mean(x**2)) + 1e-12) if len(x) else -120.0


def get_music() -> np.ndarray:
    f = ROOT / ".cache" / "musica.wav"
    if not f.exists():
        f.parent.mkdir(parents=True, exist_ok=True)
        print("  · sintetizando la base musical…")
        sf.write(f, sonido.musica(), SR, subtype="PCM_16")
    m, _ = sf.read(f, dtype="float32")
    return m


def export(mix: np.ndarray, dest: Path) -> None:
    """Normaliza a −15 LUFS (dos pasadas) y codifica en AAC."""
    with tempfile.TemporaryDirectory() as d:
        raw = Path(d) / "mix.wav"
        sf.write(raw, mix, SR, subtype="FLOAT")
        target = "I=-15:TP=-1.5:LRA=11"
        log = ffmpeg("-i", str(raw), "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-")
        stats = json.loads(log[log.rindex("{") : log.rindex("}") + 1])
        second = (
            f"loudnorm={target}:measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:"
            f"measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:"
            f"offset={stats['target_offset']}:linear=true"
        )
        dest.parent.mkdir(parents=True, exist_ok=True)
        ffmpeg("-i", str(raw), "-af", second, "-ar", str(SR), "-c:a", "aac", "-b:a", "192k", str(dest))


def build(video: dict, voice: V.Voice, lex: V.Lexicon) -> dict:
    scenes = video["escenas"]
    t = 0.0
    placed: list[tuple[float, np.ndarray]] = []
    sfx: list[tuple[float, str, float]] = []
    captions = []
    out_scenes = []

    for si, sc in enumerate(scenes):
        scene_start = t
        t += LEAD_FIRST if si == 0 else LEAD
        lines = []
        for li, raw in enumerate(sc["narracion"]):
            spoken = lex.spoken(raw)
            audio = V.resample(voice.synth(spoken), voice.sr, SR)
            dur = len(audio) / SR
            placed.append((t, audio))
            chunks = caption_chunks(raw, lex)
            total = sum(w for _, w in chunks)
            ct = t
            for text, w in chunks:
                cd = dur * w / total
                captions.append({"start": round(ct * FPS), "end": round((ct + cd) * FPS), "text": text})
                ct += cd
            lines.append({"start": round(t * FPS), "end": round((t + dur) * FPS), "text": V.display_text(raw)})
            t += dur + (GAP if li < len(sc["narracion"]) - 1 else 0)
        t += TAIL_LAST if si == len(scenes) - 1 else TAIL
        out_scenes.append({**{k: v for k, v in sc.items() if k != "narracion"}, "_start_s": scene_start, "lineas": lines})

    total_frames = int(np.ceil(t * FPS))
    for i, sc in enumerate(out_scenes):
        start = round(sc.pop("_start_s") * FPS)
        end = round(out_scenes[i + 1]["_start_s"] * FPS) if i + 1 < len(out_scenes) else total_frames
        sc["start"], sc["dur"] = start, end - start
        sc["beats"] = [ln["start"] - start for ln in sc["lineas"]]
        tipo = sc["tipo"]
        if i > 0:
            sfx.append((start / FPS - 0.16, "whoosh", -21.0))
        if tipo in ("lista", "pasos", "relojes", "linea", "comparar", "personaje", "zona", "radio"):
            for b in sc["beats"][1:]:
                sfx.append(((start + b) / FPS, "pop", -23.0))
        if tipo in ("veredicto", "dato"):
            k = min(sc.get("props", {}).get("golpe", 1 if tipo == "veredicto" else 0), len(sc["beats"]) - 1)
            sfx.append(((start + sc["beats"][k]) / FPS + 0.12, "impact", -17.0))
        if tipo == "cierre":
            sfx.append((start / FPS + 0.25, "chime", -22.0))

    # los subtítulos no se pisan y no dejan huecos de un fotograma
    for a, b in zip(captions, captions[1:]):
        if 0 < b["start"] - a["end"] <= 4 or a["end"] > b["start"]:
            a["end"] = b["start"]

    # ---------- mezcla ----------
    n = int(np.ceil(total_frames / FPS * SR))
    voice_track = np.zeros(n, dtype=np.float32)
    for start, audio in placed:
        i = int(start * SR)
        voice_track[i : i + len(audio)] += audio[: n - i]
    voice_track = process_voice(voice_track)
    v_db = rms_db(voice_track)

    mix = np.repeat(voice_track[:, None], 2, axis=1).astype(np.float64)

    music = get_music()
    reps = int(np.ceil(n / len(music)))
    bed = np.tile(music, (reps, 1))[:n].astype(np.float64)
    bed *= 10 ** ((v_db - 21.0 - rms_db(music.mean(axis=1))) / 20)
    fade_in, fade_out = int(0.6 * SR), int(2.2 * SR)
    bed[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    bed[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None] ** 1.5
    mix += bed

    bank = {"whoosh": sonido.whoosh(), "pop": sonido.pop(), "impact": sonido.impact(), "chime": sonido.chime()}
    for start, name, gain in sfx:
        s = bank[name] * 10 ** ((v_db + 12 + gain) / 20)
        i = max(0, int(start * SR))
        seg = s[: max(0, n - i)]
        mix[i : i + len(seg)] += seg[:, None]

    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    export(mix.astype(np.float32), OUT_AUDIO / f"{video['id']}.m4a")

    result = {k: v for k, v in video.items() if k != "escenas"}
    result.update(
        {
            "fps": FPS,
            "frames": total_frames,
            "audio": f"audio/{video['id']}.m4a",
            "escenas": out_scenes,
            "subtitulos": captions,
        }
    )
    words = sum(len(V.display_text(l).split()) for sc in scenes for l in sc["narracion"])
    print(f"  ✓ {video['id']} · {total_frames / FPS:5.1f} s · {len(scenes)} escenas · {words} palabras")
    return result


def main() -> None:
    only = set(a for a in sys.argv[1:] if not a.startswith("-"))
    canal = V.load_json(ROOT / "contenido" / "canal.json")
    lex = V.Lexicon(ROOT / "contenido" / "pronunciacion.json")
    voice = V.Voice(canal)

    existing = {}
    if GENERATED.exists():
        existing = {v["id"]: v for v in json.loads(GENERATED.read_text(encoding="utf-8"))["videos"]}

    files = sorted((ROOT / "contenido" / "videos").glob("*.json"))
    ids = []
    for f in files:
        video = V.load_json(f)
        ids.append(video["id"])
        if only and video["id"] not in only:
            continue
        existing[video["id"]] = build(video, voice, lex)

    GENERATED.parent.mkdir(parents=True, exist_ok=True)
    payload = {"canal": canal, "videos": [existing[i] for i in ids if i in existing]}
    GENERATED.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"→ {GENERATED.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
