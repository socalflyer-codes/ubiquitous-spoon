# DECISIONS.md
> Log of decisions that would confuse a future me.
> Last updated: 2026-04-08

---

## HOW THIS FILE WORKS

- **Triggered by:** Anything that would confuse a future me
- **Each entry captures:** What we decided + why + what we rejected + how to revisit
- **Written:** Notes inline during session, formalised at end of session
- **Ordering:** Grouped by concern, then chronological
- **If reversed:** Old entry marked [SUPERSEDED], new entry logged with link back

---

## ENTRY FORMAT

### [ID] Title
- **Date:** YYYY-MM-DD
- **Status:** Active | Superseded by [ID]
- **Context:** Why this decision needed to be made
- **Decision:** What we chose
- **Rejected alternatives:** What we didn't choose
- **Reason:** Why we chose this
- **How to revisit:** What would need to be true to reopen this

---

## SYSTEM

## POINTS ADVISOR v0.1

### [ADV-001] BA Avios beats United for short East Coast routes
- **Date:** 2026-04-08
- **Status:** Active
- **Context:** NYC → Washington DC showed only United in results despite BA Avios being cheaper for this route
- **Decision:** Added BA Avios seed entry for Washington DC with `points_range: [7500, 17500]`
- **Rejected alternatives:** Leaving United as the only option
- **Reason:** NYC→DC is ~215 miles, falling in BA's 0–650 mile band at 7,500 Avios — cheaper than United's 10,000 floor. Verified against BA distance-based award chart.
- **How to revisit:** If BA changes its distance bands or discontinues AA metal redemptions

### [ADV-002] United LAX floor raised from 10,000 to 12,000
- **Date:** 2026-04-08
- **Status:** Active
- **Context:** Seed entry for United ORD→LAX had `points_range: [10000, 15000]`. Web research showed 10k is achievable only on short domestic routes, not transcontinental.
- **Decision:** Updated to `points_range: [12000, 15000]`, midpoint 13,500
- **Rejected alternatives:** Keeping 10,000 as the floor
- **Reason:** ORD→LAX is a ~1,750 mile high-demand corridor. 10k floor was misleading — saver seats on this route typically price at 13,000–15,000. Sources: 10xTravel, AwardFares.
- **How to revisit:** If United restructures domestic dynamic pricing or availability improves significantly

### [ADV-003] Midpoint scrubbed server-side, not in seed data
- **Date:** 2026-04-08
- **Status:** Active
- **Context:** Claude was citing "12,500" (the midpoint stored in `points_required`) in explanations for dynamic entries, even though the prompt said not to
- **Decision:** API route replaces `points_required` with `points_range[0]` before sending entries to Claude
- **Rejected alternatives:** Removing `points_required` from seed entirely; fixing via prompt instruction alone
- **Reason:** Claude sees the data and references it regardless of prompt instructions. Removing the midpoint from what Claude receives is the only reliable fix. `points_required` is kept in seed as the midpoint for internal reference.
- **How to revisit:** If seed schema changes or a future Claude model reliably follows the instruction

### [ADV-004] QA manager validates via Claude, not deterministic code
- **Date:** 2026-04-08
- **Status:** Active
- **Context:** Deciding how to validate explanation quality, ranking, and program naming after scraping the live app
- **Decision:** Single Claude manager call receives all scraped results + seed ground truth and evaluates against VALIDATION_RULES
- **Rejected alternatives:** Regex/string matching on explanation text; hardcoded assertion logic
- **Reason:** Explanation quality rules (sentence count, correct program named, no fabricated numbers) require judgment that regex can't reliably provide. Claude can reason about whether "7,500 Avios" matches the seed floor and whether the right program is named.
- **How to revisit:** If manager produces too many false positives/negatives — move specific rules to deterministic checks

### [ADV-005] 3 locked + 2 random scenarios per QA run
- **Date:** 2026-04-08
- **Status:** Active
- **Context:** How many test scenarios to run and how to balance reproducibility vs coverage
- **Decision:** 3 locked cases always run (known regression scenarios), 2 random cases drawn from the full origin × destination pool
- **Rejected alternatives:** All random (non-reproducible); all locked (no coverage growth); more than 5 total (cost/time)
- **Reason:** Locked cases protect known regressions. Random cases grow coverage over time without manual effort. 5 total keeps cost and runtime reasonable — 5 Playwright sessions + 1 Claude manager call per run.
- **How to revisit:** Increase random count if regressions keep appearing in untested routes

---

## SYSTEM

### [SYS-001] Granular .md files over single SPEC.md
- **Date:** 2026-04-08
- **Status:** Active
- **Context:** How to structure project documentation for Claude sessions
- **Decision:** Separate granular .md files per concern
- **Rejected alternatives:** Single SPEC.md
- **Reason:** Precise file loading per task type reduces token usage
- **How to revisit:** If managing files becomes more overhead than token savings justify

### [SYS-002] ROUTING.md as master routing file
- **Date:** 2026-04-08
- **Status:** Active
- **Context:** How Claude knows which files to load without being told each session
- **Decision:** ROUTING.md always read first, contains routing table and session protocols
- **Rejected alternatives:** User specifies files manually; Claude infers from context
- **Reason:** Removes cognitive load, ensures consistency, minimises missed context
- **How to revisit:** If ROUTING.md becomes too large to paste efficiently

### [SYS-003] Decision logging — note live, formalise at end of session
- **Date:** 2026-04-08
- **Status:** Active
- **Context:** Balance capturing decisions accurately vs token efficiency
- **Decision:** Call out decisions inline during session, formalise at end in one pass
- **Rejected alternatives:** Log live during build; log only at end; log only weekly
- **Reason:** Conversation thread is a free scratchpad — no mid-session token cost
- **How to revisit:** If end-of-session formalisation consistently takes too long
