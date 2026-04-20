---
version: v2025.12.28
project: Rawls Game
date: 2025-12-28
---

# Contributing — Quick Rules

## Stack & Prereqs
- Angular 20 (standalone/zones disabled) + Tailwind CSS
- TypeScript strict mode, ESLint via `npm run lint`
- Tests: Karma/Jasmine (primary) + Playwright scaffold (blocked until TD-RAWLS-001 resolved)
- Content pipeline: `content/categories/*.json` + scripts under `scripts/`

## Setup
```bash
npm ci
npm run test
npm run build
```

Read `docs/project/RAWLS-START-HERE.md`, the vibe-coding protocol set, and [docs/project/AI-WORKFLOW.md](AI-WORKFLOW.md) (collaboration loop) before writing code.

## Workflow Guardrails
1. **Command Lock → Prompt Review Gate → Proof-of-Read** on every prompt (see vibe-c protocol).
2. Changes ≤ ~50 LOC + ≤ 2 files unless prompt explicitly expands scope.
3. Gameplay shell must remain `<router-outlet></router-outlet>` only.
4. App stays zoneless; `zone.js` permitted only inside `src/test.ts`.
5. Cross-cutting UI/UX updates require Coverage Checklist + Proof-of-Experience in completion reports.
6. Hot files (question components, session store, routes, content service, scripts/content-build.js) need analysis-first plan.

## Green Gate (Default)
```bash
npm run test
npm run build
```
If touching `content/`, `scripts/content-*`, or `src/assets/content/rawls-values.generated.json`, run:
```bash
npm run content:lint
npm run content:export-app
```
before the Green Gate commands.

## Content Validation (Single Source of Truth)
- Use `npm run admin:apply-patch` or edit `content/categories/*.json` directly; never edit generated assets by hand.
- `ContentService` + admin contract tests enforce schema. Do not introduce new validators outside the established pipeline without tech-debt entry + approval.

## Contribution Checklist
- [ ] Prompt Review Gate + Proof-of-Read satisfied
- [ ] Required content commands (if applicable) + `npm run test` + `npm run build` GREEN
- [ ] Router sentinel intact (root HTML stays `<router-outlet>`)
- [ ] No new dependencies or polyfills without explicit approval
- [ ] Docs, handoffs, or status files updated when behavior or process changes
- [ ] Completion report lists entry points touched + command outputs per copilot instructions

Questions? Check `docs/vibe-coding/protocol/PROTOCOL-INDEX.md` and `docs/handoffs` for situational context.
