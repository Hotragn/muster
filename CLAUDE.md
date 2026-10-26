# Muster: working notes

Medication-sync planner. Plain HTML/CSS/JS ES modules in `public/`, zero-dependency server `server.mjs`.

## Commands (all verified)
- `npm install`: dev tooling only (ESLint)
- `npm start`: http://localhost:4173 (`/`, `/app`, `/brand`)
- `npm test`: unit tests for `public/js/muster.js`
- `npm run contrast`: WCAG ratios for token pairs
- `npm run lint`
- `npm run check`: all three
- `node scripts/golden-path.mjs 3`: needs the server running; headless Chrome drives the demo flow
- `sh scripts/screenshots.sh`: needs the server; writes `public/shots/*.png`
- `node scripts/record-demo.mjs`: needs the server, ffmpeg, Chrome; Kokoro narration if `video/tts/` is set up (see video/README.md), else macOS `say`; writes `video/out/`

## Layout
- `public/js/muster.js`: solver (pure). `app.js`: planner UI. `example.js`: fictional household. `store.js`: guarded localStorage.
- `public/css/tokens.css`: the only source of colours, type, spacing, motion. UI uses tokens only.
- URL params: `example=1`, `today=YYYY-MM-DD`, `after=1`, `card=1`, `edit=<id>`, `theme=light|dark`.

## State
Feature-frozen. Docs live in `docs/` (NEED, METHODOLOGY, ARCHITECTURE, PROGRESS, DECISIONS, ...). The final video is `video/muster-demo.mp4`.
