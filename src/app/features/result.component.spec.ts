/**
 * V2 ResultComponent tests
 * @proves ResultComponent renders document preview and action buttons
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ResultComponent } from './result.component';
import { SessionStore } from '../core/session/session.store';

describe('ResultComponent (V2)', () => {
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

  it('should render document preview element', () => {
    fixture.detectChanges();
    const preview = fixture.nativeElement.querySelector('[data-testid="document-preview"]');
    expect(preview).toBeTruthy();
  });

  it('should render copy button', () => {
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[data-testid="copy-btn"]');
    expect(btn).toBeTruthy();
  });

  it('should render download button', () => {
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[data-testid="download-btn"]');
    expect(btn).toBeTruthy();
  });

  it('should show Loading when content not yet available', () => {
    fixture.detectChanges();
    // No content loaded — document() returns 'Loading…'
    const preview = fixture.nativeElement.querySelector('[data-testid="document-preview"]');
    expect(preview.textContent).toContain('Loading');
  });

  it('startOver should clear answers and navigate home', () => {
    sessionStore.recordAnswer('continuity-q1', 'A');
    component.startOver();
    expect(sessionStore.hasSavedProgress()).toBe(false);
  });
});
