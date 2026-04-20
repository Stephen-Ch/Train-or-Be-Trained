import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { IntroComponent } from './intro.component';
import { SessionStore } from '../../core/session/session.store';

describe('IntroComponent', () => {
  let component: IntroComponent;
  let fixture: ComponentFixture<IntroComponent>;
  let router: Router;
  let sessionStore: SessionStore;

  beforeEach(async () => {
    // Clear sessionStorage before store construction (boot-time hydration)
    sessionStorage.clear();
    
    await TestBed.configureTestingModule({
      imports: [IntroComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'select', component: class {} }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IntroComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sessionStore = TestBed.inject(SessionStore);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render Start and Store buttons', () => {
    const startButton = fixture.debugElement.query(By.css('[data-testid="start-btn"]'));
    const storeButton = fixture.debugElement.query(By.css('[data-testid="store-btn"]'));
    
    expect(startButton).toBeTruthy();
    expect(storeButton).toBeTruthy();
    expect(startButton.nativeElement.getAttribute('aria-label')).toBe('Start the Rawls veil of ignorance survey');
    expect(storeButton.nativeElement.getAttribute('aria-label')).toBe('View premium features in store');
  });

  it('should hide Resume button when no session progress', () => {
    const resumeButton = fixture.debugElement.query(By.css('[data-testid="resume-btn"]'));
    expect(resumeButton).toBeFalsy();
  });

  it('should show Resume button when session has progress', () => {
    sessionStore.selectCategories(['A', 'B']);
    fixture.detectChanges();
    
    const resumeButton = fixture.debugElement.query(By.css('[data-testid="resume-btn"]'));
    expect(resumeButton).toBeTruthy();
    expect(resumeButton.nativeElement.getAttribute('aria-label')).toBe('Resume your survey progress');
  });

  it('should navigate to /select when Start is clicked', () => {
    const startButton = fixture.debugElement.query(By.css('[data-testid="start-btn"]'));
    startButton.nativeElement.click();
    
    expect(router.navigate).toHaveBeenCalledWith(['/select']);
  });
});