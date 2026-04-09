# Spec: Multi-Agent QA System for Points Advisor

**Date:** 2026-04-08
**Status:** Approved

---

## Problem

The points advisor relies on Claude's judgment for explanation quality, ranking, and program selection. These behaviors are non-deterministic and can regress silently when:
- The model is updated
- A new seed entry is added
- The prompt changes

Data correctness (e.g., seed values, midpoint scrubbing) is covered by unit tests. This system covers **Claude's judgment** — things unit tests cannot catch.

---

## What This System Tests

Not: "is the data correct?" (that's `npm run test:run`)

Yes:
- Is the best option (lowest `points_range[0]`) listed first?
- Does the explanation name the program in card[0]?
- Does the explanation state a number ≤ the floor of the best entry (no fabrication)?
- Is the explanation ≤ 2 sentences?
- When two programs serve the same destination, does the cheaper one win?

---

## Architecture

```
scripts/
  test-agents.ts        # entry point — orchestrates 3 parallel Playwright sessions
  agent-runner.ts       # one Playwright session: fill form → scrape results page
  manager.ts            # Claude call: receives 3 results + seed context, validates
  test-scenarios.ts     # LOCKED_CASES array + RANDOM_POOL array + ValidationRule list
```

---

## Flow

1. Select scenarios: always include all `LOCKED_CASES` (currently 3), then append 2 random picks from `RANDOM_POOL` — 5 total per run
2. Launch all sessions in parallel (one per scenario)
3. Each session:
   - Navigates to `localhost:3000`
   - Fills balance, origin, destinations
   - Submits and waits for results page
   - Scrapes: explanation text, ordered card list (destination, program, points display, position)
4. Collect all 3 scraped results
5. Single Claude manager call receives: scenarios + scraped outputs + relevant seed entries as ground truth
6. Manager evaluates each result against `VALIDATION_RULES`, returns structured pass/fail report
7. Script prints report, exits non-zero if any case fails

---

## Test Scenarios

### Locked Cases (always run)

```ts
export const LOCKED_CASES: TestScenario[] = [
  {
    id: 'competing-programs',
    description: 'BA should win and be listed first when cheaper than United',
    origin: 'New York',
    balance: 12000,
    destinations: ['Washington DC'],
  },
  {
    id: 'dynamic-range-floor',
    description: 'Explanation must reference the floor (12,000), not a midpoint',
    origin: 'Chicago',
    balance: 12000,
    destinations: ['Los Angeles'],
  },
  {
    id: 'multi-destination-ordering',
    description: 'Cheaper destination should lead the explanation',
    origin: 'Atlanta',
    balance: 12000,
    destinations: ['Miami', 'Los Angeles'],
  },
]
```

### Random Pool

Generated at runtime: all supported origins × all seed destinations, with balance 12,000. Duplicates of locked case combos are excluded. 2 picks per run, sampled without replacement.

---

## Types

```ts
interface TestScenario {
  id: string
  description: string
  origin: string
  balance: number
  destinations: string[]
}

interface ValidationRule {
  name: string
  description: string
}

interface ScrapedResult {
  scenarioId: string
  explanation: string
  cards: { destination: string; program: string; pointsDisplay: string }[]  // ordered: index 0 = first card shown
}
```

---

## Validation Rules

```ts
export const VALIDATION_RULES: ValidationRule[] = [
  {
    name: 'best-option-first',
    description: 'Card[0] must have the lowest points_range[0] of all returned cards',
  },
  {
    name: 'explanation-names-correct-program',
    description: 'Explanation must name the program associated with card[0]',
  },
  {
    name: 'no-fabricated-numbers',
    description: 'Every number in the explanation must exist in the relevant seed entries',
  },
  {
    name: 'explanation-max-2-sentences',
    description: 'Explanation must be 2 sentences or fewer',
  },
  {
    name: 'explanation-uses-floor-not-midpoint',
    description: 'When a dynamic entry is shown, explanation must reference points_range[0], not points_required',
  },
]
```

**Extensibility rule:** New bug found → add one entry to `LOCKED_CASES` + one entry to `VALIDATION_RULES`. No other files change.

---

## Manager Prompt Contract

The manager receives per scenario:
- Input: `{ balance, origin, destinations }`
- Scraped output: `{ explanation: string, cards: { destination, program, pointsDisplay, position }[] }`
- Ground truth: relevant `RedemptionEntry[]` from seed, filtered via `filterByPrograms()` using the scenario's own balance/program, then narrowed to entries matching the scenario's destinations

The manager returns:
```ts
{
  results: {
    scenarioId: string
    passed: boolean
    failures: { rule: string; reason: string }[]
  }[]
  summary: string
}
```

---

## Output

```
LOCKED: competing-programs       PASS
LOCKED: dynamic-range-floor      PASS
RANDOM: Chicago → Seattle        FAIL
  ✗ best-option-first: United (10,000) was listed before BA (7,500)
  ✗ explanation-names-correct-program: explanation says "United" but card[0] is BA Avios

2/3 passed. Exit code 1.
```

---

## Exit Behavior

- All pass → exit 0
- Any failure → exit 1 (CI-compatible)

---

## Out of Scope

- Testing data correctness (covered by Vitest unit tests)
- Testing UI layout or styles (covered by manual review / Playwright snapshots)
- Automated seed.json updates (this system validates the app's output, not the data)
- Scheduling (run manually for now; can be added later)
