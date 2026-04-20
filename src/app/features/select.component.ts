import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../core/content/content.service';
import { SessionStore, AssessmentDepth } from '../core/session/session.store';

interface DepthOption {
  id: AssessmentDepth;
  label: string;
  subtitle: string;
  questionCount: string;
  time: string;
}

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 space-y-8" data-testid="view-select">
      <header class="space-y-2">
        <h2 class="text-2xl font-bold text-gray-900">How deep do you want to go?</h2>
        <p class="text-gray-600">
          Both paths produce the same document structure.
          The Full path produces more specific, richer guidance.
        </p>
      </header>

      <div class="space-y-4">
        @for (option of depthOptions; track option.id) {
          <button
            [attr.data-testid]="'depth-' + option.id"
            [class]="depthClass(option.id)"
            (click)="selectDepth(option.id)">
            <div class="text-left flex-1">
              <div class="font-bold text-gray-900 text-lg">{{ option.label }}</div>
              <div class="text-gray-600 text-sm mt-1">{{ option.subtitle }}</div>
              <div class="flex gap-4 mt-2 text-sm">
                <span class="text-gray-500">{{ option.questionCount }}</span>
                <span class="text-gray-500">{{ option.time }}</span>
              </div>
            </div>
            @if (selected() === option.id) {
              <span class="text-blue-600 font-bold text-lg ml-4">✓</span>
            }
          </button>
        }
      </div>

      <button
        data-testid="continue-btn"
        [disabled]="!selected()"
        (click)="onContinue()"
        class="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
        Start Assessment
      </button>
    </div>
  `
})
export class SelectComponent {
  private sessionStore = inject(SessionStore);
  private contentService = inject(ContentService);
  private router = inject(Router);

  selected = signal<AssessmentDepth | null>(null);

  depthOptions: DepthOption[] = [
    {
      id: 'quick',
      label: 'Quick',
      subtitle: 'The most important questions. A functional, practical document.',
      questionCount: '14 questions',
      time: 'About 5 minutes'
    },
    {
      id: 'full',
      label: 'Full',
      subtitle: 'All seven dimensions in depth, with follow-up questions where you show strong patterns. A richer, more specific document.',
      questionCount: '35 questions',
      time: '15–20 minutes'
    }
  ];

  constructor() {
    this.contentService.loadContent();
    const existing = this.sessionStore.depth();
    if (existing) this.selected.set(existing);
  }

  selectDepth(id: AssessmentDepth): void {
    this.selected.set(id);
  }

  depthClass(id: string): string {
    const base = 'w-full flex items-center p-5 border-2 rounded-xl transition-colors cursor-pointer';
    return this.selected() === id
      ? `${base} border-blue-500 bg-blue-50`
      : `${base} border-gray-200 hover:border-blue-300 hover:bg-gray-50`;
  }

  onContinue(): void {
    const depth = this.selected();
    if (!depth) return;
    this.sessionStore.setDepth(depth);
    const categories = this.contentService.state().categories;
    if (categories.length === 0) return;
    this.router.navigate(['/q', categories[0].id]);
  }
}
