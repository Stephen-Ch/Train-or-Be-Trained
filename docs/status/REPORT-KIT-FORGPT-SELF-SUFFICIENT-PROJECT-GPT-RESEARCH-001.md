# REPORT-KIT-FORGPT-SELF-SUFFICIENT-PROJECT-GPT-RESEARCH-001

> **Date:** 2026-04-18
> **Type:** Research-only
> **PROMPT-ID:** KIT-FORGPT-SESSIONSTART-SELF-SUFFICIENT-PROJECT-GPT-RESEARCH-001
> **Scope:** vibe-coding-kit — forGPT packet and session-start flow
> **Kit Version:** v7.3.2

---

## Research Report: Self-Sufficient Project GPT — forGPT Packet & Session-Start Gap Analysis

---

## 1. CURRENT GAP ANALYSIS

### What a project GPT currently knows well enough

From the CORE packet (13 files per the subtree-playbook spec):

| Knowledge area | Source in packet | Quality |
|----------------|-----------------|---------|
| Project identity + vision | VISION.md, EPICS.md | Good — direct copy from Control Deck |
| Active work state | NEXT.md | Good — if fresh. Stale NEXT.md = stale GPT |
| Session-start command | Start-Here-For-AI.md | Adequate — thin shell with correct paths |
| Protocol rules (raw) | protocol-v7.md | Excessive — 1,900 lines of raw protocol. GPT gets the text but struggles to extract *what matters for it* vs *what matters for Copilot* |
| Copilot-specific rules | copilot-instructions-v7.md | Wrong audience — this file governs Copilot behavior, not GPT behavior |
| Working agreement | working-agreement-v1.md | Partially relevant — role table and prompt classes are useful; Copilot-specific execution rules are not |
| Prompt lifecycle | prompt-lifecycle.md | Useful for GPT as prompt-writer |
| Session checklist | session-start-checklist.md | Marginally useful — GPT doesn't run the checklist; Copilot does |
| Pause state | PAUSE.md | Good — captures handoff context if fresh |
| Research index | ResearchIndex.md | Good — prevents redundant research |
| Branch state | branches.md | Good — context on what's open |
| Kit readme | vibe-coding.README.md | Low value — describes kit structure, not project work |

### What a project GPT does NOT know well enough

| Missing knowledge | Impact | Where thread loss happens |
|-------------------|--------|--------------------------|
| **Its own role and boundaries** | GPT has no document saying "you are the Planner, here's what YOU do vs what Copilot does." The `protocol-primer.md` serves this purpose but is NOT in the packet. | User must re-explain GPT's role every session. |
| **What Octopus IS (compressed mental model)** | GPT gets 1,900 lines of protocol-v7.md but no 50-line "here's the model." It can't distinguish vendor rules from repo rules, or session-level gates from prompt-level gates. | GPT either ignores protocol (too long) or over-applies it (tries to enforce Copilot gates on itself). |
| **What changed since last session** | NEXT.md says what's active but not what *just* happened. PAUSE.md captures end-of-session state but only if it was updated. There's no "recent changes" summary. | User must manually narrate "last time we did X, now we need Y." |
| **Kit-vs-consumer boundary** | GPT has no clear doc saying "these files are vendor (don't suggest editing them), these are yours (edit freely)." The subtree-playbook explains it but isn't in the packet. | GPT suggests editing protocol-v7.md directly. User corrects. Repeat next session. |
| **How to handle Octopus-related changes in a consumer repo** | When the user says "pilot this kit pattern here," GPT has no guidance on how to safely adopt a kit change locally — what goes in overlays, what goes in .github, what stays in kit head. | User must manually explain the overlay pattern every time. |
| **Overlay contents** | The packet includes Start-Here-For-AI.md (which links to overlays) but does NOT include the actual overlay files (stack-profile.md, hot-files.md, repo-policy.md). GPT can't see Green Gate commands, hot files, or branch policy. | GPT writes prompts without knowing the build/test commands. Copilot has to look them up anyway, but GPT can't validate prompt accuracy. |
| **Session-start output interpretation** | GPT doesn't know what session-start produces or what each gate verdict means. When the user pastes session-start output, GPT can't interpret PASS/WARN/BLOCKED verdicts. | User must explain "this WARN means X" manually. |
| **Recommended next step (synthesized)** | NEXT.md has the declared next step, but there's no synthesis of: NEXT.md + PAUSE.md + open PRs + blockers → "here's what you should do." GPT must do this synthesis from raw docs every time. | Thread loss: GPT misreads stale NEXT.md data or misses a blocker hidden in PAUSE.md. |

### Where thread loss happens today

1. **Role confusion** — GPT doesn't know its role boundaries. It either tries to execute (outputting terminal commands) or becomes too passive (just echoing back docs).
2. **Protocol overload** — GPT gets the full protocol but can't extract what's relevant to planning. It either ignores all rules or rigidly applies Copilot-specific gates to its own output.
3. **Stale state** — NEXT.md or PAUSE.md wasn't updated last session. GPT proposes work that was already done.
4. **Kit change confusion** — When piloting a kit pattern, GPT doesn't know the vendor/consumer boundary and suggests edits to kit-head files.
5. **Manual context stitching** — User carries session-start output, recent commit history, and "what we talked about with the other GPT" manually between chats.

---

## 2. REQUIRED CAPABILITIES FOR A SELF-SUFFICIENT PROJECT GPT

A project GPT, from local docs alone, must be able to:

| Capability | Source needed | Currently available? |
|------------|--------------|---------------------|
| **Know its role** — "I am the Planner/Prompt Writer; I draft prompts, not execute" | GPT-role doc | NO — `protocol-primer.md` exists but isn't in packet |
| **Understand Octopus at the right altitude** — gates, confidence rule, vendor vs consumer, overlay pattern | Compressed Octopus model | NO — only raw 1,900-line protocol |
| **Read current project state** — active story, next step, blockers, open PRs | NEXT.md + PAUSE.md + branches.md | PARTIAL — docs are in packet but not synthesized |
| **Know repo-specific commands and conventions** — build, test, hot files, branch policy | Overlay files (stack-profile, hot-files, repo-policy) | NO — overlays not in packet |
| **Interpret session-start output** — PASS/WARN/BLOCKED verdicts and what to do about each | Session-start output guide | NO — nothing explains verdicts to GPT |
| **Write correct prompts** — use template, cite NEXT.md, include PROMPT-ID | prompt-template.md + working-agreement-v1.md | YES — in packet |
| **Suggest the next step** — synthesize state into a recommendation | Synthesis guidance | NO — GPT must figure this out ad hoc |
| **Handle kit changes safely** — know what's editable vs vendor-locked, how overlays work | Kit/consumer boundary guide | NO — no compressed boundary doc |
| **Know what changed recently** — last session's work, recent commits, open PRs | Recent-changes context | NO — only static PAUSE.md if updated |

---

## 3. FORGPT PACKET IMPROVEMENTS

### Recommended additions (ranked by impact)

#### 3A. Add `GPT-ROLE.md` — Compressed Planner Role Guide (NEW FILE, kit-owned)

**File:** New file in kit: `templates/gpt-role-template.md`. Consumer copies to `<DOCS_ROOT>/forGPT/GPT-ROLE.md` via manifest.

**Why:** The single highest-impact gap. Without a role doc, every session starts with implicit role negotiation. `protocol-primer.md` partially covers this but is 100 lines and mixes role definition with prompt templates and command references.

**What it solves:** Role confusion, over-execution by GPT, passivity, protocol overload.

**Content (target: 40-60 lines):**
- Your role: Planner/Prompt Writer. Draft prompts for Copilot. Do not execute.
- What you own: prompt composition, story interpretation, research direction, kit adoption guidance
- What Copilot owns: file edits, terminal commands, gate enforcement, completion reports
- The confidence rule: if <95%, draft a RESEARCH-ONLY prompt
- Prompt pattern: use PROMPT-ID, cite NEXT.md, include scope
- What "session-start output" means: PASS = proceed, WARN = review, BLOCKED = stop
- Kit vs consumer: files under `vibe-coding/` are vendor-locked. Your repo-specific docs are in `project/`, `overlays/`, `research/`, `status/`
- When user says "pilot an Octopus pattern": changes go in overlays or `.github/`, never in kit head

**Bulk risk:** Low. Target 40-60 lines. Replaces the need for GPT to parse 1,900 lines of protocol-v7.md for its own role.

**Kit vs consumer:** Template is kit-owned. Consumer copies/customizes.

#### 3B. Add `PROJECT-STATE-SUMMARY.md` — Session-start generated state snapshot (NEW FILE, consumer-owned, tool-generated)

**File:** Generated by session-start.ps1 into `<DOCS_ROOT>/forGPT/PROJECT-STATE-SUMMARY.md`

**Why:** Today GPT must manually synthesize NEXT.md + PAUSE.md + branches.md + session-start output. This file pre-synthesizes them into one scannable snapshot.

**What it solves:** Stale state, manual context stitching, "what changed since last session?"

**Content (generated, ~30-50 lines):**
- Active story + next step (from NEXT.md)
- NEXT.md last-updated date and age
- PAUSE.md date and staleness classification
- Open PRs (count + titles, from git/gh)
- Session gate verdicts (PASS/WARN/BLOCKED for each gate)
- Kit version + consumer kit drift status
- Recent commits (last 3-5 on current branch)
- Blocking issues (from PAUSE.md)
- Decision Queue items (from PAUSE.md)

**Bulk risk:** Medium — 30-50 lines of generated content. But it replaces the need to upload and parse 3 separate docs for state context. Net savings likely positive.

**Kit vs consumer:** Tool change is kit-owned (session-start.ps1). Generated output is consumer-local (`<DOCS_ROOT>/forGPT/`).

#### 3C. Add overlay files to the manifest — stack-profile.md, hot-files.md (manifest change, consumer-owned)

**File(s):** Consumer's `forgpt.manifest.json` — add entries for:
- `overlays/stack-profile.md` → `stack-profile.md` (tier: core)
- `overlays/hot-files.md` → `hot-files.md` (tier: extra)
- `overlays/repo-policy.md` → `repo-policy.md` (tier: extra)

**Why:** GPT currently writes prompts without knowing the build command, test command, or which files are hot. It can't write a correct Green Gate section or flag hot-file risks.

**What it solves:** GPT writing prompts with wrong/missing gate commands. Copilot having to correct prompts.

**Bulk risk:** Low. Overlays are typically 20-60 lines each. 2-3 extra files.

**Kit vs consumer:** Pure consumer manifest change. Kit provides guidance in docs; consumer adds entries.

#### 3D. Remove `copilot-instructions-v7.md` from GPT packet — wrong audience

**File:** Consumer's `forgpt.manifest.json` — move from tier: core to tier: remove (or don't include).

**Why:** This file is Copilot-specific execution guidance. GPT doesn't enforce gates, run Green Gate, or execute Proof-of-Read. Including it creates confusion about what GPT must do vs what Copilot does.

**What it solves:** GPT trying to enforce Copilot-specific gates on its own output. Protocol overload.

**Bulk risk:** Negative (reduces bulk). Saves ~60 lines from packet.

**Kit vs consumer:** Consumer manifest change. Kit documents the recommendation.

#### 3E. Remove raw `protocol-v7.md` from GPT packet — replace with compressed model

**File:** Consumer's `forgpt.manifest.json` — remove protocol-v7.md. Replace with GPT-ROLE.md (3A above) which contains the compressed model.

**Why:** 1,900 lines of protocol is too much for GPT. GPT needs to understand the *model*, not enforce the *rules*. The rules are Copilot's job.

**What it solves:** Protocol overload. GPT ignoring or misapplying rules.

**Bulk risk:** Large bulk reduction (~1,900 lines removed, ~50 lines added).

**Caveat:** If GPT occasionally needs to reference a specific protocol section (e.g., when composing a prompt about a gate), it can ask the user to paste the relevant section or reference the file path. This is rare and acceptable.

**Kit vs consumer:** Kit documents the recommendation. Consumer adjusts manifest.

#### 3F. Add `session-start-checklist.md` interpretation guidance to GPT-ROLE.md (not a separate file)

Instead of a separate doc, include a 10-line section in GPT-ROLE.md (3A) explaining:
- What each gate verdict means
- What GPT should do when user pastes WARN or BLOCKED
- When to recommend Mid-Session Reset vs continuing

**What it solves:** GPT can't interpret session-start output.

**Bulk risk:** Zero — absorbed into GPT-ROLE.md.

---

### Summary: forGPT packet changes

| Change | Action | Impact | Bulk delta |
|--------|--------|--------|------------|
| Add GPT-ROLE.md | New file from kit template | HIGH — eliminates role confusion | +50 lines |
| Add PROJECT-STATE-SUMMARY.md | Generated by session-start.ps1 | HIGH — eliminates manual state stitching | +40 lines (generated) |
| Add overlays to manifest | Consumer manifest change | MEDIUM — enables accurate prompt writing | +60-120 lines (varies) |
| Remove copilot-instructions-v7.md | Consumer manifest change | MEDIUM — reduces noise | −60 lines |
| Remove protocol-v7.md | Consumer manifest change, add GPT-ROLE.md | HIGH — eliminates protocol overload | −1,900 lines, net massive reduction |
| Verdict interpretation in GPT-ROLE.md | Absorbed into 3A | MEDIUM — enables GPT to act on session-start output | +0 (already in 3A) |

**Net packet size change:** Dramatically smaller and more targeted. ~1,900 lines of raw protocol replaced by ~50 lines of compressed GPT-specific guidance.

---

## 4. SESSION-START IMPROVEMENTS

### 4A. Generate `PROJECT-STATE-SUMMARY.md` in forGPT directory

**Type:** Tool change (session-start.ps1)

**Exact output:** A markdown file at `<DOCS_ROOT>/forGPT/PROJECT-STATE-SUMMARY.md` containing:

```
# Project State — [timestamp]

## Active Work
- **Story:** [from NEXT.md ACTIVE STORY ID]
- **Next Step:** [from NEXT.md NEXT STEP]
- **NEXT.md Age:** [N days since last commit to NEXT.md]
- **Branch:** [current branch]

## Session Gates
| Gate | Verdict |
|------|---------|
| Consumer-Kit Drift | PASS / WARN / BLOCKED |
| Staleness Expiry | PASS / WARN / BLOCKED |
| Decision Queue | PASS / WARN / BLOCKED |
| Tool/Auth Fragility | PASS / WARN / BLOCKED |
| Doc Audit (Population) | PASS / FAIL |

## Context
- **Kit Version:** [from VIBE-CODING.VERSION.md]
- **Open PRs:** [count + titles if gh available]
- **Blocking Issues:** [from PAUSE.md or "None"]
- **Decision Queue:** [count + items if any]

## Recent Activity
- [last 3-5 commits, one-line each]

## PAUSE.md State
- **Date:** [from PAUSE.md]
- **Status:** [from PAUSE.md]
- **Staleness:** CURRENT / STALE / EXPIRED
```

**How this reduces user burden:** User runs session-start, then uploads the forGPT folder. GPT reads PROJECT-STATE-SUMMARY.md first and immediately knows: where we are, what's blocked, what's next, what happened recently. No manual narration needed.

### 4B. Print "forGPT packet refreshed" with file count after sync

**Type:** Tool change (session-start.ps1 — already partially does this)

**Exact output:** After sync completes, add to the session audit block:

```
forGPT:     SYNCED (14 files, including PROJECT-STATE-SUMMARY.md)
            Upload: <DOCS_ROOT>/forGPT/ to start GPT session
```

**How this reduces user burden:** Explicit prompt to upload. User doesn't have to remember.

### 4C. Include overlay summary in session-start audit block

**Type:** Tool change (session-start.ps1)

**Exact output:** Add one line to the session audit block:

```
Overlays:   4 found (stack-profile, hot-files, repo-policy, merge-commands)
```

**How this reduces user burden:** Confirms which overlays are active. If missing (e.g., hot-files not yet created), it surfaces as a gap.

---

## 5. PROJECT GPT UNDERSTANDING OF OCTOPUS

### Essential concepts (every project GPT must carry)

| Concept | Compressed form (1-2 sentences) |
|---------|--------------------------------|
| **Dual-agent model** | GPT plans and writes prompts. Copilot executes. Neither does both. |
| **Confidence gate** | If confidence <95%, draft a RESEARCH-ONLY prompt. Never guess. |
| **Vendor vs consumer** | Files under `vibe-coding/` are vendor-locked — never edit them. Your project docs are in `project/`, `overlays/`, `research/`, `status/`. |
| **Overlay pattern** | Project-specific customizations (build commands, hot files, branch policy) go in `<DOCS_ROOT>/overlays/`. Never inside the kit head. |
| **Control Deck** | VISION.md + EPICS.md + NEXT.md define project state. NEXT.md is the live work authority. |
| **Prompt structure** | Every formal prompt needs: PROMPT-ID, scope, goal, tasks, STOP conditions. Cite NEXT.md. |
| **Session-start** | Always run `RUN START OF SESSION DOCS AUDIT` first. Gate verdicts: PASS = proceed, WARN = review, BLOCKED = stop. |
| **Kit changes in consumer repos** | When adopting a new Octopus pattern: changes go in overlays, `.github/copilot-instructions.md`, or consumer-owned docs — never in the kit subtree. |

### Concepts too detailed/noisy for every project GPT

| Concept | Why it's noise for GPT |
|---------|----------------------|
| Two-tier Command Lock (Lock A / Lock B) | Copilot enforcement detail. GPT doesn't execute commands. |
| Green Gate specifics (stack-aware build commands) | Copilot executes the gate. GPT just writes "run Green Gate" in the prompt. |
| Proof-of-Read mechanics (file + quote + "Applying: rule") | Copilot's output obligation, not GPT's. |
| Comprehension Self-Check questions | Copilot's gate, not GPT's. |
| Report Size Guardrail / Delta-Only Reports | Copilot's output formatting. |
| Doc Audit rerun detection logic | Tool behavior. GPT doesn't run tools. |
| DOCS_ROOT detection precedence | Tool internals. |
| Workspace Reality Gate detailed checklist | End-of-session Copilot procedure. |

### Recommended "Compressed Octopus Model" (what GPT-ROLE.md should carry)

Target: 8-12 key rules, each 1-2 sentences. Total: ~30 lines.

```
## How Octopus Works (For Planners)

1. You are the Planner. You draft prompts for Copilot to execute. You do NOT run commands, edit files, or claim to have done so.
2. Copilot is the Executor. It runs commands, edits files, enforces gates, and produces completion reports. Wait for each report before drafting the next prompt.
3. Confidence ≥95% required (≥99% for production code). Below threshold → draft a RESEARCH-ONLY prompt.
4. Every formal prompt needs a PROMPT-ID, scope declaration, and cites NEXT.md for the active story/step.
5. Session-start runs automatically via `RUN START OF SESSION DOCS AUDIT`. Gate verdicts: PASS = proceed, WARN = review issue then proceed, BLOCKED = full stop until resolved.
6. The kit (files under `vibe-coding/`) is vendor-locked. Never suggest editing them. Project customizations go in `overlays/`, `project/`, `.github/`, or consumer-owned docs.
7. Overlays (at `<DOCS_ROOT>/overlays/`) hold repo-specific rules: build commands, hot files, branch policy. Read them to write accurate prompts.
8. Control Deck (VISION.md, EPICS.md, NEXT.md) defines project state. NEXT.md is the live authority for what to do next.
9. When piloting a kit pattern in this repo: the change goes in overlays, `.github/copilot-instructions.md`, or consumer-owned docs. Never in the kit head.
10. If the user says "RUN MID-SESSION RESET," something went wrong. Help re-establish: what branch, what's the real next step, what's blocking.
```

---

## 6. BOUNDARY MODEL

### Clean operational boundaries

| Actor | Owns | Does NOT own |
|-------|------|-------------|
| **Vibe-coding GPT** (kit repo) | Kit protocol design. Kit doc authoring. Kit version management. Kit improvement briefs. Cross-repo pattern design. | Project-specific work. Consumer overlays. Project state management. |
| **Project GPT** (consumer repo) | Project story planning. Prompt composition for Copilot. Research direction. Kit pattern adoption *within its repo*. Interpreting session-start output. Next-step recommendation. | Kit protocol authoring. Protocol rule changes. Kit tooling changes. Cross-repo coordination. |
| **Kit repo** | Protocol docs, templates, standards, tools, subtree playbook. Portable patterns. GPT-ROLE template. | Project-specific Control Deck content. Overlays. forGPT manifest customizations. |
| **Consumer repo** | Control Deck, overlays, research, status, forGPT manifest, .github/copilot-instructions.md, Start-Here-For-AI.md. | Kit head content (read-only via subtree). |

### What should stay centralized in the kit

- Protocol rules (protocol-v7.md, hard-rules.md, etc.)
- Gate definitions and thresholds
- Templates (including GPT-ROLE template)
- Tools (session-start.ps1, sync-forgpt.ps1, doc-audit.ps1, end-session.ps1)
- Standards (research, stack-profile, friction-log)
- The compressed Octopus model (GPT-ROLE template — kit provides the template, consumer copies it)

### What must be local in each project

- Filled-in GPT-ROLE.md (from template, with project-specific context appended)
- forgpt.manifest.json (what goes in the packet)
- PROJECT-STATE-SUMMARY.md (generated by session-start)
- Overlay files (stack-profile, hot-files, repo-policy, merge-commands)
- Control Deck (VISION, EPICS, NEXT)
- PAUSE.md (session handoff)

### What a project GPT should do on its own

1. Read PROJECT-STATE-SUMMARY.md to understand current state
2. Read NEXT.md to understand the active story
3. Draft the next Copilot prompt (citing NEXT.md, using the correct scope)
4. Interpret session-start gate verdicts
5. Recommend the next step based on state synthesis
6. Handle kit adoption tasks locally (direct changes to overlays, not to kit head)
7. Draft RESEARCH-ONLY prompts when confidence is low
8. Recommend Mid-Session Reset when the session looks confused

### When a project GPT should defer to the vibe-coding GPT

| Situation | Why defer |
|-----------|----------|
| **Proposing a change to protocol rules** | Protocol authoring is centralized. Project GPT can identify a friction point but should not draft the protocol fix — that's kit work. |
| **Designing a new cross-repo pattern** | Cross-repo patterns need cross-repo visibility. Project GPT sees one repo. |
| **Kit subtree conflicts** | Merge conflicts in the kit head require understanding of kit version history. |
| **Questioning whether a rule is correct** | Project GPT should flag "this rule seems wrong/contradictory" and pause. The vibe-coding GPT investigates. |

**Key principle:** Project GPT should defer **rarely** — only when the action requires kit-level authority or cross-repo visibility. The goal is that 90%+ of sessions run without any cross-chat handoff.

---

## 7. PRIORITIZED RECOMMENDATIONS

| Rank | Change | Biggest reduction | Effort |
|------|--------|-------------------|--------|
| **1** | **Create GPT-ROLE template** (3A) — compressed Octopus model + role definition + verdict interpretation | Role confusion, protocol overload, thread loss | Small — one new 50-line template in kit |
| **2** | **Generate PROJECT-STATE-SUMMARY.md** (3B + 4A) — session-start produces a pre-synthesized state snapshot | Manual context stitching, stale state, "what's next?" guessing | Medium — tool change to session-start.ps1 |
| **3** | **Add overlays to manifest** (3C) + **remove protocol-v7.md and copilot-instructions-v7.md** (3D, 3E) — right-size the packet | Prompt accuracy, protocol overload, bulk | Small — consumer manifest change + kit docs guidance |
| **4** | **Add overlay summary to session-start audit block** (4C) | Gap visibility | Small — one-line tool change |
| **5** | **"forGPT packet refreshed" prompt in session-start** (4B) | Forgotten upload step | Tiny — already mostly there |

---

## 8. SUCCESS CRITERIA

| Observable outcome | How to measure | Target |
|--------------------|----------------|--------|
| **Fewer cross-chat handoffs** | Count sessions where user must switch to vibe-coding GPT for project work | ≤1 per 5 project sessions (down from ~1 per 1-2 sessions) |
| **Project GPT answers "what's next?" after session-start** | After uploading forGPT folder, ask "what should we do next?" — GPT provides a correct, specific answer without user narration | Correct answer in first response, 4 out of 5 sessions |
| **Less manual restitching** | Count times user must paste session-start output and explain what it means | Zero (PROJECT-STATE-SUMMARY.md replaces this) |
| **Fewer Octopus strategy/execution confusions** | Count times GPT tries to execute commands, edit files, or enforce Copilot-specific gates | Zero after GPT-ROLE.md adoption |
| **More accurate next-step recommendations** | GPT's suggested next step matches what the user actually wants to do | Correct or close-to-correct 4 out of 5 times |
| **Kit change safety** | When piloting an Octopus pattern, GPT correctly directs changes to overlays/consumer docs, never to kit head | 100% correct (zero kit-head edit suggestions) |

---

## 9. FINAL RECOMMENDATION

### Do first (1-2 implementation prompts)

1. **Create GPT-ROLE template** — A new `templates/gpt-role-template.md` in the kit. ~50 lines. Contains compressed Octopus model, role boundaries, verdict interpretation, kit/consumer boundary guide. Consumer copies to forGPT via manifest. This is the single highest-leverage change.

2. **Generate PROJECT-STATE-SUMMARY.md in session-start.ps1** — Extend session-start to write a state snapshot into `<DOCS_ROOT>/forGPT/`. This requires a tool change but is contained to one file and one output.

### Do second (after validating #1 and #2 in one repo)

3. **Right-size the packet** — Update recommended manifest guidance: add overlays (stack-profile, hot-files), remove protocol-v7.md and copilot-instructions-v7.md, add GPT-ROLE.md. Document as recommended manifest in subtree-playbook.md.

### Do NOT do now

- **Do NOT build cross-GPT orchestration tools** — The goal is independence, not better handoffs.
- **Do NOT create a "GPT agent" in VS Code** — VS Code customizations serve Copilot. GPT lives in its own interface.
- **Do NOT dump more protocol docs into the packet** — The problem is too much raw protocol, not too little. Compress, don't expand.
- **Do NOT create consumer-specific GPT-ROLE files in the kit** — The kit provides the template. Each consumer fills in project context. Repo-specific content stays in the consumer.
