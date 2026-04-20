#!/usr/bin/env node
/**
 * Content build script - merges and validates category files
 * Zero runtime dependencies - plain Node.js only
 */

const fs = require('fs');
const path = require('path');

// Simple validator (JS reimplementation of TS validator logic)
function validateContent(categories) {
  const errors = [];
  const allIds = new Set();
  let questionCount = 0;
  let diveCount = 0;

  function checkId(id, type, parent) {
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
  }

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

    // Check question order contiguity
    const orders = category.questions.map(q => q.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) {
        errors.push(`Category ${category.id}: Question order not contiguous (expected ${i}, found ${orders[i]})`);
        break;
      }
    }

    // Check TLQ ordering
    let foundNonTlq = false;
    for (const question of category.questions) {
      const isTlq = question.tlq === true;
      if (foundNonTlq && isTlq) {
        errors.push(`Category ${category.id}: TLQ question "${question.id}" appears after non-TLQ question`);
      }
      if (!isTlq) foundNonTlq = true;
    }

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

      if (question.deeperDives) {
        if (!Array.isArray(question.deeperDives)) {
          errors.push(`Question ${question.id}: Invalid deeperDives array`);
          continue;
        }

        const diveOrders = question.deeperDives.map(d => d.order).sort((a, b) => a - b);
        for (let i = 0; i < diveOrders.length; i++) {
          if (diveOrders[i] !== i) {
            errors.push(`Question ${question.id}: DeeperDive order not contiguous (expected ${i}, found ${diveOrders[i]})`);
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

  // Check category order contiguity
  const categoryOrders = categories.map(c => c.order).sort((a, b) => a - b);
  for (let i = 0; i < categoryOrders.length; i++) {
    if (categoryOrders[i] !== i) {
      errors.push(`Category order not contiguous (expected ${i}, found ${categoryOrders[i]})`);
      break;
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    stats: { categories: categories.length, questions: questionCount, dives: diveCount }
  };
}

// Main build logic
const contentDir = path.join(__dirname, '../content/categories');
const distDir = path.join(__dirname, '../dist');
const distFile = path.join(distDir, 'content.json');

// Read all category files
const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
const categories = files.map(file => {
  const filePath = path.join(contentDir, file);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
});

// Sort by order
categories.sort((a, b) => a.order - b.order);

// Validate
const result = validateContent(categories);

if (!result.ok) {
  console.error('\n❌ Content validation failed:\n');
  result.errors.forEach(err => console.error(`  • ${err}`));
  console.error('');
  process.exit(1);
}

// Write output
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(distFile, JSON.stringify({ categories }, null, 2) + '\n');

console.log(`✅ Content validated and built successfully`);
console.log(`   ${result.stats.categories} categories, ${result.stats.questions} questions, ${result.stats.dives} deeper dives`);
console.log(`   Output: ${distFile}`);
