# DECISIONS

| # | Persona | Decision | Why |
|---|---|---|---|
| 1 | SCOUT | Team = solo (the human), no stated constraints beyond the brief; no paid services. | Brief fields were placeholders; safest assumption. |
| 2 | SCOUT | Use Overview-page criteria wording as the scoring rubric. | It is the fuller definition; Rules page lists the same four. |
| 3 | SKEPTICAL JUDGE | Build the caregiver medication-sync planner; OPT clock is runner-up. | Scored 24/30 vs 18; OPT failed red team on originality and legal risk. |
| 4 | INVENTOR | Do not use sponsor tech (Anakin scraping, Adaption model training). | Neither strengthens a deterministic, offline, privacy-sensitive planner; using them would be decoration. No sponsor prize track exists. |
| 5 | INVENTOR | Bottle-photo label reading (idea 10) is a stretch goal only. | Demo must run offline; core value is the scheduling, not extraction. |
| 6 | PRODUCT DIRECTOR | No framework, no build step; vanilla ES modules + zero-dep Node server. | Smallest thing that works; nothing to break on demo day. |
| 7 | PRODUCT DIRECTOR | Optimise for fewest trips in 90 days, then fewest short-fill days. | Trips are the user's pain; with daily-rate copays, short-fill days cost little extra. |
| 8 | NAMING STRATEGIST | Name "Muster", tagline "All the bottles. One pickup day." | No collision in pharmacy space; the meaning is the product. |
| 9 | BRAND DESIGNER | Atkinson Hyperlegible for display and body, IBM Plex Mono for label data. | Hyperlegible was built for low-vision readers (older patients); mono echoes printed Rx labels. Both OFL. |
| 10 | BRAND DESIGNER | Wordmark uses live text in inline SVG rather than outlined paths. | No font-to-path tool installed; the font is vendored and loaded on every page that shows it. |
| 11 | PRODUCER | Feature freeze at 05:5x EDT; all stretch goals cut. | Golden path complete; remaining time goes to verification and packaging. |
| 12 | STORYTELLER | Demo narration uses Kokoro-82M (Apache-2.0) via kokoro-onnx (MIT), voice af_heart. | Most-used open TTS model with permissive weights; Coqui XTTS is non-commercial and unmaintained, the original Piper repo is archived. |
