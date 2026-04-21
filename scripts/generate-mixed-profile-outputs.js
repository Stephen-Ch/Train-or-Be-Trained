#!/usr/bin/env node
/**
 * generate-mixed-profile-outputs.js
 *
 * Generates the six mixed-profile "Working With Me" documents for
 * TBTT mixed-profile validation (TBTT-VALIDATION-MIXED-PROFILES-001).
 *
 * Outputs:
 *   docs/project/mixed-profile-manifest.json  — exact profile settings used
 *   docs/project/MIXED-PROFILE-OUTPUTS.md     — review-ready output file
 *
 * No new dependencies. No TypeScript compilation required.
 * The generator logic is reproduced inline from document.generator.ts
 * (pure function — no Angular, no DOM, no services).
 * Idempotent: re-running overwrites both output files.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');
const CONTENT_PATH = path.join(ROOT, 'src', 'assets', 'content', 'working-with-me.json');
const MANIFEST_PATH = path.join(ROOT, 'docs', 'project', 'mixed-profile-manifest.json');
const OUTPUTS_PATH = path.join(ROOT, 'docs', 'project', 'MIXED-PROFILE-OUTPUTS.md');

// ---------------------------------------------------------------------------
// Profiles (exact settings from TBTT-GENERATE-MIXED-PROFILE-OUTPUTS-001)
// ---------------------------------------------------------------------------

const PROFILES = [
  {
    id: 'profile-1',
    name: 'Profile 1 — High Rigor, Low Challenge',
    collision: 'Does the document tell the AI to be rigorous without making it feel combative?',
    settings: { continuity: 'B', scope: 'B', load: 'B', challenge: 'C', rigor: 'A' },
  },
  {
    id: 'profile-2',
    name: 'Profile 2 — High Scope Control, Moderate Everything Else',
    collision: 'Does the document produce an assistant that feels focused without feeling blinkered?',
    settings: { continuity: 'B', scope: 'A', load: 'B', challenge: 'B', rigor: 'B' },
  },
  {
    id: 'profile-3',
    name: 'Profile 3 — Low Filtering, High Uncertainty Signaling',
    collision: 'Does the document ask for unfiltered output while also asking the AI to help with ambiguity without the two instructions contradicting each other?',
    settings: { continuity: 'B', scope: 'B', load: 'C', challenge: 'B', rigor: 'A' },
  },
  {
    id: 'profile-4',
    name: 'Profile 4 — High Continuity, Low Interruption Tolerance',
    collision: 'Does the document produce an AI that feels continuous and non-interruptive without ignoring genuinely important clarification moments?',
    settings: { continuity: 'A', scope: 'C', load: 'B', challenge: 'B', rigor: 'B' },
  },
  {
    id: 'profile-5',
    name: 'Profile 5 — Mostly B, One A Dimension',
    collision: 'Does one strong dimension pull the document into a noticeably different register, or does it blend cleanly?',
    settings: { continuity: 'B', scope: 'B', load: 'B', challenge: 'A', rigor: 'B' },
  },
  {
    id: 'profile-6',
    name: 'Profile 6 — Mostly B, One C Dimension',
    collision: 'Does one weak dimension produce a noticeable gap or hedged instruction, or does it blend without friction?',
    settings: { continuity: 'B', scope: 'B', load: 'B', challenge: 'C', rigor: 'B' },
  },
];

// ---------------------------------------------------------------------------
// Standard prompts (from MIXED-PROFILE-TEST-PLAN.md)
// ---------------------------------------------------------------------------

const STANDARD_PROMPTS = [
  {
    label: 'Prompt 1 — Short Task, Clear Brief',
    text: 'I need a 200-word summary of the main tradeoffs between async and sync API design. No preamble.',
  },
  {
    label: 'Prompt 2 — Ambiguous Ask',
    text: 'Help me think through whether I should redesign this feature now or wait.',
  },
  {
    label: 'Prompt 3 — Pushback Probe',
    text: "I've decided to ship this with no tests. What do you think?",
  },
  {
    label: 'Prompt 4 — Longer, Messy Prompt (real-work simulation)',
    text: "I've been going back and forth on this architecture decision for two weeks. One option uses an event bus and feels clean but I'm worried about debugging. The other is a direct service call which feels obvious but now I'm second-guessing whether it scales. My lead wants a decision by Thursday and I keep changing my mind. I don't know if I'm overthinking it or if there's something real I'm missing. Can you help me get unstuck?",
  },
];

// ---------------------------------------------------------------------------
// Generator (reproduced inline from document.generator.ts — pure logic only)
// ---------------------------------------------------------------------------

function generateDocument(profileSettings, content) {
  const sections = [];
  const dateStr = new Date().toLocaleDateString('en-US');

  // Header
  sections.push(`# Working With Me\n_Generated ${dateStr}_`);

  // Universal guardrails
  sections.push(content.universalGuardrails);

  // One prose block per control, in content order
  for (const control of content.controls) {
    const setting = profileSettings[control.id];
    if (!setting) continue;
    const block = control.output[setting];
    if (block) {
      sections.push(block);
    }
  }

  return sections.join('\n\n');
}

// ---------------------------------------------------------------------------
// Load content
// ---------------------------------------------------------------------------

function loadContent() {
  if (!fs.existsSync(CONTENT_PATH)) {
    console.error(`[generate-mixed-profile-outputs] STOP: content file not found at ${CONTENT_PATH}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
  } catch (err) {
    console.error(`[generate-mixed-profile-outputs] STOP: failed to parse content file — ${err.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Build manifest
// ---------------------------------------------------------------------------

function buildManifest(generatedAt) {
  return {
    generatedAt,
    sourceContentPath: 'src/assets/content/working-with-me.json',
    profiles: PROFILES.map(p => ({
      id: p.id,
      name: p.name,
      collision: p.collision,
      settings: p.settings,
    })),
  };
}

// ---------------------------------------------------------------------------
// Build MIXED-PROFILE-OUTPUTS.md
// ---------------------------------------------------------------------------

function buildOutputsMarkdown(content, generatedAt) {
  const lines = [];

  lines.push('# Mixed-Profile Outputs — Train or Be Trained');
  lines.push(`*Generated: ${generatedAt}*`);
  lines.push('');
  lines.push('> **Review-ready artifact for TBTT-VALIDATION-MIXED-PROFILES-001.**');
  lines.push('> For each profile below: paste the Working With Me document into your AI assistant\'s custom instructions, run the 4 standard prompts in a fresh session, then fill in the rubric row.');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Six profiles
  for (const profile of PROFILES) {
    lines.push(`## ${profile.name}`);
    lines.push('');
    lines.push('**Exact Settings**');
    lines.push('');
    lines.push('| Control | Setting |');
    lines.push('|---------|---------|');
    for (const [controlId, setting] of Object.entries(profile.settings)) {
      lines.push(`| ${controlId} | ${setting} |`);
    }
    lines.push('');
    lines.push(`**Collision under test:** ${profile.collision}`);
    lines.push('');
    lines.push('**Generated Working With Me Document**');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(generateDocument(profile.settings, content));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Standard prompts
  lines.push('## Standard Prompts');
  lines.push('');
  lines.push('Use these exact four prompts for each profile. Use a fresh AI session for each profile.');
  lines.push('');
  for (const prompt of STANDARD_PROMPTS) {
    lines.push(`**${prompt.label}**`);
    lines.push('');
    lines.push(`> ${prompt.text}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Blank rubric
  lines.push('## Review Rubric');
  lines.push('');
  lines.push('Fill in one row per profile after running all four prompts.');
  lines.push('');
  lines.push('| Profile | Coherent or Stitched | Most Noticeable Behavior | Contradiction Present (Y/N) | Would I Use This In Real Work (Y/N) | One-Sentence Verdict |');
  lines.push('|---------|---------------------|--------------------------|----------------------------|-------------------------------------|----------------------|');
  for (const profile of PROFILES) {
    lines.push(`| ${profile.name} | | | | | |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Beta Gate');
  lines.push('');
  lines.push('**PASS:** All 6 profiles Coherent, no Y in Contradiction column, at least 5 of 6 verdicts positive → go to beta immediately.');
  lines.push('**CONDITIONAL PASS:** 1–2 profiles Stitched or Contradiction Y → fix one phrase, rerun only affected profile.');
  lines.push('**FAIL:** 3+ profiles Stitched or 2+ Contradiction Y → document pattern, scope fix, rerun full set once.');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('[generate-mixed-profile-outputs] Starting...');

  const content = loadContent();
  const generatedAt = new Date().toISOString();

  // Validate all profile control IDs exist in content
  const contentControlIds = content.controls.map(c => c.id);
  for (const profile of PROFILES) {
    for (const controlId of Object.keys(profile.settings)) {
      if (!contentControlIds.includes(controlId)) {
        console.error(`[generate-mixed-profile-outputs] STOP: control ID "${controlId}" in ${profile.id} not found in content file.`);
        console.error(`  Available control IDs: ${contentControlIds.join(', ')}`);
        process.exit(1);
      }
    }
  }

  // Write manifest
  const manifest = buildManifest(generatedAt);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`[generate-mixed-profile-outputs] Written: ${MANIFEST_PATH}`);

  // Write outputs markdown
  const outputsMarkdown = buildOutputsMarkdown(content, generatedAt);
  fs.writeFileSync(OUTPUTS_PATH, outputsMarkdown, 'utf8');
  console.log(`[generate-mixed-profile-outputs] Written: ${OUTPUTS_PATH}`);

  console.log(`[generate-mixed-profile-outputs] Done. ${PROFILES.length} profiles generated.`);
}

main();
