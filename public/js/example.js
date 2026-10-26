// A fictional household used for the demo. Fill dates are relative to "today"
// so the example looks the same whatever day it is opened.
import { toDay, fromDay } from './muster.js';

const BOTTLES = [
  { name: 'Metformin 500 mg', kind: 'tablet', perDay: 2, daysSupply: 30, daysAgo: 26, copay: 4.0 },
  { name: 'Lisinopril 10 mg', kind: 'tablet', perDay: 1, daysSupply: 30, daysAgo: 21, copay: 4.0 },
  { name: 'Tamsulosin 0.4 mg', kind: 'capsule', perDay: 1, daysSupply: 30, daysAgo: 16, copay: 6.0 },
  { name: 'Levothyroxine 75 mcg', kind: 'tablet', perDay: 1, daysSupply: 30, daysAgo: 11, copay: 3.0 },
  { name: 'Amlodipine 5 mg', kind: 'tablet', perDay: 1, daysSupply: 30, daysAgo: 3, copay: 2.0 },
  { name: 'Atorvastatin 20 mg', kind: 'tablet', perDay: 1, daysSupply: 90, daysAgo: 40, copay: 10.0 },
  { name: 'Tramadol 50 mg', kind: 'tablet', perDay: 1, daysSupply: 30, daysAgo: 12, copay: 3.0, controlled: true },
];

export function exampleHousehold(todayIso) {
  const t = toDay(todayIso);
  return BOTTLES.map((b, i) => ({
    id: `ex-${i + 1}`,
    name: b.name,
    kind: b.kind,
    perDay: b.perDay,
    daysSupply: b.daysSupply,
    lastFill: fromDay(t - b.daysAgo),
    onHand: null,
    controlled: Boolean(b.controlled),
    copay: b.copay,
  }));
}
