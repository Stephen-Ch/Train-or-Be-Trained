# KIT-LINKS-MODE-AWARE-AUDIT-AND-FIXPLAN-001

> **Report Date:** 2025-02-09
> **Scope:** RESEARCH-ONLY — zero edits, zero commits, zero PRs
> **Branch:** main
> **Commit:** 2792660 (Merge PR #7 — version hygiene)
> **Working tree:** clean

## PR A Applied

- **Branch:** docs/kit-fix-broken-links-001
- **Date:** 2025-02-09
- **Statement:** Fixed 8 BROKEN-in-both instances only; no other link changes.
- **Files touched:** protocol/protocol-v7.md, protocol/alignment-mode.md, portability/subtree-playbook.md
- **doc-audit:** PASS (Kit mode explicit + auto-detect)

---

## Task 0 — Identity Proof

| Field | Value |
|-------|-------|
| Branch | main |
| Commit | 2792660 |
| Status | clean (1 untracked: docs/status/REPORT-KIT-DEDUPE-VERSION-LINKS-AUDIT-001.md) |

---

## Task 1 — Link Extraction Summary

Scanned all 22 markdown files. Excluded fenced code blocks, external URLs, and same-file-only anchors.

| Metric | Count |
|--------|-------|
| Files scanned | 22 |
| Total relative link instances | 112 |
| Unique link target strings | 65 |

---

## Task 2 — Mode-Aware Classification

Every link was classified against two contexts:

- **KIT context** — files read at repo root (how the kit repo itself renders)
- **CONSUMER context** — kit installed at `<DOCS_ROOT>/vibe-coding/` via git subtree; project docs at `<DOCS_ROOT>/project/`, `<DOCS_ROOT>/status/`, `<DOCS_ROOT>/research/`

| Category | Unique Targets | Instances | Meaning |
|----------|---------------|-----------|---------|
| KIT-VALID | ~41 | ~68 | Resolves correctly in the kit repo. Also works in consumer because internal kit structure is preserved. |
| CONSUMER-VALID | 18 | ~36 | Only resolves when kit lives at `<DOCS_ROOT>/vibe-coding/`. Points to project-owned files outside the kit. Intentionally broken in kit-repo context. |
| BROKEN | 6 | 8 | Resolves in **neither** context. Must be fixed. |

---

## Task 3 — BROKEN Links: "Fix Now" Set

**8 instances across 3 source files, 6 unique broken targets.**

### Bug Class A — Self-referencing `protocol/` prefix

`protocol/protocol-v7.md` lives inside `protocol/` but 5 links redundantly include the `protocol/` prefix, making the browser resolve `protocol/protocol/X` — a non-existent double-nested path.

| # | Source | Line | Broken Target | Fix |
|---|--------|------|---------------|-----|
| 1 | protocol/protocol-v7.md | L47 | `protocol/prompt-lifecycle.md` | `prompt-lifecycle.md` |
| 2 | protocol/protocol-v7.md | L74 | `protocol/alignment-mode.md` | `alignment-mode.md` |
| 3 | protocol/protocol-v7.md | L80 | `protocol/alignment-mode.md` | `alignment-mode.md` |
| 4 | protocol/protocol-v7.md | L91 | `protocol/alignment-mode.md` | `alignment-mode.md` |
| 5 | protocol/protocol-v7.md | L105 | `protocol/verification-mode.md` | `verification-mode.md` |

### Bug Class B — Wrong depth from `protocol/`

From inside `protocol/`, `../project/X` resolves to `project/X` at kit root (no such directory). In consumer context it resolves to `<DOCS_ROOT>/vibe-coding/project/X` (also non-existent — consumer project files are at `<DOCS_ROOT>/project/`). Needs `../../project/X` to reach the consumer's project directory.

| # | Source | Line | Broken Target | Fix |
|---|--------|------|---------------|-----|
| 6 | protocol/protocol-v7.md | L138 | `../project/tech-debt-and-future-work.md` | `../../project/tech-debt-and-future-work.md` |

### Bug Class C — Double-path `../vibe-coding/`

These links assume the file is outside the kit and navigate *into* `vibe-coding/`, but the file is already inside the kit. In consumer context this creates `vibe-coding/vibe-coding/` — broken everywhere.

| # | Source | Line | Broken Target | Fix |
|---|--------|------|---------------|-----|
| 7 | protocol/alignment-mode.md | L227 | `../vibe-coding/protocol/protocol-v7.md` | `protocol-v7.md` |
| 8 | portability/subtree-playbook.md | L228 | `../vibe-coding/session-start-checklist.md` | `../session-start-checklist.md` |

### Anchor Validation

All 6 anchor links from `protocol-lite.md` to `protocol/protocol-v7.md` were validated against actual GitHub-style heading IDs. The double-dash anchors (`--`) are correct — GitHub strips em-dashes and slashes from headings, leaving adjacent spaces that both become hyphens. **Zero broken anchors.**

| Referenced Anchor | Status | Heading Text |
|-------------------|--------|--------------|
| `#no-guessing--tiered-confidence-gate-mandatory` | VALID | No Guessing / Tiered Confidence Gate (MANDATORY) |
| `#research-only-command-lock-mandatory` | VALID | RESEARCH-ONLY Command Lock (MANDATORY) |
| `#evidence-pack-requirement-mandatory` | VALID | Evidence Pack Requirement (MANDATORY) |
| `#green-gate--stack-aware-rules` | VALID | Green Gate — Stack-Aware Rules |
| `#manual-test-checklist-artifact-mandatory` | VALID | Manual Test Checklist Artifact (MANDATORY) |
| `#waiting-for-approver-workflow-mandatory` | VALID | Waiting-for-Approver Workflow (MANDATORY) |

---

## Task 4 — Consumer-Only Link Inventory

**18 unique destinations, ~36 instances across 8 source files.** These links intentionally target project-owned files outside the kit. They work in consumer repos where the kit lives at `<DOCS_ROOT>/vibe-coding/`.

### Top Consumer-Only Targets by Frequency

| # | Target | Instances | Source Files |
|---|--------|-----------|-------------|
| 1 | `../../Start-Here-For-AI.md` | 7 | protocol-v7.md (4×), required-artifacts.md (3×) |
| 2 | `../project/NEXT.md` | 4 | PAUSE.md (2×), session-start-checklist.md (2×) |
| 3 | `../status/branches.md` | 3 | protocol-lite.md (2×), session-start-checklist.md (1×) |
| 4 | `../project/tech-debt-and-future-work.md` | 2 | session-start-checklist.md (2×) |
| 5 | `../research/ResearchIndex.md` | 2 | session-start-checklist.md (2×) |
| 6 | `../../project/stack-profile.md` | 2 | protocol-v7.md (2×) |
| 7 | `../../status/return-packet-…-epic-003.md` | 2 | return-packet-gate.md, github-agent template |
| 8 | `../../status/return-packet-…-td-diag-001.md` | 2 | return-packet-gate.md, github-agent template |
| 9 | `../../status/return-packet-…-td-be-002.md` | 2 | return-packet-gate.md, github-agent template |
| 10 | `../status/return-packet-…-epic-003.md` | 1 | README.md |
| 11 | `../status/return-packet-…-td-diag-001.md` | 1 | README.md |
| 12 | `../status/return-packet-…-td-be-002.md` | 1 | README.md |
| 13 | `../project/EPICS.md` | 1 | PAUSE.md |
| 14 | `../research/R-014-Sprint2-Manual-Test-…` | 1 | PAUSE.md |
| 15 | `../forGPT/README.md` | 1 | PAUSE.md |
| 16 | `../../project/VISION.template.md` | 1 | required-artifacts.md |
| 17 | `../../project/EPICS.template.md` | 1 | required-artifacts.md |
| 18 | `../../project/NEXT.template.md` | 1 | required-artifacts.md |

### Labeling Recommendation

These links are **by design** — the kit references project-owned files that only exist in the consumer repo. No fix needed, but they should be discoverable for anyone reading the kit standalone.

**Proposed convention:** Add a file-level HTML comment to the 5 most consumer-linked files:

| File | Consumer-link instances | Suggested header note |
|------|----------------------|----------------------|
| protocol/protocol-v7.md | 7 | `<!-- CONSUMER-LINKS: 7 links to project-owned files outside the kit. They resolve when kit lives at <DOCS_ROOT>/vibe-coding/. -->` |
| protocol/required-artifacts.md | 6 | Same pattern |
| session-start-checklist.md | 6 | Same pattern |
| PAUSE.md | 5 | Same pattern |
| protocol/return-packet-gate.md | 3 | Same pattern |

### Redundant-Path Note

One KIT-VALID link uses a redundant up-and-back path:

| Source | Line | Target | Simpler equivalent |
|--------|------|--------|-------------------|
| protocol/alignment-mode.md | L91 | `../protocol/required-artifacts.md` | `required-artifacts.md` |

Not broken, but should be simplified in PR A.

---

## Task 5 — doc-audit Dual-Mode Link Validation Proposal

Currently `tools/doc-audit.ps1` checks file existence and freshness but does **not** validate relative links. Adding link validation would catch all 8 BROKEN instances before they ship.

**Proposed enhancement (for a future PR, not part of PR A or B):**

| Feature | Description |
|---------|-------------|
| **Link extraction** | Regex scan each audited .md file for `[...](relative-path)` targets, skipping fenced code blocks and external URLs |
| **Kit-mode validation** | Resolve relative to the source file's directory within the repo root. Report any target that doesn't exist. |
| **Consumer-mode validation** | Resolve relative to the source file's directory assuming kit root = `<DOCS_ROOT>/vibe-coding/`. Skip consumer-only targets (those resolving above kit root). |
| **Anchor validation** | For targets with `#anchor`, confirm the anchor exists as a heading in the target file using GitHub's anchor algorithm: lowercase, strip non-alphanumeric except spaces/hyphens, spaces to hyphens. |
| **Output** | Append a LINK CHECK section to the audit: `LINK CHECK: PASS (N links verified)` or `LINK CHECK: FAIL — 3 broken links` with details. |
| **Mode awareness** | In Kit mode: validate all KIT-VALID links, skip CONSUMER links. In consumer mode: validate both KIT-VALID and CONSUMER links. |

---

## Task 6 — 2-PR Implementation Plan

### PR A — Fix Broken Links (KIT-BROKEN-LINKS-FIX-001)

**Scope:** Fix all 8 BROKEN link instances + 1 redundant path. Zero semantic changes, pure path corrections.

**Files touched:** 3

| File | Edits | Detail |
|------|-------|--------|
| protocol/protocol-v7.md | 6 | L47: `protocol/prompt-lifecycle.md` → `prompt-lifecycle.md`. L74, L80, L91: `protocol/alignment-mode.md` → `alignment-mode.md`. L105: `protocol/verification-mode.md` → `verification-mode.md`. L138: `../project/tech-debt` → `../../project/tech-debt`. |
| protocol/alignment-mode.md | 2 | L91: `../protocol/required-artifacts.md` → `required-artifacts.md` (redundant-path simplification). L227: `../vibe-coding/protocol/protocol-v7.md` → `protocol-v7.md`. |
| portability/subtree-playbook.md | 1 | L228: `../vibe-coding/session-start-checklist.md` → `../session-start-checklist.md`. |

**Verification:** After edits, run `tools/doc-audit.ps1` in both modes → expect PASS. Manually verify each corrected link resolves on GitHub after push.

**Commit message:** `fix: correct 8 broken relative links + 1 redundant path (3 files)`

### PR B — Consumer-Link Labeling (KIT-CONSUMER-LINKS-LABEL-001)

**Scope:** Add `<!-- CONSUMER-LINKS: ... -->` header comments to the 5 most consumer-linked files. Zero functional changes.

**Files touched:** 5

| File | Consumer links |
|------|---------------|
| protocol/protocol-v7.md | 7 |
| protocol/required-artifacts.md | 6 |
| session-start-checklist.md | 6 |
| PAUSE.md | 5 |
| protocol/return-packet-gate.md | 3 |

**Depends on:** PR A merged first (to avoid merge conflicts in protocol-v7.md and alignment-mode.md).

**Commit message:** `docs: add consumer-link annotations to 5 files`

### Sequencing

1. **PR A first** — fixes broken links (blocking correctness issue)
2. **PR B second** — labeling (non-blocking, quality-of-life improvement)
3. **doc-audit link-check enhancement** — separate future PR outside this plan

---

**END OF REPORT**
