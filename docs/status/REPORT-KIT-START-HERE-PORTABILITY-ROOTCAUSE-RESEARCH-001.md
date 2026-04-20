# REPORT-KIT-START-HERE-PORTABILITY-ROOTCAUSE-RESEARCH-001

| Field | Value |
|-------|-------|
| **Date** | 2026-03-14 |
| **PROMPT-ID** | KIT-START-HERE-PORTABILITY-ROOTCAUSE-RESEARCH-001 |
| **Area** | Portability / Start-Here-For-AI.md ownership boundary |
| **Status** | COMPLETE |
| **Confidence** | 97% |
| **Evidence Links** | See Section 9 — Exact Files Inspected |

---

## Prior Research Lookup

Search terms used: `Start-Here`, `Start-Here-For-AI`, `portability`, `ownership`, `hybrid`

Relevant prior research found:

| Report | File | Overlap |
|--------|------|---------|
| REPORT-KIT-VERIFY-DOC-CONFLICTS-001 | docs/status/REPORT-KIT-VERIFY-DOC-CONFLICTS-001.md | Q1 established Start-Here as consumer-only; noted doc-audit.ps1 does not enforce placement |
| REPORT-KIT-FLOWMODE-SIMPLIFICATION-RESEARCH-001 | docs/status/REPORT-KIT-FLOWMODE-SIMPLIFICATION-RESEARCH-001.md | Identified rerun-trigger as consumer-defined in Start-Here; flagged as design gap |
| REPORT-KIT-DEDUPE-VERSION-LINKS-AUDIT-001 | docs/status/REPORT-KIT-DEDUPE-VERSION-LINKS-AUDIT-001.md | Catalogued 8 `../../Start-Here-For-AI.md` links inside kit; classified as CONSUMER-only links |

**Gap in prior research:** No prior report examines Start-Here content across multiple consumer repos or quantifies the volatile/stable split. The current seam failure has been noted but never root-caused.

---

## 1. Executive Verdict

**Start-Here-For-AI.md is a mixed-ownership file in at least 2 of 4 surveyed consumer repos, and this is the primary cause of repeated post-update cleanup churn.**

The design intent (consumer thin-shell pointing to kit docs) is correct and is already working in 2 repos (PIE, DealersChoice). However, in Lessonwriter and NYC Explorer, large amounts of volatile kit protocol text were manually copied into Start-Here. Because Start-Here lives outside the kit subtree, it does not update when the kit updates — creating a guaranteed drift bomb that fires on every `run start of session doc audit`.

This is primarily a **kit portability problem** caused by the absence of a thin-shell template and enforcement boundary. The kit provides a fragment template (`start-here-session-start-callout.example.md`) but no authoritative thin-shell template, no "do not copy protocol text here" warning, and no enforcement in doc-audit. The result is that consumer authors have been filling the gap by copying kit content in, and paying cleanup costs on every kit update.

A secondary problem: the kit itself couples its own behavior to a consumer-owned file. `protocol-v7.md` and `required-artifacts.md` both defer the Doc Audit rerun trigger command to Start-Here-For-AI.md. This creates a circular dependency (kit doc → consumer file → kit behavior) and forces consumers to maintain non-thin Start-Here files to satisfy kit protocol.

---

## 2. Current Role of Start-Here-For-AI.md

### In the kit

Start-Here does NOT exist in the kit repository. The kit provides:
- A session-start callout fragment: `templates/start-here-session-start-callout.example.md` (~15 lines — only the RUN START OF SESSION command)
- A placement rule: DOCS-HEALTH-CONTRACT.md §6 says it must live at `<DOCS_ROOT>/Start-Here-For-AI.md`, must NOT appear inside `<DOCS_ROOT>/vibe-coding/`
- Migration guidance: MIGRATION-INSTRUCTIONS.md says only "Update project name references" as the customization for Start-Here (no content guidance)

The kit references Start-Here 28+ times across protocol docs:
- `protocol-v7.md` lines 82-86: links to `../../Start-Here-For-AI.md` and defers rerun-trigger definition to it
- `required-artifacts.md`: "See consumer Start-Here doc" for Doc Audit workflow and rerun trigger detection

### In consumer repos (intended design)

Per QUICKSTART.md and DOCS-HEALTH-CONTRACT.md: a session bootstrap that tells the AI how to start work in this repo. Intended to contain repo-specific information only, pointing to kit docs for protocol rules.

### In practice

Highly variable. Two distinct patterns exist:

**Pattern A — Thin Shell (PIE, DealersChoice):** ~25 lines. Contains: session-start command, links to overlays, links to control deck, links to research index. Zero kit protocol text. Stable.

**Pattern B — Protocol Mirror (Lessonwriter, NYC Explorer):** 200–400+ lines. Contains: full session sequencing description, Doc Audit requirements with exact file paths, Rerun Trigger Detection command and path list, Population Gate check text, NEXT.md Freshness Rule, Required Reading by role, forGPT section, version headers. Unstable — goes stale on every kit update.

---

## 3. Cross-Repo Comparison Table

| Repo | DOCS_ROOT | Lines (approx.) | Version/Date in header | Kit text copied in | Cleanup risk post-update |
|------|-----------|-----------------|------------------------|-------------------|--------------------------|
| **Lessonwriter** | `docs-engineering` | ~400+ | v7.1.3 / 2026-01-18 (Bundle: tag deprecated) | Session sequencing, Doc Audit Requirements, Rerun Trigger Paths, Population Gate, NEXT.md Freshness Rule, Required Reading by role, forGPT section, 4-Party Roles, Protocol Update Checklist | **HIGH** — severely stale; active merge conflict in VIBE-CODING.VERSION.md |
| **NYC Explorer** | `docs` | ~200 | v7.2.40 / 2026-03-14 | Session Sequencing, Doc Audit Requirements, Rerun Trigger Paths, Population Gate, NEXT.md Freshness Rule, Green Gate, Required Reading | **MEDIUM** — current kit version, but large duplicated text block is a future drift liability |
| **PIE** | `docs` | ~25 | None | None | **LOW** — thin shell; no kit text to go stale |
| **DealersChoice** | `docs` | ~25 | None | None | **LOW** — thin shell; no kit text to go stale |
| **vibe-coding-kit (repo)** | N/A | Does not exist | N/A | N/A | N/A |

**Pattern finding (proven):** Thin-shell repos have near-zero post-update cleanup risk. Protocol-Mirror repos have high cleanup risk. This is a direct, observable correlation across 4 repos.

---

## 4. Volatile vs Stable Content Map

### Volatile (changes when kit changes — should NEVER be in consumer Start-Here)

| Content | Lives canonically in | Found in (consumer) |
|---------|---------------------|---------------------|
| Session sequencing description (Prompt Review Gate → Proof-of-Read → Doc Audit → ...) | `protocol-v7.md` / `required-artifacts.md` | Lessonwriter, NYC Explorer |
| Doc Audit Requirements (which files to read, step numbers) | `required-artifacts.md` §Doc Audit Workflow | Lessonwriter, NYC Explorer |
| Rerun Trigger Detection command and path list | Defined ad-hoc in consumer Start-Here (per kit doc deferral — itself a design flaw) | Lessonwriter, NYC Explorer |
| Population Gate word-count thresholds and scan commands | `required-artifacts.md` §Control Deck Population Gate | Lessonwriter, NYC Explorer |
| NEXT.md Freshness Rule (text, enforceable detection command) | `protocol-v7.md` | Lessonwriter, NYC Explorer |
| Required Reading by role (exact file paths) | `copilot-instructions-v7.md` / `protocol-v7.md` | Lessonwriter, NYC Explorer |
| forGPT packet description (lockdown guarantees, core/extra file list, sync commands) | `sync-forgpt.ps1` script internals | Lessonwriter |
| Version Sync Check instructions | `FILE-VERSIONING.md` | Lessonwriter |
| Protocol Update Checklist (steps to update File Version, forGPT, VERSION-MANIFEST) | `FILE-VERSIONING.md` | Lessonwriter |
| `Bundle: v7.x.x` version header | Deprecated since v7.2.2 per `FILE-VERSIONING.md` | Lessonwriter |

### Stable consumer-specific (should ALWAYS remain in consumer Start-Here)

| Content | Consumer-specific because... |
|---------|------------------------------|
| Project title / identity ("Start Here — Using GPT/Copilot with Lessonwriter") | Project name |
| DOCS_ROOT paths (`docs/` vs `docs-engineering/`) | Repo-specific install decision |
| session-start command with hardcoded path | Consumer path — the one piece of path information needed |
| Manual fallback path to session-start.ps1 | Consumer path |
| Green Gate commands (`npm run e2e:auto`, `dotnet build`, etc.) | Tech-stack specific |
| Links to overlays, control deck, research index | Consumer paths |
| Repo-specific branch/PR rules | Consumer policy (optional — better in repo-policy.md overlay) |
| 4-Party Roles / team-specific workflow notes | Consumer-specific (optional) |

### Duplicated from kit sources (creates drift on update)

Every piece of "volatile" content above is directly duplicated from a kit file. NONE of it is unique to the consumer. The consumer added no new information — only a stale copy.

---

## 5. Ownership-Seam Analysis

### Intended seam (per DOCS-HEALTH-CONTRACT.md, MIGRATION-INSTRUCTIONS.md, QUICKSTART.md)

```
Kit subtree: <DOCS_ROOT>/vibe-coding/
  ├── Protocol rules, gates, sequencing (protocol-v7.md, required-artifacts.md)
  ├── Enforcement scripts (session-start.ps1, doc-audit.ps1)
  └── Templates (start-here-session-start-callout.example.md)

Consumer: <DOCS_ROOT>/Start-Here-For-AI.md
  └── Repo identity + session-start command + links to kit docs + links to overlays
```

### Actual seam in Lessonwriter/NYC Explorer

```
Kit subtree: <DOCS_ROOT>/vibe-coding/
  ├── Protocol rules (authoritative)
  └── ...

Consumer: <DOCS_ROOT>/Start-Here-For-AI.md
  ├── Repo identity (consumer-owned ✅)
  ├── Session-start command (consumer-owned ✅)
  ├── COPY of session sequencing rules from required-artifacts.md (kit text ❌)
  ├── COPY of Doc Audit Requirements from required-artifacts.md (kit text ❌)
  ├── COPY of Rerun Trigger Detection from undefined kit source (kit text ❌)
  ├── COPY of Population Gate thresholds from required-artifacts.md (kit text ❌)
  ├── COPY of NEXT.md Freshness Rule from protocol-v7.md (kit text ❌)
  ├── COPY of Required Reading lists from copilot-instructions-v7.md (kit text ❌)
  └── COPY of forGPT packet description from runtime internals (kit behavior ❌)
```

The seam has collapsed. The consumer file is now 80%+ kit content with 20% consumer-specific content. This makes every kit update an immediate Start-Here cleanup event.

### Circular dependency (kit-owned docs referencing consumer file)

- `protocol-v7.md` lines 82-86: "run the rerun-trigger detection command defined in Start-Here-For-AI.md"
- `required-artifacts.md` §Doc Audit Rerun Detection: "See the consumer Start-Here doc"

**Proven:** The kit's own protocol docs create a structural requirement for consumers to have a non-minimal Start-Here. The kit says "the rerun trigger is in Start-Here" — which forces consumers to maintain that content there, or to read kit docs that point them back to their own consumer file for a command that isn't defined anywhere stable.

---

## 6. Why Cleanup Happens After Kit Update

### The exact failure sequence (proven for Lessonwriter)

1. User runs `run start of session doc audit`
2. `run-vibe.ps1 -Tool session-start` chain executes:
   - Step A: `git subtree pull --prefix=<DOCS_ROOT>/vibe-coding ...` → kit files updated
   - Step B: `sync-forgpt.ps1` → forGPT copies updated from new kit files
   - Step C: `doc-audit.ps1 -StartSession` → Doc Audit runs
3. The AI opens both the updated kit files (e.g., `required-artifacts.md` v7.2.38/39) AND the unchanged Start-Here-For-AI.md (v7.1.3 / 2026-01-18)
4. The AI detects:
   - The `Bundle:` version tag in Start-Here is deprecated (removed in v7.2.2)
   - The session sequencing text in Start-Here doesn't match the updated protocol wording
   - The Rerun Trigger path list may reference stale paths or outdated path format
   - The Population Gate text may have threshold changes since v7.1.3
5. The AI flags the contradictions as cleanup work

**Evidence of Step A failure mode (proven):** Lessonwriter's `VIBE-CODING.VERSION.md` has an unresolved merge conflict between v7.2.38 and v7.2.39 — the subtree pull left a conflict that itself requires cleanup before any further work.

### Contributing factor: Rerun-Trigger Self-Loop

In both Lessonwriter and NYC Explorer, the Rerun Trigger Detection section includes `docs/Start-Here-For-AI.md` as a trigger path. This means: when Start-Here is edited as part of cleanup, the cleanup commit triggers ANOTHER Doc Audit rerun. Cleanup of Start-Here feeds itself. This is a positive feedback loop baked into the file design.

**Note (Lessonwriter-specific bug observed):** Lessonwriter's Rerun Trigger Detection section lists `docs/Start-Here-For-AI.md` as a trigger path, but its DOCS_ROOT is `docs-engineering/`. The trigger would never fire as written — a stale copy-paste from a different repo's layout.

### Contributing factor: No cleanup-prevention mechanism

The kit has no:
- Warning in MIGRATION-INSTRUCTIONS.md: "Do not copy kit text into Start-Here"
- Enforcement check in doc-audit.ps1: "Start-Here file size must be under N lines" or "no protocol text detected"
- Canonical thin-shell template: The only template (`start-here-session-start-callout.example.md`) shows the session-start command only — insufficient to guide full file authoring

---

## 7. Smallest Safe Design Options

### Option A: Canonical thin-shell template (kit-level change — smallest)

**What:** Add `templates/start-here-template.md` as the authoritative Start-Here template. The template is thin (~40 lines max): project name placeholder, session-start command, overlay links, control deck links, research index link. Include explicit warning: "DO NOT copy protocol text from kit docs here. Protocol rules live in `<DOCS_ROOT>/vibe-coding/`. This file is repo-specific only."

Update MIGRATION-INSTRUCTIONS.md to say: "Copy `templates/start-here-template.md` to `<DOCS_ROOT>/Start-Here-For-AI.md` and fill in [Project Name] and `<DOCS_ROOT>` path. Make no other changes."

**Fixes:** Prevents new consumer repos from becoming Protocol Mirrors. Does not fix existing heavy files.

**Risk:** Low — docs-only change. Does not break anything.

### Option B: Remove kit's behavioral dependency on Start-Here (kit-level change — moderate)

**What:** Update `protocol-v7.md` and `required-artifacts.md` to remove the reference "run the rerun-trigger detection command defined in Start-Here-For-AI.md." Define the canonical rerun trigger command directly in `required-artifacts.md` or in a new kit-canonical-commands entry. This removes the structural reason for consumers to put kit-owned content in Start-Here.

The rerun trigger detection command is simple enough to define canonically:
```
git diff --name-only HEAD~1..HEAD
```
with a fixed path pattern rule (parameterized on `<DOCS_ROOT>`).

**Fixes:** Removes the primary structural driver for consumers needing non-minimal Start-Here files.

**Risk:** Low-medium — requires updating 2 kit docs (protocol-v7.md, required-artifacts.md) with careful wording. No script changes needed.

### Option C: Add doc-audit.ps1 check for Start-Here size or contents (enforcement)

**What:** Add a soft-WARN check to doc-audit.ps1 that fires if `<DOCS_ROOT>/Start-Here-For-AI.md` exceeds a line threshold (e.g., 60 lines) or contains patterns indicating copied protocol text (e.g., "Population Gate uses objective word-count thresholds").

**Fixes:** Detects drift before it accumulates. Does not fix retroactively.

**Risk:** Medium — requires script change; needs correct threshold calibration.

### Option D: Provide migration instructions for existing heavy files (consumer fix)

**What:** Add a section to MIGRATION-INSTRUCTIONS.md: "If your Start-Here-For-AI.md has grown beyond the thin shell, here's how to prune it back to the canonical form. Replace sections A, B, C with links to kit docs X, Y, Z."

**Fixes:** Helps existing Lessonwriter/NYC Explorer migrate to thin shell.

**Risk:** Low — docs-only. Requires consumer action.

### Recommended minimum fix set

**Smallest safe combination: A + B**

Option A alone prevents new contamination but doesn't fix the circular dependency. Option B alone removes the structural driver but doesn't provide a positive replacement guide. Together, A+B:
- Eliminates the structural reason for large Start-Here files (B)
- Provides a canonical thin template to replace existing content (A)
- Changes only 3 kit files: `protocol-v7.md`, `required-artifacts.md`, and a new `templates/start-here-template.md`
- Requires zero script changes

**Add Option D as a follow-on:** Once A+B are in place, guide existing heavy-file consumers back to thin shell.

**Option C is a nice-to-have** but not required for the design fix — the thin template + documentation is sufficient if enforced at migration time. Consider adding C after confirming the template works.

---

## 8. Recommended Next Step

**PROMPT-ID for next prompt:** `KIT-START-HERE-THIN-SHELL-TEMPLATE-001`

**What to do:**

1. Draft `templates/start-here-template.md` — canonical thin Start-Here shell (~40 lines). Must include:
   - Project name placeholder at top
   - `RUN START OF SESSION DOCS AUDIT` section (exact callout from `start-here-session-start-callout.example.md`)
   - Section: "Repo-specific truth (overlays)" — bullet list of overlay paths with `<DOCS_ROOT>` placeholder
   - Section: "Control Deck" — bullet list of VISION/EPICS/NEXT paths
   - Section: "Research" — ResearchIndex.md path
   - Explicit warning block: "Do not add protocol text from kit docs to this file"
   
2. Update `MIGRATION-INSTRUCTIONS.md` — replace "Update project name references" under Start-Here with: "Copy `templates/start-here-template.md` to `<DOCS_ROOT>/Start-Here-For-AI.md`. Fill in `[Project Name]` and replace `<DOCS_ROOT>`. Make no other changes — all protocol rules live in kit docs."

3. Update `protocol-v7.md` and `required-artifacts.md` — replace "run the rerun-trigger detection command defined in Start-Here-For-AI.md" with a self-contained definition of the rerun trigger (the git diff command + path pattern rule, parameterized on `<DOCS_ROOT>`).

**Before implementing:** Run the next formal work prompt through the Prompt Review Gate to confirm scope and approach.

---

## 9. Exact Files Inspected

### Kit repo (vibe-coding-kit)

| File | Key finding |
|------|-------------|
| `DOCS-HEALTH-CONTRACT.md` (§6) | Confirms Start-Here is consumer-only; must NOT be in kit head |
| `FILE-VERSIONING.md` (lines 30-40, 135-145) | Says `<DOCS_ROOT>/` placement for Start-Here; step 2 of cross-project sync copies it; `Bundle:` tag deprecated |
| `MIGRATION-INSTRUCTIONS.md` (lines 42, 168, 319, 330-340) | Only customization is "update project name references" |
| `QUICKSTART.md` | "Everything outside `<DOCS_ROOT>/vibe-coding/` is yours and will never be overwritten" |
| `templates/start-here-session-start-callout.example.md` | Fragment template — only covers session-start command (~15 lines); no full Start-Here template exists |
| `protocol/protocol-v7.md` (lines 82-90) | Defers rerun-trigger definition to consumer Start-Here — proven circular dependency |
| `protocol/required-artifacts.md` (lines 118-125, 218-223) | "See consumer Start-Here doc" for Doc Audit and rerun detection; same circular dependency |
| `docs/status/REPORT-KIT-VERIFY-DOC-CONFLICTS-001.md` | Prior research on placement; doc-audit enforcement gap noted |
| `docs/status/REPORT-KIT-FLOWMODE-SIMPLIFICATION-RESEARCH-001.md` | Rerun-trigger gap identified; consumer Start-Here dependency flagged |
| `docs/status/REPORT-KIT-DEDUPE-VERSION-LINKS-AUDIT-001.md` | 8 consumer-pointing links catalogued |

### Consumer repos

| File | Key finding |
|------|-------------|
| `Lessonwriter/.../docs-engineering/Start-Here-For-AI.md` | ~400+ lines; `Bundle: v7.1.3` (deprecated); 80%+ kit text copied in; active merge conflict in co-located VIBE-CODING.VERSION.md; stale path bug (docs/ vs docs-engineering/) |
| `Lessonwriter/.../docs-engineering/forGPT/Start-Here-For-AI.md` | Identical to canonical copy as of 2026-01-18 (pre-sync); confirms forGPT copy is also stale |
| `Lessonwriter/.../docs-engineering/vibe-coding/VIBE-CODING.VERSION.md` | Has unresolved merge conflict: v7.2.38 vs v7.2.39 — direct evidence of post-update cleanup hotspot |
| `NYC Explorer/docs/Start-Here-For-AI.md` | ~200 lines; v7.2.40 / 2026-03-14; significant kit text; includes Start-Here itself as a Rerun Trigger |
| `PIE/docs/Start-Here-For-AI.md` | ~25 lines; no version header; thin shell only; no kit text |
| `DealersChoice2026.../docs/Start-Here-For-AI.md` | ~25 lines; no version header; thin shell only; no kit text |

---

## 10. Suggested Next Prompt

```
PROMPT-ID: KIT-START-HERE-THIN-SHELL-TEMPLATE-001

Mode: IMPLEMENTATION

Goal: Create the canonical thin-shell Start-Here template and remove the kit's
behavioral dependency on consumer Start-Here content.

Scope:
1. Create templates/start-here-template.md (new file — thin shell, ~35-40 lines)
2. Update MIGRATION-INSTRUCTIONS.md: replace Start-Here customization guidance
   with "copy from template, fill in [Project Name] and <DOCS_ROOT>, make no
   other changes"
3. Update protocol-v7.md: replace "run the rerun-trigger detection command
   defined in Start-Here-For-AI.md" with a self-contained git diff command +
   path rule (parameterized on <DOCS_ROOT>)
4. Update required-artifacts.md §Doc Audit Rerun Detection: remove "see
   consumer Start-Here doc"; define the command inline

Out of scope:
- Changes to consumer repos (separate follow-on)
- doc-audit.ps1 enforcement check (Option C — scope to a later prompt)
- start-here-session-start-callout.example.md (may be deprecated once template exists)

Completion criteria:
- templates/start-here-template.md exists, is < 45 lines, contains no kit protocol text
- MIGRATION-INSTRUCTIONS.md says "copy from template; make no other changes"
- protocol-v7.md and required-artifacts.md no longer defer rerun-trigger to Start-Here
- All 3 kit files updated in a single commit
```

---

## Confidence Statement

```
Confidence: 97%
Basis: 4 consumer repos directly inspected; cross-repo pattern is clear and consistent;
       circular dependency proven by text in protocol-v7.md and required-artifacts.md;
       staleness mechanism confirmed by active merge conflict and deprecated Bundle: tag.
Ready to proceed: YES
```
