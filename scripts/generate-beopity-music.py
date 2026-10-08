#!/usr/bin/env python3
"""Render Beopity's original instrumental catalogue without samples or audio playback.

Requires Python 3 + NumPy and ffmpeg/ffprobe on PATH (or FFMPEG/FFPROBE).
All scores, synthesizers, percussion and room responses are authored here.
Run from any directory. Temporary PCM data stays in memory; only final MP3s,
the TypeScript catalogue and the measured render report are written.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
DESTINATION = ROOT / "public/beopity/music"
SAMPLE_RATE = 44100
TAU = math.tau


def score(id, title, key, bpm, bars, accent, piano, lead, pad, groove, chords, motifs, tail=9, meter=4):
    return dict(id=id, title=title, key=key, bpm=bpm, bars=bars, accent=accent,
                piano=piano, lead=lead, pad=pad, groove=groove, chords=chords,
                motifs=motifs, tail=tail, meter=meter)


# Each tuple is (chord label, bass MIDI, close but softly voiced chord MIDI).
# The individual melodies below are original scores, not random note streams.
SCORES = [
    score("mosslight", "Mosslight", "D major", 62, 24, "#b3d6ba", "rhodes", "glass", "warm", "brush",
          [("Dmaj9", 38, [54, 57, 61, 64]), ("Bm9", 35, [50, 54, 57, 61]),
           ("Gmaj9", 31, [47, 50, 54, 57]), ("A6/9", 33, [49, 54, 59, 64]),
           ("Dmaj9/F#", 30, [50, 57, 61, 64]), ("Em9", 40, [55, 59, 62, 66]),
           ("Gmaj9", 31, [47, 54, 57, 62]), ("A6", 33, [49, 52, 57, 66])],
          [[73, 69, 66, 64], [73, 71, 69, 66], [69, 66, 62, 66], [71, 69, 66, 64],
           [66, 69, 73, 76], [74, 71, 67, 66], [69, 74, 71, 66], [73, 71, 69, 66]]),
    score("rain-on-linen", "Rain on Linen", "C major", 58, 24, "#b6c9dd", "felt", "felt", "air", "rain",
          [("Cmaj9", 36, [52, 55, 59, 62]), ("Am9", 33, [48, 52, 55, 59]),
           ("Dm9", 38, [53, 57, 60, 64]), ("G13", 31, [53, 57, 59, 64]),
           ("Fmaj9", 29, [52, 57, 60, 67]), ("Em7", 40, [55, 59, 62, 67]),
           ("Dm9", 38, [53, 57, 60, 64]), ("G6", 31, [50, 55, 59, 64])],
          [[71, 67, 64, 62], [72, 71, 67, 64], [69, 65, 64, 62], [71, 69, 67, 64],
           [72, 69, 67, 64], [71, 67, 62, 64], [69, 72, 76, 74], [71, 69, 67, 62]], tail=10),
    score("amber-window", "Amber Window", "F major", 70, 28, "#e7c39a", "nylon", "marimba", "warm", "bossa",
          [("Fmaj9", 29, [45, 52, 55, 60]), ("Dm9", 38, [53, 57, 60, 64]),
           ("Gm9", 31, [46, 53, 57, 62]), ("C6/9", 36, [52, 57, 62, 67]),
           ("Bbmaj9", 34, [50, 53, 57, 60]), ("Am7", 33, [48, 52, 55, 60]),
           ("Gm9", 31, [46, 53, 57, 62]), ("C6", 36, [52, 55, 57, 60])],
          [[69, 67, 65, 64], [69, 72, 76, 72], [70, 69, 67, 65], [67, 64, 62, 60],
           [65, 69, 72, 74], [72, 70, 69, 67], [70, 74, 72, 69], [67, 64, 62, 64]]),
    score("slow-orbit", "Slow Orbit", "E major", 55, 24, "#c4bcdf", "soft-synth", "bell", "space", "none",
          [("Emaj9", 40, [56, 59, 63, 66]), ("C#m9", 37, [52, 56, 59, 63]),
           ("Amaj9", 33, [49, 56, 59, 64]), ("B6", 35, [51, 54, 59, 68]),
           ("G#m7", 32, [47, 54, 59, 63]), ("Amaj9", 33, [49, 56, 59, 64]),
           ("F#m9", 30, [45, 52, 56, 61]), ("B6/9", 35, [51, 56, 61, 66])],
          [[75, 71, 68, 66], [75, 73, 71, 68], [76, 75, 71, 68], [73, 71, 66, 63],
           [71, 68, 66, 63], [68, 71, 76, 75], [73, 68, 64, 61], [75, 73, 71, 66]], tail=11),
    score("lavender-haze", "Lavender Haze", "A major", 65, 24, "#cfc0de", "rhodes", "flute", "air", "halftime",
          [("Amaj9", 33, [49, 52, 56, 59]), ("F#m9", 30, [45, 49, 52, 56]),
           ("Dmaj9", 38, [54, 57, 61, 64]), ("E6/9", 40, [56, 61, 66, 71]),
           ("C#m7", 37, [52, 56, 59, 64]), ("Dmaj9", 38, [54, 57, 61, 64]),
           ("Bm9", 35, [50, 54, 57, 61]), ("E6", 40, [56, 59, 61, 64])],
          [[76, 73, 71, 68], [73, 69, 68, 66], [74, 73, 69, 66], [76, 71, 68, 66],
           [73, 71, 68, 64], [74, 78, 76, 73], [73, 71, 69, 66], [71, 68, 66, 64]]),
    score("paper-lanterns", "Paper Lanterns", "Eb major", 72, 28, "#e3baac", "marimba", "nylon", "warm", "lantern",
          [("Ebmaj9", 39, [55, 58, 62, 65]), ("Cm9", 36, [51, 55, 58, 62]),
           ("Abmaj9", 32, [48, 55, 58, 63]), ("Bb6/9", 34, [50, 55, 60, 65]),
           ("Fm9", 29, [44, 51, 55, 60]), ("Gm7", 31, [46, 53, 58, 62]),
           ("Abmaj9", 32, [48, 55, 58, 63]), ("Bb6", 34, [50, 53, 55, 58])],
          [[74, 70, 67, 65], [75, 74, 70, 67], [72, 70, 68, 67], [74, 72, 70, 65],
           [72, 68, 67, 65], [74, 70, 65, 62], [75, 72, 70, 67], [74, 72, 70, 67]], tail=8),
    score("soft-current", "Soft Current", "G major", 76, 28, "#a9cdd0", "nylon", "glass", "air", "current",
          [("Gmaj9", 31, [47, 50, 54, 57]), ("Em9", 40, [55, 59, 62, 66]),
           ("Cmaj9", 36, [52, 55, 59, 62]), ("D6/9", 38, [54, 59, 64, 69]),
           ("Am9", 33, [48, 52, 55, 59]), ("Bm7", 35, [50, 54, 57, 62]),
           ("Cmaj9", 36, [52, 55, 59, 62]), ("D6", 38, [54, 57, 59, 62])],
          [[74, 71, 69, 66], [74, 71, 67, 66], [76, 74, 71, 67], [74, 69, 66, 64],
           [72, 71, 67, 64], [74, 71, 66, 62], [71, 74, 76, 74], [69, 66, 64, 62]]),
    score("midnight-garden", "Midnight Garden", "B minor", 60, 24, "#a8b9ce", "soft-synth", "rhodes", "space", "halftime",
          [("Bm9", 35, [50, 54, 57, 61]), ("Gmaj9", 31, [47, 50, 54, 57]),
           ("Dmaj9", 38, [54, 57, 61, 64]), ("A6/9", 33, [49, 54, 59, 64]),
           ("Em9", 40, [55, 59, 62, 66]), ("Bm7/F#", 30, [50, 54, 57, 62]),
           ("Gmaj9", 31, [47, 54, 57, 62]), ("A6", 33, [49, 52, 57, 66])],
          [[66, 62, 61, 59], [66, 62, 59, 57], [69, 66, 64, 61], [71, 69, 66, 64],
           [67, 66, 62, 59], [66, 69, 66, 62], [69, 66, 62, 59], [64, 61, 59, 57]], tail=10),
    score("peach-horizon", "Peach Horizon", "Db major", 74, 28, "#e9c2b6", "rhodes", "flute", "warm", "bossa",
          [("Dbmaj9", 37, [53, 56, 60, 63]), ("Bbm9", 34, [49, 53, 56, 60]),
           ("Gbmaj9", 30, [46, 53, 56, 61]), ("Ab6/9", 32, [48, 53, 58, 63]),
           ("Ebm9", 39, [54, 58, 61, 65]), ("Fm7", 29, [44, 51, 56, 60]),
           ("Gbmaj9", 30, [46, 53, 56, 61]), ("Ab6", 32, [48, 51, 53, 56])],
          [[72, 68, 65, 63], [73, 72, 68, 65], [70, 68, 66, 65], [72, 70, 68, 63],
           [73, 70, 66, 65], [72, 68, 63, 60], [73, 77, 75, 72], [70, 68, 65, 63]]),
    score("stillwater", "Stillwater", "F major", 59, 32, "#b9d3c5", "felt", "bell", "air", "none",
          [("Fmaj9", 29, [45, 52, 55, 60]), ("Dm9", 38, [53, 57, 60, 64]),
           ("Bbmaj9", 34, [50, 53, 57, 60]), ("C6", 36, [52, 55, 57, 60]),
           ("Gm9", 31, [46, 53, 57, 62]), ("Am7", 33, [48, 52, 55, 60]),
           ("Bbmaj9", 34, [50, 53, 57, 60]), ("C6/9", 36, [52, 57, 62, 67])],
          [[69, 67, 65, 64], [72, 69, 65, 64], [70, 69, 65, 62], [67, 64, 62, 60],
           [70, 69, 67, 65], [72, 69, 67, 64], [74, 72, 69, 65], [67, 64, 62, 64]], tail=10, meter=3),
]


def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def envelope(t, length, attack, release):
    return np.minimum(1, t / attack) * np.minimum(1, np.maximum(0, length - t) / release)


def instrument(kind, midi, length, rng):
    """Band-limited harmonic instruments with silent edges and natural decay."""
    t = np.arange(round(length * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    f = frequency(midi)
    phase = TAU * f * t
    if kind in ("warm", "air", "space"):
        harmonics = {"warm": [(1, 1), (2, .20), (3, .06)],
                     "air": [(1, 1), (2, .10), (4, .04)],
                     "space": [(1, 1), (2, .08), (3, .04)]}[kind]
        sound = np.zeros_like(t)
        for ratio, gain in harmonics:
            sound += gain * (np.sin(phase * ratio * .9989 + .10 * np.sin(TAU * .19 * t)) +
                             np.sin(phase * ratio * 1.0011 + .09 * np.sin(TAU * .13 * t + 1))) * .5
        sound *= .92 + .08 * np.sin(TAU * .08 * t)
        sound *= envelope(t, length, min(1.4, length / 4), min(2.3, length / 3))
    elif kind == "rhodes":
        sound = np.sin(phase + 1.25 * np.exp(-t * 1.7) * np.sin(phase * 2))
        sound += .14 * np.sin(phase * 2.001) * np.exp(-t * 2.4)
        sound += .035 * np.sin(phase * 4) * np.exp(-t * 4)
        sound *= np.exp(-t / 2.0) * envelope(t, length, .012, .18)
    elif kind == "felt":
        sound = np.zeros_like(t)
        for harmonic, gain, decay in [(1, 1, 2.8), (2, .24, 1.8), (3, .12, 1.1), (4, .045, .65), (5, .018, .4)]:
            sound += gain * np.sin(phase * harmonic * (1 + harmonic * .00003)) * np.exp(-t / decay)
        sound *= envelope(t, length, .015, .20)
    elif kind == "nylon":
        sound = np.zeros_like(t)
        for harmonic in range(1, 9):
            sound += ((-1) ** (harmonic + 1)) * np.sin(phase * harmonic) / harmonic ** 1.8 * np.exp(-t * (1.7 + harmonic * .28))
        sound *= envelope(t, length, .010, .14)
    elif kind == "marimba":
        sound = np.sin(phase) * np.exp(-t / 1.15) + .18 * np.sin(phase * 3.99) * np.exp(-t / .12)
        sound += .05 * np.sin(phase * 10.02) * np.exp(-t / .035)
        sound *= envelope(t, length, .008, .16)
    elif kind in ("glass", "bell"):
        ratios = [(1, 1, 2.4), (2, .10, 1.2), (3.99, .07, .7)] if kind == "glass" else [(1, 1, 3.1), (2.003, .13, 1.6), (5.01, .045, .6)]
        sound = sum(gain * np.sin(phase * ratio) * np.exp(-t / decay) for ratio, gain, decay in ratios)
        sound *= envelope(t, length, .025, .25)
    elif kind == "flute":
        phase += .018 * np.sin(TAU * 4.4 * t) * np.minimum(1, t / .5)
        sound = np.sin(phase) + .16 * np.sin(phase * 2) + .035 * np.sin(phase * 3)
        sound *= envelope(t, length, .13, .36) * (.90 + .10 * np.cos(TAU * .8 * t))
    elif kind == "soft-synth":
        sound = np.sin(phase) + .12 * np.sin(phase * 2) + .05 * np.sin(phase * 3)
        sound *= envelope(t, length, .18, .55) * np.exp(-t / 3.8)
    elif kind == "bass":
        sound = np.sin(phase) + .13 * np.sin(phase * 2) + .025 * np.sin(phase * 3)
        sound *= envelope(t, length, .03, .24) * np.exp(-t / 2.0)
    else:
        raise ValueError(kind)
    return sound.astype(np.float32)


def percussion(kind, rng):
    length = {"kick": .5, "brush": .24, "hat": .10, "shaker": .16}[kind]
    t = np.arange(round(length * SAMPLE_RATE), dtype=np.float32) / SAMPLE_RATE
    if kind == "kick":
        # The integral of a falling pitch avoids phase discontinuities.
        phase = TAU * (43 * t + (45 / 22) * (1 - np.exp(-22 * t)))
        sound = np.sin(phase) * np.exp(-t * 11) * envelope(t, length, .005, .06)
    else:
        noise = rng.standard_normal(len(t)).astype(np.float32)
        smoothed = np.convolve(noise, np.ones(12, dtype=np.float32) / 12, mode="same")
        if kind == "brush":
            sound = (smoothed + .08 * noise) * np.exp(-t * 18)
            sound += .11 * np.sin(TAU * 180 * t) * np.exp(-t * 32)
        else:
            body = np.convolve(noise, np.ones(4, dtype=np.float32) / 4, mode="same")
            sound = (body - smoothed) * np.exp(-t * (36 if kind == "hat" else 24))
        sound *= envelope(t, length, .008, .025)
    return sound.astype(np.float32)


def place(mix, mono, at, gain, pan):
    first = round(at * SAMPLE_RATE)
    if first >= len(mix):
        return
    count = min(len(mono), len(mix) - first)
    if first < 0:
        raise ValueError("Negative note onset")
    # Equal-power placement leaves the bass centered and the room pleasantly wide.
    angle = (max(-1, min(1, pan)) + 1) * math.pi / 4
    mix[first:first + count, 0] += mono[:count] * (gain * math.cos(angle))
    mix[first:first + count, 1] += mono[:count] * (gain * math.sin(angle))


def room(mix, beat, space):
    result = mix.copy()
    # Irregular, gently declining cross-channel reflections create a stereo room.
    reflections = [.047, .071, .109, .151, .193, .241, .307, .379, .461, .557, .677, .809,
                   .971, 1.127, 1.313, 1.537, 1.783, 2.079]
    wet = .085 if space == "space" else .058
    for index, delay in enumerate(reflections):
        shift = round(delay * SAMPLE_RATE)
        gain = wet * math.exp(-delay * 1.5)
        channels = mix[:-shift, ::-1] if index % 2 else mix[:-shift]
        result[shift:] += channels * gain
    for repeat in range(1, 4):
        shift = round(beat * .75 * repeat * SAMPLE_RATE)
        result[shift:] += mix[:-shift, ::-1] * (.085 * .44 ** (repeat - 1))
    return result


def render(config, seed):
    rng = np.random.default_rng(seed)
    beat = 60 / config["bpm"]
    meter = config["meter"]
    bar = beat * meter
    duration = config["bars"] * bar + config["tail"]
    mix = np.zeros((round(duration * SAMPLE_RATE), 2), dtype=np.float32)
    note_count = 0

    def note(kind, midi, at, length, gain, pan=0):
        nonlocal note_count
        place(mix, instrument(kind, midi, length, rng), at, gain, pan)
        note_count += 1

    for bar_index in range(0, config["bars"], 2):
        phrase = bar_index // 2
        chord_index = phrase % len(config["chords"])
        # The last four bars form a quiet tonic coda, rather than cutting a loop.
        coda = bar_index >= config["bars"] - 4
        if coda:
            chord_index = 0
        _, bass, harmony = config["chords"][chord_index]
        at = bar_index * bar + .20
        middle = 12 <= bar_index < 16
        intro = bar_index < 4
        energy = .70 if coda else .66 if middle else .80 if intro else 1.0
        pad_duration = bar * 2 + (config["tail"] if bar_index == config["bars"] - 2 else 1.3)
        for voice, midi in enumerate(harmony):
            note(config["pad"], midi, at, pad_duration, .021 * energy, (voice - 1.5) * .28)
            note(config["piano"], midi, at + voice * .027, min(4.8, bar * 1.2), .042 * energy, (voice - 1.5) * .17)
            if not intro and not coda:
                note(config["piano"], midi, at + (meter + .5) * beat + voice * .018,
                     min(3.8, bar), .025 * energy, (voice - 1.5) * .17)
        for local_bar in range(2):
            note("bass", bass, at + local_bar * bar, min(2.8, bar * .85), .10 * energy)
            if config["groove"] not in ("none", "rain") and not intro and not coda:
                note("bass", bass + (12 if phrase % 3 == 2 else 0), at + local_bar * bar + 2.5 * beat,
                     min(1.3, beat * 1.1), .045 * energy)

        if not intro:
            motif = config["motifs"][chord_index]
            # Space around a memorable four-note phrase; the middle section answers lower.
            positions = [.5, 1.75, 3.25, 5.25] if meter == 4 else [.5, 1.5, 3.0, 4.5]
            for index, (midi, position) in enumerate(zip(motif, positions)):
                if coda and index > 1:
                    continue
                midi -= 12 if middle else 0
                length = beat * (1.45 if config["lead"] == "flute" else 2.7)
                note(config["lead"], midi, at + position * beat, min(length, 4.5),
                     .068 * energy, .23 * math.sin(phrase + index * 1.3))
            if not middle and not coda and phrase % 2 == 1:
                note(config["lead"], motif[1], at + (6.6 if meter == 4 else 5.15) * beat,
                     beat * 1.15, .031, -.24)

        # A second, quieter melodic layer develops only in the full arrangement.
        if config["piano"] in ("nylon", "marimba") and not intro and not middle and not coda:
            for index in range(4):
                note(config["piano"], harmony[index] + 12,
                     at + (index * .75 + .5) * beat + bar, beat * 1.3,
                     .030, .35 if index % 2 else -.35)

    groove = config["groove"]
    if groove != "none":
        for bar_index in range(4, config["bars"] - 4):
            if 12 <= bar_index < 16:
                continue
            at = bar_index * bar + .20
            swing = .085 * beat if groove in ("brush", "lantern", "halftime") else .025 * beat
            kicks = [0, 2.5] if groove in ("bossa", "current") else [0]
            snares = [2] if groove == "halftime" else [1, 3]
            if groove == "rain":
                kicks, snares = [0], [2]
            for position in kicks:
                place(mix, percussion("kick", rng), at + position * beat, .075 if groove != "rain" else .047, 0)
            for position in snares:
                place(mix, percussion("brush", rng), at + position * beat + .022, .052, -.10)
            if groove != "rain":
                for eighth in range(8):
                    gain = .022 if eighth % 2 else .012
                    place(mix, percussion("shaker" if groove in ("bossa", "lantern") else "hat", rng),
                          at + eighth * beat / 2 + (swing if eighth % 2 else 0), gain, .27)

    mix = room(mix, beat, config["pad"])
    # Very mild saturation glues the layers while preserving generous headroom.
    mix = np.tanh(mix * 1.12) / 1.12
    rms = float(np.sqrt(np.mean(mix.astype(np.float64) ** 2)))
    gain = min(.085 / rms, .62 / float(np.max(np.abs(mix))))
    mix *= gain
    fade_in = round(2.8 * SAMPLE_RATE)
    fade_out = round(8.0 * SAMPLE_RATE)
    mix[:fade_in] *= np.sin(np.linspace(0, math.pi / 2, fade_in, dtype=np.float32))[:, None] ** 2
    mix[-fade_out:] *= np.cos(np.linspace(0, math.pi / 2, fade_out, dtype=np.float32))[:, None] ** 2
    mix[0] = 0
    mix[-1] = 0
    assert np.isfinite(mix).all() and float(np.max(np.abs(mix))) < .63
    return mix, note_count


def executable(env_name, name):
    found = os.environ.get(env_name) or shutil.which(name)
    if not found:
        raise SystemExit(f"{name} is required; install it or set {env_name}.")
    return found


def db(value):
    return round(20 * math.log10(max(float(value), 1e-12)), 2)


def main():
    ffmpeg = executable("FFMPEG", "ffmpeg")
    ffprobe = executable("FFPROBE", "ffprobe")
    DESTINATION.mkdir(parents=True, exist_ok=True)
    report = []
    catalog = []
    for index, config in enumerate(SCORES):
        print(f"Rendering {index + 1}/10: {config['title']}", flush=True)
        mix, note_count = render(config, 20261007 + index * 7919)
        path = DESTINATION / f"{config['id']}.mp3"
        subprocess.run([ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-f", "f32le",
                        "-ar", str(SAMPLE_RATE), "-ac", "2", "-i", "pipe:0",
                        "-af", "highpass=f=28,lowpass=f=7200", "-c:a", "libmp3lame", "-b:a", "128k",
                        "-ar", str(SAMPLE_RATE), "-ac", "2", "-id3v2_version", "3",
                        "-metadata", f"title={config['title']}", "-metadata", "artist=Beopity",
                        "-metadata", "album=Quiet Places", "-metadata", f"track={index + 1}/10",
                        "-metadata", "comment=Original instrumental composition and synthesis by Beopity. No samples.",
                        str(path)], input=mix.astype("<f4").tobytes(), check=True)
        probe = json.loads(subprocess.check_output([ffprobe, "-v", "error", "-show_entries",
                            "format=duration,size:stream=codec_name,sample_rate,channels,bit_rate",
                            "-of", "json", str(path)], text=True))
        pcm = subprocess.check_output([ffmpeg, "-v", "error", "-i", str(path), "-f", "f32le", "-acodec", "pcm_f32le", "pipe:1"])
        decoded = np.frombuffer(pcm, dtype="<f4").reshape(-1, 2)
        peak = float(np.max(np.abs(decoded)))
        rms = float(np.sqrt(np.mean(decoded.astype(np.float64) ** 2)))
        assert np.isfinite(decoded).all() and peak < .85, "Decode is finite with headroom"
        first_rms = float(np.sqrt(np.mean(decoded[:SAMPLE_RATE].astype(np.float64) ** 2)))
        last_rms = float(np.sqrt(np.mean(decoded[-SAMPLE_RATE:].astype(np.float64) ** 2)))
        measured_duration = float(probe["format"]["duration"])
        assert 90 <= measured_duration <= 150
        source = f"/beopity/music/{config['id']}.mp3"
        catalog.append(dict(id=config["id"], title=config["title"], artist="Beopity", src=source,
                            duration=round(measured_duration, 3), accent=config["accent"]))
        report.append(dict(**catalog[-1], key=config["key"], bpm=config["bpm"], meter=f"{config['meter']}/4",
                           bars=config["bars"], instruments=[config["piano"], config["lead"], config["pad"]],
                           groove=config["groove"], progression=[chord[0] for chord in config["chords"]],
                           melodicMotifs=config["motifs"], renderedNotes=note_count,
                           bytes=path.stat().st_size, sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                           decodedSha256=hashlib.sha256(pcm).hexdigest(), sampleRate=SAMPLE_RATE, channels=2,
                           bitrate=int(probe["streams"][0]["bit_rate"]), peakDbfs=db(peak), rmsDbfs=db(rms),
                           firstSecondRmsDbfs=db(first_rms), lastSecondRmsDbfs=db(last_rms)))
        print(f"  {measured_duration:.2f}s | {path.stat().st_size / 1_000_000:.2f} MB | peak {db(peak)} dBFS | RMS {db(rms)} dBFS", flush=True)
        del mix, decoded, pcm

    total = sum(track["bytes"] for track in report)
    assert len({track["sha256"] for track in report}) == 10
    assert len({track["decodedSha256"] for track in report}) == 10
    assert total < 20_000_000
    (ROOT / "docs/beopity-music-render.json").write_text(json.dumps(dict(
        description="Ten original Beopity instrumental scores, synthesized locally without external samples.",
        generationSeed=20261007, sampleRate=SAMPLE_RATE, totalBytes=total, tracks=report), indent=2) + "\n")
    ts = '/** Original Beopity instrumentals. Regenerate with scripts/generate-beopity-music.py. */\n'
    ts += 'export interface AmbientTrack {\n  id: string;\n  title: string;\n  artist: "Beopity";\n  src: string;\n  duration: number;\n  accent: string;\n}\n\n'
    ts += 'export const AMBIENT_TRACKS = ' + json.dumps(catalog, indent=2) + ' as const satisfies readonly AmbientTrack[];\n'
    (ROOT / "lib/ambientTracks.ts").write_text(ts)
    print(f"Finished: 10 original tracks, {total / 1_000_000:.2f} MB total. No audio was played.")


if __name__ == "__main__":
    main()
