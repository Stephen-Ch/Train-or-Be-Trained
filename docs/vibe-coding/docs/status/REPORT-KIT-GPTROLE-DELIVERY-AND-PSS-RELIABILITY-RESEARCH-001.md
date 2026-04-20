# Research Report: GPT-ROLE Delivery and PROJECT-STATE-SUMMARY Reliability

**PROMPT-ID:** KIT-GPTROLE-DELIVERY-AND-STATE-SUMMARY-RELIABILITY-RESEARCH-001  
**Date:** 2026-04-18  
**Mode:** RESEARCH-ONLY  
**Repo:** vibe-coding-kit  
**Status:** COMPLETE — no edits made

---

## 1. GPT-ROLE DELIVERY OPTIONS

### Option A: Consumer-owned source file + manifest entry

Consumer copies the kit template to a consumer-owned path (e.g. `project/GPT-ROLE.md`), adds a manifest entry `{ "src": "project/GPT-ROLE.md", "dest": "GPT-ROLE.md", "tier": "core" }`. `sync-forgpt.ps1` copies it into `forGPT/` like any other file.

| Criterion | Assessment |
|-----------|------------|
| Octopus boundary | **Clean.** Kit provides template, consumer owns the copy. Same model as overlays. |
| Portability | **High.** Works in any consumer repo — just copy template, add manifest entry. |
| Maintenance burden | **Low.** Consumer updates their copy when kit template changes (same as overlays). |
| Stale customization risk | **Medium.** If the kit template evolves, consumer must manually re-sync. But this is the same pattern overlays already use — no new risk category. |
| Local project context | **Yes.** Consumer can append project-specific context to their copy. |
| Avoids repo-by-repo improvisation | **Yes** — if the kit documents this as the standard path in subtree-playbook or manifest guidance. |

### Option B: Kit-owned generated copy during session-start

`session-start.ps1` reads the kit template from `<subtreePrefix>/templates/gpt-role-template.md` and writes it directly to `<DOCS_ROOT>/forGPT/GPT-ROLE.md`.

| Criterion | Assessment |
|-----------|------------|
| Octopus boundary | **Violation.** Kit code generates a consumer artifact without consumer ownership. Consumer cannot customize without the next session-start overwriting it. |
| Portability | **High.** Automatic — no consumer action. |
| Maintenance burden | **Low** for consumer. But customization is impossible. |
| Stale customization risk | **N/A** — no customization possible, which is a drawback. |
| Local project context | **No.** Template is generic. Consumer can't add project-specific role notes. |
| Avoids repo-by-repo improvisation | **Yes**, but at the cost of zero project customization. |

### Option C: sync-forgpt special-case copy

`sync-forgpt.ps1` hard-codes copying the kit template into `forGPT/` outside the manifest.

| Criterion | Assessment |
|-----------|------------|
| Octopus boundary | **Violation.** Bypasses the manifest — the manifest is the single source of truth for what goes into `forGPT/`. Adding a backdoor undermines the manifest contract. |
| Portability | **High** but fragile. |
| Maintenance burden | **Higher.** Two delivery mechanisms in one script. |
| Stale customization risk | **Same as B** — overwrites on every sync. |
| Local project context | **No.** |
| Avoids repo-by-repo improvisation | **Partially** — but introduces a second delivery path, which is its own form of complexity. |

### Option D: Kit template auto-seed + manifest entry

`session-start.ps1` checks if the consumer has `project/GPT-ROLE.md`. If not, copies the kit template there **once** (seeding). Consumer adds the manifest entry. Never overwrites.

| Criterion | Assessment |
|-----------|------------|
| Octopus boundary | **Acceptable** — seed-once is a bootstrap pattern, not ongoing vendor override. But mixes tool responsibility (file creation) with consumer ownership. |
| Portability | **Medium.** Requires consumer to still add the manifest entry manually. |
| Maintenance burden | **Medium.** session-start gains file-creation logic. |
| Stale customization risk | **Low.** Consumer owns the file after seeding. |
| Avoids improvisation | **Partial.** Still requires manual manifest wiring. |

---

## 2. RECOMMENDED GPT-ROLE DELIVERY MODEL

**Recommended: Option A — Consumer-owned source file + manifest entry.**

### Why it is best

1. **Identical to the overlay model** already proven across all consumer repos. No new pattern to learn, document, or debug.
2. **Consumer can customize.** The research report (REPORT-KIT-FORGPT-SELF-SUFFICIENT-PROJECT-GPT-RESEARCH-001) explicitly says: *"The kit provides the template. Each consumer fills in project context."* Option A is the only option that supports this.
3. **Manifest remains single source of truth** for forGPT packet contents. No backdoors, no special-case code paths.
4. **Zero tool changes required.** The delivery infrastructure already exists — `sync-forgpt.ps1` + `forgpt.manifest.json`. Only documentation and consumer setup are needed.
5. **Portable.** Documented once in `subtree-playbook.md` or a manifest guidance section, applied identically in every consumer.

### What changes in the kit

| File | Change |
|------|--------|
| `portability/subtree-playbook.md` or new `standards/forgpt-packet-standard.md` | Add standard manifest guidance: GPT-ROLE.md entry with recommended `src` path |
| `templates/gpt-role-template.md` | **No change** — already exists and is complete |

### What consumers need

| Step | Consumer action |
|------|----------------|
| 1 | Copy `vibe-coding/templates/gpt-role-template.md` → `<DOCS_ROOT>/project/GPT-ROLE.md` (or `<DOCS_ROOT>/overlays/GPT-ROLE.md` — consumer's choice) |
| 2 | Optionally append project-specific role notes |
| 3 | Add manifest entry: `{ "src": "project/GPT-ROLE.md", "dest": "GPT-ROLE.md", "tier": "core" }` |
| 4 | Run session-start — sync-forgpt picks it up automatically |

### Can rollout be standardized without per-repo custom invention?

**Yes.** The only per-repo steps are copy + manifest entry, which is the same process used for overlays. The kit documents the standard path; consumers follow it.

---

## 3. PROJECT-STATE-SUMMARY RELIABILITY REVIEW

### Exact conditions required for generation

From `tools/session-start.ps1` lines 740–870:

```
Guard 1: Test-Path $pssForGptDir   →  $docsRoot/forGPT/ must exist
Guard 2: -not $WhatIf              →  WhatIf mode skips generation
Guard 3: try/catch around entire    →  any exception → FAILED status, yellow warning
          generation block
```

If Guard 1 passes and WhatIf is false, generation **always attempts**. There are no other explicit guards.

### Variables consumed inside the try block

| Variable | Source | What happens if absent |
|----------|--------|----------------------|
| `$nextCandidate` | Set at line 449 unconditionally | If file doesn't exist, `$pssActiveStory` and `$pssNextStep` default to `"(see NEXT.md)"` — safe |
| `$pausePath` | Set at line 473, may be `$null` | If null, blockers section says "None detected" — safe |
| `$nextmdStalenessAge` | Set at line 518, default `-1` | Used in string interpolation — safe |
| `$nextmdStalenessClassification` | Set at line 517, default `"N/A"` | Safe |
| `$auditResult` | Set at line 391 | Always has a value — safe |
| `$driftStatus`, `$stalenessStatus`, `$dqStatus`, `$taStatus` | All set with defaults before PSS section | Safe |
| `$prCount`, `$prList` | Set at line ~660 | Default `"UNKNOWN"` / `"gh CLI not available"` — safe |
| `$branch`, `$treeState` | Set at line ~72 | Always set — safe |

**Verdict: No variable-absence path can prevent generation.** If `forGPT/` exists and WhatIf is off, the file will be written — unless an exception occurs.

### Silent failure analysis

The catch block at lines 866–869:

```powershell
} catch {
    $pssStatus = "FAILED"
    Write-Host "WARNING: PROJECT-STATE-SUMMARY.md generation failed: $_" -ForegroundColor Yellow
}
```

**This is not silent** — it prints a yellow warning AND sets `$pssStatus = "FAILED"`, which appears in the audit block as `ProjectStateSummary=FAILED`. However:

1. **Yellow warnings are easy to miss** in a long session-start output (~80+ lines). A user or AI scanning for PASS/FAIL verdicts could overlook it.
2. **The warning is not a hard stop** — session-start continues. No gate blocks on PSS failure.
3. **The audit block does report it** — `ProjectStateSummary=GENERATED` or `ProjectStateSummary=FAILED` or `ProjectStateSummary=SKIP` appears on its own line. This is the most reliable check.

### Why the earlier confusion occurred

Based on evidence:

1. **The user's first run happened before the subtree pull landed the PSS code.** The subtree merge was at `73262b1` (2026-04-18 12:51). The user reported running session-start and not seeing the file. Most likely: they ran session-start *before* 12:51, using the old `session-start.ps1` that lacked the PSS generation code entirely.
2. **Initial research incorrectly concluded "session-start hasn't been run since the code was added"** — this was technically correct but misleading. The confusion was about *when* the code arrived, not whether the tool worked.
3. **When session-start was run with the updated code (with `-SkipUpdate -Force`), it generated correctly on the first attempt.** No silent failure occurred.
4. **There is no evidence of a try/catch swallowing a failure.** The `ProjectStateSummary=GENERATED` in the audit block confirms clean execution.

**Root cause of confusion: timing of subtree pull vs. session-start execution, not a tool defect.**

---

## 4. RELIABILITY HARDENING RECOMMENDATIONS

The generation logic itself is sound. Three small hardening steps would prevent future confusion:

### 4a. Escalate PSS failure to a visible warning line in the audit block (SMALL)

Currently `ProjectStateSummary=FAILED` appears as plain text. Change to:

```
ProjectStateSummary=FAILED  ← WARNING: see above for error details
```

Only when status is FAILED. ~2 lines of code.

### 4b. Add file-existence confirmation after generation (SMALL)

After `Set-Content`, verify the file was actually written:

```powershell
if (Test-Path $pssPath) {
    $pssStatus = "GENERATED"
    Write-Host "Generated: ..." -ForegroundColor Green
} else {
    $pssStatus = "FAILED(write)"
    Write-Host "WARNING: ..." -ForegroundColor Yellow
}
```

~5 lines. Guards against edge cases like permissions or disk-full.

### 4c. Log PSS skip reason when forGPT dir is missing (TINY)

Currently, if `forGPT/` doesn't exist, `$pssStatus` stays `"SKIP"` with no explanation. Add:

```powershell
} else {
    Write-Host "ProjectStateSummary: SKIP (no forGPT directory)" -ForegroundColor DarkGray
}
```

~2 lines. Makes the skip visible.

### NOT recommended

- No new gates. PSS is informational, not a safety artifact.
- No checksums or hash validation. Overkill for a generated snapshot.
- No retry logic. If it fails, the user will see `FAILED` and can re-run.

---

## 5. TESTING STRATEGY

### What to test

`PROJECT-STATE-SUMMARY.md` is generated into `<DOCS_ROOT>/forGPT/` when session-start runs in a consumer repo with a `forGPT/` directory.

### Where to test

Any consumer repo with the kit subtree and an existing `forGPT/` directory. DailyInventoryPWA is the current validation target.

### Evidence of success

1. `docs/forGPT/PROJECT-STATE-SUMMARY.md` exists on disk after session-start
2. Audit block shows `ProjectStateSummary=GENERATED`
3. File content includes `Generated:` timestamp matching today's date

### Evidence of failure

1. File does not exist after session-start
2. Audit block shows `ProjectStateSummary=FAILED` or `ProjectStateSummary=SKIP`
3. Yellow warning visible in output

### Should this become a standard validation step?

**Yes, but lightweight.** The audit block line `ProjectStateSummary=GENERATED` is sufficient. No separate test script needed. If hardening 4b is implemented (file-existence confirmation), the audit line becomes a reliable proof signal.

Add to `session-start-checklist.md` end-of-session section: *"Verify `ProjectStateSummary=GENERATED` in audit block."* One line.

---

## 6. FINAL RECOMMENDATION

### 1. How GPT-ROLE.md should be standardized

**Consumer-owned source + manifest entry** (Option A). Kit documents the standard path. Consumer copies the template, adds a manifest entry. Zero tool changes needed.

### 2. Is PROJECT-STATE-SUMMARY generation ready as-is?

**Mostly yes.** The logic is sound and the root cause of confusion was timing (subtree pull hadn't landed), not a tool defect. However, three tiny hardening steps (4a, 4b, 4c — ~10 lines total) would eliminate future diagnostic confusion. Recommend doing them in the same implementation pass.

### 3. What exact implementation prompt should come next

**One prompt, two scopes:**

**Scope A (kit repo):**
- Implement PSS hardening (4a, 4b, 4c) in `tools/session-start.ps1`
- Add GPT-ROLE.md manifest guidance to `portability/subtree-playbook.md` (or a new standard if preferred)
- Bump version date

**Scope B (consumer repo — DailyInventoryPWA):**
- Copy `vibe-coding/templates/gpt-role-template.md` → `docs/project/GPT-ROLE.md`
- Add manifest entry to `docs/forGPT/forgpt.manifest.json`
- Run session-start to validate both GPT-ROLE delivery and PSS generation

These can be one prompt or two (kit first, consumer second). Kit-first is cleaner because the consumer subtree pull will pick up the PSS hardening.
