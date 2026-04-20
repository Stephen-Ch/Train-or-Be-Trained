# Protocol v7 — Vibe-Coding Protocol

> **File Version:** 2026-03-02
> **Quick reference:** For mandatory gates only, see [hard-rules.md](hard-rules.md).

**v7.2.1 Changes:**
- Stack-aware gates now read from `stack-profile.md` (no interpretation)
- Added `standards/` folder with research-standard.md and stack-profile-standard.md
- Added `portability/` folder with subtree-playbook.md

## Core Rules (Non-Negotiable)

1. **Prompt Review Gate + Command Lock (MANDATORY FIRST OUTPUT)**: Immediately after PROMPT-ID and BEFORE Proof-of-Read, the AI must output exactly 4 lines:
   - "What:" (1-line summary of what you will do)
   - "Best next step?" YES/NO
   - "Confidence: <percentage>%"
   - "Work state:" READY|IN-PROGRESS|COMPLETE|MERGED|OBSOLETE

   **Confidence scale note:** The percentage uses the same scale as the Tiered Confidence Gate and Evidence Pack (≥95% for docs/research, ≥99% for runtime code — see [Tiered Confidence Gate](#no-guessing--tiered-confidence-gate-mandatory)). If you cannot meet the applicable threshold, STOP and explain.

   **Prompt Review Gate (ROLE CLARITY):** The Prompt Review Gate is performed by **Copilot** (the executor) on the prompt text **before** running any commands. ChatGPT may draft prompts, but Copilot must first output the gate decision (YES/NO, confidence, PROCEED/STOP). If STOP, Copilot must ask the minimum questions or request edits and must not execute anything.

   **STOP conditions:** 
   - If "Best next step? NO" OR Confidence is below the applicable threshold (< 95% docs, < 99% runtime), STOP immediately and explain why.
   - If "Work state:" != READY, STOP immediately (EXCEPTION: merge/closeout prompts require state = COMPLETE).
   - If prompt is unclear, request clarification from operator.
   - If the prompt adds stricter sequencing/format/tool constraints beyond this protocol (e.g., “Proof-of-Read immediately after Gate”, “Stop immediately on any error”, “no fenced code blocks”, “no rg”), and you are not prepared to follow them exactly with the available tools, you MUST set "Best next step? NO" (or lower your Confidence below threshold) and STOP with the smallest prompt correction needed.
   
   **Command Lock:** NO terminal commands, NO file edits, NO searches until the Prompt Review Gate is printed. If you realize you already ran a command before printing the gate, STOP immediately and report exactly what you ran. The Prompt Review Gate must appear before the first command (including git, npm, editors, search, generators, etc.) in EVERY report without exception. Before any git/grep commands, anchor to repo root using: Set-Location (git rev-parse --show-toplevel); git rev-parse --show-toplevel; Get-Location. Never run git pathspec checks from a subfolder.
   
   **Sequencing (Two-tier Command Lock):** Lock A (hard) forbids terminal execution/edits/searches/network/file writes before the 4-line Gate output. After the Gate, repo sanity commands (e.g., `git status`, `git log`) are allowed before Proof-of-Read; Proof-of-Read must appear before any searches or edits.

   **Gate Approval Checklist (required before answering YES):**
   - Read the entire prompt (all sections) and identify any additional constraints (ordering, formatting, stop-on-error behavior, forbidden tools, etc.).
   - Verify feasibility with available tools (e.g., if `rg` isn’t available, plan to use `git grep` or `Select-String` if allowed by the prompt).
   - Verify you can follow the prompt’s exact ordering (e.g., Proof-of-Read immediately after Gate) without mixing in commands or extra output.
   - If any required constraint cannot be met reliably, do NOT approve the prompt.

   **Preflight (MANDATORY in formal prompts):** Every FORMAL WORK PROMPT must include a short Preflight checklist stating:
   - Expected search tool + approved fallbacks (`rg` → `git grep` → PowerShell `Select-String`)
   - Clean tree expectation (required vs allowed dirty)
   - Sequencing allowance: repo sanity allowed after Gate (Lock B)
   - Command batching: allowed by default; if strict ordering is required, batching is disallowed
   - Required output targets (files to write, if any)

   **Anti-batching for strict sequencing:** If a prompt requires a strict order across multiple commands, run commands one-at-a-time (no batching). Batching is fine for repo sanity unless a prompt explicitly forbids it.

   **Prompt overrides protocol:** Prompts may impose stricter sequencing than this protocol, but must state it explicitly in a single line:
   - STRICT SEQUENCE: Proof-of-Read must occur before ANY commands.
   
   **Work State Definitions:** See [prompt-lifecycle.md](prompt-lifecycle.md) for state definitions and STOP rules.

## Prompt Classes (Request Types)

Two request types are recognized:

**FORMAL WORK PROMPT** (required for execution):
- Required for: ANY terminal commands, file edits, tests/builds, commits, merges
- Format: Single fenced code block with PROMPT-ID + GOAL + SCOPE + TASKS + END PROMPT marker
- Enforcement: MUST include Story ID + NEXT STEP citation from <DOCS_ROOT>/project/NEXT.md (exception: protocol maintenance)
- All gates apply: Prompt Review Gate, Command Lock, Proof-of-Read, Green Gate

**CONVERSATIONAL REQUEST** (discussion/analysis only):
- Allowed for: Discussion, planning, analysis, critique, recommendations, verification audits
- Format: Natural language (no PROMPT-ID required)
- Restrictions: MUST NOT run terminal commands, edit files, or claim Green Gate results. Read-only tools (read_file, grep_search, list_dir, git log/status/diff) allowed.
- If conversational request asks for work execution: respond by drafting a FORMAL WORK PROMPT (with Story ID + NEXT citation) rather than STOP.

## Vision & User Story Gate (MANDATORY for work prompts)

**Canonical Active Plan:** `<DOCS_ROOT>/project/NEXT.md` is the single source of truth for ACTIVE STORY + NEXT STEP.

Every work prompt MUST include:
1. **Story ID** (from <DOCS_ROOT>/project/NEXT.md)
2. **Next step sentence** (verbatim or near-verbatim from <DOCS_ROOT>/project/NEXT.md)
3. **DoD snippet** (1 sentence Definition of Done)
4. **Copy Source Decision** (TS vs JSON vs content schema vs admin pipeline) when touching user-facing copy
5. **3-Party Approval Gate declaration:** "3-Party Approval Gate: satisfied" OR "in Alignment Mode" (see [alignment-mode.md](alignment-mode.md) → 3-Party Approval Gate (Canonical))

**"Best next step? YES" is ONLY allowed if:**
- The prompt's GOAL matches NEXT STEP for the ACTIVE STORY (<DOCS_ROOT>/project/NEXT.md), AND
- It is a single tiny step with a testable proof (RED→GREEN or docs-only evidence), AND
- Repo safety gates are satisfied (clean tree, tests pass, build passes), AND
- 3-Party Approval Gate is satisfied (see [alignment-mode.md](alignment-mode.md) → 3-Party Approval Gate (Canonical))

**<DOCS_ROOT>/project/NEXT.md Freshness Rule:** "Best next step? YES" is only possible when the ACTIVE NEXT STEP is still current. If you just completed it (work shipped per DoD), the next action is closeout/advance <DOCS_ROOT>/project/NEXT.md, NOT new feature work. See [Start-Here-For-AI.md](../../Start-Here-For-AI.md) "<DOCS_ROOT>/project/NEXT.md Freshness Rule" for detection command and enforcement.

**Population Gate Pre-Flight:** Population Gate is verified during the Start-of-Session Doc Audit (after reading <DOCS_ROOT>/project/VISION.md, <DOCS_ROOT>/project/EPICS.md, and <DOCS_ROOT>/project/NEXT.md), not in the Prompt Review Gate. The Doc Audit MUST have been run in this session and returned Population Gate PASS before any coding work. If Doc Audit has not been run or returned FAIL, STOP and run/remediate it first (see [Start-Here-For-AI.md](../../Start-Here-For-AI.md)).

**Doc Audit Sequencing (Session Prerequisite):** Doc Audit is a session-level prerequisite that occurs AFTER Proof-of-Read, never before the Prompt Review Gate. Work prompts in a fresh session must run Doc Audit first as per the ordered sequence in [Start-Here-For-AI.md](../../Start-Here-For-AI.md): Prompt Review Gate → Proof-of-Read → Doc Audit → (if PASS) proceed to work. After each commit, run the rerun-trigger detection command defined in [Start-Here-For-AI.md](../../Start-Here-For-AI.md) to determine if Doc Audit must be rerun. When `tools/session-start.ps1` exists in the vibe-coding subtree, the **RUN START OF SESSION DOCS AUDIT** command invokes it; the wrapper chains kit update → forGPT sync → 5-line audit print automatically.

**Consumer Start-Here callout:** Consumer repos should include the standard session-start callout snippet from [templates/start-here-session-start-callout.example.md](../templates/start-here-session-start-callout.example.md) in their Start-Here-For-AI.md to ensure the automated chain is the default entry point.

**Tech Debt Rule:** Any TECH-DEBT prompt and any new tech-debt row MUST include a Story ID (even if it's a "Maintenance/Protocol" story). Put it in the tech-debt row description as: "Story: <ID> — …".

**Alignment Mode (Start-of-Session):**
If `<DOCS_ROOT>/project/NEXT.md` is missing/unclear/outdated OR **Control Deck Population Gate FAIL** (placeholders detected in <DOCS_ROOT>/project/VISION.md, <DOCS_ROOT>/project/EPICS.md, or <DOCS_ROOT>/project/NEXT.md) → STOP coding and enter Alignment Mode. See [alignment-mode.md](alignment-mode.md) for 3-Party Approval Gate (Canonical), placeholder remediation, and questions to ask Stephen + Copilot before coding. Update `<DOCS_ROOT>/project/*` (VISION/EPICS/NEXT) before any code work.

2. **Proof-of-Read**: Proof-of-Read MUST appear after the Gate and BEFORE any searches or edits (file path + quote of 1-2 complete sentences 10-50 words + "Applying: <rule name>"). Repo sanity commands may run between the Gate and Proof-of-Read.

   **Comprehension Self-Check (Required):** Immediately after Proof-of-Read, the agent MUST answer these 3 questions in its output BEFORE proceeding to any work:
   - Q1: "What exactly will change?" (name specific file(s)/section(s) and intended diff — one line)
   - Q2: "What is explicitly out of scope?" (one line)
   - Q3: "What is the next command + the pass/fail gate?" (exact next command — one line)

   If the agent cannot answer any question with concrete specifics, it must STOP and ask Stephen (or enter RESEARCH-ONLY mode per existing rules). The self-check answers must appear every time Proof-of-Read is required.

3. **Single-Block Prompts**: All operator prompts are one fenced code block ending with `# END PROMPT`.
4. **Green Gate (Stack-Aware)**: See [Green Gate — Stack-Aware Rules](#green-gate--stack-aware-rules) below. At minimum, the primary build must pass before any commit.
5. **Flake Protocol**: If a test fails then passes on rerun without code changes:
   - Mark as "FLAKE SUSPECT" in completion report
   - Create tech debt ticket in same session (add row to tech-debt-and-future-work.md)
   - Include in completion report footer: "Flake suspect? YES/NO"
   - Do NOT ignore — flakes indicate race conditions or cleanup issues
6. **Stop on Error**: On non-zero exit, stop and propose smallest fix (unless the error is classified as "recoverable once" under Resilience Rules (v7 patch)).
6. **Measure Production First**: If a prompt asserts "production has X / doesn't have Y" or any feature is content-dependent, the FIRST step is to identify the production artifact (generated JSON/db/API), record property chains + counts + one example item, and add/confirm a shape-proof + contract test BEFORE changing behavior. Tests must use real production JSON for content-dependent behavior; avoid invented fixtures.
7. **Terminology Lock**: Terminology caused model drift; lock UI copy to a dictionary; never infer data shape from labels.
8. **Guard Rejection Visibility**: Any canActivate/redirect-to-review must emit a single reason code in dev (console or debug overlay); no console spam in prod; deterministic route behavior remains.
9. **Verification Mode**: Read-only audit prompts must not include edits, tests, builds, or merges. See [verification-mode.md](verification-mode.md) for allowed commands, forbidden actions, required output format, and STOP boundaries.
10. **Search + Recovery Reporting**: If a prompt performs codebase searching, the report MUST include:
   - "Search method used: rg | git grep | Select-String"
   - "Recovery applied: <none | retry | fallback>"

## Focus Control

### Goal Anchor (Mandatory per session)

- North Star (1 sentence): what "done" means in human terms
- Current Slice (1 sentence): smallest shippable outcome for today
- Proof (1-3 bullets): observable checks that confirm progress

**Rule:** No cleanup/research/process work may start unless Goal Anchor exists for the session.

#### North Star Source of Truth

- North Star MUST come from the project Control Deck (VISION/EPICS/NEXT or equivalent)
- The AI MUST NOT invent North Star
- If North Star is not found in available docs/context, the AI MUST:
    - Output: "North Star: UNKNOWN (needs Control Deck)"
    - Propose ONE clearly labeled candidate sentence based on evidence
    - Ask Stephen to confirm or replace with a single sentence
    - STOP (do not proceed with implementation planning until confirmed)

### Drift Triggers (Objective STOP conditions)

If ANY trigger occurs, the AI MUST STOP and run Reset Ritual before continuing:
- Two consecutive prompts without advancing a Proof item
- >=20 minutes spent on process/docs/cleanup without shipping progress
- BranchAudit FAIL OR forbidden-prefix branches exist
- User expresses confusion/frustration ("chaos", "this is nuts", "lost faith", etc.)
- Scope expands before finishing Current Slice (new epics/stories/topics mid-slice)

### Reset Ritual (90 seconds)

Steps:
- Restate Goal Anchor
- List top 3 active threads
- Park 2 threads to Future Work (with an explicit outcome + proof)
- Choose 1 next action that advances Proof
- Write the next prompt constrained to that one action only

**Rule:** The next prompt after a reset MUST target only one Proof-advancing action.

### Parking Lot rule (prevents distraction)

When a new concern appears:
- Capture it to Future Work in <2 minutes
- Immediately return to Current Slice

**Rule:** Parking entries must be "outcome + proof", not status.

## Green Gate — Stack-Aware Rules

**Purpose:** Ensure builds/tests pass before commit, using the correct toolchain for the project type.

**Authority:** Gate decisions MUST come from [`<DOCS_ROOT>/project/stack-profile.md`](../../project/stack-profile.md). Do not interpret or guess — read the declared gates.

**Standard:** See [stack-profile-standard.md](../standards/stack-profile-standard.md) for how to create/update stack profiles.

### A) Read Stack Profile First

Before running any gate commands:
1. Open `<DOCS_ROOT>/project/stack-profile.md`
2. Find the "Gate Configuration" section
3. Run ONLY the gates marked "Required: YES" for the change type

**No interpretation:** If stack-profile says "JS Build: N/A", do not run npm build even if package.json exists.

### B) .NET Gate (as declared in stack-profile)

**Build (REQUIRED per stack-profile):**

    msbuild ExampleProject.csproj /p:Configuration=Release

**Unit Tests (if test project exists):**
- Check: `Test-Path **/ExampleProject.Tests.csproj` or similar
- Current status: No .NET unit test framework configured (per R-004)
- When tests exist: Run via VS Test Explorer or `vstest.console.exe`

**Tech Debt:** CLI test runner not standardized yet. See [tech-debt-and-future-work.md](../../project/tech-debt-and-future-work.md).

### C) JS Gate (React, Angular, Node.js Apps)

**Applicability Rule:** JS Gate applies ONLY when ALL of:
1. The PR touches files under a directory containing `package.json`, AND
2. That `package.json` has both `scripts.build` AND `scripts.test` defined, AND
3. The stack-profile declares JS gates as required (not just "test harness")

**Rule:** Check `stack-profile.md` — if it says "JS Build: N/A", do not run npm build.

**Pre-check (if stack-profile unclear):** Read `package.json` and verify purpose + scripts:

    Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty scripts

**If stack-profile declares JS gates required:**

    npm run build
    npm run test

**If stack-profile declares JS gates N/A:** Document in report: "JS Gate: N/A (per stack-profile)"

### D) Docs-Only Gate

For docs-only changes (`.md` files only):
- No build required
- Population Gate (no TBD/TODO/PLACEHOLDER) MUST pass
- Spell-check encouraged but not blocking

### E) Gate Summary (Read from stack-profile.md)

Refer to [`<DOCS_ROOT>/project/stack-profile.md`](../../project/stack-profile.md) for the authoritative gate configuration.

**ExampleProject Summary (per stack-profile):**

| Gate | Command | Required |
|------|---------|----------|
| .NET Build | `msbuild ExampleProject.csproj /p:Configuration=Release` | ✅ YES |
| .NET Tests | (none configured) | N/A |
| JS Build | (no build script) | N/A |
| Playwright E2E | `npm run test:smoke` | Optional |

---

## Resilience Rules (v7 patch)

These rules reduce false STOPs caused by tooling and environment variability, while preserving strict safety around edits, scope, and canonical docs.

### A) Two-tier Command Lock

- **Lock A (Hard):** No edits, searches, network access, or file writes before the 4-line Gate. Violating Lock A is always STOP.
- **Lock B (Soft):** After the Gate, repo sanity commands are allowed before Proof-of-Read. Violating Lock B is recoverable only if no edits occurred and Recovery Policy (below) is followed.

### B) Search tool fallbacks

Required search order for codebase search:
1) `rg` (if installed)
2) `git grep`
3) PowerShell `Select-String`

Tool absence (e.g., “rg not found”) is NOT an error if you switch to the next approved fallback and record it in the report (“Search method used: …”).

### C) Recoverable error policy

**Recoverable once** (choose ONE recovery path):
- command not found (tooling)
- interrupted command (`^C`)
- transient path mismatch
- missing optional file
- empty search results

**Recovery rule:** Retry once OR switch to the approved fallback once. If it still fails, STOP and give minimal unblock instructions.

**Non-recoverable (always STOP):**
- edits made before the Gate
- failing tests/builds during code prompts (unless the prompt explicitly instructs fixing)
- scope violations
- missing required canonical docs (e.g., `<DOCS_ROOT>/project/NEXT.md`, required handoff/protocol files)

### D) STOP / PIVOT Rule (When Evidence Contradicts Prompt)

When the agent discovers that the repo state differs from what the prompt assumed, it must follow one of two paths before making any edits.

**PIVOT REPORT** (when a better alternative exists):

    PIVOT REPORT
    Expected (from prompt): <what prompt assumed>
    Found (evidence): <what actually exists, with file:line>
    Proposed pivot: <safer alternative>
    Risk assessment: <why pivot is better>

Proceed with pivot only if: identical behavior, equal or narrower scope, and the existing hook is stable. Otherwise STOP and ask the operator.

**Contradiction STOP** (when evidence contradicts the prompt):

    STOP: PROMPT CONTRADICTED BY EVIDENCE
    Prompt assumption: <what prompt said>
    Evidence: <what file:line actually shows>
    Request: Clarify scope or update prompt

**Confidence integration:**
- ≥95% (docs/research) / ≥99% (runtime): evidence captured and consistent with plan.
- Below threshold: evidence incomplete — STOP or enter RESEARCH-ONLY mode.
- Evidence contradicts prompt: STOP immediately (see Contradiction STOP above).

## Docs PR Consolidation Rule

**Purpose:** Minimize open PRs and reduce review burden by consolidating docs changes.

### Rule

1. **Extend existing docs PR:** If a docs portability/standards PR already exists on the current branch (e.g., PR #38), add commits to it rather than opening a new PR.

2. **Separate runtime from docs:** Keep runtime code changes in their own PRs. Do not mix runtime fixes with docs-only changes.

3. **When to open a new docs PR:**
   - No existing docs PR is open on the branch
   - The change is unrelated to the existing PR's scope
   - The existing PR is blocked/stale and a fresh start is needed

### Rationale

Multiple small docs PRs create:
- Review fatigue for approvers
- Merge conflicts between docs branches
- Difficulty tracking what's "current"

One consolidated docs PR with clear commits is easier to review and merge.

## Preflight Evidence Gate (No Guessing)

This section prevents structural assumptions that lead to incorrect edits or scope creep.

### A) Structural Assumption Ban

No assumptions about:
- Existing IDs or classes (verify in-file before using as selectors)
- Which stylesheet is loaded on a page (verify layout file references)
- Selector scope or specificity (verify no conflicts in target stylesheet)
- File locations or paths (verify existence before referencing)
- HTML wrapping or container structure (verify actual markup)

**Rule:** If not verified in-file, STOP. Do not guess or assume from memory or naming conventions.

### B) Preflight Evidence Requirement

Before making changes that depend on structure, capture evidence by quoting line ranges (or short excerpt) that proves:

1. **Hook existence:** The wrapper ID/class exists in the view OR is confirmed absent (if adding new)
2. **CSS location:** The CSS rule is currently present (and where exactly)
3. **Stylesheet loading:** The target external stylesheet is actually loaded on the page (verify in layout file)

**Evidence format in report:**

    PREFLIGHT EVIDENCE
    Hook: id="teach" exists at Views/Teach/Index.cshtml:30
    Current CSS: li.disabled at Views/Teach/Index.cshtml:15-20 (inline <style>)
    Target stylesheet: Content/css/style.css loaded via _Layout.cshtml:45

### C) Two-Phase Default

If the change touches CSS scope/structure, default to a two-phase approach:

1. **Research-only prompt first:** Inventory + evidence + proposed change (no edits)
2. **Implementation prompt second:** Execute with verified evidence

**Single-step exception:** Implementation is allowed in one prompt only when:
- Evidence is trivial (e.g., existing ID clearly visible in attached context)
- Evidence is explicitly included in the prompt output before edits

### D) Confidence Gate Update

- **≥95%:** Evidence captured and consistent with plan (docs/research scope)
- **≥99%:** Evidence captured, reproduced, and side-effects ruled out (runtime/code scope)
- **Below threshold:** Evidence incomplete or contradicts plan — STOP and gather evidence first

**Rule:** If Confidence is below the applicable threshold due to missing structural evidence, STOP and gather evidence first.

**Note:** This is the same percentage scale used in the Prompt Review Gate and Evidence Pack Confidence Statement.

---

## No Guessing / Tiered Confidence Gate (MANDATORY)

**Purpose:** Prevent speculative changes that cause churn, regressions, and wasted effort.

### A) Tiered Confidence Rule

Confidence thresholds vary by scope. Higher-risk scopes require higher confidence.

| Scope | Threshold | Action if below |
|-------|-----------|------------------|
| Low-risk (docs, tests, reports) | ≥95% | May proceed |
| Production/runtime code | ≥99% | May proceed |
| Any scope below threshold | — | STOP — enter RESEARCH-ONLY mode |

**Clarification:** "Best next step?" and "Confidence" in the Prompt Review Gate are **Copilot's** (executor's) gate questions, not planner statements. Copilot evaluates confidence as a percentage using the same scale as the Evidence Pack Confidence Statement.

**What "95% confidence" means (low-risk):**
- You have verified evidence for every structural assumption
- You know the exact files, line ranges, and dependencies affected
- You can predict the outcome of your change with near-certainty

**What "99% confidence" means (production/runtime):**
- All of the above, PLUS:
- You have reproduced the issue or behavior under investigation
- You have confirmed no side effects on adjacent features
- You have identified or written tests that cover the change

**Primary Priorities:** See [working-agreement-v1.md → Primary Priorities (Non-Negotiable)](working-agreement-v1.md#primary-priorities-non-negotiable) for prompt-only mode, one-prompt rule, tiny-step TDD default, and Stephen cognitive style. These govern all GPT interactions.

### B) Dual-Agent Research Requirement

When confidence is below the applicable threshold, **both AI agents** (ChatGPT and Copilot) MUST request more research before proceeding:

- **ChatGPT (Planner):** MUST NOT produce implementation prompts when confidence is below threshold. Instead, produce a RESEARCH-ONLY prompt.
- **Copilot (Executor):** MUST NOT execute code changes when confidence is below threshold. Instead, STOP and request evidence gathering.

**Handshake phrase:** "Confidence <95% — entering RESEARCH-ONLY mode" (or "<99%" for production scope)

### C) No Guessing Enforcement

**NEVER guess about:**
- Root cause of bugs without reproduction
- File locations or code structure without verification
- Database state without query evidence
- Runtime behavior without instrumentation or logs
- Configuration precedence without documented proof

**If you don't know, SAY SO.** Then gather evidence.

---

## RESEARCH-ONLY Command Lock (MANDATORY)

**Purpose:** Ensure research phases produce evidence, not side effects.

### A) When RESEARCH-ONLY Applies

RESEARCH-ONLY mode is triggered when:
1. Confidence is <95%
2. Prompt explicitly declares `Scope: RESEARCH-ONLY`
3. Investigating a bug without reproduction evidence
4. Analyzing behavior without instrumentation data

### B) RESEARCH-ONLY Allowed Actions

| Action | Allowed |
|--------|---------|
| `read_file`, `grep_search`, `list_dir` | ✅ YES |
| `git log`, `git diff`, `git status` | ✅ YES |
| `git show` (read commits/branches) | ✅ YES |
| Database SELECT queries (read-only) | ✅ YES |
| `gh pr list`, `gh pr view` (read) | ✅ YES |
| Creating markdown docs in `research/` | ✅ YES |

### C) Prior Research Lookup (MANDATORY)

**Rule:** Every RESEARCH-ONLY output MUST include a "Prior Research Lookup" section. The lookup MUST happen BEFORE any new investigation begins.

**Step 1 — Run the tool:**
```powershell
.\tools\check-prior-research.ps1 -Terms "<term1>","<term2>"
```
This searches `<DOCS_ROOT>/research/ResearchIndex.md` and all `R-###-*.md` files. If the tool is unavailable (e.g., in ChatGPT), use manual grep:
```powershell
Select-String -Path "<DOCS_ROOT>/research/*.md" -Pattern "<term>"
```

**Step 2 — Read matches:** If the tool returns matches, READ the referenced documents before proceeding. Do not start new research if the answer already exists.

**Step 3 — Document the lookup in your output:**

1. **States the exact search commands used** (tool invocation or manual grep)
2. **Lists any matching document IDs found:**
   - R-### (Research docs)
   - REPORT-### (Analysis reports)
   - POLICY-### (Policy docs)
   - Which documents were actually read
3. **OR explicitly states:** "No relevant prior research found" (only after searching ResearchIndex.md + research/ folder)

**If this section is missing, the RESEARCH-ONLY output is INVALID.** Stop and add the lookup before drawing conclusions.

**Why this matters:** Prevents duplicate research, ensures knowledge accumulation, and catches cases where the answer already exists.

### D) RESEARCH-ONLY Forbidden Actions

| Action | Forbidden |
|--------|-----------|
| Editing runtime code (`.cs`, `.vb`, `.cshtml`, `.js`, `.ts`) | ❌ NO |
| Creating branches for code changes | ❌ NO |
| Opening PRs with code changes | ❌ NO |
| Running builds or tests that modify state | ❌ NO |
| Database INSERT/UPDATE/DELETE | ❌ NO |
| Adding instrumentation/logging to runtime code | ❌ NO |

### E) Exiting RESEARCH-ONLY

To exit RESEARCH-ONLY mode:
1. Complete an Evidence Pack (see below)
2. Confidence MUST reach ≥95%
3. Explicitly declare: "RESEARCH-ONLY complete — confidence now ≥95%"

### F) External Research Escalation

When blocked by external facts and Copilot has no web access, follow [working-agreement-v1.md § External Research Escalation](working-agreement-v1.md).

---

## INSTRUMENTATION (CODE-OK) Scope (MANDATORY)

**Purpose:** Allow temporary diagnostic code when research requires it, with strict guardrails.

### A) When INSTRUMENTATION Applies

INSTRUMENTATION mode is triggered ONLY when:
1. RESEARCH-ONLY is insufficient (cannot gather evidence without runtime observation)
2. Prompt explicitly switches mode: "Switching from RESEARCH-ONLY → INSTRUMENTATION (CODE-OK)"
3. Stephen approves the instrumentation scope

### B) INSTRUMENTATION Allowed Actions

| Action | Allowed |
|--------|---------|
| Adding `Console.WriteLine` / `Debug.WriteLine` for diagnostics | ✅ YES |
| Adding temporary logging to capture state | ✅ YES |
| Adding `// INSTRUMENTATION:` comments marking temporary code | ✅ YES |
| Creating a dedicated instrumentation branch | ✅ YES |

### C) INSTRUMENTATION Guardrails

1. **Labeling:** All instrumentation code MUST include comment: `// INSTRUMENTATION: <ticket-id> — REMOVE AFTER DIAGNOSIS`
2. **Scope limit:** Maximum 20 lines of instrumentation per file
3. **No persistence:** Instrumentation code MUST NOT be merged to develop/main
4. **Follow-up task:** Every INSTRUMENTATION session MUST create a TD-### task: "Remove instrumentation from <files>"
5. **Evidence capture:** Instrumentation output MUST be captured in the Evidence Pack

### D) INSTRUMENTATION vs RESEARCH-ONLY Distinction

| Mode | Code Changes | Evidence Output |
|------|--------------|-----------------|
| RESEARCH-ONLY | ❌ None | R-### doc with search/query evidence |
| INSTRUMENTATION (CODE-OK) | ✅ Temporary diagnostics only | R-### doc with runtime output evidence |

**Rule:** Never mislabel INSTRUMENTATION work as RESEARCH-ONLY. If you're adding code, you're in INSTRUMENTATION mode.

---

## Evidence Pack Requirement (MANDATORY)

**Purpose:** Ensure every diagnosis has reproducible proof, not speculation.

### A) Required Evidence Pack Sections

Every research effort MUST produce an Evidence Pack containing:

| Section | Content |
|---------|---------|
| **Repro Steps** | Numbered steps to reproduce the issue |
| **Environment Fingerprint** | OS, .NET version, IIS Express/IIS, browser, date/time |
| **DLL Hashes/Timestamps** | `Get-FileHash` and `Get-Item` on relevant binaries |
| **Connection Targets** | Actual database servers/databases being hit |
| **Observed Error** | Exact error message, stack trace, or unexpected behavior |
| **DB Proof** | Query results demonstrating database state |
| **Diff Proof** | `git diff` showing code differences between working/broken |
| **Decision** | What the evidence proves and recommended action |

### B) Evidence Pack Template

    ## Evidence Pack — <TICKET-ID>
    
    ### Repro Steps
    1. <step>
    2. <step>
    
    ### Environment Fingerprint
    - OS: Windows 11 / Server 2022
    - .NET: 4.8.x
    - IIS: Express / Full
    - Date: YYYY-MM-DD HH:MM
    
    ### DLL Hashes
    | File | SHA256 | Modified |
    |------|--------|----------|
    | bin/X.dll | abc123... | 2026-02-05 10:30 |
    
    ### Connection Targets
    - TeachModel: <server>/<database>
    - TopLevelSqlConn: <server>/<database>
    
    ### Observed Error
    <exact message or behavior>
    
    ### DB Proof
    ```sql
    SELECT ... -- query
    -- result: <summary>
    ```
    
    ### Diff Proof
    <git diff output or summary>
    
    ### Decision
    Evidence proves: <conclusion>
    Recommended action: <next step>

### C) Confidence Statement

Every Evidence Pack MUST end with a Confidence Statement:

    ### Confidence Statement
    Confidence: <percentage>%
    Basis: <1-2 sentences explaining why this confidence level>
    Ready to proceed: YES / NO (if <95%, NO)

---

## Research Saved + Indexed (MANDATORY)

**Purpose:** Ensure all research is discoverable and not lost.

### A) Every Research Effort Produces R-###

**Rule:** Every research session MUST create a research document:
- Location: `<DOCS_ROOT>/research/R-###-<Title>.md`
- Naming: Sequential 3-digit number (e.g., R-016, R-017)
- Content: Evidence Pack + Confidence Statement

### B) ResearchIndex.md Update Required

**Rule:** Every new R-### document MUST be added to `<DOCS_ROOT>/research/ResearchIndex.md` in the same commit.

Index entry MUST use the structured format defined in
[research-standard.md](../standards/research-standard.md#researchindexmd-format-canonical-reference)
and include:
- Report ID
- Date
- PROMPT-ID (if applicable)
- Area
- Status + Confidence
- **Keywords** (3–8, lowercase, comma-separated — critical for search)
- Summary (1 sentence)
- File path

### C) No Orphan Research

**Anti-pattern:** Research findings mentioned only in chat, not saved to docs.

**Rule:** If you gathered evidence, it MUST be saved. "I checked and found X" without an R-### is incomplete research.

---

## PR / Branch Hygiene Gate (MANDATORY)

**Purpose:** Prevent work loss from orphaned branches and stale PRs.

### A) No New Sprint Work with Orphaned Branches

**Rule:** Before starting new sprint work, verify no unmerged runtime branches exist without a PR.

Check command:
    git branch -a --no-merged origin/develop | Select-String -NotMatch "docs/"

If runtime branches exist without PRs: STOP and either open PRs or document why they're parked.

### B) Open PR Ledger

**Rule:** Maintain awareness of open PRs. At session start, run:
    gh pr list --state open --json number,title,headRefName

If PRs are aging (>2 days without merge), flag for review.

### C) Docs-Only PRs

Docs-only PRs (no runtime code) MAY be merged with less scrutiny, but MUST still be tracked and not abandoned.

---

## Manual Test Checklist Artifact (MANDATORY)

**Purpose:** Make manual testing reproducible and auditable.

### A) Manual Test Is a Document

**Rule:** Every manual test session MUST produce a checklist document:
- Location: `<DOCS_ROOT>/testing/manual/` or in the relevant R-### report
- Format: Numbered test cases with IDs

### B) Required Checklist Format

| Test ID | Description | Expected Outcome | Actual | Pass/Fail |
|---------|-------------|------------------|--------|-----------|
| MT-001 | <what to do> | <what should happen> | <what happened> | ✅ / ❌ |
| MT-002 | ... | ... | ... | ... |

### C) Test Artifact Retention

**Rule:** Manual test checklists are evidence. They MUST be:
- Committed to the repo (not just in chat)
- Referenced in PR descriptions when validating fixes
- Linked from relevant R-### documents

---

## Help Triggers + Churn Circuit Breaker (Solution-Agnostic)

This section defines when to STOP and ask for help instead of proceeding with uncertain edits.

### A) Churn Circuit Breaker (WHEN TO STOP AND ASK FOR HELP)

Stop execution and request a report if ANY of these are true:

1. **Multi-tenant/scenario copy without registry key** — You are adding narrative/copy to a multi-tenant or multi-scenario app AND the copy is not already keyed/registry-scoped (e.g., `introByScenario[scenarioId]`).
2. **Cross-cutting change without call-site map** — A change touches 2+ routes/components OR duplicates logic across files, and you do not have a map of affected call sites.
3. **Unknown runtime key** — You do not know the exact runtime key (scenarioId/tenantId/etc.) that gates the change.
4. **Recent revert/rewrite** — A prior step in this session had to be reverted/rewritten due to missing invariants (e.g., cross-scenario bleed, missing registry).
5. **Audit outcome WARN/RED** — Investigation outcome is WARN or RED (audit report) and the next step involves refactoring.
6. **Unfamiliar files without map** — You need line-precise edits across unfamiliar files and do not have a map of call sites/tests.

When ANY of these triggers fire, STOP and follow the Help Ladder (below).

### B) Help Ladder (WHAT HELP TO ASK FOR)

Use this escalation order:

1. **Local search fallback first** — If the uncertainty is purely "find call sites," use git grep / Select-String and report findings before editing.
2. **Request Agent Report (read-only)** — If uncertainty remains after local search, request an Agent Report (read-only investigation) before coding.
3. **Timebox a spike (read-only)** — If still unclear, timebox a spike (read-only) and report back before committing to implementation.

### C) Agent Report Template

When requesting an Agent Report, use this structure:

    PROMPT-ID: REPORT-<TOPIC>-<NNN>
    
    Goal: <1-sentence description of what needs to be understood>
    Scope: Read-only investigation; no code edits.
    
    Required sections in report:
    - Runtime key plumbing (how scenarioId/tenantId flows through the app)
    - Call sites (files/lines that need updates)
    - Duplication map (where logic is repeated across files)
    - Smallest safe diff steps (ordered list of minimal changes)
    - Tests impacted (which test files/specs to update)
    
    Output: Single markdown report in <DOCS_ROOT>/status/, no fenced code blocks.
    
    # END PROMPT

## Interface Forecast Micro-Gate (MANDATORY before first wiring step)

**Purpose:** Reduce return-type churn by designing interfaces upfront.

**Before writing the first line of wiring code (connecting helper to component), complete this checklist:**

### Interface Forecast Checklist

- [ ] **Define v1 return shape** — Write the full TypeScript return type BEFORE implementation
- [ ] **Prefer stable objects over primitives** — Return `{ value, metadata }` not just `value`
- [ ] **List likely-to-change fields** — Mark fields that may expand (use `?` optional or plan for additions)
- [ ] **Confirm downstream consumers** — List which components/services will consume this interface

### Anti-Churn Patterns

**DO:** Return full objects from the start

    // Good: Stable object, easy to extend
    interface Result { messageId: string; layers: { l1: string; l2: string; l3: string } }

**DON'T:** Return primitives then refactor to objects later

    // Bad: Forces downstream changes when you need metadata
    function getMessage(): string  // v1
    function getMessage(): { text: string; id: string }  // v2 (breaking)

### When to Skip

Interface Forecast is NOT required for:
- Pure refactors (no new interfaces)
- Docs-only changes
- Test-only changes (S1A RED-LOCK)

---

## Copy & Semantics Gate (MANDATORY for UX/copy/narration changes)

Before changing any user-facing copy (coach/tutor text, labels, microcopy, narration, prompts), you MUST write down:

1. **Section Map** (screen structure)
   - List the sections in order as users see them (e.g., Meta line → Prompt → Controls → Coach → Continue).

2. **Semantic Hierarchy**
   - Assign roles / header levels (e.g., H1 page intent, H2 prompt, H3 helper/coach).
   - State what is PRIMARY vs SUPPORTING vs OPTIONAL.

3. **Copy Source Decision**

Choose ONE:
- **TS constant** (only if stable and unlikely to churn)
- **JSON asset dictionary** (preferred when iterating)
- **Content schema** (content/categories/*.json) when copy should be content-owned
- **Admin pipeline** (only when we explicitly scope it)

**Rule**: If copy is likely to iterate, move it OUT of TypeScript first (JSON dictionary minimum) before "voice" tuning.

**Evidence to include in the report**:
- The final Section Map + chosen Copy Source.

## Required Reading (Proof-of-Read List)

Before starting work, read and quote from these files:
- `<DOCS_ROOT>/vibe-coding/protocol/protocol-v7.md` (this file)
- `<DOCS_ROOT>/vibe-coding/protocol/copilot-instructions-v7.md`
- `<DOCS_ROOT>/vibe-coding/protocol/stay-on-track.md`
- `<DOCS_ROOT>/vibe-coding/protocol/working-agreement-v1.md`
- `<DOCS_ROOT>/status/branches.md`
- `<DOCS_ROOT>/testing/test-catalog.md` (required when touching tests)

**Required Reading Integrity Check (MANDATORY):**
If a required-reading document is missing from the repo:
1. STOP — do not claim Proof-of-Read PASS for missing files
2. Choose one of:
   - (A) Create a minimal stub for the missing doc, OR
   - (B) Update the required-reading list to reference a correct/existing doc
3. Document which option was chosen in the report

You may NOT proceed with work while required-reading files are missing.

## Required Reading Sets (by Prompt Type)

### Work Prompts (S0A / S1A / S2A)

Full reading set:
- `<DOCS_ROOT>/vibe-coding/protocol/protocol-v7.md`
- `<DOCS_ROOT>/vibe-coding/protocol/copilot-instructions-v7.md`
- `<DOCS_ROOT>/vibe-coding/protocol/stay-on-track.md`
- `<DOCS_ROOT>/vibe-coding/protocol/working-agreement-v1.md`
- Relevant story doc(s) for the work
- `<DOCS_ROOT>/testing/test-catalog.md` (if tests may be touched)

### Closeout Prompts (S2C merge/closeout)

Minimal reading set (merge-focused):
- `<DOCS_ROOT>/vibe-coding/protocol/protocol-v7.md` (S2C / Merge Checklist section)
- `<DOCS_ROOT>/vibe-coding/templates/closeout-artifact-verification-template.md`
- `<DOCS_ROOT>/status/branches.md`
- `<DOCS_ROOT>/vibe-coding/protocol/stay-on-track.md` (only when scope includes strict guardrails)

**Note**: S2C prompts that include additional work beyond merge should use the full Work Prompt reading set.

## Prompt Structure

~~~markdown
PROMPT-ID: <ID>
## GOAL
## SCOPE GUARDRAILS
## TASKS
# END PROMPT
~~~

## Response Structure

**CRITICAL:** The entire response (from PROMPT-ID through final summary) must be ONE copy-paste ready markdown document. Do NOT fragment output or treat "the report" as separate from "the response."

1. **PROMPT-ID** (mandatory first line): Echo exact PROMPT-ID from the executed prompt. If prompt lacks PROMPT-ID, STOP and request corrected prompt.
2. **Prompt Review Gate** (mandatory, exactly 4 lines, BEFORE any work or Proof-of-Read):
   - What: (1-line summary)
   - Best next step? YES/NO
   - Confidence: <percentage>%
   - Work state: READY|IN-PROGRESS|COMPLETE|MERGED|OBSOLETE
   
   **Command Lock enforcement:** NO commands, edits, or searches are allowed before printing these 4 lines. If Confidence is below the applicable threshold (< 95% docs, < 99% runtime), Best next step != YES, or Work state != READY (except merge/closeout requiring COMPLETE), STOP and explain.
3. **Proof-of-Read** (mandatory after the Gate; must appear before any searches or edits; 1-2 complete sentences 10-50 words per file)
4. **Work** (execute tasks only after gate passes; repo sanity commands may run before Proof-of-Read)
5. **Green Gate** (run tests + build)
6. **Summary** (what changed, files touched)

### Session Sequencing Rule (Hard Stop)
- Do not propose or author a new operator prompt until the full Copilot completion report for the current prompt has been pasted and acknowledged in chat.
- If an operator says “wait for Copilot’s report” (or any phrasing that the prior report is still pending), STOP immediately and wait for their confirmation before resuming.

**Report Formatting Rule (STRICTLY ENFORCED):**
- ZERO fenced code blocks anywhere in your response (no ``` markers)
- Use 4-space indentation for command output, code snippets, and examples
- The response IS the report - one continuous markdown document
- Operator must be able to copy the entire response with one selection

## Lean Prompts and Context Budgeting (MANDATORY)

**Purpose:** Preserve context window budget. Large pasted docs and verbose reports consume tokens that should be spent on reasoning and code.

### Two-Layer Prompt Pattern

Prompts should separate execution instructions from reference material:

1. **Execution Prompt** — The tasks, scope, and gates (compact; fits in one screen)
2. **Read List** — File paths only, not pasted content. The executor reads them on demand.

**Example read list (preferred):**

    Read before work:
    - protocol/protocol-v7.md (§ Green Gate)
    - <DOCS_ROOT>/project/NEXT.md

**Anti-pattern (banned by default):** Pasting entire file contents into a prompt. Link to file paths + quote only the relevant lines (10-50 words) instead.

### Delta-Only Reports

Completion reports must include ONLY:

- **Changes made** (files + what changed, 1 line per file)
- **Proof** (command output, test results — summarized unless failing)
- **Verdict** (PASS/FAIL + next step)

**Raw evidence** (full terminal output, large diffs) is included ONLY when:
- A gate is failing and the output is needed for diagnosis
- The operator explicitly requests it

### Report Size Guardrail

If a report would exceed ~200 lines, split into:
1. Summary report (changes + verdict)
2. Evidence appendix (linked, not inlined — saved to `<DOCS_ROOT>/status/` if needed)

## Lint-Suppress Before Lint-Fix (MANDATORY DEFAULT)

**Default action:** When working code triggers a lint warning, **suppress with rationale** rather than "fix" the code.

**Rule:** If a linter (ESLint, TSLint, etc.) complains about intentionally-designed code:
- **DO:** Add `// eslint-disable-next-line <rule> -- <rationale>` immediately above the line
- **DO NOT:** "Fix" the code to satisfy the linter unless you have explicit behavior verification

**Escalation:** Only "fix" (change code to satisfy linter) if the prompt explicitly includes:
1. Behavior contract (what the code does before/after)
2. Verification plan (test or smoke that proves behavior unchanged)
3. Approval for behavioral change in scope

**ESLint Suppression Placement (MANDATORY):**
- `eslint-disable-next-line` must be immediately above the suppressed line (not on same line, not separated by blank lines)
- Must include 1-line rationale after `--`

**Background:** See postmortem `docs/postmortems/2026-01-08-postmortem-lint-cleanup-regression.md` — "fixing" react-hooks/exhaustive-deps warnings broke SignalR multiplayer functionality.

## Hook Dependency Change Gate (React/TS Projects Only)

> **Applies to:** React/TypeScript projects with hooks. Skip for ASP.NET MVC projects.

**Rule:** Any change to React hook dependency arrays (`useEffect`, `useCallback`, `useMemo`) is a **behavioral change**, not a cleanup.

**Rationale:** Dependency arrays control when effects re-run. Adding/removing deps changes execution timing and can introduce race conditions.

**Hook Deps Change Block (REQUIRED for any deps modification):**

    HOOK DEPS CHANGE
    File: <path>
    Hook: <useEffect/useCallback/useMemo> at line <N>
    BEFORE deps: [<list>]
    AFTER deps: [<list>]
    Rationale: <why this change is necessary>
    Behavior contract: <what should happen before and after>
    Verification: <test name or smoke sequence proving behavior preserved>

**STOP condition:** If you cannot complete this block, do not modify the dependency array. Use `eslint-disable-next-line` instead.

## Cleanup Scope Rule (MANDATORY for lint/formatting/hygiene stories)

> **Note:** React-specific items below (hook dependency arrays) apply only to React/TS projects.

**Rule:** Cleanup stories may NOT introduce runtime behavior changes.

**Prohibited in cleanup scope:**
- Modifying React hook dependency arrays (React/TS only)
- Adding guards/refs that change execution flow
- Changing connection lifecycle or subscription timing
- Altering state update sequences

**If lint can only be satisfied via behavior change:**
1. STOP the cleanup story
2. Split into a separate story with explicit behavior scope
3. New story must include behavior contract + verification (test or smoke)

**Safe cleanup actions:**
- Removing unused imports/variables
- Renaming private identifiers
- Reformatting/indentation
- Adding type annotations
- Suppressing lint warnings with rationale

## Hot File Protocol (General)

Hot files include any of the following:
- Files over ~300 LOC that coordinate routing, state, or persistence
- Known churn magnets (question.component.ts, session.store.ts, app.routes.ts, content.service.ts, scripts/content-build.js, or anything the operator flags as "hot")
- Files touched in the last three prompts (detect via: git log --oneline --follow -3 -- <file>)
- SignalR / Multiplayer hot files listed above (always hot)

When a prompt touches a hot file, you MUST pick one of two paths:
1. **Analysis-first prompt**: map the file’s responsibilities, enumerate entry points, and list all impacted tests before any edits.
2. **Full-file replacement prompt**: replace the entire file in one shot (single edit) and run tests/build in the same prompt.

Piecemeal line edits on hot files are forbidden. If a prompt would require them, STOP and request the operator restructure the work.

## Pre-S2C Sync Check (Mandatory)

Before starting any S2C (merge) prompt, check if your branch is behind main:

~~~powershell
git fetch origin
git log HEAD..origin/main --oneline
~~~

If behind main: run an S2B sync step first (merge origin/main into branch), then run the applicable Green Gate (see [Green Gate — Stack-Aware Rules](#green-gate--stack-aware-rules)).

## S2C / Merge Checklist

Before closing any S2C (merge/closeout) prompt:

- [ ] Green Gate passes (stack-aware — see [Green Gate — Stack-Aware Rules](#green-gate--stack-aware-rules))
  - .NET: `msbuild` succeeds
  - JS (if applicable): `npm run build` + `npm run test` succeed
- [ ] Verify artifacts exist on main (file presence + key strings)
- [ ] Include Artifact Verification table in completion report

See `docs/protocol/closeout-artifact-verification-template.md`.

## GREEN Means Merge Now (Mandatory)

Any branch that reaches 🟢 GREEN must be merged (S2C) in the same session.

If you cannot merge immediately, add a **PARKED** row to `<DOCS_ROOT>/status/branches.md` including:
- Why parked
- Exact next prompt ID to resume
- Date/time parked

## Enforcement

- Missing Proof-of-Read → STOP
- Confidence < 95% → STOP and clarify (< 99% for runtime/code execution)
- Test/build failure → STOP and fix before proceeding
- Missing artifact verification in S2C → incomplete closeout

## Coverage Checklist for cross-cutting work (MANDATORY)

**Objective definition (a change is cross-cutting if ANY of):**
- Touches 2+ routes (count distinct route definitions in app.routes.ts; parameterized variants like q1/:id, q2/:id count separately if separate route configs), OR
- Changes a shared file imported by 3+ components, OR
- Modifies global CSS variables/shared copy dictionaries/typography standards

**Examples (non-exhaustive):**
- Palette CSS variables (--mg-primary, --mg-bg, etc.)
- Voice/tone adjustments (disclaimers, calm language, medical framing)
- Layout grids or spacing systems
- CTA button styles or labels
- Shared UI components (headers, footers, navigation)
- Monospace rendering or typography standards

For ANY cross-cutting change, your completion report MUST include a route coverage table using the actual project routes from `src/app/app.routes.ts`:

   Route        | Status
   -------------|-------------------------------
   /            | UPDATED or NO CHANGE REQUIRED (reason)
   /select      | UPDATED or NO CHANGE REQUIRED (reason)
   /q/:id*      | UPDATED or NO CHANGE REQUIRED (reason; mention q1/:id + q2/:id if touched)
   /review      | UPDATED or NO CHANGE REQUIRED (reason)
   /result      | UPDATED or NO CHANGE REQUIRED (reason)
   /store       | UPDATED or NO CHANGE REQUIRED (reason)

Status values must be exactly **UPDATED** or **NO CHANGE REQUIRED** with a short justification. Do not invent alternate labels. If you cannot complete this table, STOP and clarify scope.

**Old Pattern Search (MANDATORY STOP CONDITION):**
- Command used: paste the exact search/grep command you ran for the retired pattern.
- Total matches found: include the count and note which files were inspected.
- Remaining occurrences: list intentional exceptions or confirm 0. If you cannot show this search, STOP and request help before editing further.

## UX Proof requirement for user-visible changes (MANDATORY)

For any change affecting what users see (copy, layout, tone, labels, disclaimers, visualizations):

Your completion report MUST include:

**Proof-of-Experience Block (Before / After / Where):**
- What the user sees now: quote the current copy or describe the DOM
- What changed: show Before → After for the exact element(s)
- Routes displaying this change: map to the same coverage list (/ , /select, /q/:id, /review, /result, /store)
- Visual verification: screenshot description or DOM snippet confirming the new state

Without proof-of-experience, UX work is incomplete and prone to regression.

## Bundle warnings policy (STANDARD)

Bundle size warnings are informational during demos but must be resolved or tracked before pre-release:
- Warnings under +1 kB per component: acceptable; note briefly in the report.
- Warnings over +1 kB: document rationale and mitigation plan (ticket link or TODO) before shipping pre-release builds.
- Persistent growth trend (3+ commits): flag for optimization review and propose a fix path.

**Pre-release definition:** Any tagged release candidate (vX.X.X-rc1 or later). Demo branches and dev commits exempt. Bundle warnings do NOT block Green Gate by themselves, but you must either fix or track them before tagging a release candidate.

## Prompt Authoring — Test-Touch Rule

Any prompt that may touch `*.spec.ts` MUST include the Test-Touch Block from:
`docs/protocol/test-touch-block-template.md`

---

## Remote Target Preflight (MANDATORY for DEV/STAGE/PROD automation)

**Trigger:** Any prompt that hits DEV, STAGE, or PROD via Playwright, Selenium, or browser automation, OR any network-dependent CI gate.

**Required Checks (run in order before browser automation):**

1. DNS Resolution: `nslookup <hostname>` or `Resolve-DnsName <hostname>`
2. HTTP HEAD: `curl -I --max-time 30 http://<hostname>` or `Invoke-WebRequest -Uri "http://<hostname>" -Method Head`
3. HTTPS HEAD: `curl -I --max-time 30 https://<hostname>` or `Invoke-WebRequest -Uri "https://<hostname>" -Method Head`

**Stop Rule:** If any preflight check fails, STOP immediately and create a research artifact (R-###) or tech debt item (TD-###) documenting the failure before continuing. Do not attempt browser automation until preflight passes.

**Redaction Rule:** Never include secrets, credentials, or API keys in logs or output.

---

## Environmental Debug Timebox (MANDATORY)

When debugging environmental issues (network, TLS, proxy, machine-specific):

**Hard Limits:**
- Maximum 20 minutes OR 3 meaningful variations (config/URL/wait mode/machine/network)
- If the failure mode does not change after 3 variations: STOP

**Stop Procedure:**
1. Document the failure in a research artifact (R-###)
2. Create a tech debt item (TD-###) with clear Definition of Done
3. Park the work and pivot to next-highest ROI task (docs, CI gates, other stories)

**Rationale:** Environmental issues often require server-side, network, or machine changes that Copilot cannot fix. Persisting wastes time.

---

## Shell Discipline (MANDATORY)

**Default Shell:** PowerShell

**Rules:**
1. All prompts MUST use PowerShell syntax unless explicitly stated otherwise
2. Do NOT mix cmd.exe operators (e.g., `&&`) with PowerShell constructs (e.g., `$env:VAR`)
3. Use semicolons (`;`) to chain PowerShell commands, not `&&`
4. If cmd.exe is required, the prompt MUST explicitly state "cmd.exe" and use cmd.exe syntax throughout

**Example (correct):**
    Set-Location C:\repo; $env:VAR='value'; npm run test

**Example (wrong):**
    cd C:\repo && $env:VAR='value'; npm run test

---

## CI Gate Order Policy (MANDATORY)

Minimum CI gates in execution order:

1. **Build Gate (compile)** — MSBuild/dotnet build; most reliable; pure compile check
2. **Stage Health Gate (curl/HEAD)** — Simple network verification; no browser
3. **Automated Tests (unit/integration)** — When available; no external dependencies
4. **Browser E2E (optional)** — Most fragile; run last; requires stable preflight + health gates

**Policy:** Browser E2E should NOT be a required gate until:
- Remote Target Preflight passes consistently
- Stage Health Gate passes consistently
- TLS/SSL issues on target environment are resolved or explicitly bypassed

---

## Blocked Goal Procedure (MANDATORY)

When a goal is blocked by environmental, infrastructure, or external issues:

**Immediate Actions:**
1. Create a research artifact (R-###) documenting:
   - What was tried (commands, configs)
   - Evidence of failure (error messages, logs)
   - Root cause hypothesis
2. Create a tech debt item (TD-###) with:
   - Clear Definition of Done
   - Validation steps
   - Evidence links to R-###
3. Link both in ResearchIndex.md and tech-debt-and-future-work.md

**Pivot:** After documenting, pivot to the next-highest ROI work:
- CI gates (build, health check)
- Documentation updates
- Other stories in the backlog

**Anti-Pattern:** Do NOT continue attempting variations beyond the timebox. Do NOT leave blocked work undocumented.

---

## Waiting-for-Approver Workflow (MANDATORY)

**Purpose:** Define allowed work while PRs await Maintainer (or other approver) review.

### A) Allowed While Waiting

| Action | Allowed |
|--------|---------|
| Continue work on feature branches | ✅ YES |
| Docs-only PRs and commits | ✅ YES |
| Research and investigation | ✅ YES |
| Keep branches current (git merge origin/develop) | ✅ YES |
| Open new PRs for independent work | ✅ YES |

### B) Not Allowed

| Action | Forbidden |
|--------|-----------|
| Merge to develop without approval | ❌ NO |
| Stack dependent PRs (PR B depends on unmerged PR A) | ⚠️ AVOID |
| Assume PR will be merged "soon" | ❌ NO |

### C) PR Communication

**One Merge Packet comment per PR:**
- Add a single comment summarizing: what the PR does, test evidence, merge dependencies
- Do NOT spam multiple reminder comments
- If PR ages >48h, one polite ping is acceptable

### D) Branch Currency

**Keep branches current:** Before resuming work on a branch:

    git fetch origin
    git merge origin/develop

This reduces merge conflicts when approval comes.

### E) Update NEXT.md

If blocked on approvals, update NEXT.md:
- Status: BLOCKED
- Blocked By: PR #NN awaiting approval
