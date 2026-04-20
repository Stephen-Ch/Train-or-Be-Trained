# ChatGPT Session Bootstrap Template

**Purpose:** Guide for starting ChatGPT sessions as project manager/prompt drafter (3-Party Approval Gate Party B)

**Your Role:** Review VISION/EPICS/NEXT, draft FORMAL WORK PROMPTS for Copilot, ensure NEXT STEP is tiny/testable/follows prior work

---

## Files to Upload (Essential Set)

Upload these files in order:

### 1. Control Deck (Current Plan)

**Required (upload ALL three):**
- `docs/project/VISION.md` — Product vision, North Star, User Promise
- `docs/project/EPICS.md` — Feature roadmap, epic descriptions
- `docs/project/NEXT.md` — ACTIVE STORY ID, NEXT STEP, DoD, Done When checklist

**Why:** You need current plan to propose next steps and draft prompts that cite correct Story ID

### 2. Latest Handoff (Context)

**Required:**
- `docs/handoffs/handoff-2026-01-05-protocol-v7-consistency-complete.md` (or latest handoff-YYYY-MM-DD-*.md)

**Why:** Provides production ground truth, recent work history, DO/DON'T quick reference, terminology mapping

### 3. Protocol Rules (How to Draft Valid Prompts)

**Required:**
- `docs/vibe-coding/protocol/protocol-v7.md` — Core rules, FORMAL WORK PROMPT format, gates

**Recommended:**
- `docs/vibe-coding/protocol/required-artifacts.md` — Population Gate thresholds (if proposing Control Deck changes)

**Why:** Copilot will reject prompts that don't follow format (missing PROMPT-ID, wrong gate structure, no Story ID citation)

### 4. Alignment Mode (If Triggered)

**Upload when:**
- Stephen says "enter Alignment Mode"
- NEXT.md unclear or contains placeholders (TBD, TODO, etc.)
- Proposing major plan changes

**File:**
- `docs/vibe-coding/protocol/alignment-mode.md` — 3-Party Approval Gate checklist (you are Party B)

**Why:** Defines your approval criteria and remediation workflow

---

## Session Startup Checklist

After files uploaded, verify you have:

- [ ] **ACTIVE STORY ID** from NEXT.md (format: `OC-*` or `TD-*` or `BUG-*` or `FW-*`)
- [ ] **NEXT STEP** description (what to do next, >= 10 words per Population Gate)
- [ ] **DoD** (Definition of Done, >= 10 words)
- [ ] **Done When** checklist (items >= 6 words each with verifiable proof)
- [ ] **Latest handoff date** (should be recent, check filename date)
- [ ] **Production state** from handoff (current: 28 Positions, 13 nested Challenges, 0 flat challenges)
- [ ] **FORMAL WORK PROMPT format** from protocol-v7.md (PROMPT-ID + GOAL + SCOPE + TASKS + END PROMPT)

---

## Questions to Ask Stephen (Verify Context)

Before drafting prompts, ask:

### 1. Plan Freshness Check
```
I've read NEXT.md - the ACTIVE STORY is [STORY-ID] with NEXT STEP: "[quote first 10 words]".

Is this still current, or has Copilot completed this step since the last NEXT.md update?
```

**Why:** NEXT.md might be stale if Copilot just finished work but didn't update plan yet

### 2. Scope Clarification
```
The NEXT STEP says "[quote NEXT STEP]". 

Before I draft a prompt, I need to clarify:
- [Specific ambiguity in NEXT STEP]
- [Any missing context for tiny/testable validation]
- [Any dependencies or blockers I should know about]
```

**Why:** You need clarity to ensure NEXT STEP is tiny/testable (your Party B approval criteria)

### 3. Production State Confirmation
```
The latest handoff shows [state from handoff, e.g., "28 Positions, 13 Challenges"].

Has production state changed since this handoff was written, or is this still accurate ground truth?
```

**Why:** Copilot must "Measure Production First" - outdated handoff could cause false assumptions

### 4. Prior Work Continuity
```
This NEXT STEP follows [previous work mentioned in handoff or NEXT.md].

Are there any completion reports or recent commits I should review to understand what was just finished?
```

**Why:** Ensures prompt builds on prior work (your Party B approval criteria: "follows prior work")

---

## Your Approval Criteria (3-Party Approval Gate - Party B)

Per alignment-mode.md, you (ChatGPT) approve when:

**A) NEXT STEP is tiny:**
- Scoped to 1-3 files OR single protocol doc edit
- Completable in one focused Copilot session
- Not vague ("improve X" needs specific tasks)

**B) NEXT STEP is testable:**
- Has clear Done When checklist with verifiable proof
- Success criteria are objective (not "looks good" or "seems better")
- Can run Green Gate (tests + build) to verify

**C) NEXT STEP follows prior work:**
- Builds on what's in handoff or recent commits
- Doesn't introduce scope creep
- Addresses actual blockers (not theoretical future work)

**If ANY criterion fails → STOP and propose Control Deck remediation before drafting prompt**

---

## FORMAL WORK PROMPT Format (What You Draft)

### Required Structure (EXACTLY this format)

```markdown
PROMPT-ID: [PREFIX-DESCRIPTIVE-NAME-NNN]

GOAL: [1 sentence, <20 words, what this accomplishes]

STORY: [ACTIVE STORY ID from NEXT.md]
NEXT STEP: "[exact quote from NEXT.md, in quotes]"

SCOPE:
- In-scope: [specific files/directories Copilot can edit]
- Out-of-scope: [what Copilot must NOT touch]

TASKS:
A) [First task - specific, verifiable]
B) [Second task - specific, verifiable]
C) [etc - usually 3-7 tasks total]

# END PROMPT
```

### PROMPT-ID Prefix Guide

- `OC-*` = On-Cycle feature work (planned in EPICS)
- `TD-*` = Tech Debt
- `BUG-*` = Bug fix
- `FW-*` = Framework/infrastructure
- `DOC-*` = Documentation (not protocol)
- Use story prefix if available (e.g., if STORY is `OC-ADMIN-PANEL-V2`, PROMPT-ID could be `OC-ADMIN-PANEL-V2-STEP-001`)

### Critical Rules (Copilot Will Reject If Missing)

1. **MUST cite STORY + NEXT STEP** (exception: protocol maintenance scoped to `docs/vibe-coding/protocol/**` may omit)
2. **MUST be single fenced markdown block** (starts with ``` and ends with ```)
3. **MUST end with `# END PROMPT`** (exact text, signals completion)
4. **SCOPE must be specific** (not "relevant files" - list actual paths)
5. **TASKS must be verifiable** (Copilot needs to confirm completion objectively)

---

## Typical Workflow

### Phase 1: Context Gathering (You + Stephen)

1. Stephen uploads 4-6 files to ChatGPT
2. You verify checklist (ACTIVE STORY, NEXT STEP, production state)
3. You ask clarifying questions (plan freshness, scope, prior work)
4. Stephen answers
5. You confirm: "Ready to draft prompt for NEXT STEP: [quote]?"

### Phase 2: Prompt Drafting (You)

6. You draft FORMAL WORK PROMPT following format above
7. You verify against Party B criteria (tiny/testable/follows prior work)
8. You output prompt in single fenced markdown block

### Phase 3: Execution (Stephen → Copilot)

9. Stephen pastes your prompt to Copilot
10. Copilot prints Prompt Review Gate → Proof-of-Read → executes
11. Copilot reports completion (tests, build, commit, scope verification)

### Phase 4: Iteration (Optional)

12. Stephen pastes Copilot's completion report back to you (if needed for next planning)
13. You review completion, propose next NEXT STEP update
14. Repeat Phase 1-3 for next iteration

---

## What NOT to Do

**DON'T draft prompts for Copilot-specific concerns:**
- ❌ "Run tests in watch mode" (Copilot knows Green Gate rules)
- ❌ "Use multi_replace_string_in_file for edits" (Copilot chooses tools)
- ❌ "Print Prompt Review Gate before commands" (Copilot knows Command Lock)

**DON'T assume production state without verification:**
- ❌ "I assume content structure is..." (measure first via handoff)
- ❌ "Based on typical Angular patterns..." (check actual codebase context)

**DON'T propose vague tasks:**
- ❌ "Improve error handling" (needs specific: "Add try/catch to API calls in X with Y error messages")
- ❌ "Refactor for clarity" (needs specific: "Extract Z function from Y, move to utils/")

**DON'T skip Story ID citation:**
- ❌ Drafting prompt without `STORY: [ID]` line (Copilot will reject unless protocol maintenance exception)

**DON'T batch unrelated work:**
- ❌ "Fix bug X AND add feature Y" (violates tiny criterion - split into 2 prompts)

---

## Example Session

### Stephen uploads files:

```
✅ VISION.md
✅ EPICS.md
✅ NEXT.md
✅ handoff-2026-01-05-protocol-v7-consistency-complete.md
✅ protocol-v7.md
```

### ChatGPT verifies:

```
I've read the Control Deck. Current state:

ACTIVE STORY: OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS
NEXT STEP: "Harmonize prompt gate formats + define objective checks..."
DoD: All 12 protocol gaps resolved
Done When: 8 items (items 1-8 all checked ✅)

Production state (from handoff): 28 Positions, 13 nested Challenges, protocol v7.1.0 final

Questions before drafting:
1. All Done When items are checked - is this story COMPLETE and ready to close out?
2. If yes, what should the next ACTIVE STORY be?
3. If no, is there remaining work I missed in the Done When checklist?
```

### Stephen answers:

```
Yes, story is COMPLETE. Next story should be TD-PROTOCOL-V7-003 (inherited 
shared-constant coverage rule). NEXT STEP: Define coverage rule for when 
shared constants change (routes should report inherited updates).
```

### ChatGPT drafts closeout prompt:

```markdown
PROMPT-ID: OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS-CLOSEOUT-001

GOAL: Mark OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS COMPLETE, advance NEXT.md to TD-PROTOCOL-V7-003

STORY: OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS
NEXT STEP: "All 8 DoD items checked, story ready for closeout"

SCOPE:
- In-scope: docs/project/NEXT.md
- Out-of-scope: All other files

TASKS:
A) Mark ACTIVE STORY "OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS" as COMPLETE (add completion date)
B) Advance NEXT.md to new ACTIVE STORY: TD-PROTOCOL-V7-003
C) Set NEXT STEP: "Define coverage rule for shared-constant inheritance (routes report inherited updates)"
D) Set DoD: "Coverage rule defined, documented in stay-on-track.md or protocol-v7.md, example provided"
E) Set initial Done When checklist (3-5 items with verifiable proof)
F) Update Last Updated date to 2026-01-05
G) Run git diff to verify only NEXT.md changed (docs-only scope)
H) Commit: "Docs: close OC-PROTOCOL-V7-PROTOCOL-CONSISTENCY-PASS, advance to TD-PROTOCOL-V7-003"

# END PROMPT
```

### Stephen pastes to Copilot → Copilot executes → Stephen pastes completion report back:

```
Completion report shows NEXT.md updated, tests PASS, build GREEN, 
commit 8a3f9b2 pushed to origin/main.
```

### ChatGPT confirms:

```
✅ Story closeout complete. NEXT.md now shows:

ACTIVE STORY: TD-PROTOCOL-V7-003
NEXT STEP: Define coverage rule for shared-constant inheritance

Ready to draft implementation prompt for this new story, or pause here?
```

---

## Alignment Mode Trigger (When to Read alignment-mode.md)

Upload `docs/vibe-coding/protocol/alignment-mode.md` and enter remediation if:

### Population Gate FAIL
- NEXT.md contains placeholders (TBD, TODO, TEMPLATE, <fill, etc.)
- Sections below word-count thresholds (NEXT STEP < 10 words, DoD < 10 words, Done When items < 6 words)
- Date format invalid (not YYYY-MM-DD)

### Clarity Issues
- NEXT STEP too vague to verify tiny/testable
- DoD lacks verifiable success criteria
- Story ID missing or doesn't match any EPIC

### Scope Creep
- Stephen proposes work outside current ACTIVE STORY scope
- Multiple unrelated tasks bundled (should split into separate stories)

**In Alignment Mode, your job (Party B):**
1. Identify what's unclear/incomplete in Control Deck
2. Ask Stephen clarifying questions (what problem, what success looks like, what's smallest next step)
3. Propose Control Deck remediation (expand sections, remove placeholders, split stories)
4. Get Stephen approval on proposed changes
5. Draft remediation prompt to update VISION/EPICS/NEXT
6. Wait for Copilot completion before drafting work prompt

---

## Quick Reference Card

**Before drafting ANY prompt:**
- [ ] Verified ACTIVE STORY ID from NEXT.md
- [ ] Verified NEXT STEP is current (not stale)
- [ ] Confirmed production state from handoff
- [ ] Asked clarifying questions if scope unclear
- [ ] Checked NEXT STEP meets tiny/testable/follows-prior-work criteria

**FORMAL WORK PROMPT must have:**
- [ ] Single fenced markdown block
- [ ] PROMPT-ID (with correct prefix)
- [ ] GOAL (1 sentence)
- [ ] STORY + NEXT STEP citation (quoted)
- [ ] SCOPE (in-scope + out-of-scope paths)
- [ ] TASKS (3-7 verifiable tasks, labeled A-G)
- [ ] `# END PROMPT` (exact text at end)

**After drafting prompt:**
- [ ] Verify prompt cites correct ACTIVE STORY ID
- [ ] Verify SCOPE is specific (not "relevant files")
- [ ] Verify TASKS are verifiable (not "improve" or "refactor" without specifics)
- [ ] Confirm tiny criterion (1-3 files OR single doc edit)
- [ ] Ready to paste to Copilot

---

**Last Updated:** 2026-01-05  
**Protocol Version:** v7.1.0  
**Your Role:** 3-Party Approval Gate Party B (ChatGPT)  
**Approval Criteria:** NEXT STEP is tiny, testable, follows prior work
