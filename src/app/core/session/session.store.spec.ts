/**
 * @human SessionStore V2 tests: answers, persistence, and hasSavedProgress
 * @proves SessionStore stores Setting answers, persists to sessionStorage with wwm-session-v2 key,
 *         hydrates on boot, and resets cleanly via startFresh
 * @lastTouched V2 rewrite
 */
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SessionStore } from './session.store';

const STORAGE_KEY = 'wwm-session-v2';

describe('SessionStore', () => {
  let store: SessionStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    store = TestBed.inject(SessionStore);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty answers', () => {
    expect(store.answers()).toEqual({});
    expect(store.hasSavedProgress()).toBe(false);
  });

  it('should record a Setting answer', () => {
    store.recordAnswer('continuity-q1', 'A');
    expect(store.answers()['continuity-q1']).toBe('A');
    expect(store.hasSavedProgress()).toBe(true);
  });

  it('should record multiple answers', () => {
    store.recordAnswer('continuity-q1', 'A');
    store.recordAnswer('scope-q1', 'C');
    store.recordAnswer('load-q1', 'B');

    const answers = store.answers();
    expect(answers['continuity-q1']).toBe('A');
    expect(answers['scope-q1']).toBe('C');
    expect(answers['load-q1']).toBe('B');
  });

  it('should overwrite an existing answer', () => {
    store.recordAnswer('continuity-q1', 'A');
    store.recordAnswer('continuity-q1', 'C');
    expect(store.answers()['continuity-q1']).toBe('C');
  });

  it('should reset to empty on startFresh', () => {
    store.recordAnswer('continuity-q1', 'A');
    store.startFresh();
    expect(store.answers()).toEqual({});
    expect(store.hasSavedProgress()).toBe(false);
  });

  describe('persistence', () => {
    it('should persist answers to sessionStorage', () => {
      store.recordAnswer('continuity-q1', 'B');

      const raw = sessionStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.v).toBe(2);
      expect(parsed.answers['continuity-q1']).toBe('B');
    });

    it('should persist startFresh to sessionStorage', () => {
      store.recordAnswer('continuity-q1', 'A');
      store.startFresh();

      const raw = sessionStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(raw!);
      expect(parsed.answers).toEqual({});
    });

    it('should hydrate answers on boot', () => {
      const seed = { v: 2, answers: { 'continuity-q1': 'A', 'scope-q1': 'C' } };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()]
      });
      const freshStore = TestBed.inject(SessionStore);

      expect(freshStore.answers()['continuity-q1']).toBe('A');
      expect(freshStore.answers()['scope-q1']).toBe('C');
      expect(freshStore.hasSavedProgress()).toBe(true);
    });

    it('should ignore storage with wrong version', () => {
      const v1Session = { v: 1, answers: { 'continuity-q1': 3 } };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v1Session));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()]
      });
      const freshStore = TestBed.inject(SessionStore);

      expect(freshStore.answers()).toEqual({});
      expect(freshStore.hasSavedProgress()).toBe(false);
    });

    it('should handle corrupt sessionStorage gracefully', () => {
      sessionStorage.setItem(STORAGE_KEY, 'not-valid-json');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()]
      });
      const freshStore = TestBed.inject(SessionStore);

      expect(freshStore.answers()).toEqual({});
      expect(freshStore.hasSavedProgress()).toBe(false);
    });
  });
});
