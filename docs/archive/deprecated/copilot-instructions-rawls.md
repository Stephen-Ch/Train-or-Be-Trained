---
version: v2025.11.27
project: Rawls Game
date: 2025-11-27
---

# Copilot Instructions - Rawls Game

Goal: Keep AI edits safe, small, and green.

---

## Prompt Template

Every change prompt should follow this structure:

### 1. Goal
One-line description of the desired outcome.

### 2. Current Behavior (Observation Only)
Copilot MUST describe what the code currently does before proposing changes.
- Read the relevant files first
- Trace the data/control flow
- Do NOT suggest fixes yet

### 3. Hypothesis & Risks
List assumptions and 2–3 things that could go wrong:
- What existing tests might fail?
- What other code depends on this?
- Are there simpler alternatives?

### 4. Plan (Steps)
Numbered steps. Execute step 1 only, then report.

### 5. Change
Only after the above sections are complete.

### 6. What to Report Back
- Exit codes from test/build
- Confidence level (High/Medium/Low)
- Remaining risks or suggested follow-ups

---

## Explicit Rules

1. **No browser testing claims**: Never claim "I manually tested in a browser." You can only report test results, build status, and code inspection findings.

2. **Analysis-first for hot files**: Before changing these files, run an analysis-only prompt first:
   - `question.component.ts`
   - `session.store.ts`
   - `app.routes.ts`
   - Any file touched in the last 3 prompts

3. **Observation before action**: Always describe current behavior before proposing changes. If you cannot explain what the code does, read more files first.

4. **Risk listing is mandatory**: Every change prompt must list at least 2 risks before implementation.

---

## Boot Prompt

Use .github/copilot-instructions-rawls.md as rules.
Make a numbered plan, then apply step 1 only.
Echo CWD + versions before commands; print exit codes after.
No new deps; no SSR. App zoneless; tests may import zone.js/testing.
Stop on error; propose minimal fix and wait.

## Fix Loop Prompt

Fix only the last failing step. Show patch + commands + exit codes. Never widen scope.

## Stoplight Rules

- **Green** = commit
- **Yellow** = minimal fix
- **Red** = revert then retest

Copilot must read code-review-guide-rawls.md before planning and after each green change.
