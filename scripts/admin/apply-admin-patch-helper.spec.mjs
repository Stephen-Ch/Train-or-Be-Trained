/**
 * @human apply-admin-patch-helper tests: proves patch operations work correctly
 * @proves Category reorder patches update category order fields
 * @lastTouched 2025-12-29
 */
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { applyAdminPatch } from './apply-admin-patch-helper.js';

describe('applyAdminPatch - category reorder', () => {
  it('should apply category reorder patch and update order fields', () => {
    // Minimal source categories with known order
    const sourceCategories = [
      { id: 'liberty', title: 'Liberty', order: 0, questions: [] },
      { id: 'equality', title: 'Equality', order: 1, questions: [] },
      { id: 'fairness', title: 'Fairness', order: 2, questions: [] }
    ];

    // Reorder patch: move first category to last (liberty → equality → fairness becomes equality → fairness → liberty)
    const patches = [
      {
        op: 'reorder',
        kind: 'category',
        orderedIds: ['equality', 'fairness', 'liberty']
      }
    ];

    const result = applyAdminPatch(sourceCategories, patches);

    // Verify patch was applied
    assert.strictEqual(result.summary.appliedCount, 1, 'Should apply exactly 1 patch');
    assert.strictEqual(result.summary.skippedCount, 0, 'Should skip 0 patches');

    // Verify category order fields were updated to reflect new order
    const categoryById = new Map(result.categories.map(c => [c.id, c]));
    assert.strictEqual(categoryById.get('equality').order, 0, 'equality should have order 0');
    assert.strictEqual(categoryById.get('fairness').order, 1, 'fairness should have order 1');
    assert.strictEqual(categoryById.get('liberty').order, 2, 'liberty should have order 2');

    // Verify all three categories were touched (order field modified)
    assert.strictEqual(result.summary.touchedCategoryIds.length, 3, 'All 3 categories should be touched');
    assert.ok(result.summary.touchedCategoryIds.includes('liberty'), 'liberty should be touched');
    assert.ok(result.summary.touchedCategoryIds.includes('equality'), 'equality should be touched');
    assert.ok(result.summary.touchedCategoryIds.includes('fairness'), 'fairness should be touched');
  });

  it('should skip category reorder patch if orderedIds length mismatch', () => {
    const sourceCategories = [
      { id: 'liberty', title: 'Liberty', order: 0, questions: [] },
      { id: 'equality', title: 'Equality', order: 1, questions: [] }
    ];

    const patches = [
      {
        op: 'reorder',
        kind: 'category',
        orderedIds: ['equality'] // Missing 'liberty'
      }
    ];

    const result = applyAdminPatch(sourceCategories, patches);

    assert.strictEqual(result.summary.appliedCount, 0, 'Should apply 0 patches');
    assert.strictEqual(result.summary.skippedCount, 1, 'Should skip 1 patch');
    assert.strictEqual(result.summary.skipped[0].reason, 'orderedIds length mismatch');
  });

  it('should skip category reorder patch if orderedIds contains unknown category', () => {
    const sourceCategories = [
      { id: 'liberty', title: 'Liberty', order: 0, questions: [] },
      { id: 'equality', title: 'Equality', order: 1, questions: [] }
    ];

    const patches = [
      {
        op: 'reorder',
        kind: 'category',
        orderedIds: ['equality', 'unknown-category']
      }
    ];

    const result = applyAdminPatch(sourceCategories, patches);

    assert.strictEqual(result.summary.appliedCount, 0, 'Should apply 0 patches');
    assert.strictEqual(result.summary.skippedCount, 1, 'Should skip 1 patch');
    assert.strictEqual(result.summary.skipped[0].reason, 'orderedIds must reference existing categories');
  });

  it('should skip category reorder patch if orderedIds contains duplicates', () => {
    const sourceCategories = [
      { id: 'liberty', title: 'Liberty', order: 0, questions: [] },
      { id: 'equality', title: 'Equality', order: 1, questions: [] }
    ];

    const patches = [
      {
        op: 'reorder',
        kind: 'category',
        orderedIds: ['equality', 'equality']
      }
    ];

    const result = applyAdminPatch(sourceCategories, patches);

    assert.strictEqual(result.summary.appliedCount, 0, 'Should apply 0 patches');
    assert.strictEqual(result.summary.skippedCount, 1, 'Should skip 1 patch');
    assert.strictEqual(result.summary.skipped[0].reason, 'orderedIds contains duplicates');
  });
});

describe('applyAdminPatch - challenge triggerRule edits', () => {
  it('should apply challenge triggerRule edit patch', () => {
    // Minimal category with one position containing one deeperDive (challenge)
    const sourceCategories = [
      {
        id: 'liberty',
        title: 'Liberty',
        order: 0,
        questions: [
          {
            id: 'liberty-q0',
            title: 'Position statement',
            body: 'Position statement',
            order: 0,
            deeperDives: [
              {
                id: 'liberty-q0-fu0',
                title: 'Challenge title',
                body: 'Challenge body',
                order: 0,
                triggerRule: {
                  parentAnswerMin: 1,
                  parentAnswerMax: 5,
                  tags: []
                }
              }
            ]
          }
        ]
      }
    ];

    // Edit triggerRule patch
    const patches = [
      {
        id: 'liberty-q0-fu0',
        kind: 'challenge',
        field: 'triggerRule',
        value: {
          parentAnswerMin: 3,
          tags: ['audit-tag']
        }
      }
    ];

    const result = applyAdminPatch(sourceCategories, patches);

    // Verify patch was applied
    assert.strictEqual(result.summary.appliedCount, 1, 'Should apply exactly 1 patch');
    assert.strictEqual(result.summary.skippedCount, 0, 'Should skip 0 patches');

    // Verify triggerRule was updated
    const challenge = result.categories[0].questions[0].deeperDives[0];
    assert.strictEqual(challenge.triggerRule.parentAnswerMin, 3, 'parentAnswerMin should be updated to 3');
    assert.strictEqual(challenge.triggerRule.parentAnswerMax, undefined, 'parentAnswerMax should be undefined (not in patch value)');
    assert.deepStrictEqual(challenge.triggerRule.tags, ['audit-tag'], 'tags should be updated to ["audit-tag"]');

    // Verify category was touched
    assert.strictEqual(result.summary.touchedCategoryIds.length, 1, 'Should touch 1 category');
    assert.ok(result.summary.touchedCategoryIds.includes('liberty'), 'liberty should be touched');
  });

  it('should skip challenge triggerRule edit patch if challenge id is unknown', () => {
    const sourceCategories = [
      {
        id: 'liberty',
        title: 'Liberty',
        order: 0,
        questions: [
          {
            id: 'liberty-q0',
            title: 'Position statement',
            body: 'Position statement',
            order: 0,
            deeperDives: [
              {
                id: 'liberty-q0-fu0',
                title: 'Challenge title',
                body: 'Challenge body',
                order: 0
              }
            ]
          }
        ]
      }
    ];

    const patches = [
      {
        id: 'unknown-challenge-id',
        kind: 'challenge',
        field: 'triggerRule',
        value: { parentAnswerMin: 3 }
      }
    ];

    const result = applyAdminPatch(sourceCategories, patches);

    assert.strictEqual(result.summary.appliedCount, 0, 'Should apply 0 patches');
    assert.strictEqual(result.summary.skippedCount, 1, 'Should skip 1 patch');
    assert.strictEqual(result.summary.skipped[0].reason, 'Unknown challenge id');
  });

  it('should apply challenge title patch', () => {
    const categories = [
      {
        id: 'liberty',
        questions: [
          {
            id: 'liberty-q0',
            deeperDives: [
              { id: 'liberty-q0-fu0', title: 'Original Title', body: 'Original Body', triggerRule: {} }
            ]
          }
        ]
      }
    ];

    const patches = [
      {
        id: 'liberty-q0-fu0',
        kind: 'challenge',
        field: 'title',
        value: 'New Title'
      }
    ];

    const result = applyAdminPatch(categories, patches);

    assert.strictEqual(result.summary.appliedCount, 1, 'Should apply 1 patch');
    assert.strictEqual(result.summary.skippedCount, 0, 'Should skip 0 patches');
    const challenge = result.categories[0].questions[0].deeperDives[0];
    assert.strictEqual(challenge.title, 'New Title', 'Title should be updated');
  });

  it('should apply challenge body patch', () => {
    const categories = [
      {
        id: 'fairness',
        questions: [
          {
            id: 'fairness-q2',
            deeperDives: [
              { id: 'fairness-q2-fu1', title: 'Title', body: 'Old Body Text', triggerRule: {} }
            ]
          }
        ]
      }
    ];

    const patches = [
      {
        id: 'fairness-q2-fu1',
        kind: 'challenge',
        field: 'body',
        value: '  New Body Text  '
      }
    ];

    const result = applyAdminPatch(categories, patches);

    assert.strictEqual(result.summary.appliedCount, 1, 'Should apply 1 patch');
    assert.strictEqual(result.summary.skippedCount, 0, 'Should skip 0 patches');
    const challenge = result.categories[0].questions[0].deeperDives[0];
    assert.strictEqual(challenge.body, 'New Body Text', 'Body should be updated and trimmed');
  });
});
