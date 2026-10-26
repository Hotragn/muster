# BRAND — Muster

## Naming (PERSONA: THE NAMING STRATEGIST)

25 candidates:
- **Descriptive:** Pickup Day, Refill Day, One Trip, Fill Day, Same-Day Rx, Monthly Pickup, Alignday
- **Evocative (pharmacy / caregiving):** Dram, Amber, Vial, Counter, Tray, Spatula, Lineup, Errand
- **Invented:** Onefill, Vialine, Ambery, Pilgrove, Fillwell
- **Borrowed:** Muster, Unison, Tandem, Rendezvous, Abreast

Shortlist and collision search (GitHub `gh search repos`, web search, 2026-10-26):
| Name | Result |
|---|---|
| **Muster** | No pharmacy/medication product found on the web. GitHub: `facebookarchive/muster` (archived Go batching library), unrelated. Clear in this domain. |
| Pickup Day | Many trash-collection-day projects on GitHub; generic, forgettable. |
| Onefill | Several form-autofill tools named OneFill. Collides. |
| Dram | Heavy collisions (DRAM memory, whisky); needs explaining. |
| Refill Day | Too close to pharmacy refill-app vocabulary; no identity. |

**Chosen: Muster.** To muster is to gather scattered people at one point at one time, which is exactly what it does to prescriptions. One syllable-pair, says cleanly on video, and "passes muster" carries a trust connotation.

**Tagline:** "All the bottles. One pickup day." (6 words)

## Concept (PERSONA: THE BRAND DESIGNER)

Muster lives at the pharmacy counter. The palette comes from the amber prescription vial and the off-white thermal label stuck to it; the second colour is the teal ink of a pharmacist's counseling notes. Data is set in a monospace face like a printed Rx label (drug, quantity, days' supply), while everything a person reads is set in Atkinson Hyperlegible, a typeface the Braille Institute designed for low-vision readers, because the people this serves are often older or reading over someone's shoulder. Screens are composed as labels resting on a counter: off-white cards with soft corners on a warm surface.

**Signature element: the muster line.** A vertical amber rule with round dots resting against it. Scattered dots are bottles on different days; dots on the line are bottles that share a pickup day. It is the logo, the calendar's sync-day marker, the transition animation (dots slide onto the line), the section divider on the landing page, and the edge of the pharmacist card.

## Colour
Defined in `public/css/tokens.css`; checked by `node scripts/contrast.mjs` (all 34 pairs pass; rerun to see ratios).

| Role | Light | Dark | Origin |
|---|---|---|---|
| Primary (amber vial) | #A34A06 | #F2A45A | amber prescription vial |
| Primary strong | #7C3604 | #F7BF84 | |
| Primary wash | #FBE7CF | #3A2512 | |
| Accent (counseling ink) | #0F5A55 | #6CCFC3 | pharmacist's pen |
| Neutral 0 (label paper) | #FFFDF8 | #211D17 | thermal label |
| Neutral 1 (counter) | #F6F1E7 | #17140F | |
| Neutral 2 (rules) | #E7DECD | #342E25 | |
| Neutral 3 (decorative border) | #B9AC96 | #5A5143 | |
| Neutral 4 (muted text) | #6E6455 | #B3A792 | |
| Neutral 5 | #3B342B | #D9CFBE | |
| Neutral 6 (text) | #1E1A15 | #F4EEE3 | |
| Success | #22703A | #79C98F | |
| Warning | #8A5A00 on #FFF3D6 | #E9B85A on #33270F | |
| Danger | #B3261E on #FCE4E1 | #F08A80 on #3A1A16 | |

Key ratios (light): body 17.0:1, muted 5.7:1, amber text 5.8:1, button text on amber 5.8:1, focus ring 7.1:1. Dark: body 14.5:1, amber 8.2:1.

## Type
- **Atkinson Hyperlegible** (Braille Institute, SIL OFL 1.1): display and body. Regular 400, Bold 700, Italic.
- **IBM Plex Mono** (IBM, SIL OFL 1.1): label data, quantities, dates. Regular 400, SemiBold 600.
- Vendored in `public/fonts/` with their `OFL.txt`. Nothing loads from the network.
- Scale (rem): 0.8125 / 0.9375 / **1.0625 body** / 1.375 / 1.875 / 2.75 / 4. Body is 17px, larger than the usual 16, for older readers.
- Line heights: 1.1 display, 1.3 headings, 1.55 body.
- Fallbacks: `"Segoe UI", system-ui, -apple-system, sans-serif`; `ui-monospace, SFMono-Regular, Menlo, monospace`.

## Logo
- Symbol (`public/brand/symbol.svg`): amber rounded square, three label-paper dots resting against a vertical bar: the muster line. Rendered at 16, 32 and 512 px in headless Chrome and inspected; reads at 16 px as "dots + bar". Not a sparkle, brain, robot, bulb, rocket, chat bubble or wand. Closest familiar shape is a three-dot "more" menu icon; the bar and the amber tile separate it.
- Wordmark lockup: symbol + "muster" set lowercase in Atkinson Hyperlegible Bold.
- Exports: `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (180), `brand/symbol-512.png`, `brand/social-card.png` (1200×630).

## Tokens
One file: `public/css/tokens.css` — colours (light + dark), type, spacing (4px base), radii, shadows, motion (120 / 240 / 700 ms, the 700 ms one is the muster animation; all zero under reduced motion).

## Voice
1. Talk like the pharmacist who's good with families: plain, specific, kind.
2. Numbers before adjectives. Say "9 tablets", not "a small amount".
3. Never sound sure about someone's health. We plan trips; the pharmacist confirms.

| We say | We don't say |
|---|---|
| "5 trips a month become 1." | "Simplify your medication journey." |
| "Ask your pharmacist about this one." | "This medication cannot be processed." |
| "About $3.60 for 9 days. Your plan may differ." | "Save money on prescriptions!" |

Banned in all copy: revolutionize, seamless, unlock, empower, leverage, supercharge, game-changer, cutting-edge, harness, elevate, effortless, "in today's fast-paced world".

## Microcopy for the core flow
- **Empty:** "No bottles yet. Add the first one from the counter, or load the example to see how it works." Buttons: "Add a bottle" / "Load example household".
- **Adding:** field hints: "Days' supply is on the label, often 30 or 90." "Pills on hand (optional). If you count them, we'll use the count instead of the fill date."
- **Field errors:** "Enter how many a day, like 1 or 2." "That fill date is in the future." "Days' supply should be between 1 and 120."
- **Not enough to line up:** "Muster needs at least two bottles it can line up. Add another, or check the ones set aside."
- **Set aside reasons:** controlled — "Controlled substances usually can't be short-filled. Ask your pharmacist." Non-countable — "Inhalers, pens, drops and patches can't be split by the tablet. Ask if it can be aligned." Supply mismatch — "A 45-day supply won't land on a 30-day cycle. Ask for 30 or 90."
- **Primary action:** "Line them up"
- **Working:** (instant; the animation is the state) dots slide to the line.
- **Success headline:** "From {date}, one pickup every {cycle} days."
- **Counter:** "Next 90 days: {before} trips → {after}"
- **Fill rows:** "{date}: short fill {n} {units} ({days} days) so it ends on {sync}." / "Already lands on {sync}. Nothing to change."
- **Copay:** "About ${x} for {days} days (daily rate). Your plan may differ."
- **Card footer:** "Plan made with Muster from the bottle labels. Please check it against the pharmacy record before filling. Doses are unchanged."
- **Reset:** "Start over" with confirm "Remove all bottles from this browser?"
- **Privacy line:** "Everything stays in this browser. No account, nothing sent."
