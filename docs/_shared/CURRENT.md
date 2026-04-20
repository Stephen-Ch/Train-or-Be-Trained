# Shared Docs Version Pointer

> Snapshot Notice: [docs/vibe-coding](../vibe-coding) holds the authoritative workflow copies. Everything under `docs/_shared` is a frozen snapshot for reference—do not edit these files or use them as live working docs.

**Current shared docs version: v9**

## Version v9 Files

- [protocol-v7.md](v9/protocol-v7.md)
- [copilot-instructions-v7.md](v9/copilot-instructions-v7.md)
- [working-agreement-v1.md](v9/working-agreement-v1.md)
- [stay-on-track.md](v9/stay-on-track.md)
- [code-style.md](v9/code-style.md)
- [test-touch-block-template.md](v9/test-touch-block-template.md)
- [closeout-artifact-verification-template.md](v9/closeout-artifact-verification-template.md)
- [terminology-template.md](v9/terminology-template.md)
- [terminology-dictionary.md](v9/terminology-dictionary.md)

Canonical working docs live in docs/protocol/*. Snapshot lives in docs/_shared/v8/.

## Version Bump Rules

**When to bump:**
- When meaning, rules, or gates change (e.g., new Core Rule, changed gate threshold, modified prompt structure requirement)
- When cross-repo syncing needs a stable snapshot reference

**When NOT to bump:**
- Typo fixes only
- Formatting/whitespace changes only
- Minor clarifications that don't change the enforcement rule

**How to bump:**
1. Create new version folder: `docs/_shared/v9/`
2. Copy updated shared docs into the new version folder
3. Update this file (CURRENT.md) to point to the new version
4. Add a 1-line entry to CHANGELOG.md with date + summary
5. Commit with message: `docs: bump shared docs to v8 (reason)`

## Operational Note

This repo continues to use `docs/protocol/*` as the operational locations for day-to-day work. The `docs/_shared/` structure exists as a versioned snapshot for cross-repo syncing and to track when the shared protocol set has materially changed.

When syncing to other repos, reference the version in CURRENT.md and copy the entire `v7/` (or current version) folder.
