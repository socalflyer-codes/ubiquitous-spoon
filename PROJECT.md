# Project: Points Redemption Advisor

A web app that helps loyalty program members figure out what to do with their points. Users enter balances and dream destinations; Claude returns ranked redemption ideas.

**Target user:** Casual to intermediate points collectors who have balances but don't know how to maximize them.

---

## Current Status

**v0.1 — In progress (active worktree: `.worktrees/points-advisor-v0.1/`)**

Implementation underway. Scaffold is complete with full file structure, tests directory, and dependencies installed.

**What exists:**
- `points-advisor/app/` — Next.js App Router pages
- `points-advisor/components/` — UI components
- `points-advisor/lib/` — Claude client + prompt builder
- `points-advisor/data/` — seed dataset (~50 curated redemptions)
- `points-advisor/types/` — shared TypeScript types
- `points-advisor/__tests__/` — Vitest + React Testing Library tests
- `points-advisor/scripts/` — utility scripts

**What's not built yet:** [fill in as tasks complete]

---

## Milestones

| Version | Goal | Status |
|---------|------|--------|
| v0.1 | Validate core UX with seed data, no crawler | In progress |
| v1 | Replace seed with live crawled data, add 3rd results section | Not started |
| v2 | Transfer partner reasoning, user accounts | Not started |

---

## Architecture

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Anthropic SDK (`claude-sonnet-4-6`), Vitest

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
