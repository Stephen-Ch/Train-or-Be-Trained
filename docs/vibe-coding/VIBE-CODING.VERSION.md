# Vibe-Coding Kit Version

**Version:** v7.2.33  
**Effective Date:** 2026-03-03

## Purpose
Defines required artifacts + gates used by Doc Audit. This file is the **single source of truth** for the kit bundle version. Per-file `Bundle:` headers were removed in v7.2.2 to prevent version drift -- see changelog below.

## What Changed in v7.2.33
- Add hard-rules quick reference (<2KB) with links; protocol-v7 remains authoritative.

## What Changed in v7.2.32
- Deduped STOP/PIVOT Rule (PIVOT REPORT + Contradiction STOP formats single-sourced in protocol-v7.md § Resilience Rules; copilot-instructions-v7.md now cross-links).

## What Changed in v7.2.31
- Deduped External Research Escalation (single-sourced in working-agreement-v1.md; copilot-instructions-v7.md now cross-links).

## What Changed in v7.2.30
- Removed consumer-facing kit-internal planning path literals from all shipped markdown to prevent persistent consumer doc-audit warnings (WARN rule remains: consumers should not reference kit-internal planning docs).

## What Changed in v7.2.29
- Redundancy reduction pilot: single-sourced Timeboxing + Pivot Rule in protocol-v7.md; replaced duplicated block in working-agreement-v1.md with cross-link.

## What Changed in v7.2.28
- Added templates/research-request-template.md — structured GPT↔Copilot research handoff format with mandatory fields, evidence pack section, and confidence gate alignment.

## What Changed in v7.2.27
- Added QUICKSTART.md — consumer-facing "add vibe-coding to your repo in ~5 minutes" guide with install, verify, update, and troubleshooting sections.

## What Changed in v7.2.26
- Added Comprehension Self-Check (3-question gate) as required step after Proof-of-Read in protocol-v7.md; cross-linked in copilot-instructions-v7.md.

## What Changed in v7.2.25
- session-start.ps1: added kit-version lag WARN — compares local vs remote kit version, emits WARN on mismatch or unavailability (never fails).

## What Changed in v7.2.24
- Added internal planning directory for kit maintainers: ROADMAP, SESSION-HANDOFF, GPT/Copilot session-start primers.
- doc-audit.ps1: added consumer-mode WARN when consumer docs reference kit-internal planning files.

## What Changed in v7.2.23
- Add External Research Escalation rule (Copilot → GPT Web/Deep Research) to prevent guessing when web access is required; propagated to working-agreement-v1.md, copilot-instructions-v7.md, and protocol-v7.md cross-link.

## What Changed in v7.2.22
- Removed remaining HIGH/MED/LOW confidence language from working-agreement-v1.md, protocol-v7.md (Enforcement), and stay-on-track.md; replaced with percentage thresholds (≥95% / ≥99%).
- Removed hard-coded Start-Here-For-AI.md filename links in required-artifacts.md; replaced with consumer-agnostic plain-text references.

## What Changed in v7.2.21
- Session-start chain wired into copilot-instructions-v7.md as mandatory first command.
- Standard Start-Here callout snippet added (templates/start-here-session-start-callout.example.md).
- Cross-link added in protocol-v7.md for consumer Start-Here docs.

## What Changed in v7.2.20
- Primary Priorities (Non-Negotiable) + Response Pattern added to working-agreement-v1.md; governs prompt-only + TDD + cognitive style for all GPT interactions.
- Cross-links added in protocol-v7.md and copilot-instructions-v7.md.

## What Changed in v7.2.19
- Confidence line canonicalized to `Confidence: <percentage>%` across Prompt Review Gate, templates, and overlays; old HIGH/MEDIUM/LOW and (0-100) forms deprecated.

## What Changed in v7.2.18
- Docs: canonical commands now prefer run-vibe universal runner (path-agnostic).

## What Changed in v7.2.17
- run-vibe.ps1 forwards named flags correctly in PS 5.1 (hashtable splatting); previous string-array splatting treated switches as positional args

## What Changed in v7.2.16
- run-vibe.ps1 now declares explicit wrapper parameters for common tool flags (e.g., -WriteReport, -Mode, -StartSession) so PS 5.1 binding succeeds; -ToolArgs kept as escape hatch

## What Changed in v7.2.15
- Added run-vibe.ps1 universal runner; canonical commands no longer hardcode DOCS_ROOT
- Discovery pattern in canonical-commands.md lets Copilot find the runner automatically

## What Changed in v7.2.14
- Added end-session.ps1 repo hygiene command (tracked changes hard-stop, orphan branch report, optional status report); documented in canonical-commands and session-start-checklist

## What Changed in v7.2.13
- sync-forgpt.ps1 derives DOCS_ROOT script-relatively (supports nested docs roots); same `$PSScriptRoot`-based pattern as session-start and doc-audit, with legacy `Find-ProjectRoot`/`Find-DocsRoot` walk as fallback

## What Changed in v7.2.12
- DOCS_ROOT detection is now script-relative (supports nested docs roots without junctions); both session-start.ps1 and doc-audit.ps1 derive DOCS_ROOT from `$PSScriptRoot/../../` when the kit head leaf is `vibe-coding`, with legacy repo-root detection as fallback

## What Changed in v7.2.11
- session-start.ps1: Added `Invoke-GitSafe` helper — runs git with stderr tolerance so progress output does not become a terminating error under `$ErrorActionPreference = "Stop"`
- Replaced bare `git fetch`, `git subtree pull`, and `git remote add` calls with `Invoke-GitSafe`; real failures still throw (checked via `$LASTEXITCODE`)

## What Changed in v7.2.10
- check-protocol-v7-budget.ps1 resolves protocol path relative to kit head (`$PSScriptRoot` parent) instead of repo root; fixes consumer Budget Check

## What Changed in v7.2.9
- verify-protocol-index.ps1 resolves paths relative to kit head (`$PSScriptRoot` parent) instead of repo root; fixes Protocol Index Check when run from consumer subtree

## What Changed in v7.2.8
- session-start.ps1 prints kit version (`KitVersion: vX.Y.Z (Effective YYYY-MM-DD)`) after subtree pull
- session-start.ps1 runs Consumer doc-audit (hard fail) after forGPT sync, with safe `-StartSession` parameter detection
- Added `-SkipAudit` flag to bypass Consumer audit while still printing kit version
- `-WhatIf` now prints `[WhatIf] Would run: Consumer doc-audit …` line (including whether `-StartSession` would be used)
- Updated canonical-commands.md and session-start-checklist.md to document the new steps

## What Changed in v7.2.7
- Added consumer overlay example templates (overlay-index / stack-profile / merge-commands / hot-files / repo-policy)
- Return Packet Gate now references consumer `<DOCS_ROOT>/overlays/hot-files.md` instead of hardcoded project-specific file names; project-specific example return packets replaced with generic naming patterns
- Merge prompt template now references consumer `<DOCS_ROOT>/overlays/merge-commands.md` instead of hardcoded `npm run` commands
- README.md and MIGRATION-INSTRUCTIONS.md updated to surface overlay templates and mapping

## What Changed in v7.2.6
- Clarified return packet policy: GitHub.com Agent may create return packets in `<DOCS_ROOT>/status/` (the only allowed research artifact creation by that agent)
- Fixed Start-Here-For-AI.md location policy: consumer file at `<DOCS_ROOT>/Start-Here-For-AI.md`, not inside kit head
- Updated MIGRATION-INSTRUCTIONS.md: customization via overlays instead of direct edits to copilot-instructions-v7.md
- Clarified confidence scale: Prompt Review Gate HIGH aligns to ≥95%/≥99% Tiered Confidence thresholds

## What Changed in v7.2.5
- **PS 5.1 compatibility fix:** Replaced 3-arg `Join-Path` calls in sync-forgpt.ps1 with nested 2-arg `Join-Path` (PS 5.1 only supports 2 positional args; 3-arg form requires PS 7+ `-AdditionalChildPath`)
- Minimum PowerShell target: 5.1 (ships with Windows by default)

## What Changed in v7.2.4
- Added North Star source-of-truth rule under Focus Control
- Added Goal Anchor Fields block + placement guidance in required-artifacts
- Wired North Star unknown STOP rule into working agreement

## What Changed in v7.2.3
- Added Focus Control to protocol-v7 (Goal Anchor, Drift Triggers, Reset Ritual, Parking Lot rule)
- Wired drift reset enforcement into working-agreement-v1
- Added Goal Anchor to session-start-checklist

## What Changed in v7.2.2
- **Version centralization:** Removed per-file `Bundle: vX.Y.Z` headers from all markdown files. VIBE-CODING.VERSION.md is now the sole version authority. Per-file `File Version:` (date) headers are retained.
- Synced version to v7.2.2 (matching README.md and protocol-lite.md, the highest released version on main)
- Replaced all hardcoded `docs-engineering/` paths with portable `<DOCS_ROOT>/` variable (233 replacements across 23 files)

## What Changed in v7.1.5
- Added `tools/session-start.ps1` wrapper: chains kit subtree update → forGPT sync → 5-line Doc Audit
- Wired canonical-commands.md, protocol-v7.md, protocol-primer.md, session-start-checklist.md to reference the wrapper
- "RUN START OF SESSION DOCS AUDIT" now invokes the wrapper when present

## What Changed in v7.1.4
- Updated Green Gate build command to skip parseTaggerNET3.0 dependencies (`/p:BuildProjectReferences=false`)
- Added file versioning system with session-start handshake for cross-agent sync
- Created docs/forGPT folder for ChatGPT Planner uploads

## What Changed in v7.1.3
- Added redirect banners to all legacy docs/protocol/ files
- Clarified canonical source location (<DOCS_ROOT>/vibe-coding/protocol/)
- Committed outstanding protocol changes from v7.1.2

## What Changed in v7.1.2
- Reporting: narrative directory buckets only; raw evidence outputs are authoritative (handles VSCode linkification constraint).

## What Changed in v7.1.1
- Added portable doc-audit tool + CI workflow (low-noise v1: Control Deck placeholder scan only; NEXT required only on non-docs PRs)

## What Changed in v7.1.0
- Added required-artifacts.md defining mandatory project docs (VISION/EPICS/NEXT)
- Added 3-Party Approval Gate (Stephen + ChatGPT + Copilot) to alignment-mode.md
- Added <DOCS_ROOT>/project/NEXT.md Lightweight Rule (~30 line limit, update triggers, paperwork signal) to NEXT.template.md
- Wired Start-of-Session Doc Audit to read VIBE-CODING.VERSION.md + required-artifacts.md before coding
- Created Control Deck templates (VISION.template.md, EPICS.template.md, NEXT.template.md)

## Version History
- v7.2.6 (2026-02-26): Return packet policy + Start-Here location + migration overlay guidance + confidence clarification
- v7.2.5 (2026-02-26): PS 5.1 compatibility fix for sync-forgpt.ps1 (3-arg Join-Path → nested 2-arg)
- v7.2.4 (2026-02-24): North Star source rule + Goal Anchor Fields
- v7.2.3 (2026-02-24): Focus Control rules + working agreement + session-start checklist
- v7.2.2 (2026-02-09): Version centralization — removed per-file Bundle tags; VIBE-CODING.VERSION.md is sole version authority
- v7.1.5 (2026-02-07): Session-start wrapper (auto kit update + forGPT sync + doc audit)
- v7.1.4 (2026-01-18): Green Gate build fix + file versioning + forGPT folder
- v7.1.3 (2026-01-16): Legacy file redirect banners + canonical source clarification
- v7.1.2 (2026-01-07): Reporting directory buckets (narrative only)
- v7.1.1 (2026-01-05): Portable doc-audit tool + CI workflow
- v7.1.0 (2026-01-04): Required artifacts + 3-Party Approval Gate + <DOCS_ROOT>/project/NEXT.md Lightweight Rule
- v7.0.0 (2026-01-03): Protocol v7 with Vision & User Story Gate, Alignment Mode, Verification Mode

---

Last updated: 2026-02-26
