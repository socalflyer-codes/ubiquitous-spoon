# Claude Routing Guide
> Read this file first, every session, no exceptions.
> Last updated: 2026-04-08

---

## SESSION START PROTOCOL

1. **Read** `PROJECT.md` to confirm current project state and active worktree
2. **Confirm** what you're about to work on in one sentence before proceeding
3. **Route** the request using the mode selection table below
4. **Flag** anything ambiguous before touching any file or code

---

## AMBIGUITY PROTOCOL

If a request does not clearly match a routing rule:
- Do not assume
- Do not proceed
- Flag the ambiguity explicitly
- Ask one clarifying question to resolve it
- Then route and proceed

---

## Mode Selection

| Task type | Model | Load these files |
|-----------|-------|---------|
| Planning, architecture, design | sonnet | `PROJECT.md` + `DECISIONS.md` + `PRD.md` + `ARCHITECTURE.md` |
| New feature or scope decision | sonnet | `PRD.md` + `DECISIONS.md` |
| UI / styling / layout | haiku | `DESIGN.md` + `COMPONENTS.md` |
| New component | sonnet | `COMPONENTS.md` + `DESIGN.md` |
| Multi-file implementation, complex execution | sonnet | `PROJECT.md` + relevant plan doc |
| Single-file edits, quick fixes, lookups | haiku | file path only |
| Technical or process decision | sonnet | `DECISIONS.md` |
| Weekly update / end of session | haiku | `CHANGELOG.md` + any files changed this session |
| Recurring task (seed entry, test case, component) | haiku | `PROMPTS.md` |
| Anything that doesn't fit above | — | STOP — flag it, ask before proceeding |

**Rule of thumb:**
- Touching >1 file or unsure of scope → sonnet
- You can point me at the exact file and line → haiku

---

## Planning Mode (sonnet)

**Trigger:** Ambiguous scope, architecture decisions, new features, anything irreversible.

**You provide:** Goal + constraints. I explore and plan.

**I will:**
- Run the full planning gate (files, steps, assumptions, token impact)
- Load relevant memory and project context
- Ask one clarifying question if something is genuinely ambiguous
- Not write a single line of code until you confirm the plan

**I skip:** Nothing. This is the high-context mode.

---

## High-Effort Execution Mode (sonnet)

**Trigger:** You have a confirmed plan and are executing it. Multi-step, multi-file.

**You provide:** The plan doc path or a paste of the steps.

**I will:**
- Work step by step, checking in at natural breakpoints
- Load only files relevant to the current step
- Flag unexpected findings before continuing

**I skip:** Re-exploring context already in the plan, rewriting the plan, memory files unrelated to the task.

---

## Low-Effort Mode (haiku)

**Trigger:** Isolated, well-scoped task. Single file, obvious change.

**You provide:** File path + what to change. Be precise.

**I will:**
- Go straight to the edit
- Give a one-line explanation if anything is non-obvious
- Suggest a commit message when done

**I skip:** Memory loading, planning gate, exploration, explanations unless asked, summaries of what I just did.

---

## Mid-Session Switching

```
/model haiku   # drop to low-effort for a quick fix
/model sonnet  # come back up for something complex
```

Switch as often as needed. Context persists across switches.

---

## END OF SESSION PROTOCOL

1. Remind the user: "Session ending — want to update any .md files before we close?"
2. Wait for their decision
3. If yes — run through `CLOSING_TIME.md` checklist together
4. If no — note it and close

---

## RULES

- Never skip the session start protocol
- Never deviate from the tech stack without flagging it first
- Always flag ambiguity before proceeding
- Never commit automatically — suggest a commit message and wait for approval

---

## Request Phrasing

The clearer your request, the less I explore, the fewer tokens consumed.

| Instead of... | Say... |
|---------------|--------|
| "fix the bug in the auth flow" | "fix bug in `src/auth/login.ts:42` — wrong status code on failed login" |
| "add a feature to the advisor" | "add X to `src/advisor/index.ts` — here's the spec" |
| "look into why X is slow" | (sonnet, planning mode — scope is unclear) |
