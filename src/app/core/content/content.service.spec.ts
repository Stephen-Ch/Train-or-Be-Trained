/**
 * @human ContentService V2 tests: JSON loading, state shape, and error handling
 * @proves ContentService loads V2 content, exposes V2ContentState, and reports load failures
 * @lastTouched V2 rewrite
 */
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ContentService
      ]
    });
    service = TestBed.inject(ContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state with loading true', () => {
    const state = service.state();
    expect(state.loading).toBe(true);
    expect(state.content).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should load V2 content from JSON successfully', async () => {
    await service.loadContent();
    const state = service.state();

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.content).not.toBeNull();
    expect(state.content!.controls.length).toBeGreaterThan(0);
    expect(state.content!.version).toBeTruthy();
    expect(state.content!.universalGuardrails).toBeTruthy();
  });

  it('should have exactly 5 controls', async () => {
    await service.loadContent();
    const state = service.state();
    expect(state.content!.controls.length).toBe(5);
  });

  it('should have A/B/C options on every control', async () => {
    await service.loadContent();
    const state = service.state();
    for (const control of state.content!.controls) {
      expect(Object.keys(control.output).sort()).toEqual(['A', 'B', 'C']);
      for (const q of control.questions) {
        expect(Object.keys(q.options).sort()).toEqual(['A', 'B', 'C']);
      }
    }
  });

  it('should handle network errors gracefully', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('Network error')));

    await service.loadContent();
    const state = service.state();

    expect(state.loading).toBe(false);
    expect(state.error).toBeTruthy();
    expect(state.content).toBeNull();
  });

  it('should handle HTTP error responses gracefully', async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve(new Response('Not Found', { status: 404, statusText: 'Not Found' }))
    );

    await service.loadContent();
    const state = service.state();

    expect(state.loading).toBe(false);
    expect(state.error).toBeTruthy();
    expect(state.content).toBeNull();
  });
});
