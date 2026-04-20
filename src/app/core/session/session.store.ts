import { Injectable, signal, computed } from '@angular/core';
import { Setting } from '../content/types';

interface WwmSessionV2 {
  v: 2;
  answers: Record<string, Setting>;
}

const STORAGE_KEY = 'wwm-session-v2';

@Injectable({
  providedIn: 'root'
})
export class SessionStore {
  private _answers = signal<Record<string, Setting>>({});

  readonly answers = this._answers.asReadonly();

  hasSavedProgress = computed(() => Object.keys(this._answers()).length > 0);

  constructor() {
    this.hydrateFromStorage();
  }

  recordAnswer(questionId: string, value: Setting): void {
    this._answers.update(a => ({ ...a, [questionId]: value }));
    this.persistToStorage();
  }

  startFresh(): void {
    this._answers.set({});
    this.persistToStorage();
  }

  private hydrateFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.v !== 2) return;
      const session = parsed as WwmSessionV2;
      if (session.answers && typeof session.answers === 'object') {
        this._answers.set(session.answers);
      }
    } catch {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  }

  private persistToStorage(): void {
    try {
      const session: WwmSessionV2 = { v: 2, answers: this._answers() };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch { /* ignore */ }
  }
}
