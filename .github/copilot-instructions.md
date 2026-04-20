# Copilot Instructions — Rawls Game (Enforcer)

## Session Start (MANDATORY FIRST COMMAND)

Run: `docs/vibe-coding/tools/run-vibe.ps1 -Tool session-start`
If run-vibe.ps1 is unavailable, run: `docs/vibe-coding/tools/session-start.ps1`
Chains: kit update → forGPT sync → doc-audit -StartSession → prints 5-line gate.
Do not proceed until this is run successfully.

Before any work:
1) Read `docs/project/RAWLS-START-HERE.md`
2) Follow `docs/vibe-coding/protocol/PROTOCOL-INDEX.md` + `docs/vibe-coding/protocol/copilot-instructions-v7.md`

Non-negotiables (every response):
1) Proof-of-Read (file + quote + "Applying: rule")
2) Prompt Review Gate (what / best next step YES/NO / confidence)
3) Stop on error (non-zero exit → stop, propose smallest fix, wait)
4) Green Gate for code prompts:
   - npm run test
   - npm run build

Prompt format enforcement:
- Single fenced block
- Must end with: `# END PROMPT`

Scope discipline:
- Stay inside SCOPE GUARDRAILS
- No "I tested in browser" claims; report only commands + results
