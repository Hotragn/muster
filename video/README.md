# Demo video

| File | What it is |
|---|---|
| `muster-demo.mp4` | Final demo, 1:58, 1920×1080 H.264 + AAC, captions burned in, narration by Kokoro-82M (voice `af_heart`), loudness −16 LUFS. |
| `narration.txt` | Every narration line with its start time and length. Use it to re-voice the video. |

The footage is a **scripted recording of the real app** (`scripts/record-demo.mjs`): headless Chrome drives the planner and every number on screen is computed live. The cursor, click rings, captions and title/end cards are drawn on top for viewers and aren't part of the app. Because a print dialog can't render headlessly, the card scene shows the same card as an on-screen preview.

## Narration voice
- Model: **Kokoro-82M** by hexgrad, [github.com/hexgrad/kokoro](https://github.com/hexgrad/kokoro), weights Apache-2.0.
- Runtime: **kokoro-onnx** by thewh1teagle, [github.com/thewh1teagle/kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx), MIT, on ONNX Runtime.
- The voice is synthetic. Say so in the Devpost description, or re-voice it yourself.

## Regenerate
```bash
# one-time: narration environment (about 350 MB of model files, kept out of git)
uv venv --python 3.12 video/tts/.venv
uv pip install --python video/tts/.venv/bin/python kokoro-onnx soundfile
mkdir -p video/tts/models && cd video/tts/models
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
cd -

# each time (needs ffmpeg and Google Chrome)
npm start            # in another terminal
node scripts/record-demo.mjs                  # writes video/out/
VOICE=am_michael node scripts/record-demo.mjs # another Kokoro voice
TTS=say node scripts/record-demo.mjs          # macOS voice fallback
```
Scenes, narration text and on-screen actions are all defined in the `scenes` list in `scripts/record-demo.mjs`.

## Re-voicing it yourself
Open `video/out/muster-demo-silent.mp4` (produced by the script) in iMovie, record each line of `narration.txt` at its timestamp, and export.
