# Project: Points Redemption Advisor

A web app that helps loyalty program members figure out what to do with their points. Users enter balances and dream destinations; Claude returns ranked redemption ideas.

**Target user:** Casual to intermediate points collectors who have balances but don't know how to maximize them.

---

## Current Status

**v0.1 — In progress (active worktree: `.worktrees/points-advisor-v0.1/`)**

**What exists:**
- `app/` — Next.js App Router pages (form + results page built and functional)
- `components/` — ResultCard, ResultsSection, BalanceInput, DestinationInput, OriginInput
- `lib/` — Claude client, prompt builder, filter (pre-filters seed before Claude call)
- `data/seed.json` — 200+ curated redemptions including BA Avios entries for DC and Miami
- `data/transfer-bonuses.json` — active transfer bonus data
- `types/index.ts` — shared TypeScript types
- `__tests__/` — Vitest + React Testing Library tests
- `scripts/` — `refresh-bonuses.mjs` + full QA agent system (`test-agents.mjs`, `agent-runner.mjs`, `manager.mjs`, `test-scenarios.mjs`)

**What's not done yet:**
- `npm run test:agents` not yet run end-to-end (requires dev server + ANTHROPIC_API_KEY)
- Vitest test for dynamic entry floor substitution in `route.ts`
- Review outstanding tasks in `docs/superpowers/plans/2026-04-06-points-advisor-v0.1.md`

---

## Milestones

| Version | Goal | Status |
|---------|------|--------|
| v0.1 | Validate core UX with seed data, no crawler | In progress |
| v1 | Replace seed with live crawled data, add 3rd results section | Not started |
| v2 | Transfer partner reasoning, user accounts | Not started |

---

## Architecture

**Stack:** Next.js 16.2.2 (App Router), TypeScript 5, Tailwind CSS 4, Anthropic SDK (`claude-sonnet-4-6`), Vitest 4, Playwright

**Three concerns:**
1. **Frontend** — Input form (balances + dream destinations) → results page
2. **Claude Agent** — Server-side API route (`/api/recommend`) — receives balances + seed data, returns ranked recommendations
3. **Crawler** — Playwright-based, v1 only. Not in scope for v0.1.

**Data:** Local JSON files only. No database, no auth, no persistent user state.

---

## Key File Locations

| What | Where |
|------|-------|
| Active code | `.worktrees/points-advisor-v0.1/points-advisor/` |
| Design spec | `docs/superpowers/specs/2026-04-06-points-redemption-advisor-design.md` |
| Implementation plan | `docs/superpowers/plans/2026-04-06-points-advisor-v0.1.md` |
| Seed data | `.worktrees/points-advisor-v0.1/points-advisor/data/seed.json` |
| Claude client | `.worktrees/points-advisor-v0.1/points-advisor/lib/claude.ts` |
| Prompt builder | `.worktrees/points-advisor-v0.1/points-advisor/lib/prompt.ts` |
| API route | `.worktrees/points-advisor-v0.1/points-advisor/app/api/recommend/route.ts` |
| Types | `.worktrees/points-advisor-v0.1/points-advisor/types/index.ts` |
| Loyalty program notes | `*.md` files in project root (aeroplan.md, chaseUR.md, etc.) |
| QA agent plan | `docs/superpowers/plans/2026-04-08-test-agents.md` |
| QA scripts | `.worktrees/points-advisor-v0.1/points-advisor/scripts/` |
| Routing rules | `ROUTING.md` |

---

## Loyalty Program Domain Files

Root-level `.md` files contain domain knowledge for each program:
`aadvantage.md`, `aeroplan.md`, `alaska.md`, `amex.md`, `avios.md`, `capitalone.md`, `chaseUR.md`, `citi.md`, `delta.md`, `flyingblue.md`, `hilton.md`, `hyatt.md`, `ihg.md`, `krisflyer.md`, `lifemiles.md`, `marriott.md`, `qantas.md`, `turkish.md`, `united.md`, `virgin.md`

Load these only when working on prompt logic, seed data, or program-specific reasoning.

---

## v0.1 Results Page

- **You Can Go Here Now** — redemptions within current balances, ranked by value
- **Your Dream Destinations** — each listed destination shown as reachable or with point gap

Dynamic program entries show a range + disclaimer. No fixed chart assumption.

---

## Out of Scope for v0.1

- Crawler (replaced by seed data)
- "You Might Not Have Considered" section (v1)
- Transfer partner gap analysis (v2)
- User accounts, saved balances, real-time availability
