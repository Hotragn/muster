<p><img src="public/brand/symbol-180.png" width="72" height="72" alt="Muster symbol"></p>

# Muster

**All the bottles. One pickup day.**

Muster is for whoever does the pharmacy runs for a parent (or themself) on several daily prescriptions. You copy each bottle's label. Muster works out the one-time short fills that put every prescription on the same pickup day, and prints a card to hand the pharmacist.

![The planner after pressing Line them up: 19 trips in 90 days become 6](public/shots/planner-after.png)

## The insight

Most people treat running out of medication as a *remembering* problem, so they set reminders. It's really **calendar arithmetic**: prescriptions filled on different days run out on different days, forever, and no reminder changes that. Many pharmacies already offer the fix, **medication synchronization** (one-time short fills that move everything onto one day), but you have to ask, and asking is much easier with the numbers in hand.

## What it does
- Takes each bottle: name, how many a day, days' supply, fill date (or a pill count), form, controlled-substance flag, optional copay.
- Shows the next 90 days of pickups as they are now: each bottle is a row, each trip a dot.
- **Line them up**: tries every possible pickup day in the next cycle, skips days the pharmacy is closed, and keeps the one with the fewest trips in 90 days, then the fewest short-fill days. The dots slide onto amber pickup lines.
- Lists every trip of the changeover: short fills in tablets and days, bottles refilled a few days early, and the repeating pickup day.
- Sets aside bottles that shouldn't be split, with the reason: controlled substances, inhalers/pens/liquids/drops/patches, supplies that don't fit the cycle.
- Estimates short-fill copays at a daily rate.
- 30-day or 4-week cycle (4 weeks keeps the same weekday).
- Prints a one-page **pharmacist card**.
- Example household: 19 trips in the next 90 days become 6 (including the changeover), then **1 trip every 30 days instead of 6**.

## Run it
Requires Node.js 20+. No keys, accounts or network services.

```bash
git clone <this repo> && cd muster
npm install
npm start
```

Open http://localhost:4173 (landing), http://localhost:4173/app (planner), http://localhost:4173/brand (brand board).

**Demo mode:** `http://localhost:4173/app?example=1&today=2026-10-26` loads the fictional example household with a fixed "today", so the numbers and dates match the demo video. The page shows an "Example (fictional)" badge whenever example data is loaded. Nothing in the planner is simulated: every number is computed in the browser.

### Checks
```bash
npm run check          # unit tests (node --test), contrast ratios, ESLint
node scripts/golden-path.mjs 3   # with npm start running: drives the demo 3x + edge cases in headless Chrome
sh scripts/screenshots.sh        # with npm start running: regenerates public/shots/
```

## How it works
`public/js/muster.js` is the whole planning core: pure functions with no DOM, tested in `test/muster.test.mjs`.
1. Run-out day = fill date + days' supply, or today + pills on hand ÷ pills a day.
2. For each candidate pickup day A, a bottle's short fill is `(A − run-out) mod cycle` days, so it lands exactly on A. A bottle due within a fifth of its supply after a pickup day is instead refilled early on that day.
3. Short fills are intervals (collectable up to a fifth of the supply early, never after the bottle runs out). A greedy interval cover merges them into as few trips as possible.
4. Every trip on a closed weekday moves to the open day before. This applies to "before" too, so the comparison is fair.
5. Pick the A with the fewest trips in 90 days, then the fewest short-fill days, then the earliest full alignment.

## Known limitations
- **Not medical advice.** It plans dates; it never changes doses; the pharmacist confirms against the pharmacy record.
- Knows only what you type. No pharmacy, doctor or insurer integration.
- Early-refill allowance ("about 80% used") is a rule of thumb; plans differ.
- Copay estimates use a daily rate: required for Medicare Part D tablets and capsules (42 CFR 423.153(b)(4)), varies elsewhere.
- One person per plan; no reminders; data lives only in this browser's localStorage.
- Not yet tested with real caregivers or pharmacists.
- On a 30-day cycle the pickup weekday drifts; trips that hit a closed day move a day earlier.

### Simulated or fictional, by name
- **Example household** (`public/js/example.js`): seven made-up bottles for "Dad". Labelled "Example (fictional)" in the UI.
- No other simulated features. There is no AI and no network call in the product.

## Credits
- **Atkinson Hyperlegible**, Braille Institute of America, SIL Open Font License 1.1 (`public/fonts/atkinson/OFL.txt`).
- **IBM Plex Mono**, IBM Corp., SIL Open Font License 1.1 (`public/fonts/plexmono/OFL.txt`).
- Dev tooling: ESLint (MIT), Node.js test runner, headless Google Chrome for screenshots and the golden-path check.
- Background: American Pharmacists Association, Appointment-Based Model (medication synchronization); McKesson "Med Sync 101"; eCFR 42 CFR 423.153 (daily cost-sharing).
- Logo, icons, colours and all code are original to this project.
- **AI assistance:** built with Claude Code (Anthropic). See [AI_USAGE.md](AI_USAGE.md).

## Project docs
[HACKATHON.md](HACKATHON.md) · [LANDSCAPE.md](LANDSCAPE.md) · [IDEAS.md](IDEAS.md) · [PLAN.md](PLAN.md) · [BRAND.md](BRAND.md) · [DEMO.md](DEMO.md) · [PITCH.md](PITCH.md) · [SUBMISSION.md](SUBMISSION.md) · [DECISIONS.md](DECISIONS.md) · [PROGRESS.md](PROGRESS.md)

Licence: MIT (code). Fonts keep their own OFL licences.
