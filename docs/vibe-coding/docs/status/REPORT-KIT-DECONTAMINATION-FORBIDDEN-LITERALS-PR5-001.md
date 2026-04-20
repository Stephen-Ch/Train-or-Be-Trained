# REPORT: Kit Decontamination — Forbidden Literals (PR5-001)

> **Date:** 2026-02-09
> **Branch:** docs/kit-decontaminate-pr5-001
> **Prompt-ID:** KIT-DECONTAMINATION-SCRUB-FORBIDDEN-LITERALS-PR5-001

---

## A) Branch + Commit

- **Branch:** docs/kit-decontaminate-pr5-001
- **Base:** main (f3793ad)
- **Commit:** bc6ef74
- **PR:** https://github.com/Stephen-Ch/vibe-coding-kit/pull/5

## B) Terms Scanned (8 total)

> **Coding convention:** To prevent this report from triggering its own scan,
> forbidden terms are abbreviated below. Key:
> L-W = Lesson + Writer, D-C = Dealers + Choice, Mort = Mortal + ity,
> Rwls = Raw + ls, B-J = Black + jack, OPR = OurProjects + RandD,
> D-A = DC + -API, Shrd = Shar + ad

1. L-W
2. D-C
3. Mort
4. Rwls
5. B-J
6. OPR
7. D-A
8. Shrd

## C) BEFORE Scan

| Term | Matches |
|------|---------|
| L-W | 32 |
| D-C | 1 |
| Mort | 1 |
| Rwls | 17 |
| B-J | 12 |
| OPR | 5 |
| D-A | 1 |
| Shrd | 6 |
| **TOTAL** | **75** |

## D) AFTER Scan

| Term | Matches |
|------|---------|
| L-W | 0 |
| D-C | 0 |
| Mort | 0 |
| Rwls | 0 |
| B-J | 0 |
| OPR | 0 |
| D-A | 0 |
| Shrd | 0 |
| **TOTAL** | **0** |

## E) Top 15 Files by Match Count (BEFORE)

| File | Matches |
|------|---------|
| protocol/copilot-instructions-v7.md | 15 |
| portability/subtree-playbook.md | 14 |
| MIGRATION-INSTRUCTIONS.md | 10 |
| protocol/protocol-v7.md | 7 |
| VIBE-CODING-KIT-VERSION-2025-12-27.txt | 3 |
| protocol-lite.md | 3 |
| portability/user-story-stephen-vibe-coding.md | 3 |
| protocol/required-artifacts.md | 3 |
| standards/stack-profile-standard.md | 2 |
| protocol/stay-on-track.md | 2 |
| templates/github-agent-return-packets-prompt-template.md | 2 |
| PAUSE.md | 2 |
| protocol/alignment-mode.md | 1 |
| protocol/merge-prompt-template.md | 1 |
| protocol/prompt-lifecycle.md | 1 |

## F) Files Changed

    MIGRATION-INSTRUCTIONS.md
    PAUSE.md
    VIBE-CODING-KIT-VERSION-2025-12-27.txt
    portability/subtree-playbook.md
    portability/user-story-stephen-vibe-coding.md
    protocol-lite.md
    protocol-primer.md
    protocol/alignment-mode.md
    protocol/copilot-instructions-v7.md
    protocol/merge-prompt-template.md
    protocol/prompt-lifecycle.md
    protocol/protocol-v7.md
    protocol/required-artifacts.md
    protocol/stay-on-track.md
    protocol/verification-mode.md
    protocol/working-agreement-v1.md
    standards/stack-profile-standard.md
    templates/github-agent-return-packets-prompt-template.md
    templates/test-touch-block-template.md
    terminology/terminology-dictionary.md
    terminology/terminology-template.md
    tools/sync-forgpt.ps1
    docs/status/REPORT-KIT-DECONTAMINATION-FORBIDDEN-LITERALS-PR5-001.md (this report)

## G) Scope Note

Docs-only text changes; no tooling logic changed.

Replacements used:
- L-W / Rwls / B-J / D-C / Mort → "ExampleProject" (or "ExampleProjectA/B" where distinct examples needed)
- B-J Sensei (title suffix) → "Vibe-Coding Protocol"
- OPR → "ExampleOrg"
- D-A → "ExampleRepo"
- Shrd → "Maintainer" or "Reviewer" depending on context
