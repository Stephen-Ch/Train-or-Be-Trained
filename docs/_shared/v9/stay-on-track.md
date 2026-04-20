# Stay on Track — Rawls Game

## Purpose
Keep AI focused and prevent scope creep.

## Before Every Response
Did I print the Prompt Review Gate before doing anything? If not, STOP.
Ask yourself:
1. Did I complete Proof-of-Read?
2. Does my plan match the prompt's GOAL exactly?
3. Am I staying within SCOPE GUARDRAILS?
4. Is my confidence HIGH?
5. Am I waiting for the previous Copilot report to be pasted/acknowledged before pushing for a new prompt?
6. If something looks like a bug, have I confirmed the production content counts/state before “fixing” it?

## Red Flags (STOP if any)
- [ ] Adding features not in the prompt
- [ ] Changing files outside scope
- [ ] Skipping Proof-of-Read
- [ ] Confidence is MEDIUM or LOW
- [ ] Tests/build not run after code changes
- [ ] Making assumptions instead of asking

## Recovery
If you went off track:
1. STOP immediately
2. State what went wrong
3. Propose correction
4. Wait for operator approval

## Scope Boundaries
- **DOCS ONLY** prompts: Do NOT touch app code
- **CODE** prompts: Do NOT add dependencies without approval
- **REFACTOR** prompts: Keep behavior identical
- **S1A sanity check**: If S1A tests pass, STOP — test isn't asserting behavior or you implemented

## Prompt Compliance Checklist
- [ ] Read all required docs
- [ ] Output Proof-of-Read
- [ ] Output Prompt Review Gate
- [ ] Execute only what's in TASKS
- [ ] Run Green Gate
- [ ] Summarize changes
