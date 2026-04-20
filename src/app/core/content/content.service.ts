import { Injectable, signal } from '@angular/core';
import { V2Content, V2ContentState } from './types';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private _state = signal<V2ContentState>({
    content: null,
    loading: true,
    error: null
  });

  state = this._state.asReadonly();

  async loadContent(): Promise<void> {
    try {
      this._state.update(s => ({ ...s, loading: true, error: null }));
      const response = await fetch('/assets/content/working-with-me.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const content: V2Content = await response.json();
      this._state.set({ content, loading: false, error: null });
    } catch (error) {
      this._state.set({
        content: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error loading content'
      });
    }
  }
}
