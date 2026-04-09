# ARCHITECTURE.md
> Technical decisions, stack, data flow, and patterns.
> Last updated: 2026-04-08

---

## STACK

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2.2 (App Router) | Server components by default |
| Language | TypeScript 5 | Strict mode |
| Styling | Tailwind CSS 4 | No inline styles |
| Data | Static JSON (`data/seed.json`) | No live API for v0.1 |
| AI | Claude API (`claude-sonnet-4-6`) | Server-side only via API route |
| Testing | Vitest 4 + React Testing Library + Playwright | Unit + E2E |
| Deployment | TBD | |
| Version control | Git (worktrees) | Active work in `.worktrees/points-advisor-v0.1/` |

---

## PROJECT STRUCTURE

```
points-advisor/
  app/
    layout.tsx
    page.tsx                   # input form (client component)
    results/page.tsx           # results display (client component)
    api/recommend/route.ts     # POST handler — only place Claude is called
  components/
    BalanceInput.tsx
    DestinationInput.tsx
    OriginInput.tsx
    ResultCard.tsx
    ResultsSection.tsx
  lib/
    claude.ts                  # Anthropic client singleton
    filter.ts                  # filterByPrograms() — pre-filters seed before Claude
    prompt.ts                  # buildSystemPrompt() + buildUserPrompt()
  data/
    seed.json                  # curated redemption dataset
    transfer-bonuses.json      # active transfer bonus data
  types/
    index.ts                   # all shared types — never duplicate inline
  scripts/
    refresh-bonuses.mjs        # scrapes + updates transfer-bonuses.json
    test-agents.mjs            # QA entry point — runs 5 scenarios in parallel
    agent-runner.mjs           # single Playwright session per scenario
    manager.mjs                # Claude manager: validates scraped results
    test-scenarios.mjs         # LOCKED_CASES, VALIDATION_RULES, RANDOM_POOL
  __tests__/
```

---

## DATA FLOW

```
User Input (balance, origin, destinations)
    ↓
POST /api/recommend
    ↓
filterByPrograms() — seed.json filtered to user's programs (~10–40 entries)
    ↓
Reachability annotated server-side (_reachable flag, points_required → floor for dynamic entries)
    ↓
Claude API (claude-sonnet-4-6, server-side)
    ↓
dream_destinations reachability overridden server-side (Claude's math not trusted)
    ↓
Transfer bonuses attached
    ↓
JSON → sessionStorage → results/page.tsx
```

- No database
- No auth
- State passed via sessionStorage between form and results pages
- Claude API key never exposed client-side

---

## CLAUDE API USAGE

- **Model:** `claude-sonnet-4-6`
- **Pattern:** Pre-filtered seed entries + user balances → structured JSON response
- **Max tokens:** 8096
- **Error handling:** 3 retries on 529 (overloaded), user-friendly error state
- **No streaming**
- **Manager (QA only):** `claude-sonnet-4-6`, single call per test run, validates scraped results against seed ground truth

---

## KEY ARCHITECTURAL DECISIONS

- **Pre-filter before Claude:** Full seed.json is ~27k tokens. `filterByPrograms()` reduces to ~10–40 relevant entries before the Claude call. Never send full seed to Claude.
- **Server-side reachability:** Claude is not trusted to compute affordability. The API route annotates `_reachable` and overrides `dream_destinations.gap` after Claude responds.
- **Dynamic entry floor scrubbing:** `points_required` on dynamic entries is replaced with `points_range[0]` before sending to Claude, so Claude never sees or references the midpoint in explanations.
- **Single types file:** All types defined in `types/index.ts`. Never duplicated inline.

---

## PATTERNS & CONVENTIONS

- Server components by default; `'use client'` only where needed
- All types imported from `@/types` — never defined inline
- `@/` resolves to project root (tsconfig path alias)
- Program names normalised via `ALIASES` map in `lib/filter.ts`
- Scripts use `.mjs` ESM format with `createRequire` for JSON imports

---

## CONSTRAINTS

- Never send full `seed.json` to Claude — always pre-filter
- Never define types outside `types/index.ts`
- Never expose `ANTHROPIC_API_KEY` client-side
- No auth, no database for v0.1

---

## OPEN TECHNICAL QUESTIONS

| Question | Raised | Resolved |
|---|---|---|
| Deployment target | 2026-04-08 | No |
| Safe API key handling if app goes public | 2026-04-08 | No — API route already server-side, but needs rate limiting |
