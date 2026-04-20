# Copilot Session Start — Kit Work

> Paste this at the top of every Copilot prompt when working on the **kit itself**.

---

Repo: vibe-coding-kit (Stephen-Ch/vibe-coding-kit)
Scope: DOCS ONLY (unless prompt says otherwise)
Canon docs: README.md (entry point), protocol/protocol-v7.md (full rules), protocol-lite.md (quick ref)
Gate command: `.\tools\doc-audit.ps1` (must PASS before commit)
Output requirements: include PROMPT-ID + Completion Report in every response.
Hard rule: do NOT create a kit-root `/forGPT` directory.
Confidence below 95% = RESEARCH-ONLY mode. Do not guess.
Version file: VIBE-CODING.VERSION.md (bump patch on every doc change).
Kit planning: see ROADMAP.md (in this directory) for current priorities.
Use `Select-String` not `rg` (rg is not available on this system).
