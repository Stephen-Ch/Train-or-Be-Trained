# REPORT: Protocol-v7 Size Reduction — Hard-Rules File Plan

> **Report ID:** KIT-STEP5-PROTOCOLV7-SIZE-REDUCTION-RESEARCH-ONLY-PLAN-001
> **Date:** 2026-03-03
> **Scope:** RESEARCH-ONLY — no edits to protocol-v7.md, no implementation
> **Repo:** Stephen-Ch/vibe-coding-kit
> **Branch:** main @ 6d7bafb
> **Kit Version:** v7.2.32

---

## Identity Proof

    Get-Location                    → C:\Users\schur\workspaces\vibe-coding-kit
    git rev-parse --show-toplevel   → C:/Users/schur/workspaces/vibe-coding-kit
    git remote -v                   → origin https://github.com/Stephen-Ch/vibe-coding-kit.git
    git branch --show-current       → main
    git rev-parse HEAD              → 6d7bafb158d72681501174ca5f6eeb42d411b0d1
    git status                      → nothing to commit, working tree clean

---

## A) Goal

Create a new **<2 KB** "hard-rules-only" file that gives agents the **minimum mandatory gates** in a single read, without fragmenting truth or breaking existing navigation (PROTOCOL-INDEX, doc-audit, session-start, QUICKSTART).

**Problem solved:** protocol-v7.md is 59 KB / 1236 lines / 44 sections. Agents that read it in full burn significant context budget; agents that skim miss critical rules. A small hard-rules file provides a "never skip these" anchor that fits in ~100 lines.

**Non-goal:** This is NOT a replacement for protocol-v7.md. protocol-v7.md remains the authoritative full protocol. The hard-rules file is a curated extraction of the absolute non-negotiables with cross-links back to protocol-v7.md for full definitions.

---

## B) Proposed New File

### Name and path

    protocol/hard-rules.md

**Rationale:** Lives alongside protocol-v7.md, copilot-instructions-v7.md, and PROTOCOL-INDEX.md in the protocol/ directory. The name is clear and descriptive. It follows the existing pattern: protocol-v7.md (full rules), copilot-instructions-v7.md (Copilot-specific), hard-rules.md (mandatory gates only).

### Target size

- **<2 KB** (~80-100 lines)
- Each rule gets 1-3 lines + a cross-link to the full definition in protocol-v7.md

### Proposed table of contents

    # Hard Rules — Mandatory Gates (Quick Reference)

    > Purpose: Absolute minimum rules every agent must follow, every prompt.
    > Authority: protocol-v7.md is the canonical source. This is a curated extraction.

    ## Prompt Execution Sequence (every formal prompt)
    1. PROMPT-ID (first line)
    2. Prompt Review Gate (4 lines: What / Best next step / Confidence / Work state)
    3. Command Lock (no commands before gate)
    4. Proof-of-Read (file + quote + "Applying: <rule>")
    5. Comprehension Self-Check (Q1 what changes / Q2 out of scope / Q3 next command)
    6. Work (execute tasks)
    7. Green Gate (stack-appropriate build + tests)
    8. Summary (what changed, files touched)

    ## STOP Conditions (always halt)
    - Confidence < 95% (docs) or < 99% (runtime) → STOP
    - Best next step? NO → STOP
    - Non-zero exit → STOP, propose smallest fix
    - Evidence contradicts prompt → STOP (Contradiction STOP format)
    - Drift trigger fires → STOP, run Reset Ritual

    ## Confidence Thresholds
    - Docs/research: ≥95%
    - Runtime/code: ≥99%
    - Below threshold: enter RESEARCH-ONLY mode

    ## RESEARCH-ONLY Mode
    - Allowed: read_file, grep_search, list_dir, git log/diff/status, SELECT queries
    - Forbidden: editing runtime code, opening PRs with code changes, builds that modify state
    - Exit: complete Evidence Pack + confidence ≥95%

    ## Report Formatting
    - One continuous markdown document (no fragmented output)
    - ZERO fenced code blocks (use 4-space indentation)
    - Operator must be able to copy entire response with one selection

    ## Cross-References (full definitions)
    - Full protocol → protocol-v7.md
    - Copilot execution → copilot-instructions-v7.md
    - Protocol navigator → PROTOCOL-INDEX.md
    - Quick reference → ../protocol-lite.md

### What stays in protocol-v7.md vs what goes into hard-rules.md

| Category | protocol-v7.md | hard-rules.md |
|----------|---------------|---------------|
| Full gate definitions (Gate, Proof-of-Read, Green Gate) | YES (canonical home, unchanged) | Summary only (1-3 lines + link) |
| STOP conditions | YES (full list, unchanged) | Curated list of the 5 most critical |
| Confidence thresholds | YES (full table + explanation) | Table only (3 lines) |
| RESEARCH-ONLY rules | YES (full allowed/forbidden tables + Prior Research) | Allowed/Forbidden summary (4 lines) |
| Report formatting | YES (full section) | 3-line summary |
| All other sections (Vision Gate, Focus Control, Green Gate details, Resilience, Evidence Pack, PR Hygiene, Hot File, etc.) | YES (unchanged) | NOT included — these are not "every prompt" rules |

**Key principle:** hard-rules.md does NOT define any rule. It summarizes and links. protocol-v7.md remains the single source of truth for all rule text. If hard-rules.md and protocol-v7.md conflict, protocol-v7.md wins — this will be stated at the top of hard-rules.md.

---

## C) Link / Anchor Strategy (Critical)

### 1. hard-rules.md → protocol-v7.md (outbound links)

Every summary item in hard-rules.md will include a relative link to the canonical section in protocol-v7.md using existing anchors:

    → [protocol-v7.md § Core Rules](protocol-v7.md#core-rules-non-negotiable)
    → [protocol-v7.md § Tiered Confidence Gate](protocol-v7.md#no-guessing--tiered-confidence-gate-mandatory)
    → [protocol-v7.md § RESEARCH-ONLY Command Lock](protocol-v7.md#research-only-command-lock-mandatory)
    → [protocol-v7.md § Response Structure](protocol-v7.md#response-structure)
    → [protocol-v7.md § STOP / PIVOT Rule](protocol-v7.md#d-stop--pivot-rule-when-evidence-contradicts-prompt)

All 5 anchors above already exist in protocol-v7.md. No new anchors needed.

### 2. protocol-lite.md → hard-rules.md (new inbound link)

Add one line to protocol-lite.md's "Key Pointers" table:

    | [hard-rules.md](protocol/hard-rules.md) | **Mandatory gates only (<2KB)** |

### 3. QUICKSTART.md → hard-rules.md (new inbound link)

Add one sentence to QUICKSTART.md § First-day workflow or a new "Key files" section:

    For the absolute minimum rules, see [hard-rules.md](<DOCS_ROOT>/vibe-coding/protocol/hard-rules.md).

### 4. protocol-v7.md → hard-rules.md (minimal back-reference)

Add one line near the top of protocol-v7.md (after the file version header):

    > **Quick reference:** For mandatory gates only, see [hard-rules.md](hard-rules.md).

This avoids circular confusion — protocol-v7.md mentions hard-rules.md exactly once as a convenience pointer, and hard-rules.md clearly states protocol-v7.md is authoritative.

### 5. PROTOCOL-INDEX.md (update required)

Add one entry to PROTOCOL-INDEX.md, in a new top-level section or the "Before You Start" section:

    - Hard rules (mandatory gates only) → [hard-rules.md](hard-rules.md)

**Anchor impact:** verify-protocol-index.ps1 validates that links in PROTOCOL-INDEX.md resolve to headings in protocol-v7.md. The hard-rules.md link targets hard-rules.md itself (not a protocol-v7.md anchor), so it would NOT be validated by the current script. Two options:
- **Option A (preferred):** Leave verify-protocol-index.ps1 unchanged. The hard-rules.md entry in PROTOCOL-INDEX.md points to hard-rules.md, not protocol-v7.md, so it's outside the script's scope. Add a comment in PROTOCOL-INDEX.md noting this.
- **Option B:** Extend verify-protocol-index.ps1 to also validate links to hard-rules.md. This adds complexity for one link and is not worth it for v1.

### 6. copilot-instructions-v7.md (no change needed)

copilot-instructions-v7.md already serves as Copilot-specific execution guidance with cross-links to protocol-v7.md. It does not need to reference hard-rules.md because hard-rules.md targets the same audience (agents) at a different granularity.

### 7. doc-audit.ps1 (no change needed)

doc-audit.ps1 checks for required files, overlays, and population gates. It does NOT validate protocol-v7.md content or hard-rules.md existence. No changes required. If we later want to enforce hard-rules.md presence, that would be a separate prompt.

---

## D) "No Functionality Loss" Tests (Concrete Checklist)

### Kit-level tests (run in vibe-coding-kit repo)

    [ ] 1. session-start PASS
         Command: powershell -NoProfile -ExecutionPolicy Bypass -File tools/run-vibe.ps1 -Tool session-start
         Expected: KitVersion printed, no fatal errors

    [ ] 2. doc-audit PASS (Kit mode)
         Command: powershell -NoProfile -ExecutionPolicy Bypass -File tools/doc-audit.ps1
         Expected: "DOC-AUDIT (Kit mode): PASS"

    [ ] 3. verify-protocol-index PASS
         Command: powershell -NoProfile -ExecutionPolicy Bypass -File tools/verify-protocol-index.ps1
         Expected: "PASS -- all NN anchors validated" (count may increase by 0-1)

    [ ] 4. check-protocol-v7-budget PASS
         Command: powershell -NoProfile -ExecutionPolicy Bypass -File tools/check-protocol-v7-budget.ps1
         Expected: "Result: PASS" (protocol-v7.md size unchanged or smaller)

    [ ] 5. hard-rules.md size check
         Command: (Get-Item protocol/hard-rules.md).Length
         Expected: < 2048 bytes

    [ ] 6. No kit-internal-planning-path literals
         Command: Select-String -Path *.md -Recurse -Pattern "kit\-workspace/"
         Expected: zero matches

### Consumer smoke tests (run in a consumer repo after subtree pull)

    [ ] 7. Consumer session-start PASS
         Repo: mortality (or LessonWriter — pick the "most different" consumer)
         Command: powershell -NoProfile -ExecutionPolicy Bypass -File <DOCS_ROOT>/vibe-coding/tools/run-vibe.ps1 -Tool session-start
         Expected: KitVersion printed, no fatal errors

    [ ] 8. Consumer doc-audit PASS (Consumer mode)
         Command: powershell -NoProfile -ExecutionPolicy Bypass -File <DOCS_ROOT>/vibe-coding/tools/run-vibe.ps1 -Tool doc-audit -Mode Consumer -StartSession
         Expected: "DOC-AUDIT (Consumer mode): PASS"

    [ ] 9. Consumer verify-protocol-index PASS
         Command: powershell -NoProfile -ExecutionPolicy Bypass -File <DOCS_ROOT>/vibe-coding/tools/verify-protocol-index.ps1
         Expected: PASS (same as kit)

### Findability test (manual walkthrough)

    [ ] 10. New agent navigation path
          Start: QUICKSTART.md § First-day workflow
          → session-start-checklist.md (linked from QUICKSTART or session-start output)
          → protocol-lite.md § Key Pointers (sees hard-rules.md link)
          → hard-rules.md (reads <2KB, gets all mandatory gates)
          → protocol-v7.md § Core Rules (follows any cross-link for full definition)

          Verify: An agent can reach hard-rules.md within 2 hops from QUICKSTART.md.

---

## E) Rollout Plan (Prompt Sequencing)

### Prompt 1: Implementation (create hard-rules.md + wire links)

    PROMPT-ID: KIT-STEP5-HARDRULES-IMPLEMENT-001

    What: Create protocol/hard-rules.md (<2KB), add cross-links from
    protocol-lite.md, QUICKSTART.md, protocol-v7.md (1 line each),
    add entry to PROTOCOL-INDEX.md. Bump version.

    Scope: Create 1 new file, edit 4 existing files (add 1 link line each).
    No edits to protocol-v7.md rule content.

    Tests: Items 1-6 from checklist above.

### Prompt 2: Fix anchor/link fallout (if any)

    PROMPT-ID: KIT-STEP5-HARDRULES-FIX-FALLOUT-001

    What: Run verify-protocol-index, check-protocol-v7-budget, and
    doc-audit. Fix any WARN/FAIL results. Bump version if changes made.

    Note: This prompt may be unnecessary if Prompt 1 passes all tests.
    If all tests pass in Prompt 1, skip this and go to Prompt 3.

### Prompt 3: Consumer smoke test

    PROMPT-ID: KIT-STEP5-HARDRULES-CONSUMER-SMOKE-001

    What: In mortality repo (or LessonWriter), do a subtree pull of the
    updated kit. Run consumer session-start + doc-audit + verify-protocol-index.
    Run findability test. Report results.

    Scope: Consumer repo only. No kit edits.

    Tests: Items 7-10 from checklist above.

### Prompt 4 (optional): Tighten + cleanup

    PROMPT-ID: KIT-STEP5-HARDRULES-TIGHTEN-001

    What: Based on consumer smoke results, trim hard-rules.md if too large,
    add any missing rules if findability test revealed gaps, update ROADMAP #5
    status to Done.

    Note: Only needed if Prompt 3 reveals issues.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Agents treat hard-rules.md as complete protocol (skip protocol-v7.md) | HIGH — missed rules | Header clearly states "curated extraction, not authoritative" + protocol-v7.md wins on conflict |
| <2KB budget too tight for useful content | MEDIUM — too sparse to help | Draft first, measure, iterate. 80-100 lines at ~20 bytes/line = ~1600-2000 bytes. Feasible. |
| Link rot when protocol-v7.md headings renamed | LOW — already managed | verify-protocol-index.ps1 catches anchor breaks. hard-rules.md uses same anchors. |
| Consumer doc-audit breaks | LOW — doc-audit doesn't check hard-rules.md | No risk — hard-rules.md is additive, not a required file in doc-audit |
| Confusion with protocol-lite.md overlap | MEDIUM — "which quick reference?" | Different purpose: protocol-lite is a summary of ALL rules; hard-rules is ONLY mandatory gates. Add clarification sentence to both files. |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| File in protocol/ not kit root | Convention: all protocol docs live in protocol/. Kit root is for consumer-facing entry points. |
| Summary + link format, not extracted rules | Avoids creating a second source of truth. protocol-v7.md stays canonical. |
| No changes to doc-audit.ps1 | hard-rules.md is optional reading, not a required artifact. Consumer repos work without it. |
| No changes to verify-protocol-index.ps1 | The one hard-rules.md link in PROTOCOL-INDEX is self-referential, not a protocol-v7.md anchor. |
| protocol-lite.md vs hard-rules.md coexistence | protocol-lite covers all rules (summary). hard-rules covers only mandatory gates (subset). Both useful for different agent workflows. |

---

## Prior Research Lookup

    Search: Select-String -Path docs/status/*.md -Pattern "size reduction|hard.rules|budget"
    Results:
    - REPORT-KIT-PROTOCOL-V7-INDEX-RESEARCH-001.md — Related (index design, not size reduction)
    - check-protocol-v7-budget.ps1 — Exists, measures size, currently PASS at 58.1 KB
    No prior research doc specifically addressing protocol-v7.md size reduction found.

---

> This is a RESEARCH-ONLY document. No protocol-v7.md content was edited.
