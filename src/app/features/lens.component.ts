import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';

@Component({
  selector: 'app-lens',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 space-y-8" data-testid="view-lens">
      <header class="space-y-2">
        <h2 class="text-2xl font-bold text-gray-900">What context are you thinking about?</h2>
        <p class="text-gray-600">
          Your answers will shape the document your AI gets.
          Choose the context that matters most to you right now.
        </p>
      </header>

      @if (contentService.state().loading) {
        <p class="text-gray-500">Loading…</p>
      } @else {
        <div class="space-y-3">
          @for (lens of lenses(); track lens.id) {
            <button
              [attr.data-testid]="'lens-' + lens.id"
              [class]="lensClass(lens.id)"
              (click)="selectLens(lens.id)">
              <div class="text-left">
                <div class="font-semibold text-gray-900">{{ lens.label }}</div>
                <div class="text-sm text-gray-600 mt-0.5">{{ lens.description }}</div>
              </div>
              @if (selected() === lens.id) {
                <span class="text-blue-600 font-bold text-lg ml-2">✓</span>
              }
            </button>
          }
        </div>

        <button
          data-testid="lens-continue"
          [disabled]="!selected()"
          (click)="onContinue()"
          class="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
          Continue
        </button>
      }
    </div>
  `
})
export class LensComponent {
  protected contentService = inject(ContentService);
  private sessionStore = inject(SessionStore);
  private router = inject(Router);

  selected = signal<string | null>(null);
  lenses = computed(() => this.contentService.state().lenses);

  constructor() {
    this.contentService.loadContent();
    // Pre-select if already chosen
    const existing = this.sessionStore.lens();
    if (existing) this.selected.set(existing);
  }

  selectLens(id: string): void {
    this.selected.set(id);
  }

  lensClass(id: string): string {
    const base = 'w-full flex items-center justify-between p-4 border-2 rounded-xl transition-colors cursor-pointer text-left';
    return this.selected() === id
      ? `${base} border-blue-500 bg-blue-50`
      : `${base} border-gray-200 hover:border-blue-300 hover:bg-gray-50`;
  }

  onContinue(): void {
    const id = this.selected();
    if (!id) return;
    this.sessionStore.setLens(id);
    this.router.navigate(['/select']);
  }
}
