import { Injectable, signal, computed, inject } from '@angular/core';
import { ContentService } from '../content/content.service';

/** Assessment depth choice */
export type AssessmentDepth = 'quick' | 'full';

/** Shape persisted in sessionStorage */
interface WwmSessionV1 {
  v: 1;
  lens: string | null;
  depth: AssessmentDepth | null;
  answers: Record<string, number>;
}

const STORAGE_KEY = 'wwm-session-v1';

@Injectable({
  providedIn: 'root'
})
export class SessionStore {
  private contentService = inject(ContentService);

  // Core state
  private _lens = signal<string | null>(null);
  private _depth = signal<AssessmentDepth | null>(null);
  private _answers = signal<Record<string, number>>({});

  constructor() {
    this.hydrateFromStorage();
  }

  // Public readonly signals
  readonly lens = this._lens.asReadonly();
  readonly depth = this._depth.asReadonly();
  readonly answers = this._answers.asReadonly();

  /** Ordered list of dimension ids (all seven, always) */
  readonly sequence = computed(() =>
    this.contentService.state().categories.map((c) => c.id)
  );

  /** Selected (also kept as selectedIds for compatibility with question components) */
  readonly selectedIds = computed(() =>
    this.contentService.state().categories.map((c) => c.id)
  );

  hasSavedProgress = computed(() => {
    return this._lens() !== null || Object.keys(this._answers()).length > 0;
  });

  // ── Setters ──────────────────────────────────────────────────────────

  setLens(lensId: string): void {
    this._lens.set(lensId);
    this.persistToStorage();
  }

  setDepth(depth: AssessmentDepth): void {
    this._depth.set(depth);
    this.persistToStorage();
  }

  recordAnswer(questionId: string, value: number): void {
    this._answers.update((a) => ({ ...a, [questionId]: value }));
    this.persistToStorage();
  }

  /** Reset everything for a fresh start */
  startFresh(): void {
    this._lens.set(null);
    this._depth.set(null);
    this._answers.set({});
    this.persistToStorage();
  }

  // ── Persistence ───────────────────────────────────────────────────────

  private hydrateFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.v !== 1) return;
      const session = parsed as WwmSessionV1;
      if (session.lens) this._lens.set(session.lens);
      if (session.depth) this._depth.set(session.depth);
      if (session.answers && typeof session.answers === 'object') {
        this._answers.set(session.answers);
      }
    } catch {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  }

  private persistToStorage(): void {
    try {
      const session: WwmSessionV1 = {
        v: 1,
        lens: this._lens(),
        depth: this._depth(),
        answers: this._answers()
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch { /* ignore */ }
  }
}
