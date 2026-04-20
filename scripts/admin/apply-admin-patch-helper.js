/**
 * Admin patch helper for FW-ADMIN-001 export format.
 *
 * Supported patch schema:
 * [
 *   {
 *     id: string,              // category.id or follow-up/question id
 *     kind: 'category'|'position',
 *     field: 'name'|'description'|'statement',
 *     value: string            // replacement text, trimmed
 *   }
 *   {
 *     id: string,              // challenge id (e.g., liberty-q0-fu0)
 *     kind: 'challenge',
 *     field: 'triggerRule'|'title'|'body',
 *     value: object|string     // triggerRule: object {parentAnswerMin?, parentAnswerMax?, tags?[]}
 *                              // title/body: string (trimmed)
 *   }
 *   {
 *     op: 'reorder',
 *     kind: 'position',
 *     categoryId: string,
 *     orderedIds: string[]     // permutation of existing position/question ids
 *   }
 *   {
 *     op: 'reorder',
 *     kind: 'category',
 *     orderedIds: string[]     // permutation of existing category ids
 *   }
 *   {
 *     op: 'setHidden',
 *     kind: 'position',
 *     id: string,
 *     hidden: boolean          // true hides, false/unset unhides
 *   }
 * ]
 *
 * Notes:
 * - Category patches map to SOURCE fields: name -> title, description -> description
 * - Position patches update SOURCE question.title and question.body (kept in sync)
 * - Category reorder patches update the order field on each category
 * - IDs are never created or deleted here; pipeline scripts remain the source of truth
 */

const CATEGORY_FIELD_MAP = {
  name: 'title',
  description: 'description'
};

const ALLOWED_FIELDS = {
  category: new Set(Object.keys(CATEGORY_FIELD_MAP)),
  position: new Set(['statement']),
  challenge: new Set(['triggerRule', 'title', 'body'])
};

function normalizeValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function buildIndexes(categories) {
  const categoryById = new Map();
  const questionById = new Map();
  const challengeById = new Map();

  categories.forEach((category) => {
    categoryById.set(category.id, category);
    const questions = Array.isArray(category.questions) ? category.questions : [];
    questions.forEach((question) => {
      if (question && typeof question.id === 'string') {
        questionById.set(question.id, { question, categoryId: category.id });
        const deeperDives = Array.isArray(question.deeperDives) ? question.deeperDives : [];
        deeperDives.forEach((challenge) => {
          if (challenge && typeof challenge.id === 'string') {
            challengeById.set(challenge.id, { challenge, categoryId: category.id });
          }
        });
      }
    });
  });

  return { categoryById, questionById, challengeById };
}

function ensureAllowed(patch) {
  const targetSet = ALLOWED_FIELDS[patch.kind];
  if (!targetSet) {
    throw new Error(`Patch kind "${patch.kind}" is not supported. Only "category" and "position" are allowed.`);
  }
  if (!targetSet.has(patch.field)) {
    throw new Error(`Field "${patch.field}" is not allowed for kind "${patch.kind}".`);
  }
}

function applyAdminPatch(categories, patches) {
  if (!Array.isArray(categories)) {
    throw new Error('applyAdminPatch requires an array of category objects.');
  }
  if (!Array.isArray(patches)) {
    throw new Error('Patch payload must be an array.');
  }

  const clonedCategories = categories.map((category) => ({
    ...category,
    questions: Array.isArray(category.questions)
      ? category.questions.map((question) => ({
          ...question,
          deeperDives: Array.isArray(question.deeperDives)
            ? question.deeperDives.map((challenge) => ({ ...challenge }))
            : []
        }))
      : []
  }));

  const { categoryById, questionById, challengeById } = buildIndexes(clonedCategories);
  const touchedCategoryIds = new Set();
  const applied = [];
  const skipped = [];
  let reorderAppliedCount = 0;
  let reorderSkippedCount = 0;
  let setHiddenAppliedCount = 0;
  let setHiddenSkippedCount = 0;

  patches.forEach((patch, index) => {
    if (!patch || typeof patch !== 'object') {
      throw new Error(`Patch at index ${index} is not an object.`);
    }

    if (patch.op === 'reorder') {
      if (patch.kind !== 'position' && patch.kind !== 'category') {
        throw new Error(`Reorder patch at index ${index} must have kind "position" or "category".`);
      }
      if (!Array.isArray(patch.orderedIds)) {
        throw new Error(`Reorder patch at index ${index} requires an orderedIds array.`);
      }

      // Handle category reorder (updates order field on each category)
      if (patch.kind === 'category') {
        if (patch.orderedIds.length !== clonedCategories.length) {
          reorderSkippedCount += 1;
          skipped.push({
            op: 'reorder',
            kind: 'category',
            reason: 'orderedIds length mismatch'
          });
          return;
        }

        const seen = new Set();
        for (const id of patch.orderedIds) {
          if (typeof id !== 'string') {
            reorderSkippedCount += 1;
            skipped.push({
              op: 'reorder',
              kind: 'category',
              reason: 'orderedIds must contain string ids'
            });
            return;
          }
          if (seen.has(id)) {
            reorderSkippedCount += 1;
            skipped.push({
              op: 'reorder',
              kind: 'category',
              reason: 'orderedIds contains duplicates'
            });
            return;
          }
          if (!categoryById.has(id)) {
            reorderSkippedCount += 1;
            skipped.push({
              op: 'reorder',
              kind: 'category',
              reason: 'orderedIds must reference existing categories'
            });
            return;
          }
          seen.add(id);
        }

        // Update order field on each category to reflect new position
        patch.orderedIds.forEach((id, newOrder) => {
          const category = categoryById.get(id);
          category.order = newOrder;
          touchedCategoryIds.add(id);
        });

        reorderAppliedCount += 1;
        applied.push({
          op: 'reorder',
          kind: 'category',
          orderedIds: [...patch.orderedIds]
        });
        return;
      }

      // Handle position reorder (existing logic)
      if (typeof patch.categoryId !== 'string' || patch.categoryId.trim().length === 0) {
        throw new Error(`Reorder patch at index ${index} with kind "position" is missing a valid categoryId.`);
      }

      const category = categoryById.get(patch.categoryId);
      if (!category) {
        reorderSkippedCount += 1;
        skipped.push({
          op: 'reorder',
          kind: 'position',
          categoryId: patch.categoryId,
          reason: 'Unknown category id'
        });
        return;
      }

      const questions = Array.isArray(category.questions) ? category.questions : [];
      if (patch.orderedIds.length !== questions.length) {
        reorderSkippedCount += 1;
        skipped.push({
          op: 'reorder',
          kind: 'position',
          categoryId: patch.categoryId,
          reason: 'orderedIds length mismatch'
        });
        return;
      }

      const seen = new Set();
      const reordered = [];
      for (const id of patch.orderedIds) {
        if (typeof id !== 'string') {
          reorderSkippedCount += 1;
          skipped.push({
            op: 'reorder',
            kind: 'position',
            categoryId: patch.categoryId,
            reason: 'orderedIds must contain string ids'
          });
          return;
        }
        if (seen.has(id)) {
          reorderSkippedCount += 1;
          skipped.push({
            op: 'reorder',
            kind: 'position',
            categoryId: patch.categoryId,
            reason: 'orderedIds contains duplicates'
          });
          return;
        }

        const entry = questionById.get(id);
        if (!entry || entry.categoryId !== patch.categoryId) {
          reorderSkippedCount += 1;
          skipped.push({
            op: 'reorder',
            kind: 'position',
            categoryId: patch.categoryId,
            reason: 'orderedIds must reference existing positions in category'
          });
          return;
        }
        reordered.push(entry.question);
        seen.add(id);
      }

      category.questions = reordered;
      touchedCategoryIds.add(category.id);
      reorderAppliedCount += 1;
      applied.push({
        op: 'reorder',
        kind: 'position',
        categoryId: category.id,
        orderedIds: [...patch.orderedIds]
      });
      return;
    }

    if (patch.op === 'setHidden') {
      if (patch.kind !== 'position') {
        throw new Error(`setHidden patch at index ${index} must have kind "position".`);
      }
      if (typeof patch.id !== 'string' || patch.id.trim().length === 0) {
        throw new Error(`setHidden patch at index ${index} is missing a valid position id.`);
      }
      if (typeof patch.hidden !== 'boolean') {
        throw new Error(`setHidden patch at index ${index} must include a boolean hidden value.`);
      }

      const questionEntry = questionById.get(patch.id);
      if (!questionEntry) {
        setHiddenSkippedCount += 1;
        skipped.push({ op: 'setHidden', kind: 'position', id: patch.id, reason: 'Unknown position id' });
        return;
      }

      const { question, categoryId } = questionEntry;
      const currentHidden = question.hidden === true;
      const nextHidden = patch.hidden === true;
      if (currentHidden === nextHidden) {
        setHiddenSkippedCount += 1;
        skipped.push({ op: 'setHidden', kind: 'position', id: patch.id, reason: 'Hidden flag already matches' });
        return;
      }

      if (nextHidden) {
        question.hidden = true;
      } else if ('hidden' in question) {
        delete question.hidden;
      }
      touchedCategoryIds.add(categoryId);
      setHiddenAppliedCount += 1;
      applied.push({ op: 'setHidden', kind: 'position', id: patch.id, hidden: nextHidden });
      return;
    }

    const { id, kind, field } = patch;
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error(`Patch at index ${index} is missing a valid "id".`);
    }

    ensureAllowed(patch);

    if (kind === 'challenge') {
      const challengeEntry = challengeById.get(id);
      if (!challengeEntry) {
        skipped.push({ id, kind, field, reason: 'Unknown challenge id' });
        return;
      }
      const { challenge, categoryId } = challengeEntry;
      
      // For triggerRule, apply value verbatim (object)
      if (field === 'triggerRule') {
        challenge.triggerRule = patch.value;
        touchedCategoryIds.add(categoryId);
        applied.push({ id, kind, field });
        return;
      }
      
      // For title or body, apply normalized value (trimmed string)
      if (field === 'title') {
        challenge.title = normalizeValue(patch.value);
        touchedCategoryIds.add(categoryId);
        applied.push({ id, kind, field });
        return;
      }
      
      if (field === 'body') {
        challenge.body = normalizeValue(patch.value);
        touchedCategoryIds.add(categoryId);
        applied.push({ id, kind, field });
        return;
      }
    }

    const nextValue = normalizeValue(patch.value);

    if (kind === 'category') {
      const category = categoryById.get(id);
      if (!category) {
        skipped.push({ id, kind, field, reason: 'Unknown category id' });
        return;
      }
      const sourceField = CATEGORY_FIELD_MAP[field];
      const currentValue = typeof category[sourceField] === 'string' ? category[sourceField] : '';
      if (currentValue === nextValue) {
        skipped.push({ id, kind, field, reason: 'Value already matches' });
        return;
      }
      category[sourceField] = nextValue;
      touchedCategoryIds.add(category.id);
      applied.push({ id, kind, field });
      return;
    }

    const questionEntry = questionById.get(id);
    if (!questionEntry) {
      skipped.push({ id, kind, field, reason: 'Unknown position id' });
      return;
    }
    const { question, categoryId } = questionEntry;
    const currentBody = typeof question.body === 'string' ? question.body : '';
    if (currentBody === nextValue) {
      skipped.push({ id, kind, field, reason: 'Value already matches' });
      return;
    }
    // Keep both body and title in sync so downstream pipeline remains consistent
    question.body = nextValue;
    if (typeof question.title === 'string') {
      question.title = nextValue;
    }
    touchedCategoryIds.add(categoryId);
    applied.push({ id, kind, field });
  });

  return {
    categories: clonedCategories,
    summary: {
      applied,
      skipped,
      appliedCount: applied.length,
      skippedCount: skipped.length,
      reorderAppliedCount,
      reorderSkippedCount,
      setHiddenAppliedCount,
      setHiddenSkippedCount,
      touchedCategoryIds: Array.from(touchedCategoryIds)
    }
  };
}

module.exports = {
  applyAdminPatch,
  ALLOWED_FIELDS
};
