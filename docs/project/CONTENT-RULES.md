# Content Rules — Rawls Pipeline

Defines how Rawls content is authored (source JSON), transformed (generated artifact), and validated.

## 1. Terminology (Product vs Storage)

| Product term | Meaning | Storage location |
|--------------|---------|------------------|
| **Ideal** | Top-level value such as Liberty, Equality, Prosperity | `content/categories/<id>.json` → `categories[].id` |
| **Position** | Top-level Likert prompt within an Ideal | Source: `questions[]` entry<br>Generated: `followUps[]` item whose `id` matches `{categoryId}-q\d+` |
| **Challenge** | Follow-up question presented after a Position | Source: `deeperDives[]` entry<br>Generated: `followUps[].challenges[]` where `id` matches `{positionId}-fu\d+` |

## 1a. Counts & Shapes (Evidence-Based, as of 2025-12-30)

Production content verified by PRODUCTION SHAPE PROOF test in `admin-content-explorer.component.spec.ts`:

- **positionCount:** 28 (7 ideals × 4 positions each)
- **flatChallengeCount:** 0 (legacy schema where challenges were peers in `followUps[]` array, pattern `{positionId}-fu\d+`)
- **nestedChallengeCount:** 13 (current schema where challenges live in `followUps[].challenges[]` arrays, nested under linked Positions)

**Evidence:** Run `npm run test -- --include src/app/features/admin/admin-content-explorer.component.spec.ts --watch=false --browsers ChromeHeadless` and observe LOG lines showing positionCount/flatChallengeCount/nestedChallengeCount.

**Contract:** Accompanying contract test asserts `flatChallengeCount === 0` and `nestedChallengeCount === 13`. If production adds flat challenges or changes nested count, test will FAIL and signal schema migration.

Business term: **nested challenges (deeperDives)** = adaptive follow-up questions presented after user answers a Position.

## 2. Source JSON Schema (`content/categories/*.json`)

Each category file contains:

```json
{
  "id": "liberty",
  "title": "Liberty",
  "order": 0,
  "description": "...",
  "questions": [ Question ]
}
```

### Question object
- `id`: `{categoryId}-q{index}`
- `title` / `body`: human-readable prompt (copy reviewed)
- `order`: 0-based position order inside the category
- `tlq`: optional boolean (legacy, ignored by pipeline but kept for authorship context)
- `deeperDives`: optional array of Challenge objects

### Challenge (deeper dive)
- `id`: `{positionId}-fu{index}`
- `title`, `body`: displayed verbatim in challenge UI
- `order`: 0-based within the linked Position
- `triggerRule` (optional): Adaptive challenge metadata controlling when this challenge is shown
  - `parentAnswerMin` (number, 1-5): Only show if user's answer for the linked Position is >= this value
  - `parentAnswerMax` (number, 1-5): Only show if user's answer for the linked Position is <= this value
  - `tags` (string[]): Semantic tags for future filtering (e.g., "pro-liberty", "paternalism")
  - **Schema keys:** `parentAnswerMin`/`parentAnswerMax` refer to the user's Likert answer (1-5) for the linked Position. Range: 1=Strongly Disagree, 2=Disagree, 3=Neutral, 4=Agree, 5=Strongly Agree.
  - Challenges without `triggerRule` always display (backward compatible).

All IDs must be globally unique; keep `order` contiguous. Authors maintain these files directly or via Admin export patches applied with `npm run admin:apply-patch -- --patch <file> --write`.

## 3. Generated Artifact (`src/assets/content/rawls-values.generated.json`)

`npm run content:export-app` produces a normalized structure consumed at runtime:

- `categories[]`: { `id`, `name`, `description`, `quote`, `followUps[]` }
- `followUps[]`: each Position with fields `id`, `statement`, `reverse`, `dimension`, optional `hidden`.
- `challenges[]`: nested array on each followUp, mirroring deeper dives (order preserved). Omitted when empty.
- `likert5[]`: canonical labels used across UI.

Runtime rules enforced by `ContentService`, session store, and admin shape-proof tests:
- Follow-up IDs must map back to authored positions.
- Challenges array is emitted only when length > 0 (per TD-RAWLS-007A contract).
- Hidden positions are filtered before gameplay but remain in artifact for audit.

## 4. Validation & Tooling

1. `npm run content:lint`
   - Validates schema, ID uniqueness, contiguous ordering.
   - Writes anomaly report to `artifacts/content-diff.md` when diffs exist.
2. `npm run content:build`
   - Same validations as lint + writes merged content to `dist/` for inspection.
3. `npm run content:export-app`
   - Copies validated output into `src/assets/content/rawls-values.generated.json` for runtime use.

CI expectation: run lint → export-app whenever `content/` or scripts change, then commit both source JSON and generated artifact.

## 5. Contract Tests & Proofs

- `src/app/features/admin/admin-content-explorer.component.spec.ts`
  - **Production Content Shape Proof:** Logs category/position/challenge counts every test run.
  - **Contract Test:** Fails if challenge count deviates from expected baseline, signaling UI changes.
- `content.integrity.spec.ts` (future): place adaptive-trigger validations and schema locks here.

Never modify these tests without updating this document plus the Admin handoff entry.

## 6. Editing Workflow

1. Make changes in `content/categories/*.json` (or apply Admin patch via CLI).
2. Run `npm run content:lint` (must be clean).
3. Run `npm run content:export-app` (regenerates runtime file).
4. If content feeds UI behavior, follow Start-Here instructions: `npm run test` + `npm run build`.
5. Include source + generated files + artifacts (diff report if produced) in the same commit.

Questions? See `docs/admin/admin-patch-pipeline.md` and `docs/handoffs/handoff-2025-12-23-challenge-settled.md` for context.
