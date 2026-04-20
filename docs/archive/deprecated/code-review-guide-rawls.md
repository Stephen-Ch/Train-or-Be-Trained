version: v2025.10.14
project: Rawls Game
date: 2025-10-14
---

# Code Review Guide - Rawls Game

0) Scope
MVP: 7 categories, Likert inputs, shareable profile card, offline PWA.

1) Module Boundaries
- core/ (content, engine, session, update)
- features/ (intro, question, review, result, select, store)
- shared/ (share)

2) Patterns
- Standalone Angular components with OnPush change detection
- Signals for state with computed() for derived data
- Pure functions in core services/engines
- Tailwind-first layout with scoped SCSS wrappers
- JSON-driven content sourced from assets/rawls-values.en.json

3) Testing Discipline
- Jasmine/Karma unit tests mirror module boundaries
- `ng test --watch=false --browsers=ChromeHeadless` must pass before merge
- Data-testids power deterministic DOM queries
- End-to-end automation backlog: run manual smoke after major UI shifts

4) Flow Changes (Question / Session / Routing)

Any change to these files MUST start from a failing test:
- `question.component.ts`
- `session.store.ts`
- `app.routes.ts` or route guards

**Test-first workflow:**
1. Add or update a spec that reproduces the bug/feature (test should fail initially)
2. Change code until that test passes
3. Verify no regressions with full test suite

**Mock data requirements:**
- Use real content shape from `rawls-values.generated.json` or a faithful copy
- Do NOT assert internal ID patterns like `A1-f1` if real data uses `liberty-q0`
- Assert behavior (options render, can be answered) not implementation details

**Playwright E2E targets (when available):**
- Single-category: select 1 category → answer all → Continue → reach review
- Multi-category: select 2 categories → complete first → Continue → second appears

5) Decisions
(Add after each green commit)

- 2025-10-12 — Step 9 (Review): exceeded ≤2 files and ≤60 LOC due to adding return navigation + test fixes in the same step. Prevention: split into two micro-steps (tests-first, then minimal UI), and pre-plan to keep ≤2 files/≤60 LOC per commit.
- 2025-10-13 — Step 14 (Store): exceeded ≤2 files due to route/export updates alongside new component and tests. Prevention: pre-plan route/export edits as a separate micro-step or fold them into the next step; keep ≤2 files/≤60 LOC.
- 2025-10-13 — Step 16 (Question labels): initial pass renamed UI labels without updating spec fixtures. Prevention: extend specs first, then align template helpers so tests guard regressions.
- 2025-10-13 — Step 17 (Follow-up state reset): switching top-level options mid-question left stale follow-up state. Prevention: centralize resets inside SessionStore and cover with regression tests before UI changes.
- 2025-11-26 — Prompt P-701: locked in the 7-category ContentService contract via a spec that uses the real JSON loader and asserts follow-up statement/reverse/dimension fields so future content tweaks stay safe.
- 2025-11-26 — Prompt P-703: wired ContentService through adaptPipelineCategoriesToGameContent so the pipeline adapter enforces the 7-category contract without changing the external JSON source yet.
- 2025-11-26 — Prompt P-705: added npm run content:export-app so pipeline content (dist/content.json) must be exported into src/assets/content/rawls-values.generated.json before game tests/builds, keeping edits flowing through the validated pipeline.
- 2025-11-26 — Prompt P-706: switched ContentService to load src/assets/content/rawls-values.generated.json so runtime content now flows through the pipeline-exported asset while keeping the 7-category contract enforced by tests.
- 2025-11-26 — Prompt P-707: retired the legacy manual content JSON asset so runtime content now exclusively comes from src/assets/content/rawls-values.generated.json exported from the validated pipeline.
- 2025-11-26 — Prompt P-801: added an integrity check over src/assets/content/rawls-values.generated.json to enforce 7 categories and require every follow-up to keep valid dimension/reverse data as the pipeline evolves.
- 2025-11-26 — Prompt P-802: introduced computeDimensionScores() so follow-up answers can be summed per dimension with reverse scoring before wiring personas or UI.
- 2025-11-27 — Prompt P-808: fixed the /q/:categoryId content-load race by using an effect that waits for non-empty categories before starting the selected category once, so question screens no longer render empty when content is still loading.
- 2025-11-26 — Prompt P-705: added npm run content:export-app so pipeline content (dist/content.json) must be exported into src/assets/content/rawls-values.generated.json before game tests/builds, keeping edits flowing through the validated pipeline.
- 2025-11-27 — Prompt P-901: added a pure persona-engine (selectTopPersona) and tests so future result screens can map dimension scores to personas without changing the scoring core.

Commit Changelog

- 2025-10-13: 83a1e89 — feat: reset category state when switching options mid-question
- 2025-10-13: 4fdbe2f — verify: confirmed template renders exactly one follow-up card via `currentFollowUps()` computed
- 2025-10-13: e0087b4 — test: add explicit test for chooseOption phase initialization with no follow-ups
- 2025-10-13: f6272ce — fix: reset phase and index on category navigation to ensure clean state
- 2025-10-13: 51d7f98 — feat: show one follow-up at a time with Continue/Skip advancing through follow-ups
- 2025-10-13: 828860b — feat: add two-phase question flow (options → follow-ups)
- 2025-10-13: 8f270be — data: restructure JSON to use name/description fields and flat follow-ups
- 2025-10-13: f7799ec — copy: update "questions" terminology to "statements" in review page
- 2025-10-13: aed7b98 — feat: implement reverse scoring in profile engine with pure computation
- 2025-10-13: 5a99901 — docs: add reverse scoring feature to changelog
- 2025-10-13: 1aaab20 — feat: add statement field and reverse scoring to FollowUp type
- 2025-10-13: 1b5728e — docs: add 7-category content update to changelog
- 2025-10-13: f97642c — content: replace with 7-category Likert statements
- 2025-10-13: 85177ee — docs: add Intro CTA hotfix to changelog
- 2025-10-13: 2b7d1bd — hotfix: add Intro CTA wiring with Start/Resume/Store buttons
- 2025-10-13: 76bb936 — docs: record Step 14 constraint deviation and changelog entry
- 2025-10-13: 5a424a5 — feat: implement StoreComponent with premium SKU and entitlements gating
- 2025-10-13: 5253b18 — feat: complete PWA setup with service worker and update toast
- 2025-10-13: 6f5d830 — feat: add PWA manifest and update service with controllerchange detection
- 2025-10-12: 6fffb06 — feat: implement ShareCardService with PNG download placeholder
- 2025-10-12: 63a7e3d — feat: wire core engine to ResultComponent with correct data-testids
- 2025-10-12: 7e412f5 — feat: implement core profile engine with pure calculation logic
- 2025-10-12: 14a87f9 — feat: implement ResultComponent with profile calculation and TDD
- 2025-10-12: b11cf24 — docs: record Step 9 constraint deviation and prevention
- 2025-10-12: 3eafa33 — fix: update shell branding and fix component routing
- 2025-10-12: 93bd6ed — feat: implement question component with likert scale UI
- 2025-10-12: ef58809 — feat: implement select component with category selection
- 2025-10-12: 11c9ac5 — feat: implement SessionStore with signals and TDD
- 2025-10-12: 4724caf — feat: implement ContentService with TDD approach
- 2025-10-12: 9a78385 — docs: add routing structure entry to changelog
- 2025-10-12: 593b183 — feat: add routing structure with standalone components
- 2025-10-12: 162479d — docs: add Tailwind integration entry to changelog
- 2025-10-12: bda9449 — feat: integrate Tailwind CSS v3 with purge configuration
- 2025-10-12: 6c3aa7c — docs: add routing sentinel test entry to changelog
- 2025-10-12: d8df4dc — feat: improve routing sentinel test for template validation
- 2025-10-12: 050426f — docs: verify Angular 20 zoneless scaffold complete
- 2025-10-12: 7172313 — docs: update commit changelog with routing sentinel entry
- 2025-10-12: 8119d01 — feat: add headless test script and routing sentinel test
- 2025-10-11: 702dc19 — chore: reset repository for Angular PWA scaffold
