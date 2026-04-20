import { Component, inject, computed, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { Setting, V2Question, V2Control } from '../core/content/types';

function track(event: string): void {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event);
  }
}

interface FlatQuestion {
  questionId: string;
  questionText: string;
  options: Record<Setting, string>;
  controlName: string;
  controlIndex: number;
  questionIndex: number;
  totalQuestions: number;
}

@Component({
  selector: 'app-setup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 flex flex-col gap-6" data-testid="view-setup">

      @if (loading()) {
        <p class="text-gray-500 text-center py-12">Loading…</p>
      } @else if (error()) {
        <p class="text-red-500 text-center py-12">{{ error() }}</p>
      } @else if (currentQuestion(); as q) {

        <!-- Progress -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-gray-500">
            <span class="font-medium text-gray-700">{{ q.controlName }}</span>
            <span>{{ q.controlIndex * 2 + q.questionIndex + 1 }} of {{ q.totalQuestions }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div
              class="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              [style.width.%]="progressPercent(q)">
            </div>
          </div>
        </div>

        <!-- Question card -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <p
            class="text-lg text-gray-900 leading-relaxed"
            data-testid="question-statement">
            {{ q.questionText }}
          </p>

          <!-- A / B / C options -->
          <div class="flex flex-col gap-3">
            @for (opt of optionKeys; track opt) {
              <button
                [attr.data-testid]="'option-' + opt"
                [class]="optionClass(opt, q.questionId)"
                (click)="selectAnswer(q.questionId, opt)">
                <span class="font-bold text-sm mr-2">{{ opt }}</span>
                <span class="text-sm leading-snug text-left">{{ q.options[opt] }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center">
          <button
            data-testid="back-btn"
            [disabled]="currentIndex() === 0"
            (click)="goBack()"
            class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            ← Back
          </button>

          @if (isAnswered(q.questionId)) {
            <button
              data-testid="next-btn"
              (click)="goForward()"
              class="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {{ isLast() ? 'See My Document' : 'Next' }} →
            </button>
          }
        </div>

      }
    </div>
  `
})
export class SetupComponent implements OnInit {
  private contentService = inject(ContentService);
  private sessionStore = inject(SessionStore);
  private router = inject(Router);

  readonly optionKeys: Setting[] = ['A', 'B', 'C'];

  currentIndex = signal(0);

  loading = computed(() => this.contentService.state().loading);
  error = computed(() => this.contentService.state().error);
  answers = computed(() => this.sessionStore.answers());

  flatQuestions = computed((): FlatQuestion[] => {
    const content = this.contentService.state().content;
    if (!content) return [];

    const flat: FlatQuestion[] = [];
    const totalQuestions = content.controls.reduce((sum, c) => sum + c.questions.length, 0);

    content.controls.forEach((control, controlIndex) => {
      control.questions.forEach((q, questionIndex) => {
        flat.push({
          questionId: q.id,
          questionText: q.text,
          options: q.options,
          controlName: control.name,
          controlIndex,
          questionIndex,
          totalQuestions
        });
      });
    });

    return flat;
  });

  currentQuestion = computed((): FlatQuestion | null => {
    const questions = this.flatQuestions();
    const idx = this.currentIndex();
    return questions[idx] ?? null;
  });

  ngOnInit(): void {
    this.contentService.loadContent();
  }

  progressPercent(q: FlatQuestion): number {
    const answered = this.flatQuestions()
      .slice(0, this.currentIndex())
      .filter(fq => fq.questionId in this.answers()).length;
    return Math.round((this.currentIndex() / q.totalQuestions) * 100);
  }

  isAnswered(questionId: string): boolean {
    return questionId in this.answers();
  }

  isLast(): boolean {
    return this.currentIndex() === this.flatQuestions().length - 1;
  }

  optionClass(opt: Setting, questionId: string): string {
    const selected = this.answers()[questionId] === opt;
    const base = 'flex items-start w-full px-4 py-3 rounded-lg border-2 text-left transition-colors';
    return selected
      ? `${base} bg-blue-600 text-white border-blue-600`
      : `${base} bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50`;
  }

  selectAnswer(questionId: string, value: Setting): void {
    this.sessionStore.recordAnswer(questionId, value);
  }

  goForward(): void {
    if (this.isLast()) {
      track('setup_completed');
      this.router.navigate(['/result']);
      return;
    }
    this.currentIndex.update(i => i + 1);
  }

  goBack(): void {
    if (this.currentIndex() === 0) return;
    this.currentIndex.update(i => i - 1);
  }
}
