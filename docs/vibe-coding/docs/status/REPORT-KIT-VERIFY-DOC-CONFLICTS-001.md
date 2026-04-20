# REPORT-KIT-VERIFY-DOC-CONFLICTS-001

> **PROMPT-ID:** KIT-VERIFY-DOC-CONFLICTS-001  
> **Date:** 2026-02-26  
> **Scope:** RESEARCH-ONLY / Verification Mode (READ-ONLY)  
> **Repo:** vibe-coding-kit @ main (commit 75316c8)

---

## Prompt Review Gate

- **What:** Verify (read-only) the documented contradictions in vibe-coding-kit and identify which docs/scripts are the true source of enforcement.
- **Best next step?** YES
- **Confidence:** HIGH
- **Work state:** READY

---

## A) Directory Buckets Summary

| Bucket | Description |
|--------|-------------|
| Protocol core | Canonical rules, gates, working agreement, alignment/verification modes |
| Protocol support | Session checklist, canonical commands, merge template, prompt lifecycle |
| Standards | Research-standard, stack-profile-standard (portable) |
| Portability | Subtree playbook, user story, migration instructions |
| Tools | 6 PowerShell scripts for audit, session-start, sync, verification |
| Templates | Evidence pack, manual test, closeout, overlay example, prompt, return-packet |
| Status reports | Prior audit/research reports |

---

## B) Proof-of-Read

1. **DOCS-HEALTH-CONTRACT.md:** "References OCTOPUS-INVARIANTS.md for overlay placement rules — that document overrides all others." — _Applying: Overlay Placement Authority_

2. **FILE-VERSIONING.md:** "The kit bundle version is tracked only in VIBE-CODING.VERSION.md. Per-file Bundle: tags were removed in v7.2.2 to prevent version drift across files." — _Applying: Version Centralization_

3. **protocol/working-agreement-v1.md:** "GitHub.com agents (Copilot Workspace, GitHub Actions with agent mode) are for code-change tasks only. Research and reporting uses chat mode or local read-only scans." — _Applying: Agent Safety Policy_

---

## C) Raw Evidence Outputs

### Q1 Evidence — Start-Here-For-AI.md placement

**Command:** `git grep -n "Start-Here-For-AI" -- "*.md" "*.ps1"`

| File | Line | Claimed Location |
|------|------|-----------------|
| FILE-VERSIONING.md | 37 | `docs/` |
| MIGRATION-INSTRUCTIONS.md | 36, 152 | `docs/Start-Here-For-AI.md` |
| portability/subtree-playbook.md | 362, 448, 519 | Listed as consumer entry point (no explicit path prefix) |
| protocol/protocol-v7.md | 82, 84, 86 | `../../Start-Here-For-AI.md` (relative from protocol/) |
| protocol/required-artifacts.md | 118, 123, 220 | `../../Start-Here-For-AI.md` and `docs/Start-Here-For-AI.md` |
| DOCS-HEALTH-CONTRACT.md | 50 | Listed as reserved filename (must not exist outside `<DOCS_ROOT>/vibe-coding/`) |
| docs/status/REPORT-KIT-DEDUPE-VERSION-LINKS-AUDIT-001.md | 97, 105, 109 | Flagged as CONSUMER-side link; 8 occurrences total that "don't exist in kit" |

**Key observation:** The `../../` relative path from `protocol/` resolves differently depending on where the kit is mounted:
- **Kit standalone:** `protocol/` → `../../` = parent of repo root (broken)
- **Consumer subtree at `<DOCS_ROOT>/vibe-coding/`:** `protocol/` → `../../` = `<DOCS_ROOT>/` — would need `Start-Here-For-AI.md` at `<DOCS_ROOT>/Start-Here-For-AI.md`
- **FILE-VERSIONING.md** and **MIGRATION-INSTRUCTIONS.md** both say `docs/Start-Here-For-AI.md` — which assumes `<DOCS_ROOT>` = `docs`

**No file named Start-Here-For-AI.md exists in this repo.**

---

### Q2 Evidence — GitHub.com Agent research artifacts

**Command:** `git grep -n "return.packet\|return-packet\|status/" -- protocol/working-agreement-v1.md protocol/return-packet-gate.md`

**working-agreement-v1.md:**
- Line 13: `GitHub.com Agent | Researcher | Executes return-packet prompts; creates <DOCS_ROOT>/status/ research artifacts; no runtime code changes`
- Line 22: `### GitHub.com Coding Agents = Code Changes ONLY`
- Line 40: Anti-pattern: `"Create a <DOCS_ROOT>/status/report.md" for research | Creates file when only analysis needed | "Report findings in chat"`

**return-packet-gate.md:**
- Line 7: "produces dated status documents (return packets) before starting high-risk or uncertain work"
- Line 13: "A return packet is a markdown research artifact stored in `<DOCS_ROOT>/status/`"
- Line 85: `GitHub.com Agent | Researcher | Executes return-packet prompt; creates <DOCS_ROOT>/status/ artifacts`

**The contradiction:**
| Document | Rule | Creates files? |
|----------|------|---------------|
| working-agreement-v1.md § Agent Safety | "Code Changes ONLY" for GitHub.com agents | NO — "Report findings in chat" |
| working-agreement-v1.md § 4-Party Table | "creates `<DOCS_ROOT>/status/` research artifacts" | YES |
| return-packet-gate.md § Flow | "Creates return packet(s) in `<DOCS_ROOT>/status/`" | YES |

The Agent Safety section (L22-40) says agents must NOT create .md files for research, but the 4-Party Table (L13) and the entire Return Packet Gate document say they MUST create .md files in `<DOCS_ROOT>/status/`.

---

### Q3 Evidence — session-start-checklist.md link paths

**Source:** session-start-checklist.md

| Line | Link Target | Relative Path |
|------|-------------|---------------|
| 13 | NEXT.md | `../project/NEXT.md` |
| 16 | tech-debt-and-future-work.md | `../project/tech-debt-and-future-work.md` |
| 37 | NEXT.md | `../project/NEXT.md` |
| 43 | tech-debt-and-future-work.md | `../project/tech-debt-and-future-work.md` |

**Path resolution analysis:**

The checklist lives at `<DOCS_ROOT>/vibe-coding/session-start-checklist.md` in a consumer repo. From there:
- `../project/NEXT.md` resolves to `<DOCS_ROOT>/project/NEXT.md` ✅ **Correct**

This is correct for the subtree layout. The `../` escapes `vibe-coding/` and lands in `<DOCS_ROOT>/`.

---

### Q4 Evidence — MIGRATION-INSTRUCTIONS.md vs overlay pattern

**MIGRATION-INSTRUCTIONS.md:**
- Line 23: Lists `copilot-instructions-v7.md` as "CUSTOMIZE later"
- Line 67: `**B) Update copilot-instructions-v7.md:**`
- Line 69: `Lines 35-79 contain project-specific context. Replace with your project's:`
- Line 284-290: Customization checklist says to edit copilot-instructions-v7.md directly (lines 35-40, 47-55, 69-75)

**copilot-instructions-v7.md header (L5-8):**
```
> **Portable.** This file contains Copilot-specific execution guidance only.
> All canonical rules live in protocol-v7.md.
> Project/stack-specific overrides belong in a consumer-repo overlay
> (see templates/copilot-instructions-overlay.example.md).
```

**The contradiction:** MIGRATION-INSTRUCTIONS.md tells users to directly edit copilot-instructions-v7.md (lines 35-79). But the file itself declares it is **Portable** and says project-specific overrides belong in a **consumer-repo overlay**. Direct edits inside the kit head would violate OCTOPUS-INVARIANTS.md (Invariant: kit head is vendor/read-only).

**Note:** MIGRATION-INSTRUCTIONS.md is versioned at v7.1.0 (2026-01-05) — predates the overlay system and OCTOPUS-INVARIANTS.md, which were added later. This is a stale document.

---

### Q5 Evidence — Confidence scale inconsistency

**Command:** `git grep -n "Confidence:" -- protocol/protocol-v7.md protocol-lite.md protocol-primer.md protocol/working-agreement-v1.md`

| File | Line | Scale Used |
|------|------|------------|
| protocol/protocol-v7.md | 15 | `HIGH/MEDIUM/LOW` (Prompt Review Gate) |
| protocol/protocol-v7.md | 20, 23 | `HIGH`, `MEDIUM` (STOP conditions) |
| protocol/protocol-v7.md | 340-374 | `≥95%`, `≥99%` (Tiered Confidence Gate — numeric) |
| protocol/protocol-v7.md | 563 | `Confidence: <percentage>%` (Evidence Pack format) |
| protocol/protocol-v7.md | 820 | `HIGH/MEDIUM/LOW` (Required Reading Gate) |
| protocol-lite.md | 14-15 | `≥95%`, `≥99%` (Tiered Confidence Rule) |
| protocol-primer.md | 69 | `Confidence: <Copilot answers>` (no specific scale) |
| working-agreement-v1.md | 82 | `≥95%`, `≥99%` (Tiered Confidence) |

**Two distinct scales exist in the same protocol:**

1. **Prompt Review Gate** (protocol-v7.md L15): `HIGH/MEDIUM/LOW` — qualitative, used for the 4-line gate output
2. **Tiered Confidence Gate** (protocol-v7.md L340+): `≥95%/≥99%` — numeric, used for RESEARCH-ONLY mode triggering

These are **two different gates with two different scales** applied at different points in the workflow. The Prompt Review Gate uses categorical confidence to decide YES/NO on proceeding. The Tiered Confidence Gate uses numeric thresholds to decide whether to enter RESEARCH-ONLY mode. They are not contradictory — they serve different purposes — but the naming overlap (`Confidence:` in both) creates confusion. protocol-primer.md punts entirely with `<Copilot answers>`.

---

## D) Enforcement Script Analysis (READ-ONLY)

### tools/doc-audit.ps1

| Check | Enforced? | Lines | Notes |
|-------|-----------|-------|-------|
| Overlays inside kit head | ✅ YES (hard FAIL) | 189-195 | Checks `<DOCS_ROOT>/vibe-coding/overlays/` existence |
| Overlay index existence | ✅ YES (warning, consumer only) | 198-206 | Checks `<DOCS_ROOT>/overlays/OVERLAY-INDEX.md` |
| Reserved filenames outside kit | ❌ NOT ENFORCED | — | DOCS-HEALTH-CONTRACT.md L50 lists Start-Here-For-AI.md as reserved, but doc-audit.ps1 does not check for it |
| Start-Here-For-AI placement | ❌ NOT ENFORCED | — | No check for existence or correct placement |
| Hardcoded GitHub user | ⚠️ PRESENT | 47-48 | `Stephen-Ch/vibe-coding-kit` in auto-detect logic |

### tools/session-start.ps1

| Feature | Status | Lines |
|---------|--------|-------|
| `-WhatIf` support | ✅ YES | 11, 18, 107-118, 155-156 |
| `-WhatIf` is no-op | ✅ YES | All modifying operations (remote add, fetch, subtree pull, sync-forgpt) are skipped with `[WhatIf] Would run:` messages |

---

## E) Answers Table

| # | Question | Verdict | Evidence | Implication |
|---|----------|---------|----------|-------------|
| Q1 | Where should Start-Here-For-AI.md live? | **CONSUMER-SIDE ONLY at `<DOCS_ROOT>/Start-Here-For-AI.md`** | FILE-VERSIONING.md:37 says `docs/`. protocol-v7.md:82-86 uses `../../` from protocol/ which resolves to `<DOCS_ROOT>/` in subtree layout. It does not exist in the kit repo and should not. | FILE-VERSIONING.md:37 should say `<DOCS_ROOT>/` not `docs/` (or note it's consumer-only). The 8 `../../Start-Here-For-AI.md` links in protocol-v7.md and required-artifacts.md are correct for subtree consumers but broken in standalone kit. Consider adding a note or making links conditional. |
| Q2 | Can GitHub.com agents create research .md files? | **YES, for return packets only** — Agent Safety Policy section is overly broad | working-agreement-v1.md:13 (creates artifacts) vs L22 ("Code Changes ONLY") vs L40 (anti-pattern: "don't create .md") | working-agreement-v1.md § Agent Safety needs a carve-out: "Return packet .md files in `<DOCS_ROOT>/status/` are the ONE exception — these are code-change artifacts produced by agent prompts, not ad-hoc research reports." The anti-pattern table should clarify it targets arbitrary reports, not structured return packets. |
| Q3 | Are session-start-checklist.md links correct? | **YES — `../project/NEXT.md` is correct** for subtree at `<DOCS_ROOT>/vibe-coding/` | session-start-checklist.md:13,16,37,43 all use `../project/` which resolves to `<DOCS_ROOT>/project/` | No change needed. Links are correct for the intended consumer layout. They will 404 in standalone kit, which is expected and documented. |
| Q4 | Does MIGRATION-INSTRUCTIONS.md tell users to edit copilot-instructions-v7.md directly? | **YES — contradicts overlay pattern** | MIGRATION-INSTRUCTIONS.md:67-290 says edit L35-79 directly. copilot-instructions-v7.md:5-8 says use overlays. OCTOPUS-INVARIANTS.md says kit head is read-only. | MIGRATION-INSTRUCTIONS.md is stale (v7.1.0, pre-overlay). Phase 3 should be rewritten to say: "Create a consumer overlay at `<DOCS_ROOT>/overlays/copilot-instructions-overlay.md` using the template at `templates/copilot-instructions-overlay.example.md`. Do NOT edit files inside `<DOCS_ROOT>/vibe-coding/`." |
| Q5 | What is the confidence scale? | **Two scales, two gates, poorly disambiguated** | protocol-v7.md:15 (HIGH/MED/LOW for Prompt Review Gate) vs L340+ (95%/99% for Tiered Confidence Gate) | Rename the Prompt Review Gate field to `Feasibility:` or `Gate Confidence:` to distinguish from the numeric Tiered Confidence thresholds. Or add a parenthetical: `Confidence: HIGH/MEDIUM/LOW (gate feasibility — distinct from the ≥95%/≥99% Tiered Confidence Gate)`. |

---

## F) Recommended Fix List (NO EDITS — documentation only)

1. **working-agreement-v1.md** — Add return-packet exception to Agent Safety Policy. The "Code Changes ONLY" heading should say "Code Changes ONLY (+ return packets)" or add a subsection carving out `<DOCS_ROOT>/status/` return packets as the permitted exception.

2. **MIGRATION-INSTRUCTIONS.md** — Rewrite Phase 3B to reference the overlay pattern instead of direct edits to copilot-instructions-v7.md. Bump version from v7.1.0. Add note that OCTOPUS-INVARIANTS.md prohibits editing kit-head files.

3. **FILE-VERSIONING.md:37** — Change `Start-Here-For-AI.md | docs/` to `Start-Here-For-AI.md | <DOCS_ROOT>/ (consumer-only; not in kit repo)` to match the actual intended location.

4. **protocol-v7.md** — Disambiguate the two confidence scales. Either rename the Prompt Review Gate field to avoid confusion with Tiered Confidence, or add an explicit cross-reference note at L15 explaining the distinction.

5. **doc-audit.ps1:47** — Replace hardcoded `Stephen-Ch/vibe-coding-kit` with a more portable signal (e.g., check for `vibe-coding-kit` in the repo name portion of the remote URL, or use a marker file).

6. **DOCS-HEALTH-CONTRACT.md:50** — Reserved Filenames check (including Start-Here-For-AI.md must not exist outside kit) is documented but **not enforced** in doc-audit.ps1. Either add enforcement or demote to advisory.

---

## STOP Conditions Check

- ✅ No commands executed that could modify repo state
- ✅ All evidence gathered via `git grep` (read-only) and `read_file`
- ✅ No contradictions with prompt assumptions found that would require STOP

---

**Search method used:** git grep  
**Recovery applied:** none  
**Flake suspect?** NO  
**Help trigger used:** NO
