# forGPT Packet — Rawls Game

> **Rule:** The forGPT packet is GENERATED. Do NOT manually add files here.
> Run `docs/vibe-coding/tools/sync-forgpt.ps1` from the project root to regenerate.

## What is this folder?

This folder contains a **generated snapshot** of the minimum docs needed to start a productive GPT/Copilot session for the Rawls Game project. Files here are copies — the canonical sources live elsewhere under `docs/`.

## How to use

1. **Regenerate before uploading:**
       cd <project-root>
       .\docs\vibe-coding\tools\sync-forgpt.ps1

2. **Upload the entire `docs/forGPT/` folder** to your AI session.

3. **Check VERSION-MANIFEST.md** to verify freshness (timestamp + commit hash).

## Manifest

The file list is controlled by `forgpt.manifest.json`. To add or remove files from the packet, edit the manifest and re-run sync.

- **CORE** files: Session-start essentials (protocol, control deck, research index).
- **EXTRA** files: Supporting context (test catalog, tech debt, solution report).

## Legacy quarantine

If any manual/legacy packet files exist that are not in the manifest, they are moved to `_legacy/` subdirectory during standardization. Do not delete them — they are preserved for reference.
