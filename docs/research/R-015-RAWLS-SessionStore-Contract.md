# RAWLS-REPORT-002 — SessionStore State Contract Snapshot

**Generated**: 2025-12-21  
**Prompt**: RAWLS-REPORTS-001-S0A-GENERATE-SESSION-ROUTING-TEST-MAPS-001

---

## Source File

`src/app/core/session/session.store.ts` (86 lines)

---

## Public API (Methods)

| Method | Purpose |
|--------|---------|
| `selectCategories(ids: string[])` | Sets selected category IDs; clears answers for deselected categories |
| `recordAnswer(id: string, value: number)` | Records a Likert answer for a question/followUp ID |
| `skipQuestion(id: string)` | Adds question ID to skipped set |
| `clearCategory(categoryId: string)` | Removes all answers + skips for a category (prefix match) |
| `getResumeIndex(): number` | Returns index of first unanswered category in sequence |

---

## Signals / Computed Properties

| Signal | Type | Meaning |
|--------|------|---------|
| `selectedIds` (readonly) | `string[]` | Category IDs user selected (e.g., `['liberty', 'equality']`) |
| `answers` (readonly) | `Record<string, number>` | Map of question/followUp ID → Likert value (1-5) |
| `skipped` (readonly) | `Set<string>` | IDs of skipped questions |
| `sequence` (computed) | `string[]` | **Alphabetically sorted** copy of `selectedIds` |
| `currentIndex` (readonly) | `number` | Current position in sequence (used externally?) |
| `result` (readonly) | `ResultProfile \| undefined` | Placeholder for computed result profile |
| `entitlements` (readonly) | `{ premium: boolean }` | Feature gating (stub) |

---

## Progress Representation

- **What is tracked**: Answers (`Record<string, number>`), skipped set, selected category IDs
- **Where**: All in `SessionStore` signals
- **Ordering**: `sequence` is alphabetically sorted from `selectedIds`; question order comes from `ContentService`

---

## getResumeIndex Details

**Location**: Lines 78-86

```typescript
getResumeIndex(): number {
  const seq = this._sequence();
  const answers = this._answers();
  
  for (let i = 0; i < seq.length; i++) {
    if (!answers.hasOwnProperty(seq[i])) {
      return i;
    }
  }
  return 0;
}
```

**Inputs**:
- `this._sequence()` — alphabetically sorted category IDs
- `this._answers()` — current answers map

**Returns**: Index (0-based) of first category in sequence that has no answer entry. Returns `0` if all answered.

**Note**: This checks if `answers[categoryId]` exists, but categories don't directly have answers — **individual questions do**. This may be a bug or placeholder for future category-level completion tracking.

---

## Implications for Persistence

1. **Simple shape**: All state is JSON-serializable except `Set<string>` for skipped (trivially convertible to array)
2. **No persistence hooks**: No `save()` or `restore()` methods exist — must add
3. **Alphabetical sequence**: Hydration must use same sort; can't preserve user-selection order
4. **getResumeIndex logic mismatch**: Checks category ID in answers, but answers are keyed by question ID (e.g., `liberty-q0`) — likely needs fix before persistence makes sense
5. **No dirty/clean tracking**: Can't detect if state was modified since last save

---

*End of report*
