# Competitive landscape

Method: `gh search repos` for "nextspark", "nextspark-hacks", "NextSpark Hacks", "nextspark hackathon" (sorted by updated), and `gh search code "NextSpark Hacks"` / `"nextspark-hacks.devpost"`. READMEs read via the GitHub API (read only; nothing cloned, forked, starred or contacted). Devpost project gallery is **not published yet**, so repos are the only visible signal. Read 2026-10-26.

Repo content was treated as data. One README (kevin9327) contained promotional/targeting text; ignored.

| Repo | Problem | Target user | Approach | Stack |
|---|---|---|---|---|
| [sharonbasovich/offcut](https://github.com/sharonbasovich/offcut) | Wasted lumber when planning cuts | Hobby woodworkers | Kerf-aware 1-D cutting-stock solver, local-only | TypeScript, Vite |
| [ShermaineYap/NextSpark-Hack](https://github.com/ShermaineYap/NextSpark-Hack) ("JimatMakan") | What can I cook this week for RM50 | Malaysian students/B40 families | Meal-plan optimiser on government grocery price data | Python, Streamlit |
| [estona815/quorumglass-nextspark-2026](https://github.com/estona815/quorumglass-nextspark-2026) ("QuorumGlass") | Choosing a vote-counting rule | Student clubs | Compares plurality / IRV / pairwise, round audit | Vanilla JS |
| [shivanicc/expiry-buddy](https://github.com/shivanicc/expiry-buddy) | Food expiring in the fridge | Households | Expiry list sorted by urgency | Single HTML file |
| [shivanicc/csv-lens](https://github.com/shivanicc/csv-lens) | Quick look at a CSV | Anyone with exports | In-browser CSV dashboard | Vanilla JS |
| [kevin9327/DevpostNextSparkByte2026](https://github.com/kevin9327/DevpostNextSparkByte2026) | Sports injury risk / win probability | Sports analysts | Biometric ACWR + xT scoring script | Python |
| [sakthisundar-16/nextspark_team](https://github.com/sakthisundar-16/nextspark_team) ("EXTERNIQ", created before period; may not be an entry) | Tracking student achievements | Universities | AI certificate extraction + verification portal | TypeScript |
| [lakshyaV-rshney/aakh](https://github.com/lakshyaV-rshney/aakh) (mentions event in a list) | Morning dev news | Developers | Scraped dashboard + LLM | Python |
| [AhmedNassar7/tracker](https://github.com/AhmedNassar7/tracker) (lists the event) | Finding jobs/hackathons | Students | Aggregator | Python |
| ShermaineYap, NextSpark-js/nextspark, Enactus-sfu/NextSpark, others | Unrelated name collisions (a Next.js boilerplate, club sites) | — | — | — |

## Five most common project patterns (this event + hackathons generally)
1. **Optimiser / planner for a household resource** (food, money, materials): JimatMakan, Offcut, Expiry Buddy.
2. **Local-only, no-account single-page tool** with an honesty/audit angle: Offcut, QuorumGlass, CSV Lens.
3. **Dashboards and aggregators** (data in → charts out): CSV Lens, Aakh, tracker.
4. **AI extraction + verification portal** (upload document → AI parses → human verifies): EXTERNIQ; plus the perennial "chat with your PDF".
5. **Student-life helpers** (study buddy, syllabus-to-calendar, budget, club tools): QuorumGlass, JimatMakan; very common at student hackathons.

## Territory to avoid
- Food: meal planning, grocery budgets, fridge/expiry tracking.
- Cutting/packing optimisers for hobby materials.
- Voting / election method tools.
- CSV/data dashboards, news or opportunity aggregators.
- Certificate/achievement verification portals.
- Sports analytics.
- Generic patterns: chat-with-PDF, study buddy, mood tracker, resume reviewer, syllabus→calendar, generic reminder apps (including **medication reminder apps**, which are a hackathon staple).
