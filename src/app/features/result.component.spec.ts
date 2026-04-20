import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ResultComponent } from './result.component';
import { SessionStore } from '../core/session/session.store';
import { ShareCardService } from '../shared/share/share-card.service';
import { routes } from '../app.routes';

describe('ResultComponent', () => {
  let component: ResultComponent;
  let fixture: ComponentFixture<ResultComponent>;
  let sessionStore: SessionStore;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ResultComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
    sessionStore = TestBed.inject(SessionStore);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display calculated profile', () => {
    // Mock some answers
    sessionStore.recordAnswer('liberty-q0', 5);
    sessionStore.recordAnswer('equality-q0', 1);
    
    fixture.detectChanges();
    
    const personaPanel = fixture.nativeElement.querySelector('[data-testid="persona-panel"]');
    expect(personaPanel).toBeTruthy();
    expect(personaPanel.textContent).toContain('Closest Match');
  });

  it('should show replay button', () => {
    fixture.detectChanges();
    
    const replayBtn = fixture.nativeElement.querySelector('[data-testid="replay"]');
    expect(replayBtn).toBeTruthy();
    expect(replayBtn.textContent).toContain('Start Over');
  });

  it('should show share results button', () => {
    fixture.detectChanges();
    
    const shareBtn = fixture.nativeElement.querySelector('[data-testid="share-results"]');
    expect(shareBtn).toBeTruthy();
    expect(shareBtn.textContent).toContain('Share Results');
  });

  // BUG-RAWLS-010: Regression test - route must use real ResultComponent, not stub
  it('app.routes should use real ResultComponent with profile rendering', () => {
    const resultRoute = routes.find(r => r.path === 'result');
    expect(resultRoute).toBeTruthy();
    // The routed component must be the real ResultComponent from result.component.ts
    expect(resultRoute!.component).toBe(ResultComponent);
  });

  // FW-RESULTS-001-S1A: persona renders by default (no query param required)
  it('renders persona match on /result by default (no query param)', () => {
    // Arrange: set up answers that produce a known category vector
    sessionStore.recordAnswer('liberty-q0', 5);
    sessionStore.recordAnswer('equality-q0', 1);
    
    // Act: render without query params
    fixture.detectChanges();
    
    // Assert: persona panel is visible by default
    const personaPanel = fixture.nativeElement.querySelector('[data-testid="persona-panel"]');
    expect(personaPanel).toBeTruthy();
  });

  // FW-RESULTS-001-S1B: persona scores using answered-only ideals and shows top ideals explanation
  it('scores personas using answered-only ideals and shows top ideals explanation', () => {
    // Arrange: Answer ONLY 2 ideals (liberty + fairness), leave others unanswered
    sessionStore.recordAnswer('liberty-q0', 5);
    sessionStore.recordAnswer('liberty-q1', 5);
    sessionStore.recordAnswer('fairness-q0', 4);
    sessionStore.recordAnswer('fairness-q1', 4);
    
    // Act: render
    fixture.detectChanges();
    
    // Assert: persona panel shows "Why this match" section
    const whyMatch = fixture.nativeElement.querySelector('[data-testid="why-this-match"]');
    expect(whyMatch).toBeTruthy();
    
    // Assert: explanation lists exactly the answered ideals (liberty + fairness), not missing ideals
    const contributionItems = fixture.nativeElement.querySelectorAll('[data-testid="contribution-item"]');
    expect(contributionItems.length).toBeGreaterThan(0);
    expect(contributionItems.length).toBeLessThanOrEqual(3); // top 3 max
    
    // Verify only answered ideals appear in explanation (liberty or fairness, never equality/community/etc.)
    const contributionText = Array.from(contributionItems).map((el: any) => el.textContent.toLowerCase());
    const hasLiberty = contributionText.some(t => t.includes('liberty'));
    const hasFairness = contributionText.some(t => t.includes('fairness'));
    const hasUnanswered = contributionText.some(t => 
      t.includes('equality') || t.includes('community') || 
      t.includes('prosperity') || t.includes('security') || 
      t.includes('sustainability')
    );
    
    expect(hasLiberty || hasFairness).toBe(true); // At least one answered ideal appears
    expect(hasUnanswered).toBe(false); // No unanswered ideals appear
    
    // Verify user score is displayed (1-5 range from answered ideals)
    const firstItem = contributionItems[0] as HTMLElement;
    expect(firstItem.textContent).toMatch(/[45]/); // Should show score 4 or 5
  });

  // FW-RESULTS-001-S2A: stub profile is NOT shown to users when persona is canonical
  it('does not render stub profile (idealist/moderate/skeptic) when persona is canonical', () => {
    // Arrange: minimal answers producing persona output
    sessionStore.recordAnswer('liberty-q0', 5);
    sessionStore.recordAnswer('liberty-q1', 4);
    sessionStore.recordAnswer('fairness-q0', 3);
    
    // Act: render
    fixture.detectChanges();
    
    // Assert: persona panel is visible
    const personaPanel = fixture.nativeElement.querySelector('[data-testid="persona-panel"]');
    expect(personaPanel).toBeTruthy();
    
    // Assert: stub profile labels are NOT rendered
    const bodyText = fixture.nativeElement.textContent.toLowerCase();
    expect(bodyText).not.toContain('idealist');
    expect(bodyText).not.toContain('moderate');
    expect(bodyText).not.toContain('skeptic');
    
    // Assert: profile headline/card is NOT visible
    const resultHeadline = fixture.nativeElement.querySelector('[data-testid="result-headline"]');
    expect(resultHeadline).toBeFalsy();
  });

  // FW-RESULTS-001-S2B: shows answered-ideal count and low-confidence hint when fewer than 3 ideals answered
  it('shows answered-ideal count and low-confidence hint when fewer than 3 ideals answered', () => {
    // Arrange: Answer exactly 2 ideals (liberty + equality), leave others unanswered
    sessionStore.recordAnswer('liberty-q0', 5);
    sessionStore.recordAnswer('equality-q0', 2);
    
    // Act: render
    fixture.detectChanges();
    
    // Assert: persona panel still renders
    const personaPanel = fixture.nativeElement.querySelector('[data-testid="persona-panel"]');
    expect(personaPanel).toBeTruthy();
    
    // Assert: shows "Based on 2 ideals you answered"
    const bodyText = personaPanel.textContent;
    expect(bodyText).toContain('Based on 2 ideals you answered');
    
    // Assert: shows hint to answer at least 3 ideals
    expect(bodyText).toContain('answer at least 3 ideals');
  });

  // FW-RAWLS-003-S1B: clicking Share Results calls ShareCardService with persona-panel and expected slug
  it('clicking Share Results calls ShareCardService with persona-panel and expected slug', async () => {
    // Arrange: set up ShareCardService spy
    const shareCardService = TestBed.inject(ShareCardService);
    spyOn(shareCardService, 'shareOrDownloadCard').and.resolveTo();
    
    // Arrange: set up answers to produce persona match with known slug
    sessionStore.recordAnswer('liberty-q0', 5);
    sessionStore.recordAnswer('equality-q0', 2);
    
    // Arrange: render component
    fixture.detectChanges();
    
    // Act: click Share Results button
    const shareBtn = fixture.nativeElement.querySelector('[data-testid="share-results"]');
    expect(shareBtn).toBeTruthy();
    shareBtn.click();
    
    // Wait for async shareResults() to complete
    await fixture.whenStable();
    
    // Assert: shareOrDownloadCard was called with correct args
    const expectedSlug = component.personaMatch()?.persona.id || 'unknown';
    expect(shareCardService.shareOrDownloadCard).toHaveBeenCalledOnceWith('persona-panel', expectedSlug);
  });
});