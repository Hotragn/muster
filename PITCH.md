# PITCH: Muster

**Problem.** Someone running pharmacy errands for a parent on six or seven daily prescriptions is at the counter every few days, and a bottle still runs out on a Saturday night. Each prescription was filled on a different day, so each runs out on a different day, every month.

**Insight.** People treat running out as a memory problem and set reminders. It's calendar arithmetic: out-of-step fill dates stay out of step forever. Many pharmacies already have the fix, medication synchronization (one-time short fills that move everything onto one day), but the patient has to ask, with numbers.

**Solution.** Muster: copy the bottle labels, press **Line them up**, and get the pickup day, each short fill in tablets and days, and a printed card for the pharmacist.

**How it works.** A deterministic planner in the browser. It computes each bottle's run-out day and tries every candidate pickup day in the next cycle, skipping days the pharmacy is closed. For each day it computes short fills that land exactly on it, uses early refills where a bottle is due a few days later, and merges short fills into shared trips (interval cover). It keeps the plan with the fewest trips in 90 days. Bottles that shouldn't be split (controlled substances, inhalers and other non-countable forms, mismatched supplies) are set aside with reasons. Short-fill copays are estimated at a daily rate.

**Result in the demo (example household, computed):** 19 trips in the next 90 days → 6 including the changeover; then 1 trip every 30 days instead of 6.

**How it differs from the field.** Other entries here plan meals, cut lumber, count votes, read CSVs. None touches health or caregiving. Medication apps at hackathons are almost always reminders. Muster sends no reminders: it removes the reason they exist and produces something for the pharmacist, not just the patient.

**What's next.** Test with caregivers and an independent pharmacy; read bottle labels from a photo (with every field shown for confirmation); export the pickup day as calendar events; more than one person per household.

**Honest limitations.** Not medical advice, and the pharmacist confirms. Knows only what you type. Early-refill and copay rules are rules of thumb that vary by plan. Not yet validated with real users. Data lives only in one browser.
