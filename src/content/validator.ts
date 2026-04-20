/**
 * Content validator with zero runtime dependencies
 */

import type { Category, Question, DeeperDive } from './schema';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  stats: {
    categories: number;
    questions: number;
    dives: number;
  };
}

/**
 * Validates content structure and rules
 */
export function validateContent(categories: Category[]): ValidationResult {
  const errors: string[] = [];
  const allIds = new Set<string>();
  let questionCount = 0;
  let diveCount = 0;

  // Helper to check for duplicate IDs
  const checkId = (id: string, type: string, parent?: string): boolean => {
    if (!id || id.trim() === '') {
      const location = parent ? `${type} in ${parent}` : type;
      errors.push(`Empty or missing id for ${location}`);
      return false;
    }
    if (allIds.has(id)) {
      errors.push(`Duplicate id: ${id}`);
      return false;
    }
    allIds.add(id);
    return true;
  };

  // Validate each category
  for (const category of categories) {
    checkId(category.id, 'Category');

    if (!category.title || category.title.trim() === '') {
      errors.push(`Category ${category.id}: Empty title`);
    }

    if (typeof category.order !== 'number' || category.order < 0) {
      errors.push(`Category ${category.id}: Invalid order (must be >= 0)`);
    }

    if (!Array.isArray(category.questions)) {
      errors.push(`Category ${category.id}: Missing or invalid questions array`);
      continue;
    }

    // Check questions array ordering
    const orders = category.questions.map(q => q.order);
    const sortedOrders = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i) {
        errors.push(`Category ${category.id}: Question order not contiguous (expected ${i}, found ${sortedOrders[i]})`);
        break;
      }
    }

    // Check TLQ ordering (TLQs must come before non-TLQs)
    let foundNonTlq = false;
    for (const question of category.questions) {
      const isTlq = question.tlq === true;
      if (foundNonTlq && isTlq) {
        errors.push(`Category ${category.id}: TLQ question "${question.id}" appears after non-TLQ question`);
      }
      if (!isTlq) {
        foundNonTlq = true;
      }
    }

    // Validate each question
    for (const question of category.questions) {
      checkId(question.id, 'Question', category.id);
      questionCount++;

      if (!question.title || question.title.trim() === '') {
        errors.push(`Question ${question.id}: Empty title`);
      }

      if (!question.body || question.body.trim() === '') {
        errors.push(`Question ${question.id}: Empty body`);
      }

      if (typeof question.order !== 'number' || question.order < 0) {
        errors.push(`Question ${question.id}: Invalid order (must be >= 0)`);
      }

      // Validate deeper dives if present
      if (question.deeperDives) {
        if (!Array.isArray(question.deeperDives)) {
          errors.push(`Question ${question.id}: Invalid deeperDives array`);
          continue;
        }

        // Check deeper dives ordering
        const diveOrders = question.deeperDives.map(d => d.order);
        const sortedDiveOrders = [...diveOrders].sort((a, b) => a - b);
        for (let i = 0; i < sortedDiveOrders.length; i++) {
          if (sortedDiveOrders[i] !== i) {
            errors.push(`Question ${question.id}: DeeperDive order not contiguous (expected ${i}, found ${sortedDiveOrders[i]})`);
            break;
          }
        }

        for (const dive of question.deeperDives) {
          checkId(dive.id, 'DeeperDive', question.id);
          diveCount++;

          if (!dive.title || dive.title.trim() === '') {
            errors.push(`DeeperDive ${dive.id}: Empty title`);
          }

          if (!dive.body || dive.body.trim() === '') {
            errors.push(`DeeperDive ${dive.id}: Empty body`);
          }

          if (typeof dive.order !== 'number' || dive.order < 0) {
            errors.push(`DeeperDive ${dive.id}: Invalid order (must be >= 0)`);
          }
        }
      }
    }
  }

  // Check category ordering
  const categoryOrders = categories.map(c => c.order);
  const sortedCategoryOrders = [...categoryOrders].sort((a, b) => a - b);
  for (let i = 0; i < sortedCategoryOrders.length; i++) {
    if (sortedCategoryOrders[i] !== i) {
      errors.push(`Category order not contiguous (expected ${i}, found ${sortedCategoryOrders[i]})`);
      break;
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    stats: {
      categories: categories.length,
      questions: questionCount,
      dives: diveCount
    }
  };
}
