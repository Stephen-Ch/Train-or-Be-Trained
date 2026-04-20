# Octopus Invariants

**Authority:** This document overrides all other docs on overlay location.
Any doc or script that contradicts these invariants is wrong and must be corrected.

---

## Invariant 1 — Kit Head Is Vendor Content

    <DOCS_ROOT>/vibe-coding/

This directory is the kit head. It is **vendor / read-only** content delivered
via git subtree. It MUST contain **zero repo truths** (no project-specific
overlays, configs, or customizations).

## Invariant 2 — Overlays Live Outside the Head

    <DOCS_ROOT>/overlays/

This is the **only** allowed location for repo-specific overlay files
(OVERLAY-INDEX.md, `<repo-name>.md`, etc.). Overlays MUST NOT exist anywhere
under `<DOCS_ROOT>/vibe-coding/`.

## Invariant 3 — Contradiction = Bug

Any document, script, or automation that places overlays inside
`<DOCS_ROOT>/vibe-coding/` or references `<DOCS_ROOT>/vibe-coding/overlays/`
as a recommended location is incorrect and must be fixed immediately.

---

## Canonical Paths (No Ambiguity)

| What | Path |
| ---- | ---- |
| Kit head (vendor, read-only) | `<DOCS_ROOT>/vibe-coding/` |
| Overlays (repo truths) | `<DOCS_ROOT>/overlays/` |

---

## Enforcement

These invariants are enforced by:

- **doc-audit.ps1** — HARD FAIL if `<DOCS_ROOT>/vibe-coding/overlays/` exists
- **session-start.ps1** — HARD STOP before subtree pull if overlays inside head
- **DOCS-HEALTH-CONTRACT.md** — Documents the checks and expected PASS criteria

---

## Migration Note for Arm Repos

If your repo still has overlays under `<DOCS_ROOT>/vibe-coding/overlays/`:

1. Move the directory: `git mv <DOCS_ROOT>/vibe-coding/overlays/ <DOCS_ROOT>/overlays/`
2. Update any local references from `vibe-coding/overlays/` to `overlays/`
3. Run doc-audit to confirm PASS

This is a one-time migration. Once moved, the hard-fail checks prevent drift.

---

Last updated: 2026-02-09
