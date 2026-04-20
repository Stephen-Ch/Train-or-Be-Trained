# RAWLS-REPORT-004 — Question Flow Tests Map

**Generated**: 2025-12-21  
**Prompt**: RAWLS-REPORTS-001-S0A-GENERATE-SESSION-ROUTING-TEST-MAPS-001

---

## Source File

`src/app/features/question.component.spec.ts` (449 lines, ~24 tests)

---

## Test Inventory

| Test Name | What Behavior It Proves | What It Mocks | Gaps |
|-----------|-------------------------|---------------|------|
| should create | Component instantiation | ContentService.state | — |
| should render top-level question cards with likert inputs | TLQ cards render, 5 Likert inputs, correct testids | ContentService.state | — |
| should keep continue disabled until all top-level questions answered | Continue button disabled logic | ContentService.state | — |
| should display statements for top-level questions | TLQ statement text renders | ContentService.state | — |
| should navigate to follow-ups route after answering all TLQs | Continue → `/q/A/followups/A-q0` | ContentService.state, router.navigate spy | — |
| should display category header and quote | Header/quote elements exist | ContentService.state | — |
| should display progress indicator | "1 of 2" progress shows | ContentService.state | — |
| should show category title and 0/3 progress | Title + "0/3" before answers | ContentService.state | — |
| should update progress to answered follow-ups count | Progress updates on answer | ContentService.state | — |
| should show next category title with reset progress after switching | B shows after finishing A | ContentService.state | **Manual `currentId` set** — not router-driven |
| should disable continue button when not all answered | Disabled state | ContentService.state | — |
| should enable continue button when all TLQs answered | Enabled state | ContentService.state | — |
| should skip question and navigate to next | Skip → `/q/B` | ContentService.state, router.navigate spy | — |
| ~~should navigate to next question on continue~~ | **SKIPPED (xit)** | — | Needs fixing |
| should reverse score when reverse=true | Reverse scoring (5→1) | currentCategory spy | — |
| should render breadcrumb and follow-up card for followups route | Breadcrumb + fu-card testids | ContentService.state, paramsSubject | — |
| should display debug hud when debug=1 | Debug HUD visibility | queryParamsSubject | — |
| should quickfill TLQs and advance | QuickFill → followups route | router.navigate spy | — |
| should quickfill follow-ups and advance | QuickFill → next TLQ | router.navigate spy | — |
| should advance through follow-ups then navigate to next TLQ | A-q0 → A-q1 | router.navigate spy | — |
| should navigate to next category after finishing final TLQ follow-ups | A-q2 → `/q/B` | router.navigate spy | — |
| should resume at first unanswered follow-up | Progress shows "1/1" | paramsSubject | — |
| should navigate to next category when finishing all follow-ups (P-813 regression) | A-q2 Continue → `/q/B` | router.navigate spy | — |
| should resolve category from route param when content is available (regression) | Content race condition | fresh fixture, paramsSubject | — |

---

## Missing Tests for "Best UX" Goals

### 1. A → B → C → review (3+ categories)

**Current gap**: All tests use only 2 categories (A, B). No test verifies:
- Sequence of 3+ categories
- Final category → `/review` transition

**Proposed test**:
```typescript
it('should navigate through A → B → C → review with 3 selected categories', () => {
  sessionStore.selectCategories(['A', 'B', 'C']);
  // Complete A, verify → B
  // Complete B, verify → C
  // Complete C, verify → /review
});
```

### 2. Refresh-Resume (Hydration → Navigate)

**Current gap**: No test simulates:
- Persist answers to storage
- Create fresh component (simulate refresh)
- Hydrate from storage
- Verify navigation resumes at correct category

**Proposed test**:
```typescript
it('should resume at first unanswered category after hydration', () => {
  // Setup: persist A complete, B incomplete
  // Act: create fresh fixture, hydrate
  // Assert: currentIndex points to B, navigates to /q/B
});
```

### 3. Invalid Route ID Handling

**Current gap**: No test verifies behavior when:
- User navigates to `/q/invalid` (non-existent category)
- User navigates to `/q/C` but only `['A', 'B']` selected

**Proposed test**:
```typescript
it('should handle navigation to category not in sequence', () => {
  sessionStore.selectCategories(['A', 'B']);
  paramsSubject.next({ id: 'C' });
  fixture.detectChanges();
  // Verify: auto-select OR redirect to select OR error state
});
```

---

## Notes

- 1 test is **skipped** (`xit`): "should navigate to next question on continue"
- Tests mock `ContentService.state` rather than full content loading
- No integration with actual `SessionStore` persistence (because none exists yet)

---

*End of report*
