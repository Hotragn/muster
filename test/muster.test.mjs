import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toDay, fromDay, runOutDay, setAsideReason, stepFor, planSync, pickupsAsIs, validateMed, weekday, timeline } from '../public/js/muster.js';
import { exampleHousehold } from '../public/js/example.js';

const T = toDay('2026-11-02'); // a Monday
const med = (o) => ({ id: o.name, kind: 'tablet', perDay: 1, daysSupply: 30, controlled: false, onHand: null, copay: null, ...o });

test('date round trip and weekday', () => {
  assert.equal(fromDay(toDay('2026-02-28') + 1), '2026-03-01');
  assert.equal(fromDay(toDay('2028-02-28') + 1), '2028-02-29');
  assert.equal(weekday(T), 1);
});

test('run-out date is fill date + supply, pill count wins, overdue clamps to today', () => {
  const m = med({ name: 'a', lastFill: '2026-10-20' });
  assert.equal(fromDay(runOutDay(m, T)), '2026-11-19');
  assert.equal(runOutDay({ ...m, onHand: 7, perDay: 2 }, T), T + 3);
  assert.equal(runOutDay(med({ name: 'b', lastFill: '2026-09-01' }), T), T);
});

test('set-aside rules', () => {
  assert.equal(setAsideReason(med({ controlled: true }), 30), 'controlled');
  assert.equal(setAsideReason(med({ kind: 'inhaler' }), 30), 'not-countable');
  assert.equal(setAsideReason(med({ daysSupply: 45 }), 30), 'supply-mismatch');
  assert.equal(setAsideReason(med({ daysSupply: 90 }), 30), null);
  assert.equal(setAsideReason(med({ daysSupply: 84 }), 28), null);
  assert.equal(setAsideReason(med({ daysSupply: 30 }), 28), null);
});

test('short fill length lands exactly on the sync day', () => {
  const m = med({ name: 'a', lastFill: '2026-10-08' }); // runs out Nov 7
  const anchor = toDay('2026-11-16');
  const s = stepFor(m, anchor, 30, T);
  assert.equal(s.action, 'short');
  assert.equal(s.days, 9);
  assert.equal(s.date + s.days, anchor);
});

test('a bottle due just after the sync day is refilled early on it instead of an extra trip', () => {
  const m = med({ name: 'a', lastFill: '2026-10-19' }); // runs out Nov 18
  const s = stepFor(m, toDay('2026-11-16'), 30, T);
  assert.equal(s.action, 'early');
  assert.equal(s.earlyBy, 2);
});

test('plan aligns every syncable bottle to the same repeating day', () => {
  const meds = [
    med({ name: 'a', lastFill: '2026-10-08' }),
    med({ name: 'b', lastFill: '2026-10-15' }),
    med({ name: 'c', lastFill: '2026-10-24' }),
    med({ name: 'd', lastFill: '2026-09-10', daysSupply: 90 }),
  ];
  const plan = planSync(meds, { today: T, cycle: 30, closedWeekdays: [] });
  assert.equal(plan.ok, true);
  for (const f of plan.fills) assert.equal(((f.alignedOn - plan.anchor) % 30 + 30) % 30, 0, `${f.medId} aligned`);
  assert.ok(plan.after.length < plan.before.length, `after ${plan.after.length} < before ${plan.before.length}`);
});

test('no trip, before or after, ever lands on a closed weekday', () => {
  const meds = [med({ name: 'a', lastFill: '2026-10-08' }), med({ name: 'b', lastFill: '2026-10-15' }), med({ name: 'c', lastFill: '2026-10-25' })];
  for (const cycle of [28, 30]) {
    const plan = planSync(meds, { today: T, cycle, closedWeekdays: [0, 6] });
    assert.ok(![0, 6].includes(weekday(plan.anchor)));
    for (const d of [...plan.before, ...plan.after, plan.syncTrip]) assert.ok(![0, 6].includes(weekday(d)), `${fromDay(d)} is closed`);
    for (const f of plan.fills) assert.ok(f.pickup <= f.date || f.action !== 'short');
  }
});

test('28-day cycle keeps the same weekday', () => {
  const meds = [med({ name: 'a', lastFill: '2026-10-08', daysSupply: 28 }), med({ name: 'b', lastFill: '2026-10-20', daysSupply: 28 })];
  const plan = planSync(meds, { today: T, cycle: 28, closedWeekdays: [0] });
  const wds = new Set(plan.syncDays.map(weekday));
  assert.equal(wds.size, 1);
});

test('fewer than two syncable bottles explains itself', () => {
  const plan = planSync([med({ name: 'a', lastFill: '2026-10-08' }), med({ name: 'b', lastFill: '2026-10-08', controlled: true })], { today: T });
  assert.equal(plan.ok, false);
  assert.equal(plan.reason, 'too-few');
  assert.equal(plan.setAside.length, 1);
});

test('short-fill units round up and copay is prorated by day', () => {
  const meds = [
    med({ name: 'a', lastFill: '2026-10-08', perDay: 0.5, copay: 6 }),
    med({ name: 'b', lastFill: '2026-10-28', copay: 6 }),
  ];
  const plan = planSync(meds, { today: T, cycle: 30, closedWeekdays: [] });
  for (const f of plan.fills.filter((x) => x.action === 'short')) {
    assert.equal(f.units, Math.ceil(f.days * (f.medId === 'a' ? 0.5 : 1)));
    assert.equal(f.copayEst, Math.round(6 / 30 * f.days * 100) / 100);
  }
});

test('set-aside bottles keep their own pickups in the after count', () => {
  const inhaler = med({ name: 'inh', kind: 'inhaler', lastFill: '2026-10-11' });
  const meds = [med({ name: 'a', lastFill: '2026-10-08' }), med({ name: 'b', lastFill: '2026-10-15' }), inhaler];
  const plan = planSync(meds, { today: T, closedWeekdays: [] });
  for (const d of pickupsAsIs(inhaler, T, 90)) assert.ok(plan.after.includes(d));
});

test('example household: set-aside count and a real reduction', () => {
  const meds = exampleHousehold('2026-11-02');
  const plan = planSync(meds, { today: T, cycle: 30, closedWeekdays: [0] });
  assert.equal(plan.ok, true);
  assert.equal(plan.setAside.length, 1);
  assert.ok(plan.after.length <= plan.before.length / 2, `${plan.before.length} → ${plan.after.length}`);
  assert.equal(plan.monthAfter, 1, 'one trip per cycle once lined up');
  assert.ok(plan.monthBefore >= 6, `as-is month has ${plan.monthBefore} trips`);
  const rows = timeline(meds, plan);
  assert.equal(rows.length, meds.length);
});

test('validation catches the common mistakes', () => {
  const e = validateMed({ name: ' ', perDay: 0, daysSupply: 200, lastFill: '2027-01-01', onHand: -1 }, T);
  assert.deepEqual(Object.keys(e).sort(), ['daysSupply', 'lastFill', 'name', 'onHand', 'perDay']);
  assert.deepEqual(validateMed(med({ name: 'ok', lastFill: '2026-10-01' }), T), {});
});

test('30-day bottles move to 28-day fills on a 28-day cycle', () => {
  const meds = [med({ name: 'a', lastFill: '2026-10-08' }), med({ name: 'b', lastFill: '2026-10-20' })];
  const plan = planSync(meds, { today: T, cycle: 28, closedWeekdays: [0] });
  assert.equal(plan.ok, true);
  for (const f of plan.fills) { assert.equal(f.supply, 28); assert.equal(f.supplyChanged, true); }
});

test('short fills due within a few days of each other share one pickup', () => {
  const meds = [
    med({ name: 'a', lastFill: '2026-10-06' }), // runs out Nov 5
    med({ name: 'b', lastFill: '2026-10-09' }), // runs out Nov 8
    med({ name: 'c', lastFill: '2026-10-28' }), // runs out Nov 27
  ];
  const plan = planSync(meds, { today: T, cycle: 30, closedWeekdays: [] });
  const shorts = plan.fills.filter((f) => f.action === 'short');
  for (const f of shorts) {
    assert.ok(f.pickup <= f.date, 'never collected after the bottle runs out');
    assert.ok(f.date - f.pickup <= 6, 'within the early-refill window');
  }
  const pickupDays = new Set(shorts.map((f) => f.pickup));
  assert.ok(pickupDays.size < shorts.length || shorts.length <= 1);
});
