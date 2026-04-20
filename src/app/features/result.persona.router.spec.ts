import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { ResultComponent } from './result.component';
import { SessionStore } from '../core/session/session.store';

describe('Result Persona Preview (BUG-RAWLS-012)', () => {
  let component: ResultComponent;
  let fixture: ComponentFixture<ResultComponent>;
  let sessionStore: SessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { persona: '1' }
            },
            queryParams: of({ persona: '1' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
    sessionStore = TestBed.inject(SessionStore);
  });

  it('should show persona preview when persona=1 query param is present in dev mode', () => {
    // Setup some answers to trigger persona matching
    sessionStore.recordAnswer('liberty-q0', 5);
    sessionStore.recordAnswer('liberty-q1', 4);
    sessionStore.recordAnswer('liberty-q2', 3);
    sessionStore.recordAnswer('liberty-q3', 2);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const personaHeading = compiled.textContent;

    // FW-RESULTS-001: Persona now shows by default; ?persona=1 only adds dev details
    expect(personaHeading).toContain('Your Closest Match');
    expect(personaHeading).toContain('Dev mode: Vector'); // Dev-only detail shown when persona=1
  });
});

describe('Result Persona Preview WITHOUT query param (BUG-RAWLS-012)', () => {
  let component: ResultComponent;
  let fixture: ComponentFixture<ResultComponent>;
  let sessionStore: SessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {}
            },
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
    sessionStore = TestBed.inject(SessionStore);
  });

  it('should NOT show persona preview when persona query param is missing', () => {
    // Setup answers
    sessionStore.recordAnswer('liberty-q0', 5);
    sessionStore.recordAnswer('liberty-q1', 4);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    // Without persona=1, should NOT show the preview block
    expect(compiled.textContent).not.toContain('Your Persona (Preview)');
  });
});

