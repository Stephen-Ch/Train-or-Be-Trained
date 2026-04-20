# Docs Alignment Roadmap -- Post v7.2.21

**Last Updated:** 2026-03-02
**Kit Version at Creation:** v7.2.21

## Purpose

Prevent consumer drift; ensure GPTs read current rules first. The v7.2.19--v7.2.21 changes (confidence-percentage, Primary Priorities, session-start wiring) are canonical but not yet reflected in all entry-point docs that GPTs consume on session start.

## Scope

- Kit docs/tooling only.
- Consumer Start-Here docs remain repo-specific (they pull updates via subtree).

---

## Roadmap (ordered)

### 1. Sync protocol-lite.md to current canonical state

**Why it matters:** protocol-lite.md is the "quick reference" entry point uploaded to every GPT session. If it references old confidence formats or omits Primary Priorities, GPTs start with stale rules.

**Required changes:**
- Confidence line must use `Confidence: <percentage>%` (no HIGH/MED/LOW or (0-100))
- Reference Primary Priorities + Response Pattern (link to working-agreement-v1.md)
- Reference `run-vibe.ps1 -Tool session-start` as preferred session-start command
- Remove/update any legacy protocol path references

**Acceptance checks:**
- `rg "HIGH/MEDIUM/LOW|(0-100)" protocol-lite.md` returns 0 hits
- `rg "run-vibe.ps1 -Tool session-start" protocol-lite.md` returns 1+ hit
- `rg "Primary Priorities" protocol-lite.md` returns 1+ hit
- `doc-audit.ps1` PASS
- `doc-audit.ps1 -StartSession` PASS

---

### 2. Sync protocol-primer.md (neutralize drift-prone embedded templates)

**Why it matters:** protocol-primer.md is uploaded to ChatGPT at session start. Its embedded prompt template still shows `Confidence: <Copilot answers>` instead of `Confidence: <percentage>%`. It doesn't reference Primary Priorities or Response Pattern.

**Required changes:**
- Update embedded prompt template to `Confidence: <percentage>%`
- Add reference to Primary Priorities (Non-Negotiable) (link to working-agreement-v1.md)
- Ensure session-start reference uses run-vibe canonical form
- Keep file compact (primer role: ChatGPT onboarding, not full protocol)

**Acceptance checks:**
- `rg "HIGH/MEDIUM/LOW|(0-100)|<Copilot answers>" protocol-primer.md` returns 0 hits
- `rg "Primary Priorities" protocol-primer.md` returns 1+ hit
- `rg "Confidence:.*<percentage>%" protocol-primer.md` returns 1+ hit
- `doc-audit.ps1` PASS

---

### 3. Update session-start-checklist.md to "automated path first / manual fallback"

**Why it matters:** session-start-checklist.md is the pre-flight doc linked from README. If it only describes manual steps, Copilot and users skip the automated chain that keeps the kit current.

**Required changes:**
- Lead with `run-vibe.ps1 -Tool session-start` as the preferred first action
- Manual fallback clearly labeled as secondary
- Brief mention of Primary Priorities (prompt-only, one prompt, tiny-step TDD, brevity)
- Keep it a checklist (short, scannable)

**Acceptance checks:**
- `rg "run-vibe.ps1 -Tool session-start" session-start-checklist.md` returns 1+ hit
- Checklist distinguishes Automated vs Manual paths
- `doc-audit.ps1 -StartSession` PASS

---

### 4. PAUSE.md template + doc-audit WARN-level check

**Why it matters:** The user story lists PAUSE.md as critical for session recovery ("session state is recoverable"). Currently PAUSE.md has no enforced structure and doc-audit doesn't validate it. Consumer repos could have an empty or stale PAUSE.md with no warning.

**Required changes:**
- Define required headings in PAUSE.md (e.g., Current State, Last Commit, Next Step, Blockers)
- Add doc-audit WARN if PAUSE.md is missing required headings or contains placeholder tokens
- WARN only (not FAIL) -- session recovery is important but shouldn't block commits

**Acceptance checks:**
- `doc-audit.ps1` PASS with WARN behavior verified (show sample WARN trigger)
- No budget/index regressions in `-StartSession`
- PAUSE.md contains required headings after template update

---

### 5. Consumer onboarding smoke test (documented procedure)

**Why it matters:** No documented way to verify a fresh consumer repo's session-start chain works end-to-end. The promise is "instant resume via forGPT packet" but there's no test proving it.

**Required changes:**
- Add a short doc (in `docs/status/` or `portability/`) describing a "fresh consumer" verification procedure:
  1. Clone consumer repo
  2. Run `run-vibe.ps1 -Tool session-start`
  3. Verify: kit update ran, forGPT sync ran, doc-audit -StartSession printed session audit block
- Keep it manual/documented (no heavy automation needed at this stage)

**Acceptance checks:**
- Doc exists and references canonical command (`run-vibe.ps1 -Tool session-start`)
- `doc-audit.ps1` PASS

---

### 6. forGPT sync manifest drift protection (WARN-level)

**Why it matters:** `sync-forgpt.ps1` uses a manifest to decide which files to sync. If a consumer's manifest drifts or goes missing, forGPT packets silently go stale -- violating the "instant resume" promise from the user story.

**Required changes:**
- Add doc-audit WARN if `sync-forgpt.ps1` exists but its expected manifest file is missing or empty
- Goal: surface staleness early, not block commits

**Acceptance checks:**
- `doc-audit.ps1` PASS with WARN behavior verified (manifest missing triggers WARN)
- No false positives in Kit mode (kit repo doesn't use forGPT sync the same way)

---

## Execution Notes

- Items are ordered by leverage: 1-3 are highest (GPT entry-point docs read first), 4-6 are infrastructure hardening.
- Each item should be a single prompt with its own PROMPT-ID.
- Do NOT bundle multiple items into one prompt.
- After each item, run doc-audit + doc-audit -StartSession to prove GREEN.
