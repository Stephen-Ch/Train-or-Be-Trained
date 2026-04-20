# New AI Handoff — Rawls Game

## 1. How to operate
- Always start responses with PROMPT-ID and the four-line Prompt Review Gate (What / Best next step? / Confidence / Command Lock).
- Nothing (no file reads, searches, commands) happens before the Gate. If violated, stop, report, wait for direction.
- Immediately follow the Gate with Proof-of-Read (path + quote + "Applying: <rule>").
- One prompt → one completion report. Do not plan the next prompt until the operator pastes and acknowledges the report.
- Stop on any non-zero exit, propose the smallest recovery path, and wait for approval.

## 2. Canonical docs to read first
1. [docs/protocol/protocol-v7.md](docs/protocol/protocol-v7.md)
2. [docs/protocol/copilot-instructions-v7.md](docs/protocol/copilot-instructions-v7.md)
3. [docs/protocol/stay-on-track.md](docs/protocol/stay-on-track.md)
4. [docs/protocol/working-agreement-v1.md](docs/protocol/working-agreement-v1.md)
5. [docs/status/solution-report.md](docs/status/solution-report.md)
6. [docs/status/tech-debt-and-future-work.md](docs/status/tech-debt-and-future-work.md)
7. [docs/_shared/CURRENT.md](docs/_shared/CURRENT.md) (snapshot pointer)

## 3. Current vocab + UI locks
- Ideals → Positions → Challenges is the only allowed player-facing stack; copy comes from `docs/status/solution-report.md` decisions and `src/app/shared/terminology.ts`.
- Likert labels stay terminology-locked (Strongly oppose → Strongly support) for both positions and challenges.
- Veil-of-ignorance reminder: QuestionV2 + Review now show a persistent "What mindset?" toggle whose acknowledgment is stored via `SessionStore`; never rename this UX element without updating dictionary entries.

## 4. Current state (what just shipped)
- Latest entries in [docs/status/solution-report.md](docs/status/solution-report.md) cover veil reminder persistence, QuestionV2 headers/context, placeholder challenges, and review count fixes (all on 2025-12-25).
- Open work is prioritized in [docs/status/tech-debt-and-future-work.md](docs/status/tech-debt-and-future-work.md): adaptive challenges MVP (TD-RAWLS-011), admin category reordering, persona system restoration, social sharing, and PWA polish.

## 5. Known landmines
- Hot files: `question.component.ts`, `question-v2.component.ts`, `session.store.ts`, `app.routes.ts`, `content.service.ts`, `scripts/content-build.js`, plus anything touched in the last three prompts (see solution report). Touching them requires an analysis-first or full-file replacement prompt.
- Deep-link behaviors: `/q/:id` now rotates start ideals and only routes to `/review` when the user completes an item in-session; ensure tests keep production IDs (liberty-q0, etc.).
- Content-dependent 0/0 problems: Always measure `src/assets/content/rawls-values.generated.json` before assuming counts; contract tests must import the real artifact.
- Completion report requirements are strict: missing commit hash, git status, git diff, or test/build lines will block acceptance.

## 6. Standard commands
- Always run `npm run test` and `npm run build` for code prompts (Green Gate) and record their PASS/FAIL plus totals/warnings.
- When touching `content/*`, `scripts/content-*`, or `src/assets/content/rawls-values.generated.json`, also run `npm run content:lint` followed by `npm run content:export-app` before the Green Gate.
- Admin patches flow through `npm run admin:apply-patch -- --patch ./path/to.json` (dry run) and repeat with `--write` when ready, then rebuild/export content.

## 7. Where to log work
- [docs/status/solution-report.md](docs/status/solution-report.md) — Add a dated entry for every change landed (what changed, files touched, measurement, test/build results).
- [docs/testing/test-catalog.md](docs/testing/test-catalog.md) — Update the row for each touched spec and include @human lines in completion reports.
- [docs/status/tech-debt-and-future-work.md](docs/status/tech-debt-and-future-work.md) — Record new debt, park blocked work, and update sprint buckets.

## 8. Definition of Done for any prompt
- Prompt Review Gate printed before any action; Proof-of-Read immediately afterward.
- Working tree clean at finish (`git status --porcelain` empty) and `git diff --name-only` captured in the report.
- Required commands executed and logged: `npm run test`, `npm run build` (and content/patch commands when applicable).
- Completion report explicitly lists: latest commit hash + subject, git status output (empty), git diff names, test/build results, and spec @human lines if tests were edited.
- Operator receives a single, fence-free markdown report covering entry points touched, files edited, and next steps (if any).
