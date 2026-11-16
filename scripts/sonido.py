"""Sonido original del canal: base musical y efectos, sintetizados desde cero con numpy.

No se usa ninguna grabación ni muestra de terceros, así que no hay licencias que gestionar.
"""
from __future__ import annotations

import numpy as np

SR = 48000


def _rng(seed: int) -> np.random.Generator:
    return np.random.default_rng(seed)


def _fft_filter(x: np.ndarray, lo: float | None = None, hi: float | None = None, order: int = 4) -> np.ndarray:
    """Filtro de fase cero en el dominio de la frecuencia (paso alto, paso bajo o banda)."""
    spec = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    h = np.ones_like(f)
    if hi:
        h *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    if lo:
        h *= 1 - 1 / np.sqrt(1 + (f / lo) ** (2 * order))
    if x.ndim == 2:
        h = h[:, None]
    return np.fft.irfft(spec * h, n=len(x), axis=0)


def _harmonic(freq: float, t: np.ndarray, n_harm: int, cutoff: float, phase: float = 0.0) -> np.ndarray:
    """Diente de sierra de banda limitada: suma de armónicos con caída suave por encima de `cutoff`."""
    out = np.zeros_like(t)
    for n in range(1, n_harm + 1):
        fn = freq * n
        if fn > SR * 0.45:
            break
        amp = (1 / n) / (1 + (fn / cutoff) ** 2)
        out += amp * np.sin(2 * np.pi * fn * t + phase * n)
    return out


def _place(buf: np.ndarray, x: np.ndarray, start: int, wrap: bool = True) -> None:
    """Suma `x` en `buf` a partir de `start`; lo que se sale por el final vuelve al principio (bucle)."""
    n = len(buf)
    start %= n
    end = start + len(x)
    if end <= n:
        buf[start:end] += x
    else:
        k = n - start
        buf[start:] += x[:k]
        if wrap:
            rest = x[k:]
            buf[: len(rest)] += rest[: n]


NOTE = {"A": 0, "A#": 1, "B": 2, "C": 3, "C#": 4, "D": 5, "D#": 6, "E": 7, "F": 8, "F#": 9, "G": 10, "G#": 11}


def hz(name: str) -> float:
    """'A3' → 220.0 (octavas contadas desde La)."""
    pitch, octave = name[:-1], int(name[-1])
    semis = NOTE[pitch] + 12 * (octave - 4)
    # las octavas musicales empiezan en Do: Do4 está 9 semitonos por debajo de La4
    if NOTE[pitch] >= 3:
        semis -= 12
    return 440.0 * 2 ** (semis / 12)


def musica(bpm: float = 100.0, seed: int = 7) -> np.ndarray:
    """Bucle estéreo de 16 compases, La menor, pensado para sonar muy por debajo de la voz."""
    beat = 60 / bpm
    bar = beat * 4
    bars = 16
    n = int(round(bars * bar * SR))
    out = np.zeros((n, 2))
    rng = _rng(seed)

    prog = [  # (bajo, acorde) dos compases cada uno, la progresión se repite dos veces
        ("A1", ["A2", "E3", "A3", "C4", "E4"]),
        ("F1", ["F2", "C3", "F3", "A3", "C4"]),
        ("C2", ["C3", "G3", "C4", "E4", "G4"]),
        ("G1", ["G2", "D3", "G3", "B3", "D4"]),
    ]

    kick_times = [b * beat for b in range(bars * 4) if b % 2 == 0]
    duck = np.ones(n)
    for kt in kick_times:
        i = int(kt * SR)
        m = int(0.32 * SR)
        env = 1 - 0.42 * np.exp(-np.arange(m) / (0.11 * SR))
        seg = duck[i : i + m]
        seg *= env[: len(seg)]

    # --- colchón de acordes ---
    pad = np.zeros((n, 2))
    for rep in range(2):
        for ci, (_, chord) in enumerate(prog):
            start = (rep * 4 + ci) * 2 * bar
            dur = 2 * bar + 1.2
            t = np.arange(int(dur * SR)) / SR
            env = np.minimum(1, t / 0.7) * np.minimum(1, (dur - t) / 1.2)
            trem = 1 + 0.06 * np.sin(2 * np.pi * 0.23 * t + ci)
            for ni, note in enumerate(chord):
                f0 = hz(note)
                for det, pan in ((-6, 0.25), (0, 0.5), (7, 0.75)):
                    f = f0 * 2 ** (det / 1200)
                    cutoff = 950 + 500 * np.sin(2 * np.pi * (start + ni) / (8 * bar))
                    v = _harmonic(f, t, 14, max(500.0, cutoff), phase=rng.uniform(0, 6.28)) * env * trem
                    g = 0.05 / (1 + 0.25 * ni)
                    _place(pad[:, 0], v * g * (1 - pan), int(start * SR))
                    _place(pad[:, 1], v * g * pan, int(start * SR))
    pad *= duck[:, None]

    # --- bajo en corcheas ---
    bass = np.zeros(n)
    for rep in range(2):
        for ci, (root, _) in enumerate(prog):
            f = hz(root)
            for k in range(16):
                start = ((rep * 4 + ci) * 2 * bar) + k * beat / 2
                dur = beat / 2 * 0.95
                t = np.arange(int(dur * SR)) / SR
                env = np.minimum(1, t / 0.008) * np.exp(-t / 0.19)
                v = (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) + 0.2 * np.sin(2 * np.pi * 3 * f * t)) * env
                _place(bass, v * (0.2 if k % 2 == 0 else 0.13), int(start * SR))
    bass *= duck

    # --- arpegio con eco ---
    arp = np.zeros((n, 2))
    patterns = [[0, 2, 1, 3, 2, 4, 3, 2], [0, 1, 2, 3, 4, 3, 2, 1]]
    for rep in range(2):
        for ci, (_, chord) in enumerate(prog):
            for k in range(32):
                if rep == 0 and ci == 0 and k < 16:
                    continue  # el primer compás respira
                idx = patterns[rep][k % 8]
                f = hz(chord[idx]) * 2
                start = ((rep * 4 + ci) * 2 * bar) + k * beat / 4
                t = np.arange(int(0.5 * SR)) / SR
                env = np.minimum(1, t / 0.004) * np.exp(-t / 0.085)
                v = _harmonic(f, t, 6, 2600) * env * (0.05 if k % 4 == 0 else 0.034)
                pan = 0.32 if k % 2 == 0 else 0.68
                for echo in range(4):
                    g = 0.5**echo
                    p = pan if echo % 2 == 0 else 1 - pan
                    s = int((start + echo * beat * 0.75) * SR)
                    _place(arp[:, 0], v * g * (1 - p), s)
                    _place(arp[:, 1], v * g * p, s)

    # --- batería suave ---
    drums = np.zeros(n)
    t = np.arange(int(0.3 * SR)) / SR
    kick = np.sin(2 * np.pi * (48 * t + (110 - 48) * 0.035 * (1 - np.exp(-t / 0.035)))) * np.exp(-t / 0.11)
    for kt in kick_times:
        _place(drums, kick * 0.42, int(kt * SR))
    t = np.arange(int(0.2 * SR)) / SR
    for b in range(bars * 4):
        if b % 2 == 1:
            noise = _fft_filter(rng.standard_normal(len(t)), lo=900, hi=5200)
            clap = noise * np.exp(-t / 0.055) + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)
            _place(drums, clap * 0.085, int(b * beat * SR))
    t = np.arange(int(0.06 * SR)) / SR
    for e in range(bars * 8):
        if e % 2 == 1:
            hat = _fft_filter(rng.standard_normal(len(t)), lo=7000) * np.exp(-t / 0.014)
            _place(drums, hat * 0.03, int(e * beat / 2 * SR))

    out += pad
    out += arp
    out += (bass * 0.85)[:, None]
    out += drums[:, None]

    # --- reverberación: convolución con ruido que decae, plegada sobre el bucle ---
    m = int(1.8 * SR)
    tt = np.arange(m) / SR
    ir = rng.standard_normal((m, 2)) * np.exp(-tt / 0.42)[:, None]
    ir = _fft_filter(ir, lo=250, hi=5200)
    ir /= np.sqrt((ir**2).sum(axis=0))
    wet_src = pad * 0.6 + arp
    size = n + m
    nfft = 1 << int(np.ceil(np.log2(size)))
    wet = np.fft.irfft(np.fft.rfft(wet_src, nfft, axis=0) * np.fft.rfft(ir, nfft, axis=0), nfft, axis=0)[:size]
    folded = wet[:n].copy()
    folded[:m] += wet[n:size]
    out += folded * 0.26

    out = _fft_filter(out, lo=32, hi=15000, order=2)
    out /= np.abs(out).max() / 0.7
    return out.astype(np.float32)


def whoosh(dur: float = 0.5, seed: int = 1) -> np.ndarray:
    n = int(dur * SR)
    rng = _rng(seed)
    noise = rng.standard_normal(n)
    low = _fft_filter(noise, lo=250, hi=1300)
    high = _fft_filter(noise, lo=1700, hi=7500)
    w = np.linspace(0, 1, n) ** 1.5
    env = np.sin(np.pi * np.linspace(0, 1, n) ** 0.8) ** 2
    y = ((1 - w) * low + w * high * 0.8) * env
    return (y / np.abs(y).max()).astype(np.float32)


def pop(seed: int = 2) -> np.ndarray:
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    f = 620 + 520 * (1 - np.exp(-t / 0.02))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.022) * np.minimum(1, t / 0.002)
    return (y / np.abs(y).max()).astype(np.float32)


def impact(seed: int = 3) -> np.ndarray:
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 46 + 95 * np.exp(-t / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    click = _fft_filter(_rng(seed).standard_normal(n), lo=500, hi=3200) * np.exp(-t / 0.018)
    y = body + 0.45 * click
    return (y / np.abs(y).max()).astype(np.float32)


def chime(seed: int = 4) -> np.ndarray:
    """Dos notas brillantes para el cierre (La5 → Mi6)."""
    n = int(1.1 * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for i, f in enumerate((880.0, 1318.5)):
        d = int(i * 0.11 * SR)
        tt = t[: n - d]
        tone = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt / 0.3) * np.minimum(1, tt / 0.004)
        y[d:] += tone
    return (y / np.abs(y).max()).astype(np.float32)
