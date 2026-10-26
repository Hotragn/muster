# IDEAS

## Field research (PERSONA: THE FIELD RESEARCHER)

### User A — the family caregiver for a parent on several daily meds
- **Role:** An adult child (often a student or young worker) running pharmacy errands for a parent with 5–8 chronic prescriptions (blood pressure, diabetes, cholesterol, thyroid, etc.).
- **Recurring task:** Keeping every bottle from running out.
- **The moment it goes wrong:** Saturday night, Dad says "I'm on my last metformin." The other bottles were refilled on the 3rd, 11th, 17th and 22nd. This is the fifth pharmacy trip of the month, and tomorrow the pharmacy is closed.
- **Cost:** 4–7 separate pickups a month (each a drive, a queue, sometimes time off work); missed doses when one bottle runs out between trips; stress of tracking six different dates in your head.
- **Current workaround:** Sticky notes on the fridge, a phone reminder per bottle, auto-refill texts from the pharmacy that arrive on six different days, or just "I'll go when he tells me he's out."
- In their words: *"It's like the bottles are on purpose never due on the same day."*

### User B — the international student on OPT
- **Role:** F-1 graduate on post-completion OPT, job hunting.
- **Task:** Staying under the 90-day aggregate unemployment limit.
- **Moment:** Switching jobs, a two-week gap, and a 15-hour/week contract that they assume counts as employment (it doesn't, under 20 hrs/week).
- **Cost:** Status violation risk. Very high stakes, rare event.
- **Workaround:** Spreadsheet, asking friends, emailing the international office.

### User C — the substitute teacher at 7:40 am
- **Role:** Day-to-day substitute walking into an unfamiliar classroom.
- **Task:** Running the day from the regular teacher's sub plan.
- **Moment:** The plan says "do p. 42" with no seating chart, no allergy/medical list, no idea which student leaves at 10:15 for speech.
- **Cost:** Lost instructional day, safety risk, sub burnout.
- **Workaround:** Asking the kids, finding the teacher next door.

### Insights ("Most people assume X, but actually Y")
- A1 ✅ **Most people assume running out of medication is a *remembering* problem (so they set reminders), but actually it's a *calendar arithmetic* problem: prescriptions that started on different days stay out of phase forever, and no reminder ever fixes that.**
- A2 ✅ **Most people assume pickups have to stay scattered, but actually most pharmacies already offer "medication synchronization" (one pickup day a month via one-time short fills) — the patient just has to ask, and arriving with the numbers makes it a two-minute conversation.** (Sources: APhA Appointment-Based Model page; McKesson "Med Sync 101".)
- A3 ✅ Most people assume a short fill costs a full copay, but actually Medicare Part D plans must apply a *daily* cost-sharing rate to solid oral doses dispensed for less than a month (42 CFR 423.153(b)(4)), and several states require the same for synchronization (e.g. NY Insurance Law §3224-d).
- B1 ✅ Most people assume any job stops the OPT unemployment clock, but actually work under 20 hours/week does not.
- B2 ❌ (cut: not surprising) Most assume the clock resets with a new job — most students already know it's aggregate.
- C1 ✅ Most people assume the sub plan's problem is missing lessons, but actually it's missing *logistics* (who leaves when, who has an allergy).
- C2 ❌ (cut: needs school-wide adoption to matter.)

## Ideas (PERSONA: THE INVENTOR)

| # | Lens | Idea | Insight |
|---|---|---|---|
| 1 | **Deletion** | **One pickup day:** enter each bottle's fill date and supply; it finds the best sync date, computes each one-time short fill, and prints a card to hand the pharmacist. Deletes 4–6 trips a month. | A1, A2 |
| 2 | Make the invisible visible | "Run-out radar": a timeline of every bottle's run-out day showing the days a parent will be out between trips. | A1 |
| 3 | Inversion | Instead of the patient chasing the pharmacy, generate a standing "appointment" the pharmacy calls about (ABM in a box for a tiny independent pharmacy). | A2 |
| 4 | Transplant (aviation) | Crew-duty-style "OPT clock": a running unemployment counter treating <20h/wk as not employed, with a what-if for a planned gap. | B1 |
| 5 | Shift the time | OPT gap planner: before you resign, shows the date your remaining days hit zero. | B1 |
| 6 | Transplant (sports) | Substitute "playbook card": one-page logistics card per class period (who leaves, allergies), rendered from a 10-question teacher form. | C1 |
| 7 | Shift the work | The regular teacher answers once; every future sub gets the card. | C1 |
| 8 | Transplant (finance: proration) | Short-fill copay estimator showing daily-rate proration so the caregiver isn't scared off. | A3 |
| 9 | No-AI | (Idea 1 is fully deterministic: date math + a solver over candidate anchor days.) | A1 |
| 10 | AI does what nothing else can | Photograph six amber bottles; vision model reads each label (drug, qty, fill date, days supply) into the planner, with each field highlighted on the photo and a confidence flag. | A1 |
| 11 | Transplant (logistics: consolidation) | Treat refills like freight consolidation: pick the anchor that minimises extra transition trips *and* short-fill days. | A1 |
| 12 | Shift the time | Pre-appointment checklist 5 days before sync day ("any dose changes? new scripts?"). | A2 |

### Originality check vs LANDSCAPE.md and hackathon staples
- Medication *reminder* apps are a hackathon staple → **sharp difference:** idea 1 sends no reminders at all; it removes the reason reminders exist by changing *when* refills happen, and produces an artifact for the pharmacist. Nothing in the event landscape touches healthcare logistics.
- Idea 10 alone is "AI extraction" (pattern 4) → kept only as an input step to idea 1, not as the product.
- Ideas 6/7 resemble generic "form → PDF" tools; cut.
- Idea 3 needs pharmacy adoption to demo; cut.
- Ideas 2, 8, 11, 12 merge into idea 1 as its visible proof, cost honesty, solver and follow-up.

## Scoring (PERSONA: THE SKEPTICAL JUDGE)
Criteria weights: Creativity ×2, Impact ×2, Technical ×1, Design/UX ×1, plus Demo strength and Buildability (tie-breakers).

| Idea | Creativity ×2 | Impact ×2 | Tech | Design | Demo | Build | Weighted (max 30) |
|---|---|---|---|---|---|---|---|
| 1+2+8+11 One pickup day | 4 | 4 | 4 | 4 | 5 | 4 | 24 |
| 4+5 OPT clock | 3 | 3 | 3 | 3 | 3 | 5 | 18 |
| 6 Sub card | 2 | 3 | 2 | 3 | 3 | 5 | 15 |
| 10 Bottle-photo reader (alone) | 2 | 3 | 4 | 3 | 4 | 2 | 17 |

## Red team (top two)

**One pickup day**
- *So what?* Six trips → one is ~60 fewer trips a year for one household, and fewer gap days where a bottle is empty. Visible in the calendar, not asserted.
- *Hasn't this been done?* Pharmacies run med sync internally (their software); patients have no tool. Searching shows pharmacist-side programs, not caregiver-side planners. Nothing similar at this event.
- *Why switch?* There's nothing to switch from; it's a one-time 3-minute setup that produces a card you hand over once.
- *What happens when it's wrong?* The pharmacist checks the plan against the real profile before dispensing; the app says so on every card. It flags meds it shouldn't sync (controlled substances, non-countable forms like inhalers/insulin/patches, antibiotics) and never says to skip or stretch doses. Every number shows its working (run-out date = fill date + days supply).
- **Survives.**

**OPT clock**
- *So what?* High stakes but rare and narrow; most students are fine.
- *Done before?* Several universities publish calculators/spreadsheets.
- *What if wrong?* Immigration consequences; legal-advice risk is much higher.
- **Fails** on originality and risk → runner-up only.

---

## HANDOFF

**Insight:** Most people assume running out of medication is a remembering problem, but actually it's calendar arithmetic: prescriptions filled on different days stay out of step forever, and pharmacies already have a fix (med sync) that patients don't know to ask for.

**One-sentence pitch:** Type in the bottles on your parent's counter, and it turns six pharmacy trips a month into one — with the exact short fills to ask for, printed on a card for the pharmacist.

**Target user, in their words:** "I'm at the pharmacy every week for Dad, and it's never for all of them at once."

**Wow moment:**
- *Before:* a month calendar with five scattered pickup dots and two red "out of pills" days.
- *After:* one press, the dots slide onto a single day; a counter reads "5 trips → 1 trip a month"; a pharmacist card appears listing "Metformin 500 mg — short fill 9 tablets (9 days)" for each bottle.

**How it differs from LANDSCAPE.md:** No entry touches healthcare or caregiving. Unlike medication-reminder apps, it sends no reminders; it changes the refill schedule so there is less to remember.

**Why it wins**
- Creativity: deletion, not reminders; reframes adherence as a scheduling problem with an existing but hidden fix.
- Impact: named beneficiary (caregivers and the 5+-med patients they help), counted benefit (trips removed, gap days removed).
- Technical: a real solver (anchor search minimising short-fill days and transition trips), multiple cycle lengths, flagged exclusions, tested date math.
- Design/UX: one screen, large legible type (Atkinson Hyperlegible, built for low-vision readers), a card designed to be handed across a counter.

**Biggest risk:** Being read as medical advice. **Mitigation:** the app never changes doses, labels itself a conversation aid, flags meds that must not be synced, and every card says the pharmacist confirms the plan.

**Runner-up:** OPT unemployment clock that treats <20 h/week work as unemployed and forecasts the zero date of a planned gap.
