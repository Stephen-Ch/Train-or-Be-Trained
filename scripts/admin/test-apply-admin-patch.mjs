#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { applyAdminPatch } = require('./apply-admin-patch-helper.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_FILE = path.join(ROOT, 'content', 'categories', 'liberty.json');

function loadSourceCategory() {
  const raw = fs.readFileSync(SOURCE_FILE, 'utf8');
  return JSON.parse(raw);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function run() {
  const sourceCategory = loadSourceCategory();
  const workingCopy = clone(sourceCategory);

  const originalDescription = workingCopy.description;
  const updatedDescription = `${originalDescription} (Edited)`;

  const firstQuestion = workingCopy.questions[0];
  if (!firstQuestion) {
    throw new Error('Fixture question missing from liberty.json');
  }
  const updatedStatement = `${firstQuestion.body} (Edited)`;
  const reversedQuestionOrder = [...workingCopy.questions].map((question) => question.id).reverse();

  const patches = [
    { id: workingCopy.id, kind: 'category', field: 'description', value: updatedDescription },
    { id: firstQuestion.id, kind: 'position', field: 'statement', value: updatedStatement },
    { id: 'missing-id', kind: 'position', field: 'statement', value: 'ignored' },
    { op: 'reorder', kind: 'position', categoryId: workingCopy.id, orderedIds: reversedQuestionOrder },
    { op: 'setHidden', kind: 'position', id: firstQuestion.id, hidden: true }
  ];

  const { categories, summary } = applyAdminPatch([workingCopy], patches);
  const patchedCategory = categories[0];

  assert.strictEqual(patchedCategory.id, sourceCategory.id, 'Category ID changed unexpectedly');
  assert.strictEqual(patchedCategory.description, updatedDescription, 'Category description not updated');

  const updatedQuestion = patchedCategory.questions.find((question) => question.id === firstQuestion.id);
  assert(updatedQuestion, 'Updated question missing after reorder');
  assert.strictEqual(updatedQuestion.body, updatedStatement, 'Question body not updated');
  assert.strictEqual(updatedQuestion.title, updatedStatement, 'Question title should stay in sync with body');

  const untouchedQuestion = patchedCategory.questions.find(
    (question) => question.id === sourceCategory.questions[1].id
  );
  assert(untouchedQuestion, 'Untouched question missing after reorder');
  assert.strictEqual(
    untouchedQuestion.body,
    sourceCategory.questions[1].body,
    'Non-target question should remain unchanged'
  );
  assert.deepStrictEqual(
    patchedCategory.questions.map((question) => question.id),
    reversedQuestionOrder,
    'Questions not reordered as expected'
  );
  const hiddenQuestion = patchedCategory.questions.find((question) => question.id === firstQuestion.id);
  assert(hiddenQuestion, 'Hidden question missing');
  assert.strictEqual(hiddenQuestion.hidden, true, 'Hidden flag not applied');
  assert.strictEqual(summary.appliedCount, 4, 'Expected four applied operations');
  assert.strictEqual(summary.skippedCount, 1, 'Expected one skipped operation');
  assert.strictEqual(summary.skipped[0].reason, 'Unknown position id', 'Skip reason mismatch');
  assert.strictEqual(summary.reorderAppliedCount, 1, 'Expected one reorder application');
  assert.strictEqual(summary.reorderSkippedCount, 0, 'Expected zero reorder skips');
  assert.strictEqual(summary.setHiddenAppliedCount, 1, 'Expected one hidden toggle application');
  assert.strictEqual(summary.setHiddenSkippedCount, 0, 'Expected zero hidden toggle skips');

  const unhidePatch = [{ op: 'setHidden', kind: 'position', id: firstQuestion.id, hidden: false }];
  const secondResult = applyAdminPatch(categories, unhidePatch);
  const revertedQuestion = secondResult.categories[0].questions.find((question) => question.id === firstQuestion.id);
  assert(revertedQuestion, 'Question missing after unhide');
  assert(!('hidden' in revertedQuestion) || revertedQuestion.hidden === false, 'Hidden flag should be removed when false');
  assert.strictEqual(secondResult.summary.setHiddenAppliedCount, 1, 'Expected one unhide application');
  assert.strictEqual(secondResult.summary.setHiddenSkippedCount, 0, 'Expected zero unhide skips');

  console.log('[admin:patch-test] All assertions passed');
}

run();
