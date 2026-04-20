import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { buildAssessmentResult } from '../core/engine/scoring.engine';
import { generateDocument } from '../core/engine/document.generator';

@Component({
  selector: 'app-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 space-y-6" data-testid="view-result">

      <header class="text-center space-y-2">
        <h2 class="text-2xl font-bold text-gray-900">Your Document is Ready</h2>
        <p class="text-gray-600 text-sm">
          Copy the text below and paste it into your AI assistant's custom instructions,
          or download it as a Markdown file.
        </p>
      </header>

      <!-- Export actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          data-testid="copy-btn"
          (click)="copyToClipboard()"
          class="flex-1 py-3 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          {{ copyLabel() }}
        </button>
        <button
          data-testid="download-btn"
          (click)="downloadMarkdown()"
          class="flex-1 py-3 px-5 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
          Download .md
        </button>
        <button
          data-testid="start-over-btn"
          (click)="startOver()"
          class="flex-1 py-3 px-5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Start Over
        </button>
      </div>

      <!-- Where to use it -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
        <p class="font-semibold mb-2">Where to paste it:</p>
        <ul class="space-y-1">
          <li><span class="font-medium">Claude:</span> Settings → Profile → Custom instructions</li>
          <li><span class="font-medium">ChatGPT:</span> Settings → Personalization → Custom instructions</li>
          <li><span class="font-medium">Gemini:</span> Gem settings → Custom instructions</li>
          <li><span class="font-medium">Any AI:</span> Paste at the top of a new conversation</li>
        </ul>
      </div>

      <!-- Document preview -->
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <div class="bg-gray-100 px-4 py-2 text-xs text-gray-500 font-mono border-b border-gray-200">
          working-with-me.md
        </div>
        <pre
          data-testid="document-preview"
          class="p-4 text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto leading-relaxed">{{ document() }}</pre>
      </div>

    </div>
  `
})
export class ResultComponent {
  private sessionStore = inject(SessionStore);
  private contentService = inject(ContentService);
  private router = inject(Router);

  copyLabel = signal('Copy to Clipboard');

  document = computed(() => {
    const categories = this.contentService.state().categories;
    const answers = this.sessionStore.answers();
    const lens = this.sessionStore.lens() ?? 'practical';
    const depth = this.sessionStore.depth() ?? 'quick';

    if (categories.length === 0) return 'Loading…';

    const result = buildAssessmentResult(categories, answers, lens, depth);
    return generateDocument(result);
  });

  copyToClipboard(): void {
    const text = this.document();
    navigator.clipboard.writeText(text).then(() => {
      this.copyLabel.set('Copied!');
      setTimeout(() => this.copyLabel.set('Copy to Clipboard'), 2500);
    }).catch(() => {
      this.copyLabel.set('Copy failed — select text manually');
    });
  }

  downloadMarkdown(): void {
    const text = this.document();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'working-with-me.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  startOver(): void {
    this.sessionStore.startFresh();
    this.router.navigate(['/']);
  }
}
