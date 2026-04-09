# PROMPTS.md
> Prompt patterns that produce reliable results for recurring tasks.
> A playbook, not a library.
> Last updated: 2026-04-08

---

## ENTRY FORMAT

### [P-ID] Task Type
- **Pattern:** What to always include
- **Reliably produces:** What this consistently gets right
- **Doesn't produce:** What needs a separate ask
- **Example trigger:** Sample phrasing

---

## PATTERNS

### [P-001] New Feature Build
- **Pattern:** Feature name + user story (as a [user] I want [x] so that [y]) + acceptance criteria + files in scope + explicit out of scope
- **Reliably produces:** Focused build, clean component boundaries, no feature drift
- **Doesn't produce:** Design decisions — reference existing components separately
- **Example trigger:** "Build [feature]. User story: as a [user] I want [x] so that [y]. In scope: [files]. Out of scope: [x, y]."

### [P-002] New Component
- **Pattern:** Component name + location in UI + props + behaviour + edge cases + related components
- **Reliably produces:** Self-contained reusable component consistent with existing patterns
- **Doesn't produce:** Type updates — update `types/index.ts` separately first
- **Example trigger:** "Build a [name] component. Lives in [location]. Props: [list]. Behaviour: [describe]. Edge cases: [list]. Related to: [components]."

### [P-003] UI Restyling
- **Pattern:** Component/page + what feels wrong + the rule it should follow + what must not change
- **Reliably produces:** Targeted style fix without side effects
- **Doesn't produce:** System-wide changes — update the relevant component pattern first
- **Example trigger:** "Restyle [component]. Currently feels [x]. Should follow [rule]. Do not change [y]."

### [P-004] Refactor
- **Pattern:** File/function in scope + problem + desired outcome + constraint
- **Reliably produces:** Clean refactor within scope, no feature drift
- **Doesn't produce:** Cross-file refactors — one file at a time
- **Example trigger:** "Refactor [file]. Problem: [x]. Goal: [y]. Constraint: [readability/performance]."

### [P-005] Weekly .md Update
- **Pattern:** Paste changed files + "update based on our session" + list key decisions/changes inline
- **Reliably produces:** Clean consistent updates in one pass
- **Doesn't produce:** Updates to files not pasted — always paste every file to update
- **Example trigger:** "Session ending. Files changed: [paste]. Key decisions: [list]. Update accordingly."

### [P-006] Seed Data Entry
- **Pattern:** Program + route (origin → destination) + distance in miles + cabin + source URL
- **Reliably produces:** Correctly scoped seed entry with accurate range and notes
- **Doesn't produce:** Verification — always cross-check points_range[0] against published award chart
- **Example trigger:** "Add seed entry: [program], [origin] → [destination], [distance] miles, economy. Source: [URL]."

### [P-007] Test Agent Scenario
- **Pattern:** What Claude judgment is being tested + expected winner + why it should win (points floor + program)
- **Reliably produces:** Locked case + matching validation rule in one pass
- **Doesn't produce:** Random pool updates — pool is generated automatically
- **Example trigger:** "Add locked test case: [origin] → [destination], [program A] should beat [program B] because [floor A] < [floor B]."

---

## TO ADD

- New API route
- Debugging / error resolution
- Prompt tuning (explanation quality)
