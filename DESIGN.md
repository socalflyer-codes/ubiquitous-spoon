# DESIGN.md
> Visual language, design tokens, and UX rules.
> Last updated: 2026-04-08

---

## DESIGN DIRECTION

**Vibe:** Friendly + minimal. Approachable and soft without being cluttered.

**Principles:**
- Whitespace is a feature — don't fill it
- Rounded but restrained — soft edges, not bubbly
- Data is the hero — UI gets out of the way
- One visual focal point per screen

---

## COLOUR PALETTE

| Token | Tailwind class | Usage |
|---|---|---|
| primary | blue-600 | CTAs, active states, links |
| primary-light | blue-50 | Explanation box background |
| success | green-100 / green-700 | Bookable badge |
| warning | amber-100 / amber-700 | Points-short badge, transfer bonus banner |
| neutral-900 | gray-900 | Primary text, headings |
| neutral-700 | gray-700 | Bold inline text |
| neutral-600 | gray-600 | Cabin/airline line |
| neutral-500 | gray-500 | Secondary text, points display |
| neutral-400 | gray-400 | Captions, show/hide toggle |
| neutral-200 | gray-200 | Card borders |
| neutral-100 | gray-100 | Dividers |
| neutral-50 | gray-50 | Transfer instruction background |
| white | white | Card backgrounds |

No dark mode for v0.1.

---

## TYPOGRAPHY

| Role | Tailwind |
|---|---|
| Page title | text-3xl font-bold |
| Card destination | text-xl font-bold |
| Section heading | text-xl font-bold |
| Body / points display | text-sm |
| Caption / details | text-xs |

Font: System stack. Body: leading-relaxed. Headings: leading-tight.

---

## SPACING

- Card padding: p-5
- Card internal gap: space-y-4
- Section gap: space-y-12
- Page max width: max-w-2xl centered, px-6 py-16

---

## SHAPE

- Cards: rounded-xl
- Buttons: rounded-lg (CTA), rounded-full (badges)
- Inputs: rounded-lg
- Explanation box: rounded-xl
- No sharp corners anywhere

---

## ELEVATION

- Cards: shadow-sm + border border-gray-200
- No hover elevation changes on cards

---

## INTERACTIVE STATES

| State | Treatment |
|---|---|
| Hover (links) | underline |
| Hover (CTA button) | bg-blue-700 |
| Active (origin/destination toggle) | highlighted background |
| Disabled | opacity-50, no pointer events |
| Loading | none yet — results page replaces form on navigate |
| Error | inline red text, not a modal |

---

## COMPONENT RULES

- Cards are the primary container
- No modals for v0.1 — inline expansion only (show/hide details toggle)
- No tooltips for v0.1 — labels must be self-explanatory
- Badges carry status (Bookable = green, X pts short = amber)
- Empty states: always a helpful message, never blank
- Explanation box always appears above results sections

---

## OPEN QUESTIONS

| Question | Raised | Resolved |
|---|---|---|
| Blue accent feels generic for travel/points — revisit? | 2026-04-08 | No |
