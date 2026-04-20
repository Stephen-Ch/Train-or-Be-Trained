# Kit Internal Planning

> **Kit-internal planning and session docs.** Not intended for consumer use.

## What goes here

| File | Purpose |
|------|---------|
| ROADMAP.md | Future work and improvement priorities for the kit |
| SESSION-HANDOFF.md | Cross-session state when resuming kit work |
| GPT-SESSION-START.md | Session primer for ChatGPT when working on the kit |
| COPILOT-SESSION-START.md | Session primer for Copilot when working on the kit |

## Consumer notice

This directory ships to consumer repos via subtree but is **not intended for consumer use**.
Consumer repos should ignore it. If doc-audit detects consumer-side references to
kit-internal planning files, it will emit a WARNING.

Kit-specific planning docs belong here. Consumer-specific docs belong in `<DOCS_ROOT>/`.
