# Verification Mode — Rawls Game

## Purpose
Verification Mode defines read-only audit prompts that confirm repo state, file contents, counts, or compliance WITHOUT making changes. This prevents audits from drifting into fixes.

## When to Use
Use Verification Mode when the goal is to gather evidence, not to make changes:

- "Review report: confirm which files were touched in last commit"
- "Audit file: check if protocol-v7.md includes Work state requirement"
- "Confirm counts: how many test files exist in src/app/features/"
- "Verify compliance: does session.store.ts follow the immutability pattern?"

Do NOT use Verification Mode if the goal includes fixing, implementing, or editing anything.

## Allowed Commands (Read-Only)

Git commands:
- git status / git status -sb / git status --porcelain
- git log / git log --oneline / git show
- git diff --name-only / git diff HEAD~1
- git branch

File reading:
- read_file tool
- grep_search / semantic_search
- list_dir

Analysis:
- Counting files/lines/occurrences
- Extracting property chains or schema details
- Recording examples

## Forbidden Actions

NO file edits of any kind:
- replace_string_in_file
- create_file
- multi_replace_string_in_file
- edit_notebook_file

NO executable commands:
- npm run test / npm run build / npm start
- node / ts-node
- git commit / git merge / git push

NO changes to repo state:
- git add / git reset / git checkout / git stash

## Required Output Format

Every Verification Mode prompt must produce an "Evidence Map" containing:

1. Files inspected (paths + line ranges)
2. Commands run (exact commands with results)
3. Counts (if applicable: number of files, lines, occurrences)
4. Examples (one representative item per category)
5. Compliance verdict (YES/NO/PARTIAL with justification)

## STOP Boundaries

If a discrepancy is found during verification:
- STOP immediately
- Report the discrepancy with evidence
- Propose a separate fix prompt (do NOT fix in the same prompt)

Example: "Verification found protocol-v7.md missing Work state requirement. STOP. Propose separate prompt: 'Add Work state line to protocol-v7 Prompt Review Gate.'"

## Examples

### Good Verification Mode Prompt

    PROMPT-ID: VERIFY-PROTOCOL-V7-WORK-STATE-REQUIREMENT-001
    
    GOAL: Confirm protocol-v7.md requires "Work state:" in Prompt Review Gate
    
    SCOPE GUARDRAILS: Read-only audit. NO edits.
    
    TASKS:
    1) Read docs/vibe-coding/protocol/protocol-v7.md lines 1-30
    2) Search for "Work state" in Prompt Review Gate section
    3) Output Evidence Map:
       - File: protocol-v7.md
       - Line range containing "Work state"
       - Exact quote
       - Verdict: YES (requirement exists) / NO (missing)
    
    If missing: STOP and propose fix prompt separately.

### Bad Verification Mode Prompt (violates read-only rule)

    PROMPT-ID: VERIFY-AND-FIX-PROTOCOL-V7-001  ❌ WRONG
    
    GOAL: Confirm protocol-v7.md has Work state requirement; if missing, add it
    
    ❌ This is NOT Verification Mode because it includes edits ("if missing, add it").
    ❌ Split into two prompts: (1) verify, (2) fix (if needed).

## Integration with Protocol v7

Verification Mode prompts still require:
- PROMPT-ID
- Prompt Review Gate (What / Best next step / Confidence / Work state)
- Proof-of-Read
- Work state: READY (verification prompts don't modify repo, so always start READY)

Verification Mode prompts do NOT require:
- Green Gate (no tests/build since no code changes)
- Commits (no changes to commit)
