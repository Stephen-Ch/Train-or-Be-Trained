# EPICS — Train or Be Trained

## Epic List

### TBTT-VALIDATION-001: Mixed-Profile Coherence Before Beta
**Status:** IN PROGRESS  
**Description:** Validate whether mixed A/B/C behavioral profiles generate coherent Working With Me outputs before beta. Goals: run a short, high-signal sanity pass (max 6 mixed profiles) using 4 prompts and a single coherence rubric, then make a clear beta decision. Success criteria: outputs read as coherent rather than stitched together across the mixed-profile set, with contradictions either absent or fixed in one additional pass.

### TBTT-BETA-001: Beta Readiness and Launch Guardrail
**Status:** PLANNED  
**Description:** Ship beta immediately after mixed-profile validation passes, without adding new product surface area. Goals: avoid overfitting to internal toy prompts and prevent premature launch if coherence fails. Success criteria: beta gate decision is explicit, documented, and tied to mixed-profile evidence.

### TBTT-POST-BETA-001: Real-Use Feedback Loop
**Status:** PLANNED  
**Description:** Collect early beta feedback focused on whether Working With Me changes assistant behavior in real tasks. Goals: identify contradictions or weak phrasing from real usage and prioritize only high-impact fixes. Success criteria: feedback themes are consolidated into a small, evidence-backed change list.

---
