# RAWLS-REPORT-001 — Session Persistence Inventory

**Generated**: 2025-12-21  
**Prompt**: RAWLS-REPORTS-001-S0A-GENERATE-SESSION-ROUTING-TEST-MAPS-001

---

## Search Commands Run

```powershell
git grep -n "localStorage|sessionStorage|getItem|setItem|storage" src scripts
```

---

## Findings Table

| File | Line | Snippet | What it does | Key name |
|------|------|---------|--------------|----------|
| `question.component.spec.ts` | 21 | `sessionStorage.clear();` | Clears session storage before tests | — |
| `question.component.spec.ts` | 438 | `sessionStorage.clear();` | Clears session storage in race condition test | — |
| `question.component.ts` | 369 | `sessionStorage.setItem(\`rawls-option-${this.currentId}\`, optionId);` | Saves selected TLQ option for current category | `rawls-option-{categoryId}` |
| `question.component.ts` | 513 | `option = sessionStorage.getItem(key);` | Retrieves previously selected TLQ option | `rawls-option-{categoryId}` |
| `question.component.ts` | 526 | `sessionStorage.setItem(key, option);` | Persists restored option after validation | `rawls-option-{categoryId}` |
| `question.component.ts` | 534 | `sessionStorage.removeItem(key);` | Removes invalid option from storage | `rawls-option-{categoryId}` |

---

## Summary

- **Is persistence currently implemented?** PARTIAL
- **Keys used**:
  - `rawls-option-{categoryId}` — stores the last selected TLQ option ID per category
- **Data shape(s) stored**:
  - Single string value (TLQ option ID like `"A-q0"`)
- **What IS NOT persisted**:
  - `SessionStore._selectedIds` (category selection)
  - `SessionStore._answers` (all Likert answers)
  - `SessionStore._skipped` (skipped question IDs)
  - `SessionStore._currentIndex` (progress index)
- **Risks/gaps for deterministic hydration**:
  1. **No answers persistence** — refresh loses all progress
  2. **No category selection persistence** — `selectCategories([...])` called only at runtime
  3. **sessionStorage is tab-scoped** — multi-tab loses sync, but localStorage would share across tabs
  4. **TLQ option restore may orphan** — if answers were cleared but option key remains
  5. **No version/schema migration** — future shape changes could break hydration

---

*End of report*
