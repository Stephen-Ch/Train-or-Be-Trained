# Canonical Commands

> **CRITICAL RULE:** Never omit `<DOCS_ROOT>/project/` or `<DOCS_ROOT>/testing/` in printed commands. Never rely on linkified filenames. Always use `git -C ...` to enforce repo-root execution.

## Reporting Standard — Narrative Dirs Only; Raw Evidence Is Authority

**A) Narrative**
- Narrative summaries MUST list ONLY directory buckets (example: docs/project: 2 files; app/src/...: 1 file).
- Narrative MUST NOT list filenames or full file paths.
- Narrative MUST NOT attempt to "fix" or "avoid" VSCode linkification.

**B) Authority**
- File locations and exact paths MUST be proven ONLY via raw command outputs:
  - `git -C $root diff --name-only`
  - `git -C $root ls-files <DOCS_ROOT>/project/VISION.md <DOCS_ROOT>/project/EPICS.md <DOCS_ROOT>/project/NEXT.md <DOCS_ROOT>/testing/test-catalog.md`
  - Population Gate grep command + result
  - doc-audit output (including any "Checked:" lines)
- If narrative conflicts with raw outputs, raw outputs win.

**C) Deprecation**
- Prior "canonical paths in narrative" requirement is deprecated due to tool linkification constraints.
- Commands MUST still use explicit canonical paths; only narrative summaries are restricted to directory buckets.

## Critical Command Rule — Explicit Canonical Paths
- Commands MUST use explicit canonical paths (no pathspec shortcuts such as `docs/project`).
- Population Gate MUST scan using explicit canonical paths.

## REPO ROOT ANCHOR (PowerShell)
```powershell
$root = git rev-parse --show-toplevel
Set-Location $root
git rev-parse --show-toplevel
git rev-parse --show-prefix
Get-Location
```

## CANONICAL PROOF COMMANDS

### A) Control Deck Existence Proof
```bash
git -C "$(git rev-parse --show-toplevel)" ls-files <DOCS_ROOT>/project/VISION.md <DOCS_ROOT>/project/EPICS.md <DOCS_ROOT>/project/NEXT.md
```

### B) Population Gate (Control Deck only)
```bash
git -C "$(git rev-parse --show-toplevel)" grep -n -i -E "(TBD|TODO|TEMPLATE|PLACEHOLDER|FILL IN|COMING SOON|XXX|FIXME|TO BE DETERMINED|<fill)" -- <DOCS_ROOT>/project/VISION.md <DOCS_ROOT>/project/EPICS.md <DOCS_ROOT>/project/NEXT.md
```

### C) Test Catalog Canonical Proof
```bash
git -C "$(git rev-parse --show-toplevel)" ls-files <DOCS_ROOT>/testing/test-catalog.md
```

### D) Mandatory Location Proof
```bash
git -C "$(git rev-parse --show-toplevel)" rev-parse --show-toplevel
git -C "$(git rev-parse --show-toplevel)" rev-parse --show-prefix
```

---

## Universal Command Runner (preferred)

`run-vibe.ps1` is the path-agnostic way to invoke any kit tool. Use it instead of hardcoding `<DOCS_ROOT>` paths.

- Works for `docs/`, `docs-engineering/`, and nested DOCS_ROOT layouts (e.g., `LessonWriter2.0/docs-engineering`)
- Avoids hardcoded paths
- Uses the repo's embedded vibe-coding subtree tools
- All named flags (`-WriteReport`, `-Mode`, `-StartSession`, etc.) bind correctly in PS 5.1

`<SUBTREE>` is your repo's vibe-coding subtree directory ending in `/vibe-coding` (e.g., found by searching for `VIBE-CODING.VERSION.md`).

**Discovery pattern (PowerShell):**
```powershell
$runner = Get-ChildItem -Path (git rev-parse --show-toplevel) -Recurse -Filter "run-vibe.ps1" | Where-Object { $_.FullName -match 'vibe-coding[\\/]tools[\\/]' } | Select-Object -First 1 -ExpandProperty FullName
```

**Canonical commands (path-independent):**

| Trigger | Command |
|---------|--------|
| RUN START OF SESSION DOCS AUDIT | `powershell -NoProfile -ExecutionPolicy Bypass -File <SUBTREE>/tools/run-vibe.ps1 -Tool session-start` |
| RUN END OF SESSION | `powershell -NoProfile -ExecutionPolicy Bypass -File <SUBTREE>/tools/run-vibe.ps1 -Tool end-session -WriteReport` |
| RUN SYNC forGPT | `powershell -NoProfile -ExecutionPolicy Bypass -File <SUBTREE>/tools/run-vibe.ps1 -Tool sync-forgpt` |
| RUN DOC AUDIT (Consumer) | `powershell -NoProfile -ExecutionPolicy Bypass -File <SUBTREE>/tools/run-vibe.ps1 -Tool doc-audit -Mode Consumer -StartSession` |
| RUN MID-SESSION RESET | No script — operator-driven protocol. See [protocol-v7.md § Mid-Session Reset](protocol-v7.md#mid-session-reset-operator-confusion-recovery) |

Add `-WhatIf` to preview without executing. Unlisted flags can be passed via `-ToolArgs @(...)`.

---

## SESSION START DOCS AUDIT (MANDATORY FIRST COMMAND)

When the user says **RUN START OF SESSION DOCS AUDIT**, Copilot runs:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File <SUBTREE>/tools/run-vibe.ps1 -Tool session-start
```

**What it does (chained, in order):**
1. **Kit update** — finds the `vibe-coding-kit` remote and runs `git subtree pull` to update the kit in the consumer repo. If the remote doesn't exist, it adds it automatically. If non-subtree files are dirty (e.g. control-deck repairs), they are auto-stashed before the pull and restored afterward. Dirty kit-subtree files still hard-stop.
2. **Kit version print** — reads `VIBE-CODING.VERSION.md` and prints `KitVersion: vX.Y.Z (Effective YYYY-MM-DD)`.
3. **forGPT sync** — runs `sync-forgpt.ps1` if present, refreshing the forGPT packet.
4. **Consumer doc-audit (hard fail)** — runs `doc-audit.ps1 -Mode Consumer` (with `-StartSession` if supported). If it fails, the session STOPS with a non-zero exit. Use `-SkipAudit` to bypass.
5. **Audit print** — outputs the session audit block (RepoRoot, DOCS_ROOT, forGPT, KitVersion, ConsumerAudit, ResearchIndex, OpenPRs).

**Optional flags:**
- `-SkipUpdate` — skip the subtree pull even if the remote exists
- `-SkipAudit` — skip the Consumer doc-audit step (still prints kit version)
- `-Force` — when `-SkipUpdate` is used, continue on dirty working tree (still reports Tree=DIRTY). When update runs, non-subtree files are auto-stashed automatically; `-Force` does not bypass subtree merge safety
- `-WhatIf` — print-only mode: no subtree pull, no forGPT sync, no doc-audit execution

**Hard Stop rule:** If any other command is requested before the session audit has been run, reply:
> Hard Stop. Run **RUN START OF SESSION DOCS AUDIT** first.

### Fallback (if run-vibe unavailable)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File <DOCS_ROOT>/vibe-coding/tools/session-start.ps1
```
Where `<DOCS_ROOT>` is `docs-engineering` or `docs` (whichever contains `vibe-coding/`).

---

## RUN END OF SESSION (repo hygiene)

When the user says **RUN END OF SESSION**, Copilot runs:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File <SUBTREE>/tools/run-vibe.ps1 -Tool end-session
```

**What it does:**
1. **Fetch origin** — updates remote refs so branch checks are accurate.
2. **Tracked changes check** — lists any tracked (staged/modified) files. If any exist, **exits 1** (hard stop).
3. **Untracked items** — lists untracked files (warning only; exit 0).
4. **Non-merged branches** — lists local branches not merged into origin/<default> (report only; no deletes).
5. **Summary** — prints RepoRoot, DOCS_ROOT, branch, HEAD, and all findings.

**Optional flags:**
- `-WriteReport` — write a markdown status report under `<DOCS_ROOT>/status/`
- `-SkipFetch` — skip `git fetch origin` (use stale remote refs)
- `-WhatIf` — print-only mode: no fetch, no report written

**No deletes; report-only.**

### Fallback (if run-vibe unavailable)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File <DOCS_ROOT>/vibe-coding/tools/end-session.ps1
```
Where `<DOCS_ROOT>` is `docs-engineering` or `docs` (whichever contains `vibe-coding/`).
