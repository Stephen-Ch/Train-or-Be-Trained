---
version: v2025.12.28
project: Rawls Game
date: 2025-12-28
---

# Quickstart — Rawls Game

1. **Clone** outside synced folders (OneDrive/Dropbox) to avoid file locks.
2. **Install dependencies**
	```bash
	npm ci
	```
3. **Prime the environment**
	```bash
	npm run test
	npm run build
	```
4. **Dev server**
	```bash
	npm start
	```
	Visit http://localhost:4200 (auto reload enabled).
5. **Docs to read before coding**
	- `docs/project/RAWLS-START-HERE.md`
	- `docs/vibe-coding/protocol/PROTOCOL-INDEX.md`
	- `docs/vibe-coding/protocol/copilot-instructions-v7.md`
	- `docs/vibe-coding/protocol/stay-on-track.md`
6. **Content workflows**
	- Editing `content/categories/*.json`? Run `npm run content:lint` + `npm run content:export-app` before test/build.
	- Admin patch exports: `npm run admin:apply-patch -- --patch ./patch.json --write` (dry-run by default).
7. **Report template**
	- Every prompt: Command Lock → Prompt Review Gate → Proof-of-Read.
	- Completion report must cite entry points touched, command outputs, and coverage proofs per vibe-c instructions.

Troubleshooting tips live in `docs/handoffs/handoff-2025-12-23-challenge-settled.md` (admin content) and `docs/status/tech-debt-and-future-work.md` (open issues).
