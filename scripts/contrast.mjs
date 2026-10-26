// Computes WCAG contrast ratios for the token pairs the UI actually uses.
// Usage: node scripts/contrast.mjs [--json]
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../public/css/tokens.css', import.meta.url), 'utf8');

function block(selector) {
  const start = css.indexOf(selector);
  const open = css.indexOf('{', start + selector.length - 1);
  let depth = 0, i = open;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) break;
  }
  return css.slice(open + 1, i);
}
function vars(text) {
  const out = {};
  for (const m of text.matchAll(/--(c-[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}
const light = vars(block(':root {'));
const dark = { ...light, ...vars(block(':root[data-theme="dark"]')) };

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [foreground, background, minimum, usage]
const pairs = [
  ['c-n6', 'c-n0', 4.5, 'body text on label'],
  ['c-n6', 'c-n1', 4.5, 'body text on counter'],
  ['c-n4', 'c-n0', 4.5, 'muted text on label'],
  ['c-n4', 'c-n1', 4.5, 'muted text on counter'],
  ['c-amber', 'c-n0', 4.5, 'amber text / links on label'],
  ['c-amber', 'c-n1', 4.5, 'amber text on counter'],
  ['c-on-amber', 'c-amber', 4.5, 'button text on amber'],
  ['c-amber-strong', 'c-amber-wash', 4.5, 'amber text on amber wash'],
  ['c-ink', 'c-n0', 4.5, 'teal text on label'],
  ['c-ink', 'c-ink-wash', 4.5, 'teal text on teal wash'],
  ['c-ok', 'c-n0', 4.5, 'success text'],
  ['c-warn', 'c-warn-wash', 4.5, 'warning text on wash'],
  ['c-danger', 'c-danger-wash', 4.5, 'danger text on wash'],
  ['c-danger', 'c-n0', 4.5, 'danger text on label'],
  ['c-n4', 'c-n0', 3, 'form control borders (UI)'],
  ['c-amber', 'c-n1', 3, 'muster dots and line (UI)'],
  ['c-ink', 'c-n1', 3, 'focus ring (UI)'],
];

const rows = [];
for (const [mode, pal] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, min, use] of pairs) {
    const r = ratio(pal[fg], pal[bg]);
    rows.push({ mode, fg, bg, fgHex: pal[fg], bgHex: pal[bg], ratio: Math.round(r * 100) / 100, min, pass: r >= min, use });
  }
}
if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 2));
else {
  for (const r of rows) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.mode.padEnd(5)} ${r.ratio.toFixed(2).padStart(5)} (min ${r.min}) ${r.fg} on ${r.bg} — ${r.use}`);
  const fails = rows.filter((r) => !r.pass).length;
  console.log(fails ? `${fails} failing pair(s)` : 'All pairs pass.');
  process.exitCode = fails ? 1 : 0;
}
