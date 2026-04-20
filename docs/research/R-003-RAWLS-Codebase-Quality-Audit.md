# Codebase Quality Audit — Rawls Game

**Date**: 2025-12-29  
**Prompt**: RAWLS-CODEBASE-QUALITY-AUDIT-001  
**Scope**: Repo-wide read-only quality audit

---

## 1. Branch Context

- **Branch**: main
- **Sync**: origin/main (synced, no ahead/behind)
- **Working tree**: CLEAN (git status --porcelain empty)
- **Last commit**: 95ab901 FW-ADMIN-002C: persist category reorder in admin draft

---

## 2. Commands Run + Results

### Baseline

    pwd
    → C:\Users\schur\workspaces\Rawls\JustSprites

    git status --porcelain
    → (empty)

    git status -sb
    → ## main...origin/main

    git log --oneline -10
    → 95ab901 FW-ADMIN-002C: persist category reorder in admin draft
      755157b FW-ADMIN-002C: wire category reorder UI controls (admin)
      792d0c8 FW-ADMIN-002C: apply category reorder patches (pipeline + tests)
      9dbc32a FW-ADMIN-002C-S1A: category reorder patch export (TDD GREEN)
      23b3dee Docs: close out TD-RAWLS-011 + clarify triggerRule vocab
      a477a33 TD-RAWLS-011: make QuestionV2 test triggerRule-aware
      53fa943 TD-RAWLS-011: align triggerRule ranges with stored Likert values
      96a67a3 TD-RAWLS-011: add pilot triggerRule challenge content
      dc23885 TD-RAWLS-011: review uses filtered requiredChallenges count
      804ffa9 TD-RAWLS-011: validate triggerRule schema (integrity tests + validator)

### Test Suite

    npm run test
    → TOTAL: 241 SUCCESS (skipped 1)
    → Production shape proof logged (28 positions, 0 challenges in current content)
    → Largest test files:
      - question.component.spec.ts (39.05 kB)
      - admin-content-explorer.component.spec.ts (26.57 kB)
      - question-v2.component.spec.ts (18.23 kB)
      - session.store.spec.ts (13.80 kB)

### Production Build

    npm run build
    → SUCCESS (2.847 seconds)
    → WARNING 1: bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 68.43 kB with a total of 568.43 kB
    → WARNING 2: Module 'html2canvas' used by 'src/app/shared/share/share-card.service.ts' is not ESM (CommonJS/AMD dependency)
    → Content validated: 7 categories, 28 questions, 13 deeper dives
    → Output: dist/rawls-game (main-EFSKQ7PC.js 550.38 kB, styles 18.05 kB)

### Content Lint

    npm run content:lint
    → ✅ Content OK (7 categories, 28 questions, 13 deeper dives)

### File Size Analysis

    Top 10 largest TypeScript files:
    → 1197 lines: src/app/features/admin/admin-content-explorer.component.ts
      994 lines: src/app/features/question.component.spec.ts
      726 lines: src/app/features/question.component.ts
      654 lines: src/app/features/admin/admin-content-explorer.component.spec.ts
      401 lines: src/app/core/session/session.store.spec.ts
      375 lines: src/app/features/question-v2.component.spec.ts
      348 lines: src/app/features/question-v2.component.ts
      345 lines: src/app/core/flow/ideal-sequencer.spec.ts
      345 lines: src/app/core/session/session.store.ts
      306 lines: src/app/features/review.component.ts

---

## 3. Warning Inventory

### Build Warnings (2)

**PERF-001** (PRE-EXISTING):
- **Text**: "bundle initial exceeded maximum budget. Budget 500.00 kB was not met by 68.43 kB with a total of 568.43 kB"
- **Origin**: angular.json budget configuration vs main-EFSKQ7PC.js (550.38 kB)
- **Documented**: docs/status/tech-debt-and-future-work.md PERF-001

**TD-RAWLS-016** (PRE-EXISTING):
- **Text**: "Module 'html2canvas' used by 'src/app/shared/share/share-card.service.ts' is not ESM — CommonJS or AMD dependencies can cause optimization bailouts"
- **Origin**: html2canvas library in share-card.service.ts
- **Documented**: docs/status/tech-debt-and-future-work.md TD-RAWLS-016

### Test Warnings

None (241 SUCCESS, 1 skipped test in question.component.spec.ts line 345 xit disabled)

### Content Validation

✅ CLEAN (7 categories, 28 questions, 13 deeper dives validated)

### TypeScript Typecheck

Not found in package.json scripts. No documented `ng typecheck` or `tsc --noEmit` command.

---

## 4. Code Quality Findings

### RED (Blocking — requires immediate fix)

None identified. All tests GREEN, build GREEN.

### YELLOW (Technical debt — should fix soon)

**SMELL-001: Duplication in moveCategory / movePosition array swap logic**
- **File**: [src/app/features/admin/admin-content-explorer.component.ts](src/app/features/admin/admin-content-explorer.component.ts#L735-L770)
- **Evidence**:
  - moveCategory lines 748-749: `[ideals[index], ideals[targetIndex]] = [ideals[targetIndex], ideals[index]]`
  - movePosition lines 767-768: `[positions[index], positions[targetIndex]] = [positions[targetIndex], positions[index]]`
- **Impact**: Same swap pattern, boundary checks, and validation duplicated across both methods; maintenance burden if swap logic needs updating (e.g., undo/redo support)
- **Fix**: Extract shared `moveItem<T>(array: T[], index: number, direction: 'up'|'down')` helper

**SMELL-002: draftOverlayCount does NOT count category reorder changes**
- **File**: [src/app/features/admin/admin-content-explorer.component.ts](src/app/features/admin/admin-content-explorer.component.ts#L539-L567)
- **Evidence**: Lines 547-550 count position order changes per category; NO equivalent check for category order override
- **Impact**: Draft change badge undercounts (user reorders categories but badge shows 0)
- **Documented**: docs/status/code-review.md post-merge quality review 2025-12-29
- **Fix**: Add category order comparison in draftOverlayCount computed — compare `this.ideals().map(i => i.id)` vs `baseContent.categories.map(c => c.id)`

**SMELL-003: Component size — admin-content-explorer.component.ts is 1197 lines**
- **File**: [src/app/features/admin/admin-content-explorer.component.ts](src/app/features/admin/admin-content-explorer.component.ts)
- **Responsibilities**: Tree view, search, edit fields, draft overlay, validation, patch export, reorder UI, storage
- **Impact**: Cognitive load, merge conflicts, harder to navigate
- **Documented**: docs/status/code-review.md post-merge quality review 2025-12-29
- **Future**: Extract patch generation to AdminPatchGenerator service (buildPatchPayload + validation logic ~150 lines)

### GREEN (Low priority / cosmetic)

**SMELL-004: console.log debug tracing in production code paths**
- **Files** (20+ matches):
  - [src/app/features/question.component.ts](src/app/features/question.component.ts#L592-L633) (7 console.log calls in onContinue/navigation logic)
  - [src/app/core/session/session.store.ts](src/app/core/session/session.store.ts#L76) lines 76, 141, 152, 318 (4 DEBUG_ANSWERS console.log calls gated by isDebugAnswersEnabled but still in prod bundle)
  - [src/app/features/review.component.ts](src/app/features/review.component.ts#L300) line 300 (DEBUG_ANSWERS_READ)
  - Test files (acceptable): admin-content-explorer.component.spec.ts, result-guard.production-content-contract.spec.ts
- **Impact**: Bundle size bloat (console.log strings in minified output), potential info leak
- **Fix**: Replace dev-mode console.log with conditional logger service that tree-shakes in prod builds OR keep debug flags but strip console.log calls in production via terser

**SMELL-005: TypeScript any usage (27 matches across 4 files)**
- **Files**:
  - src/app/core/persona/persona-profiles.contract.spec.ts (5 any — test-only, acceptable for dynamic validation)
  - src/app/features/question.component.spec.ts (11 instances of "as unknown as jasmine.Spy" — test-only)
  - src/app/features/result.guard.spec.ts (2 instances — test-only)
  - src/app/features/admin/admin-content-explorer.component.spec.ts (5 any in patch filtering — test-only)
  - [src/app/core/content/content-integrity-validator.ts](src/app/core/content/content-integrity-validator.ts#L31) line 31 ("triggerRule?: any" — intentional for flexible validation)
  - src/app/integration/result-guard.production-content-contract.spec.ts (10 any — test-only)
- **Impact**: Low (mostly test code, intentional for dynamic validation)
- **Note**: No production component/service code uses any except content-integrity-validator.ts line 31 (documented as intentional)

**SMELL-006: One disabled test**
- **File**: [src/app/features/question.component.spec.ts](src/app/features/question.component.spec.ts#L345)
- **Evidence**: `xit('should navigate to next question on continue', () => { ... })`
- **Impact**: Missing coverage for continue button navigation logic
- **Note**: 10 other navigation tests exist (onContinue integration tested in lines 550-927), so coverage gap is minimal

**SMELL-007: TODO comment**
- **File**: [src/app/features/result.component.ts](src/app/features/result.component.ts#L153)
- **Evidence**: "// TODO: Add reset method to SessionStore"
- **Impact**: Start Fresh button workaround uses router navigation instead of store method
- **Fix**: Add SessionStore.reset() method (currently uses startFresh which is close but not identical)

---

## 5. Under-Tested Areas (Top 5)

### UNDER-001: Admin challenge editing (nested challenges[] under positions)

- **File**: src/app/features/admin/admin-content-explorer.component.ts
- **Current coverage**: admin-content-explorer.component.spec.ts has NO tests for challenge title/body editing
- **Gap**: Component supports position field edits (statement/text) but challenges (title/body) are rendered read-only in admin UI
- **Evidence**: TD-RAWLS-014 in tech-debt-and-future-work.md documents challenge edit gap
- **Next TDD test**: admin-content-explorer.component.spec.ts
  ```typescript
  it('should edit challenge title and track in draft changes', () => {
    // ARRANGE: find first position with challenge
    const positionWithChallenge = fixture.debugElement.query(By.css('[data-testid*="challenge-"]'));
    // ACT: find edit input, change title, trigger blur
    const titleInput = positionWithChallenge.query(By.css('[data-testid="challenge-title-input"]'));
    titleInput.nativeElement.value = 'Updated challenge title';
    titleInput.nativeElement.dispatchEvent(new Event('input'));
    titleInput.nativeElement.dispatchEvent(new Event('blur'));
    // ASSERT: draftOverlayCount incremented, export patch includes challenge field edit operation
    expect(component.draftOverlayCount()).toBeGreaterThan(0);
    const patches = component.buildPatchPayload();
    const challengeEdit = patches.find(p => p.kind === 'challenge' && p.field === 'title');
    expect(challengeEdit).toBeDefined();
  });
  ```
- **Why it matters**: Challenges are core content; inability to edit titles/bodies in admin UI forces manual JSON editing (defeats admin UI purpose)

### UNDER-002: ResultGuard rejection visibility (decision 2025-12-21 not yet implemented)

- **File**: src/app/features/result.guard.ts
- **Current coverage**: result.guard.spec.ts tests guard allows/blocks, but NO test for debug emission on reject
- **Gap**: Guard redirects to /review silently when incomplete; no visibility into why user was redirected
- **Evidence**: Protocol v7 rule 8 "Guard Rejection Visibility: Any canActivate/redirect-to-review must emit a single reason code in dev (console or debug overlay)"
- **Next TDD test**: result.guard.spec.ts
  ```typescript
  it('should emit rejection reason code to console in dev mode when blocking /result', () => {
    spyOn(console, 'warn');
    const sessionStore = TestBed.inject(SessionStore);
    sessionStore.selectCategories(['liberty']);
    // Record 0 answers so guard blocks
    const outcome = TestBed.runInInjectionContext(() => resultGuard({} as any, {} as any));
    expect(outcome).not.toBe(true); // Blocked
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching(/RESULT_GUARD_REJECT/));
  });
  ```
- **Why it matters**: Developer UX during debugging; currently no visibility why guard rejected (could be any of: no selection, partial answers, triggerRule exclusions)

### UNDER-003: SessionStore veilAcknowledged persistence edge cases

- **File**: src/app/core/session/session.store.ts
- **Current coverage**: session.store.spec.ts has basic veil persistence test but NO localStorage error handling tests
- **Gap**: setVeilAcknowledged / clearVeilAcknowledgement have try/catch around localStorage but no test proving graceful degradation when localStorage unavailable
- **Next TDD test**: session.store.spec.ts
  ```typescript
  it('should gracefully degrade when localStorage.setItem throws (e.g., private browsing)', () => {
    spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
    const store = new SessionStore(TestBed.inject(ContentService));
    // Should not throw
    expect(() => store.setVeilAcknowledged()).not.toThrow();
    // veilAcknowledged signal should remain true (in-memory fallback)
    expect(store.veilAcknowledged()).toBe(true);
  });
  ```
- **Why it matters**: Private browsing mode + PWA environments can have restricted localStorage; current code handles error silently but no test proves behavior

### UNDER-004: Category reorder button disabled state edge cases

- **File**: src/app/features/admin/admin-content-explorer.component.ts lines 725-733 (canMoveCategoryUp/Down)
- **Current coverage**: admin-content-explorer.component.spec.ts line 612 "should trigger moveCategory when category reorder buttons are clicked" tests click wiring but NOT disabled state rendering
- **Gap**: No test proving first category has disabled up button, last category has disabled down button
- **Next TDD test**: admin-content-explorer.component.spec.ts
  ```typescript
  it('should disable up button for first category and down button for last category', () => {
    const ideals = component.ideals();
    const firstIdeal = ideals[0];
    const lastIdeal = ideals[ideals.length - 1];
    fixture.detectChanges();
    const firstUpButton = fixture.debugElement.query(By.css(`[data-testid="ideal-${firstIdeal.id}-move-up"]`));
    const lastDownButton = fixture.debugElement.query(By.css(`[data-testid="ideal-${lastIdeal.id}-move-down"]`));
    expect(firstUpButton.nativeElement.disabled).toBe(true);
    expect(lastDownButton.nativeElement.disabled).toBe(true);
  });
  ```
- **Why it matters**: Prevents accidental clicks on no-op buttons; UX clarity (visual feedback that reorder is bounded)

### UNDER-005: Content pipeline error handling (malformed source JSON)

- **File**: scripts/content-build.js
- **Current coverage**: content.integrity.spec.ts validates generated artifact schema but NO test for pipeline handling of malformed input JSON (e.g., missing id, duplicate order, invalid triggerRule)
- **Gap**: If content/categories/liberty.json has syntax error or schema violation, npm run content:build fails with unclear error
- **Next TDD test**: scripts/content-build.spec.js (NEW file)
  ```javascript
  it('should exit with error code and helpful message when category JSON is malformed', () => {
    // ARRANGE: create temp category file with duplicate id
    const tempPath = 'content/categories/_test-duplicate-id.json';
    fs.writeFileSync(tempPath, JSON.stringify({ id: 'liberty', name: 'Duplicate', order: 0, followUps: [] }));
    // ACT: run content-build script
    const result = spawnSync('node', ['scripts/content-build.js'], { encoding: 'utf8' });
    // ASSERT: exit code non-zero, stderr contains "duplicate id" or similar
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('duplicate');
    // CLEANUP
    fs.unlinkSync(tempPath);
  });
  ```
- **Why it matters**: Content authoring errors should surface early with actionable error messages; currently pipeline might fail silently or with cryptic stack trace

---

## 6. Contract / Drift Risks (Top 5)

### DRIFT-001: Content pipeline output schema (rawls-values.generated.json)

- **Contract**: Categories have id/name/quote/order/followUps; followUps have id/statement/hidden/challenges; challenges have id/title/body/triggerRule
- **Current lock**: content.integrity.spec.ts validates schema structure, triggerRule allowed keys, category count, followUps count
- **Gap**: NO test proving order field correctness (e.g., categories in ascending order from 0..6, no gaps, no duplicates)
- **Risk**: If content-build.js sorting logic changes or manual edits introduce order: 999, runtime code assumes ordered sequence
- **Recommendation**: Add test "should have contiguous order fields 0..N-1 for categories" in content.integrity.spec.ts

### DRIFT-002: Session storage schema (rawls-session-v1)

- **Contract**: { v: 1, selectedCategoryIds, completedCategoryIds, answers, challengeAnswers, skipped, resume }
- **Current lock**: session.store.spec.ts tests hydration round-trip, backward compatibility with legacy sessions missing completedCategoryIds
- **Gap**: NO test proving forward compatibility (e.g., v: 2 payload gracefully degrades to v: 1 behavior or shows migration message)
- **Risk**: If future PR adds v: 2 schema, old client code crashes on version mismatch
- **Recommendation**: Add test "should ignore unknown fields in session payload (forward compatibility)" in session.store.spec.ts

### DRIFT-003: Admin patch schema (PatchOperation union type)

- **Contract**: FieldPatchOperation (id/kind/field/value), ReorderPatchOperation (op/kind/orderedIds), SetHiddenPatchOperation (op/kind/id/hidden)
- **Current lock**: apply-admin-patch-helper.spec.mjs validates patch application logic for category/position reorder + field edits
- **Gap**: NO test proving patch export from admin UI exactly matches patch apply expectations (e.g., orderedIds array format, categoryId presence)
- **Risk**: If admin component buildPatchPayload emits {orderedIds: ['a','b']} but apply-admin-patch-helper expects {categoryId: 'x', orderedIds: ['a','b']}, pipeline breaks
- **Recommendation**: Add integration test in admin-content-explorer.component.spec.ts: export patch → parse JSON → assert schema matches PatchOperation TypeScript types exactly

### DRIFT-004: TriggerRule runtime filtering contract

- **Contract**: ideal-sequencer buildIdealBlock evaluates parentAnswerMin/Max against positionAnswers; review.component requiredChallengeIdsForCategory uses same filtering logic
- **Current lock**: ideal-sequencer.spec.ts tests filtering, review.component.spec.ts regression test proves 0 required when triggerRule excludes
- **Gap**: NO contract test proving sequencer and review always compute SAME required set (currently both implement shouldIncludeChallenge but no test locks them together)
- **Risk**: If sequencer logic changes (e.g., adds tag-based filtering) but review logic not updated, review totals diverge from sequencer behavior → UX regression
- **Recommendation**: Add contract test in integration folder: "sequencer and review must compute identical required challenge set for given position answers"

### DRIFT-005: ResultGuard completion criteria vs SessionStore completion tracking

- **Contract**: resultGuard checks all selectedIds exist in completedCategoryIds; SessionStore.markCategoryComplete must be called at ideal-exhausted boundary
- **Current lock**: result-guard.production-content-contract.spec.ts proves guard blocks on incomplete, real-content-flow.integration.spec.ts proves guard allows after completion
- **Gap**: NO test proving what happens if SessionStore.markCategoryComplete is called BEFORE all positions answered (e.g., bug in component logic)
- **Risk**: If QuestionComponent or QuestionV2Component calls markCategoryComplete prematurely, user bypasses required positions and sees /result early
- **Recommendation**: Add test in session.store.spec.ts: "should NOT mark category complete if any required position unanswered (defensive check)" OR document that markCategoryComplete trusts caller

---

## 7. Recommended Next Story (Top Pick + 2 Alternates)

### TOP PICK: TD-RAWLS-017 (NEW) — Add draftOverlayCount for category reorder

**User Impact**: Admin users see draft badge count 0 after reordering categories, causing confusion (is draft saved or not?)

**Risk Level**: LOW (cosmetic UX bug, no data loss, draft persists correctly)

**Smallest Next Tiny-Step**:
- **File**: src/app/features/admin/admin-content-explorer.component.spec.ts
- **RED Expectation**:
  ```typescript
  it('should increment draftOverlayCount when category order changes', () => {
    const initialCount = component.draftOverlayCount();
    component.moveCategory(component.ideals()[0], 'down');
    fixture.detectChanges();
    expect(component.draftOverlayCount()).toBe(initialCount + 1);
  });
  ```
- **Proof of RED**: Test fails because draftOverlayCount computed (lines 539-567) does NOT compare category order
- **GREEN Implementation**: Add category order comparison in draftOverlayCount:
  ```typescript
  const currentCategoryOrder = this.ideals().map(i => i.id);
  const baseCategoryOrder = baseContent.categories.map(c => c.id);
  if (!this.arraysEqual(currentCategoryOrder, baseCategoryOrder)) count++;
  ```

### ALTERNATE 1: DRIFT-001 — Lock content pipeline order field contract

**User Impact**: Runtime code assumes categories/positions in ascending order 0..N-1; malformed order fields (gaps/duplicates/999) could cause index bugs

**Risk Level**: MEDIUM (schema drift could break sorting/sequencing logic)

**Smallest Next Tiny-Step**:
- **File**: src/app/core/content/content.integrity.spec.ts
- **RED Expectation**:
  ```typescript
  it('should validate categories have contiguous order fields 0..N-1', () => {
    const categories = generatedContent.categories;
    const orderValues = categories.map(c => c.order).sort((a, b) => a - b);
    expect(orderValues).toEqual([0, 1, 2, 3, 4, 5, 6]); // Proves no gaps, no duplicates, starts at 0
  });
  ```
- **Proof of RED**: Current content.integrity.spec.ts does NOT validate order field correctness
- **GREEN Implementation**: Add order field validation in content-integrity-validator.ts validateContentIntegrity function

### ALTERNATE 2: UNDER-002 — ResultGuard rejection visibility (dev mode console.warn)

**User Impact**: Developers debugging why /result redirects to /review have no visibility into rejection reason (incomplete category vs hidden position vs triggerRule exclusion)

**Risk Level**: LOW (developer UX only, no end-user impact)

**Smallest Next Tiny-Step**:
- **File**: src/app/features/result.guard.spec.ts
- **RED Expectation**:
  ```typescript
  it('should emit RESULT_GUARD_REJECT reason to console.warn in dev mode when incomplete', () => {
    spyOn(console, 'warn');
    const sessionStore = TestBed.inject(SessionStore);
    sessionStore.selectCategories(['liberty']);
    const outcome = TestBed.runInInjectionContext(() => resultGuard({} as any, {} as any));
    expect(outcome).not.toBe(true);
    expect(console.warn).toHaveBeenCalledWith(jasmine.stringMatching(/RESULT_GUARD_REJECT.*incomplete/i));
  });
  ```
- **Proof of RED**: result.guard.ts does NOT emit console warning on rejection
- **GREEN Implementation**: In result.guard.ts before returning router.parseUrl('/review'), add:
  ```typescript
  if (isDevMode()) console.warn(`RESULT_GUARD_REJECT: incomplete categories [${incompleteIds.join(',')}]`);
  ```

---

## Summary

**Baseline Health**: GREEN (241 tests passing, build succeeds, no blocking issues)

**Priority Targets**:
1. **SMELL-002** (draftOverlayCount gap) — TD-RAWLS-017 recommended as next story
2. **DRIFT-001** (order field contract) — Add validation to prevent schema drift
3. **UNDER-002** (ResultGuard visibility) — Improve developer debugging experience

**Technical Debt Backlog**: 7 identified smells (3 YELLOW, 4 GREEN), all documented with specific file/line references and proposed fixes

**Contract Risks**: 5 cross-cutting contracts identified where drift could cause runtime bugs; each has specific test recommendation to lock behavior

**Next Action**: Pick top story (TD-RAWLS-017) or alternate based on current sprint priorities
