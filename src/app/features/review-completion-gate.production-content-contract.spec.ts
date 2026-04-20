import { ReviewComponent } from '../features/review.component';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { ContentState } from '../core/content/types';
import rawContent from '../../assets/content/rawls-values.generated.json';

/**
 * Contract test: Review completion gate must use actual TLQ IDs from production content.
 * 
 * Root cause of BUG-RAWLS-006: review.component.ts extracted TLQ IDs by splitting
 * followUp IDs on '-' (e.g., 'liberty-q0' → 'liberty'), but TLQ answers are stored
 * with the full ID ('liberty-q0'). This caused "TLQs 0/1" even when all TLQs answered.
 */
describe('Review completion gate (production content contract)', () => {
  let fixture: ComponentFixture<ReviewComponent>;
  let component: ReviewComponent;
  let sessionStore: SessionStore;
  let contentService: ContentService;

  // Get real production content
  const productionCategories = rawContent.categories;
  const libertyCategory = productionCategories.find(c => c.id === 'liberty')!;
  const libertyTlqIds = libertyCategory.followUps.map(f => f.id); // ['liberty-q0', 'liberty-q1', ...]

  // Build mock state with production content shape
  const mockState: ContentState = {
    categories: productionCategories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      quote: '',
      followUps: c.followUps.map(f => ({
        id: f.id,
        text: f.statement
      }))
    })),
    likert5: rawContent.likert5,
    loading: false,
    error: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([])
      ]
    }).compileComponents();

    sessionStore = TestBed.inject(SessionStore);
    contentService = TestBed.inject(ContentService);

    // Mock content state using spyOn pattern (like review.component.spec.ts)
    spyOn(contentService, 'state').and.returnValue(mockState as any);

    // Select liberty category
    sessionStore.selectCategories(['liberty']);

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should recognize TLQs as answered when stored with full TLQ ID (liberty-q0)', () => {
    // Record answers using the actual TLQ IDs (as the question flow does)
    libertyTlqIds.forEach(tlqId => {
      sessionStore.recordAnswer(tlqId, 3); // Answer each TLQ with value 3
    });

    fixture.detectChanges();

    // Get review items
    const reviewItems = component.reviewItems();
    const libertyItem = reviewItems.find(item => item.id === 'liberty');

    expect(libertyItem).toBeTruthy();
    // The key assertion: all TLQs should be counted as answered
    expect(libertyItem!.tlqAnswered).toBe(libertyItem!.tlqTotal);
    expect(libertyItem!.tlqAnswered).toBeGreaterThan(0);
  });

  it('should enable See Results when all TLQs are answered', () => {
    // Answer all TLQs for liberty
    libertyTlqIds.forEach(tlqId => {
      sessionStore.recordAnswer(tlqId, 3);
    });

    fixture.detectChanges();

    // allComplete should be true
    expect(component.allComplete()).toBe(true);
  });

  it('should show correct TLQ count (not just 1)', () => {
    fixture.detectChanges();

    const reviewItems = component.reviewItems();
    const libertyItem = reviewItems.find(item => item.id === 'liberty');

    expect(libertyItem).toBeTruthy();
    // Liberty has 4 TLQs, not 1
    expect(libertyItem!.tlqTotal).toBe(libertyCategory.followUps.length);
    expect(libertyItem!.tlqTotal).toBeGreaterThan(1);
  });
});
