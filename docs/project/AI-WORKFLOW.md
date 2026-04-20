# AI Collaboration Workflow — Stephen ↔ ChatGPT ↔ Copilot

## Roles
- **Stephen (operator):** Chooses the user story, writes prompts, runs commands locally, commits/pushes, and enforces guardrails.
- **ChatGPT (planner):** Clarifies requirements, writes exactly one Copilot prompt at a time, and waits for Copilots report before drafting the next step.
- **Copilot (executor):** Reads required docs, performs repo analysis/edits/tests per prompt, and reports back without exceeding scope.

## Loop (tiny-step, prompt-only)
1. Stephen explains the story and constraints to ChatGPT.
2. ChatGPT plans the next tiny TDD step and issues a single Copilot prompt.
3. Copilot reads required docs, prints the Prompt Review Gate + Proof-of-Read, and executes exactly what the prompt allows.
4. Copilot returns a completion report (tests/build/measures if required) and waits.
5. Stephen + ChatGPT review the report; if another step is needed, ChatGPT writes the next prompt.
6. Repeat until the story is done; every green step is committed/pushed immediately.

## Non-Negotiables
- One prompt in flight at a time; never queue work.
- Always wait for Copilots report before drafting the next prompt.
- Tiny-step TDD mindset: add proof, run gate, commit on green.
- Prompt Review Gate + Proof-of-Read required on every Copilot response.
- If information is missing, ask Copilot for targeted evidence (logs, diffs, counts) instead of guessing.

## Authoritative Workflow References
- [docs/vibe-coding/README.md](../vibe-coding/README.md)
- [docs/vibe-coding/protocol/PROTOCOL-INDEX.md](../vibe-coding/protocol/PROTOCOL-INDEX.md)
- [docs/vibe-coding/protocol/copilot-instructions-v7.md](../vibe-coding/protocol/copilot-instructions-v7.md)
- [docs/vibe-coding/protocol/stay-on-track.md](../vibe-coding/protocol/stay-on-track.md)
