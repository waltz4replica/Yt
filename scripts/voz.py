"""Voz del canal: texto → audio con Piper, con caché y diccionario de pronunciación.

El guion se escribe tal y como debe LEERSE en pantalla. Para que la voz en español
pronuncie bien nombres en inglés y cifras hay dos mecanismos:

  1. `contenido/pronunciacion.json`: sustituciones globales («Rockstar» → «Rócstar»).
  2. Marcado puntual dentro de una frase: `{lo que se ve|lo que se dice}`.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "tts"
MARK = re.compile(r"\{([^{}|]*)\|([^{}|]*)\}")
LETTER = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def display_text(line: str) -> str:
    """Texto que se muestra (subtítulos, guion)."""
    return re.sub(r"\s+", " ", MARK.sub(lambda m: m.group(1), line)).strip()


class Lexicon:
    def __init__(self, path: Path):
        data = load_json(path)
        pairs = sorted(data["sustituciones"].items(), key=lambda kv: -len(kv[0]))
        self.rules = [
            (re.compile(rf"(?<![{LETTER}]){re.escape(k)}(?![{LETTER}])"), v) for k, v in pairs
        ]

    def apply(self, text: str) -> str:
        for rx, rep in self.rules:
            text = rx.sub(rep, text)
        return text

    def spoken(self, line: str) -> str:
        """Texto que se envía a la voz: marcado explícito tal cual, el resto pasa por el diccionario."""
        out, pos = [], 0
        for m in MARK.finditer(line):
            out.append(self.apply(line[pos : m.start()]))
            out.append(m.group(2))
            pos = m.end()
        out.append(self.apply(line[pos:]))
        return re.sub(r"\s+", " ", "".join(out)).strip()


class Voice:
    def __init__(self, canal: dict):
        from piper import PiperVoice, SynthesisConfig

        v = canal["voz"]
        model = ROOT / v["modelo"]
        if not model.exists():
            raise SystemExit(f"Falta el modelo de voz {model}. Ejecuta: bash scripts/preparar.sh")
        self.voice = PiperVoice.load(str(model))
        self.cfg = SynthesisConfig(
            length_scale=v.get("ritmo", 1.0),
            noise_scale=v.get("variacion", 0.667),
            noise_w_scale=v.get("variacion_ritmo", 0.8),
        )
        self.sr = self.voice.config.sample_rate
        self.key = json.dumps(v, sort_keys=True)
        self.sentence_gap = v.get("pausa_entre_oraciones", 0.2)
        CACHE.mkdir(parents=True, exist_ok=True)

    def synth(self, spoken: str) -> np.ndarray:
        """Audio mono float32 a `self.sr`, recortado y con fundidos cortos."""
        h = hashlib.sha1((self.key + "\n" + spoken).encode("utf-8")).hexdigest()[:20]
        f = CACHE / f"{h}.wav"
        if f.exists():
            x, _ = sf.read(f, dtype="float32")
            return x
        parts = []
        for chunk in self.voice.synthesize(spoken, syn_config=self.cfg):
            parts.append(trim(np.asarray(chunk.audio_float_array, dtype=np.float32), self.sr))
        gap = np.zeros(int(self.sr * self.sentence_gap), dtype=np.float32)
        x = parts[0]
        for p in parts[1:]:
            x = np.concatenate([x, gap, p])
        sf.write(f, x, self.sr, subtype="PCM_16")
        return x


def trim(x: np.ndarray, sr: int, thresh_db: float = -42.0, pad: float = 0.02) -> np.ndarray:
    if len(x) == 0:
        return x
    win = max(1, int(sr * 0.01))
    env = np.sqrt(np.convolve(x * x, np.ones(win) / win, mode="same"))
    idx = np.where(env > 10 ** (thresh_db / 20))[0]
    if len(idx) == 0:
        return x[:0]
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    y = x[a:b].copy()
    n = min(len(y) // 2, int(sr * 0.006))
    if n > 0:
        ramp = np.linspace(0, 1, n, dtype=np.float32)
        y[:n] *= ramp
        y[-n:] *= ramp[::-1]
    return y


def resample(x: np.ndarray, sr_from: int, sr_to: int) -> np.ndarray:
    """Remuestreo con filtro sinc por FFT (suficiente para voz; evita depender de scipy)."""
    if sr_from == sr_to or len(x) == 0:
        return x.astype(np.float32)
    n_out = int(round(len(x) * sr_to / sr_from))
    spec = np.fft.rfft(x)
    n_bins = n_out // 2 + 1
    out = np.zeros(n_bins, dtype=np.complex128)
    k = min(len(spec), n_bins)
    out[:k] = spec[:k]
    return (np.fft.irfft(out, n=n_out) * (n_out / len(x))).astype(np.float32)
