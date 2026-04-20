# Report: Lock Octopus Invariant (Overlays Outside Kit Head)

**Report ID:** KIT-LOCK-OVERLAYS-OUTSIDE-HEAD-001
**Date:** 2026-02-09
**Repo:** Stephen-Ch/vibe-coding-kit
**Branch:** docs/lock-overlays-outside-kit-001

---

## Files Changed

| File | Action |
| ---- | ------ |
| OCTOPUS-INVARIANTS.md | Created (single-source invariant doc) |
| DOCS-HEALTH-CONTRACT.md | Created (hard-fail check definitions) |
| README.md | Updated (added directory map entries for new docs) |
| portability/subtree-playbook.md | Updated (added invariant callout to Overlay Pattern section) |
| tools/session-start.ps1 | Updated (overlay-inside-head HARD STOP + overlay index warning) |
| tools/doc-audit.ps1 | Updated (overlay-inside-head FAIL + overlay index check + DOCS_ROOT detection) |

## Before / After Scan Counts

| Pattern | Before | After (total) | After (violations) |
| ------- | ------ | ------------- | ------------------- |
| vibe-coding/overlays (all) | 0 | 10 | 0 |
| vibe-coding/overlays (enforcement/error msgs in scripts) | 0 | 4 | — |
| vibe-coding/overlays (forbidden-path refs in docs) | 0 | 6 | — |
| vibe-coding/overlays as recommended location | 0 | 0 | 0 |

All post-edit occurrences describe the forbidden path (error messages, migration
instructions, FAIL conditions). Zero occurrences recommend placing overlays inside
the kit head.

## Enforcement Summary

1. **session-start.ps1** — HARD STOP before subtree pull if
   `<DOCS_ROOT>/vibe-coding/overlays/` exists. WARNING if overlay index missing.

2. **doc-audit.ps1** — FAIL if `<DOCS_ROOT>/vibe-coding/overlays/` exists.
   WARNING if overlay index missing at `<DOCS_ROOT>/overlays/OVERLAY-INDEX.md`.
   Chose WARNING (not FAIL) for missing overlay index because new repos may not
   have created overlays yet — lowest-risk behavior.

3. **DOCS-HEALTH-CONTRACT.md** — Documents all checks including overlay hard-fail.
   References OCTOPUS-INVARIANTS.md as authority.

4. **OCTOPUS-INVARIANTS.md** — Single-source invariant document. Three invariants
   (head is vendor, overlays outside head, contradiction = bug) with canonical
   paths and arm-repo migration note.

## Statement

Overlays are outside head; drift prevented by hard-fail checks in session-start.ps1
and doc-audit.ps1, documented in DOCS-HEALTH-CONTRACT.md and OCTOPUS-INVARIANTS.md.
All changes applied to the kit source repo (Stephen-Ch/vibe-coding-kit).

---

Last updated: 2026-02-09
