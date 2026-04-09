# CHANGELOG.md
> Weekly iteration log. Updated together at end of each week.
> Last updated: 2026-04-08

---

## ENTRY FORMAT

## Week of YYYY-MM-DD — [Project]

### Changed
- [What changed and why]

### Skipped
- [What was planned but not done, and why]

### Next
- [What's coming next week]

---

## LOG

### Week of 2026-04-07 — Points Advisor v0.1

#### Changed
- Built full .md process system — ROUTING.md, DECISIONS.md, CHANGELOG.md
- Logged process decisions in DECISIONS.md (SYS-001 through SYS-003)
- Fixed 12,500 midpoint leaking into Claude explanations — dynamic entries now send `points_range[0]` to Claude instead of `points_required`
- Fixed explanation highlight bleeding outside its container (`overflow-hidden`)
- Added BA Avios entries for Miami and Washington DC to seed.json
- Updated LA United entry range to `[12000, 15000]` — more accurate for ORD→LAX
- Built 4-script multi-agent QA system (`test-scenarios.mjs`, `agent-runner.mjs`, `manager.mjs`, `test-agents.mjs`)
- Added `npm run test:agents` script

#### Skipped
- Full end-to-end test run of `test:agents` — requires dev server + API key in same terminal session

#### Next
- Run `npm run test:agents` against live app and address any failures
- Continue outstanding v0.1 tasks (API route tests, form components, results page hardening)
