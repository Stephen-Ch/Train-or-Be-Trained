# SMOKE TEST CHECKLIST — QuestionV2 Post-Cutover Validation
**Date:** 2025-12-24  
**Tester:** _____________  
**Environment:** http://localhost:4200  
**Commits:** 3cfdc5b (Step 5), 979d46c (Step 6)  
**Status:** ☐ PASS / ☐ FAIL  

---

## Objective
Validate QuestionV2 end-to-end behavior after route cutover to production path `/q/:id`. Tests cover Start Fresh flow, main run flow (liberty → equality), completion auto-navigation, deep-link rotation, and resume prompt UX.

---

## A. Start Fresh Flow

### A1. Visit /select with clean state
- [ ] Navigate to `http://localhost:4200/select`
- [ ] **Expected:** No resume banner visible, 7 ideal cards shown, no ideals pre-selected

### A2. Start Fresh clears saved progress
- [ ] If resume banner visible, click "Start Fresh" button
- [ ] **Expected:** Banner dismisses, all ideals deselected, localStorage cleared

### A3. Select two ideals
- [ ] Click Liberty card, click Equality card
- [ ] **Expected:** Both cards show selected state (border/background change), Continue button enabled

---

## B. Main Run Flow (Liberty → Equality)

### B1. Navigate to first ideal
- [ ] Click Continue button from /select
- [ ] **Expected:** URL changes to `/q/liberty`, first position `liberty-q0` displayed with question text and 5 sliders

### B2. Answer 4 positions in Liberty
- [ ] Adjust sliders for `liberty-q0`, click Continue
- [ ] Repeat for `liberty-q1`, `liberty-q2`, `liberty-q3`
- [ ] **Expected:** Each click navigates to next position, URL updates to `/q/liberty`, progress shows "Position X of 4"

### B3. Challenge transition after 4th position
- [ ] After completing `liberty-q3`, click Continue
- [ ] **Expected:** Challenge screen displayed with "How important is this to you?" prompt, scale 1-5 shown, URL stays `/q/liberty`

### B4. Complete Liberty ideal
- [ ] Select challenge rating (e.g., 5), click Continue
- [ ] **Expected:** URL changes to `/q/equality`, first position `equality-q0` displayed

### B5. Answer 4 positions in Equality
- [ ] Adjust sliders for `equality-q0`, click Continue
- [ ] Repeat for `equality-q1`, `equality-q2`, `equality-q3`
- [ ] **Expected:** Each click navigates to next position, URL updates to `/q/equality`, progress shows "Position X of 4"

### B6. Challenge transition after 4th position
- [ ] After completing `equality-q3`, click Continue
- [ ] **Expected:** Challenge screen displayed, scale 1-5 shown, URL stays `/q/equality`

---

## C. Completion Auto-Navigation

### C1. Auto-navigate to /review
- [ ] Select challenge rating for equality (e.g., 3), click Continue
- [ ] **Expected:** Automatic redirect to `/review`, no manual navigation required, URL is `http://localhost:4200/review`

### C2. Verify review counts
- [ ] On /review page, check summary cards
- [ ] **Expected:** 8 position answers (4 liberty + 4 equality), 2 challenge answers displayed

### C3. Submit to /result
- [ ] Click "See My Profile" button on /review
- [ ] **Expected:** Navigate to `/result`, persona profile card shown with weighted scores

### C4. Test share button
- [ ] On /result page, click "Share My Profile" button
- [ ] **Expected:** Modal opens with profile card image preview, no console errors related to html2canvas

---

## D. Deep-Link Rotation

### D1. Start fresh with both ideals selected
- [ ] Navigate to `http://localhost:4200/select`
- [ ] If resume banner visible, click "Start Fresh"
- [ ] Select Liberty and Equality, click Continue
- [ ] **Expected:** URL changes to `/q/liberty` (first in selection)

### D2. Deep-link to /q/equality
- [ ] Manually change browser URL to `http://localhost:4200/q/equality`
- [ ] Press Enter
- [ ] **Expected:** First position shown is `equality-q0` (not `liberty-q0`), progress shows "Position 1 of 4", URL is `/q/equality`

### D3. Verify rotation does not persist
- [ ] Complete `equality-q0`, click Continue
- [ ] After completing all equality positions + challenge, observe next ideal
- [ ] **Expected:** URL changes to `/q/liberty`, first position `liberty-q0` shown (rotation was display-only)

---

## E. Resume Prompt

### E1. Create saved progress
- [ ] Navigate to `/select`, start fresh if needed
- [ ] Select Liberty and Equality, click Continue
- [ ] Answer `liberty-q0`, click Continue
- [ ] **Expected:** URL is `/q/liberty`, position `liberty-q1` shown

### E2. Refresh /select mid-session
- [ ] Manually navigate to `http://localhost:4200/select`
- [ ] **Expected:** Yellow resume banner visible with text "Looks like you started a session. Resume where you left off, or start fresh?", Resume/Start Fresh buttons shown

### E3. Resume keeps progress
- [ ] Click "Resume Your Session" button
- [ ] **Expected:** Banner dismisses, Liberty and Equality remain selected, Continue button enabled

### E4. Resume continues flow
- [ ] Click Continue button
- [ ] **Expected:** Navigate to `/q/liberty`, position `liberty-q1` shown (not `liberty-q0`), previous answer for `liberty-q0` preserved

---

## ISSUES FOUND
_(Log any failures here with step number and description. Copy to tech-debt-and-future-work.md as TD entries if needed.)_

1. 
2. 
3. 

---

## SIGN-OFF
- [ ] All 12 steps PASSED  
- [ ] No blockers found  
- [ ] Tech debt updated (if issues found)  

**Tester Signature:** _____________  
**Date Completed:** _____________  

---

## Notes
- Test with fresh browser session or incognito mode to ensure clean localStorage
- If any step fails, STOP and log issue before proceeding
- Expected behavior based on commits 3cfdc5b (route cutover, resume banner, reactive navigation) and 979d46c (route ID rotation)
- QuestionV2 is now on production route `/q/:id`, legacy V1 at `/q1/:id`, dev route at `/q2/:id`
