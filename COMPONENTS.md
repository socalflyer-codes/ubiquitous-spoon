# COMPONENTS.md
> Inventory of all built components, props, behaviour, and relationships.
> Last updated: 2026-04-08

---

## HOW THIS FILE WORKS

- **Updated:** Every time a new component is built — end of session
- **Authority:** If it exists here, use it before building a new one
- **Conflicts:** Changes to props/behaviour need a DECISIONS.md entry first

---

## ENTRY FORMAT

### [C-ID] ComponentName
- **Location:** `components/ComponentName.tsx`
- **Purpose:** One sentence
- **Props:**
  - propName (type, required/optional) — description
- **Behaviour:** Non-obvious interactions or states
- **Related components:** Uses or used by
- **Notes:** Anything future-me needs to know

---

## COMPONENTS

### [C-001] ResultCard
- **Location:** `components/ResultCard.tsx`
- **Purpose:** Displays a single redemption option with booking details and status badge.
- **Props:**
  - entry (RedemptionEntry, required) — seed data entry to display
  - matchedProgram (string, required) — e.g. "Chase Ultimate Rewards → United MileagePlus"
  - userBalance (number, required) — user's points balance
  - gap (number | null, optional) — points short; null = bookable
  - hasProgram (boolean, optional, default true) — false = gray "Need: [program]" chip
  - originCode (string, optional) — IATA code for booking URL construction
  - destinationLabel (string, optional) — overrides entry.destination for display
  - transferBonus (TransferBonus | null, optional) — shows amber bonus banner if active
- **Behaviour:**
  - Shows green "Bookable" badge when gap is null and hasProgram is true
  - Shows amber "X pts short" badge when gap is set
  - Dynamic entries display points_range as "10,000–15,000 points", not midpoint
  - "Show details" toggle reveals notes and source
  - "Search availability →" CTA only appears when bookable and booking URL exists
  - Transfer instruction shown when bookable and program requires a transfer step
- **Related components:** Used by `ResultsSection`, rendered in `app/results/page.tsx`
- **Notes:** Booking URLs only built for United MileagePlus and BA Avios currently. `DESTINATION_CODES` and `ORIGIN_CODES` maps must be kept in sync with supported cities.

### [C-002] ResultsSection
- **Location:** `components/ResultsSection.tsx`
- **Purpose:** Section wrapper with a bold heading and bottom border.
- **Props:**
  - heading (string, required) — section title
  - children (ReactNode, required)
- **Behaviour:** No interactivity. Pure layout wrapper.
- **Related components:** Used in `app/results/page.tsx` to wrap dream destination cards and reachable cards.

### [C-003] BalanceInput
- **Location:** `components/BalanceInput.tsx`
- **Purpose:** Number input for a single loyalty program balance.
- **Props:** (see types/index.ts — Balance type)
- **Related components:** Used in `app/page.tsx`

### [C-004] DestinationInput
- **Location:** `components/DestinationInput.tsx`
- **Purpose:** Multi-select destination picker grouped by category (Cities / International).
- **Behaviour:**
  - Cities tab active by default
  - International tab disabled for v0.1
  - Selected destinations highlighted; click again to deselect
- **Related components:** Used in `app/page.tsx`

### [C-005] OriginInput
- **Location:** `components/OriginInput.tsx`
- **Purpose:** Single-select departure city picker.
- **Behaviour:** Tab-to-complete supported. City → IATA mapping handled internally.
- **Related components:** Used in `app/page.tsx`

---

## CHECKLIST

Before building a new component:
- [ ] Does it already exist in this file?
- [ ] Does it follow DESIGN.md tokens?
- [ ] Is it under `components/`?
- [ ] Will it be added here at end of session?
