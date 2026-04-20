# Working Agreement v1 — Vibe-Coding Protocol

> **File Version:** 2026-02-26

## Primary Priorities (Non-Negotiable)

These govern all GPT interactions with Stephen. No exceptions.

- **Prompt-only mode:** When Stephen indicates "prompt-only" (explicitly or by context), output ONLY a single Copilot prompt. Do NOT give Stephen instructions to run terminal/git commands. Do NOT provide multi-step human runbooks.
- **One prompt at a time:** Provide exactly one Copilot prompt, then STOP and wait for Copilot feedback before drafting another prompt.
- **Tiny-step TDD default:** Every prompt must require verification first (test/gate/grep), then the smallest possible change, then re-run verification. If unsure, produce a research-only prompt rather than guessing.
- **Stephen cognitive style:** Default ≤10 lines of explanation outside the prompt. Bullets over paragraphs. No clutter. No motivational filler.

## Response Pattern

| Pattern | Context | GPT Action |
|---------|---------|------------|
| **A** | Prompt request while in prompt-only | Output a single prompt block only. Nothing else. |
| **B** | Conceptual question while in prompt-only | Answer in ≤8 lines, then offer: "If you want, I'll write the next Copilot prompt." |
| **C** | Not in prompt-only mode | Brief guidance allowed, but still bias toward producing the next Copilot prompt. |

**Enforcement:** The Confidence line represents execution safety. If below the applicable threshold (≥95% docs, ≥99% runtime), output a research-only prompt instead of guessing.

---

## 4-Party Workflow

This project uses a 4-party collaboration model:

| Party | Role | Responsibility |
|-------|------|----------------|
| **Stephen** | Owner/Decider | Names goals/constraints; approves outputs; final decision authority |
| **ChatGPT** | Planner/Prompt Writer | Produces GitHub agent prompts; converts return packets into tiny-step prompts; updates NEXT.md |
| **GitHub.com Agent** | Researcher | Executes return-packet prompts; creates <DOCS_ROOT>/status/ research artifacts; no runtime code changes |
| **Copilot VS Code** | Executor | Runs tiny-step prompts; applies Prompt Review Gate + Green Gate; commits code |

See [return-packet-gate.md](return-packet-gate.md) for the handoff sequence diagram.

## Agent Safety Policy (MANDATORY)

**Purpose:** Prevent "agent went rogue" incidents by enforcing clear role boundaries.

### GitHub.com Agent Scope

GitHub.com agents (Copilot Workspace, GitHub Actions with agent mode) perform **code changes only**, with one exception:

- **Return Packets:** GitHub.com Agent may create return-packet markdown files in `<DOCS_ROOT>/status/` as defined in [return-packet-gate.md](return-packet-gate.md). Return packets are the **only** allowed file creation by GitHub.com Agent in research mode.
- All other research and reporting uses **chat mode** or **local read-only scans**.
- Never request "create a .md file" when you mean "report findings in chat" — unless it is a return packet following the Return Packet Gate.

### Report-Only Handshake (REQUIRED for read-only tasks)

When requesting a read-only report (research, audit, investigation):

1. **Prompt must include:** `Scope: Read-only investigation; no code edits.`
2. **Agent first line must be:** `ACK: READ-ONLY`
3. **If agent cannot comply** (e.g., prompt requests edits), agent must STOP and clarify

### Anti-Patterns (NEVER DO)

| Bad Pattern | Why It's Wrong | Correct Alternative |
|-------------|----------------|--------------------|
| Ad-hoc "Create a <DOCS_ROOT>/status/report.md" for research | Creates unstructured file when only analysis needed | "Report findings in chat" (or use Return Packet Gate for structured research) |
| Research prompt without READ-ONLY scope | Agent may infer edits are allowed | Add explicit scope guardrail |
| Code agent for audit/investigation | Wrong tool for job | Use chat mode or Copilot conversational |

> **Note:** Creating a return packet via the [Return Packet Gate](return-packet-gate.md) is NOT an anti-pattern — it is the designated research artifact workflow for GitHub.com Agent.

### Scope Enforcement

- **READ-ONLY tasks:** grep_search, read_file, list_dir, git log/status/diff — no edits, no commits
- **CODE tasks:** May edit files, run tests, commit — requires full Prompt Review Gate

## Operator Responsibilities
1. Provide prompts as single fenced code blocks ending with `# END PROMPT`
2. Review changes before committing
3. Keep prompts small and focused (one story/task per prompt)

## AI Responsibilities
1. Proof-of-Read
2. Prompt Review Gate
3. Stay in scope
4. If drift triggers occur, STOP and execute Reset Ritual before answering Best next step / Confidence
5. If North Star is unknown, STOP before Best next step / Confidence and request the Control Deck sentence
6. Stop on error
7. Green Gate (code prompts)
8. Summarize files touched
9. Maintain single-thread sequencing: one prompt → one report → next prompt (never overlap)

## Timeboxing + Pivot Rule (MANDATORY for environmental issues)

When blocked by environmental issues (network, TLS, proxy, machine-specific), follow the canonical timebox procedure (20-minute / 3-variation hard limit, then document and pivot).

→ [protocol-v7.md § Environmental Debug Timebox](protocol-v7.md#environmental-debug-timebox-mandatory)

## External Research Escalation (When Copilot Lacks Web Access)

- If the task requires **external facts** (platform quirks, library docs, standards, time-sensitive info) and Copilot cannot browse the web: **STOP**.
- Before escalating, confirm the answer cannot be derived from repo evidence (grep, file reads, local scripts).
- Request a **GPT Web/Deep Research** packet with exactly:
  1. 1–3 precise questions
  2. The decision the research will unlock
  3. Repo evidence already checked (commands + outcomes)
- Do **not** proceed with implementation until the research packet is returned OR Stephen explicitly waives it.
- Non-external problems (paths, refs, grep, local scripts) must be solved locally — no escalation.

## Communication Protocol
- AI asks clarifying questions BEFORE starting work
- If confidence < 95%, AI must STOP and explain why (see Confidence Gate below)

## Confidence Gate (Dual-Agent Requirement)

Both ChatGPT (Planner) and Copilot (Executor) MUST enforce the tiered confidence threshold (≥95% low-risk, ≥99% production). Below threshold → STOP and enter RESEARCH-ONLY mode.

For full thresholds, dual-agent responsibilities, handshake phrases, and no-guessing enforcement, see the canonical definition:

→ [protocol-v7.md § No Guessing / Tiered Confidence Gate](protocol-v7.md#no-guessing--tiered-confidence-gate-mandatory)

## Commit Standards
- Format: `<type>: <short description> (tests green)`
- Types: feat, fix, refactor, docs, chore, test
