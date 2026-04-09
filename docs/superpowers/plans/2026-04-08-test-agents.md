# Test Agents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-agent + manager QA script that runs the live app through Playwright, scrapes results, and uses Claude to validate explanation quality, ranking, and program accuracy.

**Architecture:** Four `.mjs` scripts in `scripts/`. Three Playwright sessions run in parallel (one per test scenario), each scraping the explanation and ordered card list from the results page. A single Claude manager call receives all scraped output plus relevant seed entries as ground truth, evaluates against `VALIDATION_RULES`, and returns a structured pass/fail report.

**Tech Stack:** Node 20 ESM (`.mjs`), Playwright (already installed), `@anthropic-ai/sdk` (already installed), seed.json via `createRequire`

---

## File Map

| File | Responsibility |
|------|---------------|
| `scripts/test-scenarios.mjs` | `LOCKED_CASES`, `RANDOM_POOL` generator, `VALIDATION_RULES` — the only file touched when adding new test cases |
| `scripts/agent-runner.mjs` | Single Playwright session: fill form → wait for results → scrape explanation + cards |
| `scripts/manager.mjs` | Claude manager: receives scraped results + seed ground truth, returns structured pass/fail |
| `scripts/test-agents.mjs` | Entry point: select scenarios, run agents in parallel, call manager, print report, exit |

Working directory for all tasks: `.worktrees/points-advisor-v0.1/points-advisor/`

---

## Task 1: test-scenarios.mjs

**Files:**
- Create: `scripts/test-scenarios.mjs`

- [ ] **Step 1: Create the file**

```js
// scripts/test-scenarios.mjs
// Single source of truth for test cases and validation rules.
// To add a new regression: add one entry to LOCKED_CASES + one to VALIDATION_RULES.

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const seedData = require('../data/seed.json')

// Origins the form supports (must match button labels exactly minus the IATA suffix)
const SUPPORTED_ORIGINS = ['Atlanta', 'Chicago', 'Dallas', 'Denver', 'Los Angeles', 'Miami', 'New York', 'Washington DC']

// Destinations available in the form
const SUPPORTED_DESTINATIONS = ['Chicago', 'Las Vegas', 'Los Angeles', 'Miami', 'New York', 'Philadelphia', 'San Diego', 'Seattle', 'Washington DC']

export const LOCKED_CASES = [
  {
    id: 'competing-programs',
    description: 'BA should win and be listed first when cheaper than United (7,500 vs 10,000)',
    origin: 'New York',
    balance: 12000,
    program: 'Chase Ultimate Rewards',
    destinations: ['Washington DC'],
  },
  {
    id: 'dynamic-range-floor',
    description: 'Explanation must reference the floor (12,000), not midpoint (13,500)',
    origin: 'Chicago',
    balance: 12000,
    program: 'Chase Ultimate Rewards',
    destinations: ['Los Angeles'],
  },
  {
    id: 'multi-destination-ordering',
    description: 'Cheaper destination (Miami at 10,000) should lead explanation over LA (12,000)',
    origin: 'Atlanta',
    balance: 12000,
    program: 'Chase Ultimate Rewards',
    destinations: ['Miami', 'Los Angeles'],
  },
]

// Generate random cases at runtime, excluding locked combos
export function pickRandomCases(n = 2) {
  const lockedKeys = new Set(
    LOCKED_CASES.map((c) => `${c.origin}|${c.destinations.join(',')}`)
  )

  const pool = []
  for (const origin of SUPPORTED_ORIGINS) {
    for (const dest of SUPPORTED_DESTINATIONS) {
      if (origin === dest) continue
      const key = `${origin}|${dest}`
      if (lockedKeys.has(key)) continue
      pool.push({
        id: `random-${origin.toLowerCase().replace(' ', '-')}-${dest.toLowerCase().replace(' ', '-')}`,
        description: `Random: ${origin} → ${dest}`,
        origin,
        balance: 12000,
        program: 'Chase Ultimate Rewards',
        destinations: [dest],
      })
    }
  }

  // Shuffle and pick n
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}

export const VALIDATION_RULES = [
  {
    name: 'best-option-first',
    description: 'Card[0] must have the lowest points floor of all returned cards. Check pointsDisplay — the first number in a range like "10,000–15,000" is the floor.',
  },
  {
    name: 'explanation-names-correct-program',
    description: 'The explanation must name the loyalty program or airline associated with card[0], not a competing program.',
  },
  {
    name: 'no-fabricated-numbers',
    description: 'Every point value mentioned in the explanation must correspond to a points_range[0] or points_required value in the ground truth seed entries. Numbers not in the seed are fabricated.',
  },
  {
    name: 'explanation-max-2-sentences',
    description: 'The explanation must be 2 sentences or fewer. Count sentence-ending punctuation.',
  },
  {
    name: 'explanation-uses-floor-not-midpoint',
    description: 'For dynamic entries (those with a range), the explanation must cite points_range[0] (the lower bound), not the midpoint stored in points_required.',
  },
]

// Filter seed entries relevant to a scenario (mirrors lib/filter.ts logic)
export function groundTruthFor(scenario) {
  const userPrograms = new Set([scenario.program.toLowerCase()])
  const relevant = seedData.filter((entry) => {
    const programMatch = userPrograms.has(entry.program.toLowerCase())
    const transferMatch = entry.transferable_from?.some((tf) => userPrograms.has(tf.toLowerCase()))
    return programMatch || transferMatch
  })
  // Narrow to destinations in the scenario
  const destSet = new Set(scenario.destinations.map((d) => d.toLowerCase()))
  return relevant.filter((e) => destSet.has(e.destination.toLowerCase()))
}
```

- [ ] **Step 2: Verify it loads without errors**

```bash
node -e "import('./scripts/test-scenarios.mjs').then(m => { console.log('LOCKED:', m.LOCKED_CASES.length); console.log('RULES:', m.VALIDATION_RULES.length); const sample = m.pickRandomCases(2); console.log('RANDOM sample:', sample.map(s=>s.id)); })"
```

Expected output:
```
LOCKED: 3
RULES: 5
RANDOM sample: [ 'random-...', 'random-...' ]
```

- [ ] **Step 3: Commit**

```bash
git add scripts/test-scenarios.mjs
git commit -m "feat(test-agents): add test scenarios, validation rules, ground truth helper"
```

---

## Task 2: agent-runner.mjs

**Files:**
- Create: `scripts/agent-runner.mjs`

The runner navigates to localhost:3000, fills the form, submits, waits for the results page, then scrapes the explanation and all cards in order.

- [ ] **Step 1: Create the file**

```js
// scripts/agent-runner.mjs
// Single Playwright session for one test scenario.
// Returns ScrapedResult: { scenarioId, explanation, cards[] }

import { chromium } from 'playwright'

// Maps scenario.origin to the button text used in the form
function originButtonText(origin) {
  const map = {
    'Atlanta': 'Atlanta (ATL)',
    'Chicago': 'Chicago (ORD)',
    'Dallas': 'Dallas (DFW)',
    'Denver': 'Denver (DEN)',
    'Los Angeles': 'Los Angeles (LAX)',
    'Miami': 'Miami (MIA)',
    'New York': 'New York (JFK/EWR)',
    'Washington DC': 'Washington DC (IAD)',
  }
  return map[origin] ?? origin
}

export async function runAgent(scenario, baseUrl = 'http://localhost:3000') {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(baseUrl)

    // Fill balance
    await page.getByRole('spinbutton').fill(String(scenario.balance))

    // Select origin
    await page.getByRole('button', { name: originButtonText(scenario.origin) }).click()

    // Select each destination
    for (const dest of scenario.destinations) {
      await page.getByRole('button', { name: dest, exact: true }).click()
    }

    // Submit
    await page.getByRole('button', { name: 'Find My Redemptions' }).click()

    // Wait for results page
    await page.waitForURL('**/results', { timeout: 30000 })
    await page.waitForSelector('h1', { timeout: 30000 })

    // Scrape explanation (blue box)
    const explanation = await page.$eval(
      '.bg-blue-50',
      (el) => el.textContent?.trim() ?? ''
    ).catch(() => '')

    // Scrape all result cards in DOM order
    // Each card is a div with border-gray-200 rounded-xl containing an h3 and a points paragraph
    const cards = await page.$$eval(
      'div.border.border-gray-200.rounded-xl',
      (els) => els.map((el) => {
        const destination = el.querySelector('h3')?.textContent?.trim() ?? ''
        // Points display: first <p> inside the header div (the "10,000–15,000 points one-way" line)
        const pointsDisplay = el.querySelector('p.text-sm.text-gray-500')?.textContent?.trim() ?? ''
        // Program/airline: the cabin · airline line
        const programLine = el.querySelector('p.text-sm.text-gray-600')?.textContent?.trim() ?? ''
        return { destination, pointsDisplay, programLine }
      }).filter((c) => c.destination !== '')
    )

    return { scenarioId: scenario.id, explanation, cards }
  } finally {
    await browser.close()
  }
}
```

- [ ] **Step 2: Smoke test against the live app**

Make sure `npm run dev` is running in another terminal, then:

```bash
node -e "
import('./scripts/agent-runner.mjs').then(async ({ runAgent }) => {
  const result = await runAgent({
    id: 'smoke',
    origin: 'New York',
    balance: 12000,
    program: 'Chase Ultimate Rewards',
    destinations: ['Washington DC']
  })
  console.log('explanation:', result.explanation.slice(0, 120))
  console.log('cards:', JSON.stringify(result.cards, null, 2))
})"
```

Expected: explanation text printed, at least 1 card with destination "Washington DC", pointsDisplay containing "7,500".

- [ ] **Step 3: Commit**

```bash
git add scripts/agent-runner.mjs
git commit -m "feat(test-agents): add Playwright agent runner"
```

---

## Task 3: manager.mjs

**Files:**
- Create: `scripts/manager.mjs`

The manager receives all scraped results + seed ground truth and returns a structured pass/fail report via a single Claude call.

- [ ] **Step 1: Create the file**

```js
// scripts/manager.mjs
// Claude manager: receives scraped results from all agents + seed ground truth,
// validates against VALIDATION_RULES, returns structured pass/fail report.

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function runManager(scenarios, scrapedResults, groundTruths, validationRules) {
  const payload = scenarios.map((scenario, i) => ({
    scenario: {
      id: scenario.id,
      description: scenario.description,
      origin: scenario.origin,
      balance: scenario.balance,
      destinations: scenario.destinations,
    },
    scraped: scrapedResults[i],
    groundTruth: groundTruths[i],
  }))

  const rulesText = validationRules.map((r) => `- **${r.name}**: ${r.description}`).join('\n')

  const prompt = `You are a QA manager for a travel points advisor app. You will evaluate whether the app's output is correct for each test scenario.

VALIDATION RULES (apply ALL of these to EACH scenario):
${rulesText}

For each scenario below, evaluate the scraped app output against the ground truth seed data. Return a JSON object with this exact shape:
{
  "results": [
    {
      "scenarioId": "<id>",
      "passed": <true|false>,
      "failures": [
        { "rule": "<rule name>", "reason": "<specific explanation of what was wrong>" }
      ]
    }
  ],
  "summary": "<one sentence: X/Y passed>"
}

If a scenario passes all rules, "failures" must be an empty array.
Return ONLY the JSON object. No markdown, no explanation outside JSON.

SCENARIOS TO EVALUATE:
${JSON.stringify(payload, null, 2)}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content.find((b) => b.type === 'text')?.text ?? '{}'
  const raw = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(raw)
}
```

- [ ] **Step 2: Verify it parses without error (dry run with mock data)**

```bash
node -e "
import('./scripts/manager.mjs').then(async ({ runManager }) => {
  // Skip actual API call — just verify the module loads
  console.log('manager.mjs loaded OK')
})"
```

Expected: `manager.mjs loaded OK`

- [ ] **Step 3: Commit**

```bash
git add scripts/manager.mjs
git commit -m "feat(test-agents): add Claude manager"
```

---

## Task 4: test-agents.mjs (entry point)

**Files:**
- Create: `scripts/test-agents.mjs`

- [ ] **Step 1: Create the file**

```js
// scripts/test-agents.mjs
// Entry point. Runs all scenarios in parallel, calls manager, prints report.
// Usage: node scripts/test-agents.mjs
// Exit 0 = all pass. Exit 1 = any failure.

import { LOCKED_CASES, VALIDATION_RULES, pickRandomCases, groundTruthFor } from './test-scenarios.mjs'
import { runAgent } from './agent-runner.mjs'
import { runManager } from './manager.mjs'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const RANDOM_COUNT = 2

async function main() {
  const scenarios = [...LOCKED_CASES, ...pickRandomCases(RANDOM_COUNT)]

  console.log(`\nRunning ${scenarios.length} scenarios (${LOCKED_CASES.length} locked + ${RANDOM_COUNT} random)...\n`)

  // Run all Playwright agents in parallel
  const agentResults = await Promise.all(
    scenarios.map((s) => {
      const label = LOCKED_CASES.find((l) => l.id === s.id) ? 'LOCKED' : 'RANDOM'
      console.log(`  → ${label}: ${s.id}`)
      return runAgent(s, BASE_URL)
    })
  )

  // Build ground truth per scenario
  const groundTruths = scenarios.map((s) => groundTruthFor(s))

  // Run manager
  console.log('\nAsking manager to validate results...\n')
  const report = await runManager(scenarios, agentResults, groundTruths, VALIDATION_RULES)

  // Print report
  let allPassed = true
  for (const result of report.results) {
    const scenario = scenarios.find((s) => s.id === result.scenarioId)
    const label = LOCKED_CASES.find((l) => l.id === result.scenarioId) ? 'LOCKED' : 'RANDOM'
    const status = result.passed ? 'PASS' : 'FAIL'
    console.log(`${label}: ${result.scenarioId.padEnd(35)} ${status}`)
    if (!result.passed) {
      allPassed = false
      for (const f of result.failures) {
        console.log(`  ✗ ${f.rule}: ${f.reason}`)
      }
    }
  }

  console.log(`\n${report.summary}`)
  process.exit(allPassed ? 0 : 1)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

- [ ] **Step 2: Add npm script to package.json**

In `package.json`, add to the `"scripts"` block:

```json
"test:agents": "node scripts/test-agents.mjs"
```

- [ ] **Step 3: Run the full script against the live app**

Make sure `npm run dev` is running, then:

```bash
npm run test:agents
```

Expected output shape:
```
Running 5 scenarios (3 locked + 2 random)...

  → LOCKED: competing-programs
  → LOCKED: dynamic-range-floor
  → LOCKED: multi-destination-ordering
  → RANDOM: random-...
  → RANDOM: random-...

Asking manager to validate results...

LOCKED: competing-programs               PASS
LOCKED: dynamic-range-floor              PASS
LOCKED: multi-destination-ordering       PASS
RANDOM: random-...                       PASS
RANDOM: random-...                       PASS

5/5 passed.
```

If any LOCKED case fails: read the failure reason, diagnose whether it's a prompt issue, seed issue, or display issue before touching code.

- [ ] **Step 4: Commit**

```bash
git add scripts/test-agents.mjs package.json
git commit -m "feat(test-agents): add orchestrator entry point and npm script"
```

---

## Self-Review Notes

- All 4 files follow the existing `.mjs` pattern from `refresh-bonuses.mjs`
- `groundTruthFor` in `test-scenarios.mjs` mirrors `filterByPrograms` from `lib/filter.ts` — if `filter.ts` changes its alias logic, this needs updating too
- `runAgent` uses `page.$$eval('div.border.border-gray-200.rounded-xl', ...)` — this selector depends on the current Tailwind classes in `ResultCard.tsx`. If those classes change, update the selector.
- `runManager` sends all 5 scenarios in one Claude call — at ~200 tokens per scenario that's well within limits
- Random cases use balance 12,000 across the board — sufficient to afford most domestic entries in the seed
