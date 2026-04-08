# Points Advisor — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 16 Warning
This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**App Router only. No `pages/` directory. Server components are default. Client components require `'use client'` at the top of the file — forgetting it causes hydration errors.**
<!-- END:nextjs-agent-rules -->

---

## Stack
- Next.js 16.2.2 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4
- Vitest 4 + React Testing Library 16 (jsdom)
- Anthropic SDK 0.82 (`claude-sonnet-4-6`)
- Node 20+

## Project Layout
```
app/
  layout.tsx          # root layout, no data fetching
  page.tsx            # input form ('use client')
  globals.css         # Tailwind base import only
  results/
    page.tsx          # results display ('use client', reads sessionStorage)
  api/
    recommend/
      route.ts        # POST handler — only server-side Claude call lives here
components/
  BalanceInput.tsx
  DestinationInput.tsx
  OriginInput.tsx     # city → IATA mapping, tab-to-complete
  ResultCard.tsx      # single redemption card
  ResultsSection.tsx  # section wrapper with heading
lib/
  claude.ts           # Anthropic client singleton (reads ANTHROPIC_API_KEY)
  filter.ts           # filterByPrograms() + normalizeProgram()
  prompt.ts           # buildSystemPrompt() + buildUserPrompt()
data/
  seed.json           # 206-entry redemption dataset
types/
  index.ts            # all shared types — never duplicate inline
__tests__/            # one file per source file
```

## Types (source of truth: `types/index.ts`)
Never define types inline — always import from `@/types`.

```typescript
Balance           { program: string; amount: number }
RedemptionEntry   { program, destination, region, cabin: string|null,
                    points_required, pricing_type, points_range: [number,number]|null,
                    source_url, source_site, source_geo: 'US'|'CA'|'AU'|'UK',
                    published_date, notes,
                    transferable_from: string[], verified: boolean }
RedeemableResult  { entry, matched_program, user_balance, surplus }
DreamResult       { destination, reachable, best_entry: RedemptionEntry|null,
                    matched_program: string|null, user_balance: number|null,
                    gap: number|null }
Cabin             'Economy' | 'Premium Economy' | 'Business' | 'First'
RecommendRequest  { balances, destinations, inspire?, cabins?: Cabin[], origin? }
RecommendResponse { reachable: RedeemableResult[], dream_destinations: DreamResult[], explanation: string }
```

When adding fields: update `types/index.ts` first, then update test fixtures in `__tests__/`.

## Pre-filter Architecture (critical — do not bypass)
Full seed.json is ~27k tokens. The API route pre-filters to only entries whose `program` or `transferable_from` overlaps the user's balances before calling Claude. This keeps Claude's input to ~10–40 entries.

```
POST /api/recommend
  → filterByPrograms(balances, seedData)   # lib/filter.ts
  → buildUserPrompt(balances, destinations, relevantEntries, ...)
  → Claude (claude-sonnet-4-6, max_tokens: 4096)
  → strip markdown fences → JSON.parse → NextResponse.json
```

If you add a new program to `seed.json`, add its aliases to the `ALIASES` map in `lib/filter.ts`.

## seed.json Rules
- Every entry must have `transferable_from: string[]` and `verified: boolean`
- Program names must be canonical (see ALIASES in `lib/filter.ts` for the full list)
- `points_required` on dynamic entries = midpoint; `points_range` = full range
- Never fabricate `source_url` values — verify before adding
- `verified: true` = human-checked; `verified: false` = auto-extracted, lower confidence

## Prompt Contract (`lib/prompt.ts`)
`buildSystemPrompt()` defines the exact JSON shape Claude returns. It must match `RecommendResponse` in `types/index.ts`. If either changes, update both.

Encoded rules:
- `reachable`: only entries where balance ≥ `points_required`
- Dynamic entries: use lower bound of `points_range` for reachability check
- `gap`: null if reachable OR if no matching entry found (not just if reachable)
- Explanation: dream destinations first, then reachable

Optional injections added to user message:
- `originInstruction` — when `origin` is set
- `cabinInstruction` — when `cabins` is set (flight entries only; hotels unaffected)
- `inspireInstruction` — when `inspire=true` (returns exactly 1 reachable entry, vivid explanation)

## ResultCard Props
`entry`, `matchedProgram`, `userBalance`, `gap?`, `hasProgram?` (default `true`)
- `hasProgram=false` → gray "Need: [program]" chip instead of blue
- `gap` → amber "X pts short" badge
- Dynamic entries display range (`60,000–110,000 pts`), not midpoint

## Results Page Render Order
1. Explanation (blue info box)
2. Dream Destinations section
3. You Can Go Here Now section
4. Empty state if both empty

Inspire mode skips the normal layout: single ResultCard + explanation, with a "Show all" link.

Data flows via `sessionStorage`:
- `results` → JSON stringified `RecommendResponse`
- `inspire` → `'true'` or `'false'`

## Test Fixtures
All `RedemptionEntry` fixtures must include `transferable_from: string[]` and `verified: boolean` or TypeScript will error at compile time. Minimum valid fixture:
```typescript
const entry: RedemptionEntry = {
  program: 'Aeroplan', destination: 'Japan', region: 'Asia',
  cabin: 'Business', points_required: 65000, pricing_type: 'fixed',
  points_range: null, source_url: 'https://example.com',
  source_site: 'OMAAT', source_geo: 'US', published_date: '2025-11-01',
  notes: '', transferable_from: [], verified: true,
}
```

## Commands
```bash
npm run dev        # dev server at localhost:3000
npm run test:run   # run all tests once (use this for CI / after changes)
npm test           # watch mode
npx tsc --noEmit   # type-check without building
npm run build      # production build
```

## Hard Rules
- Never commit `.env.local`
- Never send full `seed.json` to Claude — always pre-filter via `filterByPrograms()`
- Never duplicate types — import from `@/types`
- Never add unverified `source_url` values to seed data
- `@/` resolves to the project root (tsconfig path alias)
