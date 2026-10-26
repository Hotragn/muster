# SUBMISSION: Devpost fields for Muster

**Project name:** Muster
**Tagline:** All the bottles. One pickup day.

## Inspiration / the problem
Whoever runs pharmacy errands for a parent on several daily prescriptions ends up at the counter every few days, and a bottle still runs out on a Saturday night. Each prescription was filled on a different day, so each runs out on a different day, every month. Reminder apps tell you when the next bottle is due. They can't make the bottles come due together.

## Who it helps
Family caregivers (often students and young adults) managing a parent's or grandparent's medications, and anyone on several chronic prescriptions who wants one pharmacy trip a month instead of five or six.

## What it does
You copy each bottle's label: name, how many a day, days' supply, fill date (or a pill count). Muster shows the next 90 days of pickups as dots on a timeline. Press **Line them up**: it finds the pickup day that needs the fewest trips, skipping days the pharmacy is closed. It works out the one-time short fills (in tablets and days) that land every bottle on that day, and the dots slide onto a single amber line. It lists each trip of the changeover, sets aside bottles that shouldn't be split (controlled substances, inhalers, pens, liquids) with the reason, estimates short-fill copays at a daily rate, and prints a one-page card to hand the pharmacist. Many pharmacies already offer this as "medication synchronization"; Muster gives you the numbers to ask for it. In the example household: 19 trips in the next 90 days become 6, then 1 trip every 30 days instead of 6.

## How we built it
Plain HTML, CSS and JavaScript modules: no framework, no build step, no network calls. The planner core (`public/js/muster.js`) is a set of pure functions. It computes run-out days and searches every candidate pickup day in the next cycle. For each candidate it computes short fills as `(pickup day − run-out) mod cycle`, uses early refills for bottles due just after a pickup day, and merges short fills into shared trips with a greedy interval cover. It moves trips off closed weekdays and keeps the plan with the fewest trips, then the fewest short-fill days. 15 unit tests cover the date math and rules. A headless-Chrome script drives the demo flow three times plus edge cases (48 checks). A small Node server serves it with one command. The brand (amber prescription vial, thermal-label paper, the "muster line" of dots against a bar) uses Atkinson Hyperlegible, a typeface designed for low-vision readers, and every colour pair is checked for WCAG contrast by a script.

## Challenges we ran into
- A 30-day cycle drifts across weekdays, so the second pickup day landed on a Sunday even though the first didn't. We now move every trip, before and after, to the nearest open day, and offer a 4-week cycle that keeps the weekday fixed.
- Naive short fills meant one extra trip per bottle during the changeover. Treating each short fill as a window and merging the windows cut the transition trips.
- One of our own tests passed for the wrong reason: the brand page was serving a 404 because a folder shadowed the page, and the "no failures" check passed on an empty page. We fixed the routing and made the test count real passes.

## What we learned
- The most useful fix sometimes already exists (med sync) and the product is the missing step: turning it into numbers a person can bring to the counter.
- Deleting the problem (out-of-step dates) beats managing it (reminders).
- Health-adjacent tools need to show their working and say plainly what they won't do.

## Accomplishments
A working planner that turns real label data into a pharmacist-ready plan, an animation that makes the before and after visible in one second, and an honest set of rules for what shouldn't be synced.

## What's next
Test with caregivers and an independent pharmacy; read labels from a photo (every field confirmed by the user); calendar export of the pickup day; several people per household.

## Built with
HTML, CSS, JavaScript (ES modules), Node.js (static server, `node:test`), ESLint, headless Google Chrome (screenshots and end-to-end checks), Atkinson Hyperlegible and IBM Plex Mono fonts (SIL OFL 1.1).

## External resources
- American Pharmacists Association, Appointment-Based Model (medication synchronization)
- McKesson, "Med Sync 101"
- eCFR, 42 CFR 423.153(b)(4): Medicare Part D daily cost-sharing for less than a month's supply
- Fonts: Atkinson Hyperlegible (Braille Institute), IBM Plex Mono (IBM)

## AI assistance
Built with Claude Code (Anthropic). The AI wrote most of the code, design tokens, logo SVG and copy under the entrant's direction, and researched the rules and landscape. The entrant chose the event, directed the work, and reviewed the result. *(Edit this to describe your own contributions accurately.)* The product itself uses no AI. Details: AI_USAGE.md.

## Incomplete or simulated (state this on Devpost)
- The example household is fictional and labelled "Example (fictional)" in the app.
- No pharmacy, insurer or doctor integration; it only knows what you type.
- Early-refill and copay rules are rules of thumb; plans differ.
- Not yet tested with real caregivers or pharmacists.
- Planned, not built: label photo reading, calendar export, multi-person households.

## Screenshots (upload these)
1. `public/shots/planner-after.png`: core flow, lined up (hero)
2. `public/shots/planner-before.png`: before
3. `public/shots/card.png`: pharmacist card
4. `public/shots/planner-after-full.png`: trip-by-trip plan
5. `public/shots/editor.png`: adding a bottle
6. `public/shots/brand.png`: brand board
7. `public/shots/landing.png`: landing page
8. `public/shots/planner-mobile.jpg`: phone layout
9. `public/brand/social-card.png`: thumbnail / cover image

## Demo video checklist
- [ ] Upload `video/out/muster-demo.mp4` (1:56), or your re-voiced version (see DEMO.md)
- [ ] If you use the generated voice, add to the description: "Narration is computer-generated (macOS text-to-speech); footage is a scripted recording of the real app."
- [ ] 1–3 minutes (recorded cut is 1:56; live script is about 2:40)
- [ ] Shows: before (19), Line them up (19 → 6, "1 trip every 30 days instead of 6"), trip list, pharmacist card, set-aside bottle, editing a date, 4-week cycle, "How Muster worked this out"
- [ ] Says out loud that the example is fictional and that the pharmacist confirms the plan
- [ ] Uploaded as public or unlisted on YouTube/Vimeo, viewable without requesting access; link tested in a private window

## Links
- **Source code:** `https://github.com/<you>/muster` *(create, push, make public, then paste here)*
- **Live demo (optional):** none yet. Any static host serving `public/` works (GitHub Pages: serve `public/`, open `app.html?example=1`).
