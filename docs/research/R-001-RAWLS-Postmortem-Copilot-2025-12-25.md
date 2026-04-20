# Copilot Postmortem — 2025-12-25

## 1. Scope + What Shipped
- Deliverable focus remained on Rawls docs hygiene plus recap of V2 UX work (veil reminder + context headers) already merged on main.
- Canonical protocol set stayed in docs/protocol/* while shared snapshot moved to _shared/v8 (commit dd9ac0f and e022d20 confirmed).
- Today’s concrete output: archived stray dated status reports and drafted this postmortem to capture workflow gaps.

## 2. Drift Incidents
- Command Lock violation 1: Read required files before printing Gate during DOCS-CLEANUP-AND-POSTMORTEM-SESSION-2025-12-25-001.
- Command Lock violation 2: Listed docs/status contents before Gate on DOCS-CLEANUP-AND-POSTMORTEM-SESSION-2025-12-25-002.
- Dirty worktree stop: Earlier in this release train we had to stash and clean a dirty tree (leftover review.component spec edits) before continuing, so calling that out prevents revisionist “always clean” thinking.
- Premature prompt churn: two restarts due to Gate violations slowed flow but prevented untracked edits.
- Hot-file refactor incident: We temporarily broke question.component.ts while poking a guard path and had to revert, so hot files stay under the analysis-first rule.

## 3. What Worked
- Strict STOP-on-error discipline prevented edits when Gate rules broke.
- Shared snapshot pointer already on v8, so canonical vs. snapshot roles stayed clear during cleanup.
- Git hygiene (status/log) before work ensured no hidden drift before archiving.

## 4. Root Causes
- Rushing into familiar files before emitting Gate caused the repeated Command Lock misses.
- Lack of explicit muscle-memory reminder about “no searches before Gate” when juggling multiple prompts back-to-back.
- Dated status docs pile up because there’s no rotation checklist specifying when to archive session artifacts.

## 5. Concrete Fixes (docs/process changes to propose later)
- docs/protocol/protocol-v7.md: Add a bold callout under Core Rule #1 reminding operators that tooling commands like list_dir count as “searches” before the Gate.
- docs/protocol/copilot-instructions-v7.md: Insert a short “Restart Procedure” subsection clarifying how to recover from aborted prompts without re-reading unnecessary files.
- docs/status/solution-report.md: Add an "Archive cadence" note so each status report ends with whether it should move into docs/status/archive/<date> after handoff.

## 6. Stop / Start / Keep
- Stop: Launching any command (even harmless inventory) before the Gate block prints.
- Start: Logging intended cleanup targets in the report before touching files so reviewers can trace why each move occurred.
- Keep: Running git status/log first to prove cleanliness prior to doc surgery.

## 7. Open Risks + Follow-ups
- Risk: Without a recurring task, docs/status will fill with dated artifacts again within a week.
- Follow-up: Schedule a lightweight cron (weekly or per-sprint) to sweep docs/status and push strays into timestamped archive folders.
