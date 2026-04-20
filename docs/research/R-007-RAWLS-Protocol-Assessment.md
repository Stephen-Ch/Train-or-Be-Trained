# Protocol Assessment — Post-Consistency Pass (2026-01-05)

**Assessment Date:** 2026-01-05  
**Scope:** Vibe coding protocols after OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS work (commits through a663962)  
**Assessor:** GitHub Copilot (Claude Sonnet 4.5)

---

## STRENGTHS (What's Working Well)

1. **Gate Canonicalization Complete**: 3-Party Approval Gate now has single source of truth in alignment-mode.md with arrow references (→) preventing drift

2. **Placeholder Detection Hardened**: Canonical 10-marker set with copy/paste grep command eliminates escaping ambiguity

3. **Date Validation Specified**: YYYY-MM-DD regex + range validation + optional strict parse clearly defined

4. **NEXT Freshness Rule Added**: Temporal alignment enforcement prevents working on stale stories

5. **Sequencing Clarity Improved**: "Prompt Review Gate → Proof-of-Read → Doc Audit" ordering explicit in multiple docs

6. **Population Gate Well-Defined**: Objective word-count thresholds eliminate "trivially empty" ambiguity

---

## GAPS & GOTCHAS (Remaining Issues)

### 1. Gate Format Drift Between Documents (DoD Item A — INCOMPLETE)

**Severity:** HIGH (breaks DoD verification)

**Issue:** protocol-v7.md says gate has "exactly 3 lines" but copilot-instructions-v7.md says "exactly 4 lines". Both actually require 4 lines (What, Best next step, Confidence, Work state).

**Location:**
- docs/vibe-coding/protocol/protocol-v7.md line 115: "Prompt Review Gate (mandatory, exactly 3 lines...)"
- docs/vibe-coding/protocol/copilot-instructions-v7.md line 6: "Output exactly 4 lines"

**Gotcha:** AI will see conflicting line counts and may output wrong format

**Fix:** Change protocol-v7.md line 115 from "exactly 3 lines" to "exactly 4 lines"

---

### 2. Prompt Review Gate Position Ambiguity

**Severity:** MEDIUM (causes confusion but workarounds exist)

**Issue:** protocol-v7.md says gate appears "Immediately after PROMPT-ID and BEFORE Proof-of-Read" but Response Structure section later says "immediately after the Gate block" for Proof-of-Read, creating circular dependency in phrasing.

**Location:** docs/vibe-coding/protocol/protocol-v7.md lines 5-6 vs lines 108-119

**Gotcha:** "immediately after the Gate block" for Proof-of-Read is correct, but earlier section could be clearer

**Fix:** Reconcile ordering language to always state: "PROMPT-ID → Gate (4 lines) → Proof-of-Read → Work"

---

### 3. Command Lock Enforcement Gap

**Severity:** HIGH (breaks DoD verification)

**Issue:** Both docs say "NO commands/edits before gate" but copilot-instructions-v7.md adds "Command Lock satisfied? YES/NO" as gate line #5, while protocol-v7.md only lists 4 lines

**Location:**
- docs/vibe-coding/protocol/copilot-instructions-v7.md line 6: lists 4 lines then mentions Command Lock
- docs/vibe-coding/protocol/protocol-v7.md lines 5-10: only 4 lines listed

**Gotcha:** Are there 4 lines or 5? Command Lock is mentioned as enforcement mechanism but not as gate output line

**Fix:** Clarify if "Command Lock satisfied?" is gate line #5 or just internal check. Make consistent across docs.

---

### 4. Rerun Trigger Detection Missing Edge Case

**Severity:** LOW (nice-to-have clarity)

**Issue:** `git diff --name-only HEAD~1..HEAD` works for normal commits but fails on initial commit (HEAD~1 doesn't exist) or detached HEAD state

**Location:** docs/Start-Here-For-AI.md line 55

**Gotcha:** New repos or edge cases will hit non-zero exit

**Fix:** Add fallback: `git diff --name-only HEAD~1..HEAD 2>/dev/null || git diff --name-only --cached` or document EXCEPTION for initial commit

---

### 5. Population Gate vs Freshness Rule Overlap

**Severity:** LOW (nice-to-have clarity)

**Issue:** Both rules use `git diff --name-only HEAD~1..HEAD` but check different things (Population: did Control Deck change?, Freshness: was NEXT.md updated?). Not a conflict but could cause confusion.

**Location:**
- docs/Start-Here-For-AI.md line 55 (Rerun Trigger)
- docs/Start-Here-For-AI.md line 93 (Freshness Rule)

**Gotcha:** Same command, different purposes — needs clear mental model

**Fix:** Add explicit note: "This command serves dual purpose: (1) rerun triggers for Doc Audit, (2) freshness check for NEXT.md after completion"

---

### 6. NEXT.md Lightweight Rule Location

**Severity:** LOW (nice-to-have clarity)

**Issue:** NEXT.md mentions "Lightweight Rule" (~30 lines max) but this rule is NOT documented in required-artifacts.md "NEXT.md must include" section

**Location:**
- docs/vibe-coding/protocol/required-artifacts.md line 41 lists NEXT.md requirements but omits line limit
- docs/project/NEXT.md lines 43-49 references it

**Gotcha:** AI won't enforce ~30 line limit because it's not in canonical requirements doc

**Fix:** Add "NEXT.md Length: Keep under ~30 lines (one-screen rule)" to required-artifacts.md

---

### 7. Date Validation Strict Mode Ambiguity

**Severity:** LOW (nice-to-have clarity)

**Issue:** required-artifacts.md says strict date parsing is "OPTIONAL (recommended)" but doesn't specify WHEN to use it

**Location:** docs/vibe-coding/protocol/required-artifacts.md line 150

**Gotcha:** AI doesn't know when optional becomes required

**Fix:** Specify: "Use strict check when Doc Audit FAIL on date format; skip for PASS with valid YYYY-MM-DD regex"

---

### 8. Cross-Cutting Route Coverage Table Enforcement Gap

**Severity:** MEDIUM (causes confusion but workarounds exist)

**Issue:** protocol-v7.md requires route coverage table for "cross-cutting changes" but doesn't define WHEN a change qualifies as cross-cutting beyond examples

**Location:** docs/vibe-coding/protocol/protocol-v7.md lines 176-195

**Gotcha:** "Shared UI components" is vague — is a button component shared? A util function?

**Fix:** Add objective rule: "Cross-cutting = touches 2+ routes OR changes shared file imported by 3+ components OR modifies global CSS/variables"

---

### 9. Proof-of-Read Quote Length Unspecified

**Severity:** LOW (nice-to-have clarity)

**Issue:** Docs say "file + quote + rule" but don't specify minimum quote length or what counts as sufficient

**Location:** Multiple (protocol-v7.md, Start-Here-For-AI.md, copilot-instructions-v7.md)

**Gotcha:** AI might quote single word vs meaningful context

**Fix:** Specify: "Quote: 1-2 complete sentences (10-50 words) showing context for applied rule"

---

### 10. Hot File Protocol Contradiction

**Severity:** MEDIUM (causes confusion but workarounds exist)

**Issue:** protocol-v7.md says hot files require "analysis-first prompt OR full-file replacement" but copilot-instructions-v7.md only mentions "analysis-only first prompt"

**Location:**
- docs/vibe-coding/protocol/protocol-v7.md lines 134-140
- docs/vibe-coding/protocol/copilot-instructions-v7.md lines 38-43

**Gotcha:** copilot-instructions is missing the "full-file replacement" option

**Fix:** Add to copilot-instructions: "OR full-file replacement prompt (replace entire file in one edit + tests/build same prompt)"

---

### 11. Work State EXCEPTION Scope Creep

**Severity:** LOW (nice-to-have clarity)

**Issue:** prompt-lifecycle.md says "MERGE/CLOSEOUT prompts and docs-only protocol work may omit Story ID" but "docs-only protocol work" is vague

**Location:** docs/vibe-coding/protocol/prompt-lifecycle.md line 12

**Gotcha:** What counts as "protocol work"? Assessment prompts? Report generation?

**Fix:** Define: "Protocol work = prompts scoped to docs/vibe-coding/** or docs/protocol/** only, explicitly labeled 'protocol maintenance' in GOAL"

---

### 12. Bundle Warning Resolution Timeline Unclear

**Severity:** LOW (nice-to-have clarity)

**Issue:** protocol-v7.md says bundle warnings "must be resolved or tracked before pre-release" but doesn't define what "pre-release" means

**Location:** docs/vibe-coding/protocol/protocol-v7.md lines 210-214

**Gotcha:** Is every commit "pre-release"? Does this mean before v1.0?

**Fix:** Clarify: "Pre-release = any tagged release candidate (vX.X.X-rc1); demo branches exempt"

---

## PRIORITY FIXES

### HIGH (breaks DoD verification):
1. Gate format drift (3 vs 4 lines)
2. Command Lock line count mismatch

### MEDIUM (causes confusion but workarounds exist):
3. Prompt Review Gate position ambiguity
4. Cross-cutting definition ambiguity
5. Hot file protocol contradiction

### LOW (nice-to-have clarity):
6. Rerun trigger edge case
7. Population Gate vs Freshness Rule overlap
8. NEXT.md lightweight rule location
9. Date validation strict mode ambiguity
10. Proof-of-Read quote length unspecified
11. Work State EXCEPTION scope creep
12. Bundle warning resolution timeline unclear

---

## RECOMMENDED NEXT STORY

**Story ID:** OC-PROTOCOL-V7-GATE-FORMAT-ALIGNMENT

**Goal:** Fix gate format inconsistency (3 vs 4 lines) + command lock enforcement language

**DoD:** protocol-v7.md and copilot-instructions-v7.md both specify identical gate format (4 lines), Command Lock check mechanism clarified (internal check vs output line)

**Scope:** 
- docs/vibe-coding/protocol/protocol-v7.md
- docs/vibe-coding/protocol/copilot-instructions-v7.md
- docs/status/solution-report.md
- docs/status/code-review.md

**Rationale:** This addresses DoD item A from OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS which shows as incomplete in your current NEXT.md Done When checklist.

---

## ASSESSMENT METHODOLOGY

**Files Reviewed:**
- docs/vibe-coding/protocol/protocol-v7.md (256 lines)
- docs/Start-Here-For-AI.md (141 lines)
- docs/vibe-coding/protocol/required-artifacts.md (162 lines)
- docs/vibe-coding/protocol/alignment-mode.md (213 lines)
- docs/vibe-coding/protocol/copilot-instructions-v7.md (155 lines)
- docs/vibe-coding/protocol/prompt-lifecycle.md (150 lines)
- docs/project/NEXT.md (70 lines)

**Review Criteria:**
1. Internal consistency (do docs contradict each other?)
2. Completeness (are rules fully specified or ambiguous?)
3. Enforceability (can AI objectively verify compliance?)
4. Edge case coverage (what breaks in unusual scenarios?)
5. Canonicalization (single source of truth vs duplication?)

**Gaps Prioritization:**
- HIGH = breaks DoD verification or causes AI to fail prompts
- MEDIUM = creates confusion requiring operator clarification
- LOW = nice-to-have improvements for edge cases

---

**Generated:** 2026-01-05  
**Protocol Version:** v7 (post-consistency pass, commit a663962)
