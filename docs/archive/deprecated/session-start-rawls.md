---
version: v2025.11.27
project: Rawls Game
date: 2025-11-27
---

# Session Start Card

## Pre-Prompt

1. Read `project-rawls.md` + `code-review-guide-rawls.md`
2. State goal in one line
3. Confirm tests green

---

## Branch & Scope Rules

**Always create a new branch per concern before coding:**
- `content-pipeline-v1` — content JSON structure, export scripts
- `question-flow-v2` — QuestionComponent, navigation, Continue logic
- `persona-engine-v1` — scoring, result calculation
- `ui-polish-v1` — styling, accessibility, layout

**At the start of each session, explicitly list:**
```
In scope:
- [specific files/features you will touch]

Out of scope:
- [files/features you will NOT touch in this branch]
```

Do not touch out-of-scope areas in this branch.

---

## Debug Protocol

**When working on questions or flow:**
- Use `?debug=1` to show debug HUD with route/category/option info
- Use `?debugQuestion=1` (when available) to log route/category/question/options/followUps
- Use `?debugIds=1` (when available) to show internal IDs for content review; never enable for end users

**Before committing any flow change in Question or Session:**
1. Run a 1-category smoke test manually (select 1 category, complete it, verify Continue)
2. Run a 2-category smoke test manually (select 2 categories, verify sequence and Continue between them)
3. Record observed behavior even if known-buggy

---

## Per-Prompt

- Prefix: review `code-review-guide-rawls.md` for consistency
- One diff ≤ 2 files ≤ 60 LOC
- Add or update tests for each feature

## Post-Prompt

1. Run `npm run build && npm run test`
2. Green → commit + update `code-review-guide-rawls.md`
3. Red → minimal fix then retest
