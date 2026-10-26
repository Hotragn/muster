"""Narration synthesis with Kokoro-82M (hexgrad/kokoro, Apache-2.0) via kokoro-onnx (MIT).

Usage: video/tts/.venv/bin/python video/tts/tts.py <jobs.json>
jobs.json: [{"text": "...", "out": "path.wav"}, ...]; options via env VOICE (default af_heart), SPEED (default 1.0).
"""
import json
import os
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).resolve().parent
MODEL = HERE / "models" / "kokoro-v1.0.onnx"
VOICES = HERE / "models" / "voices-v1.0.bin"


def main() -> None:
    if not MODEL.exists() or not VOICES.exists():
        sys.exit(f"Missing model files in {HERE / 'models'}; see video/README.md")
    voice = os.environ.get("VOICE", "af_heart")
    speed = float(os.environ.get("SPEED", "1.0"))
    kokoro = Kokoro(str(MODEL), str(VOICES))
    for job in json.loads(Path(sys.argv[1]).read_text()):
        samples, rate = kokoro.create(job["text"], voice=voice, speed=speed, lang="en-us")
        sf.write(job["out"], samples, rate)
        print(f"{job['out']}: {len(samples) / rate:.2f}s")


if __name__ == "__main__":
    main()
