import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStore } from '../../core/session/session.store';

function track(event: string): void {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event);
  }
}

@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-testid="view-intro">

      <!-- Hero -->
      <section class="bg-white border-b border-gray-100 pt-8 pb-16 md:py-16 px-6">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">

          <!-- Text + CTA -->
          <div class="order-2 md:order-2 flex-1 space-y-6 text-center md:text-left">
            <h1 class="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Train or Be Trained.
            </h1>
            <p class="text-xl text-gray-500 italic leading-snug !mt-2">
              AI is like a dog — either you're training it, or it's training you.
            </p>
            <p class="text-lg text-gray-600 leading-relaxed">
              Most of us never teach our AI anything about ourselves.
              So it treats us like everyone else.
            </p>
            <p class="text-lg text-gray-700 font-medium">
              <em>Working With Me</em> fixes that.
            </p>

            <div class="space-y-4">

              @if (!hasProgress()) {
                <label class="inline-flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    data-testid="age-gate"
                    [checked]="ageConfirmed()"
                    (change)="ageConfirmed.set(!ageConfirmed())"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  I confirm I am 13 or older
                </label>
              }

              @if (hasProgress()) {
                <div class="space-y-2">
                  <button
                    data-testid="resume-btn"
                    (click)="resume()"
                    class="w-full sm:w-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl text-lg transition-colors shadow-sm">
                    Resume Where I Left Off
                  </button>
                  <div>
                    <button
                      data-testid="start-fresh-btn"
                      (click)="startFresh()"
                      class="text-sm text-gray-500 hover:text-gray-700 underline">
                      Start over instead
                    </button>
                  </div>
                </div>
              } @else {
                <div>
                  <button
                    data-testid="start-btn"
                    [disabled]="!ageConfirmed()"
                    (click)="start()"
                    class="w-full sm:w-auto inline-block bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-xl text-lg transition-colors shadow-sm">
                    Build My AI Trainer — Free
                  </button>
                  <p class="text-sm text-gray-400 mt-2">5 minutes. Nothing stored. Works with any AI.</p>
                </div>
              }
            </div>
          </div>

          <!-- Hero image -->
          <div class="order-1 md:order-1 flex-shrink-0 w-full md:w-80 lg:w-96">
            <img
              src="assets/images/messy-dog.jpg"
              alt="Cute terrier standing in a mess he made"
              class="w-full h-72 md:h-80 object-cover rounded-2xl shadow-md">
          </div>

        </div>
      </section>

      <!-- The problem -->
      <section class="py-14 px-6 bg-gray-50">
        <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">

          <!-- Problem image -->
          <div class="order-2 md:order-2 flex-shrink-0 w-full md:w-72 rounded-2xl overflow-hidden shadow-sm">
            <img
              src="assets/images/working-dog.jpg"
              alt="Border collie watching over a flock of sheep on moorland"
              class="w-full h-64 object-cover md:object-contain rounded-2xl">
          </div>

          <!-- Problem text -->
          <div class="order-1 md:order-1 flex-1 space-y-5">
            <h2 class="text-2xl font-bold text-gray-900">Your AI doesn't know you.</h2>
            <p class="text-gray-700 leading-relaxed">
              Every conversation starts from zero. It doesn't know that long responses overwhelm you.
              It doesn't know you need one recommendation, not six options. It doesn't know that
              after an interruption you've lost the thread and need to be caught up.
            </p>
            <p class="text-gray-700 leading-relaxed">
              You can tell it these things, over and over, if you remember. Or you can
              <strong>train it to work the way you want.</strong>
            </p>
          </div>

        </div>
      </section>

      <!-- How it works -->
      <section class="py-14 px-6 bg-white border-t border-gray-100">
        <div class="max-w-2xl mx-auto space-y-8">
          <h2 class="text-2xl font-bold text-gray-900">How it works</h2>
          <div class="space-y-6">
            <div class="flex gap-5">
              <span class="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">1</span>
              <div>
                <p class="font-semibold text-gray-900">Answer a few questions about how you work</p>
                <p class="text-sm text-gray-600 mt-1">How you make decisions, what overwhelms you, how you like to receive information.</p>
              </div>
            </div>
            <div class="flex gap-5">
              <span class="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">2</span>
              <div>
                <p class="font-semibold text-gray-900">Get your personal AI training document</p>
                <p class="text-sm text-gray-600 mt-1">Download the file and upload to any AI, or copy-and-paste to try it out</p>
              </div>
            </div>
            <div class="flex gap-5">
              <span class="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">3</span>
              <div>
                <p class="font-semibold text-gray-900">Every conversation starts differently.</p>
                <p class="text-sm text-gray-600 mt-1">Your AI is now trained to work the way you work.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- What it covers -->
      <section class="py-14 px-6 bg-gray-50 border-t border-gray-100">
        <div class="max-w-2xl mx-auto space-y-6">
          <h2 class="text-2xl font-bold text-gray-900">What your document covers</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @for (item of dimensions; track item.label) {
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <p class="font-semibold text-gray-900 text-sm">{{ item.label }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ item.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Works with -->
      <section class="py-12 px-6 bg-white border-t border-gray-100">
        <div class="max-w-2xl mx-auto text-center space-y-4">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Works with</p>
          <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-700 font-medium">
            <span class="px-4 py-2 border border-gray-200 rounded-lg">Claude</span>
            <span class="px-4 py-2 border border-gray-200 rounded-lg">ChatGPT</span>
            <span class="px-4 py-2 border border-gray-200 rounded-lg">Gemini</span>
            <span class="px-4 py-2 border border-gray-200 rounded-lg">Copilot</span>
            <span class="px-4 py-2 border border-gray-200 rounded-lg">Any AI</span>
          </div>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="py-14 px-6 bg-blue-600">
        <div class="max-w-2xl mx-auto text-center space-y-5">
          <h2 class="text-2xl font-bold text-white">Ready to train your AI?</h2>
          <p class="text-blue-100 text-sm">
            5 minutes. Free. Nothing stored — the whole thing runs in your browser.
            No account. No email required.
          </p>
          @if (!hasProgress()) {
            <label class="flex w-full items-center justify-center gap-3 text-sm text-blue-100 cursor-pointer">
              <input
                type="checkbox"
                data-testid="age-gate-footer"
                [checked]="ageConfirmed()"
                (change)="ageConfirmed.set(!ageConfirmed())"
                class="w-4 h-4 rounded border-blue-200 text-blue-600 focus:ring-blue-300">
              I confirm I am 13 or older
            </label>
          }
          <button
            [disabled]="!ageConfirmed() && !hasProgress()"
            (click)="start()"
            class="block w-full sm:w-auto mx-auto bg-white text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-4 px-10 rounded-xl text-lg transition-colors shadow-sm">
            Build My AI Trainer
          </button>
          @if (!ageConfirmed() && !hasProgress()) {
            <p class="text-blue-200 text-xs">Confirm you are 13 or older to continue.</p>
          }
        </div>
      </section>

    </div>
  `
})
export class IntroComponent {
  private sessionStore = inject(SessionStore);
  private router = inject(Router);

  hasProgress = computed(() => this.sessionStore.hasSavedProgress());
  ageConfirmed = signal(false);

  dimensions = [
    { label: 'Session Continuity', description: 'How much context the AI should reconstruct when you return.' },
    { label: 'Scope Management', description: 'Whether the AI should manage tangents or follow where you lead.' },
    { label: 'Information Load', description: 'One thing at a time or the full picture all at once? Paragraphs or bullet points?' },
    { label: 'Challenge Level', description: 'How directly the AI should push back on your plans and ideas.' },
    { label: 'Thinking Rigor', description: 'Whether to ask questions and flag when uncertain, or move fast and trust you to redirect.' },
  ];

  start(): void {
    track('assessment_started');
    this.sessionStore.startFresh();
    this.router.navigate(['/setup']);
  }

  resume(): void {
    this.router.navigate(['/setup']);
  }

  startFresh(): void {
    this.ageConfirmed.set(false);
    this.sessionStore.startFresh();
  }
}
