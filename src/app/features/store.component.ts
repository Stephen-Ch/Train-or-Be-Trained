import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { SessionStore } from '../core/session/session.store';

@Component({
  selector: 'app-store',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-md mx-auto p-6 space-y-6" data-testid="view-store">
      <h1 class="text-2xl font-bold text-center mb-8">Premium Features</h1>
      
      <!-- Premium SKU Card -->
      <div class="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-100" data-testid="premium-sku">
        <h2 class="text-xl font-semibold mb-2">Premium Access</h2>
        <p class="text-gray-600 mb-4">Unlock advanced insights and detailed analysis</p>
        <div class="text-2xl font-bold mb-4">$4.99</div>
        <button 
          class="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed" 
          disabled 
          data-testid="buy-premium">
          Purchase Premium
        </button>
      </div>

      <!-- Restore Purchases -->
      <button 
        class="w-full border border-gray-300 px-4 py-2 rounded disabled:text-gray-400 disabled:cursor-not-allowed" 
        disabled 
        data-testid="restore-purchases">
        Restore Purchases
      </button>

      <!-- Legal Links -->
      <div class="text-center space-y-2 text-sm text-gray-500">
        <a href="#" class="block" data-testid="privacy-policy">Privacy Policy</a>
        <a href="#" class="block" data-testid="terms-service">Terms of Service</a>
      </div>
    </div>
  `
})
export class StoreComponent {
  private sessionStore = inject(SessionStore);
  
  entitlements = this.sessionStore.entitlements;
}