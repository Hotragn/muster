# Methodology

How Muster was chosen, designed, built and checked. Each stage left a written record in `docs/`, listed at the end of each section.

## 1. Understand the event and the field
- Read every official event page (overview, rules, schedule, updates, discussions, gallery) and wrote down the rules, required deliverables and the exact judging criteria.
- Mapped the competition from public GitHub repositories that mention the event (read-only; nothing cloned, forked or contacted) and listed the most common project patterns, so we could stay out of crowded territory.
- Records: [HACKATHON.md](HACKATHON.md), [LANDSCAPE.md](LANDSCAPE.md).

## 2. Find an insight before an idea
- Wrote three candidate users with a recurring task, the exact moment it fails, its cost and today's workaround: a family caregiver, an international student on OPT, a substitute teacher.
- For each user, wrote insights in the form *"Most people assume X, but actually Y"* and kept only those that were true, specific and surprising.
- Generated 12 ideas through deliberate lenses: inversion, transplant from another field, deletion of a step, making the invisible visible, shifting work, and shifting time. At least one used no AI.
- Cut ideas that overlapped with the landscape or with hackathon staples (reminder apps, chat-with-PDF, dashboards).
- Scored the survivors on the official criteria, with creativity and impact double-weighted, plus demo strength and buildability. Then red-teamed the top two: *So what? Done before? Why switch? What if it's wrong?* The runner-up (an OPT unemployment clock) failed on originality and legal risk.
- Record: [IDEAS.md](IDEAS.md).

## 3. Design the demo first, then the product
- Wrote the demo script before any code: the painful before, the "aha" moment, depth that proves it's real, the close. The MVP is exactly what that script needs; everything else became a ranked, cuttable stretch goal or an explicit non-goal.
- Specified empty, loading, error and success states for the core flow before building it.
- Records: [DEMO.md](DEMO.md), [PLAN.md](PLAN.md).

## 4. Brand before interface
- Name: 25 candidates in four styles, shortlist searched for collisions on the web and GitHub. "Muster" means to gather scattered people at one place and time, which is exactly what the product does to prescriptions.
- Concept drawn from the user's world: amber prescription vials, thermal-printed labels, the pharmacist's teal ink. One signature element (the *muster line*, dots resting against a bar) is used for the logo, timeline, animation, dividers and the card edge.
- Every colour pair checked by script against WCAG AA in light and dark; fonts openly licensed and vendored; logo hand-built in SVG and inspected at 16, 32 and 512 px.
- Record: [BRAND.md](BRAND.md).

## 5. Build in runnable milestones
| Milestone | Result |
|---|---|
| M1 | Planning core and unit tests (pure functions, fixed-date tests) |
| M2 | Planner screen end to end with the example household |
| M3 | Brand applied, print card, all states |
| M4 | Landing page, brand board, real screenshots |
| M5 | Verification, audit, packaging |

Each milestone ended runnable and committed. When a step failed repeatedly, the approach changed and the reason was logged. Feature freeze came as soon as the golden path and landing page worked.
- Records: [PROGRESS.md](PROGRESS.md), [DECISIONS.md](DECISIONS.md).

## 6. Planning method (the domain model)
The planner encodes pharmacy practice as explicit, testable rules rather than learned behaviour, so every number can be explained.

| Assumption | Value in code | Source or rationale |
|---|---|---|
| Run-out day | fill date + days' supply, or today + ⌊count ÷ per day⌋ | Label arithmetic; a count overrides when given. |
| Sync cycle | 30 days, or 28 (same weekday) | Common med-sync cycles. |
| Early-refill allowance | up to 20% of a supply early | Many plans allow refills once about 80% is used. Varies by plan; disclosed in the UI. |
| Bottles set aside | controlled substances, non-tablet/capsule forms, supplies that don't fit the cycle | These typically can't be short-filled by count; deferred to the pharmacist. |
| Copay of a short fill | copay ÷ supply × days | Daily cost-sharing; required for Medicare Part D solid oral doses (42 CFR 423.153(b)(4)). |
| Closed days | trips move to the nearest open day before | No trip is ever scheduled on a closed day. |
| Objective | fewest trips in 90 days → fewest short-fill days → earliest alignment | The user's pain is trips; daily-rate copays make extra short-fill days cheap. |

## 7. Verify with evidence, not belief
- **Unit tests** for every rule above (15 tests).
- **End-to-end:** a headless-Chrome script drives the real UI through the demo three times in a row, plus edge cases (empty, invalid, single bottle, all days closed, 375 px phones, 404, image loading, console errors). 48/48 checks pass.
- **Design:** contrast script (34 pairs pass); no horizontal scroll at phone width; the print card fits one page.
- **Clean clone:** README followed from a fresh clone (install, test, lint, serve).
- **Audits:** banned generic phrasing and visual clichés; claims checked against sources ("most pharmacies" → "many pharmacies"); the fictional example labelled everywhere it appears.
- **Judging-panel pass:** scored the running app on each official criterion and fixed the weakest (Impact) by showing the computed steady-state benefit ("then 1 trip every 30 days instead of 6").

Bugs found by this process and fixed: trips landing on closed weekdays as a 30-day cycle drifted; changeover short fills not sharing trips; an early-refill label off by the closed-day shift; a routing collision (`/brand` page vs `brand/` folder) hidden by a test that passed vacuously; and an auto-scroll that hid the main animation.

## 8. Honesty rules applied throughout
- Nothing is simulated in the planner; the only made-up data is the example household, and it's labelled "Example (fictional)".
- No invented users, testimonials, metrics or partnerships. Every number in the copy is computed from the example.
- Limits are stated in the app, on the landing page and in the README.
- AI assistance is disclosed in [AI_USAGE.md](AI_USAGE.md).

## 9. What validation would come next
1. Show the card to three community pharmacists: is it accurate, complete, and how long does enrolment take with and without it?
2. Five caregiver sessions: time to enter a household from real bottles; errors; whether they would bring the card.
3. Measure what matters: trips per month before and after over two cycles, and missed-dose days. Self-reported and with consent.
