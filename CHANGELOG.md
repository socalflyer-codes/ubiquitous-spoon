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

### Week of 2026-04-07 — Points Advisor v0.1 + Process System

#### Changed

**App fixes:**
- Fixed 12,500 midpoint leaking into Claude explanations — dynamic entries now send `points_range[0]` to Claude instead of `points_required` (`app/api/recommend/route.ts`)
- Fixed explanation highlight bleeding outside its container — added `overflow-hidden` to blue box (`app/results/page.tsx`)
- Added BA Avios entries for Washington DC (`points_range: [7500, 17500]`) and Miami (`points_range: [10000, 17500]`) to `seed.json`
- Updated United LAX entry range from `[10000, 15000]` to `[12000, 15000]` — ORD→LAX is a high-demand corridor, 10k floor was misleading
- Scrubbed midpoint from dynamic entries before sending to Claude — `points_required` replaced with `points_range[0]` in API route annotation step

**QA system:**
- Built 4-script multi-agent QA system: `test-scenarios.mjs`, `agent-runner.mjs`, `manager.mjs`, `test-agents.mjs`
- 3 locked test cases covering competing programs, dynamic range floor, multi-destination ordering
- 2 random cases per run drawn from supported origins × destinations pool
- 5 validation rules covering ranking, explanation accuracy, sentence count, program naming, floor vs midpoint
- Manager uses `claude-sonnet-4-6` to validate scraped Playwright output against seed ground truth
- Added `npm run test:agents` script

**Process system:**
- Built full `.md` documentation system: `ROUTING.md`, `DECISIONS.md`, `CHANGELOG.md`, `PROMPTS.md`, `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `COMPONENTS.md`
- `ROUTING.md` updated with session start/end protocols, ambiguity protocol, routing table with file load rules per task type
- `ARCHITECTURE.md` updated to reflect actual stack (Next.js 16, TypeScript, Tailwind 4, server-side Claude, worktree structure)
- `DESIGN.md` updated to reflect actual Tailwind classes and component patterns in use
- `COMPONENTS.md` populated with all 5 built components (ResultCard, ResultsSection, BalanceInput, DestinationInput, OriginInput)
- `DECISIONS.md` populated with SYS-001 through SYS-003 (process decisions)
- All `.md` files committed and pushed to GitHub
- `.gitignore` updated to exclude `.claude/`, `.playwright-mcp/`, `adk-samples/`

#### Skipped
- Full end-to-end test run of `test:agents` — requires dev server + `ANTHROPIC_API_KEY` in same terminal session
- Vitest unit tests for route.ts midpoint-scrubbing change

#### Next
- Run `npm run test:agents` against live app and address any failures
- Add Vitest test covering dynamic entry floor substitution in `app/api/recommend/route.ts`
- Continue outstanding v0.1 tasks if any remain (check `docs/superpowers/plans/2026-04-06-points-advisor-v0.1.md`)
