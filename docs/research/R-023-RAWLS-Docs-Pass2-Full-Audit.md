# R-023 — Rawls Docs Pass 2 Full Audit

**Date:** 2026-02-07
**Prompt:** DOCS-RAWLS-PASS2-FULL-DOCS-AUDIT-STATUS-INCLUDED-SINGLE-COMMIT-001
**Area:** Docs Infrastructure
**Status:** COMPLETE

---

## 1) Evidence Inventory

All evidence files stored in `docs/research/`:

| File | Description |
|------|-------------|
| REPORT-docs-tree-files.txt | All files on disk under docs/ (Get-ChildItem) |
| REPORT-docs-tracked-files.txt | All git-tracked files under docs/ (git ls-files) |
| REPORT-docs-ignored-files.txt | All git-ignored files under docs/ (0 lines) |

### Machine-Verifiable Identity

```
on_disk(224) = tracked(224) + ignored(0) + untracked(0) = 224  ✓
```

## 2) Classification

| Category | Count | Description |
|----------|-------|-------------|
| ALREADY-INDEXED | 56 | In ResearchIndex: 22 R-### moved + 34 in 3 archived bundles |
| INDEX-IN-PLACE | 1 | Research-worthy, stays in place (td-rawls-018) |
| LEAVE-NON-RESEARCH | 38 | Operational: Control Deck, handoffs, status, testing |
| GENERATED | 28 | forGPT outputs (25) + evidence reports (3) |
| ARCHIVE | 67 | _legacy (16), _shared (29), archive/* (10), handoffs/archive (3), protocol (9) |
| TOOLING | 34 | vibe-coding subtree (33) + content-find-replace-map.json (1) |
| **TOTAL** | **224** | Matches on-disk count ✓ |

### ALREADY-INDEXED breakdown

| Source | Files |
|--------|-------|
| docs/research/R-001 – R-022 | 22 |
| docs/status/archive/2025-12-22-v1-investigations/ | 26 |
| docs/status/archive/2025-12-25-session-cleanup/ | 4 |
| docs/archive/reports/2025/ | 4 |
| **Total** | **56** |

### New INDEX-IN-PLACE (added in Pass 2)

| File | Area | Justification |
|------|------|---------------|
| docs/status/td-rawls-018-completion-report-2025-12-29.md | Tech Debt | Completion report (research-worthy per "report" classification rule) |

### MOVE-TO-RESEARCH actions: 0

No files moved. All research-worthy items are either already in docs/research/ or indexed-in-place.

### Duplicates removed: 0

No duplicates identified that required removal.

## 3) Corrections Applied

| Item | Old | New | Reason |
|------|-----|-----|--------|
| v1-investigations bundle count | 28 | 26 | Actual on-disk count is 26 files |
| Coverage Guarantee counts | 160/159/1 | 224/224/0 | Updated to Pass 2 counts |

## 4) No-Runtime-Changes Proof

All changes are under docs/** only. Verified with:
```
git diff --name-only  # shows only docs/** paths
```

## 5) Research Coverage Summary

- Moved to docs/research/: 22 (R-001 – R-022)
- Indexed-in-place: 26 + 4 + 4 + 1 = 35
- Total research-indexed: 57

---
