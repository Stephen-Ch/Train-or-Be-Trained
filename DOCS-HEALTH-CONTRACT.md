# Docs Health Contract

**Authority:** Defines hard-fail checks for documentation health in arm repos.
References [OCTOPUS-INVARIANTS.md](OCTOPUS-INVARIANTS.md) for overlay placement
rules — that document overrides all others.

---

## Required Checks

### 1. Control Deck Existence

The following files MUST exist (paths configurable via vibe-coding.config.json):

- `<DOCS_ROOT>/project/VISION.md`
- `<DOCS_ROOT>/project/EPICS.md`
- `<DOCS_ROOT>/project/NEXT.md`

**FAIL** if any file is missing.

### 2. Population Gate

Control Deck files MUST NOT contain placeholder tokens:

    TBD, TODO, TEMPLATE, PLACEHOLDER, FILL IN, COMING SOON, XXX, FIXME,
    TO BE DETERMINED, <fill

**FAIL** if any placeholder is found in VISION.md, EPICS.md, or NEXT.md.

### 3. Overlay Index Existence

The overlay index MUST exist at:

    <DOCS_ROOT>/overlays/OVERLAY-INDEX.md

**FAIL** if missing.

### 4. Overlays Outside Kit Head (Hard-Fail)

    If <DOCS_ROOT>/vibe-coding/overlays/ exists => FAIL

Message: "Overlays detected inside kit head. Move to <DOCS_ROOT>/overlays/ and
re-run. See OCTOPUS-INVARIANTS.md."

This check enforces Invariant 2 from OCTOPUS-INVARIANTS.md and prevents drift.

### 5. Reserved Kit Filenames

Kit-canonical filenames (protocol-v7.md, copilot-instructions-v7.md,
working-agreement-v1.md) MUST NOT exist outside `<DOCS_ROOT>/vibe-coding/`.

**FAIL** if duplicates found outside the kit head.

### 6. Start-Here-For-AI.md Placement

Start-Here-For-AI.md is a consumer canonical file expected at
`<DOCS_ROOT>/Start-Here-For-AI.md`. It must NOT appear inside
`<DOCS_ROOT>/vibe-coding/` and must NOT be duplicated elsewhere.

**FAIL** if found inside kit head or duplicated.

---

## Enforcement

These checks are implemented in:

- `tools/doc-audit.ps1` — runs both locally and in CI
- `tools/session-start.ps1` — overlay-inside-head check before subtree pull

---

Last updated: 2026-02-26
