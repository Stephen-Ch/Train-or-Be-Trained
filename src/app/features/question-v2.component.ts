import { Component, inject, computed, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { buildSequence, findNextUnanswered, SequencedQuestion } from '../core/flow/question-sequencer';

@Component({
  selector: 'app-question-v2',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 flex flex-col gap-6" data-testid="view-question">

      @if (currentQuestion(); as q) {

        <!-- Progress -->
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ q.dimensionName }}</span>
            <span>{{ q.overallIndex + 1 }} of {{ q.overallTotal }}</span>
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
            {{ q.statement }}
          </p>

          <!-- Likert scale — labels embedded in each button -->
          <div class="flex gap-2 justify-between">
            @for (val of [0, 1, 2, 3, 4]; track val) {
              <button
                [attr.data-testid]="'option-' + val"
                [class]="optionClass(val, q.questionId)"
                (click)="selectAnswer(q.questionId, val)">
                <span class="block text-base font-bold leading-none">{{ val + 1 }}</span>
                <span class="block text-[10px] leading-tight mt-1 font-normal opacity-80">{{ likert5()[val] }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center">
          <button
            data-testid="back-btn"
            [disabled]="q.overallIndex === 0"
            (click)="goBack()"
            class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            ← Back
          </button>

          @if (isAnswered(q.questionId)) {
            <button
              data-testid="next-btn"
              (click)="goForward()"
              class="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {{ isLast(q) ? 'See My Document' : 'Next' }} →
            </button>
          }
        </div>

      } @else {
        <p class="text-gray-500 text-center">Loading questions…</p>
      }

    </div>
  `
})
export class QuestionV2Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contentService = inject(ContentService);
  private sessionStore = inject(SessionStore);

  private _overallIndex = signal(0);

  likert5 = computed(() => this.contentService.state().likert5);
  answers = computed(() => this.sessionStore.answers());

  sequence = computed(() => {
    const categories = this.contentService.state().categories;
    const depth = this.sessionStore.depth() ?? 'quick';
    if (!categories.length) return [];
    return buildSequence(categories, depth);
  });

  currentQuestion = computed((): SequencedQuestion | null => {
    const seq = this.sequence();
    const idx = this._overallIndex();
    return seq[idx] ?? null;
  });

  ngOnInit(): void {
    this.contentService.loadContent();

    this.route.params.subscribe((params) => {
      const dimensionId = params['id'];
      const seq = this.sequence();
      const firstIdx = seq.findIndex((q) => q.dimensionId === dimensionId);
      if (firstIdx >= 0) {
        this._overallIndex.set(firstIdx);
      } else {
        const nextIdx = findNextUnanswered(seq, this.sessionStore.answers());
        this._overallIndex.set(nextIdx >= 0 ? nextIdx : 0);
      }
    });
  }

  progressPercent(q: SequencedQuestion): number {
    return Math.round(((q.overallIndex) / q.overallTotal) * 100);
  }

  isAnswered(questionId: string): boolean {
    return questionId in this.answers();
  }

  isLast(q: SequencedQuestion): boolean {
    return q.overallIndex === q.overallTotal - 1;
  }

  optionClass(val: number, questionId: string): string {
    const current = this.answers()[questionId];
    const selected = current === val;
    const base = 'flex-1 py-3 px-1 rounded-lg font-semibold text-sm transition-colors border-2 flex flex-col items-center';
    return selected
      ? `${base} bg-blue-600 text-white border-blue-600`
      : `${base} bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50`;
  }

  selectAnswer(questionId: string, val: number): void {
    this.sessionStore.recordAnswer(questionId, val);
  }

  goForward(): void {
    const q = this.currentQuestion();
    if (!q) return;

    if (q.overallIndex >= q.overallTotal - 1) {
      this.router.navigate(['/result']);
      return;
    }

    const nextIdx = q.overallIndex + 1;
    this._overallIndex.set(nextIdx);
    const nextQ = this.sequence()[nextIdx];
    if (nextQ) {
      this.router.navigate(['/q', nextQ.dimensionId]);
    }
  }

  goBack(): void {
    const q = this.currentQuestion();
    if (!q || q.overallIndex === 0) return;
    const prevIdx = q.overallIndex - 1;
    this._overallIndex.set(prevIdx);
    const prevQ = this.sequence()[prevIdx];
    if (prevQ) {
      this.router.navigate(['/q', prevQ.dimensionId]);
    }
  }
}
