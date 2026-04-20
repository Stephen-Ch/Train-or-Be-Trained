# Ghost-Heads Cleanup Report — rawls

**Report ID:** REPORT-OCTOPUS-GHOSTHEADS-CLEANUP-001
**Date:** 2026-02-08
**Repo:** Stephen-Ch/rawls
**Scope:** docs-only

## Canonical Subtree Root Kept

    docs/vibe-coding/

## Ghost-Head Paths Removed (19 files)

    docs/_legacy/vibe-coding-manual-2026-02-07/protocol/copilot-instructions-v7.md
    docs/_legacy/vibe-coding-manual-2026-02-07/protocol/protocol-v7.md
    docs/_legacy/vibe-coding-manual-2026-02-07/protocol/working-agreement-v1.md
    docs/_shared/v7/copilot-instructions-v7.md
    docs/_shared/v7/protocol-v7.md
    docs/_shared/v7/working-agreement-v1.md
    docs/_shared/v8/copilot-instructions-v7.md
    docs/_shared/v8/protocol-v7.md
    docs/_shared/v8/working-agreement-v1.md
    docs/_shared/v9/copilot-instructions-v7.md
    docs/_shared/v9/protocol-v7.md
    docs/_shared/v9/working-agreement-v1.md
    docs/forGPT/Start-Here-For-AI.md
    docs/forGPT/copilot-instructions-v7.md
    docs/forGPT/protocol-v7.md
    docs/forGPT/working-agreement-v1.md
    docs/protocol/copilot-instructions-v7.md
    docs/protocol/protocol-v7.md
    docs/protocol/working-agreement-v1.md

## Files Kept (not ghosts)

    docs/Start-Here-For-AI.md  (repo-specific, not a kit copy)
    docs/vibe-coding/protocol/protocol-v7.md  (canonical subtree)
    docs/vibe-coding/protocol/working-agreement-v1.md  (canonical subtree)
    docs/vibe-coding/protocol/copilot-instructions-v7.md  (canonical subtree)

## Proof Scan

Command: git ls-files | Select-String "protocol-v7|working-agreement-v1|copilot-instructions-v7|Start-Here-For-AI"

Result (post-staging): 0 ghost matches outside subtree root. Only canonical copies remain.

## Commit

    Hash: (filled after commit)
    PR: N/A (solo merge to main)
