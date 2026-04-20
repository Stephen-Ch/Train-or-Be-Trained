# EPICS — Rawls Game

## Epic List

### OC-PROTOCOL-V7: Protocol v7 Evolution
**Status:** IN PROGRESS  
**Description:** Evolve the vibe-coding workflow to enforce story-driven development via Vision & User Story Gate, 3-Party Approval Gate, and required Control Deck docs (VISION/EPICS/NEXT). Goals: prevent ad-hoc "seems useful" work not aligned with active plan, ensure Stephen/ChatGPT/Copilot alignment before coding, keep NEXT.md lightweight (not paperwork). Success criteria: Doc Audit passes, prompts require Story ID + NEXT citation, 3-party approval gate enforced, NEXT.md stays under ~30 lines operational format.

### EPIC-001: Question Flow V2 (QuestionV2 Component)
**Status:** COMPLETE  
**Description:** Migrate all 28 positions from original Question component to new QuestionV2 component with tutor mode, meta-line narration, and reflection buckets. Goals: decouple UI copy from TypeScript (move to JSON dictionary), improve UX consistency, enable future admin pipeline for copy management. Success criteria: All 28 positions render via QuestionV2, tutor copy centralized in qv2-tutor-copy.ts + qv2-tutor-copy.json, tests GREEN, build GREEN, route coverage complete.

### EPIC-002: Content Schema V2
**Status:** PLANNED  
**Description:** Extend content schema to support deeper dives (challenges), nested challenge structure, and admin pipeline readiness. Goals: move from flat followUps[] to nested followUps[].challenges[], prepare for editable content via admin UI, maintain backward compatibility during migration. Success criteria: Content validator enforces nested schema, production JSON uses categories[].followUps[].challenges[], contract tests prove shape, build/test GREEN.

---
