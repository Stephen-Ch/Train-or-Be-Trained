import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../core/content/content.service';
import { SessionStore } from '../core/session/session.store';
import { buildAssessmentResult } from '../core/engine/scoring.engine';
import { generateDocument } from '../core/engine/document.generator';

function track(event: string): void {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event);
  }
}

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

      <!-- Where to paste it — expandable platform guide -->
      <div class="border border-gray-200 rounded-lg overflow-hidden text-sm">
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <p class="font-semibold text-gray-800">Where to paste it</p>
          <p class="text-gray-500 text-xs mt-0.5">Click your AI to see setup steps.</p>
        </div>

        @for (platform of platforms; track platform.name) {
          <div class="border-b border-gray-100 last:border-b-0">
            <button
              class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              (click)="togglePlatform(platform.name)">
              <span class="font-medium text-gray-800">{{ platform.name }}</span>
              <span class="text-gray-400 text-xs">{{ expandedPlatform() === platform.name ? '▲' : '▼' }}</span>
            </button>
            @if (expandedPlatform() === platform.name) {
              <ol class="px-4 pb-4 space-y-2 text-gray-600 list-none">
                @for (step of platform.steps; track $index) {
                  <li class="flex gap-3">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">{{ $index + 1 }}</span>
                    <span>{{ step }}</span>
                  </li>
                }
              </ol>
            }
          </div>
        }
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

      <!-- Feedback link -->
      <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-4 text-sm text-center space-y-1">
        <p class="font-semibold text-blue-900">Used your document? Tell us what happened.</p>
        <p class="text-blue-700 text-xs">Anonymous · Takes 3 minutes · Helps us improve</p>
        <a
          href="FEEDBACK_FORM_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block mt-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Share feedback
        </a>
      </div>

    </div>
  `
})
export class ResultComponent {
  private sessionStore = inject(SessionStore);
  private contentService = inject(ContentService);
  private router = inject(Router);

  copyLabel = signal('Copy to Clipboard');
  expandedPlatform = signal<string | null>(null);

  togglePlatform(name: string): void {
    this.expandedPlatform.set(this.expandedPlatform() === name ? null : name);
  }

  platforms = [
    {
      name: 'Claude',
      steps: [
        'Copy your document using the button above.',
        'Go to claude.ai and click your profile icon (bottom-left corner).',
        'Select Settings.',
        'Click Profile in the left sidebar.',
        'Scroll down to the Custom Instructions section.',
        'Paste your document and click Save.',
        'Every new conversation will now start with your instructions active.'
      ]
    },
    {
      name: 'ChatGPT',
      steps: [
        'Copy your document using the button above.',
        'Go to chatgpt.com and click your profile icon (top-right corner).',
        'Select Settings.',
        'Click Personalization in the left sidebar.',
        'Click Custom Instructions.',
        'Paste your document into the first box ("What would you like ChatGPT to know about you?").',
        'Click Save. Active for all future conversations.'
      ]
    },
    {
      name: 'Gemini',
      steps: [
        'Copy your document using the button above.',
        'Go to gemini.google.com.',
        'Click "Gem manager" in the left sidebar (requires Google account).',
        'Click "New Gem" and give it a name like "Working With Me".',
        'Paste your document into the Instructions field.',
        'Click Save. Use this Gem for AI-assisted work tasks.',
        'Alternatively: paste your document at the top of any new conversation.'
      ]
    },
    {
      name: 'Copilot',
      steps: [
        'Copy your document using the button above.',
        'Copilot does not currently support persistent custom instructions.',
        'Paste your document at the top of each new conversation instead.',
        'Start with: "Here are my working preferences. Please follow them for this conversation:" then paste.'
      ]
    },
    {
      name: 'Any AI',
      steps: [
        'Copy your document using the button above.',
        'Open a new conversation in your AI assistant.',
        'Paste your document at the very start, before your first question.',
        'Add a short note: "Please follow these preferences throughout our conversation."',
        'Your AI will apply your preferences for that session.'
      ]
    }
  ];

  document = computed(() => {
    const categories = this.contentService.state().categories;
    const answers = this.sessionStore.answers();
    const lens = this.sessionStore.lens() ?? 'practical';
    const depth = this.sessionStore.depth() ?? 'quick';

    if (categories.length === 0) return 'Loading…';

    const result = buildAssessmentResult(categories, answers, lens, depth);
    return generateDocument(result);
  });

  constructor() {
    // Fire once when the result screen loads with a valid document
    track('assessment_completed');
  }

  copyToClipboard(): void {
    const text = this.document();
    navigator.clipboard.writeText(text).then(() => {
      track('document_copied');
      this.copyLabel.set('Copied!');
      setTimeout(() => this.copyLabel.set('Copy to Clipboard'), 2500);
    }).catch(() => {
      this.copyLabel.set('Copy failed — select text manually');
    });
  }

  downloadMarkdown(): void {
    track('document_downloaded');
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
