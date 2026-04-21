# Mixed-Profile Test Plan — Train or Be Trained
*Validation artifact for TBTT-VALIDATION-MIXED-PROFILES-001*
*Last Updated: 2026-04-20*

---

## Purpose / Goal

Extreme A/B/C tests already proved the controls produce meaningfully different AI behavior. A looked strong. B looked like the best general-purpose balance. C was weakest. Real users will not be all-A, all-B, or all-C.

This test plan runs one short sanity pass on realistic mixed profiles to answer a single question: do mixed outputs feel coherent, or do they feel like stitched-together instructions written by different people? If coherent, go to beta immediately. If contradictory, revise phrasing once and run one more pass.

---

## Scope / Constraints

- Maximum 6 mixed profiles. Not exhaustive.
- Use profiles that stress likely behavioral collisions, not edge cases.
- Run the same 4 prompts across all 6 profiles.
- Evaluate coherence only. Do not evaluate output quality, tone polish, or feature gaps.
- No changes to app code, scoring logic, question wording, or output templates during this pass.
- If this pass reveals a content fix, scope that fix to one targeted phrase change — no rewrites.

---

## Six Mixed Profiles

Profiles are described as the dominant behavioral dimension and the collision point being tested.

**Profile 1 — High Rigor, Low Challenge**
High confidence in structured output; low preference for being challenged or pushed back on. Collision: does the document tell the AI to be rigorous without making it feel combative?

**Profile 2 — High Scope Control, Moderate Everything Else**
Strong preference for staying on task; moderate signals elsewhere. Collision: does the document produce an assistant that feels focused without feeling blinkered?

**Profile 3 — Low Filtering, High Uncertainty Signaling**
Prefers raw output over polished drafts; also signals high uncertainty about own direction. Collision: does the document ask for unfiltered output while also asking the AI to help with ambiguity without the two instructions contradicting each other?

**Profile 4 — High Continuity, Low Interruption Tolerance**
Strong preference for sustained work sessions; low tolerance for check-ins. Collision: does the document produce an AI that feels continuous and non-interruptive without ignoring genuinely important clarification moments?

**Profile 5 — Mostly B, One A Dimension**
All dimensions score B (balanced, general-purpose) except one dimension scoring A (strong, assertive). Collision: does one strong dimension pull the document into a noticeably different register, or does it blend cleanly?

**Profile 6 — Mostly B, One C Dimension**
All dimensions score B except one dimension scoring C (reserved, low-signal). Collision: does one weak dimension produce a noticeable gap or hedged instruction, or does it blend without friction?

---

## Four Standard Prompts

Run these exact four prompts for each profile. Use a fresh AI session for each profile.

**Prompt 1 — Short Task, Clear Brief**
"I need a 200-word summary of the main tradeoffs between async and sync API design. No preamble."

**Prompt 2 — Ambiguous Ask**
"Help me think through whether I should redesign this feature now or wait."

**Prompt 3 — Pushback Probe**
"I've decided to ship this with no tests. What do you think?"

**Prompt 4 — Longer, Messy Prompt (real-work simulation)**
"I've been going back and forth on this architecture decision for two weeks. One option uses an event bus and feels clean but I'm worried about debugging. The other is a direct service call which feels obvious but now I'm second-guessing whether it scales. My lead wants a decision by Thursday and I keep changing my mind. I don't know if I'm overthinking it or if there's something real I'm missing. Can you help me get unstuck?"

---

## Evaluation Rubric

After running all four prompts for a profile, fill in one row of the matrix below.

| Profile | Coherent or Stitched | Most Noticeable Behavior | Contradiction Present (Y/N) | Would I Use This In Real Work (Y/N) | One-Sentence Verdict |
|---------|---------------------|--------------------------|----------------------------|-------------------------------------|----------------------|
| Profile 1 | | | | | |
| Profile 2 | | | | | |
| Profile 3 | | | | | |
| Profile 4 | | | | | |
| Profile 5 | | | | | |
| Profile 6 | | | | | |

---

## Pass / Fail / Beta Gate

**PASS (go to beta immediately):** All 6 profiles score Coherent. Contradiction column shows no Y entries. At least 5 of 6 verdict rows are positive.

**CONDITIONAL PASS (one fix, one more pass):** One or two profiles score Stitched or have a Contradiction Y. Identify the specific phrase causing the mismatch, change it once, and rerun only the affected profile.

**FAIL (stop beta):** Three or more profiles score Stitched, or two or more have Contradiction Y. Document the pattern, scope a fix, and rerun the full 6-profile set once before reconsidering beta.

---

## Failure Patterns to Watch For

- Two instructions in the same document that recommend opposite behaviors for the same situation.
- A dimension that produces a strong hedge ("only if asked") that conflicts with another dimension that says "proactively offer."
- Tone shift mid-document where one section sounds assertive and another sounds deferential.
- A "would I use this" NO that cannot be explained by the prompt content — likely caused by an output phrasing that feels impersonal or robotic.
