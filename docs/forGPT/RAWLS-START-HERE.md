  # Start Here — Using GPT/Copilot with Rawls Game

This repo uses the Blackjack-refined workflow structure and enforcement rules.

**How we work:** See the [Stephen ↔ ChatGPT ↔ Copilot workflow](docs/project/AI-WORKFLOW.md) for the prompt-only collaboration loop.

**Workflow source of truth lives under `docs/vibe-coding`. Start every session by opening:**
1. [docs/vibe-coding/README.md](docs/vibe-coding/README.md)
2. [docs/vibe-coding/protocol/PROTOCOL-INDEX.md](docs/vibe-coding/protocol/PROTOCOL-INDEX.md)
3. [docs/vibe-coding/protocol/copilot-instructions-v7.md](docs/vibe-coding/protocol/copilot-instructions-v7.md)

## Start-of-Session Vision Check (MANDATORY)

> **Automated path (preferred):** Run `docs/vibe-coding/tools/run-vibe.ps1 -Tool session-start`.
> Fallback (if run-vibe.ps1 is unavailable): `docs/vibe-coding/tools/session-start.ps1`.
> Either command chains: kit subtree pull → forGPT sync → consumer doc-audit → 5-line audit print. The manual steps below are the fallback if both scripts are unavailable.

**Session Sequencing (Required Order):**
Every prompt in the session follows this exact order:
1. **Prompt Review Gate** (4 lines) — printed BEFORE any reads or commands
2. **Proof-of-Read** — printed AFTER reading required files
3. **Start-of-Session Doc Audit** — run ONCE per session, AFTER Proof-of-Read, printed in response
4. **STOP if Doc Audit FAIL** — enter Alignment Mode, remediate before work
5. **If Doc Audit PASS** — proceed to Story work

**First-Prompt Rule:** If this is the first prompt of the session and Doc Audit has not been printed yet, you MUST run the Doc Audit now (after Proof-of-Read) before doing any work.

**Doc Audit Requirements:**
First, verify the vibe-coding bundle and required artifacts:
1. `docs/vibe-coding/VIBE-CODING.VERSION.md` (version + effective date)
2. `docs/vibe-coding/protocol/required-artifacts.md` (mandatory project docs list)

Then read the Control Deck:
3. `docs/project/VISION.md` (project purpose, north star, user promise, non-goals)
4. `docs/project/EPICS.md` (epic list with IDs + descriptions)
5. `docs/project/NEXT.md` (ACTIVE STORY ID, NEXT STEP, DoD, scope guardrails, "done when")

Output (5 lines, printed ONCE per session or when Control Deck changes):
- Active Story ID: <ID>
- Next Step: <sentence from NEXT.md>
- DoD: <1 sentence>
- Population Gate: PASS/FAIL (from required-artifacts.md Population rules; if FAIL list placeholder markers found or missing required fields)
- 3-Party Approval Gate status: Stephen/ChatGPT/Copilot [checked/unchecked for each] (see [alignment-mode.md](docs/vibe-coding/protocol/alignment-mode.md) → 3-Party Approval Gate (Canonical) for checklist)

**Doc Audit Rerun Triggers:** MUST be rerun if during the same session any of these change:
- docs/project/VISION.md, EPICS.md, NEXT.md
- docs/vibe-coding/protocol/required-artifacts.md
- or any new gate/required artifact file
If rerun is required and not done, STOP before any work prompts.

**Rerun Trigger Detection (Required Command):**
After each commit (or before the next prompt review), run:

  git diff --name-only HEAD~1..HEAD

**EXCEPTION (initial commit / detached HEAD):** If HEAD~1 doesn't exist (command fails), treat as rerun required and run Doc Audit.

If output matches ANY of these paths (case-sensitive):
- Any file under docs/project/ (e.g., docs/project/VISION.md, docs/project/EPICS.md, docs/project/NEXT.md)
- OR docs/vibe-coding/protocol/required-artifacts.md
- OR docs/project/RAWLS-START-HERE.md

Then:
- STOP work immediately
- Rerun Doc Audit in the same response (after Proof-of-Read)
- If Doc Audit FAIL, enter Alignment Mode before resuming work
- If Doc Audit PASS, proceed

If no match, proceed without rerunning Doc Audit.

**Dual-purpose note:** This command serves two purposes: (1) detecting Doc Audit rerun triggers, (2) verifying NEXT.md updates after step completion (see NEXT.md Freshness Rule below).

If any of these files are missing: create placeholders in `docs/project/` (docs-only) using templates from `docs/project/*.template.md` and STOP after writing the missing docs. No code work until VISION/EPICS/NEXT exist.

**Population Gate Check (MANDATORY):**
After confirming files exist, scan for placeholders using the canonical scan command from [required-artifacts.md](docs/vibe-coding/protocol/required-artifacts.md) "Control Deck Population Gate" section and verify minimum content thresholds.

**Population Gate uses objective word-count thresholds:** VISION sections require >= 25 words, EPICS descriptions >= 15 words, NEXT STEP >= 10 words, Done When items >= 6 words each. Date fields must match YYYY-MM-DD format (see [required-artifacts.md](docs/vibe-coding/protocol/required-artifacts.md) for regex, range validation, and PASS/FAIL examples).

**If Population Gate FAIL: STOP.** Do not proceed to coding prompts; enter Alignment Mode (see [alignment-mode.md](docs/vibe-coding/protocol/alignment-mode.md) "Populate Control Deck" section). Remediate placeholders before resuming coding.

If NEXT.md is missing/unclear/outdated → invoke Alignment Mode (see [alignment-mode.md](docs/vibe-coding/protocol/alignment-mode.md) → 3-Party Approval Gate (Canonical)) and STOP coding. Ask Stephen questions until VISION/EPICS/NEXT exist and all three parties have approved.

## NEXT.md Freshness Rule (MANDATORY)

**Rule:** After completing the CURRENT NEXT STEP (shipping a commit that finishes the work described in NEXT.md), you MUST run a closeout action that updates docs/project/NEXT.md before starting any new work.

**Enforceable Detection (Required After Each Completion):**
After each completion/ship report where the NEXT STEP is finished, check the last commit for NEXT.md changes:

  git diff --name-only HEAD~1..HEAD

- If the completed step required shipping/closing (work is DONE per DoD) AND docs/project/NEXT.md is NOT in the diff output → STOP immediately
- Propose the smallest closeout prompt to update NEXT.md (mark current step COMPLETE, advance to next story/step, update date)
- Do NOT start new work until NEXT.md is updated

**Separate from Population Gate:** This rule is about plan freshness (preventing work on stale stories), not content quality. Population Gate checks placeholder markers and minimum thresholds; Freshness Rule checks temporal alignment (is the plan still current after completing the step).

**When to Skip:** If the commit is a docs-only protocol maintenance change NOT tied to ACTIVE STORY completion, the Freshness check may be deferred. All other completions require NEXT.md update in same commit or immediate closeout.

## Required Reading (EVERY PROMPT)
Before doing anything (even docs work), the AI MUST read:
1. docs/vibe-coding/README.md (source of truth)
2. docs/vibe-coding/protocol/PROTOCOL-INDEX.md (protocol navigational index)
3. docs/vibe-coding/protocol/copilot-instructions-v7.md (source of truth)
4. docs/vibe-coding/protocol/stay-on-track.md (source of truth)
5. docs/vibe-coding/protocol/working-agreement-v1.md
6. docs/status/branches.md
7. docs/testing/test-catalog.md (required when touching tests)

Legacy copies under docs/protocol exist for backward compatibility only; do not treat them as authoritative.

## Proof-of-Read (EVERY PROMPT)
Every response MUST start with Proof-of-Read:
- file path
- 1–2 line quote
- "Applying: <rule name>"

If Proof-of-Read is missing: STOP.

## Green Gate (Rawls Game)
Required gates for code prompts:
- npm run test
- npm run build

If content pipeline inputs were touched (content/*, scripts/content-*, src/assets/content/rawls-values.generated.json):
- npm run content:lint
- npm run content:export-app
- then npm run test + npm run build

## What to upload to a new AI session (priority)

**Preferred method:** Regenerate the forGPT packet and upload the entire folder:

    cd <project-root>
    .\docs\vibe-coding\tools\sync-forgpt.ps1
    # Then upload docs/forGPT/ to your AI session

**Manual upload list** (if forGPT sync is unavailable):
- docs/project/RAWLS-START-HERE.md
- docs/vibe-coding/README.md
- docs/vibe-coding/protocol/PROTOCOL-INDEX.md
- docs/vibe-coding/protocol/copilot-instructions-v7.md
- docs/vibe-coding/protocol/stay-on-track.md
- docs/vibe-coding/protocol/working-agreement-v1.md
- docs/project/VISION.md
- docs/project/EPICS.md
- docs/project/NEXT.md
- docs/research/ResearchIndex.md
- docs/status/solution-report.md
- docs/status/tech-debt-and-future-work.md
- docs/status/branches.md
- docs/project/CONTENT-RULES.md

## Canonical locations

- **Research:** docs/research/ + [ResearchIndex.md](docs/research/ResearchIndex.md)
- **forGPT packet:** docs/forGPT/ (generated — run sync before uploading)
- **Protocol source of truth:** docs/vibe-coding/ (git subtree from Stephen-Ch/vibe-coding-kit)
- **Session start command:** `docs/vibe-coding/tools/run-vibe.ps1 -Tool session-start`
- **Freshness rule:** Always re-run `sync-forgpt.ps1` immediately before uploading the packet

## Prompt format enforcement
All operator prompts MUST be a single fenced code block and MUST end with:
# END PROMPT
