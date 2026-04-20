import { Component, inject, computed, signal, OnInit, ChangeDetectionStrategy, effect, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { followupsGuard } from './followups.guard';
import { TERMINOLOGY } from '../shared/terminology';

@Component({
  selector: 'app-question',
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto p-6">
      @if (currentCategory(); as category) {
        <header class="text-center mb-8">
          <h1 data-testid="category-header" class="text-2xl font-bold text-gray-900 mb-2">
            <span data-testid="category-title">{{ category.name }}</span>
          </h1>
          <p data-testid="category-quote" class="text-lg text-gray-600 italic">
            "{{ category.quote }}"
          </p>
          <div data-testid="progress" class="mt-4 text-sm text-gray-500">
            {{ idealProgress() }}
          </div>
          <div data-testid="category-progress" class="mt-2 text-sm text-gray-500">
            {{ positionProgress() }}
          </div>
          @if (phase() === 'followUps') {
            <div data-testid="breadcrumb" class="mt-4 text-sm text-gray-600">
              {{ breadcrumb() }}
            </div>
            <div data-testid="followup-progress" class="text-xs text-gray-500">
              {{ followUpProgress() }}
            </div>
          }
        </header>

        @if (debugQuestionEnabled()) {
          <pre data-testid="debug-question" class="text-xs bg-yellow-100 p-2 mb-4 rounded overflow-auto max-h-40">
debugSource: {{ debugSource() }}
URL: {{ router.url }}
currentId: {{ currentId }}
phase: {{ phase() }}
selectedOption: {{ selectedOption() || 'null' }}
currentFollowUpIndex: {{ currentFollowUpIndex() }}
totalFollowUpsForSelected: {{ totalFollowUpsForSelected() }}
answeredFollowUps: {{ answeredFollowUps() }}
canContinue: {{ canContinue() }}
options: {{ options().join(', ') }}
          </pre>
        }

        @if (phase() === 'chooseOption') {
          <!-- Top-level questions -->
          <div data-testid="phase-tlq" class="space-y-6 mb-8">
            @for (optionId of options(); track optionId) {
              <fieldset
                class="p-4 border rounded-lg space-y-3"
                [attr.data-testid]="'tlq-card-' + optionId"
              >
                <legend
                  class="font-medium"
                  [attr.data-testid]="'tlq-statement-' + optionId"
                >
                  {{ tlqStatement(optionId) }}
                </legend>
                <div
                  class="text-xs text-gray-600 opacity-70"
                  [attr.data-testid]="'likert-axis-' + optionId"
                >
                  {{ scaleAxisLeftFor(tlqStatement(optionId)) }} | {{ scaleAxisRightFor(tlqStatement(optionId)) }}
                </div>
                <div
                  class="flex flex-row items-center justify-between gap-4"
                  [attr.data-testid]="'likert-group-' + optionId"
                >
                  @for (label of scaleLabelsFor(tlqStatement(optionId)); track $index) {
                    <label class="flex flex-col items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        [name]="'tlq-' + optionId"
                        [value]="$index + 1"
                        [checked]="getAnswer(optionId) === $index + 1"
                        (change)="onTopLevelAnswerChange(optionId, $index + 1)"
                        [attr.data-testid]="'likert-' + optionId + '-value-' + ($index + 1)"
                        [attr.aria-label]="label"
                        class="h-4 w-4">
                      <span class="min-h-4">{{ likertCaption($index, label) }}</span>
                    </label>
                  }
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-2" data-testid="scale-labels">
                  <span>{{ scaleLabelsFor(tlqStatement(optionId))[0] }}</span>
                  <span>{{ scaleLabelsFor(tlqStatement(optionId))[2] }}</span>
                  <span>{{ scaleLabelsFor(tlqStatement(optionId))[4] }}</span>
                </div>
              </fieldset>
            }
          </div>
        } @else {
          <!-- Phase 2: Show follow-ups for selected option -->
          <div data-testid="phase-followups" class="space-y-6 mb-8">
            @for (followUp of currentFollowUps(); track followUp.id; let followUpIndex = $index) {
              <fieldset
                class="p-4 border rounded-lg space-y-3"
                [attr.data-testid]="'fu-card-' + (selectedOption() || '') + '-' + (currentFollowUpIndex() + followUpIndex + 1)"
              >
                <legend
                  class="font-medium"
                  [attr.data-testid]="'fu-statement-' + (selectedOption() || '') + '-' + (currentFollowUpIndex() + followUpIndex + 1)"
                >
                  {{ followUp.statement || followUp.text }}
                </legend>
                <div
                  class="text-xs text-gray-600 opacity-70"
                  [attr.data-testid]="'likert-axis-' + (selectedOption() || '') + '-' + (currentFollowUpIndex() + followUpIndex + 1)"
                >
                  {{ scaleAxisLeftFor(followUp.statement || followUp.text || '') }} | {{ scaleAxisRightFor(followUp.statement || followUp.text || '') }}
                </div>
                <div
                  class="flex flex-row items-center justify-between gap-4"
                  [attr.data-testid]="'likert-group-' + (selectedOption() || '') + '-' + (currentFollowUpIndex() + followUpIndex + 1)"
                >
                  @for (label of scaleLabelsFor(followUp.statement || followUp.text || ''); track $index; let likertIndex = $index) {
                    <label class="flex flex-col items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="radio"
                        [name]="'fu-' + (selectedOption() || '') + '-' + (currentFollowUpIndex() + followUpIndex + 1)"
                        [value]="likertIndex + 1"
                        [checked]="getFollowUpAnswer() === likertIndex + 1"
                        (change)="onAnswerChange(followUp.id, likertIndex + 1)"
                        [attr.data-testid]="'likert-' + (selectedOption() || '') + '-' + (currentFollowUpIndex() + followUpIndex + 1) + '-value-' + (likertIndex + 1)"
                        [attr.aria-label]="label"
                        class="h-4 w-4">
                      <span class="min-h-4">{{ likertCaption(likertIndex, label) }}</span>
                    </label>
                  }
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-2" data-testid="scale-labels">
                  <span>{{ scaleLabelsFor(followUp.statement || followUp.text || '')[0] }}</span>
                  <span>{{ scaleLabelsFor(followUp.statement || followUp.text || '')[2] }}</span>
                  <span>{{ scaleLabelsFor(followUp.statement || followUp.text || '')[4] }}</span>
                </div>
              </fieldset>
            }
          </div>
        }

        <div class="flex gap-4">
          <button
            data-testid="skip"
            (click)="onSkip()"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Skip
          </button>
          <button
            data-testid="continue"
            [disabled]="!canContinue()"
            (click)="onContinue()"
            class="flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      } @else {
        <div class="text-center p-8">
          <h2 class="text-xl font-bold mb-4">Category Not Found</h2>
          <p class="mb-4">Category "{{ currentId }}" is not available or not selected.</p>
          <div class="space-y-2">
            <button
              (click)="autoSelectAndContinue()"
              class="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Auto-select A & B and Continue
            </button>
            <a
              href="/select"
              class="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-center"
            >
              Go to Category Selection
            </a>
          </div>
        </div>
      }

      @if (showDebug()) {
        <div
          data-testid="debug-hud"
          class="fixed bottom-2 right-2 text-xs px-2 py-1 rounded bg-black/60 text-white space-y-1 shadow"
        >
          <div>{{ currentId }} / {{ selectedOption() || '–' }} / {{ currentFollowUpIndex() + 1 }}</div>
          <button
            type="button"
            data-testid="debug-quickfill"
            (click)="debugQuickFill()"
            class="block w-full rounded bg-white/20 px-2 py-1 text-white hover:bg-white/30"
          >
            QuickFill
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  public contentService = inject(ContentService);
  public sessionStore = inject(SessionStore);

  // Expose terminology dictionary to template
  readonly TERMINOLOGY = TERMINOLOGY;

  currentId = '';
  phase = signal<'chooseOption' | 'followUps'>('chooseOption');
  selectedOption = signal<string | null>(null);
  currentFollowUpIndex = signal<number>(0);
  showDebug = signal(false);
  debugQuestionEnabled = signal(false);
  debugSource = signal<'query' | 'session' | 'off'>('off');
  categoryTitle = computed(() => {
    this.phase();
    return this.currentCategory()?.name ?? '';
  });
  answeredFollowUps = computed(() => {
    const answers = this.sessionStore.answers();
    return this.options().filter(id => answers[id] !== undefined).length;
  });
  totalFollowUpsForSelected = computed(() => this.options().length);
  breadcrumb = computed(() => {
    if (this.phase() !== 'followUps') return '';
    const category = this.currentCategory();
    const optionId = this.selectedOption();
    if (!category || !optionId) return '';
    const statement = this.tlqStatement(optionId);
    return `${category.name} > ${this.abbreviate(statement)} > ${TERMINOLOGY.CHALLENGE_PLURAL}`;
  });
  followUpProgress = computed(() => {
    if (this.phase() !== 'followUps') return '';
    const optionId = this.selectedOption();
    const category = this.currentCategory();
    if (!optionId || !category) return '';
    const total = this.filterVisibleFollowUps(category.followUps).filter(f => f.id === optionId).length;
    if (!total) return '';
    return `${Math.min(this.currentFollowUpIndex() + 1, total)}/${total}`;
  });

  idealProgress = computed(() => {
    const current = this.currentIndex() + 1;
    const total = this.totalQuestions();
    return `${TERMINOLOGY.IDEAL_SINGULAR} ${current} of ${total}`;
  });

  positionProgress = computed(() => {
    const answered = this.answeredFollowUps();
    const total = this.totalFollowUpsForSelected();
    return `${TERMINOLOGY.POSITION_SINGULAR} ${answered}/${total}`;
  });

  tlqStatement(optionId: string): string {
    const category = this.currentCategory();
    const followUp = this.filterVisibleFollowUps(category?.followUps ?? []).find(f => f.id === optionId);
    return followUp?.statement ?? followUp?.text ?? `Option ${optionId}`;
  }

  private isImportanceQuestion(text: string): boolean {
    const normalized = text.trim().toLowerCase();
    return normalized.startsWith('how important is') || normalized.includes('how important are');
  }

  scaleLabelsFor(statementText: string): readonly string[] {
    return this.isImportanceQuestion(statementText)
      ? TERMINOLOGY.IMPORTANCE_SCALE_LABELS
      : TERMINOLOGY.SCALE_LABELS;
  }

  scaleAxisLeftFor(statementText: string): string {
    return this.isImportanceQuestion(statementText)
      ? TERMINOLOGY.IMPORTANCE_AXIS_LEFT
      : TERMINOLOGY.SCALE_AXIS_LEFT;
  }

  scaleAxisRightFor(statementText: string): string {
    return this.isImportanceQuestion(statementText)
      ? TERMINOLOGY.IMPORTANCE_AXIS_RIGHT
      : TERMINOLOGY.SCALE_AXIS_RIGHT;
  }

  private abbreviate(statement: string, limit = 8): string {
    const words = statement.trim().split(/\s+/);
    return words.length <= limit ? statement : `${words.slice(0, limit).join(' ')}…`;
  }
  
  private filterVisibleFollowUps<T extends { hidden?: boolean }>(followUps: T[] = []): T[] {
    return followUps.filter(followUp => followUp.hidden !== true);
  }
  
  currentCategory = computed(() => {
    this.phase();
    const categories = this.contentService.state().categories;
    return categories.find(c => c.id === this.currentId);
  });

  // Extract unique options from followUp IDs (each followUp.id is a standalone option)
  options = computed(() => {
    const category = this.currentCategory();
    if (!category) return [];
    
    const optionIds = new Set<string>();
    this.filterVisibleFollowUps(category.followUps).forEach(f => optionIds.add(f.id));
    
    return Array.from(optionIds).sort();
  });

  // Get followUps for the selected option (each followUp.id is a standalone option)
  currentFollowUps = computed(() => {
    if (this.phase() !== 'followUps' || !this.selectedOption()) return [];
    
    const category = this.currentCategory();
    if (!category) return [];
    
    const selected = this.filterVisibleFollowUps(category.followUps).filter(f => f.id === this.selectedOption());
    
    // Return only the current follow-up based on index
    const index = this.currentFollowUpIndex();
    return index < selected.length ? [selected[index]] : [];
  });

  currentIndex = computed(() => {
    const sequence = this.sessionStore.sequence();
    return sequence.indexOf(this.currentId);
  });

  totalQuestions = computed(() => this.sessionStore.sequence().length);

  likertLabels = computed(() => this.contentService.state().likert5);

  likertCaption(index: number, label: string): string {
    const labels = this.likertLabels();
    const lastIndex = labels.length - 1;
    if (index === 0 || index === lastIndex) {
      return label;
    }
    return '';
  }

  canContinue = computed(() => {
    if (this.phase() === 'chooseOption') {
      const total = this.totalFollowUpsForSelected();
      return total > 0 && this.answeredFollowUps() === total;
    }
    
    // In followUps phase, check if current followup is answered using namespaced key
    const tlqId = this.selectedOption();
    if (!tlqId) return false;
    
    const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
    const answers = this.sessionStore.answers();
    return answers[key] !== undefined;
  });

  private returnTo: string | null = null;

  ngOnInit(): void {
    // NOTE: Session hydration now happens in SessionStore constructor (boot-time).
    // This ensures /review and /result also see persisted answers.

    this.contentService.loadContent();
    const config = this.router.config;
    if (!config.some(route => route.path === 'q/:id/followups/:tlqId')) {
      this.router.resetConfig([
        ...config,
        {
          path: 'q/:id/followups/:tlqId',
          component: QuestionComponent,
          canMatch: [followupsGuard]
        }
      ]);
    }
    this.route.params.subscribe(params => {
      this.currentId = params['id'];
      const tlq = params['tlqId'] ?? null;

      // Check if route :id is valid (exists in restored sequence)
      const seq = this.sessionStore.sequence();
      const isValidRouteId = seq.includes(this.currentId);

      if (!isValidRouteId) {
        // Mark as auto-selected to prevent effect from firing during redirect
        this.categoryAutoSelected = true;
        
        // Invalid route id: recover by navigating to resume point or /select
        if (seq.length > 0) {
          const resumeIndex = this.sessionStore.getResumeIndex();
          const nextId = seq[Math.min(resumeIndex, seq.length - 1)];
          this.router.navigate(['/q', nextId]);
          return; // Short-circuit: don't continue initializing with invalid state
        } else {
          // No restored session: fall back to category selection
          this.router.navigate(['/select']);
          return; // Short-circuit
        }
      }

      if (tlq) {
        this.phase.set('followUps');
        this.selectedOption.set(tlq);
        
        // Check resume pointer for exact followupIndex restoration
        const ptr = this.sessionStore.getResumePointer();
        if (ptr && ptr.categoryId === this.currentId && ptr.phase === 'challenges' && ptr.tlqId === tlq && ptr.followupIndex !== null) {
          this.currentFollowUpIndex.set(ptr.followupIndex);
        } else {
          this.currentFollowUpIndex.set(this.findFirstUnansweredIndex(tlq));
        }
      } else {
        // On base route /q/:id - check resume pointer for redirect to challenges
        const ptr = this.sessionStore.getResumePointer();
        if (ptr && ptr.categoryId === this.currentId && ptr.phase === 'challenges' && ptr.tlqId) {
          // Resume pointer says we should be in challenges phase - redirect
          this.router.navigate(['/q', this.currentId, 'followups', ptr.tlqId]);
          return; // Short-circuit: let navigation handler re-initialize
        }
        
        // TEST D: returning to positions sets phase=positions and clears tlqId/followupIndex
        // Only update resume pointer if we were previously in followUps phase (actual transition)
        // This prevents overwriting the resume pointer on cold load
        if (this.phase() === 'followUps') {
          this.sessionStore.setResumePointer({
            categoryId: this.currentId,
            phase: 'positions',
            tlqId: null,
            followupIndex: null
          });
        }
        this.phase.set('chooseOption');
        this.selectedOption.set(null);
        this.currentFollowUpIndex.set(0);
      }
      this.autoSelectCategoryIfNeeded();
    });
    
    this.route.queryParams.subscribe(queryParams => {
      this.returnTo = queryParams['returnTo'] || null;
      this.showDebug.set(queryParams['debug'] === '1');
      
      // Check debugQuestion from query param OR sessionStorage (dev mode only)
      if (isDevMode()) {
        const fromQuery = queryParams['debugQuestion'] === '1';
        const fromSession = sessionStorage.getItem('debugQuestion') === '1';
        if (fromQuery) {
          this.debugQuestionEnabled.set(true);
          this.debugSource.set('query');
        } else if (fromSession) {
          this.debugQuestionEnabled.set(true);
          this.debugSource.set('session');
        } else {
          this.debugQuestionEnabled.set(false);
          this.debugSource.set('off');
        }
      } else {
        // Production: never enable debug
        this.debugQuestionEnabled.set(false);
        this.debugSource.set('off');
      }
    });
  }

  private categoryAutoSelected = false;

  // Effect: when content loads and we have a route slug, auto-select that category
  // ONLY if no session was restored (prevents clobbering multi-category selection)
  private contentLoadedEffect = effect(() => {
    const categories = this.contentService.state().categories;
    const currentId = this.currentId;
    const selectedIds = this.sessionStore.selectedIds();
    const seq = this.sessionStore.sequence();

    // Guard: only run once when content first becomes available
    if (categories.length === 0 || !currentId || this.categoryAutoSelected) {
      return;
    }

    const category = categories.find(c => c.id === currentId);
    // Only auto-select if BOTH selectedIds AND sequence are empty
    // (meaning no restored session exists at all)
    if (category && selectedIds.length === 0 && seq.length === 0) {
      this.categoryAutoSelected = true;
      this.sessionStore.selectCategories([currentId]);
    }
  });

  private autoSelectCategoryIfNeeded(): void {
    // Now handled reactively by contentLoadedEffect
    // This method is kept for API compatibility but the effect does the work
  }

  getAnswer(followUpId: string): number | undefined {
    return this.sessionStore.answers()[followUpId];
  }

  /**
   * Generate a distinct answer key for followups to avoid collision with TLQ ids.
   * Format: fu:{categoryId}:{tlqId}:{followupIndex}
   */
  private followUpAnswerKey(categoryId: string, tlqId: string, followupIndex: number): string {
    return `fu:${categoryId}:${tlqId}:${followupIndex}`;
  }

  /**
   * Get the answer for a followup using the namespaced key.
   * Used in followups phase to avoid reading TLQ answer.
   */
  getFollowUpAnswer(): number | undefined {
    const tlqId = this.selectedOption();
    if (!tlqId) return undefined;
    const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
    return this.sessionStore.answers()[key];
  }

  onOptionChange(optionId: string): void {
    const previous = this.selectedOption();
    const wasInFollowUps = this.phase() === 'followUps';

    if (previous === optionId) {
      return;
    }

    this.selectedOption.set(optionId);
    try {
      sessionStorage.setItem(`rawls-option-${this.currentId}`, optionId);
    } catch {
      // ignore storage errors
    }

    if (previous !== null) {
      this.sessionStore.clearCategory(this.currentId);
      this.currentFollowUpIndex.set(0);
      if (wasInFollowUps) {
        this.phase.set('followUps');
      }
    }
  }

  onTopLevelAnswerChange(questionId: string, value: number): void {
    this.sessionStore.recordAnswer(questionId, value);
  }

  onAnswerChange(followUpId: string, value: number): void {
    const category = this.currentCategory();
    const followUp = category?.followUps.find(f => f.id === followUpId);
    
    // Apply reverse scoring if followUp has reverse: true
    const normalizedValue = followUp?.reverse ? (6 - value) : value;
    
    // Use namespaced key to avoid collision with TLQ id
    const tlqId = this.selectedOption();
    if (!tlqId) return;
    const key = this.followUpAnswerKey(this.currentId, tlqId, this.currentFollowUpIndex());
    this.sessionStore.recordAnswer(key, normalizedValue);
  }

  onSkip(): void {
    if (this.phase() === 'followUps') {
      const current = this.currentFollowUps()[0];
      if (current) {
        this.sessionStore.skipQuestion(current.id);
      }
      this.advanceFollowUps();
      return;
    }
    this.sessionStore.skipQuestion(this.currentId);
    this.navigateAfterAction();
  }

  onContinue(): void {
    const debugState = {
      url: this.router.url,
      currentId: this.currentId,
      phase: this.phase(),
      selectedOption: this.selectedOption(),
      currentFollowUpIndex: this.currentFollowUpIndex(),
      totalFollowUpsForSelected: this.totalFollowUpsForSelected(),
      answeredFollowUps: this.answeredFollowUps(),
      canContinue: this.canContinue(),
      options: this.options()
    };

    if (this.debugQuestionEnabled()) {
      console.log('CONTINUE_CLICK', debugState);
    }

    if (this.phase() === 'chooseOption') {
      if (this.debugQuestionEnabled()) {
        console.log('CONTINUE_BRANCH: chooseOption -> followups');
      }
      const first = this.options()[0];
      if (!first) {
        if (this.debugQuestionEnabled()) {
          console.log('CONTINUE_BRANCH: no options, navigateAfterAction');
        }
        this.navigateAfterAction();
        return;
      }
      // TEST A: entering followups sets resume pointer to challenges
      this.sessionStore.setResumePointer({
        categoryId: this.currentId,
        phase: 'challenges',
        tlqId: first,
        followupIndex: 0
      });
      const navTarget = ['/q', this.currentId, 'followups', first];
      if (this.debugQuestionEnabled()) {
        console.log('NAVIGATE_TO', navTarget);
      }
      this.router.navigate(navTarget)?.then(
        result => {
          if (this.debugQuestionEnabled()) {
            console.log('NAVIGATE_RESULT', navTarget, 'result=' + result);
          }
        },
        err => {
          if (this.debugQuestionEnabled()) {
            console.log('NAVIGATE_ERROR', navTarget, err);
          }
        }
      );
      return;
    } else {
      if (this.debugQuestionEnabled()) {
        console.log('CONTINUE_BRANCH: followups -> advanceFollowUps');
      }
      this.advanceFollowUps();
    }
  }

  private advanceFollowUps(): void {
    const category = this.currentCategory();
    const optionId = this.selectedOption();
    if (!category || !optionId) {
      if (this.returnTo === 'review') {
        this.router.navigate(['/review']);
      } else {
        this.router.navigate(['/q', this.currentId]);
      }
      return;
    }

    const allFollowUps = category.followUps.filter(f => f.id === optionId);
    const nextIndex = this.currentFollowUpIndex() + 1;

    if (nextIndex < allFollowUps.length) {
      // TEST B: advancing followups updates followupIndex
      this.sessionStore.setResumePointer({
        categoryId: this.currentId,
        phase: 'challenges',
        tlqId: optionId,
        followupIndex: nextIndex
      });
      this.currentFollowUpIndex.set(nextIndex);
      return;
    }

    const tlqIds = this.options();
    const currentIdx = tlqIds.indexOf(optionId);
    const nextTlq = currentIdx >= 0 ? tlqIds[currentIdx + 1] : null;

    if (nextTlq) {
      // TEST C: moving to next TLQ resets followupIndex and updates tlqId
      this.sessionStore.setResumePointer({
        categoryId: this.currentId,
        phase: 'challenges',
        tlqId: nextTlq,
        followupIndex: 0
      });
      this.router.navigate(['/q', this.currentId, 'followups', nextTlq]);
    } else if (this.returnTo === 'review') {
      // Ideal exhausted while in review flow: mark complete before returning
      this.sessionStore.markCategoryComplete(this.currentId);
      this.router.navigate(['/review']);
    } else {
      // Ideal exhausted: mark complete before navigating to next category or /review
      this.sessionStore.markCategoryComplete(this.currentId);
      this.navigateNext();
    }
  }

  private navigateAfterAction(): void {
    if (this.returnTo === 'review') {
      this.router.navigate(['/review']);
    } else {
      this.navigateNext();
    }
  }

  debugQuickFill(): void {
    if (!this.showDebug()) {
      return;
    }

    if (this.phase() === 'chooseOption') {
      this.options().forEach(id => this.onTopLevelAnswerChange(id, 3));
      this.onContinue();
      return;
    }

    const current = this.currentFollowUps()[0];
    if (current) {
      this.onAnswerChange(current.id, 3);
      this.onContinue();
    }
  }

  autoSelectAndContinue(): void {
    this.contentService.loadContent();
    this.sessionStore.selectCategories(['A', 'B']);
    // Give a moment for the signals to update, then reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  private navigateNext(): void {
    const sequence = this.sessionStore.sequence();
    const currentIndex = sequence.indexOf(this.currentId);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < sequence.length) {
      // TEST E: navigating to next category sets resume pointer for new category
      this.sessionStore.setResumePointer({
        categoryId: sequence[nextIndex],
        phase: 'positions',
        tlqId: null,
        followupIndex: null
      });
      this.router.navigate(['/q', sequence[nextIndex]]);
    } else {
      this.router.navigate(['/review']);
    }
  }

  private restoreOptionSelection(categoryId: string): string | null {
    const category = this.contentService.state().categories.find(c => c.id === categoryId);
    if (!category) return null;

    const key = `rawls-option-${categoryId}`;
    const answers = this.sessionStore.answers();
    let option: string | null = null;

    try {
      option = sessionStorage.getItem(key);
    } catch {
      option = null;
    }

    if (!option) {
      // Find any answered followUp ID for this category
      const answeredId = Object.keys(answers).find(id => id.startsWith(`${categoryId}-`));
      option = answeredId ?? null;
    }

    if (option && category.followUps.some(f => f.id === option)) {
      try {
        sessionStorage.setItem(key, option);
      } catch {
        // ignore storage errors
      }
      return option;
    }

    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    return null;
  }

  private findFirstUnansweredIndex(optionId: string): number {
    const category = this.currentCategory();
    if (!category) return 0;
    const followUps = category.followUps.filter(f => f.id === optionId);
    if (!followUps.length) return 0;
    const answers = this.sessionStore.answers();
    const idx = followUps.findIndex(f => answers[f.id] === undefined);
    return idx === -1 ? followUps.length - 1 : idx;
  }
}