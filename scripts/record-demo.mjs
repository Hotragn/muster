// Records the demo video from the real app: headless Chrome drives the planner,
// a drawn cursor and captions are layered on for the viewer, and each scene is
// held for exactly as long as its narration clip.
//
// Usage (server running via `npm start`):
//   node scripts/record-demo.mjs            # 1920x1080 video, captions, narration track
//   VOICE=am_michael SPEED=1.0 node scripts/record-demo.mjs
// Narration: Kokoro-82M (open-source, Apache-2.0) via video/tts (see video/README.md).
// If that isn't installed, falls back to macOS `say` (VOICE=Samantha).
// Output: video/out/muster-demo.mp4 (with voice), muster-demo-silent.mp4 (captions only),
//         narration.txt (script with timings, for recording your own voice).
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://localhost:4173';
const TTS_PY = join(ROOT, 'video/tts/.venv/bin/python');
const USE_KOKORO = existsSync(TTS_PY) && existsSync(join(ROOT, 'video/tts/models/kokoro-v1.0.onnx')) && process.env.TTS !== 'say';
const VOICE = process.env.VOICE || (USE_KOKORO ? 'af_heart' : 'Samantha');
const RATE = process.env.RATE || '178';
const OUT = join(ROOT, 'video/out');
const WORK = join(ROOT, 'video/work');
const W = 1440, H = 810, SCALE = 4 / 3; // CSS viewport → 1920x1080 frames
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const APP = `${BASE}/app.html?example=1&today=2026-10-26&theme=light`;

// ---------- scenes: narration + what happens on screen ----------
const scenes = [
  { id: 'title', say: 'Muster.', hold: 2600, run: async (p) => { await p.go(APP); await p.titleCard(); } },
  {
    id: 'before',
    say: "Here's an example household: one dad, seven prescriptions, each filled on a different day, so each one runs out on a different day. Every dot is a trip to the pharmacy. That's nineteen trips in the next ninety days. Reminders can't fix that. The dates are out of step.",
    run: async (p) => {
      await p.hideCard();
      await p.point('.bottle:nth-child(1) .bottle-btn', 900);
      await p.point('.bottle:nth-child(4) .bottle-btn', 1400);
      await p.point('.tl-row:nth-child(1) .tl-track', 1500);
      await p.point('.tl-row:nth-child(5) .tl-track', 1500);
      await p.point('#trips-before', 1800);
      await p.point('.tl-trips .tl-track', 1500);
    },
  },
  {
    id: 'lineup',
    say: 'One press. Muster tries every possible pickup day, skips Sundays when the pharmacy is closed, and keeps the plan with the fewest trips.',
    run: async (p) => { await p.scrollTo('#plan', 12, 900); await p.point('#lineup', 1800); await p.click('#lineup'); },
  },
  {
    id: 'result',
    say: 'Nineteen trips become six, and that includes the changeover. After that, it is one trip every thirty days, instead of six.',
    run: async (p) => { await sleep(500); await p.point('#trips-after', 2600); await p.point('#trip-month', 2000); },
  },
  {
    id: 'trips',
    say: "Here's the changeover. Trip one, this Friday: a short fill of twenty-eight metformin and nine lisinopril, just enough to reach the next pickup day. On the thirteenth, the levothyroxine is refilled a day early, so it joins the others. From Saturday, December twelfth, everything comes together.",
    run: async (p) => {
      await p.scrollTo('#result', 40);
      await p.point('.trip:nth-child(1) .item:nth-child(1)', 2600);
      await p.point('.trip:nth-child(1) .item:nth-child(2)', 2400);
      await p.scrollTo('.trip:nth-child(3)', 140);
      await p.point('.trip:nth-child(3) .item:nth-child(4)', 3200);
      await p.scrollTo('.trip-sync', 260);
      await p.point('.trip-sync .trip-date', 2000);
    },
  },
  {
    id: 'card',
    say: "Many pharmacies already offer this. It's called medication synchronization. But you have to ask, with the numbers. This card is the ask: the pickup day, every short fill in tablets, and what to say at the counter.",
    run: async (p) => {
      await p.point('#print', 1800);
      await p.clickOnly('#print');
      await p.showCard();
      await sleep(900);
      await p.point('.card h1', 2400);
      await p.point('.card-ask', 2600);
      await p.point('.card tbody tr:nth-child(1) td:nth-child(3)', 2200);
    },
  },
  {
    id: 'aside',
    say: "It won't split what shouldn't be split. Tramadol is a controlled substance, so it's set aside, with the reason, for the pharmacist to decide.",
    run: async (p) => { await p.hideCard(); await p.scrollTo('#aside', 200); await p.point('#aside li', 2500); },
  },
  {
    id: 'edit',
    say: 'Change a fill date, and the whole plan recomputes on the spot. Nothing is sent anywhere; it is all worked out right here in the browser.',
    run: async (p) => {
      await p.scrollTo('body', 0);
      await p.click('[data-edit="ex-2"]');
      await sleep(500);
      await p.point('#f-lastFill', 900);
      await p.eval("document.querySelector('#f-lastFill').value = '2026-10-20'; 1");
      await sleep(700);
      await p.click('#f-save');
      await sleep(300);
      await p.point('.bottle:nth-child(2) .bottle-due', 1400);
    },
  },
  {
    id: 'cycle',
    say: 'On a thirty-day cycle, the weekday drifts. Four weeks keeps the same day every time, and Muster tells you to ask for twenty-eight-day fills.',
    run: async (p) => {
      await p.scrollTo('.controls', 260);
      await p.click('input[name="cycle"][value="28"] + span');
      await sleep(600);
      await p.scrollTo('.trip-sync', 300);
      await p.point('.trip-sync .item-detail', 2600);
    },
  },
  {
    id: 'working',
    say: "And it shows its working. Run-out day is the fill date plus the days' supply. Copays use a daily rate, which Medicare Part D requires for short fills of tablets. It never changes a dose. The pharmacist checks the plan.",
    run: async (p) => {
      await p.scrollTo('.working', 300);
      await p.click('.working summary');
      await sleep(300);
      await p.scrollTo('.working', 40);
      await p.point('.working li:nth-child(1)', 3000);
      await p.point('.working li:nth-child(5)', 4200);
      await p.point('.working li:nth-child(6)', 2000);
    },
  },
  {
    id: 'close',
    say: 'No account, and nothing leaves your browser. Built for everyone who has become their parent’s pharmacy runner.',
    run: async (p) => {
      await p.go(`${BASE}/index.html?theme=light`);
      await sleep(1600);
      await p.scrollTo('.lp-ba', 30, 1400);
    },
  },
  { id: 'end', say: 'Muster. All the bottles, one pickup day.', hold: 1200, run: async (p) => { await p.endCard(); } },
];

// ---------- narration audio ----------
rmSync(WORK, { recursive: true, force: true });
mkdirSync(join(WORK, 'frames'), { recursive: true });
mkdirSync(OUT, { recursive: true });
const durationOf = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
if (USE_KOKORO) {
  for (const s of scenes) s.audio = join(WORK, `${s.id}.wav`);
  writeFileSync(join(WORK, 'tts-jobs.json'), JSON.stringify(scenes.map((s) => ({ text: s.say, out: s.audio }))));
  execFileSync(TTS_PY, ['-I', join(ROOT, 'video/tts/tts.py'), join(WORK, 'tts-jobs.json')], { env: { ...process.env, VOICE }, stdio: ['ignore', 'ignore', 'inherit'] });
} else {
  for (const s of scenes) {
    s.audio = join(WORK, `${s.id}.aiff`);
    execFileSync('say', ['-v', VOICE, '-r', RATE, '-o', s.audio, s.say]);
  }
}
for (const s of scenes) s.dur = durationOf(s.audio);
console.log(`narration (${USE_KOKORO ? 'Kokoro-82M' : 'macOS say'}, ${VOICE}): ${scenes.reduce((a, s) => a + s.dur, 0).toFixed(1)} s in ${scenes.length} scenes`);

// ---------- browser ----------
const PORT = 9334;
const profile = mkdtempSync(join(tmpdir(), 'muster-rec-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch { /* starting */ }
  if (!wsUrl) await sleep(100);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const frames = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Page.screencastFrame') {
    const file = join(WORK, 'frames', `f${String(frames.length).padStart(5, '0')}.jpg`);
    writeFileSync(file, Buffer.from(m.params.data, 'base64'));
    frames.push({ file, t: m.params.metadata.timestamp });
    send('Page.screencastFrameAck', { sessionId: m.params.sessionId });
  }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => {
  const res = await send('Runtime.evaluate', { expression: `{${expr}}`, awaitPromise: true, returnByValue: true });
  if (res.result?.exceptionDetails) throw new Error(res.result.exceptionDetails.exception?.description || expr);
  return res.result?.result?.value;
};

// Overlay layer for the viewer: cursor, click ripple, captions, title/end cards.
// Injected into the page only during recording; not part of the app.
const OVERLAY = `(() => {
  if (document.getElementById('rec-layer')) return 1;
  const st = document.createElement('style');
  st.textContent = \`
    #rec-cursor { position: fixed; left: 0; top: 0; width: 28px; height: 28px; z-index: 2147483647; pointer-events: none;
      transform: translate(\${window.__cx ?? 720}px, \${window.__cy ?? 900}px); transition: transform 650ms cubic-bezier(.3,.7,.2,1); }
    #rec-ripple { position: fixed; z-index: 2147483646; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%;
      border: 3px solid #A34A06; opacity: 0; pointer-events: none; }
    #rec-ripple.go { animation: rec-r 520ms ease-out; }
    @keyframes rec-r { from { opacity: .9; transform: scale(.4); } to { opacity: 0; transform: scale(1.6); } }
    #rec-cap { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); max-width: 1080px; z-index: 2147483645;
      background: rgba(30,26,21,.9); color: #FFFDF8; font: 600 25px/1.35 "Atkinson Hyperlegible", system-ui, sans-serif;
      padding: 12px 22px; border-radius: 10px; text-align: center; transition: opacity 200ms; pointer-events: none; }
    #rec-cap:empty { opacity: 0; }
    #rec-cap.top { bottom: auto; top: 24px; }
    #rec-cardx { position: fixed; inset: 0; z-index: 2147483640; background: #F6F1E7; display: grid; place-content: center; gap: 22px;
      justify-items: center; font-family: "Atkinson Hyperlegible", system-ui, sans-serif; color: #1E1A15; transition: opacity 400ms; }
    #rec-cardx .lk { display: flex; align-items: center; gap: 18px; font-weight: 700; font-size: 64px; }
    #rec-cardx .lk img { width: 92px; height: 92px; }
    #rec-cardx p { margin: 0; font-size: 34px; font-weight: 700; color: #A34A06; }
    #rec-cardx small { font: 18px "IBM Plex Mono", monospace; color: #6E6455; }\`;
  document.head.append(st);
  const layer = document.createElement('div'); layer.id = 'rec-layer';
  layer.innerHTML = '<svg id="rec-cursor" viewBox="0 0 28 28"><path d="M4 2 L4 22 L9.5 17 L13 25.5 L16.6 24 L13.2 15.8 L20.5 15.5 Z" fill="#1E1A15" stroke="#FFFDF8" stroke-width="1.6" stroke-linejoin="round"/></svg><div id="rec-ripple"></div><div id="rec-cap"></div>';
  document.body.append(layer);
  return 1;
})()`;

// Keep the viewer layer visible: inside an open <dialog> (top layer) when there is one,
// and captions at the top of the frame when the cursor is in the lower part.
const SYNC = `(() => { const L = document.getElementById('rec-layer'); if (!L) return 0;
  const host = document.querySelector('dialog[open]') || document.body; if (L.parentNode !== host) host.append(L);
  document.getElementById('rec-cap').classList.toggle('top', (window.__cy || 0) > innerHeight * 0.58); return 1; })()`;

const p = {
  eval: evaluate,
  async sync() { try { await evaluate(SYNC); } catch { /* navigating */ } },
  async go(url) {
    await send('Page.navigate', { url });
    await sleep(900);
    await evaluate("document.fonts.ready.then(() => 1)");
    await evaluate(OVERLAY);
  },
  async moveTo(x, y) {
    await evaluate(`window.__cx=${x};window.__cy=${y};document.getElementById('rec-cursor').style.transform='translate(${x}px,${y}px)'; 1`);
    await p.sync();
    await sleep(700);
  },
  async center(sel) {
    return evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) throw new Error('missing ${sel.replace(/'/g, '')}'); const r = e.getBoundingClientRect();
      return [Math.round(r.left + Math.min(r.width / 2, 120)), Math.round(r.top + r.height / 2)]; })()`);
  },
  async point(sel, hold = 800) { const [x, y] = await p.center(sel); await p.moveTo(x, y); await sleep(Math.max(0, hold - 700)); },
  async ripple() {
    await evaluate("(() => { const r = document.getElementById('rec-ripple'); r.style.left = window.__cx + 4 + 'px'; r.style.top = window.__cy + 4 + 'px'; r.classList.remove('go'); void r.offsetWidth; r.classList.add('go'); return 1; })()");
  },
  async click(sel) { await p.point(sel, 700); await p.ripple(); await sleep(150); await evaluate(`document.querySelector(${JSON.stringify(sel)}).click(); 1`); await sleep(350); await p.sync(); },
  async clickOnly() { await p.ripple(); await sleep(250); }, // print dialog can't render headless: show the same card on screen instead
  async showCard() { await evaluate("document.body.classList.add('show-card'); window.scrollTo(0, 0); 1"); },
  async hideCard() { await evaluate("document.body.classList.remove('show-card'); 1"); },
  async scrollTo(sel, offset = 0, wait = 1000) {
    const top = sel === 'body' ? '0' : `document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect().top + scrollY - ${offset}`;
    await evaluate(`window.scrollTo({ top: ${top}, behavior: 'smooth' }); 1`);
    await sleep(wait);
  },
  async caption(text) {
    try { await evaluate(`const c = document.getElementById('rec-cap'); if (c) c.textContent = ${JSON.stringify(text)}; 1`); } catch { /* page navigating */ }
    await p.sync();
  },
  async titleCard() {
    await evaluate(`(() => { const c = document.createElement('div'); c.id = 'rec-cardx';
      c.innerHTML = '<div class="lk"><img src="brand/symbol.svg" alt=""><span>muster</span></div><p>All the bottles. One pickup day.</p><small>Demo · example household is fictional</small>';
      document.body.append(c); return 1; })()`);
  },
  async hideTitle() { await evaluate("document.getElementById('rec-cardx')?.remove(); 1"); },
  async endCard() {
    await evaluate(`(() => { const c = document.createElement('div'); c.id = 'rec-cardx';
      c.innerHTML = '<div class="lk"><img src="brand/symbol.svg" alt=""><span>muster</span></div><p>All the bottles. One pickup day.</p><small>Plans pickup dates only. Not medical advice; your pharmacist confirms. Built for NextSpark Hacks 2026.</small>';
      document.body.append(c); return 1; })()`);
  },
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: false });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'no-preference' }] });
await p.go(APP);
await evaluate("localStorage.clear(); 1");
await send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
await sleep(400);

// Captions: split each scene's narration into sentences, timed by length.
const sentences = (t) => t.match(/[^.!?]+[.!?]+["”’]?|[^.!?]+$/g).map((x) => x.trim());
const startClock = Date.now() / 1000;
const timeline = [];
for (const s of scenes) {
  const t0 = Date.now() / 1000;
  timeline.push({ id: s.id, at: t0 - startClock, dur: s.dur, text: s.say });
  const parts = sentences(s.say);
  const total = parts.reduce((a, x) => a + x.length, 0);
  let captionsDone = false;
  const captionTask = (async () => {
    if (s.id === 'title' || s.id === 'end') return;
    for (const part of parts) {
      if (captionsDone) return;
      await p.caption(part);
      await sleep((part.length / total) * s.dur * 1000);
    }
  })();
  if (s.id !== 'title' && s.id !== 'end') await p.hideTitle();
  await s.run(p);
  const elapsed = Date.now() / 1000 - t0;
  const target = Math.max(s.dur + 0.45, (s.hold ?? 0) / 1000);
  if (elapsed < target) await sleep((target - elapsed) * 1000);
  else console.warn(`scene ${s.id}: actions took ${elapsed.toFixed(1)}s, narration ${s.dur.toFixed(1)}s`);
  captionsDone = true;
  await captionTask;
  await p.caption('');
}
await sleep(800);
await send('Page.stopScreencast');
const endClock = Date.now() / 1000;
ws.close();
chrome.kill();
await sleep(500);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome still closing; temp dir is harmless */ }

// ---------- assemble ----------
// Frame times are on the browser's clock; align by the first frame and the scene clock start.
const f0 = frames[0].t;
let shift = startClock - f0; // seconds between first frame and first scene start (≈ 0.4)
if (Math.abs(shift) > 5) { console.warn(`frame clock not wall time (shift ${shift.toFixed(1)}s); assuming 0.4s`); shift = 0.4; }
console.log(`clock shift ${shift.toFixed(3)}s`);
let list = '';
for (let i = 0; i < frames.length; i++) {
  const next = i + 1 < frames.length ? frames[i + 1].t : f0 + (endClock - startClock) + shift;
  list += `file '${frames[i].file}'\nduration ${Math.max(0.001, next - frames[i].t).toFixed(4)}\n`;
}
list += `file '${frames.at(-1).file}'\n`;
writeFileSync(join(WORK, 'frames.txt'), list);

const silent = join(OUT, 'muster-demo-silent.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(WORK, 'frames.txt'),
  '-vf', 'scale=1920:1080:flags=lanczos,format=yuv420p', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', silent]);

const inputs = scenes.flatMap((s) => ['-i', s.audio]);
const delays = scenes.map((s, i) => {
  const ms = Math.round((timeline[i].at + shift) * 1000);
  return `[${i + 1}:a]aresample=48000,adelay=${ms}|${ms}[a${i}]`;
});
const mix = `${delays.join(';')};${scenes.map((_, i) => `[a${i}]`).join('')}amix=inputs=${scenes.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[aout]`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs, '-filter_complex', mix,
  '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', join(OUT, 'muster-demo.mp4')]);

const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
writeFileSync(join(OUT, 'narration.txt'), timeline.map((x) => `[${fmt(x.at + shift)}] (${x.dur.toFixed(1)}s) ${x.text}`).join('\n\n') + '\n');
console.log(`frames: ${frames.length}, length: ${fmt(endClock - startClock + shift)}`);
console.log(`wrote ${join(OUT, 'muster-demo.mp4')}\n      ${silent}\n      ${join(OUT, 'narration.txt')}`);
