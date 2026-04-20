# KIT-ENDSESSION-HARDENING-VALIDATE-SYNTHETIC-001

| Field       | Value |
|-------------|-------|
| Date        | 2026-04-14 |
| PROMPT-ID   | KIT-ENDSESSION-HARDENING-VALIDATE-SYNTHETIC-001 |
| Area        | tools/end-session.ps1, protocol/protocol-v7.md, session-start-checklist.md |
| Status      | COMPLETE |
| Confidence  | 98% |
| Evidence    | Runtime output from 6 synthetic scenarios in disposable temp repo |

## Purpose

Runtime validation of the 5 hardening changes implemented in phase 3 (KIT-ENDSESSION-HARDENING-MINIMAL-IMPLEMENT-001), executed in a disposable synthetic git repo outside the kit working tree. No kit files were modified during this pass.

## Test Environment

- **Temp repo**: `C:\Users\schur\AppData\Local\Temp\vck-validate-20260414-093513`
- **Script under test**: `C:\Users\schur\workspaces\vibe-coding-kit\tools\end-session.ps1`
- **Invocation**: `& "<kit-path>\tools\end-session.ps1" -SkipFetch`
- **Known synthetic artifacts**: No remote configured → Remote Reality always WARN, git fetch DEGRADED. These are expected and do not affect the controls under test.

## Controls Under Test

1. **Stash age audit** (section 8d-age) — warns on >3d stale, >14d expired stash entries
2. **Branch age audit** (section 8d-branchage) — warns on >14d stale, >30d expired no-upstream branches
3. **Hardened exit condition** — exit 1 when `$wrStatus -eq 'BLOCKED'` (not just `$hasTracked`)
4. **WIP storage preference messaging** — "Commit to a branch (preferred) or stash for short-lived interruptions only"
5. **Cleanup Closure Rule** in protocol-v7.md (not runtime-testable, verified by grep in phase 3)

## Scenario Results

| Scenario | Setup | Expected WR | Actual WR | Expected Exit | Actual Exit | Key Output | Verdict |
|----------|-------|-------------|-----------|---------------|-------------|------------|---------|
| **A** | Clean baseline (no branches, no stashes) | PASS | PASS | 0 | 0 | No age warnings | **PASS** |
| **B** | 1 branch `stale-test-20d` with 20-day-old commit, no upstream | WARN | WARN | 0 | 0 | "branch stale-test-20d : 20d since last commit — STALE (>14d, no upstream)" | **PASS** |
| **C** | +1 branch `stale-test-45d` with 45-day-old commit, no upstream | WARN | WARN | 0 | 0 | "branch stale-test-45d : 45d since last commit — EXPIRED (>30d, no upstream)" — clear STALE vs EXPIRED distinction | **PASS** |
| **D** | 6 non-merged branches (>5 cap) | BLOCKED | BLOCKED | 1 | 1 | "Non-merged branches (6) exceed cap (5) — BLOCKED" + age warnings still shown | **PASS** |
| **E** | 2 fresh stashes (same-day) | PASS | PASS | 0 | 0 | No age warnings, stashes listed correctly | **PASS** |
| **F** | 6 stashes (>4 cap) | BLOCKED | BLOCKED | 1 | 1 | "Stash count (6) exceeds cap (4) — BLOCKED" | **PASS** |

**Result: 6/6 scenarios PASS**

## Control Coverage Matrix

| Control | Exercised By | Verified? |
|---------|-------------|-----------|
| Stash age audit (>3d / >14d) | Not directly testable (stash timestamps not forgeable via env vars) — code path inspected in phase 3 grep proof | PARTIAL (code review only) |
| Branch age audit (>14d STALE) | Scenario B | YES |
| Branch age audit (>30d EXPIRED) | Scenario C | YES |
| Hardened exit on WR=BLOCKED | Scenarios D, F | YES |
| Branch count cap → BLOCKED | Scenario D | YES |
| Stash count cap → BLOCKED | Scenario F | YES |
| WIP storage preference message | Observed in Scenario D output context | YES |
| Cleanup Closure Rule (protocol text) | Not runtime-testable — grep-verified in phase 3 | N/A |

## Limitations

1. **Stash age timestamps** cannot be backdated via environment variables (git stash uses internal reflog timestamps). The stash age audit code path was verified by static inspection in phase 3 but not exercised at runtime.
2. **Remote Reality** always shows WARN in the synthetic repo (no remote). This is irrelevant to the controls under test.
3. **Tool/Auth gate** shows git fetch DEGRADED due to -SkipFetch. Expected and irrelevant.

## Bugs Found

**None.** All 6 scenarios produced expected behavior.

## Confidence Statement

- **Confidence**: 98%
- **Basis**: 6/6 runtime scenarios pass, all BLOCKED→exit-1 paths confirmed, age labeling (STALE/EXPIRED) correct. Stash age audit is the only un-exercised runtime path (code-reviewed only).
- **Ready to proceed**: YES — changes are validated for commit.
