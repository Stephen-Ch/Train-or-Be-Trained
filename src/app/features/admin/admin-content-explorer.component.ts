import { Component, OnInit, signal, computed, effect, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../../core/content/content.service';
import { Category, FollowUp, ContentData } from '../../core/content/types';
import { validateContentIntegrity, ValidationError } from '../../core/content/content-integrity-validator';
import { TERMINOLOGY } from '../../shared/terminology';

interface IdealNode {
  id: string;
  name: string;
  description: string;
  quote: string;
  positions: PositionNode[];
  expanded: boolean;
  visible: boolean;
  editing: boolean;
  editName: string;
  editDescription: string;
}

interface PositionNode {
  id: string;
  text: string;
  challenges: ChallengeNode[];
  expanded: boolean;
  visible: boolean;
  editing: boolean;
  editText: string;
  hidden: boolean;
  baseHidden: boolean;
}

interface ChallengeNode {
  id: string;
  title: string;
  body: string;
  triggerRule?: {
    parentAnswerMin?: number;
    parentAnswerMax?: number;
    tags?: string[];
  };
  visible: boolean;
  editing: boolean;
  editTitle: string;
  editBody: string;
  editTriggerParentAnswerMin?: number;
  editTriggerParentAnswerMax?: number;
  editTriggerTags?: string;
}

interface DraftEntry {
  name?: string;
  description?: string;
  text?: string;
  triggerRule?: {
    parentAnswerMin?: number;
    parentAnswerMax?: number;
    tags?: string[];
  };
}

interface DraftStoragePayload {
  changes: Record<string, DraftEntry>;
  orderOverrides: Record<string, string[]>;
  hiddenById: Record<string, boolean>;
  categoryOrderOverride?: string[];
}

type FieldPatchOperation = {
  id: string;
  kind: 'category' | 'position' | 'challenge';
  field: 'name' | 'description' | 'statement' | 'title' | 'body' | 'triggerRule';
  value: string | { parentAnswerMin?: number; parentAnswerMax?: number; tags?: string[] };
};

type ReorderPatchOperation =
  | {
      op: 'reorder';
      kind: 'position';
      categoryId: string;
      orderedIds: string[];
    }
  | {
      op: 'reorder';
      kind: 'category';
      orderedIds: string[];
    };

type SetHiddenPatchOperation = {
  op: 'setHidden';
  kind: 'position';
  id: string;
  hidden: boolean;
};

type PatchOperation = FieldPatchOperation | ReorderPatchOperation | SetHiddenPatchOperation;

@Component({
  selector: 'app-admin-content-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Admin Content Explorer</h1>
      
      <!-- Production Stats Summary -->
      @if (!loading() && !error()) {
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" data-testid="production-stats">
          <h3 class="font-semibold text-blue-900 mb-2">Production Content</h3>
          <div class="text-sm text-blue-800 space-y-1">
            <div>{{ TERMINOLOGY.IDEAL_PLURAL }}: {{ productionStats().categoryCount }}</div>
            <div>{{ TERMINOLOGY.POSITION_PLURAL }}: {{ productionStats().positionCount }}</div>
            <div>{{ TERMINOLOGY.CHALLENGE_PLURAL }}: {{ productionStats().challengeCount }}</div>
          </div>
          @if (debugIds()) {
            <div class="mt-3 pt-3 border-t border-blue-300">
              <h4 class="text-xs font-semibold text-blue-700 mb-1">Debug Info</h4>
              <div class="text-xs text-blue-600">Draft changes: {{ draftOverlayCount() }}</div>
            </div>
          }
        </div>
      }
      
      <!-- Admin Controls -->
      @if (!loading() && !error()) {
        <div class="mb-6 flex gap-3">
          <button
            (click)="exportPatch()"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            data-testid="export-patch-button"
          >
            {{ TERMINOLOGY.ADMIN_EXPORT_PATCH }}
          </button>
          <button
            (click)="resetDraft()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            data-testid="reset-draft-button"
          >
            {{ TERMINOLOGY.ADMIN_RESET_DRAFT }}
          </button>
        </div>
      }
      
      <!-- Search Box -->
      <div class="mb-6">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange()"
          placeholder="Search {{ TERMINOLOGY.IDEAL_PLURAL.toLowerCase() }}, {{ TERMINOLOGY.POSITION_PLURAL.toLowerCase() }}, or {{ TERMINOLOGY.CHALLENGE_PLURAL.toLowerCase() }}..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="search-input"
        />
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="text-center py-8 text-gray-500" data-testid="loading-state">
          Loading content...
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="text-center py-8 text-red-600" data-testid="error-state">
          Failed to load content: {{ error() }}
        </div>
      }

      <!-- Validation Errors -->
      @if (validationErrors().length > 0) {
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" data-testid="validation-errors">
          <h3 class="font-semibold text-red-800 mb-2">Validation Errors</h3>
          <ul class="list-disc list-inside text-sm text-red-700">
            @for (error of validationErrors().slice(0, 5); track error.field) {
              <li>{{ error.field }}: {{ error.message }}</li>
            }
          </ul>
          @if (validationErrors().length > 5) {
            <p class="text-sm text-red-600 mt-2">+ {{ validationErrors().length - 5 }} more errors</p>
          }
        </div>
      }

      <!-- Export Success -->
      @if (exportSuccess()) {
        <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg" data-testid="export-success">
          <p class="text-sm text-green-800">Exported ✓</p>
        </div>
      }

      <!-- Tree View -->
      @if (!loading() && !error()) {
        <div class="space-y-4">
          @for (ideal of visibleIdeals(); track ideal.id) {
            <div class="border border-gray-200 rounded-lg" [attr.data-testid]="'ideal-' + ideal.id">
              <!-- Ideal Header (Read Mode) -->
              @if (!ideal.editing) {
                <div class="px-4 py-3 bg-gray-50">
                  <div class="flex items-start justify-between">
                    <button
                      (click)="toggleIdeal(ideal)"
                      class="flex-1 text-left hover:bg-gray-100 -mx-2 px-2 py-1 rounded"
                      [attr.data-testid]="'ideal-toggle-' + ideal.id"
                    >
                      <h2 class="text-xl font-semibold">
                        {{ ideal.name }}
                        @if (debugIds()) {
                          <span class="text-sm text-gray-500 font-normal ml-2" data-testid="debug-ideal-id">({{ ideal.id }})</span>
                        }
                      </h2>
                      <p class="text-sm text-gray-600 mt-1">{{ ideal.description }}</p>
                      <span class="text-gray-500 text-sm mt-2 inline-block">{{ ideal.expanded ? '▼' : '▶' }} {{ ideal.positions.length }} {{ TERMINOLOGY.POSITION_PLURAL.toLowerCase() }}</span>
                    </button>
                    @if (isDevMode()) {
                      <div class="flex gap-1 ml-2">
                        <button
                          (click)="moveCategory(ideal, 'up')"
                          [disabled]="!canMoveCategoryUp(ideal)"
                          class="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          [attr.aria-label]="TERMINOLOGY.ADMIN_MOVE_UP"
                          [attr.data-testid]="'move-category-up-' + ideal.id"
                        >
                          ↑
                        </button>
                        <button
                          (click)="moveCategory(ideal, 'down')"
                          [disabled]="!canMoveCategoryDown(ideal)"
                          class="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          [attr.aria-label]="TERMINOLOGY.ADMIN_MOVE_DOWN"
                          [attr.data-testid]="'move-category-down-' + ideal.id"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        (click)="startEdit(ideal)"
                        class="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        [attr.data-testid]="'edit-ideal-' + ideal.id"
                      >
                        Edit
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Ideal Header (Edit Mode) -->
              @if (ideal.editing) {
                <div class="px-4 py-3 bg-yellow-50" [attr.data-testid]="'ideal-edit-mode-' + ideal.id">
                  <h3 class="text-sm font-semibold text-gray-700 mb-2">Editing: {{ ideal.id }}</h3>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        [(ngModel)]="ideal.editName"
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        [attr.data-testid]="'edit-name-' + ideal.id"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        [(ngModel)]="ideal.editDescription"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        [attr.data-testid]="'edit-description-' + ideal.id"
                      ></textarea>
                    </div>
                    <div class="flex gap-2">
                      <button
                        (click)="saveIdeal(ideal)"
                        [disabled]="!hasChanges(ideal)"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        [attr.data-testid]="'save-ideal-' + ideal.id"
                      >
                        {{ TERMINOLOGY.ADMIN_SAVE_AND_EXPORT }}
                      </button>
                      <button
                        (click)="cancelEdit(ideal)"
                        class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        [attr.data-testid]="'cancel-edit-' + ideal.id"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              }

              <!-- Positions (when expanded) -->
              @if (ideal.expanded) {
                <div class="px-4 py-3 space-y-3">
                  @for (position of ideal.positions; track position.id; let posIdx = $index) {
                    @if (position.visible) {
                      <div class="border-l-4 border-blue-300 pl-4" [attr.data-testid]="'position-' + position.id">
                        <!-- Position Header (Read Mode) -->
                        @if (!position.editing) {
                          <div class="flex items-start justify-between gap-2 py-2">
                            <button
                              (click)="togglePosition(position)"
                              class="flex-1 text-left hover:bg-gray-50"
                              [attr.data-testid]="'position-toggle-' + position.id"
                            >
                              <div class="flex items-center justify-between">
                                    <div class="flex-1" [class.opacity-60]="position.hidden">
                                      <h3 class="font-medium text-gray-900 flex items-center gap-2">
                                    {{ TERMINOLOGY.POSITION_SINGULAR }} {{ posIdx + 1 }}
                                    @if (debugIds()) {
                                      <span class="text-xs text-gray-500 font-normal ml-2" data-testid="debug-position-id">({{ position.id }})</span>
                                    }
                                        @if (position.hidden) {
                                          <span
                                            class="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 rounded px-2 py-0.5"
                                            data-testid="position-hidden-tag"
                                          >
                                            {{ TERMINOLOGY.ADMIN_HIDDEN_TAG }}
                                          </span>
                                        }
                                  </h3>
                                  <p class="text-sm text-gray-600 mt-1">{{ position.text }}</p>
                                </div>
                                <span class="ml-4 text-gray-500">{{ position.expanded ? '▼' : '▶' }}</span>
                              </div>
                            </button>
                            @if (isDevMode()) {
                              <div class="flex flex-col items-stretch gap-1">
                                <div class="flex gap-1">
                                  <button
                                    type="button"
                                    (click)="movePosition(ideal, position, 'up')"
                                    [disabled]="!canMovePositionUp(ideal, position)"
                                    class="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    [attr.aria-label]="TERMINOLOGY.ADMIN_MOVE_UP"
                                    [attr.data-testid]="'move-position-up-' + position.id"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    (click)="movePosition(ideal, position, 'down')"
                                    [disabled]="!canMovePositionDown(ideal, position)"
                                    class="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    [attr.aria-label]="TERMINOLOGY.ADMIN_MOVE_DOWN"
                                    [attr.data-testid]="'move-position-down-' + position.id"
                                  >
                                    ↓
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  (click)="togglePositionHidden(position)"
                                  class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                  [attr.data-testid]="(position.hidden ? 'unhide-position-' : 'hide-position-') + position.id"
                                >
                                  {{ position.hidden ? TERMINOLOGY.ADMIN_UNHIDE : TERMINOLOGY.ADMIN_HIDE }}
                                </button>
                                <button
                                  (click)="startEditPosition(position)"
                                  class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                  [attr.data-testid]="'edit-position-' + position.id"
                                >
                                  Edit
                                </button>
                              </div>
                            }
                          </div>
                        }

                        <!-- Position Header (Edit Mode) -->
                        @if (position.editing) {
                          <div class="py-2 space-y-2">
                            <h3 class="font-medium text-gray-900">{{ TERMINOLOGY.POSITION_SINGULAR }} {{ posIdx + 1 }}</h3>
                            <textarea
                              [(ngModel)]="position.editText"
                              rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              [attr.data-testid]="'edit-position-text-' + position.id"
                            ></textarea>
                            <div class="flex space-x-2">
                              <button
                                (click)="savePosition(ideal, position)"
                                [disabled]="!hasPositionChanges(position)"
                                [class.opacity-50]="!hasPositionChanges(position)"
                                [class.cursor-not-allowed]="!hasPositionChanges(position)"
                                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                [attr.data-testid]="'save-position-' + position.id"
                              >
                                {{ TERMINOLOGY.ADMIN_SAVE_AND_EXPORT }}
                              </button>
                              <button
                                (click)="cancelEditPosition(position)"
                                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                [attr.data-testid]="'cancel-edit-position-' + position.id"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        }

                        <!-- Challenges (when expanded) -->
                        @if (position.expanded) {
                          <div class="ml-4 mt-2 space-y-2">
                            @if (position.challenges.length > 0) {
                              <div class="text-xs text-gray-500 font-medium mb-2" [attr.data-testid]="'position-challenge-count-' + position.id">
                                Challenges ({{ position.challenges.length }})
                              </div>
                            }
                            @for (challenge of position.challenges; track challenge.id; let chalIdx = $index) {
                              @if (challenge.visible) {
                                <div class="border-l-4 border-green-300 pl-4 py-2" [attr.data-testid]="'challenge-' + challenge.id">
                                  <!-- Challenge (Read Mode) -->
                                  @if (!challenge.editing) {
                                    <div class="flex items-start justify-between">
                                      <div class="flex-1">
                                        <h4 class="font-medium text-gray-700 text-sm">{{ challenge.title }}</h4>
                                        <p class="text-sm text-gray-600 mt-1">{{ challenge.body }}</p>
                                        @if (challenge.triggerRule && (challenge.triggerRule.parentAnswerMin || challenge.triggerRule.parentAnswerMax || (challenge.triggerRule.tags && challenge.triggerRule.tags.length > 0))) {
                                          <div class="text-xs text-gray-500 mt-2 space-y-1">
                                            @if (challenge.triggerRule.parentAnswerMin || challenge.triggerRule.parentAnswerMax) {
                                              <div [attr.data-testid]="'challenge-trigger-summary-' + challenge.id">
                                                @if (challenge.triggerRule.parentAnswerMin && challenge.triggerRule.parentAnswerMax) {
                                                  <span>Appears when this Position answer is {{ getLikertWord(challenge.triggerRule.parentAnswerMin) }}–{{ getLikertWord(challenge.triggerRule.parentAnswerMax) }} ({{ challenge.triggerRule.parentAnswerMin }}–{{ challenge.triggerRule.parentAnswerMax }})</span>
                                                } @else if (challenge.triggerRule.parentAnswerMin) {
                                                  <span>Appears when this Position answer is {{ getLikertWord(challenge.triggerRule.parentAnswerMin) }}–{{ getLikertWord(5) }} ({{ challenge.triggerRule.parentAnswerMin }}–5)</span>
                                                } @else if (challenge.triggerRule.parentAnswerMax) {
                                                  <span>Appears when this Position answer is {{ getLikertWord(1) }}–{{ getLikertWord(challenge.triggerRule.parentAnswerMax) }} (1–{{ challenge.triggerRule.parentAnswerMax }})</span>
                                                }
                                              </div>
                                            }
                                            @if (challenge.triggerRule.tags && challenge.triggerRule.tags.length > 0) {
                                              <div>Tags: {{ challenge.triggerRule.tags.join(', ') }}</div>
                                            }
                                          </div>
                                        }
                                      </div>
                                      @if (isDevMode()) {
                                        <button
                                          (click)="startEditChallenge(challenge)"
                                          class="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                          [attr.data-testid]="'edit-challenge-' + challenge.id"
                                        >
                                          Edit
                                        </button>
                                      }
                                    </div>
                                  }

                                  <!-- Challenge (Edit Mode) -->
                                  @if (challenge.editing) {
                                    <div class="space-y-2">
                                      <h4 class="font-medium text-gray-700 text-sm">Edit {{ TERMINOLOGY.CHALLENGE_SINGULAR }}</h4>
                                      <input
                                        [(ngModel)]="challenge.editTitle"
                                        type="text"
                                        placeholder="Challenge title"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        [attr.data-testid]="'edit-challenge-title-' + challenge.id"
                                      />
                                      <textarea
                                        [(ngModel)]="challenge.editBody"
                                        rows="2"
                                        placeholder="Challenge body"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        [attr.data-testid]="'edit-challenge-body-' + challenge.id"
                                      ></textarea>
                                      
                                      <!-- triggerRule editing -->
                                      <div class="space-y-2 border-t pt-2 mt-2">
                                        <h5 class="text-xs font-medium text-gray-600">Linked Position Answer Range</h5>
                                        <div class="flex space-x-2">
                                          <div class="flex-1">
                                            <label class="block text-xs text-gray-500 mb-1">Min (1-5)</label>
                                            <input
                                              [(ngModel)]="challenge.editTriggerParentAnswerMin"
                                              type="number"
                                              min="1"
                                              max="5"
                                              step="1"
                                              placeholder="Min"
                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              [attr.data-testid]="'challenge-trigger-min-' + challenge.id"
                                            />
                                          </div>
                                          <div class="flex-1">
                                            <label class="block text-xs text-gray-500 mb-1">Max (1-5)</label>
                                            <input
                                              [(ngModel)]="challenge.editTriggerParentAnswerMax"
                                              type="number"
                                              min="1"
                                              max="5"
                                              step="1"
                                              placeholder="Max"
                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              [attr.data-testid]="'challenge-trigger-max-' + challenge.id"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label class="block text-xs text-gray-500 mb-1">Tags (comma-separated)</label>
                                          <input
                                            [(ngModel)]="challenge.editTriggerTags"
                                            type="text"
                                            placeholder="e.g., pro-liberty, paternalism"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            [attr.data-testid]="'challenge-trigger-tags-' + challenge.id"
                                          />
                                        </div>
                                      </div>

                                      <div class="flex space-x-2">
                                        <button
                                          (click)="saveChallenge(ideal, challenge)"
                                          [disabled]="!hasChallengeChanges(challenge)"
                                          [class.opacity-50]="!hasChallengeChanges(challenge)"
                                          [class.cursor-not-allowed]="!hasChallengeChanges(challenge)"
                                          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                          [attr.data-testid]="'save-challenge-' + challenge.id"
                                        >
                                          {{ TERMINOLOGY.ADMIN_SAVE_AND_EXPORT }}
                                        </button>
                                        <button
                                          (click)="cancelEditChallenge(challenge)"
                                          class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                          [attr.data-testid]="'cancel-edit-challenge-' + challenge.id"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  }
                                </div>
                              }
                            }
                          </div>
                        }
                      </div>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>

        @if (visibleIdeals().length === 0) {
          <div class="text-center py-8 text-gray-500" data-testid="no-matches-state">
            @if (searchQuery) {
              No matches found. Try a different search term.
            } @else {
              No {{ TERMINOLOGY.IDEAL_PLURAL }} found.
            }
          </div>
        }
      }
    </div>
  `
})
export class AdminContentExplorerComponent implements OnInit {
  searchQuery = '';
  private ideals = signal<IdealNode[]>([]);
  validationErrors = signal<ValidationError[]>([]);
  exportSuccess = signal<boolean>(false);
  
  // Expose terminology dictionary to template
  readonly TERMINOLOGY = TERMINOLOGY;
  
  // Debug IDs overlay flag (query param: ?debugIds=1)
  debugIds = signal<boolean>(false);
  
  // LocalStorage key for draft overlay
  private readonly DRAFT_STORAGE_KEY = 'rawls.adminContentDraft.v1';

  private draftChanges: Record<string, DraftEntry> = {};
  private orderOverrides: Record<string, string[]> = {};
  private hiddenOverrides: Record<string, boolean> = {};
  private categoryOrderOverride: string[] | undefined;
  
  // Production stats (measured from real content)
  // Property chain: categories[] → followUps[] 
  // Position IDs: {categoryId}-q\d+
  // Challenge IDs: {positionId}-fu\d+ (currently 0 in production)
  productionStats = computed(() => {
    const categories = this.getBaseCategories();
    let positionCount = 0;
    let challengeCount = 0;
    
    categories.forEach(cat => {
      cat.followUps.forEach(fu => {
        if (new RegExp(`^${cat.id}-q\\d+$`).test(fu.id)) {
          positionCount++;
        }
        if (/-fu\d+$/.test(fu.id)) {
          challengeCount++;
        }
      });
    });
    
    return {
      categoryCount: categories.length,
      positionCount,
      challengeCount
    };
  });
  
  visibleIdeals = computed(() => {
    return this.ideals().filter(ideal => ideal.visible);
  });

  loading = computed(() => this.contentService.state().loading);
  error = computed(() => this.contentService.state().error);
  isDevMode = isDevMode;
  
  // Count of pending draft changes
  draftOverlayCount = computed(() => {
    let count = 0;
    const baseContent = this.getBaseContent();
    
    // Check category order changes
    const currentCategoryOrder = this.ideals().map(ideal => ideal.id);
    const baseCategoryOrder = baseContent.categories.map(cat => cat.id);
    if (currentCategoryOrder.length === baseCategoryOrder.length && !this.arraysEqual(currentCategoryOrder, baseCategoryOrder)) {
      count++;
    }
    
    this.ideals().forEach(ideal => {
      const baseCategory = baseContent.categories.find(c => c.id === ideal.id);
      if (baseCategory) {
        if (ideal.name !== baseCategory.name) count++;
        if (ideal.description !== baseCategory.description) count++;
        const currentOrder = ideal.positions.map(pos => pos.id);
        const baseOrder = baseCategory.followUps.map(f => f.id);
        if (currentOrder.length === baseOrder.length && !this.arraysEqual(currentOrder, baseOrder)) {
          count++;
        }
      }
      
      ideal.positions.forEach(position => {
        const basePosition = baseCategory?.followUps.find(f => f.id === position.id);
        if (basePosition && position.text !== (basePosition.statement || '')) {
          count++;
        }
        if (position.baseHidden !== position.hidden) {
          count++;
        }
      });
    });
    
    return count;
  });

  constructor(private contentService: ContentService, private route: ActivatedRoute) {
    this.hydrateDraftFromStorage();
    this.contentService.loadContent();
    
    // Rebuild ideals tree when content loads
    effect(() => {
      const categories = this.getBaseCategories();
      if (categories.length > 0) {
        this.buildIdealsTree(categories);
      }
    });
  }

  ngOnInit(): void {
    // Read debugIds query param
    this.route.queryParamMap.subscribe(params => {
      const debugIdsParam = params.get('debugIds');
      this.debugIds.set(debugIdsParam === '1' || debugIdsParam === 'true');
    });
    
    // Initial build if content already loaded
    const categories = this.getBaseCategories();
    if (categories.length > 0) {
      this.buildIdealsTree(categories);
    }
  }

  private getBaseCategories(): Category[] {
    const state = this.contentService.state();
    const rawCategories = state.rawCategories ?? [];
    return rawCategories.length > 0 ? rawCategories : state.categories;
  }

  private getBaseContent(): { categories: Category[]; likert5: string[] } {
    const state = this.contentService.state();
    return {
      categories: this.getBaseCategories(),
      likert5: state.likert5
    };
  }

  private buildIdealsTree(categories: Category[]): void {
    let idealNodes: IdealNode[] = categories.map(cat => {
      const positions = this.buildPositionNodes(cat);
      const orderedPositions = this.applyOrderOverride(positions, this.orderOverrides[cat.id]);
      const catDraft = this.draftChanges[cat.id];
      
      return {
        id: cat.id,
        name: catDraft?.name ?? cat.name,
        description: catDraft?.description ?? cat.description,
        quote: cat.quote,
        positions: orderedPositions,
        expanded: false,
        visible: true,
        editing: false,
        editName: catDraft?.name ?? cat.name,
        editDescription: catDraft?.description ?? cat.description
      };
    });

    // Apply category order override if present
    if (this.categoryOrderOverride && this.categoryOrderOverride.length === idealNodes.length) {
      const categoryById = new Map(idealNodes.map(node => [node.id, node]));
      const seen = new Set<string>();
      let valid = true;
      
      // Validate: all IDs exist and no duplicates
      for (const id of this.categoryOrderOverride) {
        if (seen.has(id) || !categoryById.has(id)) {
          valid = false;
          break;
        }
        seen.add(id);
      }
      
      if (valid) {
        idealNodes = this.categoryOrderOverride.map(id => categoryById.get(id)!);
      }
    }

    this.ideals.set(idealNodes);
  }

  private buildPositionNodes(category: Category): PositionNode[] {
    // Map followUps directly as positions (no filtering needed)
    // Each followUp is a position/question that can be edited
    return category.followUps.map(fu => {
      const posDraft = this.draftChanges[fu.id];
      const text = posDraft?.text ?? (fu.statement || fu.text || '');
      const baseHidden = fu.hidden === true;
      const override = this.hiddenOverrides[fu.id];
      const hidden = typeof override === 'boolean' ? override : baseHidden;
      
      // Map challenges from followUp data
      const challenges: ChallengeNode[] = (fu.challenges ?? []).map(ch => {
        const chDraft = this.draftChanges[ch.id];
        return {
          id: ch.id,
          title: (chDraft?.name ?? ch.title) || '',
          body: (chDraft?.text ?? ch.body) || '',
          triggerRule: chDraft?.triggerRule ?? ch.triggerRule,
          visible: true,
          editing: false,
          editTitle: (chDraft?.name ?? ch.title) || '',
          editBody: (chDraft?.text ?? ch.body) || '',
          editTriggerParentAnswerMin: chDraft?.triggerRule?.parentAnswerMin ?? ch.triggerRule?.parentAnswerMin,
          editTriggerParentAnswerMax: chDraft?.triggerRule?.parentAnswerMax ?? ch.triggerRule?.parentAnswerMax,
          editTriggerTags: (chDraft?.triggerRule?.tags?.join(', ') ?? ch.triggerRule?.tags?.join(', ')) ?? ''
        };
      });
      
      return {
        id: fu.id,
        text,
        challenges,
        expanded: false,
        visible: true,
        editing: false,
        editText: text,
        hidden,
        baseHidden
      };
    });
  }

  private applyOrderOverride(positions: PositionNode[], override?: string[]): PositionNode[] {
    if (!override || override.length !== positions.length) {
      return positions;
    }

    const positionMap = new Map(positions.map(position => [position.id, position]));
    const orderedPositions: PositionNode[] = [];

    for (const id of override) {
      const node = positionMap.get(id);
      if (!node) {
        return positions;
      }
      orderedPositions.push(node);
    }

    return orderedPositions;
  }

  toggleIdeal(ideal: IdealNode): void {
    ideal.expanded = !ideal.expanded;
    this.ideals.set([...this.ideals()]);
  }

  togglePosition(position: PositionNode): void {
    position.expanded = !position.expanded;
    this.ideals.set([...this.ideals()]);
  }

  canMovePositionUp(ideal: IdealNode, position: PositionNode): boolean {
    return ideal.positions[0]?.id !== position.id;
  }

  canMovePositionDown(ideal: IdealNode, position: PositionNode): boolean {
    return ideal.positions[ideal.positions.length - 1]?.id !== position.id;
  }

  canMoveCategoryUp(ideal: IdealNode): boolean {
    const ideals = this.ideals();
    return ideals[0]?.id !== ideal.id;
  }

  canMoveCategoryDown(ideal: IdealNode): boolean {
    const ideals = this.ideals();
    return ideals[ideals.length - 1]?.id !== ideal.id;
  }

  moveCategory(ideal: IdealNode, direction: 'up' | 'down'): void {
    const ideals = [...this.ideals()];
    const index = ideals.findIndex(i => i.id === ideal.id);
    if (index === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ideals.length) {
      return;
    }

    [ideals[index], ideals[targetIndex]] = [ideals[targetIndex], ideals[index]];
    this.ideals.set(ideals);
    this.saveDraftToStorage();
  }

  movePosition(ideal: IdealNode, position: PositionNode, direction: 'up' | 'down'): void {
    const positions = [...ideal.positions];
    const index = positions.findIndex(p => p.id === position.id);
    if (index === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= positions.length) {
      return;
    }

    [positions[index], positions[targetIndex]] = [positions[targetIndex], positions[index]];
    ideal.positions = positions;
    this.ideals.set([...this.ideals()]);
    this.saveDraftToStorage();
  }

  togglePositionHidden(position: PositionNode): void {
    const nextHidden = !position.hidden;
    this.applyHiddenState(position, nextHidden);
  }

  setPositionHidden(position: PositionNode, hidden: boolean): void {
    this.applyHiddenState(position, hidden);
  }

  private applyHiddenState(position: PositionNode, hidden: boolean): void {
    if (position.hidden === hidden) {
      return;
    }
    position.hidden = hidden;
    this.updateHiddenOverride(position.id, hidden, position.baseHidden);
    this.ideals.set([...this.ideals()]);
    this.saveDraftToStorage();
  }

  private updateHiddenOverride(positionId: string, hidden: boolean, baseHidden: boolean): void {
    if (hidden === baseHidden) {
      delete this.hiddenOverrides[positionId];
    } else {
      this.hiddenOverrides[positionId] = hidden;
    }
  }

  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase().trim();
    
    if (!query) {
      // Reset all visibility
      this.ideals().forEach(ideal => {
        ideal.visible = true;
        ideal.positions.forEach(pos => {
          pos.visible = true;
          pos.challenges.forEach(chal => {
            chal.visible = true;
          });
        });
      });
      this.ideals.set([...this.ideals()]);
      return;
    }

    // Filter and auto-expand matches
    this.ideals().forEach(ideal => {
      const idealMatches = 
        ideal.name.toLowerCase().includes(query) ||
        ideal.description.toLowerCase().includes(query) ||
        ideal.quote.toLowerCase().includes(query);

      let hasVisiblePosition = false;

      ideal.positions.forEach(pos => {
        const posMatches = pos.text.toLowerCase().includes(query);
        let hasVisibleChallenge = false;

        pos.challenges.forEach(chal => {
          const chalMatches = (chal.title + ' ' + chal.body).toLowerCase().includes(query);
          chal.visible = idealMatches || posMatches || chalMatches;
          if (chal.visible) {
            hasVisibleChallenge = true;
          }
        });

        pos.visible = idealMatches || posMatches || hasVisibleChallenge;
        if (pos.visible) {
          hasVisiblePosition = true;
          if (hasVisibleChallenge) {
            pos.expanded = true; // Auto-expand if challenges match
          }
        }
      });

      ideal.visible = idealMatches || hasVisiblePosition;
      if (ideal.visible && hasVisiblePosition) {
        ideal.expanded = true; // Auto-expand if positions match
      }
    });

    this.ideals.set([...this.ideals()]);
  }

  startEdit(ideal: IdealNode): void {
    ideal.editing = true;
    ideal.editName = ideal.name;
    ideal.editDescription = ideal.description;
    this.validationErrors.set([]);
    this.exportSuccess.set(false);
    this.ideals.set([...this.ideals()]);
  }

  cancelEdit(ideal: IdealNode): void {
    ideal.editing = false;
    ideal.editName = ideal.name;
    ideal.editDescription = ideal.description;
    this.validationErrors.set([]);
    this.ideals.set([...this.ideals()]);
  }

  hasChanges(ideal: IdealNode): boolean {
    return ideal.editName !== ideal.name || ideal.editDescription !== ideal.description;
  }

  saveIdeal(ideal: IdealNode): void {
    this.validationErrors.set([]);
    this.exportSuccess.set(false);

    // Build updated content
    const baseContent = this.getBaseContent();
    const updatedCategories = baseContent.categories.map(cat => {
      if (cat.id === ideal.id) {
        return {
          ...cat,
          name: ideal.editName.trim(),
          description: ideal.editDescription.trim()
        };
      }
      return cat;
    });

    const updatedContent: ContentData = {
      categories: updatedCategories,
      likert5: baseContent.likert5
    };

    // Validate
    const validation = validateContentIntegrity(updatedContent);
    
    if (!validation.valid) {
      this.validationErrors.set(validation.errors);
      return;
    }

    // Export
    this.exportJSON(updatedContent);

    // Update local state
    ideal.name = ideal.editName.trim();
    ideal.description = ideal.editDescription.trim();
    ideal.editing = false;
    this.exportSuccess.set(true);
    this.ideals.set([...this.ideals()]);
    
    // Persist to localStorage
    this.saveDraftToStorage();

    // Clear success message after 3 seconds
    setTimeout(() => {
      this.exportSuccess.set(false);
    }, 3000);
  }

  startEditPosition(position: PositionNode): void {
    position.editing = true;
    position.editText = position.text;
    this.validationErrors.set([]);
    this.exportSuccess.set(false);
    this.ideals.set([...this.ideals()]);
  }

  cancelEditPosition(position: PositionNode): void {
    position.editing = false;
    position.editText = position.text;
    this.validationErrors.set([]);
    this.ideals.set([...this.ideals()]);
  }

  hasPositionChanges(position: PositionNode): boolean {
    return position.editText !== position.text;
  }

  savePosition(ideal: IdealNode, position: PositionNode): void {
    this.validationErrors.set([]);
    this.exportSuccess.set(false);

    // Build updated content with modified position
    const baseContent = this.getBaseContent();
    const updatedCategories = baseContent.categories.map(cat => {
      if (cat.id === ideal.id) {
        return {
          ...cat,
          followUps: cat.followUps.map(fu => {
            if (fu.id === position.id) {
              return {
                ...fu,
                statement: position.editText.trim()
              };
            }
            return fu;
          })
        };
      }
      return cat;
    });

    const updatedContent: ContentData = {
      categories: updatedCategories,
      likert5: baseContent.likert5
    };

    // Validate
    const validation = validateContentIntegrity(updatedContent);
    
    if (!validation.valid) {
      this.validationErrors.set(validation.errors);
      return;
    }

    // Export
    this.exportJSON(updatedContent);

    // Update local state
    position.text = position.editText.trim();
    position.editing = false;
    this.exportSuccess.set(true);
    this.ideals.set([...this.ideals()]);
    
    // Persist to localStorage
    this.saveDraftToStorage();

    // Clear success message after 3 seconds
    setTimeout(() => {
      this.exportSuccess.set(false);
    }, 3000);
  }

  startEditChallenge(challenge: ChallengeNode): void {
    challenge.editing = true;
    challenge.editTitle = challenge.title;
    challenge.editBody = challenge.body;
    challenge.editTriggerParentAnswerMin = challenge.triggerRule?.parentAnswerMin;
    challenge.editTriggerParentAnswerMax = challenge.triggerRule?.parentAnswerMax;
    challenge.editTriggerTags = challenge.triggerRule?.tags?.join(', ') ?? '';
    this.validationErrors.set([]);
    this.exportSuccess.set(false);
    this.ideals.set([...this.ideals()]);
  }

  cancelEditChallenge(challenge: ChallengeNode): void {
    challenge.editing = false;
    challenge.editTitle = challenge.title;
    challenge.editBody = challenge.body;
    challenge.editTriggerParentAnswerMin = challenge.triggerRule?.parentAnswerMin;
    challenge.editTriggerParentAnswerMax = challenge.triggerRule?.parentAnswerMax;
    challenge.editTriggerTags = challenge.triggerRule?.tags?.join(', ') ?? '';
    this.validationErrors.set([]);
    this.ideals.set([...this.ideals()]);
  }

  hasChallengeChanges(challenge: ChallengeNode): boolean {
    const titleChanged = challenge.editTitle !== challenge.title;
    const bodyChanged = challenge.editBody !== challenge.body;
    const minChanged = challenge.editTriggerParentAnswerMin !== challenge.triggerRule?.parentAnswerMin;
    const maxChanged = challenge.editTriggerParentAnswerMax !== challenge.triggerRule?.parentAnswerMax;
    const tagsChanged = challenge.editTriggerTags !== (challenge.triggerRule?.tags?.join(', ') ?? '');
    return titleChanged || bodyChanged || minChanged || maxChanged || tagsChanged;
  }

  saveChallenge(ideal: IdealNode, challenge: ChallengeNode): void {
    // Update local state
    challenge.title = challenge.editTitle.trim();
    challenge.body = challenge.editBody.trim();
    
    // Update triggerRule
    const tags = challenge.editTriggerTags
      ?.split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0) ?? [];
    
    const newTriggerRule: any = {};
    if (challenge.editTriggerParentAnswerMin !== undefined) {
      newTriggerRule.parentAnswerMin = challenge.editTriggerParentAnswerMin;
    }
    if (challenge.editTriggerParentAnswerMax !== undefined) {
      newTriggerRule.parentAnswerMax = challenge.editTriggerParentAnswerMax;
    }
    if (tags.length > 0) {
      newTriggerRule.tags = tags;
    }
    
    challenge.triggerRule = Object.keys(newTriggerRule).length > 0 ? newTriggerRule : undefined;
    
    // Persist to draft storage
    const draft: DraftEntry = {};
    if (challenge.title) draft.name = challenge.title;
    if (challenge.body) draft.text = challenge.body;
    if (challenge.triggerRule) draft.triggerRule = challenge.triggerRule;
    this.draftChanges[challenge.id] = draft;
    
    challenge.editing = false;
    this.saveDraftToStorage();
    this.exportSuccess.set(true);
    this.ideals.set([...this.ideals()]);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      this.exportSuccess.set(false);
    }, 3000);
  }

  private exportJSON(content: ContentData): void {
    const jsonString = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rawls-values.edited.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }

  exportPatch(): void {
    const patches = this.buildPatchPayload();
    const jsonString = JSON.stringify(patches, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rawls-content-patch.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    this.exportSuccess.set(true);
    setTimeout(() => this.exportSuccess.set(false), 3000);
  }

  private buildPatchPayload(): PatchOperation[] {
    const baseContent = this.getBaseContent();
    const patches: PatchOperation[] = [];

    this.ideals().forEach(ideal => {
      const baseCategory = baseContent.categories.find(c => c.id === ideal.id);
      if (baseCategory) {
        if (ideal.name !== baseCategory.name) {
          patches.push({ id: ideal.id, kind: 'category', field: 'name', value: ideal.name });
        }
        if (ideal.description !== baseCategory.description) {
          patches.push({ id: ideal.id, kind: 'category', field: 'description', value: ideal.description });
        }
      }

      ideal.positions.forEach(position => {
        const basePosition = baseCategory?.followUps.find(f => f.id === position.id);
        if (basePosition && position.text !== (basePosition.statement || '')) {
          patches.push({ id: position.id, kind: 'position', field: 'statement', value: position.text });
        }
        if (basePosition && position.hidden !== (basePosition.hidden === true)) {
          patches.push({ op: 'setHidden', kind: 'position', id: position.id, hidden: position.hidden });
        }

        // Check for challenge edits
        position.challenges.forEach(challenge => {
          const baseChallenge = basePosition?.challenges?.find(c => c.id === challenge.id);
          if (baseChallenge) {
            if (challenge.title !== baseChallenge.title) {
              patches.push({ id: challenge.id, kind: 'challenge', field: 'title', value: challenge.title });
            }
            if (challenge.body !== baseChallenge.body) {
              patches.push({ id: challenge.id, kind: 'challenge', field: 'body', value: challenge.body });
            }
            // Check triggerRule changes
            const baseTriggerRule = baseChallenge.triggerRule;
            const currentTriggerRule = challenge.triggerRule;
            const triggerRuleChanged = 
              currentTriggerRule?.parentAnswerMin !== baseTriggerRule?.parentAnswerMin ||
              currentTriggerRule?.parentAnswerMax !== baseTriggerRule?.parentAnswerMax ||
              JSON.stringify(currentTriggerRule?.tags ?? []) !== JSON.stringify(baseTriggerRule?.tags ?? []);
            if (triggerRuleChanged && currentTriggerRule) {
              patches.push({ id: challenge.id, kind: 'challenge', field: 'triggerRule', value: currentTriggerRule });
            }
          }
        });
      });

      if (baseCategory) {
        const currentOrder = ideal.positions.map(position => position.id);
        const baseOrder = baseCategory.followUps.map(f => f.id);
        if (currentOrder.length === baseOrder.length && !this.arraysEqual(currentOrder, baseOrder)) {
          patches.push({
            op: 'reorder',
            kind: 'position',
            categoryId: ideal.id,
            orderedIds: currentOrder
          });
        }
      }
    });

    // Check for category reorder
    const currentCategoryOrder = this.ideals().map(ideal => ideal.id);
    const baseCategoryOrder = baseContent.categories.map(c => c.id);
    if (currentCategoryOrder.length === baseCategoryOrder.length && !this.arraysEqual(currentCategoryOrder, baseCategoryOrder)) {
      patches.push({
        op: 'reorder',
        kind: 'category',
        orderedIds: currentCategoryOrder
      });
    }

    return patches;
  }

  resetDraft(): void {
    localStorage.removeItem(this.DRAFT_STORAGE_KEY);
    this.draftChanges = {};
    this.orderOverrides = {};
    this.hiddenOverrides = {};
    this.categoryOrderOverride = undefined;
    const categories = this.getBaseCategories();
    this.buildIdealsTree(categories);
    this.validationErrors.set([]);
    this.exportSuccess.set(false);
  }

  private saveDraftToStorage(): void {
    const payload = this.computeDraftStoragePayload();
    this.draftChanges = payload.changes;
    this.orderOverrides = payload.orderOverrides;
    this.hiddenOverrides = payload.hiddenById;
    this.categoryOrderOverride = payload.categoryOrderOverride;
    localStorage.setItem(this.DRAFT_STORAGE_KEY, JSON.stringify(payload));
  }

  private computeDraftStoragePayload(): DraftStoragePayload {
    const changes: Record<string, DraftEntry> = {};
    const orderOverrides: Record<string, string[]> = {};
    const hiddenById: Record<string, boolean> = {};
    const baseContent = this.getBaseContent();

    this.ideals().forEach(ideal => {
      const baseCategory = baseContent.categories.find(c => c.id === ideal.id);
      if (baseCategory) {
        const categoryDiff: DraftEntry = {};
        if (ideal.name !== baseCategory.name) {
          categoryDiff.name = ideal.name;
        }
        if (ideal.description !== baseCategory.description) {
          categoryDiff.description = ideal.description;
        }
        if (Object.keys(categoryDiff).length > 0) {
          changes[ideal.id] = categoryDiff;
        }
      }

      ideal.positions.forEach(position => {
        const basePosition = baseCategory?.followUps.find(f => f.id === position.id);
        if (basePosition && position.text !== (basePosition.statement || '')) {
          changes[position.id] = { text: position.text };
        }
        if (basePosition && position.hidden !== (basePosition.hidden === true)) {
          hiddenById[position.id] = position.hidden;
        }

        // Check for challenge edits
        position.challenges.forEach(challenge => {
          const baseChallenge = basePosition?.challenges?.find(c => c.id === challenge.id);
          if (baseChallenge) {
            const challengeDiff: DraftEntry = {};
            if (challenge.title !== baseChallenge.title) {
              challengeDiff.name = challenge.title;
            }
            if (challenge.body !== baseChallenge.body) {
              challengeDiff.text = challenge.body;
            }
            // Check triggerRule changes
            const baseTriggerRule = baseChallenge.triggerRule;
            const currentTriggerRule = challenge.triggerRule;
            const triggerRuleChanged = 
              currentTriggerRule?.parentAnswerMin !== baseTriggerRule?.parentAnswerMin ||
              currentTriggerRule?.parentAnswerMax !== baseTriggerRule?.parentAnswerMax ||
              JSON.stringify(currentTriggerRule?.tags ?? []) !== JSON.stringify(baseTriggerRule?.tags ?? []);
            if (triggerRuleChanged && currentTriggerRule) {
              challengeDiff.triggerRule = currentTriggerRule;
            }
            if (Object.keys(challengeDiff).length > 0) {
              changes[challenge.id] = challengeDiff;
            }
          }
        });
      });

      if (baseCategory) {
        const currentOrder = ideal.positions.map(position => position.id);
        const baseOrder = baseCategory.followUps.map(f => f.id);
        if (currentOrder.length === baseOrder.length && !this.arraysEqual(currentOrder, baseOrder)) {
          orderOverrides[ideal.id] = currentOrder;
        }
      }
    });

    // Check for category order changes
    const currentCategoryOrder = this.ideals().map(ideal => ideal.id);
    const baseCategoryOrder = baseContent.categories.map(c => c.id);
    let categoryOrderOverride: string[] | undefined;
    if (currentCategoryOrder.length === baseCategoryOrder.length && !this.arraysEqual(currentCategoryOrder, baseCategoryOrder)) {
      categoryOrderOverride = currentCategoryOrder;
    }

    return {
      changes,
      orderOverrides,
      hiddenById,
      categoryOrderOverride
    };
  }

  private hydrateDraftFromStorage(): void {
    const stored = localStorage.getItem(this.DRAFT_STORAGE_KEY);
    if (!stored) {
      this.draftChanges = {};
      this.orderOverrides = {};
      this.hiddenOverrides = {};
      this.categoryOrderOverride = undefined;
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        if ('changes' in parsed || 'orderOverrides' in parsed) {
          const payload = parsed as Partial<DraftStoragePayload>;
          this.draftChanges = this.normalizeDraftChanges(payload.changes);
          this.orderOverrides = this.normalizeOrderOverrides(payload.orderOverrides);
          this.hiddenOverrides = this.normalizeHiddenOverrides(payload.hiddenById);
          this.categoryOrderOverride = this.normalizeCategoryOrderOverride(payload.categoryOrderOverride);
          return;
        }

        const legacy = parsed as Record<string, DraftEntry> & {
          __orderOverrides?: Record<string, string[]>;
          __hiddenById?: Record<string, boolean>;
        };
        const { __orderOverrides, __hiddenById, ...legacyChanges } = legacy;
        this.draftChanges = this.normalizeDraftChanges(legacyChanges);
        this.orderOverrides = this.normalizeOrderOverrides(__orderOverrides);
        this.hiddenOverrides = this.normalizeHiddenOverrides(__hiddenById);
        this.categoryOrderOverride = undefined;
        return;
      }
    } catch {
      // Ignore corrupted draft payloads
    }

    this.draftChanges = {};
    this.orderOverrides = {};
    this.hiddenOverrides = {};
    this.categoryOrderOverride = undefined;
  }

  private normalizeDraftChanges(value: unknown): Record<string, DraftEntry> {
    if (!value || typeof value !== 'object') {
      return {};
    }

    const entries: Record<string, DraftEntry> = {};
    Object.entries(value as Record<string, DraftEntry>).forEach(([key, entry]) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }
      const normalized: DraftEntry = {};
      if (typeof entry.name === 'string') {
        normalized.name = entry.name;
      }
      if (typeof entry.description === 'string') {
        normalized.description = entry.description;
      }
      if (typeof entry.text === 'string') {
        normalized.text = entry.text;
      }
      if (Object.keys(normalized).length > 0) {
        entries[key] = normalized;
      }
    });

    return entries;
  }

  private normalizeOrderOverrides(value: unknown): Record<string, string[]> {
    if (!value || typeof value !== 'object') {
      return {};
    }

    const overrides: Record<string, string[]> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, ids]) => {
      if (Array.isArray(ids) && ids.every(id => typeof id === 'string')) {
        overrides[key] = [...ids];
      }
    });

    return overrides;
  }

  private normalizeHiddenOverrides(value: unknown): Record<string, boolean> {
    if (!value || typeof value !== 'object') {
      return {};
    }

    const overrides: Record<string, boolean> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, flag]) => {
      if (typeof flag === 'boolean') {
        overrides[key] = flag;
      }
    });

    return overrides;
  }

  private normalizeCategoryOrderOverride(value: unknown): string[] | undefined {
    if (!value) {
      return undefined;
    }
    if (Array.isArray(value) && value.every(id => typeof id === 'string')) {
      return [...value];
    }
    return undefined;
  }

  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((value, index) => value === b[index]);
  }

  getLikertWord(value: number): string {
    const mapping: Record<number, string> = {
      1: 'Not',
      2: 'Slightly',
      3: 'Moderately',
      4: 'Very',
      5: 'Extremely'
    };
    return mapping[value] || '';
  }
}
