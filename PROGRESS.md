# PROGRESS

Deadline: Oct 26, 2026 10:00 PM CDT (= 11:00 PM EDT; machine clock is EDT).

| Time (EDT) | Phase | Persona | Note |
|---|---|---|---|
| Mon Oct 26 05:20 | 0 | THE SCOUT | Read all Devpost pages, sponsors, GitHub landscape. Wrote HACKATHON.md, LANDSCAPE.md. |
| Mon Oct 26 05:24 | 1 | FIELD RESEARCHER → INVENTOR → SKEPTICAL JUDGE | 3 users, 7 insights (5 kept), 12 ideas, scored, red-teamed. Chosen: one-pickup-day med sync planner. |
| Mon Oct 26 05:25 | 2 | PRODUCT DIRECTOR | DEMO.md draft and PLAN.md written. |
| Mon Oct 26 05:28 | 3 | NAMING STRATEGIST → BRAND DESIGNER | Name: Muster. Tokens, contrast script (34/34 pass), fonts vendored, symbol + favicons rendered and inspected. |
| Mon Oct 26 05:36 | 4 | STAFF ENGINEER + INTERFACE CRAFTSPERSON | M1 solver+tests, M2 planner end to end. Example: 19 → 6 trips in 90 days. |
| Mon Oct 26 05:40 | 4 | LANDING PAGE DESIGNER → PRODUCER | Brand board, landing, social card, screenshots. **Feature freeze**: golden path + landing work. Stretch goals (what-if day click, .ics, label photo reading) cut. |
| Mon Oct 26 05:40 | 5 | THE BREAKER | QA start |
| Mon Oct 26 05:44 | 5 | THE BREAKER | golden path 3x + 12 edge checks: 48/48 pass; clean clone OK; print = 1 page; secrets scan clean. Fixed: /brand routing collision, vacuous test, closed-day trips, early-count, mobile density. |
| Mon Oct 26 05:44 | 5 | THE SLOP AUDITOR | audit start |
| Mon Oct 26 05:46 | 5 | THE SLOP AUDITOR | Banned words: none (only "journey" as a we-don't-say example). No decorative gradients, glass, emoji, testimonials, metrics. Fixed: "Pharmacies already can" → "Many pharmacies"; labelled the landing story as a made-up example; corrected the after-state subtitle. |
| Mon Oct 26 05:46 | 5 | THE JUDGING PANEL | Before: Creativity 4, Impact 3, Technical 4, Design/UX 4. Lowest = Impact (benefit shown only as a 90-day total mixing in one-off transition trips). Fix: computed steady-state line "Then 1 trip every 30 days instead of 6" + insight line in before-state + clearer empty state. After: Creativity 4, Impact 4, Technical 4, Design/UX 4. Remaining biggest gap for all four: no validation with real caregivers/pharmacists. |

## Challenges and lessons (for the submission)
- **30-day cycles drift across weekdays.** The first version picked a sync day on an open weekday but the *next* sync landed on a Sunday. Fixed by moving every trip (before and after, so the comparison stays fair) to the nearest open day before it, and offering a 28-day cycle that keeps the weekday fixed.
- **Naive short fills don't save trips during the transition.** Each bottle's bridge fill was its own trip. Treating each short fill as an interval (it can be collected up to a fifth of its supply early, never after it runs out) and stabbing intervals greedily merged them.
- **A bottle due two days after the sync day** shouldn't need a 28-day short fill; refilling it a couple of days early on the sync day is what pharmacies do. Added that rule.
- **A test that passed for the wrong reason.** The brand-board contrast check passed while /brand was serving the 404 page (a folder named brand/ shadowed brand.html). Tightened the test to count passing rows, and fixed routing so pages beat folders.
- **Headless Chrome can't emulate a phone width via --window-size**, so the mobile screenshot came from the in-app browser's device emulation instead.
