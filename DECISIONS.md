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
