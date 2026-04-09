# OPENING_TIME.md
> Start-of-session checklist. Run this before touching any file or code.
> Goal: understand exactly where things stand before doing anything.
> Last updated: 2026-04-08

---

## CHECKLIST

### 1. Orient
- [ ] Read `ROUTING.md` — session start protocol, routing table
- [ ] Read `PROJECT.md` — current status, what's not done yet, key file locations
- [ ] Read `CHANGELOG.md` — last entry's "Next" section tells you where to pick up

### 2. Verify state
- [ ] Confirm active worktree branch: `git -C .worktrees/points-advisor-v0.1 status`
- [ ] Confirm main is up to date with remote: `git status`
- [ ] Check for any uncommitted work left from last session — if found, surface to user before proceeding

### 3. Route the request
- [ ] User states what they want to work on
- [ ] Match to routing table in `ROUTING.md` — load the specified files
- [ ] Confirm in one sentence what you're about to do before proceeding
- [ ] Flag anything ambiguous before touching any file or code

### 4. Before writing any code
- [ ] Is this request covered by an existing plan in `docs/superpowers/plans/`?
- [ ] Does the relevant component already exist in `COMPONENTS.md`?
- [ ] Is there a prompt pattern in `PROMPTS.md` for this task type?
- [ ] Would this decision warrant a `DECISIONS.md` entry? Flag it now, log it at close.

---

## VERIFY READINESS

Before starting work, ask: **"Do I know what exists, what's broken, and what's next?"**

If yes — proceed.
If no — read until you do.
