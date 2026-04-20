/**
 * @human Tests question rendering, option selection, follow-up flow, route resume behavior, ideal completion markers, hidden-position exclusion gating, exact intra-ideal resume from storage, resume pointer updates during progression, followup answers independent from TLQ answers (no id collision / no preselect), Continue navigation, and importance scale detection
 * @proves QuestionComponent displays options, handles phase transitions, respects persisted session on route, marks ideals complete when finished, resumes to exact phase/tlqId/followupIndex from storage, continuously updates resume pointer during user progression, followups use distinct answer namespace from TLQs, ignores hidden positions for completion counts, navigates correctly, shows importance scale for "How important is..." questions
 * @lastTouched 2025-12-23
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { QuestionComponent } from './question.component';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { ContentState } from '../core/content/types';

describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;
  let router: Router;
  let sessionStore: SessionStore;
  let contentService: ContentService;
  let paramsSubject: BehaviorSubject<{ id: string; tlqId?: string }>;
  let queryParamsSubject: BehaviorSubject<Record<string, unknown>>;

  beforeEach(async () => {
    sessionStorage.clear();
  paramsSubject = new BehaviorSubject<{ id: string; tlqId?: string }>({ id: 'A' });
  queryParamsSubject = new BehaviorSubject<Record<string, unknown>>({});

    await TestBed.configureTestingModule({
      imports: [QuestionComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject,
            queryParams: queryParamsSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sessionStore = TestBed.inject(SessionStore);
    contentService = TestBed.inject(ContentService);
    
    // Mock content data with pipeline-style followUps (each followUp.id is a standalone option)
    const mockState: ContentState = {
      categories: [
        {
          id: 'A',
          name: 'Justice & Fairness',
          description: 'Test category',
          quote: 'Test quote',
          followUps: [
            { id: 'A-q0', statement: 'Even hateful or deeply offensive speech should remain legal.' },
            { id: 'A-q1', statement: 'Tuition-free access should extend through college and vocational training.' },
            { id: 'A-q2', statement: 'Individuals should have strong digital privacy from companies.' }
          ]
        },
        {
          id: 'B',
          name: 'Economic Security',
          description: 'B desc',
          quote: 'B quote',
          followUps: [
            { id: 'B-q0', statement: 'Redistributive policies like higher taxes and UBI are necessary for justice.' }
          ]
        }
      ],
      likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false,
      error: null
    };
    spyOn(contentService, 'state').and.returnValue(mockState as any);
    
    // Setup session with categories selected
    sessionStore.selectCategories(['A', 'B']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render top-level question cards with likert inputs', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const cards = compiled.querySelectorAll('[data-testid^="tlq-card-"]');
    expect(cards.length).toBe(3);

    const likertInputs = cards[0].querySelectorAll('input[data-testid^="likert-A-q0-value-"]');
    expect(likertInputs.length).toBe(5);

    const likertOrder = Array.from(likertInputs).map(input => input.getAttribute('data-testid'));
    expect(likertOrder).toEqual([
      'likert-A-q0-value-1',
      'likert-A-q0-value-2',
      'likert-A-q0-value-3',
      'likert-A-q0-value-4',
      'likert-A-q0-value-5'
    ]);

    const axisHint = cards[0].querySelector('[data-testid="likert-axis-A-q0"]');
    expect(axisHint?.textContent?.trim()).toBe('Disagree | Agree');

    const likertGroup = cards[0].querySelector('[data-testid="likert-group-A-q0"]') as HTMLElement;
    expect(likertGroup).toBeTruthy();
    expect(likertGroup.classList.contains('flex')).toBeTrue();
    expect(likertGroup.classList.contains('flex-row')).toBeTrue();

    const captions = Array.from(likertGroup.querySelectorAll('label span')).map(span => span.textContent?.trim() ?? '');
    expect(captions.length).toBe(5);
    expect(captions[0]).toBe('Strongly Disagree');
    expect(captions[4]).toBe('Strongly Agree');
    expect(captions.slice(1, 4).every(text => text === '')).toBeTrue();

    const continueBtn = compiled.querySelector('[data-testid="continue"]') as HTMLButtonElement;
    expect(continueBtn.disabled).toBe(true);
  });

  it('should keep continue disabled until all top-level questions answered', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    component.onTopLevelAnswerChange('A-q0', 3);
    fixture.detectChanges();

    const continueBtn = compiled.querySelector('[data-testid="continue"]') as HTMLButtonElement;
    expect(continueBtn.disabled).toBe(true);

    component.onTopLevelAnswerChange('A-q1', 4);
    component.onTopLevelAnswerChange('A-q2', 2);
    fixture.detectChanges();

    expect(continueBtn.disabled).toBe(false);
  });

  it('should ignore hidden top-level positions when enforcing completion requirements', () => {
    const stateSpy = contentService.state as unknown as jasmine.Spy;
    stateSpy.and.returnValue({
      categories: [
        {
          id: 'A',
          name: 'Justice & Fairness',
          description: 'Test category',
          quote: 'Test quote',
          followUps: [
            { id: 'A-q0', statement: 'Visible position' },
            { id: 'A-q1', statement: 'Hidden position', hidden: true }
          ]
        }
      ],
      likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false,
      error: null
    } as ContentState);
    component.phase.set('followUps');
    component.phase.set('chooseOption');
    fixture.detectChanges();

    expect(component.options()).toEqual(['A-q0']);

    component.onTopLevelAnswerChange('A-q0', 4);
    fixture.detectChanges();

    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
    expect(continueBtn.disabled).toBe(false);
  });

  it('should display statements for top-level questions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstStatement = compiled.querySelector('[data-testid="tlq-statement-A-q0"]');

    expect(firstStatement).toBeTruthy();
  expect(firstStatement?.textContent?.trim()).toBe('Even hateful or deeply offensive speech should remain legal.');
  });

  it('should navigate to follow-ups route after answering all top-level questions', () => {
    component.onTopLevelAnswerChange('A-q0', 3);
    component.onTopLevelAnswerChange('A-q1', 4);
    component.onTopLevelAnswerChange('A-q2', 2);
    fixture.detectChanges();

    spyOn(router, 'navigate');

    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
    continueBtn.click();

    expect(router.navigate).toHaveBeenCalledWith(['/q', 'A', 'followups', 'A-q0']);
  });

  it('should display category header and quote', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('[data-testid="category-header"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="category-quote"]')).toBeTruthy();
  });

  it('should display progress indicator', () => {
    const progress = fixture.nativeElement.querySelector('[data-testid="progress"]');
    expect(progress).toBeTruthy();
    expect(progress.textContent).toContain('Ideal 1 of 2');
  });

  it('should show category title and Position 0/3 progress before option selection', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('[data-testid="category-title"]');
    const progress = compiled.querySelector('[data-testid="category-progress"]');

    expect(title?.textContent?.trim()).toBe('Justice & Fairness');
    expect(progress?.textContent?.trim()).toBe('Position 0/3');
  });

  it('should update progress to answered follow-ups count', () => {
    component.onTopLevelAnswerChange('A-q0', 4);
    fixture.detectChanges();
    component.onTopLevelAnswerChange('A-q1', 5);
    fixture.detectChanges();

    const progress = fixture.nativeElement.querySelector('[data-testid="category-progress"]');
    expect(progress?.textContent?.trim()).toBe('Position 2/3');
  });

  it('should show next category title with reset progress after switching categories', () => {
    component.onTopLevelAnswerChange('A-q0', 4);
    component.onTopLevelAnswerChange('A-q1', 3);
    component.onTopLevelAnswerChange('A-q2', 5);
    fixture.detectChanges();

  component['currentId'] = 'B';
  component.phase.set('followUps');
  component.phase.set('chooseOption');
  fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('[data-testid="category-title"]');
    const progress = compiled.querySelector('[data-testid="category-progress"]');

    expect(title?.textContent?.trim()).toBe('Economic Security');
    expect(progress?.textContent?.trim()).toBe('Position 0/1');
  });

  it('should disable continue button when not all answered', () => {
    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]');
    expect(continueBtn.disabled).toBe(true);
  });

  it('should enable continue button when all top-level questions answered', () => {
    component.onTopLevelAnswerChange('A-q0', 3);
    component.onTopLevelAnswerChange('A-q1', 4);
    component.onTopLevelAnswerChange('A-q2', 2);
    fixture.detectChanges();

    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]');
    expect(continueBtn.disabled).toBe(false);
  });

  it('should skip question and navigate to next', () => {
    spyOn(router, 'navigate');
    
    const skipBtn = fixture.nativeElement.querySelector('[data-testid="skip"]');
    skipBtn.click();
    
    expect(router.navigate).toHaveBeenCalledWith(['/q', 'B']);
  });

  it('should show importance scale for "How important is..." questions', () => {
    const stateSpy = contentService.state as unknown as jasmine.Spy;
    stateSpy.and.returnValue({
      categories: [
        {
          id: 'C',
          name: 'Test Category',
          description: 'Test',
          quote: 'Test quote',
          followUps: [
            { id: 'C-q0', statement: 'How important is individual freedom to you?' },
            { id: 'C-q1', statement: 'Even hateful speech should remain legal.' }
          ]
        }
      ],
      likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false,
      error: null
    } as ContentState);
    
    component['currentId'] = 'C';
    component.phase.set('followUps');
    component.phase.set('chooseOption');
    sessionStore.selectCategories(['C']);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('[data-testid^="tlq-card-"]');
    
    // First card: importance question
    const importanceAxis = cards[0].querySelector('[data-testid="likert-axis-C-q0"]');
    expect(importanceAxis?.textContent?.trim()).toBe('Not important | Extremely important');
    
    const importanceLabels = cards[0].querySelector('[data-testid="scale-labels"]');
    // Updated for UX-QV2-S2A: concise button-only labels (Not/Slightly/Moderately/Very/Extremely)
    expect(importanceLabels?.textContent).toContain('Not');
    expect(importanceLabels?.textContent).toContain('Moderately');
    expect(importanceLabels?.textContent).toContain('Extremely');
    
    // Second card: agreement statement
    const agreeAxis = cards[1].querySelector('[data-testid="likert-axis-C-q1"]');
    expect(agreeAxis?.textContent?.trim()).toBe('Disagree | Agree');
    
    const agreeLabels = cards[1].querySelector('[data-testid="scale-labels"]');
    expect(agreeLabels?.textContent).toContain('Strongly Disagree');
    expect(agreeLabels?.textContent).toContain('Strongly Agree');
  });

  it('should show importance scale for "How important are..." questions', () => {
    const stateSpy = contentService.state as unknown as jasmine.Spy;
    stateSpy.and.returnValue({
      categories: [
        {
          id: 'D',
          name: 'Test Category',
          description: 'Test',
          quote: 'Test quote',
          followUps: [
            { id: 'D-q0', statement: 'How important are shared traditions and common values to you?' }
          ]
        }
      ],
      likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false,
      error: null
    } as ContentState);
    
    component['currentId'] = 'D';
    component.phase.set('followUps');
    component.phase.set('chooseOption');
    sessionStore.selectCategories(['D']);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const axis = compiled.querySelector('[data-testid="likert-axis-D-q0"]');
    expect(axis?.textContent?.trim()).toBe('Not important | Extremely important');
  });

  xit('should navigate to next question on continue', () => {
    // First, select an option and move to followUps phase
    component.selectedOption.set('A-q0');
    component.phase.set('followUps');
    component.currentFollowUpIndex.set(0);
    fixture.detectChanges();
    
    // Answer all followups (with new ID format, each option has one followUp)
    sessionStore.recordAnswer('A-q0', 3);
    fixture.detectChanges();
    
    spyOn(router, 'navigate');
    
    // Continue after answering the single follow-up
    component.onContinue();
    
    expect(router.navigate).toHaveBeenCalledWith(['/q', 'B']);
  });

  it('should reverse score when reverse=true and user selects 5', () => {
    // Test the reverse scoring logic directly by invoking onAnswerChange
    spyOn(sessionStore, 'recordAnswer');
    
    // Mock a category with reverse followUp
    spyOn(component, 'currentCategory').and.returnValue({
      id: 'A',
      name: 'Test',
      description: 'Test',
      quote: 'Test',
      followUps: [
        { id: 'AF1', statement: 'Regular question', reverse: false },
        { id: 'AF2', statement: 'Reverse question', reverse: true }
      ]
    });
    
    // Set up followups context (required for onAnswerChange to work with namespaced keys)
    component['currentId'] = 'A';
    component.selectedOption.set('AF1');
    component.currentFollowUpIndex.set(0);
    component.phase.set('followUps');
    
    // Test regular scoring (no reverse) - key is namespaced
    component.onAnswerChange('AF1', 5);
    expect(sessionStore.recordAnswer).toHaveBeenCalledWith('fu:A:AF1:0', 5);
    
    // Switch to next followup for reverse test
    component.selectedOption.set('AF2');
    component.currentFollowUpIndex.set(0);
    
    // Test reverse scoring (5 becomes 1)
    component.onAnswerChange('AF2', 5);
    expect(sessionStore.recordAnswer).toHaveBeenCalledWith('fu:A:AF2:0', 1);
  });

  it('should render breadcrumb and single follow-up card for follow-ups route', () => {
    paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const breadcrumb = compiled.querySelector('[data-testid="breadcrumb"]');
  expect(breadcrumb?.textContent?.trim()).toBe('Justice & Fairness > Even hateful or deeply offensive speech should remain… > Challenges');

    const cards = compiled.querySelectorAll('[data-testid="fu-card-A-q0-1"]');
    expect(cards.length).toBe(1);

  const radios = compiled.querySelectorAll('[data-testid^="likert-A-q0-1-value-"]');
  expect(radios.length).toBe(5);

  const followUpStatement = compiled.querySelector('[data-testid="fu-statement-A-q0-1"]');
  expect(followUpStatement?.textContent?.trim()).toBe('Even hateful or deeply offensive speech should remain legal.');

  const followUpAxis = compiled.querySelector('[data-testid="likert-axis-A-q0-1"]');
  expect(followUpAxis?.textContent?.trim()).toBe('Disagree | Agree');

  const followUpGroup = compiled.querySelector('[data-testid="likert-group-A-q0-1"]') as HTMLElement;
  expect(followUpGroup).toBeTruthy();
  expect(followUpGroup.classList.contains('flex')).toBeTrue();
  expect(followUpGroup.classList.contains('flex-row')).toBeTrue();

  const followUpCaptions = Array.from(followUpGroup.querySelectorAll('label span')).map(span => span.textContent?.trim() ?? '');
  expect(followUpCaptions.length).toBe(5);
  expect(followUpCaptions[0]).toBe('Strongly Disagree');
  expect(followUpCaptions[4]).toBe('Strongly Agree');
  expect(followUpCaptions.slice(1, 4).every(text => text === '')).toBeTrue();
  });

  it('should display debug hud when debug query param is set', () => {
    queryParamsSubject.next({ debug: '1' });
    fixture.detectChanges();

    const hud = fixture.nativeElement.querySelector('[data-testid="debug-hud"]');
    expect(hud).toBeTruthy();
  });

  it('should quickfill TLQs and advance when debug quickfill is clicked on top-level view', () => {
    queryParamsSubject.next({ debug: '1' });
    fixture.detectChanges();

    spyOn(router, 'navigate');

    const quickfill = fixture.nativeElement.querySelector('[data-testid="debug-quickfill"]') as HTMLButtonElement;
    quickfill.click();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/q', 'A', 'followups', 'A-q0']);
  });

  it('should quickfill follow-ups and advance to next when debug quickfill is clicked in follow-ups', () => {
    paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
    queryParamsSubject.next({ debug: '1' });
    fixture.detectChanges();

    spyOn(router, 'navigate');

    const quickfill = fixture.nativeElement.querySelector('[data-testid="debug-quickfill"]') as HTMLButtonElement;
    quickfill.click();
    fixture.detectChanges();

    // With new ID format, each option has one followUp, so quickfill navigates to next option route
    expect(router.navigate).toHaveBeenCalledWith(['/q', 'A', 'followups', 'A-q1']);
  });

  it('should advance through follow-ups then navigate to next TLQ', () => {
    paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
    fixture.detectChanges();

    spyOn(router, 'navigate');

    component.onAnswerChange('A-q0', 4);
    fixture.detectChanges();

    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
    continueBtn.click();
    fixture.detectChanges();

    // With new ID format, each option has one followUp, so continue navigates to next option
    expect(router.navigate).toHaveBeenCalledWith(['/q', 'A', 'followups', 'A-q1']);
  });

  it('should navigate to next category after finishing final TLQ follow-ups', () => {
    paramsSubject.next({ id: 'A', tlqId: 'A-q2' });
    fixture.detectChanges();

    spyOn(router, 'navigate');

    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;

    component.onAnswerChange('A-q2', 3);
    fixture.detectChanges();
    continueBtn.click();

    // After finishing last option, should navigate to next category (B), not back to A
    expect(router.navigate).toHaveBeenCalledWith(['/q', 'B']);
  });

  it('should resume at first unanswered follow-up based on stored answers', () => {
    component.onAnswerChange('A-q0', 4);
    fixture.detectChanges();

    paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // With new ID format, A-q0 is answered, so component shows followup-progress 1/1
    const progress = compiled.querySelector('[data-testid="followup-progress"]');
    expect(progress?.textContent?.trim()).toBe('1/1');
  });

  it('should navigate to next category when finishing all follow-ups (P-813 regression)', () => {
    // Arrange: route to last followUp of category A
    paramsSubject.next({ id: 'A', tlqId: 'A-q2' });
    fixture.detectChanges();

    // Answer the followUp so continue is enabled
    component.onAnswerChange('A-q2', 4);
    fixture.detectChanges();

    spyOn(router, 'navigate');

    // Act: click continue (which triggers advanceFollowUps on final option)
    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
    continueBtn.click();

    // Assert: should navigate to next category B (not back to A)
    expect(router.navigate).toHaveBeenCalledWith(['/q', 'B']);
  });


  describe('content loading race condition', () => {
    it('should resolve category from route param when content is available (regression)', () => {
      // Arrange: content with 'liberty' category
      const libertyState: ContentState = {
        categories: [
          {
            id: 'liberty',
            name: 'Liberty',
            description: 'Test',
            quote: 'Test quote',
            followUps: [
              { id: 'liberty-q0', statement: 'Test statement' }
            ]
          }
        ],
        likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        loading: false,
        error: null
      };

      // Update spy to return liberty content
      const stateSpy = contentService.state as unknown as jasmine.Spy;
      stateSpy.and.returnValue(libertyState);

      // Set route to 'liberty'
      paramsSubject.next({ id: 'liberty' });

      // Create fresh component after route and content are set
      sessionStorage.clear();
      const freshFixture = TestBed.createComponent(QuestionComponent);
      const freshComponent = freshFixture.componentInstance;
      freshFixture.detectChanges();

      // Assert: category should resolve to liberty
      expect(freshComponent.currentCategory()).toBeDefined();
      expect(freshComponent.currentCategory()?.id).toBe('liberty');
      expect(freshComponent.currentCategory()?.name).toBe('Liberty');
    });
  });

  describe('route resume + persistence (best UX)', () => {
    /**
     * TD-RAWLS-002 S1A tests: Lock down "best UX" before implementing S2A fix.
     * 
     * Best UX contract:
     * 1. Multi-Ideal session persists across refresh (selectedIds not overwritten)
     * 2. Invalid :id param recovers via getResumeIndex() → navigates to correct category
     * 3. Invalid storage falls back gracefully (navigates to /select)
     */

    // Shared content state for these tests
    const multiCategoryState: ContentState = {
      categories: [
        { id: 'community', name: 'Community', description: 'desc', quote: 'quote', followUps: [{ id: 'community-q0', statement: 'stmt' }] },
        { id: 'equality', name: 'Equality', description: 'desc', quote: 'quote', followUps: [{ id: 'equality-q0', statement: 'stmt' }] },
        { id: 'liberty', name: 'Liberty', description: 'desc', quote: 'quote', followUps: [{ id: 'liberty-q0', statement: 'stmt' }] }
      ],
      likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false,
      error: null
    };

    it('TEST A: persisted multi-Ideal session is NOT overwritten by auto-select on route load', () => {
      // Arrange: Get fresh SessionStore and clear any prior test state BEFORE seeding storage
      const freshSessionStore = TestBed.inject(SessionStore);
      freshSessionStore.selectCategories([]); // Clear any prior test state (this writes to storage)

      // Now seed sessionStorage with desired session state (overwrites the empty state we just wrote)
      sessionStorage.setItem('rawls-session-v1', JSON.stringify({
        v: 1,
        selectedCategoryIds: ['community', 'equality', 'liberty'],
        completedCategoryIds: ['community'],
        answers: { 'community-q0': 3 },
        skipped: []
      }));

      // Re-hydrate after seeding storage (boot-time hydration already happened with empty storage)
      freshSessionStore.hydrateFromStorage();

      // Update content spy to return multi-category content
      const stateSpy = contentService.state as unknown as jasmine.Spy;
      stateSpy.and.returnValue(multiCategoryState);

      // Set route to 'equality' (simulating refresh on /q/equality)
      paramsSubject.next({ id: 'equality' });

      // Act: Create fresh component (simulates cold load / refresh)
      const freshFixture = TestBed.createComponent(QuestionComponent);
      freshFixture.detectChanges();

      // Assert: selectedIds should still be the full multi-Ideal list, NOT just ['equality']
      expect(freshSessionStore.selectedIds()).toEqual(['community', 'equality', 'liberty']);
      // Assert: completedCategoryIds should be restored
      expect(Array.from(freshSessionStore.completedCategoryIds())).toEqual(['community']);
    });

    it('TEST B: invalid :id param navigates to sequence[resumeIndex]', () => {
      // Arrange: Get fresh SessionStore and clear any prior test state BEFORE seeding storage
      const freshSessionStore = TestBed.inject(SessionStore);
      freshSessionStore.selectCategories([]); // Clear any prior test state (this writes to storage)

      // Now seed sessionStorage with desired session state (overwrites the empty state we just wrote)
      sessionStorage.setItem('rawls-session-v1', JSON.stringify({
        v: 1,
        selectedCategoryIds: ['community', 'equality', 'liberty'],
        completedCategoryIds: ['community'], // community complete, equality is next
        answers: { 'community-q0': 3 },
        skipped: []
      }));

      // Re-hydrate after seeding storage
      freshSessionStore.hydrateFromStorage();

      // Update content spy
      const stateSpy = contentService.state as unknown as jasmine.Spy;
      stateSpy.and.returnValue(multiCategoryState);

      // Set route to invalid category ID
      paramsSubject.next({ id: 'nonexistent-category' });

      spyOn(router, 'navigate');

      const freshFixture = TestBed.createComponent(QuestionComponent);
      freshFixture.detectChanges();

      // Assert: should navigate to sequence[resumeIndex] = sequence[1] = 'equality'
      // (sequence is sorted alphabetically: community, equality, liberty)
      // (resumeIndex = 1 because community is completed)
      expect(router.navigate).toHaveBeenCalledWith(['/q', 'equality']);
    });

    it('TEST C: invalid/missing storage falls back to /select', () => {
      // Arrange: No valid session in storage (simulates first visit or corrupted data)
      sessionStorage.setItem('rawls-session-v1', 'INVALID JSON');

      // Update content spy
      const stateSpy = contentService.state as unknown as jasmine.Spy;
      stateSpy.and.returnValue(multiCategoryState);

      // Set route to a category (simulating direct URL visit without prior selection)
      paramsSubject.next({ id: 'liberty' });

      // Act: Create fresh component
      // Reset SessionStore state first (clear prior test state)
      const freshSessionStore = TestBed.inject(SessionStore);
      freshSessionStore.selectCategories([]); // Clear any prior state
      freshSessionStore.hydrateFromStorage(); // Should be no-op due to invalid JSON
      
      spyOn(router, 'navigate');

      const freshFixture = TestBed.createComponent(QuestionComponent);
      freshFixture.detectChanges();

      // Assert: selectedIds should be empty (hydration failed, no auto-select)
      // Component should navigate to /select since no categories selected
      // and we have no valid persisted session
      expect(freshSessionStore.selectedIds()).toEqual([]);
      expect(router.navigate).toHaveBeenCalledWith(['/select']);
    });
  });

  describe('ideal completion markers (best UX)', () => {
    /**
     * TD-RAWLS-002 S1A tests: Lock down that finishing an Ideal's last Challenge
     * must call SessionStore.markCategoryComplete(categoryId).
     * 
     * This is required for:
     * 1. True resume (first incomplete Ideal via getResumeIndex)
     * 2. Premium UX (show completion status per Ideal)
     */

    it('TEST A: completing final Challenge marks Ideal complete before navigating to next', () => {
      // Arrange: Select categories A and B, route to last followUp of A
      sessionStore.selectCategories(['A', 'B']);
      paramsSubject.next({ id: 'A', tlqId: 'A-q2' }); // Last TLQ in category A
      fixture.detectChanges();

      // Answer the final followUp so continue is enabled
      component.onAnswerChange('A-q2', 4);
      fixture.detectChanges();

      // Spy on markCategoryComplete and navigate
      const markCompleteSpy = spyOn(sessionStore, 'markCategoryComplete');
      spyOn(router, 'navigate');

      // Act: Click continue (triggers advanceFollowUps → navigateNext)
      const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
      continueBtn.click();

      // Assert: markCategoryComplete('A') called exactly once
      expect(markCompleteSpy).toHaveBeenCalledTimes(1);
      expect(markCompleteSpy).toHaveBeenCalledWith('A');

      // Assert: navigates to next category B
      expect(router.navigate).toHaveBeenCalledWith(['/q', 'B']);
    });

    it('TEST B: completing final Challenge of last Ideal routes to /review and marks complete', () => {
      // Arrange: Select only category A (single Ideal), route to last followUp
      sessionStore.selectCategories(['A']);
      paramsSubject.next({ id: 'A', tlqId: 'A-q2' }); // Last TLQ in category A
      fixture.detectChanges();

      // Answer the final followUp so continue is enabled
      component.onAnswerChange('A-q2', 4);
      fixture.detectChanges();

      // Spy on markCategoryComplete and navigate
      const markCompleteSpy = spyOn(sessionStore, 'markCategoryComplete');
      spyOn(router, 'navigate');

      // Act: Click continue (triggers advanceFollowUps → navigateNext → /review)
      const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
      continueBtn.click();

      // Assert: markCategoryComplete('A') called exactly once
      expect(markCompleteSpy).toHaveBeenCalledTimes(1);
      expect(markCompleteSpy).toHaveBeenCalledWith('A');

      // Assert: navigates to /review (last Ideal complete → all done)
      expect(router.navigate).toHaveBeenCalledWith(['/review']);
    });
  });

  describe('intra-ideal exact resume (best UX)', () => {
    /**
     * US-003 S1A tests: Lock down "exact intra-Ideal resume" after refresh.
     * 
     * Resume pointer contract (persisted in rawls-session-v1):
     * resume: {
     *   categoryId: string,
     *   phase: 'positions' | 'challenges',
     *   tlqId: string | null,       // null when phase === 'positions'
     *   followupIndex: number | null // null when phase === 'positions', >= 0 when 'challenges'
     * }
     * 
     * Best UX contract:
     * 1. resume.phase === 'positions' → stay on /q/:id (Positions phase)
     * 2. resume.phase === 'challenges' → navigate to /q/:id/followups/:tlqId
     * 3. resume.followupIndex is applied (exact followup displayed)
     */

    // Shared content state for these tests
    const multiCategoryState: ContentState = {
      categories: [
        { 
          id: 'fairness', 
          name: 'Fairness', 
          description: 'desc', 
          quote: 'quote', 
          followUps: [
            { id: 'fairness-q0', statement: 'Fairness question 0' },
            { id: 'fairness-q1', statement: 'Fairness question 1' },
            { id: 'fairness-q2', statement: 'Fairness question 2' },
            { id: 'fairness-q3', statement: 'Fairness question 3' }
          ] 
        },
        { 
          id: 'liberty', 
          name: 'Liberty', 
          description: 'desc', 
          quote: 'quote', 
          followUps: [
            { id: 'liberty-q0', statement: 'Liberty question 0' }
          ] 
        }
      ],
      likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false,
      error: null
    };

    it('TEST A: resume.categoryId mismatch causes resume pointer to be ignored (positions phase)', () => {
      // Arrange: Clear prior state BEFORE seeding storage
      const freshSessionStore = TestBed.inject(SessionStore);
      freshSessionStore.selectCategories([]);

      // Seed sessionStorage with resume pointer for DIFFERENT category (liberty)
      // but route to fairness. Component should NOT use liberty's resume pointer.
      sessionStorage.setItem('rawls-session-v1', JSON.stringify({
        v: 1,
        selectedCategoryIds: ['fairness', 'liberty'],
        completedCategoryIds: [],
        answers: { 'liberty-q0': 4 }, // Liberty has answers (was in challenges)
        skipped: [],
        resume: {
          categoryId: 'liberty', // Resume pointer for liberty, not fairness
          phase: 'challenges',
          tlqId: 'liberty-q0',
          followupIndex: 0
        }
      }));

      // Re-hydrate after seeding storage
      freshSessionStore.hydrateFromStorage();

      // Update content spy
      const stateSpy = contentService.state as unknown as jasmine.Spy;
      stateSpy.and.returnValue(multiCategoryState);

      // Set route to fairness (NOT liberty)
      paramsSubject.next({ id: 'fairness' });

      spyOn(router, 'navigate');

      // Act: Create fresh component
      const freshFixture = TestBed.createComponent(QuestionComponent);
      freshFixture.detectChanges();
      const freshComponent = freshFixture.componentInstance;

      // Assert: Component should be in chooseOption/positions phase for FAIRNESS
      // (resume pointer is for liberty, which should be ignored)
      expect(freshComponent.phase()).toBe('chooseOption');

      // Assert: Should NOT redirect to liberty's challenges route
      expect(router.navigate).not.toHaveBeenCalledWith(['/q', 'liberty', 'followups', 'liberty-q0']);

      // Assert: The component must READ the resume pointer to know to ignore it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resumePointer = (freshSessionStore as any).getResumePointer?.();
      expect(resumePointer).toBeDefined();
      expect(resumePointer?.categoryId).toBe('liberty');
    });

    it('TEST B: resume to Challenges route when resume.phase === "challenges"', () => {
      // Arrange: Clear prior state BEFORE seeding storage
      const freshSessionStore = TestBed.inject(SessionStore);
      freshSessionStore.selectCategories([]);

      // Seed sessionStorage with resume pointer indicating Challenges phase
      sessionStorage.setItem('rawls-session-v1', JSON.stringify({
        v: 1,
        selectedCategoryIds: ['fairness', 'liberty'],
        completedCategoryIds: [],
        answers: { 'fairness-q0': 4, 'fairness-q1': 3, 'fairness-q2': 5, 'fairness-q3': 2 }, // Positions answered
        skipped: [],
        resume: {
          categoryId: 'fairness',
          phase: 'challenges',
          tlqId: 'fairness-q1',
          followupIndex: 0
        }
      }));

      // Re-hydrate after seeding storage
      freshSessionStore.hydrateFromStorage();

      // Update content spy
      const stateSpy = contentService.state as unknown as jasmine.Spy;
      stateSpy.and.returnValue(multiCategoryState);

      // Set route to fairness (simulating refresh on /q/fairness — NOT the followups route)
      paramsSubject.next({ id: 'fairness' });

      spyOn(router, 'navigate');

      // Act: Create fresh component
      const freshFixture = TestBed.createComponent(QuestionComponent);
      freshFixture.detectChanges();

      // Assert: Should navigate to the exact Challenges route /q/fairness/followups/fairness-q1
      expect(router.navigate).toHaveBeenCalledWith(['/q', 'fairness', 'followups', 'fairness-q1']);
    });

    it('TEST C: resume followupIndex is applied (exact followup displayed)', () => {
      // Arrange: Clear prior state BEFORE seeding storage
      const freshSessionStore = TestBed.inject(SessionStore);
      freshSessionStore.selectCategories([]);

      // Seed sessionStorage with resume pointer at followupIndex 2
      sessionStorage.setItem('rawls-session-v1', JSON.stringify({
        v: 1,
        selectedCategoryIds: ['fairness', 'liberty'],
        completedCategoryIds: [],
        answers: { 'fairness-q0': 4, 'fairness-q1': 3, 'fairness-q2': 5, 'fairness-q3': 2 },
        skipped: [],
        resume: {
          categoryId: 'fairness',
          phase: 'challenges',
          tlqId: 'fairness-q0',
          followupIndex: 2
        }
      }));

      // Re-hydrate after seeding storage
      freshSessionStore.hydrateFromStorage();

      // Update content spy
      const stateSpy = contentService.state as unknown as jasmine.Spy;
      stateSpy.and.returnValue(multiCategoryState);

      // Set route directly to the followups route (simulating deep link or redirect)
      paramsSubject.next({ id: 'fairness', tlqId: 'fairness-q0' });

      // Act: Create fresh component
      const freshFixture = TestBed.createComponent(QuestionComponent);
      freshFixture.detectChanges();
      const freshComponent = freshFixture.componentInstance;

      // Assert: Component should be in followUps phase
      expect(freshComponent.phase()).toBe('followUps');

      // Assert: selectedOption should be set to the tlqId
      expect(freshComponent.selectedOption()).toBe('fairness-q0');

      // Assert: currentFollowUpIndex should be 2 (the exact followup)
      expect(freshComponent.currentFollowUpIndex()).toBe(2);
    });
  });

  describe('resume pointer updates during progression (no corners)', () => {
    /**
     * US-003B S1A tests: Lock down that resume pointer is updated on EVERY progression step.
     * 
     * Best UX contract (exact resume):
     * 1. Entering followups sets resume.phase='challenges' with tlqId + followupIndex
     * 2. Advancing followups updates followupIndex
     * 3. Moving to next TLQ updates tlqId and resets followupIndex
     * 4. Returning to positions sets resume.phase='positions' and clears tlqId/followupIndex
     * 5. Navigating to next category updates resume.categoryId appropriately
     */

    it('TEST A: entering followups sets resume pointer to challenges', () => {
      // Arrange: Answer all TLQs so Continue is enabled
      component.onTopLevelAnswerChange('A-q0', 3);
      component.onTopLevelAnswerChange('A-q1', 4);
      component.onTopLevelAnswerChange('A-q2', 2);
      fixture.detectChanges();

      // Spy on setResumePointer
      const setResumePointerSpy = spyOn(sessionStore, 'setResumePointer');
      spyOn(router, 'navigate');

      // Act: Click Continue to enter followups
      const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
      continueBtn.click();

      // Assert: setResumePointer called with challenges phase and first TLQ
      expect(setResumePointerSpy).toHaveBeenCalledWith({
        categoryId: 'A',
        phase: 'challenges',
        tlqId: 'A-q0',
        followupIndex: 0
      });
    });

    it('TEST B: advancing followups updates followupIndex', () => {
      // Arrange: Override mock to have multiple followups for A-q0
      // This tests the case where we advance WITHIN the same TLQ
      const multiFollowupMock = {
        categories: [
          {
            id: 'A',
            name: 'Justice & Fairness',
            description: 'Test category',
            quote: 'Test quote',
            followUps: [
              { id: 'A-q0', statement: 'First followup for A-q0' },
              { id: 'A-q0', statement: 'Second followup for A-q0' },
              { id: 'A-q1', statement: 'Followup for A-q1' }
            ]
          },
          { id: 'B', name: 'B', description: 'B', quote: 'B', followUps: [{ id: 'B-q0', statement: 'B stmt' }] }
        ],
        likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        loading: false,
        error: null
      };
      const stateSpy = contentService.state as unknown as jasmine.Spy;
      stateSpy.and.returnValue(multiFollowupMock as any);

      // Navigate to followups phase for A-q0
      paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
      fixture.detectChanges();

      expect(component.phase()).toBe('followUps');
      expect(component.currentFollowUpIndex()).toBe(0);

      // Answer current followup (first of two)
      component.onAnswerChange('A-q0', 4);
      fixture.detectChanges();

      // Spy on setResumePointer
      const setResumePointerSpy = spyOn(sessionStore, 'setResumePointer');

      // Act: Click Continue to advance to next followup within same TLQ
      const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
      continueBtn.click();

      // Assert: setResumePointer called with incremented followupIndex (still A-q0)
      expect(setResumePointerSpy).toHaveBeenCalledWith({
        categoryId: 'A',
        phase: 'challenges',
        tlqId: 'A-q0',
        followupIndex: 1
      });
    });

    it('TEST C: moving to next TLQ resets followupIndex and updates tlqId', () => {
      // Arrange: Navigate to followups phase for A-q0
      // The mock has only 1 followUp per TLQ, so finishing A-q0 moves to A-q1
      paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
      fixture.detectChanges();

      // Answer current followup
      component.onAnswerChange('A-q0', 4);
      fixture.detectChanges();

      // Spy on setResumePointer
      const setResumePointerSpy = spyOn(sessionStore, 'setResumePointer');
      spyOn(router, 'navigate');

      // Act: Click Continue to advance (should move to next TLQ since only 1 followup per TLQ)
      const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
      continueBtn.click();

      // Assert: setResumePointer called with next TLQ and followupIndex 0
      expect(setResumePointerSpy).toHaveBeenCalledWith({
        categoryId: 'A',
        phase: 'challenges',
        tlqId: 'A-q1',
        followupIndex: 0
      });
    });

    it('TEST D: returning to positions sets phase=positions and clears tlqId/followupIndex', () => {
      // Arrange: Navigate to followups phase first
      paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
      fixture.detectChanges();

      expect(component.phase()).toBe('followUps');

      // Spy on setResumePointer
      const setResumePointerSpy = spyOn(sessionStore, 'setResumePointer');

      // Act: Navigate back to positions (base route /q/A)
      paramsSubject.next({ id: 'A' });
      fixture.detectChanges();

      // Assert: setResumePointer called with positions phase
      expect(setResumePointerSpy).toHaveBeenCalledWith({
        categoryId: 'A',
        phase: 'positions',
        tlqId: null,
        followupIndex: null
      });
    });

    it('TEST E: navigating to next category sets resume pointer for new category', () => {
      // Arrange: Answer all TLQs for category A and all followups to complete it
      paramsSubject.next({ id: 'A', tlqId: 'A-q2' });
      fixture.detectChanges();

      // Answer the last TLQ followup
      component.onAnswerChange('A-q2', 5);
      fixture.detectChanges();

      // Spy on setResumePointer
      const setResumePointerSpy = spyOn(sessionStore, 'setResumePointer');
      spyOn(router, 'navigate');

      // Act: Click Continue (should navigate to category B since A is exhausted)
      const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
      continueBtn.click();

      // Assert: setResumePointer called for category B with positions phase
      expect(setResumePointerSpy).toHaveBeenCalledWith({
        categoryId: 'B',
        phase: 'positions',
        tlqId: null,
        followupIndex: null
      });
    });
  });

  describe('followup answers are independent from TLQ answers (bugfix contract)', () => {
    /**
     * TD-RAWLS-003 S1A tests: Lock the bug fix for TLQ/followup answer id collision.
     * 
     * Bug behavior (before fix):
     * - TLQ 'liberty-q0' answered in positions phase → answers['liberty-q0'] = 4
     * - Navigate to followups for 'liberty-q0'
     * - Followup UI shows pre-selected answer (because followUp.id === 'liberty-q0')
     * - canContinue() returns true immediately (because answers[followUp.id] exists)
     * 
     * Correct behavior (after fix):
     * - Followup answers use a DISTINCT key from TLQ id (e.g., 'liberty-q0-fu-0')
     * - Followup UI shows NO pre-selection on entry
     * - canContinue() returns false until followup is explicitly answered
     */

    it('TEST A: followups do NOT preselect TLQ answer and Continue is DISABLED', () => {
      // Arrange: Answer all TLQs in positions phase
      component.onTopLevelAnswerChange('A-q0', 4);
      component.onTopLevelAnswerChange('A-q1', 3);
      component.onTopLevelAnswerChange('A-q2', 5);
      fixture.detectChanges();

      // Verify TLQ answers exist
      expect(sessionStore.answers()['A-q0']).toBe(4);

      // Act: Navigate to followups for A-q0
      paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
      fixture.detectChanges();

      expect(component.phase()).toBe('followUps');
      expect(component.selectedOption()).toBe('A-q0');

      // Assert 1: Followup radio buttons should NOT be pre-selected
      const compiled = fixture.nativeElement as HTMLElement;
      const radios = compiled.querySelectorAll('[data-testid^="likert-A-q0-1-value-"]') as NodeListOf<HTMLInputElement>;
      const checkedRadios = Array.from(radios).filter(r => r.checked);
      expect(checkedRadios.length).toBe(0); // No pre-selection

      // Assert 2: Continue button should be DISABLED (followup not answered yet)
      const continueBtn = compiled.querySelector('[data-testid="continue"]') as HTMLButtonElement;
      expect(continueBtn.disabled).toBe(true);

      // Assert 3: canContinue should return false
      expect(component.canContinue()).toBe(false);
    });

    it('TEST B: answering followup enables Continue and uses distinct answer key', () => {
      // Arrange: Answer all TLQs and navigate to followups
      component.onTopLevelAnswerChange('A-q0', 4);
      component.onTopLevelAnswerChange('A-q1', 3);
      component.onTopLevelAnswerChange('A-q2', 5);
      fixture.detectChanges();

      paramsSubject.next({ id: 'A', tlqId: 'A-q0' });
      fixture.detectChanges();

      // Spy on recordAnswer to capture the key used
      const recordAnswerSpy = spyOn(sessionStore, 'recordAnswer').and.callThrough();

      // Act: Answer the followup via Likert click
      const radios = fixture.nativeElement.querySelectorAll('[data-testid^="likert-A-q0-1-value-"]') as NodeListOf<HTMLInputElement>;
      const radio3 = Array.from(radios).find(r => r.getAttribute('data-testid') === 'likert-A-q0-1-value-3');
      expect(radio3).toBeTruthy();
      radio3!.click();
      fixture.detectChanges();

      // Assert 1: recordAnswer was called
      expect(recordAnswerSpy).toHaveBeenCalled();

      // Assert 2: The answer key used is NOT the same as the TLQ id
      // (proving followups use a distinct namespace)
      const callArgs = recordAnswerSpy.calls.mostRecent().args;
      const answerKey = callArgs[0];
      expect(answerKey).not.toBe('A-q0'); // Must use distinct key, not TLQ id

      // Assert 3: Continue should now be ENABLED
      const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue"]') as HTMLButtonElement;
      expect(continueBtn.disabled).toBe(false);
      expect(component.canContinue()).toBe(true);
    });
  });
});