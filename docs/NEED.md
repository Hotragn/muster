# The need

## Who has the problem

**Primary user: the family caregiver who does the pharmacy runs.** Often an adult child (a student or young worker) managing a parent's or grandparent's chronic prescriptions, typically five to eight daily medications for conditions like blood pressure, diabetes, cholesterol and thyroid. Often they're doing this alongside school or work.

**Secondary user: the patient themself**, anyone on several long-term prescriptions who collects their own refills.

**Indirect beneficiary: the pharmacy team**, who receive a clear, complete synchronization request instead of piecemeal refill calls.

## The recurring moment that goes wrong

> Saturday night. Dad says he's on his last metformin. The lisinopril was picked up on Tuesday, the thyroid pills the week before, and the tamsulosin is due Monday. Tomorrow the pharmacy is closed.

*(A composite, illustrative scenario. We have not yet interviewed caregivers; see "Evidence and its limits".)*

Each prescription started on a different day, so each runs out on a different day. That doesn't correct itself: a 30-day bottle refilled on the day it runs out stays on its own schedule every month.

## What it costs
- **Time and travel:** one trip per distinct due date. Our fictional example household has **19 pharmacy trips in 90 days** under its current schedule (computed by Muster from its fill dates).
- **Missed doses:** a bottle that runs out between trips, or on a day the pharmacy is closed.
- **Mental load:** tracking six or seven separate dates, refill-reminder texts arriving on different days, and coordinating around work or classes.

## Current workarounds, and why they fall short

| Workaround | What it does | Why it doesn't fix the problem |
|---|---|---|
| Reminder apps and alarms | Tell you when each bottle is due | Treat it as a memory problem; the dates stay scattered forever. |
| Pharmacy auto-refill texts | Notify per prescription | Same: one message and one trip per due date. |
| Fridge notes, spreadsheets | Track dates by hand | More tracking, not fewer trips. |
| Going when someone runs out | No planning | Produces the Saturday-night emergency. |
| Asking for "synchronization" | Pharmacy aligns refills | Works, but most people don't know it exists or what to ask for. This is the gap Muster fills. |

## The insight
Most people assume running out of medication is a **remembering** problem. It's a **calendar arithmetic** problem: fill dates that started out of step stay out of step. Many pharmacies already offer the remedy, **medication synchronization** within an Appointment-Based Model (one pickup day a month, reached by one-time short fills), but the patient generally has to ask. Asking is far easier with the exact short fills already worked out.

## Why now, and why software
The calculation is easy for a computer and tedious for a person: for every candidate day, compute each bottle's bridge quantity, respect closed days, early-refill limits and bottles that can't be split, then compare trip counts. A caregiver can't reasonably do that at the counter. A one-page plan they bring with them turns a long conversation into a short one.

## Evidence and its limits
- Medication synchronization and the Appointment-Based Model are established pharmacy practices, described by the American Pharmacists Association (APhA) and by pharmacy suppliers such as McKesson ("Med Sync 101").
- Medicare Part D plans must apply a daily cost-sharing rate to solid oral doses dispensed for less than a month's supply (42 CFR 423.153(b)(4)), so short fills don't automatically cost a full copay. Several states have similar rules for commercial plans (for example New York Insurance Law §3224-d).
- Published evidence links medication synchronization to higher adherence, but evidence on clinical outcomes is mixed. **Muster claims fewer trips, not better health outcomes.**
- **Not yet validated with real caregivers or pharmacists.** The household in the demo is fictional. Validating the need and the card format with both groups is the most important next step.

## Requirements derived from the need

**Must**
1. Enter a bottle in under a minute from what's printed on the label.
2. Show the current scatter of trips, then the aligned plan, visibly and immediately.
3. Produce exact short-fill quantities (tablets and days) and the repeating pickup day.
4. Never schedule a trip on a day the pharmacy is closed.
5. Refuse to sync what shouldn't be synced (controlled substances, non-countable forms), and say why.
6. Never change or suggest changing a dose; always defer to the pharmacist.
7. Produce something to hand over: a printable card.
8. Keep health data on the device; no account.

**Should**
- Use a same-weekday (4-week) cycle when the user prefers a fixed weekday.
- Estimate short-fill copays honestly, labelled as estimates.
- Be legible for older readers: large type, high contrast, a low-vision typeface.

**Won't (for now)**
- Reminders, pharmacy or insurer integrations, multi-person households, drug-interaction checks.
