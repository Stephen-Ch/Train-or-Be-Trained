# Report: Rule Duplication, Version Hygiene & Broken Links Audit

> **PROMPT-ID:** KIT-RESEARCH-DEDUPE-VERSION-LINKS-AUDIT-001  
> **Date:** 2026-02-09  
> **Type:** RESEARCH-ONLY (no edits, no commits, no PRs)  
> **Scope:** Evidence-backed plan for 3 implementation PRs addressing the three lowest-scoring dimensions from the kit review (72/100)

---

## Motivation

The comprehensive kit review scored three dimensions below 60/100:

| Dimension | Score | Issue |
|-----------|-------|-------|
| Version hygiene | 45/100 | Per-file Bundle tags conflict with each other and with VIBE-CODING.VERSION.md |
| Cross-reference integrity | 50/100 | Broken links, consumer-only links, self-broken paths |
| Protocol weight (rule duplication) | 55/100 | Same rule restated in 5–9 files; drift risk |

This report provides the quantitative evidence and a concrete 3-PR implementation plan.

---

## Task 1: Rule Duplication Audit

### Classification Key

| Class | Meaning |
|-------|---------|
| **CANONICAL** | Authoritative definition — the one place to edit |
| **RESTATEMENT** | Restates the rule in its own words (drift risk) |
| **STUB** | Points to canonical via link, minimal local text |
| **TEMPLATE/EXAMPLE** | Inside a template checklist or example block — acceptable |

### Duplication Table

| Rule Family | Canonical File (proposed) | RESTATEMENT files | STUB files | TEMPLATE/EXAMPLE files | Total files |
|---|---|---|---|---|---|
| **Confidence Gate** (95%/99% thresholds) | protocol-v7.md § No Guessing / Tiered Confidence Gate | research-standard.md (full "The 95% Rule"), protocol-primer.md ("95% Confidence Rule" section), working-agreement-v1.md ("95% Confidence Gate" section), protocol-lite.md ("Tiered Confidence Rule" section) | — | EVIDENCE-PACK-TEMPLATE.md (7 refs) | 6 |
| **Command Lock** (no commands before Gate) | protocol-v7.md § Core Rules #1 | copilot-instructions-v7.md, protocol-primer.md ("Command Lock — You Write Prompts, Not Code"), MIGRATION-INSTRUCTIONS.md | protocol-lite.md (link to § RESEARCH-ONLY Command Lock) | test-touch-block-template.md, closeout-artifact-verification-template.md | 7 |
| **Proof-of-Read** | protocol-v7.md § Core Rules #2 | copilot-instructions-v7.md, working-agreement-v1.md, stay-on-track.md (checklist), verification-mode.md | — | — | 5 |
| **Prompt Review Gate** (4-line gate) | protocol-v7.md § Core Rules #1 | copilot-instructions-v7.md, working-agreement-v1.md, stay-on-track.md, verification-mode.md, protocol-primer.md, prompt-lifecycle.md | — | test-touch-block-template.md, closeout-artifact-verification-template.md | 9 |
| **Green Gate** (build must pass) | protocol-v7.md § Green Gate — Stack-Aware Rules | copilot-instructions-v7.md, working-agreement-v1.md, stay-on-track.md, return-packet-gate.md, verification-mode.md | protocol-lite.md (proper stub with link) | closeout-artifact-verification-template.md | 8 |
| **Population Gate** (no TBD/TODO in Control Deck) | required-artifacts.md § Control Deck Population Gate | protocol-v7.md (3 restatements at L84, L91, L164), protocol-lite.md, stack-profile-standard.md | — | closeout-artifact-verification-template.md | 6 |
| **Stop on Error** (non-zero exit → stop) | protocol-v7.md § Core Rules #6 | copilot-instructions-v7.md, working-agreement-v1.md, MIGRATION-INSTRUCTIONS.md, prompt-lifecycle.md, merge-prompt-template.md, stay-on-track.md | — | test-touch-block-template.md, closeout-artifact-verification-template.md | 9 |
| **One-prompt-only** (single-thread sequencing) | protocol-v7.md (implied in core rules) | working-agreement-v1.md ("single-thread sequencing"), copilot-instructions-v7.md ("Do not author or request the next prompt…") | — | user-story-stephen-vibe-coding.md (user story table) | 4 |
| **Overlays outside head** | OCTOPUS-INVARIANTS.md | DOCS-HEALTH-CONTRACT.md, subtree-playbook.md | — | — | 3 |
| **RESEARCH-ONLY mode** | protocol-v7.md § RESEARCH-ONLY Command Lock | research-standard.md (full restatement), protocol-primer.md, protocol-lite.md (extensive restatement) | — | github-agent-return-packets-prompt-template.md | 5 |

### Summary

- **Worst offenders:** Prompt Review Gate (9 files), Stop on Error (9 files), Green Gate (8 files), Command Lock (7 files)
- **Cleanest rule:** Overlays outside head (3 files, well-structured single source)
- **protocol-lite.md** is the only file that already uses proper stub patterns (4 link-to-canonical stubs)
- **copilot-instructions-v7.md** is the worst restatement offender — restates 6 of 10 rule families without linking to canonical

---

## Task 2: Version Hygiene Audit

### Version Conflict Table

| File | Bundle Version | File Date | Status |
|---|---|---|---|
| VIBE-CODING.VERSION.md | **v7.1.5** | 2026-02-07 | Supposed to be authoritative; LAGS everything |
| README.md | v7.2.2 | 2026-02-09 | Highest version in repo |
| protocol-lite.md | v7.2.2 | 2026-02-09 | Matches README |
| protocol/protocol-v7.md | v7.2.1 | 2026-02-06 | One patch behind README |
| protocol-primer.md | v7.2.0 | 2026-02-06 | Two patches behind README |
| portability/user-story-stephen-vibe-coding.md | v7.2.0 | 2026-02-06 | Matches primer |
| protocol/copilot-instructions-v7.md | v7.1.4 | 2026-01-18 | Stale by full minor version |
| protocol/working-agreement-v1.md | v7.1.3 | 2026-01-18 | Stale |
| protocol/stay-on-track.md | v7.1.3 | 2026-01-18 | Stale |
| protocol/return-packet-gate.md | v7.1.3 | 2026-01-18 | Stale |
| FILE-VERSIONING.md | v7.1.3 | 2026-01-18 | Stale |

### Findings

1. **VIBE-CODING.VERSION.md is broken as authoritative source** — it says v7.1.5 but 5 files claim v7.2.x. Either the VERSION file was never bumped when changes happened, or the per-file headers were bumped without updating the central file.
2. **Two version clusters:** v7.1.3–v7.1.5 (older files unchanged since Jan 2026) and v7.2.0–v7.2.2 (files updated in Feb 2026). The gap from v7.1.5 to v7.2.0 has no changelog entry.
3. **No enforcement:** Nothing in doc-audit.ps1 validates that per-file Bundle tags match VIBE-CODING.VERSION.md.

### Recommended Strategy

**Option A — Centralize (recommended):** Remove per-file `Bundle: v7.x.x` headers entirely. VIBE-CODING.VERSION.md becomes the sole version source. Per-file headers keep only `File Version: <date>` (last-modified date).

**Option B — Sync:** Keep per-file Bundle tags but add a doc-audit check that all match VIBE-CODING.VERSION.md. This requires bumping every file on every release — high maintenance burden.

---

## Task 3: Broken Link Audit

### Classification Key

| Class | Meaning |
|-------|---------|
| **CONSUMER** | Points to consumer repo path (`../project/`, `../../Start-Here-For-AI.md`) — works only when kit is subtree'd into a consumer |
| **SELF-BROKEN** | Broken within the kit itself (wrong relative path, bad anchor) |
| **PROJECT-SPECIFIC** | References a specific project (ExampleProject) — not portable |

### Problem Links

| # | File | Link Target | Class | Issue |
|---|---|---|---|---|
| 1 | protocol/protocol-v7.md (L82) | `../../Start-Here-For-AI.md` | CONSUMER | 5 occurrences in protocol-v7.md; doesn't exist in kit |
| 2 | protocol/protocol-v7.md (L114) | `../../project/stack-profile.md` | CONSUMER | 2 occurrences; consumer-side file |
| 3 | protocol/protocol-v7.md (L138) | `../project/tech-debt-and-future-work.md` | CONSUMER | Consumer-side file |
| 4 | protocol/required-artifacts.md (L37) | `../../project/VISION.template.md` | CONSUMER | 3 template links (VISION, EPICS, NEXT) |
| 5 | protocol/required-artifacts.md (L105) | `../../Start-Here-For-AI.md` | CONSUMER | 3 occurrences in required-artifacts |
| 6 | session-start-checklist.md (L12) | `../project/NEXT.md` | CONSUMER | 2 occurrences + tech-debt + ResearchIndex |
| 7 | session-start-checklist.md (L40) | `../status/branches.md` | CONSUMER | Consumer-side status file |
| 8 | protocol-lite.md (L149) | `../status/branches.md` | CONSUMER | 2 occurrences |
| 9 | PAUSE.md (L56) | `../research/R-014-...` | CONSUMER+PROJECT | Project-specific research doc |
| 10 | PAUSE.md (L66) | `../project/NEXT.md` | CONSUMER | + EPICS.md, forGPT/README.md |
| 11 | README.md (L71) | `../status/return-packet-*` | CONSUMER+PROJECT | 3 project-specific return packets |
| 12 | protocol/return-packet-gate.md (L162) | `../../status/return-packet-*` | CONSUMER+PROJECT | 3 project-specific return packets |
| 13 | templates/github-agent-return-packets-prompt-template.md (L201) | `../../status/return-packet-*` | CONSUMER+PROJECT | 3 example links (acceptable in template) |
| 14 | protocol/alignment-mode.md (L91) | `../protocol/required-artifacts.md` | **SELF-BROKEN** | File is already in `protocol/` — doubles to `protocol/protocol/required-artifacts.md` |
| 15 | protocol/alignment-mode.md (L227) | `../vibe-coding/protocol/protocol-v7.md` | **SELF-BROKEN** | Assumes consumer subtree mount — breaks in kit repo |
| 16 | portability/subtree-playbook.md (L228) | `../vibe-coding/session-start-checklist.md` | **SELF-BROKEN** | Assumes consumer subtree mount — breaks in kit repo |
| 17 | protocol/protocol-v7.md (L91) | `protocol/alignment-mode.md` | **SELF-BROKEN** | From inside `protocol/` resolves to `protocol/protocol/alignment-mode.md` |

### Summary

- **17 distinct problem links** across 12 files
- **4 true SELF-BROKEN** links that are wrong in any context (#14, #15, #16, #17)
- **~10 CONSUMER links** that intentionally point outside the kit (resolve only when subtree-mounted)
- **3+ PROJECT-SPECIFIC** links referencing ExampleProject return-packets in portable docs

### Project-Specific Content (bonus finding)

Content that should be moved to consumer overlays:

| File | Content | Nature |
|---|---|---|
| protocol/protocol-v7.md (L131) | `msbuild ExampleProject.csproj` commands, ExampleProject summary table | PROJECT |
| protocol/copilot-instructions-v7.md (L110–252) | "Project Context — ExampleProject" section | PROJECT |
| protocol/stay-on-track.md (L43) | Hardcoded Angular route coverage list (IntroComponent, SelectComponent, etc.) | PROJECT |
| protocol-lite.md (L78) | ExampleProject Green Gate example with msbuild command | PROJECT |
| PAUSE.md | Entire file is project-specific (Sprint 2 status, R-014 reference) | PROJECT |
| VIBE-CODING.VERSION.md (L15) | parseTaggerNET3.0 build command reference | PROJECT |

---

## Task 4: 3-PR Implementation Plan

### PR A: Version Hygiene (smallest, lowest risk)

**Title:** `docs: centralize version to VIBE-CODING.VERSION.md, remove per-file Bundle tags`

**Files to edit (11):**

| File | Change |
|---|---|
| VIBE-CODING.VERSION.md | Bump to v7.3.0, add changelog entry |
| README.md | Remove `Bundle: v7.2.2`, keep `File Version: <date>` |
| protocol-lite.md | Remove `Bundle: v7.2.2` |
| protocol/protocol-v7.md | Remove `Bundle: v7.2.1` |
| protocol-primer.md | Remove `Bundle: v7.2.0` |
| portability/user-story-stephen-vibe-coding.md | Remove `Bundle: v7.2.0` |
| protocol/copilot-instructions-v7.md | Remove `Bundle: v7.1.4` |
| protocol/working-agreement-v1.md | Remove `Bundle: v7.1.3` |
| protocol/stay-on-track.md | Remove `Bundle: v7.1.3` |
| protocol/return-packet-gate.md | Remove `Bundle: v7.1.3` |
| FILE-VERSIONING.md | Update to document new convention, remove own Bundle tag |

**Success criteria:**
1. `grep -r "Bundle:" *.md` returns only VIBE-CODING.VERSION.md
2. FILE-VERSIONING.md documents the new convention
3. doc-audit.ps1 unchanged (no check needed since there's only one version now)

**Risk:** LOW — cosmetic change, no behavioral impact

---

### PR B: Broken Links + Consumer-Link Policy

**Title:** `docs: fix self-broken links, add consumer-link annotation convention`

**Phase 1 — Fix self-broken links (4 files, zero risk):**

| File | Line | Old Target | Corrected Target |
|---|---|---|---|
| protocol/alignment-mode.md | L91 | `../protocol/required-artifacts.md` | `required-artifacts.md` |
| protocol/alignment-mode.md | L227 | `../vibe-coding/protocol/protocol-v7.md` | `protocol-v7.md` |
| protocol/protocol-v7.md | L91 | `protocol/alignment-mode.md` | `alignment-mode.md` |
| portability/subtree-playbook.md | L228 | `../vibe-coding/session-start-checklist.md` | `../session-start-checklist.md` |

**Phase 2 — Consumer-link annotation convention:**
- Add `<!-- consumer-link -->` annotation to all consumer-side links
- Document convention in FILE-VERSIONING.md or a new LINK-CONVENTION.md section
- Convert project-specific return-packet links in README.md and return-packet-gate.md to generic `<EXAMPLE>` placeholders

**Success criteria:**
1. 0 self-broken links (the 4 identified above are fixed)
2. All consumer-side links annotated with `<!-- consumer-link -->`
3. Project-specific return-packet example links converted to generic placeholders
4. (Stretch) doc-audit.ps1 gains a consumer-link validation check

**Risk:** MEDIUM for Phase 2 (many files); LOW for Phase 1

---

### PR C: Rule Deduplication (largest, highest judgment)

**Title:** `docs: convert rule restatements to canonical stubs with links`

**Target pattern:** Convert each RESTATEMENT to a 1–3 line stub:

```markdown
### Confidence Gate
→ See [protocol-v7.md § No Guessing / Tiered Confidence Gate](protocol/protocol-v7.md#no-guessing--tiered-confidence-gate-mandatory)
```

**Files to edit (priority order):**

| Priority | File | Restatements to convert | Impact |
|---|---|---|---|
| 1 | protocol/copilot-instructions-v7.md | 6 rules (Command Lock, Proof-of-Read, Gate, Green Gate, Stop-on-Error, One-prompt) | HIGH — worst offender |
| 2 | protocol/working-agreement-v1.md | 5 rules (Confidence Gate, Gate, Proof-of-Read, Green Gate, Stop-on-Error) | MEDIUM |
| 3 | standards/research-standard.md | 2 rules (Confidence Gate full restatement, RESEARCH-ONLY) | MEDIUM |
| 4 | protocol-primer.md | 3 rules (Confidence Gate, Command Lock, RESEARCH-ONLY) | LOW — primer role may justify restatement |
| 5 | protocol/stay-on-track.md | Checklist references (Proof-of-Read, Gate, Green Gate) | LOW — checklist format may be acceptable |
| 6 | MIGRATION-INSTRUCTIONS.md | 2 rules (Command Lock, Stop-on-Error) | LOW — onboarding doc |

**Do NOT convert (acceptable classes):**
- Templates (EVIDENCE-PACK-TEMPLATE, test-touch-block-template, closeout-template) — checklists need inline text
- protocol-lite.md — already uses stub pattern correctly
- OCTOPUS-INVARIANTS.md — is itself canonical for overlays
- required-artifacts.md — is itself canonical for Population Gate

**Success criteria:**
1. Each converted file has ≤1 sentence of rule text + a working `→ See [canonical](link)` pointer
2. No rule logic lost — the canonical source still contains the full definition
3. Grep for key rule phrases shows only canonical + template files, not restatement files

**Risks:**
- **protocol-primer.md** — ChatGPT onboarding doc. ChatGPT can't follow markdown links. May need to keep restatements with a `<!-- canonical: protocol-v7.md § ... -->` annotation instead.
- **copilot-instructions-v7.md** — Copilot loads this as system instructions. If Copilot can't follow links to protocol-v7.md at runtime, stubs may weaken enforcement. Test by running one prompt with stubbed instructions before committing.

**Suggested split:** Do copilot-instructions-v7.md + working-agreement-v1.md first (high-value). Defer protocol-primer.md pending ChatGPT link-following test.

---

### Execution Order

```
PR A (version hygiene)  →  PR B (broken links)  →  PR C (rule dedupe)
     ~30 min                    ~45 min                  ~90 min
     LOW risk                   MEDIUM risk              HIGH judgment
```

PR A first because it's mechanical and sets a clean version baseline. PR B second because self-broken links should be fixed before PR C changes cross-references. PR C last because it requires the most judgment and benefits from clean links established in PR B.

---

## Appendix: Search Evidence

All findings backed by `grep_search` across `**/*.md` with the following query families:

| Query Pattern | Purpose |
|---|---|
| `95%\|99%\|confidence.*threshold\|Tiered Confidence\|confidence gate` | Confidence Gate rule family |
| `Command Lock\|Lock A\|Lock B\|NO terminal commands.*NO file edits` | Command Lock rule family |
| `Proof-of-Read\|proof.of.read` | Proof-of-Read rule family |
| `Prompt Review Gate` | Prompt Review Gate rule family |
| `Green Gate\|Build Gate\|npm run test.*npm run build` | Green Gate rule family |
| `Population Gate\|placeholder.*scan\|TBD.*TODO.*TEMPLATE` | Population Gate rule family |
| `stop.*immediately\|non-zero exit\|STOP on.*error` | Stop on Error rule family |
| `one prompt at a time\|single.thread\|do not.*next prompt` | One-prompt-only rule family |
| `overlays outside\|overlays.*inside.*head\|Octopus` | Overlays outside head invariant |
| `RESEARCH.ONLY\|RESEARCH-ONLY mode` | RESEARCH-ONLY mode family |
| `Bundle.*v7\|File Version.*20` | Version hygiene scan |
| `\]\(\.\./` and `\]\(\.\./\.\./` | Relative link extraction |
| `Start-Here-For-AI\|stack-profile\.md\|ResearchIndex\|branches\.md` | Consumer-side link detection |
| `ExampleProject\|Angular route\|parseTagger` | Project-specific content scan |
