import { Injectable, signal } from '@angular/core';
import { ContentState, ContentData, Category, Lens } from './types';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private _state = signal<ContentState>({
    categories: [],
    rawCategories: [],
    likert5: [],
    lenses: [],
    loading: true,
    error: null
  });

  state = this._state.asReadonly();

  async loadContent(): Promise<void> {
    try {
      this._state.update(state => ({ ...state, loading: true, error: null }));

      const jsonText = await this.fetchContent();
      const data: ContentData = JSON.parse(jsonText);

      const rawCategories = this.cloneCategories(data.categories);

      this._state.update(state => ({
        ...state,
        categories: rawCategories,
        rawCategories,
        likert5: data.likert5,
        lenses: data.lenses ?? [],
        loading: false,
        error: null
      }));
    } catch (error) {
      this._state.update(state => ({
        ...state,
        categories: [],
        rawCategories: [],
        likert5: [],
        lenses: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  private async fetchContent(): Promise<string> {
    const response = await fetch('/assets/content/working-with-me.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.text();
  }

  private cloneCategories(categories: Category[]): Category[] {
    return categories.map((category) => ({
      ...category,
      followUps: Array.isArray(category.followUps)
        ? category.followUps.map((q) => ({ ...q }))
        : []
    }));
  }

  /** Filter questions to Quick path only */
  getQuickCategories(): Category[] {
    return this._state().categories.map((cat) => ({
      ...cat,
      followUps: cat.followUps.filter((q) => q.quick)
    }));
  }

  /** Get a lens by id */
  getLens(id: string): Lens | undefined {
    return this._state().lenses.find((l) => l.id === id);
  }
}
