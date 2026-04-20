# Rawls Game Changelog

## [2025-11-27] - Question Flow Fixes

### P-813: fix(question): advance to next category on final continue
- **Bug Fixed**: Continue button now advances to the next category (or /review) instead of bouncing back to the same category
- **Root Cause**: `advanceFollowUps()` was calling `navigate(['/q', currentId])` instead of `navigateNext()`
- **Files Changed**: `question.component.ts`, `question.component.spec.ts`
- **Analysis**: See `docs/P-812-question-flow-report.md` for full diagnosis

### P-811: fix(question): align option IDs with pipeline followUps
- **Bug Fixed**: Follow-up statements now render with Likert scales on `/q/:categoryId` routes
- **Root Cause**: `options()` regex expected `A1-f1` pattern but pipeline JSON uses `liberty-q0` format
- **Files Changed**: `question.component.ts`, `question.component.spec.ts`

### P-808: fix(question): wait for content before starting category
- **Bug Fixed**: Race condition where component rendered before content loaded
- **Root Cause**: `currentCategory()` computed ran before ContentService finished loading
- **Solution**: Added `effect()` to reactively wait for content availability
- **Files Changed**: `question.component.ts`, `question.component.spec.ts`

---

## [Phase 4] - ContentService Implementation - 2025-10-12

### Commit: 4724caf - feat: implement ContentService with TDD approach
- **Core Content System**: Added TypeScript interfaces for Category, Option, FollowUp with Likert scale support
- **ContentService**: Signal-based reactive service for loading JSON content from assets
- **TDD Implementation**: Complete test-driven development with async testing and error handling
- **Asset Configuration**: Updated angular.json to properly serve src/assets folder
- **Build Status**: ✅ All 7 tests passing (including routing sentinel test)
- **Architecture**: Signal-based state management with fetch API integration

### Technical Details
- `src/app/core/content/types.ts`: Domain interfaces with strict TypeScript typing
- `src/app/core/content/content.service.ts`: Reactive service with loading/error states
- `src/app/core/content/content.service.spec.ts`: Comprehensive test suite with async patterns
- `src/assets/content/rawls-values.en.json`: Sample content data structure
- Asset serving configured for both build and test environments

---

## [Phase 3] - Routing Infrastructure - 2025-10-12

### Commit: f68f2dd - feat: implement complete routing structure with standalone components
- **Routing System**: Complete app routing with 6 feature routes
- **Standalone Components**: All components created with data-testid attributes for testing
- **Navigation Structure**: Intro → Select → Question → Review → Result → Store flow
- **Component Architecture**: Minimal components ready for feature implementation
- **Build Status**: ✅ All builds and tests passing

---

## [Phase 2] - Tailwind CSS Integration - 2025-10-12

### Commit: 6c5c9f9 - feat: integrate Tailwind CSS v3 with Angular 20
- **Tailwind v3.4.0**: Full integration with purge configuration
- **SCSS Integration**: Updated styles.scss with Tailwind directives
- **Build Configuration**: Optimized for Angular compatibility
- **Content Purging**: Configured for ["./src/**/*.{html,ts}"]
- **Build Status**: ✅ All builds successful

---

## [Phase 1] - Angular 20 Foundation - 2025-10-12

### Commit: 8b43962 - feat: scaffold Angular 20 zoneless app with routing and testing
- **Angular 20**: Zoneless architecture with provideZonelessChangeDetection()
- **Routing Setup**: Angular Router with standalone components
- **Testing Infrastructure**: Karma/Jasmine with ChromeHeadless configuration
- **SCSS Support**: Configured for component and global styles
- **Build Status**: ✅ All builds and tests passing
- **Routing Sentinel**: Test ensures root template remains <router-outlet>

### Technical Foundation
- Zoneless change detection for improved performance
- Standalone components eliminating NgModules
- Headless testing for CI/CD compatibility
- SCSS preprocessing for advanced styling