import { Component, inject, computed, isDevMode, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { TERMINOLOGY } from '../shared/terminology';
import { Category, FollowUp, Challenge } from '../core/content/types';

function requiredPositionsForCategory(category: Category, limit = 4): FollowUp[] {
  return (category.followUps ?? [])
    .filter(followUp => followUp.hidden !== true)
    .slice(0, limit);
}

function shouldIncludeChallenge(
  challenge: Challenge,
  parentPositionId: string,
  positionAnswers: Record<string, number>
): boolean {
  // No triggerRule = always include
  if (!challenge.triggerRule) {
    return true;
  }

  const parentAnswer = positionAnswers[parentPositionId];

  // No answer yet = don't include (user hasn't reached challenges phase yet)
  if (parentAnswer === undefined) {
    return false;
  }

  const { parentAnswerMin, parentAnswerMax } = challenge.triggerRule;

  // Check min constraint
  if (parentAnswerMin !== undefined && parentAnswer < parentAnswerMin) {
    return false;
  }

  // Check max constraint
  if (parentAnswerMax !== undefined && parentAnswer > parentAnswerMax) {
    return false;
  }

  return true;
}

function requiredChallengeIdsForCategory(
  category: Category,
  positionAnswers: Record<string, number>,
  limit = 4
): string[] {
  return requiredPositionsForCategory(category, limit)
    .flatMap(followUp => {
      const challenges = ((followUp.challenges ?? []) as Array<Challenge & { hidden?: boolean }>)
        .filter(challenge => challenge.hidden !== true)
        .filter(challenge => shouldIncludeChallenge(challenge, followUp.id, positionAnswers));
      return challenges.map(challenge => challenge.id);
    });
}

@Component({
  selector: 'app-review',
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <header class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Review Your Responses</h1>
        <p class="text-lg text-gray-600 mb-2">
          Make changes if needed, then submit to see your results.
        </p>
        <p class="text-sm text-gray-500">
          You can edit any {{ TERMINOLOGY.IDEAL_SINGULAR.toLowerCase() }} by clicking the Edit button.
        </p>
      </header>

      <div class="mb-4 flex items-start justify-between gap-3 text-sm text-gray-700">
        <span data-testid="veil-micro">{{ TERMINOLOGY.VEIL_MICRO }}</span>
        <button
          type="button"
          data-testid="veil-toggle"
          class="text-blue-700 font-semibold hover:underline"
          (click)="onToggleVeilBox()">
          {{ TERMINOLOGY.VEIL_TOGGLE }}
        </button>
      </div>

      @if (shouldShowVeilBox()) {
        <div
          class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-gray-800"
          data-testid="veil-box">
          <p class="mb-3">{{ TERMINOLOGY.VEIL_BODY }}</p>
          <button
            type="button"
            data-testid="veil-ack"
            class="text-sm font-semibold text-blue-700 hover:underline"
            (click)="onAcknowledgeVeil()">
            {{ TERMINOLOGY.VEIL_ACK }}
          </button>
        </div>
      }

      <div class="space-y-4 mb-8">
        @for (item of reviewItems(); track item.id) {
          <div
            [attr.data-testid]="'review-category-card-' + item.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{{ item.name }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ item.description }}</p>
              <div class="flex items-center gap-3 text-sm">
                <span
                  [attr.data-testid]="'review-status-' + item.id"
                  class="inline-block px-3 py-1 font-medium rounded-full"
                  [class]="getStatusClass(item.status)">
                  {{ item.status }}
                </span>
                <span
                  [attr.data-testid]="'review-progress-' + item.id"
                  class="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {{ TERMINOLOGY.POSITION_PLURAL }} {{ item.tlqAnswered }}/{{ item.tlqTotal }},
                  {{ item.fuTotal === 0 ? 'No challenges' : TERMINOLOGY.CHALLENGE_PLURAL + ' ' + item.fuAnswered + '/' + item.fuTotal }}
                </span>
              </div>
            </div>
            <button
              [attr.data-testid]="'review-edit-' + item.id"
              (click)="onEdit(item.id)"
              class="ml-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
              Edit
            </button>
          </div>
        }
      </div>

      <div class="flex justify-center gap-4">
        <button
          data-testid="review-resume"
          [disabled]="!resumeTarget()"
          (click)="onResume()"
          class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700">
          Resume
        </button>
        <button
          data-testid="review-results"
          [disabled]="!allComplete()"
          (click)="onResults()"
          class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700">
          See Results
        </button>
      </div>
    </div>

    <!-- Debug Overlay (query param gated) -->
    @if (showDebugOverlay()) {
      <div class="fixed top-2 right-2 max-w-md max-h-[90vh] overflow-auto bg-yellow-100 border-2 border-yellow-500 rounded-lg p-3 text-xs font-mono shadow-lg z-50">
        <div class="font-bold text-red-600 mb-2">DEBUG_MARKER: BUG-RAWLS-006_DEBUG_OVERLAY_001</div>
        <div class="mb-2"><strong>URL:</strong> {{ debugInfo().url }}</div>
        <div class="mb-2"><strong>allComplete():</strong> {{ allComplete() }}</div>
        <div class="mb-2"><strong>Answer Keys ({{ debugInfo().answerKeyCount }}):</strong><br/>{{ debugInfo().answerKeysPreview }}</div>
        <hr class="my-2 border-yellow-400"/>
        <div class="font-bold mb-1">{{ TERMINOLOGY.IDEAL_PLURAL }}:</div>
        @for (cat of debugInfo().categories; track cat.categoryId) {
          <div class="mb-2 pl-2 border-l-2 border-yellow-400">
            <div><strong>{{ cat.categoryId }}</strong></div>
            <div>tlqIds: [{{ cat.tlqIds.join(', ') }}]</div>
            <div>answered: {{ cat.answeredCount }}/{{ cat.totalCount }}</div>
            <div>missing (first 3): {{ cat.missingTlqIds.slice(0, 3).join(', ') || 'none' }}</div>
          </div>
        }
        <hr class="my-2 border-yellow-400"/>
        <div class="font-bold mb-1">Gate Reasons (See Results disabled):</div>
        <div>missingTlqCount: {{ debugInfo().missingTlqCount }}</div>
        <div>itemsNotComplete: {{ debugInfo().itemsNotComplete }}</div>
        <div>noItems: {{ debugInfo().noItems }}</div>
      </div>
    }
  `
})
export class ReviewComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  private sessionStore = inject(SessionStore);

  // Expose terminology dictionary to template
  readonly TERMINOLOGY = TERMINOLOGY;

  // Query params as signal for debug overlay
  private queryParams = toSignal(this.route.queryParams, { initialValue: {} });
  protected veilBoxOpen = signal(false);
  private veilBoxOpenInitialized = signal(false);
  protected shouldShowVeilBox = computed(() => this.veilBoxOpen());

  showDebugOverlay = computed(() => {
    if (!isDevMode()) return false;
    const params = this.queryParams() as Record<string, string>;
    return params['debugReview'] === '1';
  });

  debugInfo = computed(() => {
    const state = this.contentService.state();
    const answers = this.sessionStore.answers();
    const answerKeys = Object.keys(answers);
    const items = this.reviewItems();

    const categories = items.map(item => {
      const category = state.categories.find(c => c.id === item.id);
      const tlqIds = category ? category.followUps.map(f => f.id) : [];
      const answeredTlqIds = tlqIds.filter(id => answers[id] !== undefined);
      const missingTlqIds = tlqIds.filter(id => answers[id] === undefined);
      return {
        categoryId: item.id,
        tlqIds,
        answeredCount: answeredTlqIds.length,
        totalCount: tlqIds.length,
        missingTlqIds
      };
    });

    const missingTlqCount = categories.reduce((sum, cat) => sum + cat.missingTlqIds.length, 0);
    const itemsNotComplete = items.filter(i => i.status !== 'Complete').length;

    return {
      url: window.location.pathname + window.location.search,
      answerKeyCount: answerKeys.length,
      answerKeysPreview: answerKeys.slice(0, 25).join(', ') + (answerKeys.length > 25 ? '...' : ''),
      categories,
      missingTlqCount,
      itemsNotComplete,
      noItems: items.length === 0
    };
  });

  reviewItems = computed(() => {
    const state = this.contentService.state();
    const answers = this.sessionStore.answers();
    const challengeAnswers = this.sessionStore.challengeAnswers();
    const items = this.sessionStore.selectedIds()
      .map(id => {
        const category = state.categories.find(c => c.id === id);
        if (!category) return null;
        const requiredPositions = requiredPositionsForCategory(category);
        const requiredPositionIds = requiredPositions.map(f => f.id);
        const tlqTotal = requiredPositionIds.length;
        const tlqAnswered = requiredPositionIds.filter(t => answers[t] !== undefined).length;
        const requiredChallengeIds = requiredChallengeIdsForCategory(category, answers);
        const fuTotal = requiredChallengeIds.length;
        const fuAnswered = requiredChallengeIds.filter(challengeId => challengeAnswers[challengeId] !== undefined).length;
        const nextTlq = requiredPositionIds.find(t => answers[t] === undefined) || null;
        const status =
          tlqAnswered === 0 && fuAnswered === 0
            ? 'Not Started'
            : tlqAnswered === tlqTotal && fuAnswered === fuTotal
            ? 'Complete'
            : 'In Progress';
        return { id: category.id, name: category.name, description: category.description, status, tlqAnswered, tlqTotal, fuAnswered, fuTotal, nextTlq };
      })
      .filter(Boolean) as Array<{
        id: string;
        name: string;
        description: string;
        status: 'Not Started' | 'In Progress' | 'Complete';
        tlqAnswered: number;
        tlqTotal: number;
        fuAnswered: number;
        fuTotal: number;
        nextTlq: string | null;
      }>;
    return items.sort((a, b) => a.id.localeCompare(b.id));
  });

  allComplete = computed(() => {
    const items = this.reviewItems();
    return items.length > 0 && items.every(item => item.status === 'Complete');
  });

  resumeTarget = computed(() => {
    const first = this.reviewItems().find(item => item.status !== 'Complete');
    if (!first) return null;
    if (first.tlqAnswered < first.tlqTotal) {
      return { path: ['/q', first.id], query: { returnTo: 'review' } };
    }
    if (first.nextTlq) {
      return { path: ['/q', first.id, 'followups', first.nextTlq], query: { returnTo: 'review' } };
    }
    return { path: ['/q', first.id], query: { returnTo: 'review' } };
  });

  constructor() {
    // Reactively initialize veil box based on acknowledgment state
    // But only set it once to avoid fighting with manual toggles
    effect(() => {
      if (!this.veilBoxOpenInitialized()) {
        const acknowledged = this.sessionStore.veilAcknowledged();
        this.veilBoxOpen.set(!acknowledged);
        this.veilBoxOpenInitialized.set(true);
      }
    }, { allowSignalWrites: true });
    
    // React to acknowledgment changes: when user acknowledges, close the box
    effect(() => {
      const acknowledged = this.sessionStore.veilAcknowledged();
      if (acknowledged && this.veilBoxOpenInitialized()) {
        this.veilBoxOpen.set(false);
      }
    }, { allowSignalWrites: true });
    
    this.contentService.loadContent();
    
    // Debug tracing (gated by query param)
    if (this.showDebugOverlay()) {
      const answers = this.sessionStore.answers();
      const selectedIds = this.sessionStore.selectedIds();
      const answerKeys = Object.keys(answers);
      console.log(`DEBUG_ANSWERS_READ: { source: "ReviewComponent.constructor", answerKeyCount: ${answerKeys.length}, selectedIds: ${JSON.stringify(selectedIds)}, firstKeys: ${JSON.stringify(answerKeys.slice(0, 10))} }`);
    }
  }

  onEdit(categoryId: string): void {
    this.router.navigate(['/q', categoryId], { queryParams: { returnTo: 'review' } });
  }

  onResume(): void {
    const target = this.resumeTarget();
    if (!target) return;
    this.router.navigate(target.path, { queryParams: target.query });
  }

  onResults(): void {
    if (this.allComplete()) {
      this.router.navigate(['/result']);
    }
  }

  getStatusClass(status: string): string {
    if (status === 'Complete') return 'bg-green-100 text-green-800';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  }

  onToggleVeilBox(): void {
    this.veilBoxOpen.update(open => !open);
  }

  onAcknowledgeVeil(): void {
    this.sessionStore.acknowledgeVeil();
    this.veilBoxOpen.set(false);
  }
}