#!/usr/bin/env python3
"""Control de calidad de la voz: transcribe cada frase y la compara con el guion.

Sirve para cazar nombres mal pronunciados sin tener que escuchar los diez vídeos enteros.
Lo que aparezca en la lista hay que oírlo y, si suena mal, corregirlo en
`contenido/pronunciacion.json` o con el marcado `{se ve|se dice}` en el guion.

Necesita `pip install sherpa-onnx` y un modelo Whisper de sherpa-onnx en WHISPER_DIR
(por defecto `modelos/whisper`). Uso:  python3 scripts/verificar_voz.py [ids] [--umbral 0.8]
"""
from __future__ import annotations

import difflib
import os
import re
import sys
import unicodedata
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import voz as V  # noqa: E402

ROOT = V.ROOT
NUM = {
    "cero": "0", "un": "1", "uno": "1", "una": "1", "dos": "2", "tres": "3", "cuatro": "4", "cinco": "5", "seis": "6",
    "siete": "7", "ocho": "8", "nueve": "9", "diez": "10", "doce": "12", "trece": "13", "cien": "100",
    "vi": "6", "v": "5", "iv": "4", "iii": "3",
}


def norm(s: str) -> list[str]:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    words = re.sub(r"[^a-z0-9ñ ]+", " ", s).split()
    return [NUM.get(w, w) for w in words]


def main() -> None:
    import sherpa_onnx

    argv = sys.argv[1:]
    threshold = 0.8
    if "--umbral" in argv:
        i = argv.index("--umbral")
        threshold = float(argv[i + 1])
        del argv[i : i + 2]
    args = [a for a in argv if not a.startswith("--")]
    d = Path(os.environ.get("WHISPER_DIR", ROOT / "modelos" / "whisper"))
    enc = next(d.glob("*encoder*.onnx"))
    dec = next(d.glob("*decoder*.onnx"))
    tok = next(d.glob("*tokens.txt"))
    asr = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(enc), decoder=str(dec), tokens=str(tok), language="es", task="transcribe", num_threads=4
    )
    lex = V.Lexicon(ROOT / "contenido" / "pronunciacion.json")
    voice = V.Voice(V.load_json(ROOT / "contenido" / "canal.json"))

    total = flagged = 0
    for f in sorted((ROOT / "contenido" / "videos").glob("*.json")):
        video = V.load_json(f)
        if args and video["id"] not in args:
            continue
        for sc in video["escenas"]:
            for raw in sc["narracion"]:
                total += 1
                shown, spoken = V.display_text(raw), lex.spoken(raw)
                audio = V.resample(voice.synth(spoken), voice.sr, 16000)
                pad = np.zeros(6400, dtype=np.float32)  # 0,4 s de aire, como en la mezcla real
                audio = np.concatenate([pad, audio, pad])
                st = asr.create_stream()
                st.accept_waveform(16000, audio)
                asr.decode_stream(st)
                heard = st.result.text.strip()
                ratio = difflib.SequenceMatcher(None, norm(shown), norm(heard)).ratio()
                if ratio < threshold:
                    flagged += 1
                    print(f"[{video['id']}] {ratio:.2f}\n   guion: {shown}\n   dice : {spoken}\n   oye  : {heard}\n")
    print(f"{total} frases revisadas · {flagged} para escuchar")


if __name__ == "__main__":
    main()
