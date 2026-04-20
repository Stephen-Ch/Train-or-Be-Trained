/**
 * V2 IntroComponent tests
 * @proves Intro renders, age gate controls start button, resume shows when progress exists
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { IntroComponent } from './intro.component';
import { SessionStore } from '../../core/session/session.store';

describe('IntroComponent (V2)', () => {
  let component: IntroComponent;
  let fixture: ComponentFixture<IntroComponent>;
  let router: Router;
  let sessionStore: SessionStore;

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [IntroComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: 'setup', component: class {} }])
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the start button', () => {
    const startButton = fixture.debugElement.query(By.css('[data-testid="start-btn"]'));
    expect(startButton).toBeTruthy();
  });

  it('should disable start button before age confirmation', () => {
    const startButton = fixture.debugElement.query(By.css('[data-testid="start-btn"]'));
    expect(startButton.nativeElement.disabled).toBe(true);
  });

  it('should enable start button after age confirmation', () => {
    component.ageConfirmed.set(true);
    fixture.detectChanges();

    const startButton = fixture.debugElement.query(By.css('[data-testid="start-btn"]'));
    expect(startButton.nativeElement.disabled).toBe(false);
  });

  it('should hide resume button when no session progress', () => {
    const resumeButton = fixture.debugElement.query(By.css('[data-testid="resume-btn"]'));
    expect(resumeButton).toBeFalsy();
  });

  it('should show resume button when session has progress', () => {
    sessionStore.recordAnswer('continuity-q1', 'A');
    fixture.detectChanges();

    const resumeButton = fixture.debugElement.query(By.css('[data-testid="resume-btn"]'));
    expect(resumeButton).toBeTruthy();
  });

  it('should navigate to /setup on start', () => {
    component.ageConfirmed.set(true);
    component.start();

    expect(router.navigate).toHaveBeenCalledWith(['/setup']);
  });

  it('should navigate to /setup on resume', () => {
    component.resume();
    expect(router.navigate).toHaveBeenCalledWith(['/setup']);
  });
});
