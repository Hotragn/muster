// Muster planner screen: bottles on the left, the plan on the right.
import { planSync, timeline, toDay, fromDay, todayISO, validateMed, setAsideReason } from './muster.js';
import { exampleHousehold } from './example.js';
import { load, save, clear } from './store.js';

const params = new URLSearchParams(location.search);
const TODAY_ISO = /^\d{4}-\d{2}-\d{2}$/.test(params.get('today') || '') ? params.get('today') : todayISO();
const TODAY = toDay(TODAY_ISO);
const HORIZON = 90;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'style') n.style.cssText = v;
    else if (k.startsWith('data-')) n.setAttribute(k, v);
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid);
  return n;
};

const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtLong = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
const fmtMonth = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const dateOf = (day) => new Date(day * 86400000);
const short = (day) => fmt.format(dateOf(day));
const long = (day) => fmtLong.format(dateOf(day));
const money = (x) => `$${x.toFixed(2)}`;
const unitWord = (med, n) => (med.kind === 'capsule' ? (n === 1 ? 'capsule' : 'capsules') : (n === 1 ? 'tablet' : 'tablets'));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const ASIDE_TEXT = {
  controlled: "Controlled substances usually can't be short-filled. Ask your pharmacist.",
  'not-countable': "Inhalers, pens, liquids, drops and patches can't be split by the tablet. Ask if it can be aligned.",
  'supply-mismatch': "This supply won't land on the cycle. Ask for a 30- or 90-day supply.",
};

// ---------- state ----------
let state = load() || { meds: [], settings: { cycle: 30, closed: [0], whose: '' }, isExample: false };
if (params.has('example')) state = { meds: exampleHousehold(TODAY_ISO), settings: { cycle: 30, closed: [0], whose: 'Dad' }, isExample: true };
let view = params.has('after') ? 'after' : 'before';
let plan = null;

function persist() { save(state); }
function computePlan() {
  plan = planSync(state.meds, { today: TODAY, cycle: state.settings.cycle, closedWeekdays: state.settings.closed, horizon: HORIZON });
  if (!plan.ok && view === 'after') view = 'before';
}

// ---------- bottles ----------
function renderBottles() {
  const list = $('#bottle-list');
  list.replaceChildren();
  const has = state.meds.length > 0;
  $('#empty').hidden = has;
  $('#counter-actions').hidden = !has;
  $('#example-badge').hidden = !state.isExample;
  $('#whose').value = state.settings.whose || '';

  for (const med of state.meds) {
    const due = plan ? timeline([med], plan)[0].before[0] : null;
    const reason = setAsideReason(med, state.settings.cycle);
    const qty = Math.ceil(med.perDay * med.daysSupply);
    list.append(el('li', { class: 'bottle' + (reason ? ' is-aside' : '') },
      el('button', { class: 'bottle-btn', type: 'button', 'data-edit': med.id, 'aria-label': `Edit ${med.name}` },
        el('span', { class: 'bottle-name', text: med.name }),
        el('span', { class: 'bottle-data mono' },
          `${med.kind === 'tablet' || med.kind === 'capsule' ? `QTY ${qty} · ` : ''}${med.perDay}/DAY · ${med.daysSupply} DAYS · FILLED ${fromDay(toDay(med.lastFill))}`),
        el('span', { class: 'bottle-due' },
          due != null ? `Runs out ${short(due)}` : '',
          reason ? el('span', { class: 'badge badge-warn', text: 'Set aside' }) : null),
      ),
    ));
  }
}

// ---------- timeline ----------
const pct = (day) => `${(((day - TODAY) + 0.5) / HORIZON) * 100}%`;

function renderAxis() {
  const axis = $('#tl-axis');
  axis.replaceChildren(el('span', { class: 'tl-tick tl-today', style: `left:${pct(TODAY)}`, text: 'Today' }));
  for (let d = TODAY + 1; d < TODAY + HORIZON; d++) {
    if (dateOf(d).getUTCDate() === 1 && d - TODAY > 7) axis.append(el('span', { class: 'tl-tick', style: `left:${pct(d)}`, text: fmtMonth.format(dateOf(d)) }));
  }
}

function dotsFor(before, after, typeB, typeA) {
  const n = Math.max(before.length, after.length);
  const dots = [];
  for (let i = 0; i < n; i++) {
    const b = before[i] ?? after[i];
    const a = after[i] ?? before[i];
    dots.push(el('i', {
      class: 'dot',
      style: `--b:${pct(b)};--a:${pct(a)};--bo:${before[i] != null ? 1 : 0};--ao:${after[i] != null ? 1 : 0}`,
      'data-b': typeB(i), 'data-a': typeA(i),
    }));
  }
  return dots;
}

function renderTimeline() {
  renderAxis();
  const body = $('#tl-body');
  body.replaceChildren();
  const rows = plan ? timeline(state.meds, plan) : [];
  const asideIds = new Set((plan?.setAside || []).map((s) => s.medId));

  rows.forEach((row) => {
    const med = state.meds.find((m) => m.id === row.medId);
    const aside = asideIds.has(med.id);
    const typeA = (i) => (aside ? 'aside' : row.fill?.action === 'short' && i === 0 ? 'short' : 'fill');
    body.append(el('div', { class: 'tl-row' },
      el('span', { class: 'tl-name', text: med.name }),
      el('span', { class: 'tl-track' }, dotsFor(row.before, plan.ok ? row.after : row.before, () => 'fill', typeA)),
    ));
  });

  if (rows.length) {
    const after = plan.ok ? plan.after : plan.before;
    body.append(el('div', { class: 'tl-row tl-trips' },
      el('span', { class: 'tl-name', text: 'Trips' }),
      el('span', { class: 'tl-track' }, dotsFor(plan.before, after, () => 'trip', () => 'trip')),
    ));
  }

  const lines = $('#tl-lines');
  lines.replaceChildren();
  if (plan?.ok) {
    const shift = (d) => { let x = d; while (plan.closed.length < 7 && plan.closed.includes(dateOf(x).getUTCDay()) && x > TODAY) x--; return x; };
    for (const d of plan.syncDays.map(shift).filter((x) => x >= plan.syncTrip || plan.after.includes(x))) {
      lines.append(el('span', { class: 'tl-line', style: `left:${pct(d)}` }));
    }
  }
  $('#timeline').classList.toggle('is-after', view === 'after');
  $('#timeline').hidden = rows.length === 0;
  document.querySelector('.tl-legend').hidden = rows.length === 0;
}

// ---------- counter ----------
function renderCounter(animate) {
  const before = plan ? plan.before.length : 0;
  $('#trips-before').textContent = before;
  const showAfter = view === 'after' && plan?.ok;
  $('#trip-arrow').hidden = !showAfter;
  $('#trips-after').hidden = !showAfter;
  $('#trip-unit').textContent = before === 1 && !showAfter ? 'trip' : 'trips';
  if (!showAfter) return;
  const target = plan.after.length;
  if (!animate || reduceMotion) { $('#trips-after').textContent = target; return; }
  const from = before;
  const start = performance.now();
  const dur = 700;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const v = Math.round(from + (target - from) * (1 - (1 - t) ** 3));
    $('#trips-after').textContent = v;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---------- result ----------
function medById(id) { return state.meds.find((m) => m.id === id); }

function tripItems(day, rows) {
  const items = [];
  for (const row of rows) {
    if (!row.after.includes(day)) continue;
    const med = medById(row.medId);
    const f = row.fill;
    if (!f) {
      items.push({ med, kind: 'aside', text: `${med.name}: due this day anyway`, detail: 'Set aside, filled as usual.' });
    } else if (f.action === 'short' && day === f.pickup) {
      const early = f.date - f.pickup;
      items.push({
        med, kind: 'short',
        text: `${med.name}: short fill ${f.units} ${unitWord(med, f.units)} (${plural(f.days, 'day')})`,
        detail: `Runs out ${short(f.date)}${early > 0 ? `, collected ${plural(early, 'day')} before` : ''}. Lasts until ${short(f.alignedOn)}.`
          + (f.copayEst != null ? ` About ${money(f.copayEst)} for ${plural(f.days, 'day')} (daily rate). Your plan may differ.` : ''),
      });
    } else if (f.action === 'early' && day === f.alignedTrip) {
      items.push({ med, kind: 'fill', text: `${med.name}: regular fill, ${plural(f.earlyBy, 'day')} early`, detail: `Would run out ${short(f.date)}. A few spare pills carry over.` });
    } else {
      items.push({ med, kind: 'fill', text: `${med.name}: regular fill`, detail: f.action === 'aligned' && day === f.alignedTrip ? 'Already due this day. Nothing to change.' : '' });
    }
  }
  return items;
}

function renderResult() {
  const box = $('#result');
  const msg = $('#plan-msg');
  msg.textContent = '';
  $('#lineup').hidden = view === 'after';
  $('#show-before').hidden = view !== 'after';

  if (!plan || state.meds.length === 0) { box.hidden = true; $('#lineup').disabled = true; return; }
  $('#lineup').disabled = !plan.ok;
  if (!plan.ok) {
    box.hidden = true;
    msg.textContent = plan.reason === 'all-closed'
      ? 'Every day is marked closed. Untick a day so Muster has somewhere to land.'
      : 'Muster needs at least two bottles it can line up. Add another, or check the ones set aside.';
    return;
  }
  if (view !== 'after') { box.hidden = true; return; }
  box.hidden = false;

  const rows = timeline(state.meds, plan);
  const synced = plan.fills.length;
  $('#result-h').textContent = `From ${long(plan.syncTrip)}, one pickup every ${plural(state.settings.cycle, 'day')}.`;

  const list = $('#trips');
  list.replaceChildren();
  const transition = plan.after.filter((d) => d < plan.syncTrip);
  let n = 0;
  for (const day of transition) {
    n += 1;
    const items = tripItems(day, rows);
    list.append(el('li', { class: 'trip' },
      el('p', { class: 'trip-date' }, el('span', { class: 'mono trip-n', text: `Trip ${n}` }), short(day)),
      el('ul', {}, items.map((it) => el('li', { class: `item item-${it.kind}` },
        el('span', { class: 'item-text', text: it.text }), it.detail ? el('span', { class: 'item-detail muted', text: it.detail }) : null))),
    ));
  }
  const changed = plan.fills.filter((f) => f.supplyChanged);
  list.append(el('li', { class: 'trip trip-sync' },
    el('p', { class: 'trip-date' }, el('span', { class: 'mono trip-n', text: 'Pickup day' }), `${short(plan.syncTrip)}, then every ${state.settings.cycle} days`),
    el('p', { class: 'trip-sync-text' }, `All ${synced} lined-up bottles together. Doses stay the same.`),
    plan.syncDays.some((d) => plan.closed.includes(new Date(d * 86400000).getUTCDay()))
      ? el('p', { class: 'item-detail', text: 'When the day lands on a closed day, the trip moves to the open day before. Choose "4 weeks" to keep the same weekday every time.' }) : null,
    changed.length ? el('p', { class: 'item-detail', text: `From now on, ask for ${changed.map((f) => `${f.supply}-day fills of ${medById(f.medId).name}`).join('; ')}.` }) : null,
  ));

  const aside = $('#aside');
  const asideList = $('#aside-list');
  asideList.replaceChildren();
  aside.hidden = plan.setAside.length === 0;
  for (const s of plan.setAside) {
    const med = medById(s.medId);
    asideList.append(el('li', {}, el('strong', { text: med.name }), ` ${ASIDE_TEXT[s.reason]}`));
  }
  renderCard(rows);
}

// ---------- pharmacist card (print) ----------
function renderCard() {
  const card = $('#card');
  const whose = state.settings.whose?.trim();
  const fills = plan.fills.map((f) => ({ f, med: medById(f.medId) }));
  card.replaceChildren(
    el('header', { class: 'card-head' },
      el('img', { src: 'brand/symbol.svg', alt: '', width: 40, height: 40 }),
      el('div', {},
        el('p', { class: 'card-kicker mono', text: 'Medication synchronization request' }),
        el('h1', { text: `One pickup day${whose ? ` for ${whose}` : ''}: ${long(plan.syncTrip)}` }),
        el('p', { text: `Then every ${state.settings.cycle} days.` }))),
    el('p', { class: 'card-ask' }, '"Hi, I\'d like to sign up for medication synchronization so all of these are ready on the same day. Here are the short fills that would line them up."'),
    el('table', {},
      el('thead', {}, el('tr', {}, ['Medication', 'Next pickup', 'Fill', 'Then'].map((h) => el('th', { scope: 'col', text: h })))),
      el('tbody', {}, fills.map(({ f, med }) => el('tr', {},
        el('td', { text: med.name }),
        el('td', { class: 'mono', text: short(f.action === 'short' ? f.pickup : f.alignedTrip) }),
        el('td', { text: f.action === 'short' ? `Short fill: ${f.units} ${unitWord(med, f.units)} (${plural(f.days, 'day')})`
          : f.action === 'early' ? `Regular fill, ${plural(f.earlyBy, 'day')} early` : 'Regular fill' }),
        el('td', { text: `${f.supply}-day fills from ${short(f.alignedTrip)}` }),
      )),
      plan.setAside.map((s) => el('tr', { class: 'card-aside' },
        el('td', { text: medById(s.medId).name }), el('td', { class: 'mono', text: s.pickups[0] != null ? short(s.pickups[0]) : '' }),
        el('td', { colspan: 2, text: `Please advise: ${ASIDE_TEXT[s.reason]}` }))))),
    el('footer', { class: 'card-foot muted' },
      `Plan made with Muster on ${short(TODAY)} from the bottle labels. Please check it against the pharmacy record before filling. Doses are unchanged.`),
  );
}

// ---------- editor ----------
const dlg = $('#editor');
const form = $('#editor-form');
let editingId = null;
const FIELDS = ['name', 'kind', 'perDay', 'daysSupply', 'lastFill', 'onHand', 'copay'];

function openEditor(id = null) {
  editingId = id;
  const med = id ? medById(id) : { name: '', kind: 'tablet', perDay: 1, daysSupply: 30, lastFill: TODAY_ISO, onHand: '', copay: '', controlled: false };
  $('#editor-h').textContent = id ? 'Edit bottle' : 'Add a bottle';
  for (const f of FIELDS) form.elements[f].value = med[f] ?? '';
  form.elements.lastFill.max = TODAY_ISO;
  form.elements.controlled.checked = Boolean(med.controlled);
  $('#f-delete').hidden = !id;
  for (const f of FIELDS) showError(f, '');
  dlg.showModal();
  form.elements.name.focus();
}

function showError(field, text) {
  const e = $(`#e-${field}`);
  if (!e) return;
  e.textContent = text;
  form.elements[field].setAttribute('aria-invalid', text ? 'true' : 'false');
  if (text) form.elements[field].setAttribute('aria-describedby', `e-${field}`);
}

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const v = Object.fromEntries(FIELDS.map((f) => [f, form.elements[f].value]));
  const med = {
    id: editingId || `b-${Date.now().toString(36)}`,
    name: v.name.trim(), kind: v.kind,
    perDay: Number(v.perDay), daysSupply: Number(v.daysSupply), lastFill: v.lastFill,
    onHand: v.onHand === '' ? null : Number(v.onHand),
    copay: v.copay === '' ? null : Number(v.copay),
    controlled: form.elements.controlled.checked,
  };
  const errors = validateMed({ ...med, onHand: v.onHand, copay: v.copay }, TODAY);
  for (const f of FIELDS) showError(f, errors[f] || '');
  const first = FIELDS.find((f) => errors[f]);
  if (first) { form.elements[first].focus(); return; }
  if (editingId) state.meds = state.meds.map((m) => (m.id === editingId ? med : m));
  else state.meds.push(med);
  dlg.close();
  update();
});
$('#f-cancel').addEventListener('click', () => dlg.close());
$('#f-delete').addEventListener('click', () => {
  state.meds = state.meds.filter((m) => m.id !== editingId);
  dlg.close();
  update();
});

// ---------- wiring ----------
function update({ animate = false } = {}) {
  computePlan();
  persist();
  renderBottles();
  renderTimeline();
  renderCounter(animate);
  renderResult();
  $('#plan-title').textContent = view === 'after' ? 'Pickups, lined up' : 'Pickups, as they are now';
  $('#plan-sub').textContent = view === 'after'
    ? 'Dots now sit on the amber lines: one trip for every bottle.'
    : 'Each dot is a trip to the pharmacy for one bottle.';
}

document.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-action],[data-edit]');
  if (!t) return;
  if (t.dataset.edit) openEditor(t.dataset.edit);
  else if (t.dataset.action === 'add') openEditor();
  else if (t.dataset.action === 'example') {
    state = { meds: exampleHousehold(TODAY_ISO), settings: { ...state.settings, whose: 'Dad' }, isExample: true };
    view = 'before';
    update();
  } else if (t.dataset.action === 'reset') {
    if (confirm('Remove all bottles from this browser?')) {
      clear();
      state = { meds: [], settings: { cycle: 30, closed: [0], whose: '' }, isExample: false };
      view = 'before';
      update();
    }
  }
});

$('#lineup').addEventListener('click', () => {
  view = 'after';
  update({ animate: true });
  setTimeout(() => $('#result').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' }), reduceMotion ? 0 : 800);
});
$('#show-before').addEventListener('click', () => { view = 'before'; update(); $('#lineup').focus(); });
$('#print').addEventListener('click', () => window.print());
$('#whose').addEventListener('input', (e) => { state.settings.whose = e.target.value; persist(); if (plan?.ok && view === 'after') renderCard(); });

for (const r of document.querySelectorAll('input[name="cycle"]')) {
  r.checked = Number(r.value) === state.settings.cycle;
  r.addEventListener('change', () => { state.settings.cycle = Number(r.value); update(); });
}
for (const c of document.querySelectorAll('input[name="closed"]')) {
  c.checked = state.settings.closed.includes(Number(c.value));
  c.addEventListener('change', () => {
    state.settings.closed = [...document.querySelectorAll('input[name="closed"]:checked')].map((x) => Number(x.value));
    update();
  });
}

update();
if (params.has('card') && plan?.ok) { view = 'after'; update(); document.body.classList.add('show-card'); }
if (params.has('edit')) openEditor(state.meds.some((m) => m.id === params.get('edit')) ? params.get('edit') : null);
