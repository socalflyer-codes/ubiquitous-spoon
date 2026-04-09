# CLOSING_TIME.md
> End-of-session checklist. Run this before closing every session.
> Goal: next session requires zero context from this one.
> Last updated: 2026-04-08

---

## CHECKLIST

### 1. Code
- [ ] All changes committed (run `git status` — working tree should be clean)
- [ ] Feature branch pushed to GitHub
- [ ] Main branch pushed to GitHub
- [ ] No uncommitted work left in worktree

### 2. Decisions
- [ ] Every non-obvious decision made this session is logged in `DECISIONS.md`
- [ ] Each entry has: context, decision, rejected alternatives, reason, how to revisit

### 3. Documentation
- [ ] `PROJECT.md` — current status, what exists, what's not done yet
- [ ] `CHANGELOG.md` — what changed, what was skipped, what's next
- [ ] `COMPONENTS.md` — any new components added with full entry
- [ ] `ARCHITECTURE.md` — any stack or pattern changes reflected
- [ ] `DESIGN.md` — any new tokens, rules, or component patterns added
- [ ] `DECISIONS.md` — all decisions from this session logged
- [ ] `PROMPTS.md` — any new recurring task patterns discovered added

### 4. Open questions
- [ ] Any unresolved questions added to the relevant `.md` file's open questions table
- [ ] Any known bugs or regressions not fixed this session noted in `PROJECT.md` under "What's not done yet"

### 5. Push
- [ ] All updated `.md` files committed and pushed (`git status` clean on main)

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
