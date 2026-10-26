// Brand board: swatches and live contrast ratios read from the CSS tokens.
const css = getComputedStyle(document.documentElement);
const v = (name) => css.getPropertyValue(`--${name}`).trim();

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const SWATCHES = [
  ['c-amber', 'Amber vial', 'primary'], ['c-ink', 'Counseling ink', 'accent'],
  ['c-amber-wash', 'Amber wash', ''], ['c-ink-wash', 'Ink wash', ''],
  ['c-n0', 'Label paper', 'n0'], ['c-n1', 'Counter', 'n1'], ['c-n2', 'Rule', 'n2'], ['c-n3', 'Border', 'n3'],
  ['c-n4', 'Muted text', 'n4'], ['c-n5', 'Strong', 'n5'], ['c-n6', 'Text', 'n6'],
  ['c-ok', 'OK', 'semantic'], ['c-warn', 'Warning', 'semantic'], ['c-danger', 'Danger', 'semantic'],
];
const PAIRS = [
  ['c-n6', 'c-n0', 4.5, 'Body text on label'], ['c-n4', 'c-n0', 4.5, 'Muted text'],
  ['c-amber', 'c-n0', 4.5, 'Amber text, links'], ['c-on-amber', 'c-amber', 4.5, 'Button text'],
  ['c-ink', 'c-n0', 4.5, 'Teal text'], ['c-warn', 'c-warn-wash', 4.5, 'Warning on wash'],
  ['c-danger', 'c-danger-wash', 4.5, 'Danger on wash'], ['c-ok', 'c-n0', 4.5, 'Success text'],
  ['c-amber', 'c-n1', 3, 'Muster dots and line'], ['c-ink', 'c-n1', 3, 'Focus ring'], ['c-n4', 'c-n0', 3, 'Control borders'],
];

const sw = document.getElementById('swatches');
for (const [name, label, role] of SWATCHES) {
  const d = document.createElement('div');
  d.className = 'sw';
  d.innerHTML = `<span class="sw-chip" style="background:var(--${name})"></span><span class="sw-name"></span><span class="sw-hex mono"></span>`;
  d.querySelector('.sw-name').textContent = role ? `${label} · ${role}` : label;
  d.querySelector('.sw-hex').textContent = v(name).toUpperCase();
  sw.append(d);
}
const tb = document.getElementById('contrast');
for (const [fg, bg, min, use] of PAIRS) {
  const r = ratio(v(fg), v(bg));
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><span class="pair" style="color:var(--${fg});background:var(--${bg})">Aa</span> <span class="mono"></span></td><td></td><td class="mono"></td><td class="mono"></td><td></td>`;
  tr.children[0].querySelector('.mono').textContent = `${fg} / ${bg}`;
  tr.children[1].textContent = use;
  tr.children[2].textContent = `${r.toFixed(2)}:1`;
  tr.children[3].textContent = `${min}:1`;
  tr.children[4].textContent = r >= min ? 'Pass' : 'Fail';
  tr.children[4].className = r >= min ? 'pass' : 'fail';
  tb.append(tr);
}

const sig = document.getElementById('sig');
document.getElementById('sig-play').addEventListener('click', (e) => {
  const on = sig.classList.toggle('is-lined');
  e.currentTarget.textContent = on ? 'Scatter them' : 'Line them up';
});
