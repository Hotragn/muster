// Drives the demo's golden path in headless Chrome over the DevTools protocol.
// Usage: npm start (elsewhere), then: node scripts/golden-path.mjs [runs]
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE || 'http://localhost:4173';
const RUNS = Number(process.argv[2] || 3);
const PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), 'muster-gp-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = tabs.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(100);
  }
  throw new Error('Chrome did not start');
}

const ws = new WebSocket(await connect());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const consoleErrors = [];
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') consoleErrors.push(msg.params.exceptionDetails.text);
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') consoleErrors.push(msg.params.args.map((a) => a.value).join(' '));
  // The deliberate /does-not-exist visit answers 404 by design; anything else is an error.
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error' && !String(msg.params.entry.url).endsWith('/does-not-exist')) {
    consoleErrors.push(`${msg.params.entry.text} ${msg.params.entry.url || ''}`);
  }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => {
  const res = await send('Runtime.evaluate', { expression: `{${expr}}`, awaitPromise: true, returnByValue: true });
  if (res.result.exceptionDetails) throw new Error(res.result.exceptionDetails.exception?.description || 'eval failed');
  return res.result.result.value;
};
const go = async (path) => { await send('Page.navigate', { url: BASE + path }); await sleep(700); };

await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

const checks = [];
const check = (name, ok, detail = '') => { checks.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); };

for (let run = 1; run <= RUNS; run++) {
  console.log(`\n— run ${run} —`);
  await go('/app?today=2026-10-26');
  await evaluate("localStorage.clear(); location.reload(); 1"); await sleep(700);
  check('empty state shows', await evaluate("!document.querySelector('#empty').hidden"));
  await evaluate("document.querySelector('#empty [data-action=example]').click(); 1"); await sleep(200);
  check('example loads 7 bottles', (await evaluate("document.querySelectorAll('.bottle').length")) === 7);
  const before = await evaluate("document.querySelector('#trips-before').textContent");
  check('before count is 19', before === '19', before);
  await evaluate("document.querySelector('#lineup').click(); 1"); await sleep(1200);
  const after = await evaluate("document.querySelector('#trips-after').textContent");
  check('after count animates to 6', after === '6', after);
  check('dots moved onto pickup lines', await evaluate("document.querySelector('#timeline').classList.contains('is-after') && document.querySelectorAll('.tl-line').length >= 2"));
  check('headline names the pickup day', /From Saturday, December 12/.test(await evaluate("document.querySelector('#result-h').textContent")));
  check('short fills listed with tablet counts', /short fill 9 tablets \(9 days\)/.test(await evaluate("document.querySelector('#trips').innerText")));
  check('controlled bottle set aside with reason', /Tramadol.*Controlled substances/s.test(await evaluate("document.querySelector('#aside').innerText")));
  check('pharmacist card built', /One pickup day for Dad/.test(await evaluate("document.querySelector('#card').textContent")));
  // depth: edit a bottle and see the plan recompute
  await evaluate("document.querySelector('[data-edit=ex-2]').click(); const f=document.querySelector('#editor-form'); f.elements.lastFill.value='2026-10-20'; f.requestSubmit(); 1"); await sleep(200);
  check('editing a fill date recomputes', (await evaluate("document.querySelector('.bottle:nth-child(2) .bottle-due').textContent")).includes('Nov 19'));
  await evaluate("document.querySelector('input[name=cycle][value=\"28\"]').click(); 1"); await sleep(200);
  const wd = await evaluate("document.querySelector('#result-h').textContent");
  check('28-day cycle gives a weekday pickup', /^From (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/.test(wd), wd);
  // persistence
  await evaluate("location.reload(); 1"); await sleep(700);
  check('bottles survive a reload', (await evaluate("document.querySelectorAll('.bottle').length")) === 7);
}

console.log('\n— edge cases —');
await go('/app?today=2026-10-26');
await evaluate("localStorage.clear(); location.reload(); 1"); await sleep(700);
await evaluate("document.querySelector('#empty [data-action=add]').click(); const f=document.querySelector('#editor-form'); f.elements.name.value=''; f.elements.perDay.value=''; f.elements.daysSupply.value='0'; f.requestSubmit(); 1"); await sleep(100);
check('bad input shows field errors', (await evaluate("[...document.querySelectorAll('.err')].filter(e=>e.textContent).length")) >= 3);
await evaluate("const f=document.querySelector('#editor-form'); f.elements.name.value='Lisinopril 10 mg'; f.elements.perDay.value='1'; f.elements.daysSupply.value='30'; f.elements.lastFill.value='2026-10-01'; f.requestSubmit(); 1"); await sleep(200);
check('one bottle: line-up disabled with explanation', await evaluate("document.querySelector('#lineup').disabled && /at least two bottles/.test(document.querySelector('#plan-msg').textContent)"));
await evaluate("document.querySelector('[data-edit]').click(); document.querySelector('#f-delete').click(); 1"); await sleep(200);
check('removing the last bottle returns to empty state', await evaluate("!document.querySelector('#empty').hidden"));
await go('/app?today=2026-10-26&example=1');
await evaluate("for (const c of document.querySelectorAll('input[name=closed]')) { if (!c.checked) c.click(); } 1");
await evaluate("document.querySelector('input[name=closed][value=\"0\"]').click(); document.querySelector('input[name=closed][value=\"0\"]').click(); 1"); await sleep(100);
check('closed days still produce a plan', await evaluate("!document.querySelector('#lineup').disabled"));
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
await go('/app?today=2026-10-26&example=1&after=1');
check('no horizontal scroll at 375px (planner)', await evaluate("document.documentElement.scrollWidth <= innerWidth"), String(await evaluate('document.documentElement.scrollWidth')));
await go('/');
check('no horizontal scroll at 375px (landing)', await evaluate("document.documentElement.scrollWidth <= innerWidth"), String(await evaluate('document.documentElement.scrollWidth')));
await go('/brand');
check('no horizontal scroll at 375px (brand)', await evaluate("document.documentElement.scrollWidth <= innerWidth"), String(await evaluate('document.documentElement.scrollWidth')));
check('brand board contrast all pass', (await evaluate("document.querySelectorAll('#contrast .pass').length")) === 11 && (await evaluate("document.querySelectorAll('#contrast .fail').length")) === 0);
await go('/does-not-exist');
check('404 page renders', /isn't on the shelf/.test(await evaluate('document.body.innerText')));
const imgs = await evaluate("(async()=>{await new Promise(r=>setTimeout(r,300)); return [...document.images].filter(i=>!i.complete||!i.naturalWidth).length})()");
check('404 page images load', imgs === 0);
await go('/');
await evaluate("window.scrollTo(0, document.body.scrollHeight); 1"); await sleep(800);
const broken = await evaluate("(async()=>{for (const i of document.images) { i.loading='eager'; } await new Promise(r=>setTimeout(r,1500)); return [...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)})()");
check('landing images all load', broken.length === 0, broken.join(', '));

check('no console errors on any page', consoleErrors.length === 0, consoleErrors.join(' | '));

ws.close(); chrome.kill();
await sleep(300);
rmSync(profile, { recursive: true, force: true });
const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
