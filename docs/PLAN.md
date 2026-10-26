# PLAN

## MVP scope (what the demo shows, nothing more)
1. Bottle list: add / edit / remove a medication (name+strength, units per day, days' supply, last fill date, optional pills on hand, kind, controlled flag, optional copay).
2. "Load example household" seed (fictional, labelled).
3. Before view: calendar of pickups for this month + 90-day trip count.
4. **Line them up**: solver picks sync day; after view with animated dots, trip counter, transition list.
5. Exclusions with reasons (controlled, non-countable forms).
6. Copay estimate for short fills (daily rate), labelled as an estimate.
7. Printable pharmacist card (print CSS).
8. Cycle choice: 30 days or 28 days (same weekday); avoid days the pharmacy is closed.
9. Landing page `/`, brand board `/brand.html`.

## Stretch goals (ranked, each cuttable)
1. Click any calendar day to force it as the sync day ("what if").
2. Export the plan as .ics calendar events.
3. Bottle-photo label reading (needs API key; labelled demo fallback). Likely cut.

## Non-goals
Reminders/notifications, accounts, cloud sync, pharmacy integrations, dose advice, drug-interaction checks, multi-patient households.

## Stack
Plain HTML + CSS + JavaScript ES modules, no framework, no build step: a single-screen tool with date math does not need one; it also makes the code easy to explain and the demo un-breakable. `npm start` runs a zero-dependency Node static server. Tests: Node's built-in `node --test`. Lint: ESLint (dev dependency only). Data stays in `localStorage`.

## Data model
```
Med { id, name, perDay, daysSupply, lastFill: 'YYYY-MM-DD', onHand: number|null,
      kind: 'tablet'|'capsule'|'inhaler'|'insulin'|'liquid'|'patch'|'drops',
      controlled: bool, copay: number|null }
Settings { cycle: 30|28, closedWeekdays: number[], today: 'YYYY-MM-DD' }
Plan { syncDate, cycle, fills: [{medId, date, days, units, kind:'short'|'regular', copayEst}],
       excluded: [{medId, reason}], tripsBefore, tripsAfter, horizonDays, alignedFrom }
```

## Algorithm
- Run-out date `R_i` = today + floor(onHand / perDay) if pills on hand given, else lastFill + daysSupply. Overdue → today.
- Excluded: controlled, or kind not tablet/capsule, or daysSupply not a multiple of the cycle.
- For each candidate sync date A in [today+1, today+cycle] not on a closed weekday: short-fill days `k_i = (A − R_i) mod cycle`. Transition pickups = distinct R_i with k_i > 0. After-trips over 90 days = distinct dates in {transition pickups} ∪ {A + n·cycle} ∪ {excluded meds' own dates}.
- Choose A minimising (after-trips, total short-fill days, A). Before-trips = distinct dates of R_i + n·daysSupply in 90 days.
- Copay estimate = copay ÷ daysSupply × k_i.

## Screens
- `/` landing. `/app.html` planner (one primary action: Line them up). `/brand.html` brand board.

## Mocked / simulated
Nothing is simulated in the planner: all output is computed. The example household is fictional and labelled "Example (fictional)". Copay figures are estimates and labelled so.

## States (core flow)
- Empty: no bottles → prompt to add the first bottle or load the example.
- Loading: none needed (instant, local); the line-up animation is the transition (skipped with reduced motion).
- Error: invalid field (inline message on the field); fewer than 2 syncable bottles → explain nothing to line up; all excluded → explain why.
- Success: after view, trip counter, transition list, card button.

## Milestones (each ends runnable + committed)
- M1 solver + tests (node --test passes).
- M2 planner screen end to end with example data (rough).
- M3 brand tokens applied, print card, states.
- M4 landing + brand page + screenshots.
- M5 QA, slop audit, packaging.
