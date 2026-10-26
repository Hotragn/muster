// Muster's planning core. Pure functions, no DOM, so Node tests can import it.
// Dates are ISO strings ('YYYY-MM-DD') at the edges and integer day numbers inside.

const DAY_MS = 86400000;

export const SYNCABLE_KINDS = ['tablet', 'capsule'];
export const KINDS = ['tablet', 'capsule', 'inhaler', 'insulin', 'liquid', 'patch', 'drops'];
// Many plans allow a refill once about 80% of the supply is used.
export const EARLY_REFILL_SHARE = 0.2;

export function toDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function fromDay(n) {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

export function weekday(n) {
  return new Date(n * DAY_MS).getUTCDay();
}

export function todayISO(now = new Date()) {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

// The day a bottle runs out. A pill count beats the label date when given.
export function runOutDay(med, today) {
  if (med.onHand != null && med.onHand !== '' && med.perDay > 0) {
    return today + Math.floor(Number(med.onHand) / med.perDay);
  }
  return Math.max(today, toDay(med.lastFill) + med.daysSupply);
}

// The supply a bottle is filled with once it is on the cycle. A 30-day bottle
// on a 28-day cycle becomes a 28-day fill (and 90 becomes 84).
export function cycleSupply(med, cycle) {
  if (med.daysSupply % cycle === 0) return med.daysSupply;
  const n = Math.round(med.daysSupply / cycle);
  if (n >= 1 && Math.abs(n * cycle - med.daysSupply) <= med.daysSupply * 0.1) return n * cycle;
  return null;
}

// Returns why a bottle should not be lined up, or null if it can be.
export function setAsideReason(med, cycle) {
  if (med.controlled) return 'controlled';
  if (!SYNCABLE_KINDS.includes(med.kind)) return 'not-countable';
  if (cycleSupply(med, cycle) == null) return 'supply-mismatch';
  return null;
}

// How many days before running out a bottle can usually be refilled.
export const earlyWindow = (med) => Math.floor(med.daysSupply * EARLY_REFILL_SHARE);

export function validateMed(med, today) {
  const errors = {};
  if (!med.name || !med.name.trim()) errors.name = 'Write the name as it appears on the label.';
  if (!(Number(med.perDay) > 0) || Number(med.perDay) > 24) errors.perDay = 'Enter how many a day, like 1 or 2.';
  if (!(Number(med.daysSupply) >= 1 && Number(med.daysSupply) <= 120) || !Number.isInteger(Number(med.daysSupply))) {
    errors.daysSupply = "Days' supply should be a whole number between 1 and 120.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(med.lastFill || '')) errors.lastFill = 'Pick the fill date from the label.';
  else if (toDay(med.lastFill) > today) errors.lastFill = 'That fill date is in the future.';
  if (med.onHand != null && med.onHand !== '' && !(Number(med.onHand) >= 0)) errors.onHand = 'Count can be left empty, or a number like 12.';
  if (med.copay != null && med.copay !== '' && !(Number(med.copay) >= 0)) errors.copay = 'Copay can be left empty, or an amount like 4.00.';
  return errors;
}

const mod = (a, n) => ((a % n) + n) % n;

// Pickups if nothing changes: each bottle is refilled the day it runs out.
export function pickupsAsIs(med, today, horizon) {
  const days = [];
  for (let d = runOutDay(med, today); d < today + horizon; d += med.daysSupply) days.push(d);
  return days;
}

// How one bottle reaches a given sync day.
export function stepFor(med, anchor, cycle, today) {
  const due = runOutDay(med, today);
  const shortDays = mod(anchor - due, cycle);
  if (shortDays === 0) return { action: 'aligned', date: due, days: med.daysSupply, alignedOn: due };
  const nextSync = due + shortDays;
  const prevSync = nextSync - cycle;
  const earlyBy = due - prevSync;
  if (prevSync >= anchor && earlyBy <= Math.floor(med.daysSupply * EARLY_REFILL_SHARE)) {
    return { action: 'early', date: prevSync, days: med.daysSupply, earlyBy, alignedOn: prevSync };
  }
  return { action: 'short', date: due, days: shortDays, alignedOn: nextSync };
}

function pickupsAfter(step, med, today, horizon) {
  const days = [];
  if (step.action === 'short') days.push(step.pickup ?? step.date);
  const supply = step.supply ?? med.daysSupply;
  for (let d = step.alignedOn; d < today + horizon; d += supply) days.push(d);
  return days.filter((d) => d < today + horizon);
}

// Short fills can be collected a few days before the bottle runs out, so
// several of them can share one trip. Greedy interval stabbing: reuse a day
// already on the calendar if one fits, otherwise pick the latest allowed day.
function groupShortPickups(steps, fixedDays, today) {
  const shorts = steps.filter((s) => s.action === 'short')
    .map((s) => ({ s, lo: Math.max(today, s.date - earlyWindow(s.med)), hi: s.date }))
    .sort((a, b) => a.hi - b.hi);
  const chosen = [];
  for (const it of shorts) {
    const reuse = [...chosen, ...fixedDays].filter((d) => d >= it.lo && d <= it.hi).sort((a, b) => b - a)[0];
    if (reuse != null) it.s.pickup = reuse;
    else { it.s.pickup = it.hi; chosen.push(it.hi); }
  }
}

const unique = (arr) => [...new Set(arr)].sort((a, b) => a - b);

export function planSync(meds, opts = {}) {
  const today = opts.today ?? toDay(todayISO());
  const cycle = opts.cycle ?? 30;
  const horizon = opts.horizon ?? 90;
  const closed = opts.closedWeekdays ?? [0];

  const syncable = [];
  const setAside = [];
  for (const med of meds) {
    const reason = setAsideReason(med, cycle);
    if (reason) setAside.push({ med, reason, pickups: pickupsAsIs(med, today, horizon) });
    else syncable.push(med);
  }

  const before = unique(meds.flatMap((m) => pickupsAsIs(m, today, horizon)));
  const setAsidePickups = setAside.flatMap((s) => s.pickups);

  if (syncable.length < 2) {
    return { ok: false, reason: 'too-few', today, cycle, horizon, before, setAside, syncable };
  }

  let best = null;
  for (let anchor = today + 1; anchor <= today + cycle; anchor++) {
    if (closed.includes(weekday(anchor))) continue;
    const steps = syncable.map((med) => ({ med, supply: cycleSupply(med, cycle), ...stepFor(med, anchor, cycle, today) }));
    const fixedDays = [
      ...steps.filter((s) => s.action !== 'short').map((s) => s.alignedOn),
      ...setAsidePickups,
    ];
    groupShortPickups(steps, fixedDays, today);
    const after = unique([
      ...steps.flatMap((s) => pickupsAfter(s, s.med, today, horizon)),
      ...setAsidePickups,
    ]);
    const shortDays = steps.reduce((sum, s) => sum + (s.action === 'short' ? s.days : 0), 0);
    const alignedFrom = Math.max(...steps.map((s) => s.alignedOn));
    const score = [after.length, shortDays, alignedFrom, anchor];
    if (!best || compare(score, best.score) < 0) best = { anchor, steps, after, shortDays, alignedFrom, score };
  }

  if (!best) return { ok: false, reason: 'all-closed', today, cycle, horizon, before, setAside, syncable };

  // The sync day the household will actually see repeating.
  const syncDay = best.alignedFrom;
  const fills = best.steps.map((s) => {
    const units = s.action === 'short' ? Math.ceil(s.days * s.med.perDay) : null;
    const copay = Number(s.med.copay);
    const copayEst = s.action === 'short' && s.med.copay !== '' && s.med.copay != null && copay >= 0
      ? Math.round((copay / s.med.daysSupply) * s.days * 100) / 100
      : null;
    return {
      medId: s.med.id, action: s.action, date: s.date, pickup: s.pickup ?? s.date, days: s.action === 'short' ? s.days : s.supply, units, copayEst,
      earlyBy: s.earlyBy ?? 0, alignedOn: s.alignedOn, supply: s.supply, supplyChanged: s.supply !== s.med.daysSupply,
    };
  });

  return {
    ok: true,
    today, cycle, horizon,
    anchor: best.anchor,
    syncDay,
    syncDays: Array.from({ length: Math.ceil((today + horizon - best.anchor) / cycle) }, (_, i) => best.anchor + i * cycle)
      .filter((d) => d < today + horizon),
    fills,
    setAside: setAside.map((s) => ({ medId: s.med.id, reason: s.reason, pickups: s.pickups })),
    before,
    after: best.after,
    shortDays: best.shortDays,
  };
}

function compare(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

// Pickups per bottle, before and after, for drawing the timeline.
export function timeline(meds, plan) {
  const byId = new Map(plan.ok ? plan.fills.map((f) => [f.medId, f]) : []);
  return meds.map((med) => {
    const before = pickupsAsIs(med, plan.today, plan.horizon);
    const fill = byId.get(med.id);
    const after = fill ? pickupsAfter(fill, med, plan.today, plan.horizon) : before;
    return { medId: med.id, before, after, fill: fill || null };
  });
}
