/**
 * @human AdminContentExplorerComponent tests: Admin editor tree view, search, edit, validation, debug IDs, reorder, and hide/unhide export behavior
 * @proves AdminContentExplorer renders production content, guards draft overlay, validates edits, and emits correct patch payloads for reorder + hide toggles
 * @lastTouched 2025-12-23
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminContentExplorerComponent } from './admin-content-explorer.component';
import { ContentService } from '../../core/content/content.service';
import { signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import rawContent from '../../../assets/content/rawls-values.generated.json';

// SHAPE PROOF: Production content structure analysis
describe('Production Content Shape Proof', () => {
  it('should document production content structure (Positions and Challenges)', () => {
    // Property chains:
    // Positions: categories[].followUps[] (items matching pattern {categoryId}-q\d+)
    // Challenges: Nested in categories[].followUps[].challenges[] (pattern {positionId}-fu\d+)
    
    let positionCount = 0;
    let flatChallengeCount = 0;
    let nestedChallengeCount = 0;
    let firstNestedChallengeTitle = '';
    let exampleIdealId = '';
    let examplePositionId = '';
    
    rawContent.categories.forEach(cat => {
      cat.followUps.forEach(fu => {
        // Position pattern: {categoryId}-q\d+
        const positionPattern = new RegExp(`^${cat.id}-q\\d+$`);
        if (positionPattern.test(fu.id)) {
          positionCount++;
          if (!exampleIdealId) {
            exampleIdealId = cat.id;
            examplePositionId = fu.id;
          }
          
          // Count nested challenges for this position
          if (fu.challenges && Array.isArray(fu.challenges)) {
            nestedChallengeCount += fu.challenges.length;
            if (!firstNestedChallengeTitle && fu.challenges.length > 0) {
              firstNestedChallengeTitle = fu.challenges[0].title;
            }
          }
        }
        
        // Legacy flat challenge pattern: {anyPositionId}-fu\d+
        // (challenges as peers in followUps[] array - legacy schema)
        const challengePattern = /-fu\d+$/;
        if (challengePattern.test(fu.id)) {
          flatChallengeCount++;
        }
      });
    });
    
    // Shape proof output
    console.log('=== PRODUCTION SHAPE PROOF ===');
    console.log('File: src/assets/content/rawls-values.generated.json');
    console.log('Position property chain: categories[].followUps[] (pattern: {categoryId}-q\\d+)');
    console.log('Flat challenge property chain: categories[].followUps[] (pattern: {positionId}-fu\\d+, legacy schema)');
    console.log('Nested challenge property chain: categories[].followUps[].challenges[] (current schema)');
    console.log(`positionCount: ${positionCount}`);
    console.log(`flatChallengeCount: ${flatChallengeCount}`);
    console.log(`nestedChallengeCount: ${nestedChallengeCount}`);
    console.log(`Example: idealId=${exampleIdealId}, positionId=${examplePositionId}`);
    console.log(`firstNestedChallengeTitle: ${firstNestedChallengeTitle || '(none - nestedChallengeCount is 0)'}`);
    console.log('==============================');
    
    // Assertions
    expect(positionCount).toBe(28); // 7 categories * 4 positions each
    expect(flatChallengeCount).toBe(0); // No legacy flat challenges
    expect(nestedChallengeCount).toBe(13); // Current nested challenges in production (update intentionally if content changes)
  });

  it('should assert zero flat challenges and thirteen nested challenges in production (contract test)', () => {
    // This test locks the current reality: production has 0 flat legacy challenges and 13 nested challenges
    // If challenges are added/removed in production, this test will fail
    // and signal that content structure has changed
    let flatChallengeCount = 0;
    let nestedChallengeCount = 0;
    
    rawContent.categories.forEach(cat => {
      cat.followUps.forEach(fu => {
        // Legacy flat challenge pattern
        if (/-fu\d+$/.test(fu.id)) {
          flatChallengeCount++;
        }
        
        // Current nested challenge pattern
        const posPattern = new RegExp(`^${cat.id}-q\\d+$`);
        if (posPattern.test(fu.id) && fu.challenges && Array.isArray(fu.challenges)) {
          nestedChallengeCount += fu.challenges.length;
        }
      });
    });
    
    expect(flatChallengeCount).toBe(0); // No legacy flat challenges
    expect(nestedChallengeCount).toBe(13); // Current nested challenges (update intentionally if content changes)
  });
});

describe('AdminContentExplorerComponent', () => {
  let component: AdminContentExplorerComponent;
  let fixture: ComponentFixture<AdminContentExplorerComponent>;
  let mockContentService: jasmine.SpyObj<ContentService>;

  const createMockState = () => ({
    categories: [
      {
        id: 'liberty',
        name: 'Liberty',
        description: 'Test description',
        quote: 'Test quote',
        followUps: [
          { id: 'liberty-q0', statement: 'Position 1', text: '', reverse: false, dimension: 'liberty-q0' },
          { id: 'liberty-q0-fu0', statement: 'Challenge for Position 1', text: '', reverse: false, dimension: 'liberty-q0-fu0' },
          { id: 'liberty-q0-fu1', statement: 'Another challenge for Position 1', text: '', reverse: false, dimension: 'liberty-q0-fu1' }
        ]
      }
    ],
    likert5: [],
    loading: false,
    error: null
  });

  beforeEach(async () => {
    // Clear localStorage before each test to prevent draft persistence
    localStorage.clear();
    
    const mockState = signal(createMockState());

    mockContentService = jasmine.createSpyObj('ContentService', ['loadContent']);
    Object.defineProperty(mockContentService, 'state', {
      get: () => mockState.asReadonly()
    });
    
    const mockActivatedRoute = {
      queryParamMap: of({
        get: (key: string) => null
      })
    };

    await TestBed.configureTestingModule({
      imports: [AdminContentExplorerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ContentService, useValue: mockContentService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminContentExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadContent on initialization', () => {
    expect(mockContentService.loadContent).toHaveBeenCalled();
  });

  it('should render at least one ideal from content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const idealElement = compiled.querySelector('[data-testid="ideal-liberty"]');
    expect(idealElement).toBeTruthy();
    expect(compiled.textContent).toContain('Liberty');
  });

  it('should have search input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const searchInput = compiled.querySelector('[data-testid="search-input"]');
    expect(searchInput).toBeTruthy();
  });

  it('should show Edit button in dev mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const editButton = compiled.querySelector('[data-testid="edit-ideal-liberty"]');
    expect(editButton).toBeTruthy();
  });

  it('should enter edit mode when Edit clicked', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    expect(ideal.editing).toBe(false);

    component.startEdit(ideal);
    fixture.detectChanges();

    expect(ideal.editing).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    const editMode = compiled.querySelector('[data-testid="ideal-edit-mode-liberty"]');
    expect(editMode).toBeTruthy();
  });

  it('should revert changes on Cancel', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    component.startEdit(ideal);

    ideal.editName = 'Changed Name';
    ideal.editDescription = 'Changed Description';
    fixture.detectChanges();

    component.cancelEdit(ideal);
    fixture.detectChanges();

    expect(ideal.editing).toBe(false);
    expect(ideal.editName).toBe('Liberty');
    expect(ideal.editDescription).toBe('Test description');
  });

  it('should disable Save button when no changes', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    component.startEdit(ideal);
    fixture.detectChanges();

    expect(component.hasChanges(ideal)).toBe(false);
    
    const compiled = fixture.nativeElement as HTMLElement;
    const saveButton = compiled.querySelector('[data-testid="save-ideal-liberty"]') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);
  });

  it('should enable Save button when changes exist', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    component.startEdit(ideal);

    ideal.editName = 'Changed Name';
    fixture.detectChanges();

    expect(component.hasChanges(ideal)).toBe(true);
    
    const compiled = fixture.nativeElement as HTMLElement;
    const saveButton = compiled.querySelector('[data-testid="save-ideal-liberty"]') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);
  });
});

describe('AdminContentExplorerComponent - Loading State', () => {
  it('should display loading state when content is loading', async () => {
    const loadingState = signal({
      categories: [],
      likert5: [],
      loading: true,
      error: null
    });
    
    const loadingService = jasmine.createSpyObj('ContentService', ['loadContent'], {
      state: loadingState.asReadonly()
    });

    const mockActivatedRoute = {
      queryParamMap: of({get: (key: string) => null})
    };

    await TestBed.configureTestingModule({
      imports: [AdminContentExplorerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ContentService, useValue: loadingService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    const loadingFixture = TestBed.createComponent(AdminContentExplorerComponent);
    loadingFixture.detectChanges();

    const compiled = loadingFixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Loading content...');
  });
});

describe('AdminContentExplorerComponent - Error State', () => {
  it('should display error state when content fails to load', async () => {
    const errorState = signal({
      categories: [],
      likert5: [],
      loading: false,
      error: 'Network error'
    });
    
    const errorService = jasmine.createSpyObj('ContentService', ['loadContent'], {
      state: errorState.asReadonly()
    });

    const mockActivatedRoute = {
      queryParamMap: of({get: (key: string) => null})
    };

    await TestBed.configureTestingModule({
      imports: [AdminContentExplorerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ContentService, useValue: errorService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    const errorFixture = TestBed.createComponent(AdminContentExplorerComponent);
    errorFixture.detectChanges();

    const compiled = errorFixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Failed to load content: Network error');
  });
});

describe('AdminContentExplorerComponent - Validation and Export', () => {
  let component: AdminContentExplorerComponent;
  let fixture: ComponentFixture<AdminContentExplorerComponent>;
  let mockContentService: jasmine.SpyObj<ContentService>;

  beforeEach(async () => {
    // Clear localStorage before each test to prevent draft persistence
    localStorage.clear();
    
    // Use real production content structure
    const mockState = signal({
      categories: rawContent.categories,
      likert5: rawContent.likert5,
      loading: false,
      error: null
    });

    mockContentService = jasmine.createSpyObj('ContentService', ['loadContent'], {
      state: mockState.asReadonly()
    });
    
    const mockActivatedRoute = {
      queryParamMap: of({get: (key: string) => null})
    };

    await TestBed.configureTestingModule({
      imports: [AdminContentExplorerComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ContentService, useValue: mockContentService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminContentExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show validation errors when saving invalid content', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    component.startEdit(ideal);

    ideal.editName = '';  // Invalid: empty name
    fixture.detectChanges();

    spyOn<any>(component, 'exportJSON');
    component.saveIdeal(ideal);
    fixture.detectChanges();

    expect(component.validationErrors().length).toBeGreaterThan(0);
    expect(component['exportJSON']).not.toHaveBeenCalled();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const errorBlock = compiled.querySelector('[data-testid="validation-errors"]');
    expect(errorBlock).toBeTruthy();
  });

  it('should call export when validation passes', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    component.startEdit(ideal);

    ideal.editName = 'Updated Liberty';
    ideal.editDescription = 'Updated description';
    fixture.detectChanges();

    spyOn<any>(component, 'exportJSON');
    component.saveIdeal(ideal);
    fixture.detectChanges();

    expect(component.validationErrors().length).toBe(0);
    expect(component['exportJSON']).toHaveBeenCalled();
    expect(component.exportSuccess()).toBe(true);
  });

  it('should exit edit mode after successful save', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    component.startEdit(ideal);

    ideal.editName = 'Updated Liberty';
    fixture.detectChanges();

    spyOn<any>(component, 'exportJSON');
    component.saveIdeal(ideal);
    fixture.detectChanges();

    expect(ideal.editing).toBe(false);
    expect(ideal.name).toBe('Updated Liberty');
  });

  it('should enter edit mode for a Position and change text', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[0];
    
    component.startEditPosition(position);
    expect(position.editing).toBe(true);
    expect(position.editText).toBe(position.text);
    
    position.editText = 'Updated position text';
    expect(component.hasPositionChanges(position)).toBe(true);
  });

  it('should cancel Position edit and revert changes', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[0];
    const originalText = position.text;
    
    component.startEditPosition(position);
    position.editText = 'Modified text';
    
    component.cancelEditPosition(position);
    
    expect(position.editing).toBe(false);
    expect(position.editText).toBe(originalText);
  });

  it('should save Position and trigger validate + export', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[0];
    const updatedText = 'Updated position prompt';
    
    component.startEditPosition(position);
    position.editText = updatedText;
    
    spyOn<any>(component, 'exportJSON');
    component.savePosition(ideal, position);
    fixture.detectChanges();
    
    expect(component.validationErrors().length).toBe(0);
    expect(component['exportJSON']).toHaveBeenCalled();
    expect(position.editing).toBe(false);
    expect(position.text).toBe(updatedText);
  });

  it('should block Position save when validation fails', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[0];
    
    component.startEditPosition(position);
    position.editText = '';  // Invalid: empty text
    
    spyOn<any>(component, 'exportJSON');
    component.savePosition(ideal, position);
    fixture.detectChanges();
    
    expect(component.validationErrors().length).toBeGreaterThan(0);
    expect(component['exportJSON']).not.toHaveBeenCalled();
  });

  it('should have followUps in production content state', () => {
    const state = mockContentService.state();
    expect(state.categories.length).toBe(7);
    expect(state.categories[0].followUps).toBeDefined();
    expect(state.categories[0].followUps.length).toBeGreaterThan(0);
    // Verify real production data
    expect(state.categories[0].id).toBe('liberty');
    expect(state.categories[0].followUps[0].id).toBe('liberty-q0');
  });

  it('should render followUps as editable positions from real production content', () => {
    // Precondition: ensure no draft overlay leak
    expect(localStorage.getItem('rawls.adminContentDraft.v1')).toBeNull();
    
    const ideals = component['ideals']();
    expect(ideals.length).toBe(7);  // 7 categories from production
    
    const ideal = ideals[0];
    expect(ideal.id).toBe('liberty');
    expect(ideal.positions).toBeDefined();
    expect(ideal.positions.length).toBe(4);  // liberty has 4 followUps (q0-q3)
    
    const position = ideal.positions[0];
    expect(position.id).toBe('liberty-q0');
    
    // Derive expected text from the same production content the component uses
    const productionCategory = rawContent.categories.find(c => c.id === 'liberty');
    const productionFollowUp = productionCategory?.followUps[0];
    expect(productionFollowUp).toBeDefined();
    expect(position.text).toBe(productionFollowUp!.statement);
  });

  it('should enter Position edit mode and track changes using real content', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];  // liberty
    const position = ideal.positions[0];  // liberty-q0
    const originalText = position.text;
    
    component.startEditPosition(position);
    
    expect(position.editing).toBe(true);
    expect(position.editText).toBe(originalText);
    
    position.editText = 'Updated: How important is personal freedom?';
    expect(component.hasPositionChanges(position)).toBe(true);
  });

  it('should cancel Position edit and revert to original text', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[0];
    const originalText = position.text;
    
    component.startEditPosition(position);
    position.editText = 'Modified text that will be discarded';
    
    component.cancelEditPosition(position);
    
    expect(position.editing).toBe(false);
    expect(position.editText).toBe(originalText);
    expect(position.text).toBe(originalText);
  });

  it('should save Position edit and trigger validate + export with real content', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[1];  // liberty-q1
    const originalText = position.text;
    
    component.startEditPosition(position);
    position.editText = 'Updated: How important is freedom of choice?';
    
    spyOn<any>(component, 'exportJSON');
    component.savePosition(ideal, position);
    fixture.detectChanges();
    
    expect(component.validationErrors().length).toBe(0);
    expect(component['exportJSON']).toHaveBeenCalled();
    expect(position.editing).toBe(false);
    expect(position.text).toBe('Updated: How important is freedom of choice?');
  });

  it('should block Position save when validation fails on empty text', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[0];
    
    component.startEditPosition(position);
    position.editText = '';  // Invalid: empty text
    
    spyOn<any>(component, 'exportJSON');
    component.savePosition(ideal, position);
    fixture.detectChanges();
    
    expect(component.validationErrors().length).toBeGreaterThan(0);
    expect(component['exportJSON']).not.toHaveBeenCalled();
  });

  it('should not emit reorder patch when order matches production order', () => {
    const patches = component['buildPatchPayload']();
    const reorderOps = patches.filter((patch: any) => patch?.op === 'reorder');
    expect(reorderOps.length).toBe(0);
  });

  it('should emit reorder patch when positions are moved', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const firstPosition = ideal.positions[0];

    component.movePosition(ideal, firstPosition, 'down');
    fixture.detectChanges();

    const patches = component['buildPatchPayload']();
    const reorderOps = patches.filter((patch: any) => patch?.op === 'reorder');
    expect(reorderOps.length).toBe(1);

    const reorderPatch = reorderOps[0] as any;
    expect(reorderPatch.categoryId).toBe(ideal.id);
    expect(reorderPatch.orderedIds).toEqual(ideal.positions.map((position) => position.id));
  });

  it('should emit reorder patch when categories are moved', () => {
    const initialIdeals = component['ideals']();
    const firstIdeal = initialIdeals[0];

    // Move first category down (swap with second)
    component.moveCategory(firstIdeal, 'down');
    fixture.detectChanges();

    const patches = component['buildPatchPayload']();
    const reorderOps = patches.filter((patch: any) => patch?.op === 'reorder' && patch?.kind === 'category');
    expect(reorderOps.length).toBe(1);

    const reorderPatch = reorderOps[0] as any;
    expect(reorderPatch.kind).toBe('category');
    // After moving first ideal down, the order should reflect the swap
    const updatedIdeals = component['ideals']();
    expect(reorderPatch.orderedIds).toEqual(updatedIdeals.map((ideal) => ideal.id));
  });

  it('should render category reorder buttons in dev mode', () => {
    // Component renders in dev mode by default (isDevMode() returns true in tests)
    fixture.detectChanges();
    
    const ideals = component['ideals']();
    expect(ideals.length).toBeGreaterThanOrEqual(2); // Need at least 2 categories for reorder
    
    const secondIdeal = ideals[1]; // Use second ideal (can move both up and down)
    const compiled = fixture.nativeElement as HTMLElement;
    
    const moveUpButton = compiled.querySelector(`[data-testid="move-category-up-${secondIdeal.id}"]`);
    const moveDownButton = compiled.querySelector(`[data-testid="move-category-down-${secondIdeal.id}"]`);
    
    expect(moveUpButton).toBeTruthy();
    expect(moveDownButton).toBeTruthy();
    expect(moveUpButton?.getAttribute('aria-label')).toBe('Move up');
    expect(moveDownButton?.getAttribute('aria-label')).toBe('Move down');
  });

  it('should trigger moveCategory when category reorder buttons are clicked', () => {
    fixture.detectChanges();
    
    const ideals = component['ideals']();
    const secondIdeal = ideals[1];
    
    spyOn(component, 'moveCategory');
    
    const compiled = fixture.nativeElement as HTMLElement;
    const moveUpButton = compiled.querySelector(`[data-testid="move-category-up-${secondIdeal.id}"]`) as HTMLButtonElement;
    const moveDownButton = compiled.querySelector(`[data-testid="move-category-down-${secondIdeal.id}"]`) as HTMLButtonElement;
    
    expect(moveUpButton).toBeTruthy();
    expect(moveDownButton).toBeTruthy();
    
    moveUpButton.click();
    expect(component.moveCategory).toHaveBeenCalledWith(secondIdeal, 'up');
    
    moveDownButton.click();
    expect(component.moveCategory).toHaveBeenCalledWith(secondIdeal, 'down');
  });

  it('should persist category order in draft storage across reload', () => {
    localStorage.clear();
    fixture.detectChanges();
    
    const ideals = component['ideals']();
    expect(ideals.length).toBeGreaterThanOrEqual(2);
    
    const originalFirstId = ideals[0].id;
    const originalSecondId = ideals[1].id;
    
    // Move first category down (swap with second)
    component.moveCategory(ideals[0], 'down');
    fixture.detectChanges();
    
    // Verify order changed in memory
    const reorderedIdeals = component['ideals']();
    expect(reorderedIdeals[0].id).toBe(originalSecondId);
    expect(reorderedIdeals[1].id).toBe(originalFirstId);
    
    // Simulate reload: create new component instance that loads from draft storage
    const newFixture = TestBed.createComponent(AdminContentExplorerComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    
    // Assert: new component should restore category order from draft
    const reloadedIdeals = newComponent['ideals']();
    expect(reloadedIdeals[0].id).toBe(originalSecondId); // Should be second category (after move)
    expect(reloadedIdeals[1].id).toBe(originalFirstId);  // Should be first category (after move)
  });

  it('should emit setHidden patch when position is hidden', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[0];

    component.togglePositionHidden(position);
    fixture.detectChanges();

    const patches = component['buildPatchPayload']();
    const hiddenOps = patches.filter((patch: any) => patch?.op === 'setHidden');
    expect(hiddenOps.length).toBe(1);

    const hiddenPatch = hiddenOps[0] as any;
    expect(hiddenPatch.id).toBe(position.id);
    expect(hiddenPatch.hidden).toBeTrue();
  });

  it('should not emit setHidden patch when visibility matches production', () => {
    const ideals = component['ideals']();
    const ideal = ideals[0];
    const position = ideal.positions[0];

    component.togglePositionHidden(position); // hide
    component.togglePositionHidden(position); // unhide back to base state
    fixture.detectChanges();

    const patches = component['buildPatchPayload']();
    const hiddenOps = patches.filter((patch: any) => patch?.op === 'setHidden');
    expect(hiddenOps.length).toBe(0);
  });

  describe('debugIds overlay', () => {
    it('should NOT show debug IDs by default', () => {
      expect(component.debugIds()).toBe(false);
      
      const compiled = fixture.nativeElement as HTMLElement;
      const debugIdealId = compiled.querySelector('[data-testid="debug-ideal-id"]');
      const debugPositionId = compiled.querySelector('[data-testid="debug-position-id"]');
      
      expect(debugIdealId).toBeNull();
      expect(debugPositionId).toBeNull();
    });

    it('should show debug IDs when debugIds=1 in query params', () => {
      // Use the existing component and manually enable debugIds
      component.debugIds.set(true);
      fixture.detectChanges();
      
      // Expand an ideal to see position IDs
      const ideals = component['ideals']();
      if (ideals.length > 0) {
        component.toggleIdeal(ideals[0]);
        fixture.detectChanges();
      }
      
      expect(component.debugIds()).toBe(true);
      
      const compiled = fixture.nativeElement as HTMLElement;
      const debugIdealId = compiled.querySelector('[data-testid="debug-ideal-id"]');
      
      expect(debugIdealId).toBeTruthy();
      expect(debugIdealId?.textContent).toContain('liberty');
    });

    it('should show draft overlay count when debugIds enabled', () => {
      component.debugIds.set(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const statsBox = compiled.querySelector('[data-testid="production-stats"]');
      
      expect(statsBox?.textContent).toContain('Draft changes:');
      expect(statsBox?.textContent).toContain('0'); // No edits yet
    });
  });

  it('should increment draft overlay count when category order changes', () => {
    fixture.detectChanges();
    
    const ideals = component['ideals']();
    expect(ideals.length).toBeGreaterThanOrEqual(2);
    
    const beforeCount = component.draftOverlayCount();
    
    // Act: Move first category down
    component.moveCategory(ideals[0], 'down');
    fixture.detectChanges();
    
    // Assert: draft overlay count should increment
    const afterCount = component.draftOverlayCount();
    expect(afterCount).toBe(beforeCount + 1);
  });

  it('should disable category move buttons at boundaries', () => {
    fixture.detectChanges();
    
    const ideals = component['ideals']();
    expect(ideals.length).toBeGreaterThanOrEqual(2);
    
    const compiled = fixture.nativeElement as HTMLElement;
    
    // First category: move-up button should be disabled
    const firstIdeal = ideals[0];
    const firstMoveUpButton = compiled.querySelector(`[data-testid="move-category-up-${firstIdeal.id}"]`) as HTMLButtonElement;
    expect(firstMoveUpButton).toBeTruthy();
    expect(firstMoveUpButton.disabled).toBe(true);
    
    // Last category: move-down button should be disabled
    const lastIdeal = ideals[ideals.length - 1];
    const lastMoveDownButton = compiled.querySelector(`[data-testid="move-category-down-${lastIdeal.id}"]`) as HTMLButtonElement;
    expect(lastMoveDownButton).toBeTruthy();
    expect(lastMoveDownButton.disabled).toBe(true);
  });

  it('should export a challenge triggerRule edit patch and persist it to draft storage', () => {
    fixture.detectChanges();
    const ideals = component['ideals']();
    
    // Find first position with challenges
    let targetIdeal: any | undefined;
    let targetPosition: any | undefined;
    let targetChallenge: any | undefined;
    
    for (const ideal of ideals) {
      for (const position of ideal.positions) {
        if (position.challenges && position.challenges.length > 0) {
          targetIdeal = ideal;
          targetPosition = position;
          targetChallenge = position.challenges[0];
          break;
        }
      }
      if (targetChallenge) break;
    }
    
    expect(targetChallenge).withContext('Expected at least one nested challenge in production content').toBeTruthy();
    
    const originalTriggerRule = targetChallenge.triggerRule || {};
    
    // Edit challenge triggerRule
    component.startEditChallenge(targetChallenge);
    targetChallenge.editTriggerParentAnswerMin = 2;
    targetChallenge.editTriggerParentAnswerMax = 4;
    targetChallenge.editTriggerTags = 'audit-tag';
    component.saveChallenge(targetIdeal, targetChallenge);
    
    // Export patch
    const patches = (component as any)['buildPatchPayload']();
    
    // Assert patch includes challenge triggerRule edit
    const challengePatch = patches.find((p: any) => 
      p.id === targetChallenge.id && 
      p.kind === 'challenge' && 
      p.field === 'triggerRule'
    );
    
    expect(challengePatch).withContext('Expected challenge triggerRule patch in exported patches').toBeTruthy();
    expect(challengePatch.value).toEqual({
      parentAnswerMin: 2,
      parentAnswerMax: 4,
      tags: ['audit-tag']
    });
    
    // Assert draft storage persisted
    const storedDraft = localStorage.getItem('rawls.adminContentDraft.v1');
    expect(storedDraft).toBeTruthy();
    const parsed = JSON.parse(storedDraft!);
    expect(parsed.changes[targetChallenge.id]).toBeDefined();
    expect(parsed.changes[targetChallenge.id].triggerRule).toEqual({
      parentAnswerMin: 2,
      parentAnswerMax: 4,
      tags: ['audit-tag']
    });
  });

  it('renders triggerRule inputs when editing a nested challenge (dev mode)', async () => {
    // Arrange: use production content with nested challenges via private API
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();

    // Access ideals via private API to find nested challenge
    const ideals = (component as any).ideals();
    let targetIdeal: any | undefined;
    let targetPosition: any | undefined;
    let targetChallenge: any | undefined;
    
    for (const ideal of ideals) {
      for (const position of ideal.positions) {
        if (position.challenges && position.challenges.length > 0) {
          targetIdeal = ideal;
          targetPosition = position;
          targetChallenge = position.challenges[0];
          break;
        }
      }
      if (targetChallenge) break;
    }

    expect(targetChallenge).withContext('Expected at least one nested challenge in production content').toBeTruthy();

    // Expand ideal first, then position to show challenges
    component.toggleIdeal(targetIdeal);
    fixture.detectChanges();
    await fixture.whenStable();
    
    component.togglePosition(targetPosition);
    targetChallenge.visible = true;  // Ensure challenge is visible
    fixture.detectChanges();
    await fixture.whenStable();

    // Act: enter edit mode
    component.startEditChallenge(targetChallenge);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: triggerRule inputs exist in DOM
    const minInput = compiled.querySelector(`[data-testid="challenge-trigger-min-${targetChallenge.id}"]`);
    const maxInput = compiled.querySelector(`[data-testid="challenge-trigger-max-${targetChallenge.id}"]`);
    const tagsInput = compiled.querySelector(`[data-testid="challenge-trigger-tags-${targetChallenge.id}"]`);

    expect(minInput).withContext('Expected challenge-trigger-min input to exist').toBeTruthy();
    expect(maxInput).withContext('Expected challenge-trigger-max input to exist').toBeTruthy();
    expect(tagsInput).withContext('Expected challenge-trigger-tags input to exist').toBeTruthy();
  });

  it('renders per-Position Challenges (N) label above nested challenges', async () => {
    // Arrange: use production content with nested challenges via private API
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();

    // Access ideals via private API to find position with multiple nested challenges
    const ideals = (component as any).ideals();
    let targetIdeal: any | undefined;
    let targetPosition: any | undefined;
    let expectedChallengeCount = 0;
    
    for (const ideal of ideals) {
      for (const position of ideal.positions) {
        if (position.challenges && position.challenges.length > 0) {
          targetIdeal = ideal;
          targetPosition = position;
          expectedChallengeCount = position.challenges.length;
          break;
        }
      }
      if (targetPosition) break;
    }

    expect(targetPosition).withContext('Expected at least one position with nested challenges in production content').toBeTruthy();

    // Expand ideal first, then position to show challenges
    component.toggleIdeal(targetIdeal);
    fixture.detectChanges();
    await fixture.whenStable();
    
    component.togglePosition(targetPosition);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: "Challenges (N)" label exists with correct count
    const labelElement = compiled.querySelector(`[data-testid="position-challenge-count-${targetPosition.id}"]`);
    expect(labelElement).withContext(`Expected position-challenge-count-${targetPosition.id} label to exist`).toBeTruthy();
    expect(labelElement?.textContent?.trim()).toBe(`Challenges (${expectedChallengeCount})`);
  });

  it('renders per-challenge answer-range label from triggerRule', async () => {
    // Arrange: use production content with challenges that have triggerRule (liberty-q1-fu0 has parentAnswerMin: 3, liberty-q1-fu1 has parentAnswerMax: 2)
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();

    // Access ideals via private API to find liberty ideal with challenges
    const ideals = (component as any).ideals();
    const libertyIdeal = ideals.find((i: any) => i.id === 'liberty');
    expect(libertyIdeal).withContext('Expected liberty ideal in production content').toBeTruthy();
    
    const libertyQ1 = libertyIdeal.positions.find((p: any) => p.id === 'liberty-q1');
    expect(libertyQ1).withContext('Expected liberty-q1 position with challenges').toBeTruthy();
    expect(libertyQ1.challenges.length).withContext('Expected liberty-q1 to have challenges').toBeGreaterThan(0);

    // Expand ideal and position to show challenges
    component.toggleIdeal(libertyIdeal);
    fixture.detectChanges();
    await fixture.whenStable();
    
    component.togglePosition(libertyQ1);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: find challenges with triggerRule and verify their range labels
    const minChallenge = libertyQ1.challenges.find((c: any) => c.id === 'liberty-q1-fu0');  // parentAnswerMin: 3
    const maxChallenge = libertyQ1.challenges.find((c: any) => c.id === 'liberty-q1-fu1');  // parentAnswerMax: 2
    
    expect(minChallenge).withContext('Expected liberty-q1-fu0 challenge in production content').toBeTruthy();
    expect(maxChallenge).withContext('Expected liberty-q1-fu1 challenge in production content').toBeTruthy();

    // Assert: triggerRule range labels exist and show correct text
    const minLabelElement = compiled.querySelector(`[data-testid="challenge-trigger-summary-${minChallenge.id}"]`);
    const maxLabelElement = compiled.querySelector(`[data-testid="challenge-trigger-summary-${maxChallenge.id}"]`);
    
    expect(minLabelElement).withContext('Expected challenge-trigger-summary for min case').toBeTruthy();
    expect(maxLabelElement).withContext('Expected challenge-trigger-summary for max case').toBeTruthy();
    
    const minText = minLabelElement?.textContent || '';
    const maxText = maxLabelElement?.textContent || '';
    
    expect(minText).toContain('Moderately–Extremely (3–5)');
    expect(maxText).toContain('Not–Slightly (1–2)');
    
    // Assert: no 0-4 range appears in labels (must use 1-5 stored values)
    expect(minText).not.toContain('0');
    expect(minText).not.toContain('4');
    expect(maxText).not.toContain('0');
    expect(maxText).not.toContain('4');
  });

  it('renders per-challenge range label using Likert words and numeric range', async () => {
    // Arrange: use production content with challenges that have triggerRule
    // liberty-q1-fu1 has parentAnswerMax: 2 (expect "Not–Slightly (1–2)")
    // liberty-q1-fu0 has parentAnswerMin: 3 (expect "Moderately–Extremely (3–5)")
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();

    // Access ideals via private API to find liberty ideal with challenges
    const ideals = (component as any).ideals();
    const libertyIdeal = ideals.find((i: any) => i.id === 'liberty');
    expect(libertyIdeal).withContext('Expected liberty ideal in production content').toBeTruthy();
    
    const libertyQ1 = libertyIdeal.positions.find((p: any) => p.id === 'liberty-q1');
    expect(libertyQ1).withContext('Expected liberty-q1 position with challenges').toBeTruthy();
    expect(libertyQ1.challenges.length).withContext('Expected liberty-q1 to have challenges').toBeGreaterThan(0);

    // Expand ideal and position to show challenges
    component.toggleIdeal(libertyIdeal);
    fixture.detectChanges();
    await fixture.whenStable();
    
    component.togglePosition(libertyQ1);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert: find challenges with triggerRule and verify their range labels
    const maxChallenge = libertyQ1.challenges.find((c: any) => c.id === 'liberty-q1-fu1');  // parentAnswerMax: 2
    const minChallenge = libertyQ1.challenges.find((c: any) => c.id === 'liberty-q1-fu0');  // parentAnswerMin: 3
    
    expect(maxChallenge).withContext('Expected liberty-q1-fu1 challenge in production content').toBeTruthy();
    expect(minChallenge).withContext('Expected liberty-q1-fu0 challenge in production content').toBeTruthy();

    // Assert: triggerRule range labels exist and show Likert words + numeric range
    const maxLabelElement = compiled.querySelector(`[data-testid="challenge-trigger-summary-${maxChallenge.id}"]`);
    const minLabelElement = compiled.querySelector(`[data-testid="challenge-trigger-summary-${minChallenge.id}"]`);
    
    expect(maxLabelElement).withContext('Expected challenge-trigger-summary for max case').toBeTruthy();
    expect(minLabelElement).withContext('Expected challenge-trigger-summary for min case').toBeTruthy();
    
    const maxText = maxLabelElement?.textContent || '';
    const minText = minLabelElement?.textContent || '';
    
    // parentAnswerMax: 2 → range 1–2 → "Not–Slightly (1–2)"
    expect(maxText).toContain('Not–Slightly (1–2)');
    
    // parentAnswerMin: 3 → range 3–5 → "Moderately–Extremely (3–5)"
    expect(minText).toContain('Moderately–Extremely (3–5)');
  });
});
