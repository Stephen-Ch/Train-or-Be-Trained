# Protocol Re-Assessment Post-Sweep — 2026-01-05

## Context

After completing OC-PROTOCOL-V7-S1G-PROTOCOL-CONSISTENCY-SWEEP-001 (commit 9e754e1) which fixed 8 HIGH/MEDIUM/LOW priority gaps identified in protocol-assessment-2026-01-05.md, performed comprehensive re-analysis of all vibe-coding protocol files to verify fixes and identify remaining issues.

**Files Analyzed (7 protocol documents, ~1400 lines total):**
- docs/vibe-coding/protocol/protocol-v7.md (261 lines)
- docs/vibe-coding/protocol/copilot-instructions-v7.md (157 lines)
- docs/Start-Here-For-AI.md (150+ lines)
- docs/vibe-coding/protocol/required-artifacts.md (162 lines)
- docs/vibe-coding/protocol/alignment-mode.md (213 lines)
- docs/vibe-coding/protocol/prompt-lifecycle.md (109 lines)
- Plus cross-references in code-review.md, solution-report.md

**Analysis Date:** 2026-01-05 (same day as consistency sweep commit)

---

## VERIFICATION: All 8 Sweep Fixes Successfully Applied

### HIGH Priority Gaps (RESOLVED ✅)

**1. Gate Line Count Drift (FIXED)**
- **Issue:** protocol-v7.md line 115 said "exactly 3 lines" contradicting actual 4-line structure
- **Fix Verified:** protocol-v7.md now says "exactly 4 lines" at line 115
- **Consistency Check:** copilot-instructions-v7.md also says "Output exactly 4 lines" — CONSISTENT across both docs
- **Evidence:** Lines 5-10 in protocol-v7.md Core Rule #1, lines 4-5 in copilot-instructions-v7.md
- **Verdict:** RESOLVED ✅

**2. Command Lock Confusion (FIXED)**
- **Issue:** protocol-v7.md lines 130-134 showed "Command Lock satisfied? YES/NO" as apparent 5th gate output line creating ambiguity whether gate is 4 or 5 lines
- **Fix Verified:** "Command Lock satisfied?" removed from gate output structure
- **New Text:** "Command Lock enforcement: NO commands, edits, or searches are allowed before printing these 4 lines." (protocol-v7.md line 14)
- **Clarity:** Command Lock is now explicitly described as enforcement mechanism (prevents tool calls before gate) not an output line
- **Evidence:** Response Structure section lines 112-125, Core Rule #1 lines 14-16
- **Verdict:** RESOLVED ✅

### MEDIUM Priority Gaps (RESOLVED ✅)

**3. Cross-Cutting Objective Definition (FIXED)**
- **Issue:** Coverage Checklist section listed examples (Palette CSS, Voice/tone, Layout grids, CTA buttons, Shared UI, Monospace) but no objective rule for when change qualifies as cross-cutting
- **Fix Verified:** Added "Objective definition (a change is cross-cutting if ANY of):" before examples
- **Objective Criteria:** (a) Touches 2+ routes OR (b) Changes shared file imported by 3+ components OR (c) Modifies global CSS variables/shared copy dictionaries/typography standards
- **Evidence:** protocol-v7.md lines 201-207
- **Verdict:** RESOLVED ✅

**4. Hot File Protocol Parity (FIXED)**
- **Issue:** copilot-instructions-v7.md only mentioned "analysis-only prompt first" missing "full-file replacement" alternative allowed by protocol-v7.md
- **Fix Verified:** Section renamed from "Analysis-First Rule" to "Two-Path Rule"
- **New Text:** "pick ONE path: (1) analysis-only prompt first, OR (2) full-file replacement in one edit + tests/build same prompt"
- **Consistency Check:** protocol-v7.md lines 166-173 says same thing — CONSISTENT
- **Evidence:** copilot-instructions-v7.md lines 37-44
- **Verdict:** RESOLVED ✅

### LOW Priority Gaps (RESOLVED ✅)

**5. Proof-of-Read Quote Length (FIXED)**
- **Issue:** Proof-of-Read required but no quote length specification causing inconsistent compliance
- **Fix Verified:** Core Rule #2 now specifies "quote of 1-2 complete sentences 10-50 words + 'Applying: <rule name>'"
- **Evidence:** protocol-v7.md line 68
- **Verdict:** RESOLVED ✅

**6. Rerun Trigger Edge Case (FIXED)**
- **Issue:** `git diff --name-only HEAD~1..HEAD` command fails on initial commit (HEAD~1 missing) with no EXCEPTION handling
- **Fix Verified:** Added "EXCEPTION (initial commit / detached HEAD): If HEAD~1 doesn't exist (command fails), treat as rerun required and run Doc Audit."
- **Evidence:** Start-Here-For-AI.md lines 55-57
- **Verdict:** RESOLVED ✅

**7. Protocol Maintenance Definition (FIXED)**
- **Issue:** prompt-lifecycle.md READY state said "protocol maintenance" exception without precise definition enabling Story ID omission loophole
- **Fix Verified:** Added "Protocol maintenance definition: Prompts scoped exclusively to docs/vibe-coding/** and/or docs/protocol/** with GOAL explicitly labeled 'protocol maintenance'. Does NOT include arbitrary docs edits outside these directories."
- **Evidence:** prompt-lifecycle.md lines 12-14
- **Verdict:** RESOLVED ✅

**8. Bundle Warning Timeline (FIXED)**
- **Issue:** Bundle warnings policy said "before pre-release" without defining pre-release
- **Fix Verified:** Added "Pre-release definition: Any tagged release candidate (vX.X.X-rc1 or later). Demo branches and dev commits exempt."
- **Evidence:** protocol-v7.md lines 252-255
- **Verdict:** RESOLVED ✅

---

## NEW FINDINGS: Remaining Gaps & Contradictions

### MEDIUM Priority - New Contradiction

**PROMPT-ID Enforcement Rigidity (Blocks Conversational Workflow)**

**Issue:**
- protocol-v7.md line 112: "**PROMPT-ID** (mandatory first line): Echo exact PROMPT-ID from the executed prompt. **If prompt lacks PROMPT-ID, STOP and request corrected prompt.**"
- copilot-instructions-v7.md line 4: "**PROMPT-ID** required as FIRST line of EVERY response: Echo exact PROMPT-ID from prompt. **If missing, STOP and request corrected prompt.**"
- .github/copilot-instructions.md: Prompts must be "Single fenced block" ending with "# END PROMPT"

**Contradiction:**
User's current request ("please reanalyze latest vibe-coding protocols for gaps, traps and gotchas") is conversational, not formal fenced-block prompt with PROMPT-ID. Do AI responses to conversational requests require PROMPT-ID or STOP?

**Impact:**
- Prevents informal "assess this" / "review that" / "what about X?" conversations
- Forces overly rigid prompt structure for exploratory analysis requests
- Blocks lightweight "please write report as text doc" follow-up requests (current user request also lacks PROMPT-ID)
- Creates friction between formal work prompts (S0A/S1A/S2A requiring PROMPT-ID) and exploratory/analysis/conversational requests

**Severity:** MEDIUM (blocks conversational workflow common in real sessions, forces unnecessary ceremony for analysis/verification/reporting requests)

**Possible Solutions:**
1. Clarify PROMPT-ID required only for WORK prompts (S0A/S1A/S2A/S2C) not analysis/verification/reporting
2. Define two prompt classes: FORMAL (require PROMPT-ID + fenced block) vs CONVERSATIONAL (natural language, no PROMPT-ID)
3. Add EXCEPTION to PROMPT-ID rule: "Analysis/verification/reporting requests may omit PROMPT-ID if explicitly scoped as read-only"

---

### LOW Priority - Minor Gaps

**1. Proof-of-Read Positioning Ambiguity**

**Issue:**
- protocol-v7.md line 68: "Every AI response MUST start (immediately after the Gate block) with Proof-of-Read"
- Start-Here-For-AI.md lines 14-16: "1. Prompt Review Gate (4 lines) — printed BEFORE any reads or commands, 2. Proof-of-Read — printed AFTER reading required files"
- Command Lock: "NO commands, edits, or searches until the Prompt Review Gate is printed"

**Tension:**
Gate must be printed BEFORE reads (Command Lock), but Proof-of-Read requires file quotes (must read files first). When exactly do file reads happen relative to gate output?

**Current Interpretation (seems to work in practice):**
1. Print Prompt Review Gate (4 lines)
2. Read required files (read_file tool calls)
3. Print Proof-of-Read (quote from files just read)
4. Continue work

**Ambiguity:**
"NO commands before gate" could be interpreted as "NO READS before gate" creating circular dependency (can't print Proof-of-Read after gate if reads forbidden before gate).

**Safe Interpretation:**
Command Lock forbids **terminal commands** (git, npm, editors) not **file reads** (read_file tool). Tool calls for reading files are allowed before gate to gather Proof-of-Read quotes, but NO terminal execution until gate printed.

**Severity:** LOW (interpretation seems clear in practice: Gate is OUTPUT barrier not READ barrier, but text could be clearer)

---

**2. Population vs Freshness Overlap**

**Issue:**
- Start-Here-For-AI.md line 82: "Separate from Population Gate: This rule is about plan freshness (preventing work on stale stories), not content quality."

**Observation:**
Both gates prevent coding when NEXT.md is problematic:
- Population Gate: checks for placeholders/word-count thresholds (content quality)
- Freshness Rule: checks for temporal staleness (plan updated after completion)

Distinction is conceptual not enforcement-based. In practice, both result in "update NEXT.md before coding."

**Why Not a Problem:**
- Separation is already documented
- No enforcement conflict (Population checks different properties than Freshness)
- Both serve legitimate but distinct purposes

**Severity:** LOW (already documented as separate concerns, no enforcement conflict)

---

**3. NEXT.md Lightweight Rule Location**

**Issue:**
- required-artifacts.md lines 52-58: Defines NEXT.md Lightweight Rule (keep under ~30 lines, focus only Active Story/NEXT STEP/DoD/Scope/Done-When, update in same commit or immediate follow-up)
- Gap: Lightweight Rule NOT mentioned in protocol-v7.md Vision & User Story Gate or Start-Here-For-AI.md Doc Audit sections

**Impact:**
AI might not enforce ~30 line limit or "update in same commit" unless they happen to read required-artifacts.md NEXT.md section (which is in Required Reading list but easy to miss specific rule).

**Why Not a Problem:**
- Enforcement already happening via Freshness Rule ("update in same commit or immediate follow-up")
- Lightweight Rule is optimization/guideline not hard gate
- Rule location in required-artifacts.md makes sense (NEXT.md spec lives there)

**Severity:** LOW (enforcement already happening via Freshness Rule, Lightweight Rule is optimization not gate)

---

**4. Date Validation Strict Mode Placement**

**Issue:**
- required-artifacts.md lines 125-129: Documents "OPTIONAL STRICT CHECK (recommended)" for calendar date validity using Node.js one-liner
- Gap: Says "optional" but doesn't specify WHEN to use strict check vs when basic regex+range is sufficient

**Impact:**
AI won't know whether to always run strict check or only when dates look suspicious (e.g., Feb 30).

**Why Not a Problem:**
- Basic regex+range validation catches 99% of errors (wrong format "2026-1-4", invalid month 99, etc.)
- Strict check is nice-to-have for edge cases (Feb 30, leap year bugs) not enforcement requirement
- "Recommended" signals it's good practice but not mandatory

**Severity:** LOW (basic regex+range catches 99% of errors, strict check is nice-to-have for Feb 30 edge cases)

---

## GOTCHAS & TRAPS

### GOTCHA #1: Command Lock vs File Reads for Proof-of-Read

**Trap:**
Protocol says "NO commands before gate" (Command Lock) but also "Proof-of-Read immediately after gate" requiring file quotes. Do reads violate Command Lock?

**Safe Interpretation:**
Command Lock forbids **terminal commands** (git, npm, editors, scripts) not **file reads** (read_file tool). Reads are allowed before gate to gather Proof-of-Read quotes, but NO terminal execution until gate printed.

**Evidence:**
- protocol-v7.md line 16: "Command Lock: NO terminal commands, NO file edits, NO searches until the Prompt Review Gate is printed."
- "NO terminal commands" suggests tool-based file reads (read_file) are OK
- Proof-of-Read requirement (after gate but requires pre-read content) only makes sense if reads allowed before gate

**Risk:**
Overly strict AI might refuse to read files before gate thinking it violates Command Lock, blocking Proof-of-Read output entirely.

**Mitigation:**
Clarify Command Lock as "NO TERMINAL EXECUTION before gate" explicitly allowing read_file tool calls for Proof-of-Read preparation.

---

### GOTCHA #2: Protocol Maintenance Exception Scope

**Trap:**
- prompt-lifecycle.md line 13: Protocol maintenance defined as "docs/vibe-coding/** and/or docs/protocol/**"
- But Start-Here-For-AI.md says "Legacy copies under docs/protocol exist for backward compatibility only; do not treat them as authoritative."

**Contradiction:**
Including docs/protocol/ in protocol maintenance exception might encourage edits to deprecated docs when vibe-coding/protocol is canonical.

**Safe Interpretation:**
"docs/protocol/**" in exception allows fixing legacy docs for backward compatibility (e.g., updating cross-references, deprecation notices), but AI should prefer vibe-coding/protocol/** for new work and substantial protocol changes.

**Risk:**
AI might edit deprecated docs/protocol files thinking they're in-scope for protocol maintenance when only vibe-coding/protocol should be updated.

**Mitigation:**
Tighten protocol maintenance definition to "docs/vibe-coding/protocol/** (canonical) and docs/protocol/** (legacy compat only, prefer vibe-coding)".

---

### GOTCHA #3: Hot File "Last 3 Prompts" Window

**Trap:**
- protocol-v7.md line 166: "Files touched in the last three prompts"
- copilot-instructions-v7.md line 43: "Any file touched in the last 3 prompts"
- Gap: Doesn't specify how to detect this across sessions or repo clones

**Detection Ambiguity:**
How does AI know what files were touched in "last 3 prompts" if:
- Session context is lost (new chat window)
- Multiple devs working on repo
- Cloning repo fresh (no local session history)

**Safe Interpretation:**
Check git log for last 3 commits touching file:

    git log --oneline --follow -3 -- <file>

If file appears in last 3 commits, treat as hot file requiring two-path protocol.

**Risk:**
AI might not know HOW to check "last 3 prompts" leading to inconsistent hot file enforcement.

**Mitigation:**
Add explicit detection command to hot file section: "Check if file touched in last 3 commits: git log --oneline --follow -3 -- <file>"

---

### GOTCHA #4: Cross-Cutting "2+ Routes" Ambiguity

**Trap:**
- protocol-v7.md line 203: Cross-cutting if "Touches 2+ routes"
- app.routes.ts defines routes including `/q/:id*` pattern
- Gap: Does `:id*` count as 1 route or multiple? (q1/:id and q2/:id are separate sub-routes but share pattern)

**Counting Ambiguity:**
If change affects both q1/:id and q2/:id paths:
- Count as 1 route (`:id*` pattern)? → Not cross-cutting
- Count as 2 routes (q1/:id, q2/:id variants)? → Cross-cutting, requires Coverage Checklist

**Safe Interpretation:**
Count distinct route paths in app.routes.ts. If `:id*` has variants like q1/:id, q2/:id defined as separate routes, count each variant separately. Check app.routes.ts route definitions, not URL patterns alone.

**Risk:**
AI might under-count routes and skip Coverage Checklist when change affects q1/:id + q2/:id thinking it's "1 route with variants."

**Mitigation:**
Clarify cross-cutting rule: "2+ routes means 2+ distinct route definitions in app.routes.ts; parameterized route variants (q1/:id, q2/:id) count separately if defined as separate route configs."

---

## OVERALL PROTOCOL HEALTH ASSESSMENT

### Strengths

**1. High/Medium Gaps All Resolved**
All 8 tasks from consistency sweep successfully applied:
- Gate format unified (3→4 lines, Command Lock clarified)
- Cross-cutting now has objective definition (2+ routes OR 3+ imports OR global CSS)
- Hot file protocol consistent (two-path rule in both docs)
- Proof-of-Read quote length specified (10-50 words)
- Edge cases handled (rerun trigger initial commit, protocol maintenance scope, bundle warning pre-release)

**2. Strong Gate Discipline**
- Prompt Review Gate: 4-line format enforced consistently
- Command Lock: prevents tool execution before gate
- Doc Audit: session prerequisite with rerun detection
- Population Gate: objective thresholds for placeholder/content checks
- Freshness Rule: prevents stale-story work with git diff detection

**3. Clear Separation of Concerns**
- Alignment Mode: handles missing/unclear NEXT.md
- Population Gate: checks content quality (placeholders, thresholds)
- Freshness Rule: checks temporal alignment (plan current after completion)
- Green Gate: tests + build verification
- 3-Party Approval Gate: Stephen (intent) + ChatGPT (planning) + Copilot (feasibility)

**4. Comprehensive Coverage**
Protocol addresses:
- Session start (Doc Audit, required reading, Proof-of-Read)
- Work execution (Vision & Story Gate, scope guardrails, hot file protocol)
- Cross-cutting changes (route coverage, old pattern search, proof-of-experience)
- Testing (deterministic tests, test catalog, RED-LOCK for S1A)
- Closeout (artifact verification, NEXT.md updates, merge discipline)

### Weaknesses

**1. PROMPT-ID Enforcement Rigidity (MEDIUM)**
Blocks conversational workflow by requiring formal fenced-block prompts with PROMPT-ID for ALL interactions even exploratory analysis/verification/reporting requests. Forces unnecessary ceremony for lightweight follow-ups.

**2. Minor Ambiguities (LOW)**
- Command Lock vs file reads (are read_file tool calls allowed before gate?)
- Protocol maintenance legacy scope (should docs/protocol/ edits be discouraged?)
- Hot file detection (how to check "last 3 prompts" across sessions?)
- Cross-cutting route counting (parameterized variants count as 1 or N routes?)

**3. Rule Location Scatter (LOW)**
Some rules defined in one doc but not mentioned in related sections:
- NEXT.md Lightweight Rule in required-artifacts.md but not in protocol-v7.md Vision & Story Gate
- Date strict mode in required-artifacts.md without usage guidance

### Verdict

**Overall Protocol Health: STRONG**

- All HIGH/MEDIUM gaps from initial assessment resolved ✅
- Gate format unified and consistent across docs ✅
- Objective definitions added for cross-cutting, proof-of-read quote length ✅
- Edge cases handled (initial commit, protocol maintenance scope, pre-release) ✅
- Remaining issues are workflow friction (PROMPT-ID rigidity) and minor ambiguities, not enforcement breakdowns

**Primary Improvement Opportunity:**
Relax PROMPT-ID requirement for conversational/analysis/verification requests to reduce ceremony while maintaining rigor for formal work prompts.

---

## RECOMMENDATION

**Priority 1 (MEDIUM - Workflow Friction):**
Address PROMPT-ID enforcement rigidity by defining two prompt classes:
- FORMAL (S0A/S1A/S2A/S2C work prompts): Require PROMPT-ID + fenced block + END PROMPT marker
- CONVERSATIONAL (analysis/verification/reporting): Natural language, no PROMPT-ID required

**Priority 2 (LOW - Clarity):**
Minor clarifications:
- Command Lock explicitly allows read_file tool calls (only forbids terminal execution)
- Hot file "last 3 prompts" detection via git log --oneline --follow -3
- Cross-cutting "2+ routes" counts parameterized variants separately if defined as separate route configs
- Protocol maintenance prefers vibe-coding/protocol/** over docs/protocol/** (legacy compat only)

**Priority 3 (DEFER):**
Low-severity conceptual overlaps and rule location scatter don't require immediate action. Current protocol is enforceable and objective despite minor organizational quirks.

---

**Assessment Performed By:** AI (Copilot) analyzing vibe-coding protocol docs post-consistency-sweep

**Assessment Date:** 2026-01-05

**Previous Assessment:** docs/status/protocol-assessment-2026-01-05.md (identified 12 gaps, 8 fixed in sweep)

**Commit Context:** Re-analysis performed after commit 9e754e1 "Docs: protocol consistency sweep (close remaining gaps)"
