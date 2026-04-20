# Rawls Game – Workflow v2 Cheat Sheet

## 0. Before coding

- From repo root:
  - `npm run content:export-app`
  - `npm run test`
  - `npm run build`

## 1. Branch & Scope

- Create a branch per concern:
  - `git checkout -b <concern>-vN`
  - Examples:
    - `content-pipeline-v1`
    - `question-flow-v2`
    - `persona-engine-v1`
    - `ui-polish-v1`
- In your session notes:
  - **In scope:** …
  - **Out of scope:** …

## 2. Copilot prompt pattern (6 parts)

For each non-trivial task, structure the prompt:

1. **Goal** – 1 sentence.
2. **Current Behavior (Observation Only)** – describe what the code does now.
3. **Hypothesis & Risks** – assumptions + 2–3 risks.
4. **Plan (Steps)** – numbered list.
5. **Change** – only after the above is clear.
6. **What to Report Back** – tests run, files touched, key behavior.

Rules:

- For hot files (question.component.ts, session store, routing):
  - First prompt must be **analysis-only**.
- Ignore any "I manually tested in a browser" claim from Copilot; trust tests + your own browser.

## 3. Tests before flow changes

When changing Question / Session / Routing:

1. Add/update at least one **failing** spec or E2E test:
   - Unit/integration: QuestionComponent with real-ish JSON shape.
   - Playwright (target state from code-review-guide-rawls.md):
     - Single-category: select 1, answer all, Continue → done/review.
     - Multi-category: select 2, complete first, Continue → second appears.
2. Only then change code until:
   - `npm run test`
   - `npm run build`
   are both green.

Mocks:

- Match **rawls-values.generated.json**:
  - Same ID pattern (`liberty-q0`, etc.).
  - Same object shape.

## 4. Debug protocol

Permanent tools:

- `?debugQuestion=1`
  - Logs: routeCategoryId, phase, category, question, options, followUps.
- `?debugIds=1` (when implemented)
  - Renders small ID tags for category/question/follow-ups.
  - Never share this URL with testers.

Before committing a flow change:

- Manual 1-category run.
- Manual 2-category run.
- Note any weirdness in your session notes.

## 5. When to use GitHub agents

**Good agent targets:**

- `persona-engine.ts` and other pure helpers.
- Content scripts (exporters, integrity checks).
- Docs and Decisions entries.

**Manual/tightly supervised:**

- `question.component.ts`
- Session/store logic
- App routing

Only let an agent touch those when:

- You already have a failing test that captures the bug/feature.
- The agent's job is strictly "make this test pass" without changing other behavior.

## 6. If you feel churn

If you notice:

- Repeated prompts touching the same hot file,
- Tests green but browser wrong,
- "One more tweak" thoughts:

Then:

1. Stop editing that file.
2. Log current behavior + known bugs.
3. Plan a new branch focused only on that concern with:
   - Failing tests upfront.
   - Clear scope + out-of-scope.
