# Points Redemption Advisor v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js web app where users enter loyalty point balances and dream destinations, and Claude returns ranked redemption ideas from a curated seed dataset.

**Architecture:** Next.js App Router with a server-side API route that passes user balances + seed data to Claude for reasoning. Frontend is a two-page flow: input form → results. No database, no auth, no crawler — seed data is a static JSON file.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Anthropic SDK (`claude-sonnet-4-6`), Vitest + React Testing Library

---

## File Structure

```
points-advisor/
├── app/
│   ├── layout.tsx                     # Root layout, sets font + bg
│   ├── page.tsx                       # Input form (balances + destinations)
│   ├── results/
│   │   └── page.tsx                   # Results page, reads searchParams
│   └── api/
│       └── recommend/
│           └── route.ts               # POST handler — Claude agent
├── components/
│   ├── BalanceInput.tsx               # Dynamic list of program + amount rows
│   ├── DestinationInput.tsx           # Free-text dream destinations input
│   ├── ResultCard.tsx                 # Single redemption card
│   └── ResultsSection.tsx            # Section wrapper with heading
├── lib/
│   ├── claude.ts                      # Anthropic SDK client singleton
│   └── prompt.ts                      # Builds system + user prompt for Claude
├── data/
│   └── seed.json                      # ~50 curated redemption entries
├── types/
│   └── index.ts                       # All shared TypeScript types
├── __tests__/
│   ├── prompt.test.ts                 # Unit tests for prompt builder
│   ├── route.test.ts                  # Integration tests for API route
│   ├── BalanceInput.test.tsx          # Component tests
│   ├── DestinationInput.test.tsx      # Component tests
│   ├── ResultCard.test.tsx            # Component tests
│   └── ResultsSection.test.tsx        # Component tests
├── .env.local                         # ANTHROPIC_API_KEY
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
└── package.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `points-advisor/` (entire project directory)
- Create: `points-advisor/.env.local`
- Create: `points-advisor/vitest.config.ts`

- [ ] **Step 1: Scaffold Next.js project**

Run from `SamiInternalAgents/` directory:
```bash
npx create-next-app@latest points-advisor \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --yes
cd points-advisor
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @anthropic-ai/sdk
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 5: Create .env.local**

Create `points-advisor/.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```
Replace `your_key_here` with your actual Anthropic API key.

- [ ] **Step 6: Verify project runs**

```bash
npm run dev
```
Expected: Next.js dev server starts on http://localhost:3000 with no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold points-advisor Next.js project"
```

---

## Task 2: Types and Seed Data

**Files:**
- Create: `types/index.ts`
- Create: `data/seed.json`

- [ ] **Step 1: Write the types**

Create `types/index.ts`:
```typescript
export interface Balance {
  program: string
  amount: number
}

export interface RedemptionEntry {
  program: string
  destination: string
  region: string
  cabin: string | null
  points_required: number
  pricing_type: 'fixed' | 'dynamic'
  points_range: [number, number] | null
  source_url: string
  source_site: string
  source_geo: 'US' | 'CA' | 'AU' | 'UK'
  published_date: string
  notes: string
}

export interface RedeemableResult {
  entry: RedemptionEntry
  matched_program: string
  user_balance: number
  surplus: number  // how many points left over after redemption
}

export interface DreamResult {
  destination: string
  reachable: boolean
  best_entry: RedemptionEntry | null
  matched_program: string | null
  user_balance: number | null
  gap: number | null  // null if reachable or no match found
}

export interface RecommendRequest {
  balances: Balance[]
  destinations: string[]
}

export interface RecommendResponse {
  reachable: RedeemableResult[]
  dream_destinations: DreamResult[]
  explanation: string  // Claude's overall summary paragraph
}
```

- [ ] **Step 2: Create seed data**

Create `data/seed.json` with the following entries (25 well-known sweet spots across programs and regions):

```json
[
  {
    "program": "Aeroplan",
    "destination": "Japan",
    "region": "Asia",
    "cabin": "Business",
    "points_required": 65000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://princeoftravel.com/blog/aeroplan-sweet-spots/",
    "source_site": "Prince of Travel",
    "source_geo": "CA",
    "published_date": "2025-11-01",
    "notes": "Star Alliance partners, no fuel surcharges on most carriers including ANA and Lufthansa"
  },
  {
    "program": "Aeroplan",
    "destination": "Europe",
    "region": "Europe",
    "cabin": "Business",
    "points_required": 55000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://frequentmiler.com/aeroplan-sweet-spots/",
    "source_site": "Frequent Miler",
    "source_geo": "US",
    "published_date": "2025-10-10",
    "notes": "Lufthansa, SWISS, or Turkish Business via Star Alliance. No fuel surcharges on most."
  },
  {
    "program": "Virgin Atlantic Flying Club",
    "destination": "Japan",
    "region": "Asia",
    "cabin": "Business",
    "points_required": 60000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://onemileatatime.com/virgin-atlantic-ana-sweet-spot/",
    "source_site": "OMAAT",
    "source_geo": "US",
    "published_date": "2025-12-01",
    "notes": "ANA Business Class (The Room) via Virgin Atlantic miles. No fuel surcharges. One of the best business class values available."
  },
  {
    "program": "World of Hyatt",
    "destination": "Maldives",
    "region": "Asia",
    "cabin": null,
    "points_required": 25000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://frequentmiler.com/hyatt-sweet-spots/",
    "source_site": "Frequent Miler",
    "source_geo": "US",
    "published_date": "2025-10-15",
    "notes": "Park Hyatt Maldives, Category 6, per night. Transfers 1:1 from Chase UR."
  },
  {
    "program": "World of Hyatt",
    "destination": "Costa Rica",
    "region": "Central America",
    "cabin": null,
    "points_required": 17000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://thepointsguy.com/guide/hyatt-best-redemptions/",
    "source_site": "The Points Guy",
    "source_geo": "US",
    "published_date": "2025-09-20",
    "notes": "Andaz Costa Rica, Category 4, per night. Transfers 1:1 from Chase UR."
  },
  {
    "program": "World of Hyatt",
    "destination": "Mexico",
    "region": "Mexico & Caribbean",
    "cabin": null,
    "points_required": 12000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://upgradedpoints.com/travel/hotels/hyatt/",
    "source_site": "Upgraded Points",
    "source_geo": "US",
    "published_date": "2025-08-01",
    "notes": "Multiple Category 3 properties in Cancun/Riviera Maya. Great value per night."
  },
  {
    "program": "United MileagePlus",
    "destination": "Europe",
    "region": "Europe",
    "cabin": "Business",
    "points_required": 70000,
    "pricing_type": "dynamic",
    "points_range": [60000, 110000],
    "source_url": "https://upgradedpoints.com/travel/airlines/united-mileageplus-award-chart/",
    "source_site": "Upgraded Points",
    "source_geo": "US",
    "published_date": "2025-08-10",
    "notes": "Dynamic pricing — check at booking. Star Alliance partners. Prices vary widely by carrier and date."
  },
  {
    "program": "Delta SkyMiles",
    "destination": "Europe",
    "region": "Europe",
    "cabin": "Business",
    "points_required": 85000,
    "pricing_type": "dynamic",
    "points_range": [75000, 200000],
    "source_url": "https://thepointsguy.com/guide/delta-skymiles/",
    "source_site": "The Points Guy",
    "source_geo": "US",
    "published_date": "2025-07-15",
    "notes": "Fully dynamic. Prices fluctuate significantly. Best value found off-peak on Delta metal."
  },
  {
    "program": "American AAdvantage",
    "destination": "Japan",
    "region": "Asia",
    "cabin": "Business",
    "points_required": 60000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://viewfromthewing.com/american-aadvantage-japan/",
    "source_site": "View from the Wing",
    "source_geo": "US",
    "published_date": "2025-09-05",
    "notes": "Japan Airlines Business Class. One of the best-value fixed-rate redemptions still available."
  },
  {
    "program": "American AAdvantage",
    "destination": "Europe",
    "region": "Europe",
    "cabin": "Business",
    "points_required": 57500,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://onemileatatime.com/american-aadvantage-europe/",
    "source_site": "OMAAT",
    "source_geo": "US",
    "published_date": "2025-10-20",
    "notes": "British Airways, Iberia, or Finnair Business via oneworld. Watch for fuel surcharges on BA."
  },
  {
    "program": "Chase UR via Hyatt",
    "destination": "Southeast Asia",
    "region": "Asia",
    "cabin": null,
    "points_required": 21000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://frequentmiler.com/chase-ur-best-redemptions/",
    "source_site": "Frequent Miler",
    "source_geo": "US",
    "published_date": "2025-11-10",
    "notes": "Park Hyatt Bangkok or Andaz Singapore, Category 5. Chase UR transfers 1:1 to Hyatt."
  },
  {
    "program": "Marriott Bonvoy",
    "destination": "Maldives",
    "region": "Asia",
    "cabin": null,
    "points_required": 85000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://thepointsguy.com/guide/marriott-bonvoy-maldives/",
    "source_site": "The Points Guy",
    "source_geo": "US",
    "published_date": "2025-06-01",
    "notes": "St. Regis Maldives Vommuli. Peak rates can be lower if you stay 5 nights (5th night free)."
  },
  {
    "program": "British Airways Avios",
    "destination": "Caribbean",
    "region": "Mexico & Caribbean",
    "cabin": "Economy",
    "points_required": 9000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://onemileatatime.com/ba-avios-caribbean/",
    "source_site": "OMAAT",
    "source_geo": "US",
    "published_date": "2025-08-22",
    "notes": "Short-haul AA partners to Caribbean islands from Miami/NYC. Distance-based pricing is great value under 1,151 miles."
  },
  {
    "program": "Singapore KrisFlyer",
    "destination": "Southeast Asia",
    "region": "Asia",
    "cabin": "Business",
    "points_required": 35000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://princeoftravel.com/blog/singapore-krisflyer-sweet-spots/",
    "source_site": "Prince of Travel",
    "source_geo": "CA",
    "published_date": "2025-09-15",
    "notes": "Singapore Airlines regional Business Class within Southeast Asia. Excellent product."
  },
  {
    "program": "Singapore KrisFlyer",
    "destination": "Japan",
    "region": "Asia",
    "cabin": "Business",
    "points_required": 67000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://onemileatatime.com/singapore-krisflyer-japan/",
    "source_site": "OMAAT",
    "source_geo": "US",
    "published_date": "2025-10-03",
    "notes": "Singapore Airlines Business (non-stop SFO-NRT or LAX-NRT). World-class product."
  },
  {
    "program": "Amex MR via Aeroplan",
    "destination": "Europe",
    "region": "Europe",
    "cabin": "Business",
    "points_required": 55000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://upgradedpoints.com/travel/airlines/aeroplan/",
    "source_site": "Upgraded Points",
    "source_geo": "US",
    "published_date": "2025-07-30",
    "notes": "Amex MR transfers 1:1 to Aeroplan. Then use Aeroplan's fixed-rate chart to Europe Business."
  },
  {
    "program": "Capital One Miles via Avianca LifeMiles",
    "destination": "South America",
    "region": "South America",
    "cabin": "Business",
    "points_required": 63000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://liveandletsfly.com/lifemiles-sweet-spots/",
    "source_site": "Live and Let's Fly",
    "source_geo": "US",
    "published_date": "2025-11-20",
    "notes": "Avianca LifeMiles for United or Avianca Business to South America. No fuel surcharges."
  },
  {
    "program": "Alaska Mileage Plan",
    "destination": "Japan",
    "region": "Asia",
    "cabin": "First",
    "points_required": 70000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://viewfromthewing.com/alaska-mileageplan-japan-first/",
    "source_site": "View from the Wing",
    "source_geo": "US",
    "published_date": "2025-09-28",
    "notes": "Japan Airlines First Class via Alaska miles. One of the most coveted redemptions in the hobby."
  },
  {
    "program": "Alaska Mileage Plan",
    "destination": "Europe",
    "region": "Europe",
    "cabin": "Business",
    "points_required": 55000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://frequentmiler.com/alaska-mileageplan-europe/",
    "source_site": "Frequent Miler",
    "source_geo": "US",
    "published_date": "2025-10-05",
    "notes": "Finnair or British Airways Business via Alaska miles. Watch for BA fuel surcharges."
  },
  {
    "program": "Hilton Honors",
    "destination": "Maldives",
    "region": "Asia",
    "cabin": null,
    "points_required": 95000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://thepointsguy.com/guide/hilton-honors-maldives/",
    "source_site": "The Points Guy",
    "source_geo": "US",
    "published_date": "2025-06-15",
    "notes": "Conrad Maldives Rangali Island. 5th night free makes this significantly better value."
  },
  {
    "program": "Hilton Honors",
    "destination": "Europe",
    "region": "Europe",
    "cabin": null,
    "points_required": 40000,
    "pricing_type": "dynamic",
    "points_range": [30000, 80000],
    "source_url": "https://upgradedpoints.com/travel/hotels/hilton/",
    "source_site": "Upgraded Points",
    "source_geo": "US",
    "published_date": "2025-08-05",
    "notes": "Hilton moved to dynamic pricing. Great value at mid-tier properties. Check specific property before booking."
  },
  {
    "program": "IHG One Rewards",
    "destination": "Mexico & Caribbean",
    "region": "Mexico & Caribbean",
    "cabin": null,
    "points_required": 40000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://dealswelike.com/ihg-sweet-spots/",
    "source_site": "Deals We Like",
    "source_geo": "US",
    "published_date": "2025-07-20",
    "notes": "InterContinental Punta Cana or similar 5-star properties. IHG has a fixed peak/off-peak chart."
  },
  {
    "program": "Qantas Points",
    "destination": "Japan",
    "region": "Asia",
    "cabin": "Business",
    "points_required": 72000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://turnleftforless.com/qantas-japan-business/",
    "source_site": "Turn Left for Less",
    "source_geo": "AU",
    "published_date": "2025-10-12",
    "notes": "Japan Airlines or Qantas Business via oneworld. Good value for Qantas cardholders."
  },
  {
    "program": "British Airways Avios",
    "destination": "Europe",
    "region": "Europe",
    "cabin": "Business",
    "points_required": 25000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://paddleyourownkanoo.com/ba-avios-europe/",
    "source_site": "Paddle Your Own Kanoo",
    "source_geo": "UK",
    "published_date": "2025-09-01",
    "notes": "Short-haul Club Europe within Europe. Distance-based — flights under 1,151 miles. Fuel surcharges apply on BA."
  },
  {
    "program": "Chase UR via United",
    "destination": "Central America",
    "region": "Central America",
    "cabin": "Economy",
    "points_required": 15000,
    "pricing_type": "dynamic",
    "points_range": [12000, 25000],
    "source_url": "https://frequentmiler.com/chase-ur-central-america/",
    "source_site": "Frequent Miler",
    "source_geo": "US",
    "published_date": "2025-11-05",
    "notes": "Chase UR to United MileagePlus at 1:1. Dynamic pricing but short-haul fares are generally low."
  }
]
```

- [ ] **Step 3: Verify types file has no TypeScript errors**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add types/index.ts data/seed.json
git commit -m "feat: add shared types and seed redemption dataset"
```

---

## Task 3: Claude Client and Prompt Builder

**Files:**
- Create: `lib/claude.ts`
- Create: `lib/prompt.ts`
- Create: `__tests__/prompt.test.ts`

- [ ] **Step 1: Write failing tests for prompt builder**

Create `__tests__/prompt.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { buildUserPrompt, buildSystemPrompt } from '@/lib/prompt'
import type { Balance, RedemptionEntry } from '@/types'

const mockEntries: RedemptionEntry[] = [
  {
    program: 'Aeroplan',
    destination: 'Japan',
    region: 'Asia',
    cabin: 'Business',
    points_required: 65000,
    pricing_type: 'fixed',
    points_range: null,
    source_url: 'https://example.com',
    source_site: 'OMAAT',
    source_geo: 'US',
    published_date: '2025-11-01',
    notes: 'No fuel surcharges',
  },
  {
    program: 'World of Hyatt',
    destination: 'Costa Rica',
    region: 'Central America',
    cabin: null,
    points_required: 17000,
    pricing_type: 'fixed',
    points_range: null,
    source_url: 'https://example.com',
    source_site: 'TPG',
    source_geo: 'US',
    published_date: '2025-09-20',
    notes: 'Category 4',
  },
]

const mockBalances: Balance[] = [
  { program: 'Aeroplan', amount: 70000 },
  { program: 'World of Hyatt', amount: 10000 },
]

describe('buildSystemPrompt', () => {
  it('returns a non-empty string', () => {
    expect(buildSystemPrompt().length).toBeGreaterThan(0)
  })

  it('instructs Claude to return JSON', () => {
    expect(buildSystemPrompt()).toContain('JSON')
  })
})

describe('buildUserPrompt', () => {
  it('includes all balance programs', () => {
    const prompt = buildUserPrompt(mockBalances, ['Japan'], mockEntries)
    expect(prompt).toContain('Aeroplan')
    expect(prompt).toContain('70000')
    expect(prompt).toContain('World of Hyatt')
    expect(prompt).toContain('10000')
  })

  it('includes dream destinations', () => {
    const prompt = buildUserPrompt(mockBalances, ['Japan', 'Maldives'], mockEntries)
    expect(prompt).toContain('Japan')
    expect(prompt).toContain('Maldives')
  })

  it('includes redemption entries', () => {
    const prompt = buildUserPrompt(mockBalances, [], mockEntries)
    expect(prompt).toContain('65000')
    expect(prompt).toContain('17000')
  })

  it('handles empty destinations', () => {
    const prompt = buildUserPrompt(mockBalances, [], mockEntries)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- __tests__/prompt.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/prompt'`

- [ ] **Step 3: Create Claude client**

Create `lib/claude.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

// Singleton client — instantiated once, reused across requests
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

- [ ] **Step 4: Create prompt builder**

Create `lib/prompt.ts`:
```typescript
import type { Balance, RedemptionEntry } from '@/types'

export function buildSystemPrompt(): string {
  return `You are a travel rewards expert helping users maximize their loyalty points.

You will receive:
1. The user's current point balances by program
2. Their dream destinations (if any)
3. A dataset of known redemption sweet spots

Your job is to analyze this and return a JSON object with exactly this shape:
{
  "reachable": [
    {
      "entry": <RedemptionEntry object from the dataset>,
      "matched_program": "<which of the user's programs covers this>",
      "user_balance": <their balance in that program>,
      "surplus": <balance minus points_required>
    }
  ],
  "dream_destinations": [
    {
      "destination": "<destination name from user input>",
      "reachable": <true or false>,
      "best_entry": <best matching RedemptionEntry or null>,
      "matched_program": "<program name or null>",
      "user_balance": <their balance or null>,
      "gap": <points_required minus user_balance, or null if reachable>
    }
  ],
  "explanation": "<2-3 sentence plain-English summary of the key findings>"
}

Rules:
- Only include entries in "reachable" where the user's balance >= points_required for a matching program
- For dynamic pricing entries, use the lower bound of points_range for reachability check
- Match programs case-insensitively and handle common aliases (e.g. "Chase UR" matches "Chase Ultimate Rewards")
- For dream destinations, search the dataset by destination name and region — partial matches are fine
- Rank "reachable" entries by value: fixed pricing first, then by surplus (ascending — closest to exact value)
- Return ONLY the JSON object. No markdown, no explanation outside the JSON.`
}

export function buildUserPrompt(
  balances: Balance[],
  destinations: string[],
  entries: RedemptionEntry[]
): string {
  const balanceLines = balances
    .map((b) => `  - ${b.program}: ${b.amount.toLocaleString()} points`)
    .join('\n')

  const destinationLines =
    destinations.length > 0
      ? destinations.map((d) => `  - ${d}`).join('\n')
      : '  (none specified)'

  return `USER BALANCES:
${balanceLines}

DREAM DESTINATIONS:
${destinationLines}

REDEMPTION DATASET:
${JSON.stringify(entries, null, 2)}

Please analyze the above and return your JSON response.`
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm run test:run -- __tests__/prompt.test.ts
```
Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/claude.ts lib/prompt.ts __tests__/prompt.test.ts
git commit -m "feat: add Claude client and prompt builder"
```

---

## Task 4: Recommend API Route

**Files:**
- Create: `app/api/recommend/route.ts`
- Create: `__tests__/route.test.ts`

- [ ] **Step 1: Write failing tests for API route**

Create `__tests__/route.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/recommend/route'

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              reachable: [
                {
                  entry: {
                    program: 'Aeroplan',
                    destination: 'Japan',
                    region: 'Asia',
                    cabin: 'Business',
                    points_required: 65000,
                    pricing_type: 'fixed',
                    points_range: null,
                    source_url: 'https://example.com',
                    source_site: 'OMAAT',
                    source_geo: 'US',
                    published_date: '2025-11-01',
                    notes: 'No fuel surcharges',
                  },
                  matched_program: 'Aeroplan',
                  user_balance: 70000,
                  surplus: 5000,
                },
              ],
              dream_destinations: [],
              explanation: 'You can fly business to Japan with your Aeroplan points.',
            }),
          },
        ],
      }),
    },
  })),
}))

describe('POST /api/recommend', () => {
  it('returns 400 if balances is missing', async () => {
    const req = new Request('http://localhost/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ destinations: [] }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 if balances is empty', async () => {
    const req = new Request('http://localhost/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ balances: [], destinations: [] }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with reachable and dream_destinations on valid input', async () => {
    const req = new Request('http://localhost/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        balances: [{ program: 'Aeroplan', amount: 70000 }],
        destinations: ['Japan'],
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('reachable')
    expect(data).toHaveProperty('dream_destinations')
    expect(data).toHaveProperty('explanation')
  })

  it('returns 200 with empty destinations array', async () => {
    const req = new Request('http://localhost/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        balances: [{ program: 'Aeroplan', amount: 70000 }],
        destinations: [],
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:run -- __tests__/route.test.ts
```
Expected: FAIL — `Cannot find module '@/app/api/recommend/route'`

- [ ] **Step 3: Create the API route**

Create `app/api/recommend/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt'
import seedData from '@/data/seed.json'
import type { RecommendRequest, RecommendResponse } from '@/types'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body || !Array.isArray(body.balances) || body.balances.length === 0) {
    return NextResponse.json(
      { error: 'balances is required and must be a non-empty array' },
      { status: 400 }
    )
  }

  const { balances, destinations = [] }: RecommendRequest = body

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(balances, destinations, seedData as any),
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const result: RecommendResponse = JSON.parse(text)

  return NextResponse.json(result)
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:run -- __tests__/route.test.ts
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/recommend/route.ts __tests__/route.test.ts
git commit -m "feat: add recommend API route with Claude integration"
```

---

## Task 5: Input Form Components

**Files:**
- Create: `components/BalanceInput.tsx`
- Create: `components/DestinationInput.tsx`
- Create: `__tests__/BalanceInput.test.tsx`
- Create: `__tests__/DestinationInput.test.tsx`

- [ ] **Step 1: Write failing tests for BalanceInput**

Create `__tests__/BalanceInput.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BalanceInput from '@/components/BalanceInput'
import type { Balance } from '@/types'

const defaultBalances: Balance[] = [{ program: '', amount: 0 }]

describe('BalanceInput', () => {
  it('renders at least one row', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    expect(screen.getByPlaceholderText(/program/i)).toBeTruthy()
  })

  it('calls onChange when program name is updated', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText(/program/i), {
      target: { value: 'Aeroplan' },
    })
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange when amount is updated', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText(/points/i), {
      target: { value: '70000' },
    })
    expect(onChange).toHaveBeenCalled()
  })

  it('renders Add another button', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    expect(screen.getByText(/add another/i)).toBeTruthy()
  })

  it('calls onChange with additional row when Add another is clicked', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    fireEvent.click(screen.getByText(/add another/i))
    const newBalances = onChange.mock.calls[0][0] as Balance[]
    expect(newBalances.length).toBe(2)
  })
})
```

- [ ] **Step 2: Write failing tests for DestinationInput**

Create `__tests__/DestinationInput.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DestinationInput from '@/components/DestinationInput'

describe('DestinationInput', () => {
  it('renders a textarea', () => {
    const onChange = vi.fn()
    render(<DestinationInput value="" onChange={onChange} />)
    expect(screen.getByRole('textbox')).toBeTruthy()
  })

  it('calls onChange when text changes', () => {
    const onChange = vi.fn()
    render(<DestinationInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Japan, Maldives' },
    })
    expect(onChange).toHaveBeenCalledWith('Japan, Maldives')
  })

  it('displays the current value', () => {
    const onChange = vi.fn()
    render(<DestinationInput value="Japan" onChange={onChange} />)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Japan')
  })
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npm run test:run -- __tests__/BalanceInput.test.tsx __tests__/DestinationInput.test.tsx
```
Expected: FAIL — modules not found.

- [ ] **Step 4: Create BalanceInput component**

Create `components/BalanceInput.tsx`:
```typescript
'use client'

import type { Balance } from '@/types'

interface Props {
  balances: Balance[]
  onChange: (balances: Balance[]) => void
}

export default function BalanceInput({ balances, onChange }: Props) {
  function update(index: number, field: keyof Balance, value: string) {
    const updated = balances.map((b, i) => {
      if (i !== index) return b
      return { ...b, [field]: field === 'amount' ? Number(value) : value }
    })
    onChange(updated)
  }

  function addRow() {
    onChange([...balances, { program: '', amount: 0 }])
  }

  function removeRow(index: number) {
    onChange(balances.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {balances.map((balance, i) => (
        <div key={i} className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Program (e.g. Aeroplan)"
            value={balance.program}
            onChange={(e) => update(i, 'program', e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Points balance"
            value={balance.amount || ''}
            onChange={(e) => update(i, 'amount', e.target.value)}
            className="w-40 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {balances.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-gray-400 hover:text-red-500 text-lg leading-none"
              aria-label="Remove"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-sm text-blue-600 hover:underline"
      >
        + Add another program
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Create DestinationInput component**

Create `components/DestinationInput.tsx`:
```typescript
'use client'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function DestinationInput({ value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Japan, Maldives, Southeast Asia"
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <p className="text-xs text-gray-400">
        Separate multiple destinations with commas
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm run test:run -- __tests__/BalanceInput.test.tsx __tests__/DestinationInput.test.tsx
```
Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add components/BalanceInput.tsx components/DestinationInput.tsx __tests__/BalanceInput.test.tsx __tests__/DestinationInput.test.tsx
git commit -m "feat: add BalanceInput and DestinationInput components"
```

---

## Task 6: Result Display Components

**Files:**
- Create: `components/ResultCard.tsx`
- Create: `components/ResultsSection.tsx`
- Create: `__tests__/ResultCard.test.tsx`
- Create: `__tests__/ResultsSection.test.tsx`

- [ ] **Step 1: Write failing tests for ResultCard**

Create `__tests__/ResultCard.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultCard from '@/components/ResultCard'
import type { RedemptionEntry } from '@/types'

const fixedEntry: RedemptionEntry = {
  program: 'Aeroplan',
  destination: 'Japan',
  region: 'Asia',
  cabin: 'Business',
  points_required: 65000,
  pricing_type: 'fixed',
  points_range: null,
  source_url: 'https://example.com',
  source_site: 'OMAAT',
  source_geo: 'US',
  published_date: '2025-11-01',
  notes: 'No fuel surcharges',
}

const dynamicEntry: RedemptionEntry = {
  ...fixedEntry,
  program: 'United MileagePlus',
  pricing_type: 'dynamic',
  points_range: [60000, 110000],
}

describe('ResultCard', () => {
  it('renders destination name', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText('Japan')).toBeTruthy()
  })

  it('renders program name', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText(/aeroplan/i)).toBeTruthy()
  })

  it('renders fixed points required', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText(/65,000/)).toBeTruthy()
  })

  it('shows dynamic disclaimer for dynamic entries', () => {
    render(<ResultCard entry={dynamicEntry} matchedProgram="United MileagePlus" userBalance={100000} />)
    expect(screen.getByText(/dynamic/i)).toBeTruthy()
  })

  it('renders cabin class when present', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText(/business/i)).toBeTruthy()
  })

  it('renders notes', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText(/no fuel surcharges/i)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Write failing tests for ResultsSection**

Create `__tests__/ResultsSection.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultsSection from '@/components/ResultsSection'

describe('ResultsSection', () => {
  it('renders the section heading', () => {
    render(<ResultsSection heading="You Can Go Here Now">{<p>content</p>}</ResultsSection>)
    expect(screen.getByText('You Can Go Here Now')).toBeTruthy()
  })

  it('renders children', () => {
    render(<ResultsSection heading="Test"><p>child content</p></ResultsSection>)
    expect(screen.getByText('child content')).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npm run test:run -- __tests__/ResultCard.test.tsx __tests__/ResultsSection.test.tsx
```
Expected: FAIL — modules not found.

- [ ] **Step 4: Create ResultCard component**

Create `components/ResultCard.tsx`:
```typescript
import type { RedemptionEntry } from '@/types'

interface Props {
  entry: RedemptionEntry
  matchedProgram: string
  userBalance: number
  gap?: number | null  // only for dream destinations that aren't reachable
}

export default function ResultCard({ entry, matchedProgram, userBalance, gap }: Props) {
  const pointsDisplay =
    entry.pricing_type === 'dynamic' && entry.points_range
      ? `${entry.points_range[0].toLocaleString()}–${entry.points_range[1].toLocaleString()} pts`
      : `${entry.points_required.toLocaleString()} pts`

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{entry.destination}</h3>
          {entry.region && (
            <p className="text-xs text-gray-400 uppercase tracking-wide">{entry.region}</p>
          )}
        </div>
        {gap != null && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            {gap.toLocaleString()} pts short
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{matchedProgram}</span>
        {entry.cabin && (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{entry.cabin}</span>
        )}
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
          {pointsDisplay}
        </span>
        {entry.pricing_type === 'dynamic' && (
          <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs">
            Dynamic pricing
          </span>
        )}
      </div>

      {entry.notes && (
        <p className="text-sm text-gray-500 leading-relaxed">{entry.notes}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">
          via {entry.source_site} · {entry.published_date}
        </span>
        <a
          href={entry.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          Read more →
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create ResultsSection component**

Create `components/ResultsSection.tsx`:
```typescript
interface Props {
  heading: string
  children: React.ReactNode
}

export default function ResultsSection({ heading, children }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">
        {heading}
      </h2>
      {children}
    </section>
  )
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
npm run test:run -- __tests__/ResultCard.test.tsx __tests__/ResultsSection.test.tsx
```
Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add components/ResultCard.tsx components/ResultsSection.tsx __tests__/ResultCard.test.tsx __tests__/ResultsSection.test.tsx
git commit -m "feat: add ResultCard and ResultsSection components"
```

---

## Task 7: Input Form Page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update root layout**

Replace `app/layout.tsx` with:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Points Advisor',
  description: 'Find out what you can do with your loyalty points',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Replace home page with input form**

Replace `app/page.tsx` with:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BalanceInput from '@/components/BalanceInput'
import DestinationInput from '@/components/DestinationInput'
import type { Balance } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const [balances, setBalances] = useState<Balance[]>([{ program: '', amount: 0 }])
  const [destinations, setDestinations] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validBalances = balances.filter((b) => b.program.trim() && b.amount > 0)
    if (validBalances.length === 0) {
      setError('Please enter at least one loyalty program with a point balance.')
      return
    }

    setLoading(true)
    try {
      const destinationList = destinations
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)

      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balances: validBalances, destinations: destinationList }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      // Pass results via sessionStorage to avoid URL length limits
      sessionStorage.setItem('results', JSON.stringify(data))
      router.push('/results')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="space-y-2 mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Points Advisor</h1>
        <p className="text-gray-500 text-lg">
          Enter your loyalty point balances and find out where you can go.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Your Point Balances
          </label>
          <BalanceInput balances={balances} onChange={setBalances} />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Dream Destinations
            <span className="text-gray-400 font-normal normal-case ml-2">(optional)</span>
          </label>
          <DestinationInput value={destinations} onChange={setDestinations} />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {loading ? 'Analyzing your points...' : 'Find My Redemptions'}
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: Verify the form renders**

```bash
npm run dev
```
Open http://localhost:3000. Expected: Form with balance inputs, destination textarea, and submit button renders without errors.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: add input form page"
```

---

## Task 8: Results Page

**Files:**
- Create: `app/results/page.tsx`

- [ ] **Step 1: Create results page**

Create `app/results/page.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ResultCard from '@/components/ResultCard'
import ResultsSection from '@/components/ResultsSection'
import type { RecommendResponse } from '@/types'

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<RecommendResponse | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('results')
    if (!stored) {
      router.replace('/')
      return
    }
    setResults(JSON.parse(stored))
  }, [router])

  if (!results) return null

  const hasReachable = results.reachable.length > 0
  const hasDreams = results.dream_destinations.length > 0

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Your Redemptions</h1>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Start over
        </button>
      </div>

      {results.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800 leading-relaxed">
          {results.explanation}
        </div>
      )}

      {hasReachable && (
        <ResultsSection heading="You Can Go Here Now">
          <div className="space-y-4">
            {results.reachable.map((r, i) => (
              <ResultCard
                key={i}
                entry={r.entry}
                matchedProgram={r.matched_program}
                userBalance={r.user_balance}
              />
            ))}
          </div>
        </ResultsSection>
      )}

      {hasDreams && (
        <ResultsSection heading="Your Dream Destinations">
          <div className="space-y-4">
            {results.dream_destinations.map((d, i) => (
              <div key={i}>
                {d.best_entry ? (
                  <ResultCard
                    entry={d.best_entry}
                    matchedProgram={d.matched_program ?? d.destination}
                    userBalance={d.user_balance ?? 0}
                    gap={d.reachable ? null : d.gap}
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                    <h3 className="font-semibold text-gray-700">{d.destination}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      No redemption data found for this destination yet.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ResultsSection>
      )}

      {!hasReachable && !hasDreams && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No redemptions found for your current balances.</p>
          <p className="text-sm mt-2">Try adding more programs or increasing your balances.</p>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify the full flow works end-to-end**

```bash
npm run dev
```
1. Open http://localhost:3000
2. Enter a program (e.g. `Aeroplan`) with a balance (e.g. `70000`)
3. Enter a destination (e.g. `Japan`)
4. Click "Find My Redemptions"
5. Expected: Results page loads with at least one redemption card.

- [ ] **Step 3: Commit**

```bash
git add app/results/page.tsx
git commit -m "feat: add results page"
```

---

## Task 9: Full Test Suite Run and Polish

**Files:**
- No new files — verify everything passes and the app is usable

- [ ] **Step 1: Run full test suite**

```bash
npm run test:run
```
Expected: All tests PASS. If any fail, fix them before proceeding.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```
Test these scenarios:
1. Single program, no destinations → should show reachable results only
2. Single program, one destination you can afford → destination shows as reachable
3. Single program (low balance, e.g. 10,000), destination you can't afford (Japan) → shows gap
4. Multiple programs → all programs considered

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete points-advisor v0.1"
```
