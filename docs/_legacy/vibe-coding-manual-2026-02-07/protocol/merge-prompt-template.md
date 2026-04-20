# Merge Prompt Template — Rawls Game

## Purpose
Define the canonical fast-forward-only merge workflow to ensure clean git history and reproducible merge procedures.

## Prerequisites
- Work state: COMPLETE (feature branch committed, tests GREEN, build GREEN)
- Feature branch exists and is up-to-date with work
- No merge conflicts expected

## Canonical Merge Sequence

### Step 1: Verify Feature Branch State
On feature branch:

    git status --porcelain
    # Must be clean (or show only intended uncommitted docs if prompt allows)
    
    git log --oneline -1
    # Record commit hash
    
    npm run test
    # Must be GREEN
    
    npm run build
    # Must be GREEN (classify warnings: NEW vs PRE-EXISTING)

If any gate fails, STOP. Fix on feature branch before proceeding.

### Step 2: Commit Remaining Work (if needed)
If tree shows uncommitted changes that are in-scope:

    git add <files>
    git commit -m "<message>"
    git log --oneline -1
    # Record new commit hash

If tree shows unexpected changes, STOP and report.

### Step 3: Switch to Main
    git checkout main
    git pull --ff-only
    # Must succeed (no merge required)
    # Confirms main synced with origin/main

If pull fails or requires merge, STOP. Resolve conflict separately.

### Step 4: Fast-Forward Merge
    git merge --ff-only feature/<branch-name>

STOP condition: If merge fails with "fatal: Not possible to fast-forward", report:
- Feature branch may not be rebased on latest main
- Merge history diverged
- Propose rebase or investigate

### Step 5: Verify on Main
Run gates again on main:

    npm run test
    # Must be GREEN (same test count as feature branch)
    
    npm run build
    # Must be GREEN (same bundle size and warnings as feature branch)

If results differ between main and feature branch, STOP and investigate.

### Step 6: Push to Origin
    git push
    # Pushes main to origin/main

### Step 7: Final Verification
    git status -sb
    # Must show: ## main...origin/main (synced, no ahead/behind)
    
    git status --porcelain
    # Must be clean

If tree not clean or branch not synced, STOP and report.

## Required Report Fields

After successful merge, report must include:

### 1. Branch Context
- Feature branch name
- Starting commit (main before merge)
- Ending commit (feature branch HEAD)
- Ahead/behind status before pull

### 2. Merge Result
- Fast-forward confirmation (commit range)
- Files changed (from git diff --stat if helpful)

### 3. Test Results
- Feature branch: test count + time
- Main branch: test count + time (must match feature)

### 4. Build Results
- Feature branch: bundle size
- Main branch: bundle size (must match feature)

### 5. Warnings Classification
For each warning, state: NEW or PRE-EXISTING

Example:
- Bundle budget exceeded (78.92 kB) → PRE-EXISTING
- html2canvas ESM warning → PRE-EXISTING

### 6. Push Confirmation
- Push output (objects sent, delta)
- Final git status -sb (confirming sync)

### 7. Commit Hash
- Final commit hash on main after merge

## STOP Conditions

STOP immediately if:
- Feature branch tests/build fail
- Main branch tests/build fail or differ from feature
- git pull --ff-only fails
- git merge --ff-only fails
- git push fails
- Tree dirty after push
- Branch not synced after push
- NEW warnings appear (not present on feature branch)

## Example Merge Prompt

    PROMPT-ID: UX-FEATURE-X-M1-MERGE-TO-MAIN
    
    GOAL: Merge feature/UX-feature-X to main using canonical ff-only workflow.
    
    SCOPE GUARDRAILS:
    - Merge only (no additional implementation)
    - Report required fields per merge-prompt-template.md
    
    TASKS:
    1. Verify feature branch state (clean, tests GREEN, build GREEN)
    2. Checkout main, pull --ff-only
    3. Merge --ff-only feature/UX-feature-X
    4. Verify on main (tests + build match feature)
    5. Push to origin/main
    6. Report: branch context, merge result, tests, build, warnings, push confirmation, commit hash
    
    # END PROMPT

## Integration with Prompt Lifecycle

Merge prompts expect Work state = COMPLETE:
- Feature branch committed
- Tests GREEN
- Build GREEN
- Ready for ff-only merge

If Work state != COMPLETE, merge prompt should STOP.
