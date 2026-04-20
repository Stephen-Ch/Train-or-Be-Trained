# Release Notes — Rawls Game v1.0.0

**Release Date**: 2025-12-22  
**Tag**: `v1.0.0`  
**Commit**: `a49b5d437b2dae676739771ff00a8b684b10b44e`  
**Verification**: [V1 RC-003A Smoke Test PASS](v1-rc-003a-smoke-pass-2025-12-22.md)

---

## What V1 Delivers

- **Complete survey flow**: Users can select categories, answer TLQ positions and follow-up challenges, review answers, and view personalized results
- **Share-card export**: Download 1200×630 PNG results cards for social sharing (verified: not blank, correct dimensions)
- **Session persistence**: Browser refresh preserves progress via sessionStorage hydration

---

## Verification

### Automated Testing
- **109 unit/integration tests pass** (1 skipped)
- **Build succeeds**: 476.66 kB production bundle
- **Content validation**: 7 categories, 28 questions pass integrity checks

### Manual Smoke Test
- **12-step checklist**: All critical steps verified
- **Browser**: Chrome 143
- **Date**: 2025-12-22 3:30pm
- **Tester**: @Stephen
- **Artifact**: [v1-rc-003a-smoke-pass-2025-12-22.md](v1-rc-003a-smoke-pass-2025-12-22.md)

---

## Known Deferred Items (Not V1 Blockers)

### TD-RAWLS-001: Playwright E2E Blocked
**Status**: DEFERRED  
**Reason**: Playwright hangs on Windows 11 with HVCI/VBS enabled (local environment issue)  
**Evidence**: [playwright-windows-machine-report-2025-12-22.md](playwright-windows-machine-report-2025-12-22.md)  
**Impact**: Unit tests provide coverage; manual smoke test verifies flows  
**Next**: Consider CI environment for e2e or HVCI toggle experiment

### UX Polish Items
**Status**: DEFERRED to V1.1  
**Items**:
- Answer scale labels not always contextually aligned with questions
- Info headers could be more user-friendly
- Smoke checklist Step 6 expectation oversimplified (showed "TLQs 4/4" correctly, checklist expected "TLQs 1/1")

---

## Next Sprint Priorities (V1.1)

1. **FW-ADMIN-001**: Admin Content Editor UI (Categories → TLQs → Follow-ups) — reduce manual JSON editing risk
2. **TD-RAWLS-008**: Rename user-facing language to "Ideals → Positions → Challenges" for clarity
3. **UX Polish**: Answer scale context alignment, header improvements, review page grouping

---

## Breaking Changes

None (initial release)

---

## Contributors

- @Stephen (product, testing, verification)
- GitHub Copilot (implementation, testing, protocol compliance)

