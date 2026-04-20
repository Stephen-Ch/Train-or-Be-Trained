/**
 * V2 document generator for Train or Be Trained.
 * Maps a SetupResult + V2Content → a personalized markdown document.
 *
 * Structure:
 *   1. Header
 *   2. Universal guardrails
 *   3. One prose block per control (output[setting])
 */

import { SetupResult, V2Content } from '../content/types';

export function generateDocument(result: SetupResult, content: V2Content): string {
  const sections: string[] = [];

  // Header
  sections.push(`# Working With Me\n_Generated ${new Date(result.generatedAt).toLocaleDateString()}_`);

  // Universal guardrails
  sections.push(content.universalGuardrails);

  // One section per control, in content order
  for (const control of content.controls) {
    const controlResult = result.controls.find(r => r.controlId === control.id);
    if (!controlResult) continue;
    const block = control.output[controlResult.setting];
    if (block) {
      sections.push(block);
    }
  }

  return sections.join('\n\n');
}
