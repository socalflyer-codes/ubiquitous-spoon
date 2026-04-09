# CLOSING_TIME.md
> End-of-session checklist. Run this before closing every session.
> Goal: next session requires zero context from this one.
> Last updated: 2026-04-08

---

## CHECKLIST

### 1. Code
- [ ] All changes committed — `git status` clean in worktree
- [ ] Worktree feature branch pushed to GitHub
- [ ] Main branch pushed to GitHub
- [ ] No half-finished thoughts sitting in code comments that should be in a `.md` instead

### 2. Decisions
- [ ] Every non-obvious decision made this session logged in `DECISIONS.md`
- [ ] Each entry has: context, decision, rejected alternatives, reason, how to revisit

### 3. Documentation
- [ ] `PROJECT.md` — current status updated; "What's not done yet" is specific enough that cold-start Claude knows exactly where to pick up (not just "run test:agents" but what to expect and what to check if it fails)
- [ ] `CHANGELOG.md` — what changed, what was skipped, what's next
- [ ] `COMPONENTS.md` — any new components added with full entry
- [ ] `ARCHITECTURE.md` — any stack or pattern changes reflected
- [ ] `DESIGN.md` — any new tokens, rules, or component patterns added
- [ ] `DECISIONS.md` — all decisions from this session logged
- [ ] `PROMPTS.md` — any patterns used this session: did they work? Update if not. Add new ones if a recurring task emerged.

### 4. Data integrity
- [ ] Any seed entries added or changed this session — `verified: true/false` set correctly
- [ ] Seed changes reflected in locked test cases — do existing cases still test the right thing?
- [ ] Any entries changed that invalidate a locked case — update `test-scenarios.mjs` accordingly

### 5. Deferred work
- [ ] Anything explicitly punted this session is captured in `PROJECT.md` "What's not done yet" or `CHANGELOG.md` "Next" — not floating
- [ ] Any unresolved questions added to the relevant `.md` file's open questions table

### 6. Push
- [ ] All updated `.md` files committed and pushed
- [ ] `git status` clean on main
- [ ] `git log --oneline -3` confirms remote is up to date

---

## VERIFY HANDOFF

Before closing, ask: **"Could someone open this repo cold tomorrow and know exactly where things stand?"**

If yes — close.
If no — find what's missing and add it.

---

## QUICK COMMANDS

```bash
# Check nothing is uncommitted
git status

# Push everything
git add <files> && git commit -m "docs: end of session update" && git push

# Verify remote is up to date
git log --oneline -5
```
