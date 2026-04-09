# Points Redemption Advisor — Design Spec

**Date:** 2026-04-06  
**Status:** Approved  
**Author:** Sami Haddad

---

## Overview

A web app that helps people with points sitting in loyalty programs figure out what they can do with them. Users enter their balances and travel preferences, and get back ranked redemption ideas — both for their dream destinations and surprising alternatives they hadn't considered.

Target users: casual collectors and intermediate points enthusiasts who have points but don't know how to maximize them.

---

## Milestones

### v0.1 — Validate Core UX (build first)
Prove that Claude reasoning over points data is useful before investing in the crawler.

- Hardcoded seed dataset of ~50 curated redemption sweet spots (manually compiled)
- Balance input + dream destination input (no open-to-suggestions toggle)
- Two result sections: **You Can Go Here Now** + **Your Dream Destinations** (with gap info)
- No crawler, no "You Might Not Have Considered" section
- Goal: confirm the UX works and Claude reasons well over the data

### v1 — Crawler-Powered (build after v0.1 is validated)
Replace seed data with live crawled content from the 10 source sites. Add the third results section.

---

## Architecture

One Next.js project with three loosely coupled concerns:

### 1. Frontend
- User inputs point balances (program + amount, manual entry)
- User inputs travel preferences (dream destinations free text)
- Submits form, receives a results page
- v0.1: two result sections; v1: three sections

### 2. Claude Agent (query-time)
- Server-side Next.js API route
- Receives: user balances + preferences + redemption data (seed in v0.1, crawled cache in v1)
- Returns: ranked redemption recommendations with explanations
- Handles fixed vs. dynamic pricing distinction in its reasoning
- Tags dynamic program redemptions with a range and disclaimer

### 3. Weekly Crawler (v1 only)
- Standalone Node script using Playwright
- Visits all 10 source sites, extracts redemption ideas and sweet spots
- Claude reads page content and extracts structured data (no brittle CSS selectors)
- Writes results to `cache/redemptions.json`
- Prunes entries older than 30 days on each run
- Run manually for v1; cron automation deferred

---

## Data Model

### Cached Redemption Entry
```json
{
  "program": "Aeroplan",
  "destination": "Japan",
  "region": "Asia",
  "cabin": "Business",
  "points_required": 65000,
  "pricing_type": "fixed",
  "points_range": [55000, 90000],
  "source_url": "https://onemileatatime.com/...",
  "source_site": "OMAAT",
  "source_geo": "US",
  "published_date": "2026-03-15",
  "notes": "Star Alliance partners, no fuel surcharges"
}
```

- `pricing_type`: `"fixed"` or `"dynamic"`
- `points_range`: populated for dynamic programs only
- `source_geo`: geographic focus of the source (`"US"`, `"CA"`, `"AU"`, `"UK"`) — used to weight recommendations for non-US programs appropriately

### Seed Dataset (v0.1)

Manually curated ~50 entries covering the most well-known sweet spots across major programs. Sample:

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
    "notes": "Star Alliance partners, no fuel surcharges on most carriers"
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
    "notes": "Park Hyatt Maldives, Category 6, per night"
  },
  {
    "program": "Chase UR via Hyatt",
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
    "notes": "Andaz Costa Rica, Category 4, transfers 1:1 from Chase UR"
  },
  {
    "program": "Virgin Atlantic Flying Club",
    "destination": "Japan",
    "region": "Asia",
    "cabin": "Upper Class",
    "points_required": 60000,
    "pricing_type": "fixed",
    "points_range": null,
    "source_url": "https://onemileatatime.com/virgin-atlantic-ana-sweet-spot/",
    "source_site": "OMAAT",
    "source_geo": "US",
    "published_date": "2025-12-01",
    "notes": "ANA Upper Class via Virgin Atlantic miles, one of the best business class values"
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
    "notes": "Dynamic pricing, check at time of booking. Star Alliance partners included."
  }
]
```

### Transfer Partners (static, manually maintained)
Separate `cache/transfer-partners.json` file. Not crawled. Designed to support gap analysis in a future version (v2).

```json
{
  "Chase UR": ["Aeroplan", "United", "Hyatt", "British Airways"],
  "Amex MR": ["Delta", "British Airways", "ANA", "Singapore Airlines"]
}
```

---

## Source Sites

| # | Site | URL | Geo Focus |
|---|------|-----|-----------|
| 1 | One Mile at a Time | onemileatatime.com | US |
| 2 | The Points Guy | thepointsguy.com | US |
| 3 | Upgraded Points | upgradedpoints.com | US |
| 4 | Live and Let's Fly | liveandletsfly.com | US |
| 5 | View from the Wing | viewfromthewing.com | US |
| 6 | Prince of Travel | princeoftravel.com | CA |
| 7 | Frequent Miler | frequentmiler.com | US |
| 8 | Deals We Like | dealswelike.com | US |
| 9 | Paddle Your Own Kanoo | paddleyourownkanoo.com | UK |
| 10 | Turn Left for Less | turnleftforless.com | AU/NZ |

---

## User Input

```
Point Balances:
  [ Program dropdown ] [ Amount ] [ + Add another ]

Travel Preferences:
  [ Dream destinations — free text, e.g. "Japan, Southeast Asia" ]
```

No auth. No user accounts. Balances are not persisted between sessions.

---

## Results Page

### v0.1 — Two Sections

#### 1. You Can Go Here Now
Redemptions within the user's current balances, ranked by cents-per-point value. Each card shows: destination, program, cabin, points required, and a short explanation from Claude.

#### 2. Your Dream Destinations
For each destination the user listed:
- If reachable: highlighted as such, shown with best redemption path
- If not reachable: shown with cost, current balance, and point gap

Dynamic program entries show a range (e.g. "55,000–90,000 pts") with a disclaimer that pricing varies.

### v1 Addition — Third Section

#### 3. You Might Not Have Considered
Surprise destinations within reach that the user didn't list. Claude selects these based on the balance and cached data, prioritizing high-value redemptions.

---

## Crawler Behavior

1. Launch Playwright browser
2. For each of the 10 sites: navigate to homepage or relevant category page (deals, sweet spots, award alerts)
3. Pass page content to Claude with a structured extraction prompt
4. Claude returns an array of redemption entries matching the data model
5. Merge new entries into `cache/redemptions.json`, deduplicate by (program + destination + cabin + source_site)
6. Prune entries with `published_date` older than 30 days
7. Log run timestamp and entry count to `cache/crawler-log.json`

---

## Tech Stack

- **Frontend + API**: Next.js (App Router)
- **Crawler**: Node.js + Playwright
- **Claude**: Anthropic SDK (`claude-sonnet-4-6` for both crawler extraction and query-time reasoning)
- **Cache**: Local JSON files (`cache/`) — no database for v1
- **Styling**: Tailwind CSS

---

## Out of Scope (v0.1)

- Crawler — replaced by manual seed dataset
- "You Might Not Have Considered" section
- Open-to-suggestions toggle

## Out of Scope (v1)

- Transfer partner gap analysis ("you need 40k more to reach this destination") — data model supports it, logic deferred to v2
- User accounts or saved balances
- Real-time award availability
- Automated cron scheduling for crawler
- Mobile app

---

## Future Considerations (v2+)

- Transfer partner reasoning: show how to bridge the gap to a dream destination
- Cron-scheduled crawler
- User accounts with saved preferences
- Live award availability via scraping or partner APIs
