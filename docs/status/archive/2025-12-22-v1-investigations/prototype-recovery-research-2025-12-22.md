# Prototype Recovery Research — 2025-12-22

## Preflight

| Check | Value |
|-------|-------|
| Current branch | main |
| HEAD commit | 7edc24cc3a98f47ae7d8875c1a47f58cfb1392f9 |
| Working tree | Clean (only untracked files) |

---

## A) What "working prototype" likely means

- Minimal end-to-end: start survey → answer TLQ questions → answer follow-ups → continue through categories → see results → (optional) share card
- Legacy codebase was vanilla HTML/JS with functional survey flow; Angular rewrite reimplemented incrementally

---

## B) Candidate branches/tags (ranked)

### 1. legacy-validation (LOCAL ONLY)

| Field | Value |
|-------|-------|
| Commit | 079d87d (2025-09-24) |
| Subject | Fix profile images, share card sizing, and footer placement |
| Why candidate | Final polished legacy site with survey, profiles, share card; tip of pre-Angular working prototype |
| Key files | survey/index.html, assets/js/survey.js, assets/js/share.js, assets/js/scoring.js, results/preview/index.html |

### 2. origin/master (808593a)

| Field | Value |
|-------|-------|
| Commit | 808593a (2025-09-25) |
| Subject | Fix DailyInventory footer layout and enhance UX |
| Why candidate | Remote's latest legacy commit with html2canvas sharing; 1 commit ahead of legacy-validation |
| Key files | assets/js/survey.js, assets/js/share.js, assets/js/scoring.js, survey/index.html, profiles/* |

### 3. pre-angular-archive tag (e466920)

| Field | Value |
|-------|-------|
| Commit | e466920 (2025-09-25) |
| Subject | WIP: commit all changes before branching from legacy validation commit |
| Why candidate | Explicit snapshot taken before Angular rewrite; same as archive/pre-angular branch |
| Key files | survey/index.html, assets/js/survey.js, copilot_onboarding_pack_markdown_files_to_add.md |

### 4. 48701c3 (commit-only)

| Field | Value |
|-------|-------|
| Commit | 48701c3 (2025-09-24) |
| Subject | Complete Rawls Game site - Production ready |
| Why candidate | Original production-ready commit; foundation for legacy-validation refinements |
| Key files | assets/js/survey.js, assets/js/scoring.js, assets/js/share.js, survey/index.html, results/preview/index.html |

### 5. main branch (current, Angular)

| Field | Value |
|-------|-------|
| Commit | 7edc24c (2025-12-22) |
| Subject | docs: update TD-RAWLS-001 evidence and next experiment (HVCI) |
| Why candidate | Current Angular app with guards, session store, content pipeline; multi-category flow fixed but share card stubbed |
| Key files | src/app/question/, src/app/result/, src/app/services/session-store.service.ts |

### 6. 815425d (commit-only, Angular milestone)

| Field | Value |
|-------|-------|
| Commit | 815425d (2025-10-14) |
| Subject | feat: gate follow-ups and results with guards |
| Why candidate | First Angular commit with followups + results guards wired; milestone for flow completion |
| Key files | src/app/guards/followups.guard.ts, src/app/guards/results.guard.ts |

---

## C) Most likely "last known good" for end-to-end flow

**Best candidate: origin/master (808593a)**

| Field | Value |
|-------|-------|
| Commit | 808593a |
| Date | 2025-09-25 |
| Reason | Remote-pushed legacy site with complete survey flow, profile scoring, and html2canvas share card generation. This is the most recent pre-Angular commit with functional end-to-end flow. |
| How to checkout | git checkout 808593a (detached HEAD) or git checkout origin/master |

---

## D) Tags inventory

| Tag | Commit | Notes |
|-----|--------|-------|
| pre-angular-archive | e466920 | Snapshot before Angular rewrite |
| content-pipeline-v1 | 309e3d9 | Merge commit for content pipeline feature |

---

## E) Key differences: legacy vs Angular current

| Feature | Legacy (808593a) | Angular main (7edc24c) |
|---------|-----------------|------------------------|
| Survey flow | Vanilla JS, all 7 categories with questions | Angular signals, fixed multi-category (Bug #5) |
| Share card | html2canvas + toDataURL → PNG download | Stubbed (TD-RAWLS-005) |
| Results | Profile calculation in scoring.js | computeDimensionScores engine |
| PWA | None | Service worker + manifest (incomplete) |
| Tests | Playwright on homepage/survey combos | Jest unit + stubbed Playwright e2e (TD-RAWLS-001) |

---

## F) Recovery options

1. **View legacy in browser**: Checkout 808593a, open survey/index.html directly (no server needed)
2. **Port share card**: Reference assets/js/share.js for html2canvas implementation
3. **Port scoring logic**: Compare assets/js/scoring.js with current computeDimensionScores

---

*Report generated: 2025-12-22*
*No commits made per scope guardrails*
