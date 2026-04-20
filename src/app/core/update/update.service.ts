import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private _updateAvailable = signal(false);
  readonly updateAvailable = this._updateAvailable.asReadonly();

  constructor() {
    this.checkForUpdates();
  }

  private checkForUpdates(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this._updateAvailable.set(true);
      });

      // Also check for waiting service worker
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          this._updateAvailable.set(true);
        }
      });
    }
  }

  activateUpdate(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  }

  showToast(): string {
    return 'New version available! Click to update.';
  }
}

