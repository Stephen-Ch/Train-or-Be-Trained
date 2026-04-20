# Critical Transition Checklist

## Purpose

- Catches predictable, high-cost mistakes at a few critical transition moments
- Focused on omissions that cause messy recovery work (wrong context, wrong layer, accidental staging)
- **Not a per-prompt gate** — normal implementation flow does not touch this checklist
- Use it when switching contexts, updating the kit, staging broad changes, or handing off

---

## When to Use

Use this checklist only at these transition moments:

1. **Session start** — before first real work
2. **Before subtree / kit update / adoption** — pulling upstream kit changes into a consumer repo
3. **Before broad staging or commit** — especially docs-engineering or multi-directory scope
4. **Before adding or moving workspace-visible Copilot instructions or startup docs**
5. **Actual handoff / stop-work closeout**

If you are doing normal prompt-by-prompt implementation work, skip this entirely.

---

## Session-Start Execution Check

- [ ] Am I in the correct active workspace root? (consumer repo vs kit repo)
- [ ] Does the instruction mean "run a terminal command" or "read/review manually"?
- [ ] Should session-start run with update, or is `-SkipUpdate` safer right now?
- [ ] After running: did kit update / forGPT sync / consumer audit all report clean results?

---

## Kit Update / Subtree Preflight

- [ ] Is the working tree clean? (`git status` — no uncommitted changes)
- [ ] Are there any local edits inside `kit-head` / the subtree path?
- [ ] If local changes exist: are they accidental drift, intentional upstream kit work, or consumer-specific content that belongs outside the subtree?
- [ ] Plan to **abort on conflict** rather than improvise a resolution mid-merge

---

## Consumer Portability / Ownership Check

- [ ] Does this file belong in consumer-owned docs or in kit-head?
- [ ] Is the file workspace-relative visible to the tool that needs it?
- [ ] Can Copilot actually see the file from the active workspace root?
- [ ] Am I solving the problem at the right layer? (kit vs consumer vs overlay)

---

## Broad Staging / Commit Check

- [ ] Am I accidentally sweeping kit-head files into a consumer commit (or vice versa)?
- [ ] Have I inspected the exact changed-file list before running a broad `git add`?
- [ ] Should generated snapshots / forGPT / kit subtree / consumer docs be in separate commits?
- [ ] Does `git diff --cached` match my intent?

---

## Closeout / Handoff Check

- [ ] Is NEXT.md current with the actual next step?
- [ ] PAUSE.md updated only if actually stopping work (not needed mid-session)
- [ ] forGPT synced — this is a checkpoint
- [ ] No unresolved merge or conflict state left behind

---

## Update Rule

- Only add items when a real failure class has been observed
- Keep the checklist short — if it grows past scannable, trim it
- Remove or revise items that become noise
- This checklist is for critical omissions, not general diligence
