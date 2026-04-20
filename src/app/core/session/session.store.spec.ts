/**
 * @human Tests session state management, persistence hydration, resume index contract, and challenge answer isolation
 * @proves SessionStore maintains correct state, rehydrates from storage, resume uses explicit completion markers, challenge answers stored separately from position answers and don't pollute scoring
 * @lastTouched 2025-12-24
 */
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { SessionStore } from './session.store';
import { ContentService } from '../content/content.service';

describe('SessionStore', () => {
  let store: SessionStore;

  // Mock ContentService with categories in content-file order
  const mockContentService = {
    state: signal({
      categories: [
        { id: 'liberty', name: 'Liberty', description: '', quote: '', followUps: [] },
        { id: 'fairness', name: 'Fairness', description: '', quote: '', followUps: [] },
        { id: 'security', name: 'Security', description: '', quote: '', followUps: [] },
        { id: 'A', name: 'A', description: '', quote: '', followUps: [] },
        { id: 'B', name: 'B', description: '', quote: '', followUps: [] },
        { id: 'C', name: 'C', description: '', quote: '', followUps: [] }
      ],
      likert5: [],
      loading: false,
      error: null
    })
  };

  beforeEach(() => {
    // Clear sessionStorage BEFORE constructing the store (boot-time hydration reads it)
    sessionStorage.clear();
    
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ContentService, useValue: mockContentService }
      ]
    });
    store = TestBed.inject(SessionStore);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty state', () => {
    expect(store.selectedIds()).toEqual([]);
    expect(store.answers()).toEqual({});
    expect(store.skipped().size).toBe(0);
    expect(store.sequence()).toEqual([]);
    expect(store.currentIndex()).toBe(0);
    expect(store.result()).toBeUndefined();
    expect(store.entitlements()).toEqual({ premium: false });
  });

  it('should generate content-file-order sequence from selectedIds', () => {
    // Content order: A, B, C (per mock)
    store.selectCategories(['C', 'A', 'B']);
    expect(store.sequence()).toEqual(['A', 'B', 'C']);
  });

  it('should remove answers when unchecking category', () => {
    store.selectCategories(['A', 'B']);
    store.recordAnswer('A', 3);
    store.recordAnswer('B', 4);
    
    store.selectCategories(['A']); // uncheck B
    
    expect(store.answers()).toEqual({ 'A': 3 });
    expect(store.answers()['B']).toBeUndefined();
  });

  it('should resume at first incomplete category in sequence', () => {
    store.selectCategories(['A', 'B', 'C']);
    store.markCategoryComplete('A'); // Explicitly mark A complete
    // B and C are not completed
    
    const resumeIndex = store.getResumeIndex();
    expect(resumeIndex).toBe(1); // Should resume at B (index 1)
  });

  it('should track skipped questions', () => {
    store.selectCategories(['A', 'B']);
    store.skipQuestion('A');
    
    expect(store.skipped().has('A')).toBe(true);
    expect(store.skipped().has('B')).toBe(false);
  });

  /**
   * Session persistence + resume (v1)
   * 
   * These tests define the desired contract for:
   * 1. Deterministic hydration from sessionStorage
   * 2. getResumeIndex using explicit completedCategoryIds (not answers-as-proxy)
   * 
   * Storage contract:
   * - Key: "rawls-session-v1"
   * - Value: JSON with shape:
   *   {
   *     "v": 1,
   *     "selectedCategoryIds": ["liberty", "fairness", "security"],
   *     "completedCategoryIds": ["liberty"],
   *     "answers": { "liberty-q0": 4, "liberty-q1": 2 },
   *     "skipped": ["liberty-q2"]
   *   }
   */
  describe('session persistence + resume (v1)', () => {
    const STORAGE_KEY = 'rawls-session-v1';

    beforeEach(() => {
      sessionStorage.clear();
    });

    afterEach(() => {
      sessionStorage.clear();
    });

    it('TEST A — hydration restores selectedIds deterministically', () => {
      // Arrange: sessionStorage has rawls-session-v1 with 3 categories
      const storedSession = {
        v: 1,
        selectedCategoryIds: ['liberty', 'fairness', 'security'],
        completedCategoryIds: [],
        answers: {},
        skipped: []
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession));

      // Act: create a fresh store and hydrate
      // NOTE: This assumes a hydrateFromStorage() method or constructor hydration will exist
      const freshStore = TestBed.inject(SessionStore);
      freshStore.hydrateFromStorage(); // <-- This method does not exist yet; test will fail

      // Assert: selectedIds restored
      expect(freshStore.selectedIds()).toEqual(['liberty', 'fairness', 'security']);
      // Assert: sequence is content-file-order sorted (liberty, fairness, security per mock)
      expect(freshStore.sequence()).toEqual(['liberty', 'fairness', 'security']);
    });

    it('TEST B — getResumeIndex returns first incomplete ideal (not always 0)', () => {
      // First verify: when nothing is completed, returns 0
      store.selectCategories(['liberty', 'fairness', 'security']);
      // sequence = ['liberty', 'fairness', 'security'] (content-file order per mock)
      expect(store.getResumeIndex()).toBe(0);

      // Now mark 'liberty' (index 0) as completed
      store.markCategoryComplete('liberty');

      // Act: get resume index
      const resumeIndex = store.getResumeIndex();

      // Assert: should return 1 (fairness), not 0
      expect(resumeIndex).toBe(1);
    });

    it('TEST C — getResumeIndex does NOT use answers as completion proxy', () => {
      // Arrange: select categories and record answers, but do NOT mark complete
      store.selectCategories(['liberty', 'fairness', 'security']);
      // sequence = ['liberty', 'fairness', 'security'] (content-file order)
      
      // Record answers for liberty questions (but don't mark category complete)
      store.recordAnswer('liberty-q0', 4);
      store.recordAnswer('liberty-q1', 3);
      store.recordAnswer('liberty-q2', 5);
      store.recordAnswer('liberty-q3', 2);

      // Act: get resume index (no completedCategoryIds set)
      const resumeIndex = store.getResumeIndex();

      // Assert: should return 0 because liberty is NOT explicitly marked complete
      // (answers existing does NOT mean category is complete)
      expect(resumeIndex).toBe(0);
    });
  });

  /**
   * rawls-session-v1 persistence writes (best UX)
   * 
   * These tests prove SessionStore WRITES the full session blob to sessionStorage
   * whenever core state changes. This is required for:
   * - Refresh restoring multi-Ideal flow + progress reliably
   * - resumeIndex depending on explicit completion markers
   * - No "works sometimes" persistence
   * 
   * Storage contract:
   * - Key: "rawls-session-v1"
   * - Value: JSON with shape:
   *   {
   *     "v": 1,
   *     "selectedCategoryIds": string[],
   *     "completedCategoryIds": string[],
   *     "answers": Record<string, number>,
   *     "skipped": string[]
   *   }
   */
  describe('rawls-session-v1 persistence writes (best UX)', () => {
    const STORAGE_KEY = 'rawls-session-v1';
    let setItemSpy: jasmine.Spy;
    let getItemSpy: jasmine.Spy;

    beforeEach(() => {
      sessionStorage.clear();
      setItemSpy = spyOn(sessionStorage, 'setItem').and.callThrough();
      getItemSpy = spyOn(sessionStorage, 'getItem').and.callThrough();
    });

    afterEach(() => {
      sessionStorage.clear();
    });

    it('TEST A — selecting categories persists selectedCategoryIds', () => {
      // Act: select categories
      store.selectCategories(['liberty', 'fairness', 'security']);

      // Assert: setItem was called with correct key
      expect(setItemSpy).toHaveBeenCalled();
      const [key, value] = setItemSpy.calls.mostRecent().args;
      expect(key).toBe(STORAGE_KEY);

      // Assert: JSON parses and contains correct data
      const parsed = JSON.parse(value);
      expect(parsed.v).toBe(1);
      expect(parsed.selectedCategoryIds).toEqual(['liberty', 'fairness', 'security']);
      expect(parsed.completedCategoryIds).toEqual([]);
      expect(parsed.answers).toEqual({});
      expect(parsed.skipped).toEqual([]);
    });

    it('TEST B — marking category complete persists completedCategoryIds', () => {
      // Arrange: set up categories first (reset spy after)
      store.selectCategories(['liberty', 'fairness', 'security']);
      setItemSpy.calls.reset();

      // Act: mark fairness as complete
      store.markCategoryComplete('fairness');

      // Assert: setItem was called
      expect(setItemSpy).toHaveBeenCalled();
      const [key, value] = setItemSpy.calls.mostRecent().args;
      expect(key).toBe(STORAGE_KEY);

      // Assert: completedCategoryIds includes 'fairness'
      const parsed = JSON.parse(value);
      expect(parsed.completedCategoryIds).toContain('fairness');
      // Assert: selectedCategoryIds still intact
      expect(parsed.selectedCategoryIds).toEqual(['liberty', 'fairness', 'security']);
    });

    it('TEST C — recording an answer persists answers (questionId-keyed)', () => {
      // Arrange: set up categories first (reset spy after)
      store.selectCategories(['fairness']);
      setItemSpy.calls.reset();

      // Act: record an answer
      store.recordAnswer('fairness-q0', 4);

      // Assert: setItem was called
      expect(setItemSpy).toHaveBeenCalled();
      const [key, value] = setItemSpy.calls.mostRecent().args;
      expect(key).toBe(STORAGE_KEY);

      // Assert: answers keyed by questionId
      const parsed = JSON.parse(value);
      expect(parsed.answers['fairness-q0']).toBe(4);
    });

    it('TEST D — skipping a question persists skipped', () => {
      // Arrange: set up categories first (reset spy after)
      store.selectCategories(['fairness']);
      setItemSpy.calls.reset();

      // Act: skip a question
      store.skipQuestion('fairness-q2');

      // Assert: setItem was called
      expect(setItemSpy).toHaveBeenCalled();
      const [key, value] = setItemSpy.calls.mostRecent().args;
      expect(key).toBe(STORAGE_KEY);

      // Assert: skipped includes the questionId
      const parsed = JSON.parse(value);
      expect(parsed.skipped).toContain('fairness-q2');
    });

    it('TEST E — hydrateFromStorage does NOT write', () => {
      // Arrange: seed storage with valid session
      const storedSession = {
        v: 1,
        selectedCategoryIds: ['liberty', 'fairness'],
        completedCategoryIds: ['liberty'],
        answers: { 'liberty-q0': 3 },
        skipped: []
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession));
      
      // Reset spy AFTER seeding storage
      setItemSpy.calls.reset();

      // Act: hydrate
      store.hydrateFromStorage();

      // Assert: setItem was NOT called (hydrate is read-only)
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('Boot-time hydration (BUG-RAWLS-008 regression)', () => {
    const STORAGE_KEY = 'rawls-session-v1';

    it('should hydrate answers on store construction (simulates /review landing)', () => {
      // Arrange: clear storage and seed with a valid session containing TLQ answers
      sessionStorage.clear();
      const storedSession = {
        v: 1,
        selectedCategoryIds: ['liberty'],
        completedCategoryIds: [],
        answers: { 'liberty-q0': 3, 'liberty-q1': 4 },
        skipped: []
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession));

      // Act: reset TestBed to force fresh store construction
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ContentService, useValue: mockContentService }
        ]
      });
      const freshStore = TestBed.inject(SessionStore);

      // Assert: store has hydrated answers
      const answers = freshStore.answers();
      expect(Object.keys(answers).length).toBeGreaterThan(0);
      expect(answers['liberty-q0']).toBe(3);
      expect(answers['liberty-q1']).toBe(4);
      expect(freshStore.selectedIds()).toContain('liberty');
      
      // Cleanup
      sessionStorage.clear();
    });
  });

  describe('Challenge answers (separate storage)', () => {
    const STORAGE_KEY = 'rawls-session-v1';

    it('should store challenge answers separately from position answers', () => {
      store.recordAnswer('liberty-q0', 3);
      store.recordChallengeAnswer('liberty-q0-fu0', 5);
      
      expect(store.answers()).toEqual({ 'liberty-q0': 3 });
      expect(store.challengeAnswers()).toEqual({ 'liberty-q0-fu0': 5 });
    });

    it('should persist challengeAnswers to sessionStorage', () => {
      store.selectCategories(['liberty']);
      store.recordAnswer('liberty-q0', 3);
      store.recordChallengeAnswer('liberty-q0-fu0', 5);
      
      const stored = sessionStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.answers).toEqual({ 'liberty-q0': 3 });
      expect(parsed.challengeAnswers).toEqual({ 'liberty-q0-fu0': 5 });
    });

    it('should hydrate challengeAnswers from sessionStorage', () => {
      sessionStorage.clear();
      const storedSession = {
        v: 1,
        selectedCategoryIds: ['liberty'],
        completedCategoryIds: [],
        answers: { 'liberty-q0': 3 },
        challengeAnswers: { 'liberty-q0-fu0': 5 },
        skipped: []
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ContentService, useValue: mockContentService }
        ]
      });
      const freshStore = TestBed.inject(SessionStore);

      expect(freshStore.answers()).toEqual({ 'liberty-q0': 3 });
      expect(freshStore.challengeAnswers()).toEqual({ 'liberty-q0-fu0': 5 });
      
      sessionStorage.clear();
    });

    it('should default challengeAnswers to empty object when missing from persisted state (backward compatibility)', () => {
      sessionStorage.clear();
      const legacySession = {
        v: 1,
        selectedCategoryIds: ['liberty'],
        completedCategoryIds: [],
        answers: { 'liberty-q0': 3 },
        skipped: []
        // Note: challengeAnswers field is missing (legacy session)
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(legacySession));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ContentService, useValue: mockContentService }
        ]
      });
      const freshStore = TestBed.inject(SessionStore);

      expect(freshStore.answers()).toEqual({ 'liberty-q0': 3 });
      expect(freshStore.challengeAnswers()).toEqual({}); // Should default to empty, not undefined
      
      sessionStorage.clear();
    });
  });

  describe('Scoring isolation (challenge answers do not pollute calculateProfile)', () => {
    it('should not affect calculateProfile output when challenge answers added', async () => {
      // Import calculateProfile for direct testing
      const { calculateProfile } = await import('../engine/profile');
      
      // Case 1: Position answers only
      const positionAnswersOnly = { 'liberty-q0': 4, 'equality-q0': 3, 'fairness-q0': 5 };
      const profile1 = calculateProfile(positionAnswersOnly);
      
      // Case 2: Same position answers + challenge answer in separate map (not passed to calculateProfile)
      store.selectCategories(['liberty']);
      store.recordAnswer('liberty-q0', 4);
      store.recordAnswer('equality-q0', 3);
      store.recordAnswer('fairness-q0', 5);
      store.recordChallengeAnswer('liberty-q0-fu0', 1); // Challenge answer stored separately
      
      // calculateProfile should only receive position answers
      const positionAnswersFromStore = store.answers();
      const profile2 = calculateProfile(positionAnswersFromStore);
      
      // Assert: profiles are identical (challenge answer did not pollute)
      expect(profile2.code).toBe(profile1.code);
      expect(profile2.title).toBe(profile1.title);
      expect(profile2.summary).toBe(profile1.summary);
      
      // Verify challenge answer was stored separately
      expect(store.challengeAnswers()).toEqual({ 'liberty-q0-fu0': 1 });
      expect(store.answers()['liberty-q0-fu0']).toBeUndefined(); // NOT in position answers
    });
  });
});