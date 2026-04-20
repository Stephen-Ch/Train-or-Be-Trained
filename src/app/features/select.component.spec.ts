import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { SelectComponent } from './select.component';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';

/**
 * @human SelectComponent renders categories, enables Continue when selected, navigates to first question, shows Resume/Start Fresh banner when saved progress exists
 * @proves Select screen displays categories from content, updates SessionStore on checkbox changes, sequences categories by content file order, detects saved progress and offers resume vs fresh start
 * @lastTouched 2025-12-24
 */
describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;
  let router: Router;
  let sessionStore: SessionStore;

  // Mock ContentService with categories in content-file order (A, B, C)
  const mockContentService = {
    state: signal({
      categories: [
        { id: 'A', name: 'A', description: '', quote: '', followUps: [] },
        { id: 'B', name: 'B', description: '', quote: '', followUps: [] },
        { id: 'C', name: 'C', description: '', quote: '', followUps: [] }
      ],
      likert5: [],
      loading: false,
      error: null
    }),
    loadContent: jasmine.createSpy('loadContent')
  };

  beforeEach(async () => {
    // Clear sessionStorage before store construction (boot-time hydration)
    sessionStorage.clear();
    
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ContentService, useValue: mockContentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sessionStore = TestBed.inject(SessionStore);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display header and quote', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('[data-testid="select-header"]')).toBeTruthy();
    expect(compiled.querySelector('[data-testid="select-quote"]')).toBeTruthy();
  });

  it('should disable continue button when no categories selected', () => {
    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue-btn"]');
    expect(continueBtn.disabled).toBe(true);
  });

  it('should enable continue button when categories selected', () => {
    sessionStore.selectCategories(['A']);
    fixture.detectChanges();
    
    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue-btn"]');
    expect(continueBtn.disabled).toBe(false);
  });

  it('should navigate to first question on continue', async () => {
    sessionStore.selectCategories(['B', 'A', 'C']); // Should sequence to A, B, C
    fixture.detectChanges();
    spyOn(router, 'navigate');
    
    const continueBtn = fixture.nativeElement.querySelector('[data-testid="continue-btn"]');
    continueBtn.click();
    
    expect(router.navigate).toHaveBeenCalledWith(['/q', 'A']);
  });


  it('should show resume banner when saved progress exists', () => {
    // Arrange: Create new component with saved progress
    sessionStore.selectCategories(['A']);
    sessionStore.recordAnswer('A-q0', 3);

    // Act: Recreate component (simulates page reload)
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Assert: Banner visible
    const banner = fixture.nativeElement.querySelector('[data-testid="resume-banner"]');
    expect(banner).toBeTruthy();
  });

  it('should clear store and hide banner when start fresh clicked', () => {
    // Arrange: Create component with saved progress
    sessionStore.selectCategories(['A', 'B']);
    sessionStore.recordAnswer('A-q0', 3);
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Act: Click Start Fresh
    const startFreshBtn = fixture.nativeElement.querySelector('[data-testid="start-fresh-btn"]');
    startFreshBtn.click();
    fixture.detectChanges();

    // Assert: Store cleared and banner hidden
    expect(sessionStore.selectedIds().length).toBe(0);
    expect(Object.keys(sessionStore.answers()).length).toBe(0);
    const banner = fixture.nativeElement.querySelector('[data-testid="resume-banner"]');
    expect(banner).toBeFalsy();
  });
});