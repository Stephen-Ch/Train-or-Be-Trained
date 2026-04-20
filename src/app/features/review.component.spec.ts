/**
 * @human ReviewComponent surfaces per-ideal progress and navigation controls
 * @proves Review screen reports accurate position/challenge counts, status pills, edit/resume/results flows
 * @lastTouched 2025-12-25
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { ReviewComponent } from './review.component';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { ContentState } from '../core/content/types';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;
  let router: Router;
  let sessionStore: SessionStore;
  let contentService: ContentService;
  let categoryARequiredPositions: string[];
  let categoryAChallengeIds: string[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sessionStore = TestBed.inject(SessionStore);
    sessionStorage.clear();
    localStorage.removeItem('rawls.veilAcknowledged.v1');
    sessionStore.startFresh();
    contentService = TestBed.inject(ContentService);
    
    const mockState: ContentState = {
      categories: [
        {
          id: 'A',
          name: 'Justice & Fairness',
          description: 'Test category A',
          quote: 'Test quote A',
          followUps: [
            {
              id: 'A-q0',
              text: 'TLQ A-q0',
              challenges: [
                { id: 'A-q0-fu0', title: 'C0', body: 'Body', order: 0 },
                { id: 'A-q0-fu1', title: 'C1', body: 'Body', order: 1 }
              ]
            },
            {
              id: 'A-q1',
              text: 'TLQ A-q1',
              hidden: true,
              challenges: [{ id: 'A-q1-fu0', title: 'Hidden', body: 'Body', order: 0 }]
            },
            {
              id: 'A-q2',
              text: 'TLQ A-q2',
              challenges: [{ id: 'A-q2-fu0', title: 'C2', body: 'Body', order: 0 }]
            },
            { id: 'A-q3', text: 'TLQ A-q3', challenges: [] },
            {
              id: 'A-q4',
              text: 'TLQ A-q4',
              challenges: [{ id: 'A-q4-fu0', title: 'C3', body: 'Body', order: 0 }]
            },
            { id: 'A-q5', text: 'TLQ A-q5', challenges: [] }
          ]
        },
        {
          id: 'B',
          name: 'Liberty & Rights',
          description: 'Test category B',
          quote: 'Test quote B',
          followUps: [
            { id: 'B-q0', text: 'TLQ B-q0' },
            { id: 'B-q1', text: 'TLQ B-q1' },
            { id: 'B-q2', text: 'TLQ B-q2' }
          ]
        }
      ],
      likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false,
      error: null
    };
    spyOn(contentService, 'state').and.returnValue(mockState as any);

    const visibleFollowUps = mockState.categories[0].followUps.filter(f => f.hidden !== true);
    categoryARequiredPositions = visibleFollowUps.slice(0, 4).map(f => f.id);
    categoryAChallengeIds = visibleFollowUps
      .slice(0, 4)
      .flatMap(f => (f.challenges ?? []).map(ch => ch.id));

    sessionStore.selectCategories(['A', 'B']);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show category status and progress', () => {
    categoryARequiredPositions.forEach(id => sessionStore.recordAnswer(id, 4));
    categoryAChallengeIds.forEach(id => sessionStore.recordChallengeAnswer(id, 4));
    sessionStore.recordAnswer('B-q0', 3);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cardA = compiled.querySelector('[data-testid="review-category-card-A"]')!;
    const cardB = compiled.querySelector('[data-testid="review-category-card-B"]')!;

    expect(cardA.querySelector('[data-testid="review-status-A"]')?.textContent?.trim()).toBe('Complete');
    expect(cardA.querySelector('[data-testid="review-progress-A"]')?.textContent?.trim()).toBe(
      `Positions 4/4, Challenges ${categoryAChallengeIds.length}/${categoryAChallengeIds.length}`
    );

    // Category B: 1 Position answered, no required challenges
    expect(cardB.querySelector('[data-testid="review-status-B"]')?.textContent?.trim()).toBe('In Progress');
    const cardBProgress = cardB.querySelector('[data-testid="review-progress-B"]')?.textContent?.trim() ?? '';
    expect(cardBProgress).toBe('Positions 1/3, No challenges');
    expect(cardBProgress.includes('0/0')).toBeFalse();
  });

  it('tracks challenge counts independently from positions', () => {
    categoryARequiredPositions.forEach(id => sessionStore.recordAnswer(id, 5));
    sessionStore.recordChallengeAnswer(categoryAChallengeIds[0], 4);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('[data-testid="review-category-card-A"]')!;

    expect(card.querySelector('[data-testid="review-status-A"]')?.textContent?.trim()).toBe('In Progress');
    expect(card.querySelector('[data-testid="review-progress-A"]')?.textContent?.trim()).toBe(
      `Positions 4/4, Challenges 1/${categoryAChallengeIds.length}`
    );
  });

  it('should support edit, resume, and results navigation', () => {
    categoryARequiredPositions.forEach(id => sessionStore.recordAnswer(id, 4));
    categoryAChallengeIds.forEach(id => sessionStore.recordChallengeAnswer(id, 4));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const navigateSpy = spyOn(router, 'navigate');

    compiled.querySelector('[data-testid="review-edit-A"]')?.dispatchEvent(new Event('click'));
    expect(navigateSpy).toHaveBeenCalledWith(['/q', 'A'], { queryParams: { returnTo: 'review' } });
    navigateSpy.calls.reset();

    // Answer 1 TLQ for B to put it in progress
    sessionStore.recordAnswer('B-q0', 3);
    fixture.detectChanges();

    let resumeBtn = compiled.querySelector('[data-testid="review-resume"]') as HTMLButtonElement;
    expect(resumeBtn.disabled).toBeFalse();
    resumeBtn.click();
    // Should resume to category B, starting at the first unanswered TLQ
    expect(navigateSpy).toHaveBeenCalledWith(['/q', 'B'], { queryParams: { returnTo: 'review' } });
    navigateSpy.calls.reset();

    // Answer all remaining TLQs
    ['B-q1', 'B-q2'].forEach(id => sessionStore.recordAnswer(id, 3));
    fixture.detectChanges();

    const resultsBtn = compiled.querySelector('[data-testid="review-results"]') as HTMLButtonElement;
    expect(resultsBtn.disabled).toBeFalse();
    resultsBtn.click();
    expect(navigateSpy).toHaveBeenCalledWith(['/result']);
  });

  it('shows veil micro nudge and re-opens mindset text in review', () => {
    sessionStore.acknowledgeVeil();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const micro = compiled.querySelector('[data-testid="veil-micro"]');
    const toggle = compiled.querySelector('[data-testid="veil-toggle"]') as HTMLButtonElement;

    expect(micro).toBeTruthy();
    expect(toggle).toBeTruthy();
    expect(compiled.querySelector('[data-testid="veil-box"]')).toBeNull();

    toggle.click();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-testid="veil-box"]')).toBeTruthy();
  });

  it('required challenge count reflects triggerRule filtering (not raw content)', () => {
    // Setup: category with one position and one challenge that should be EXCLUDED by triggerRule
    const mockStateWithTrigger: ContentState = {
      categories: [
        {
          id: 'liberty',
          name: 'Liberty',
          description: 'Free speech ideal',
          quote: 'Quote',
          followUps: [
            {
              id: 'liberty-q0',
              text: 'Position 0',
              challenges: [
                {
                  id: 'liberty-q0-fu0',
                  title: 'Extreme challenge',
                  body: 'Body',
                  order: 0,
                  triggerRule: { parentAnswerMin: 4 }
                }
              ]
            },
            { id: 'liberty-q1', text: 'Position 1', challenges: [] },
            { id: 'liberty-q2', text: 'Position 2', challenges: [] },
            { id: 'liberty-q3', text: 'Position 3', challenges: [] }
          ]
        }
      ],
      likert5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      loading: false,
      error: null
    };
    // Override the existing spy with new mock state
    (contentService.state as any).and.returnValue(mockStateWithTrigger as any);

    sessionStore.selectCategories(['liberty']);
    // User answered 2 (Disagree) on parent position — triggerRule parentAnswerMin: 4 excludes the challenge
    sessionStore.recordAnswer('liberty-q0', 2);
    sessionStore.recordAnswer('liberty-q1', 3);
    sessionStore.recordAnswer('liberty-q2', 3);
    sessionStore.recordAnswer('liberty-q3', 3);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('[data-testid="review-category-card-liberty"]')!;
    const progressText = card.querySelector('[data-testid="review-progress-liberty"]')?.textContent?.trim() ?? '';

    // EXPECT: "No challenges" because the one challenge should be filtered out by triggerRule
    // (parent answer 2 < parentAnswerMin 4)
    expect(progressText).toBe('Positions 4/4, No challenges');
  });
});