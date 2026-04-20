# Hot Files — Consumer Overlay Template

> **File Version:** 2026-02-26

## Purpose

Lists files and folders that require extra caution: analysis-first workflow, full-file replacement, or a Return Packet Gate before touching. The Return Packet Gate and other protocol gates reference this overlay to decide when to trigger research checkpoints.

## Overlay Review Gate

Before accepting this overlay into the consumer repo:

- Best next step? YES
- Confidence: 95

## Instructions

Copy into consumer repo at `<DOCS_ROOT>/overlays/hot-files.md` and edit there.  
Do NOT edit this template inside the kit head — it will be overwritten on subtree pull.

---

## Hot Files (check these first)

| File / Folder | LOC | Purpose | Why Hot |
|---------------|-----|---------|---------|
| `src/app/features/question-v2.component.ts` | — | Main question flow UI | Highest churn src file (8 changes in 100 commits) |
| `src/app/features/question-v2.component.spec.ts` | — | Question flow tests | Highest churn test file (10 changes in 100 commits) |
| `src/app/features/admin/admin-content-explorer.component.ts` | — | Admin content editor | High churn (9 changes in 100 commits) |
| `src/app/features/admin/admin-content-explorer.component.spec.ts` | — | Admin editor tests | High churn (10 changes in 100 commits) |
| `src/app/features/result.component.ts` | — | Results display | Moderate churn (4 changes in 100 commits) |
| `src/app/features/result.component.spec.ts` | — | Results tests | High churn (5 changes in 100 commits) |
| `src/app/features/review.component.ts` | — | Review page | Moderate churn (3 changes in 100 commits) |
| `docs/project/NEXT.md` | — | Active story & next step | High churn (11 changes in 50 commits), protocol-sensitive |
| `docs/status/solution-report.md` | — | Solution reports | Highest churn doc (22 changes in 50 commits) |
| `docs/status/code-review.md` | — | Code review records | Highest churn doc (22 changes in 50 commits) |

## Hot Folders

Directories where any change should trigger careful review:

- `src/app/features/` — Core UI components, highest churn app folder
- `src/app/features/admin/` — Admin pipeline, high churn
- `content/categories/` — Content JSON files, schema-sensitive
- `docs/project/` — Control Deck (VISION/EPICS/NEXT), protocol-gated

## Criteria for Adding Files

Add a file to this list when ANY of these apply:

- **>300 LOC** — Too large for safe inline edits
- **High churn** — Frequently changed, high merge-conflict risk
- **Coordination role** — Orchestrates multiple subsystems
- **Identity/auth** — Security-sensitive paths
- **Real-time messaging** — Payload contract changes affect multiple consumers
