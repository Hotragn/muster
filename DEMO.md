# DEMO: Muster

## Recorded video (ready to upload)
`video/out/muster-demo.mp4`: 1:56, 1920×1080, captions burned in, narration by macOS text-to-speech (voice "Samantha"). Footage is the real app driven by `scripts/record-demo.mjs` in headless Chrome. The cursor, click rings, captions and the title/end cards are drawn on top for viewers; they are not part of the app. The print dialog can't appear in headless Chrome, so the card scene shows the same card on screen (`card=1` preview).

Also produced:
- `video/out/muster-demo-silent.mp4`: same video, captions, no voice. Use it to record your own narration.
- `video/out/narration.txt`: every line with its start time and length.

**Your own voice (recommended if you have 15 minutes):** open `muster-demo-silent.mp4` in iMovie, or QuickTime → File → New Audio Recording, and read `narration.txt` line by line at each timestamp. Then drop the audio under the video. A human voice is warmer; the captions already match.

**Regenerate** (for example after changing the app or the wording in the `scenes` list): `npm start`, then `node scripts/record-demo.mjs`. Optional: `VOICE=Shelley RATE=170 node scripts/record-demo.mjs`. Each run takes about 2.5 minutes.

**On Devpost, say:** "Narration is computer-generated (macOS text-to-speech); the footage is a scripted recording of the real app." (Skip this if you re-voice it.)

---

# Live-recording script (if you'd rather record it yourself, about 2:40)

## Setup before recording
1. `npm install && npm start`
2. Browser at 1280×800 or larger, light mode, zoom 100%. Close other tabs.
3. Open **http://localhost:4173/app?example=1&today=2026-10-26**. The fixed `today` keeps every number and date below identical. If you reload with `example=1`, the example resets.
4. Have a second tab ready on http://localhost:4173/ (landing) for the close.
5. Rehearse once: the line-up animation lasts about 0.7 s.

## Shot list and narration (read word for word)

### Scene 1: the before (0:00–0:22)
**On screen:** planner, before state. Slowly move the cursor down the bottle list, then across the timeline rows.
> "Here's an example household: one dad, seven prescriptions. Every one was filled on a different day, so every one runs out on a different day. Muster puts them on a timeline. Each dot is a trip to the pharmacy. That's nineteen trips in the next ninety days. Reminders don't fix this. The dates are out of step."

**Point at:** the big **19**, then the "Trips" row of black ticks.

### Scene 2: the wow (0:22–1:20)
**Action:** click **Line them up**. Hold still for two seconds while the dots slide onto the amber lines and the counter goes to **19 → 6**.
> "One press. Muster tried every possible pickup day, skipped Sundays when the pharmacy's closed, and found the one with the fewest trips. Nineteen becomes six, and that includes getting there. After that, it's one trip every thirty days instead of six."

**Point at:** the teal line "Then 1 trip every 30 days instead of 6."
**Action:** scroll to the trip list.
> "Here's how it gets there. Trip one, Friday: a short fill of twenty-eight metformin and nine lisinopril, just enough to reach the next pickup day. On the thirteenth, the levothyroxine is refilled a day early so it joins the others. From Saturday, December 12th, everything comes together."

**Action:** click **Print the pharmacist card**. The print preview shows one page.
> "Pharmacies already do this. It's called medication synchronization, but you have to ask, with numbers. This card is the ask: the pickup day, every short fill in tablets, and the sentence to say at the counter."

Close the print dialog.

### Scene 3: depth that proves it's real (1:20–2:20)
**Action:** scroll to "Set aside".
> "It won't split what shouldn't be split. Tramadol is a controlled substance, so it's set aside with the reason, and the pharmacist decides."

**Action:** click the **Lisinopril** card. Change *Filled on* to **10/20/2026**. Save.
> "Change a date and the whole plan recomputes."

**Action:** click **4 weeks (same weekday)**.
> "On a thirty-day cycle the weekday drifts. Four weeks keeps the same day every time, and Muster tells you to ask for twenty-eight-day fills."

**Action:** expand **How Muster worked this out**.
> "Every number shows its working: run-out day is fill date plus days' supply. Copays use a daily rate, which Medicare Part D requires for short fills of tablets. And it never touches a dose."

### Scene 4: close (2:20–2:40)
**Action:** switch to the landing tab; scroll slowly past "Before and after".
> "No account, nothing leaves the browser. Muster: all the bottles, one pickup day. Built for everyone who's become their parent's pharmacy runner."

## Thumbnail suggestion
Use `public/brand/social-card.png` (1200×630): the amber muster line with dots against it, "All the bottles. One pickup day.", and "19 pharmacy trips → 6 in 90 days".

## If something fails on camera
- **Animation didn't play / page looks stale:** reload `…/app?example=1&today=2026-10-26` and click again (the example resets on load).
- **Print dialog won't open:** open `…/app?example=1&today=2026-10-26&card=1`, an on-screen preview of the same card.
- **Server not running:** `npm start` again; nothing else is needed (no network).
- **Edits went wrong mid-take:** reload the example URL; it resets everything.
- **Worst case:** narrate over `public/shots/planner-before.png`, `planner-after.png` and `card.png`; they are real captures of the same flow.
