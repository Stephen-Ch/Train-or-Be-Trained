import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { StoreComponent } from './store.component';
import { SessionStore } from '../core/session/session.store';

describe('StoreComponent', () => {
  let component: StoreComponent;
  let fixture: ComponentFixture<StoreComponent>;
  let sessionStore: SessionStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreComponent],
      providers: [
        provideZonelessChangeDetection(),
        SessionStore
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StoreComponent);
    component = fixture.componentInstance;
    sessionStore = TestBed.inject(SessionStore);
    fixture.detectChanges();
  });

  it('should render premium SKU card with disabled buy button', () => {
    const premiumCard = fixture.debugElement.query(By.css('[data-testid="premium-sku"]'));
    const buyButton = fixture.debugElement.query(By.css('[data-testid="buy-premium"]'));
    
    expect(premiumCard).toBeTruthy();
    expect(buyButton.nativeElement.disabled).toBe(true);
  });

  it('should render disabled restore purchases button', () => {
    const restoreButton = fixture.debugElement.query(By.css('[data-testid="restore-purchases"]'));
    
    expect(restoreButton).toBeTruthy();
    expect(restoreButton.nativeElement.disabled).toBe(true);
  });

  it('should render legal links placeholders', () => {
    const privacyLink = fixture.debugElement.query(By.css('[data-testid="privacy-policy"]'));
    const termsLink = fixture.debugElement.query(By.css('[data-testid="terms-service"]'));
    
    expect(privacyLink).toBeTruthy();
    expect(termsLink).toBeTruthy();
  });
});