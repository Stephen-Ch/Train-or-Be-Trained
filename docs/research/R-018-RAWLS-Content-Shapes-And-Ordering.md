# RAWLS-REPORT-005 — Content Shapes and Ordering

**Generated**: 2025-12-21  
**Prompt**: RAWLS-REPORTS-001-S0A-GENERATE-SESSION-ROUTING-TEST-MAPS-001

---

## Data Flow

```
content/categories/*.json  →  scripts/content-build.js  →  src/assets/content/rawls-values.generated.json
                                                                      ↓
                                                          ContentService.loadContent()
                                                                      ↓
                                                          adaptPipelineCategoriesToGameContent() (if pipeline shape)
                                                                      ↓
                                                          ContentState.categories
```

---

## Source Files

| Purpose | Path |
|---------|------|
| Generated JSON | `src/assets/content/rawls-values.generated.json` |
| Content service | `src/app/core/content/content.service.ts` |
| Adapter (pipeline → game) | `src/app/core/content/content-adapter.ts` |
| Type definitions | `src/app/core/content/types.ts` |

---

## ID Shapes

### Category IDs

- Format: lowercase words (e.g., `liberty`, `equality`, `community`, `fairness`, `security`, `sustainability`, `prosperity`)
- Alphabetical sort determines `SessionStore.sequence`

### FollowUp IDs

- Format: `{categoryId}-q{index}` (e.g., `liberty-q0`, `liberty-q1`, `equality-q3`)
- Used as answer keys in `SessionStore.answers`

---

## Generated JSON Structure

```json
{
  "version": "generated-from-pipeline",
  "locale": "en",
  "likert5": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  "categories": [
    {
      "id": "liberty",
      "name": "Liberty",
      "description": "...",
      "quote": "",
      "followUps": [
        {
          "id": "liberty-q0",
          "statement": "How important is individual freedom to you?",
          "reverse": false,
          "dimension": "liberty-q0"
        }
      ]
    }
  ]
}
```

---

## Ordering Rules

### Category Order

| Source | Order Type | Evidence |
|--------|------------|----------|
| Generated JSON | **Array order** (source-defined) | JSON file lists categories in fixed order |
| ContentService | **Preserves array order** | No sorting in `loadContent()` |
| SessionStore.sequence | **Alphabetical sort** | `computed(() => [...this._selectedIds()].sort())` |

**Implication**: User selection order is lost; sequence is always alphabetical.

### TLQ/FollowUp Order

| Source | Order Type | Evidence |
|--------|------------|----------|
| Generated JSON | **Array order** (source-defined) | `followUps` array in JSON |
| QuestionComponent.options | **Sorted by ID** | `Array.from(optionIds).sort()` |

**Implication**: FollowUp display order is alphabetical by ID, not source order.

---

## Type Definitions

### Category (types.ts)

```typescript
export interface Category {
  id: string;
  name: string;
  description: string;
  quote: string;
  followUps: FollowUp[];
}
```

### FollowUp (types.ts)

```typescript
export interface FollowUp {
  id: string;
  text?: string;       // Legacy field
  statement?: string;  // New field
  reverse?: boolean;   // Score reversal flag
  dimension?: string;  // Policy dimension tag
}
```

---

## Implications for resumeIndex + Tests

1. **Alphabetical sequence**: Tests must account for `sequence = ['A', 'B', 'C']` regardless of selection order
2. **getResumeIndex mismatch**: Currently checks `answers[categoryId]` but answers are keyed by `followUpId` (e.g., `liberty-q0`). Fix needed before resume logic works.
3. **Options sorted by ID**: Test assertions like `router.navigate(['/q', 'A', 'followups', 'A-q0'])` depend on alphabetical sort of followUp IDs
4. **Category IDs are lowercase**: Real data uses `liberty`, `equality`; test fixtures use `A`, `B` — tests should verify case-insensitive or match actual data
5. **No explicit order field**: Cannot reorder categories/TLQs without changing IDs or adding `order` field

---

*End of report*
