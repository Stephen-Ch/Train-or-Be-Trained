# AI Snapshot – Rawls Game

> Quick reference for external AI assistants. Keep under 200 lines.

---

## 1. Project Overview

- **Purpose:** Values-prioritization game inspired by Rawls’ veil of ignorance. Players select categories, answer Likert questions + optional challenges, then review a persona summary.
- **Stack:** Angular 20 (standalone, zoneless, signals) + Tailwind. Tests via Karma/Jasmine; Playwright scaffold exists but hangs locally.
- **Content pipeline:** `content/categories/*.json` → `npm run content:build` → `src/assets/content/rawls-values.generated.json`. Admin patch tooling lives under `scripts/` and `/admin/content` to keep source JSON canonical.
- **Docs center:** `docs/vibe-coding/*` (protocol, copilot instructions, stay-on-track). Always read `docs/project/RAWLS-START-HERE.md` before touching anything.

---

## 2. Hot Files & Modules

| Area | Why it’s hot | Files |
|------|--------------|-------|
| Question flow | Main gameplay (QuestionV2 + legacy Question) | `src/app/features/question-v2.component.ts`, `src/app/features/question.component.ts`, specs |
| Session store | Tracks selections, answers, routing state | `src/app/core/session/session.store.ts` + spec |
| Routing & guards | Defines `/`, `/select`, `/q/:id`, `/review`, `/result`, `/store`, `/admin/content` plus result guard | `src/app/app.routes.ts`, `src/app/features/result.guard.ts`
| Content pipeline | Validates + generates `rawls-values.generated.json` | `scripts/content-build.js`, `scripts/content-lint.js`, `content/categories/*.json`
| Admin content explorer | Shape-proof + contract tests for challenge editing | `src/app/features/admin/admin-content-explorer.component.ts` + spec |
| Persona/scoring | Computes radar/result copy | `src/app/core/engine/profile.ts`

Hot files require analysis-first prompts or full replacements per vibe-c protocol.

---

## 3. Branch & Scope Template
- **Branch:** `main` (create feature branches for multi-step fixes)
- **In scope:** *(fill per session)*
- **Out of scope:** *(fill per session; respect docs-only prompts)*

---

## 4. Recent Changes (git log)
- **2025-12-28 – 1eca662**: “Docs: align Rawls with latest portable vibe-coding kit” (source-of-truth move to `docs/vibe-coding/*`).
- **2025-12-27 – 4447ca0**: “docs: add docs index + new AI handoff” (challenge editing settled handoff).
- **2025-12-27 – 05a8dd8**: “docs: apply postmortem workflow fixes + publish shared snapshot v9”.
- **2025-12-26 – 8783432**: “docs: fix postmortem accuracy + update archive references”.
- **2025-12-25 – 5a7d92b**: “docs: session cleanup + copilot postmortem (2025-12-25)”.

Earlier commits restored admin challenge editing guardrails and added production shape-proof tests.

---

## 4a. Production Content Shape (Evidence-Based, 2025-12-30)

Verified by PRODUCTION SHAPE PROOF in `admin-content-explorer.component.spec.ts`:

- **positionCount:** 28 (7 ideals × 4 positions)
- **flatChallengeCount:** 0 (legacy flat schema, deprecated)
- **nestedChallengeCount:** 13 (current nested challenges in `followUps[].challenges[]` arrays)

**Evidence:** Run shape-proof spec to see LOG lines. Contract test fails if counts change, signaling schema migration.

## 5. Known Issues / Active Work
- **TD-RAWLS-001 / FW-RAWLS-001:** Playwright e2e runs hang on `newPage().goto`. Root cause suspected HVCI; blocked until OS experiment.
- **TD-RAWLS-004:** Review component shows the entire answer log (needs filtering/grouping).
- **TD-RAWLS-005 / FW-RAWLS-003:** `share-card.service.ts` stubbed; social sharing + PNG export incomplete.
- **TD-RAWLS-006 & FW-RAWLS-004:** PWA manifest/icons/offline caching need polish.
- **TD-RAWLS-009:** Some specs previously used invented IDs; continue enforcing “use real production JSON.”
- **TD-RAWLS-011:** Adaptive challenges MVP (rule-based triggerRule schema) SHIPPED (commits 6ef96ff-a477a33). Next: TD-RAWLS-012 (uncertainty detection), TD-RAWLS-013 (persona-based selection). See docs/status/tech-debt-and-future-work.md#adaptive-challenges-shipped.
- **Contract guard:** Admin challenge editing removed until contract test (challengeCount>0) fails—see docs/handoffs/handoff-2025-12-23.

---

## 6. Commands & Tests

| Command | Purpose |
|---------|---------|
| `npm ci` | Clean install (never `npm install` on CI) |
| `npm run test` | Karma/Jasmine suite (170/171 passing, 1 Playwright skip) |
| `npm run build` | Production build / Green Gate part 2 |
| `npm run content:lint` | Validates `content/categories/*.json` against schema |
| `npm run content:build` | Generates `dist` artifact + checks counts |
| `npm run content:export-app` | Writes `src/assets/content/rawls-values.generated.json` |
| `npm run admin:apply-patch -- --patch ./file --write` | Applies Admin UI export patches to source JSON |

Key specs: `admin-content-explorer.component.spec.ts` (shape proof + contract), `question.component.spec.ts`, `question-v2.component.spec.ts`, `session.store.spec.ts`, `profile.spec.ts`.

---

## 7. Debug Knobs

| Param | Behavior |
|-------|----------|
| `?debugQuestion=1` | Logs category/question/challenge payloads per navigation step |
| `?debugIds=1` | (Now implemented) Overlays internal IDs on UI for manual QA; never enable in production builds |
| `?debugSession=1` | (Dev only) Dumps sessionStore signals to console (if feature flagged in question components)

---

## 8. Required Docs to Load
1. `docs/project/RAWLS-START-HERE.md`
2. `docs/vibe-coding/protocol/PROTOCOL-INDEX.md`
3. `docs/vibe-coding/protocol/copilot-instructions-v7.md`
4. `docs/vibe-coding/protocol/stay-on-track.md`
5. `docs/handoffs/handoff-2025-12-23-challenge-settled.md`
6. `docs/status/tech-debt-and-future-work.md`

---

*Last updated: 2025-12-28*
