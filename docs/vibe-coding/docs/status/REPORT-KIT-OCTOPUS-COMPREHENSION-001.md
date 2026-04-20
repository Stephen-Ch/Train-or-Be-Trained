# REPORT-KIT-OCTOPUS-COMPREHENSION-001

> **Date:** 2026-02-10
> **Type:** Research-only (comprehension artifact)
> **Scope:** vibe-coding-kit repo only

---

## 1) Executive Summary

- The vibe-coding-kit is a **portable bundle** of workflow protocol docs, templates, standards, and tooling for AI-assisted development sessions.
- It is maintained in a standalone repo (`Stephen-Ch/vibe-coding-kit`) and vendored into consumer repos via `git subtree`.
- Consumer repos mount the kit at `<DOCS_ROOT>/vibe-coding/` (typically `<DOCS_ROOT>/vibe-coding/`).
- The kit head is **vendor / read-only** in consumers -- project-specific content (overlays, control decks, research) lives OUTSIDE the kit head.
- Three **Octopus Invariants** govern overlay placement and prevent project-specific content from leaking into the kit.
- `tools/doc-audit.ps1` enforces invariants and docs health; it must PASS before every commit.
- The **Tiered Confidence Gate** (95% for docs, 99% for production code) prevents speculative changes.
- If confidence is below threshold, STOP and enter RESEARCH-ONLY mode -- no exceptions.
- Every prompt must include a **PROMPT-ID**; every output must include a **Completion Report**.
- Session startup uses `doc-audit.ps1 -StartSession` to print GPT/Copilot snippets and the upload file list.
- README.md is the canonical entry point and single source of truth for what gets uploaded to GPT.
- The kit version is tracked solely in `VIBE-CODING.VERSION.md` (currently v7.2.2).
- A dual-agent model (ChatGPT = Planner, Copilot = Executor) ensures separation of planning from execution.

---

## 2) Repo Mental Model

### Directory Map

| Path | Purpose |
|------|---------|
| `/` (repo root) | Entry points: README.md, protocol-lite.md, protocol-primer.md, session-start-checklist.md |
| `protocol/` | Living workflow docs: protocol-v7.md (authoritative), copilot-instructions, alignment-mode, verification-mode, etc. |
| `templates/` | Completion report blocks: evidence pack, manual test, closeout, test-touch, prompt-template |
| `standards/` | Portable standards: research-standard.md, stack-profile-standard.md |
| `portability/` | Subtree integration playbook, user story |
| `terminology/` | Project-wide dictionary + template for new mappings |
| `tools/` | doc-audit.ps1, session-start.ps1, sync-forgpt.ps1 |
| `docs/status/` | Research/audit reports (REPORT-KIT-*.md) |

### Source-of-Truth Hierarchy

1. **OCTOPUS-INVARIANTS.md** -- overrides all other docs on overlay location
2. **README.md** -- canonical entry point; defines what gets uploaded to GPT
3. **protocol/protocol-v7.md** -- authoritative full protocol rules
4. **DOCS-HEALTH-CONTRACT.md** -- defines hard-fail audit checks
5. **VIBE-CODING.VERSION.md** -- sole authority for kit bundle version
6. **protocol-lite.md** -- quick reference (links to protocol-v7; does not define rules)

### What Is Vendored vs Project-Specific

| Vendored (inside kit subtree) | Project-specific (outside kit head) |
|-------------------------------|-------------------------------------|
| `<DOCS_ROOT>/vibe-coding/` (entire kit) | `<DOCS_ROOT>/project/` (VISION, EPICS, NEXT, stack-profile) |
| Protocol, templates, standards, tools | `<DOCS_ROOT>/research/` (R-### docs, ResearchIndex) |
| Subtree playbook, terminology | `<DOCS_ROOT>/overlays/` (repo-specific overlay files) |
| | `<DOCS_ROOT>/forGPT/` (generated mirror for ChatGPT sessions) |
| | `<DOCS_ROOT>/status/` (branch status, return packets) |

---

## 3) Octopus Protocol

### Invariants

1. **Kit Head Is Vendor Content** -- `<DOCS_ROOT>/vibe-coding/` is read-only vendor content delivered via git subtree. It MUST contain zero repo truths (no project-specific overlays, configs, or customizations).
   - Source: OCTOPUS-INVARIANTS.md, "Invariant 1"

2. **Overlays Live Outside the Head** -- `<DOCS_ROOT>/overlays/` is the ONLY allowed location for repo-specific overlay files. Overlays MUST NOT exist anywhere under `<DOCS_ROOT>/vibe-coding/`.
   - Source: OCTOPUS-INVARIANTS.md, "Invariant 2"

3. **Contradiction = Bug** -- Any document, script, or automation that places overlays inside the kit head or references `<DOCS_ROOT>/vibe-coding/overlays/` as a recommended location is incorrect and must be fixed immediately.
   - Source: OCTOPUS-INVARIANTS.md, "Invariant 3"

### Forbidden Moves

1. Placing overlays or project-specific files inside `<DOCS_ROOT>/vibe-coding/`.
2. Creating a kit-root `/forGPT` directory (collides with consumer repos via subtree).
3. Duplicating kit-canonical filenames (protocol-v7.md, copilot-instructions-v7.md, etc.) outside `<DOCS_ROOT>/vibe-coding/`.
4. Guessing or assuming without verified evidence when confidence is below threshold.
5. Executing code changes in RESEARCH-ONLY mode.
6. Running terminal commands before printing the Prompt Review Gate.

### Required Gates

| Gate | Command / Check | When |
|------|-----------------|------|
| Doc Audit | `.\tools\doc-audit.ps1` | Before every commit |
| Overlays-outside-head | Checked by doc-audit.ps1 | Every audit run (both Kit and Consumer modes) |
| Overlay Index existence | Checked by doc-audit.ps1 | Consumer mode only |
| Control Deck population | doc-audit.ps1 placeholder scan | Consumer mode only |
| NEXT freshness | doc-audit.ps1 code-changes check | Consumer mode, PR context only |
| Green Gate (stack-aware) | Build command from stack-profile.md | Before commit with code changes |
| Prompt Review Gate | 4-line output (What/Best next/Confidence/Work state) | Before ANY command in every prompt |
| Confidence Gate | 95% docs / 99% production | Before any implementation |

### Detection/Enforcement

- **doc-audit.ps1** -- HARD FAIL if `<DOCS_ROOT>/vibe-coding/overlays/` exists; checks control deck population, NEXT freshness, overlay index.
- **session-start.ps1** -- HARD STOP before subtree pull if overlays found inside kit head. Chains: kit update, forGPT sync, session audit block.
- **Prompt Review Gate** -- Every AI response must print the 4-line gate before any commands. Violation = STOP.
- **Prior Research Lookup** -- Every RESEARCH-ONLY output must search ResearchIndex.md first; missing = INVALID.
- **docs/status/REPORT-*.md** -- Audit trail of past investigations (decontamination, deduplication, etc.).

### Common Failure Modes

| Failure | What to Do |
|---------|------------|
| Overlays inside kit head | `git mv <DOCS_ROOT>/vibe-coding/overlays/ <DOCS_ROOT>/overlays/` |
| Placeholder tokens in Control Deck | Edit VISION/EPICS/NEXT to replace TBD/TODO/PLACEHOLDER |
| NEXT.md not updated on code PR | Update NEXT.md to reflect current story state |
| forGPT stale | Run `sync-forgpt.ps1` to refresh from canonical sources |
| Confidence below threshold | Enter RESEARCH-ONLY; produce Evidence Pack; do not proceed |

---

## 4) Vibe-Coding Workflow (as implemented in this kit)

### Session Start Ritual

**Copilot sessions:**
1. Run `.\tools\doc-audit.ps1 -StartSession`
2. Output includes: GPT snippet, Copilot snippet, FILES TO UPLOAD TO GPT list
3. Paste the Copilot snippet at the top of every Copilot prompt
4. Audit PASS is required before any work

**GPT (ChatGPT) sessions:**
1. Upload README.md + the 5 files listed in the GPT Session Bootstrap section
2. Paste the GPT snippet as the system prompt
3. GPT acts as Planner/Prompt Writer; does NOT execute code

**Consumer repos (with subtree):**
1. Run `.\tools\session-start.ps1` (chains: subtree pull, forGPT sync, audit)
2. Or say "RUN START OF SESSION DOCS AUDIT" to Copilot

### Prompt Classes and Rules

| Class | Format | Allowed Actions |
|-------|--------|-----------------|
| **FORMAL WORK PROMPT** | Fenced code block with PROMPT-ID, GOAL, SCOPE, TASKS, END PROMPT | Terminal commands, file edits, tests, builds, commits |
| **CONVERSATIONAL REQUEST** | Natural language (no PROMPT-ID needed) | Discussion, analysis, read-only tools only; no edits |
| **RESEARCH-ONLY** | Declares `Scope: RESEARCH-ONLY` | Read-only tools, creating R-### docs; no code edits |
| **INSTRUMENTATION (CODE-OK)** | Explicit approval for temp diagnostics | Temporary logging/diagnostic code with strict guardrails |

### Confidence Gate

- **Threshold:** 95% for low-risk (docs, tests, reports); 99% for production/runtime code.
- **Below threshold:** STOP immediately. Enter RESEARCH-ONLY mode. Produce Evidence Pack.
- **Dual-agent enforcement:** ChatGPT must not draft implementation prompts below threshold; Copilot must not execute code changes below threshold.
- **Handshake phrase:** "Confidence <95% -- entering RESEARCH-ONLY mode"
- **Exit condition:** Evidence Pack complete + confidence >= 95% + explicit declaration.

### Completion Report Checklist

Every output MUST include:
- PROMPT-ID
- Branch name
- Files changed (paths)
- Command results summary (gate PASS/FAIL, warnings)
- Proof of scope: `git diff --name-only origin/main...HEAD`
- Flake suspect: YES/NO (if tests were run)
- Search method used + recovery applied (if searches were performed)

---

## 5) Tooling Inventory

### tools/doc-audit.ps1

**Purpose:** Enforces DOCS-HEALTH-CONTRACT.md checks.

**Modes:**
- **Kit mode** (auto-detected in vibe-coding-kit repo): Runs overlays-outside-head check only; skips consumer-only checks (control deck, population gate, NEXT freshness).
- **Consumer mode** (auto-detected in arm repos): Runs all checks including control deck existence, placeholder scan, NEXT freshness, overlay index.

**`-StartSession` flag output contract:**
1. GPT snippet (from `<!-- STARTSESSION:GPT -->` markers in README)
2. Copilot snippet (from `<!-- STARTSESSION:COPILOT -->` markers in README)
3. FILES TO UPLOAD TO GPT list (from `<!-- GPTBOOTSTRAP:START -->` markers in README)
4. Normal audit runs after snippets; must PASS.

**Key checks:**
- Overlays-outside-head (Octopus Invariant 2) -- HARD FAIL
- Reserved kit filename duplication -- FAIL
- Control Deck existence (Consumer) -- FAIL if missing
- Population Gate placeholder scan (Consumer) -- FAIL if TBD/TODO found
- NEXT freshness on code PRs (Consumer) -- FAIL if NEXT.md not updated

### tools/sync-forgpt.ps1

**Purpose:** Copies session-critical docs into `<DOCS_ROOT>/forGPT/` using `forgpt.manifest.json` as the file list. Generates VERSION-MANIFEST.md with SHA256 hashes for freshness verification.

**Safety:** Only modifies files inside forGPT/; stops on dirty tree (unless -Force); stops if source file missing.

**Relevance to kit repo:** The script lives in the kit but primarily operates in consumer repos where a `forGPT/` folder and manifest exist.

### tools/session-start.ps1

**Purpose:** Consumer-repo session wrapper. Chains: subtree pull (kit update) -> forGPT sync -> 5-line doc audit. Invoked by "RUN START OF SESSION DOCS AUDIT" command.

**Safety:** HARD STOP on dirty tree (unless -Force); HARD STOP if overlays inside kit head; HARD STOP if subtree prefix missing.

### Subtree/Bundle Behavior

- Kit is added to consumers via: `git subtree add --prefix=<DOCS_ROOT>/vibe-coding <url> main --squash`
- Updates via: `git subtree pull --prefix=<DOCS_ROOT>/vibe-coding <url> main --squash`
- Subtree ONLY touches `<DOCS_ROOT>/vibe-coding/`; project docs are never overwritten.
- DOCS_ROOT detected deterministically: `<DOCS_ROOT>/` takes precedence over `docs/`.

---

## 6) "If you only read 5 files, read these"

| # | File | Why |
|---|------|-----|
| 1 | README.md | Canonical entry point; session bootstrap lists; directory map; source of truth for GPT uploads |
| 2 | OCTOPUS-INVARIANTS.md | The 3 invariants that override everything else on overlay placement |
| 3 | protocol/protocol-v7.md | Full authoritative protocol: all gates, rules, sequencing, enforcement |
| 4 | protocol-lite.md | Quick reference (~150 lines) linking to protocol-v7 sections; day-to-day cheat sheet |
| 5 | DOCS-HEALTH-CONTRACT.md | Hard-fail checks that doc-audit.ps1 enforces; connects invariants to tooling |

---

## 7) Evidence Appendix

| Claim | File | Heading / Reference | Excerpt (<=25 words) |
|-------|------|---------------------|----------------------|
| Kit head is vendor content | OCTOPUS-INVARIANTS.md | Invariant 1 | "This directory is the kit head. It is vendor / read-only content delivered via git subtree." |
| Overlays must live outside head | OCTOPUS-INVARIANTS.md | Invariant 2 | "This is the only allowed location for repo-specific overlay files." |
| Contradiction = Bug | OCTOPUS-INVARIANTS.md | Invariant 3 | "Any document, script, or automation that places overlays inside...is incorrect and must be fixed immediately." |
| doc-audit enforces invariants | DOCS-HEALTH-CONTRACT.md | Enforcement | "These checks are implemented in: tools/doc-audit.ps1" |
| Overlays-inside-head = HARD FAIL | DOCS-HEALTH-CONTRACT.md | Check 4 | "If <DOCS_ROOT>/vibe-coding/overlays/ exists => FAIL" |
| 95% confidence threshold (docs) | protocol/protocol-v7.md | Tiered Confidence Rule (L296-304) | "Low-risk (docs, tests, reports) >= 95% May proceed" |
| 99% confidence threshold (prod) | protocol/protocol-v7.md | Tiered Confidence Rule (L296-304) | "Production/runtime code >= 99% May proceed" |
| RESEARCH-ONLY forbidden actions | protocol/protocol-v7.md | RESEARCH-ONLY Forbidden Actions (L385) | "Editing runtime code...Creating branches for code changes...NO" |
| Prior Research Lookup mandatory | protocol/protocol-v7.md | Prior Research Lookup (L366) | "Every RESEARCH-ONLY output MUST include a Prior Research Lookup section" |
| README is canonical entry point | README.md | (line 1-5) | "Portable Vibe-Coding Kit...File Version: 2026-02-09" |
| GPT bootstrap list derived from README | README.md | GPT Session Bootstrap (L17-28) | "Upload this README + the files below to start a ChatGPT session. README is canonical." |
| Kit version sole authority | VIBE-CODING.VERSION.md | Purpose | "This file is the single source of truth for the kit bundle version." |
| Subtree only touches kit prefix | portability/subtree-playbook.md | Safe Update Rule | "Subtree pull only touches the subtree prefix. Files outside...are never modified." |
| No kit-root forGPT directory | README.md | STARTSESSION:GPT snippet | "Do NOT create a kit-root /forGPT directory (it collides with consumer repos via subtree)." |
| Dual-agent model | protocol-primer.md | Your Role (ChatGPT) | "You are the Planner/Prompt Writer. You produce prompts for Copilot to execute." |
| PROMPT-ID required | README.md | STARTSESSION:GPT snippet | "Every prompt MUST include a PROMPT-ID. Every output MUST include a Completion Report." |
| session-start.ps1 chains three steps | tools/session-start.ps1 | Synopsis | "Session-start wrapper: updates vibe-coding-kit subtree > syncs forGPT > prints 5-line Doc Audit." |
| -StartSession prints upload list | tools/doc-audit.ps1 | GPTBOOTSTRAP block (~L352) | Script extracts GPTBOOTSTRAP markers, parses markdown links, prints file paths. |

---

## Commands Run During Research

```
git ls-files
read_file: README.md, DOCS-HEALTH-CONTRACT.md, OCTOPUS-INVARIANTS.md,
  FILE-VERSIONING.md, MIGRATION-INSTRUCTIONS.md, PAUSE.md,
  protocol-primer.md, protocol-lite.md, protocol/protocol-v7.md,
  protocol/PROTOCOL-INDEX.md, VIBE-CODING.VERSION.md,
  portability/subtree-playbook.md, session-start-checklist.md,
  tools/doc-audit.ps1, tools/session-start.ps1, tools/sync-forgpt.ps1
grep_search: "No Guessing|Tiered Confidence|confidence gate|RESEARCH-ONLY" in protocol-v7.md
file_search: **/sync-forgpt*, **/forgpt*
```
