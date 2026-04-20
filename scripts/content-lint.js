#!/usr/bin/env node
/**
 * Content linter - validates content and generates diff report
 * Zero runtime dependencies - plain Node.js only
 */

const fs = require('fs');
const path = require('path');

// Simple validator (same as content-build.js)
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

    const orders = category.questions.map(q => q.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) {
        errors.push(`Category ${category.id}: Question order not contiguous (expected ${i}, found ${orders[i]})`);
        break;
      }
    }

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

// Generate diff between old and new content
function generateDiff(oldContent, newContent) {
  const diff = {
    added: { categories: [], questions: [], dives: [] },
    removed: { categories: [], questions: [], dives: [] },
    changed: { categories: [], questions: [], dives: [] }
  };

  // Build maps for comparison
  const oldCats = new Map((oldContent?.categories || []).map(c => [c.id, c]));
  const newCats = new Map(newContent.categories.map(c => [c.id, c]));

  // Find added/removed/changed categories
  for (const [id, cat] of newCats) {
    if (!oldCats.has(id)) {
      diff.added.categories.push({ id, title: cat.title });
    } else {
      const oldCat = oldCats.get(id);
      const changes = [];
      if (oldCat.title !== cat.title) changes.push('title');
      if (oldCat.order !== cat.order) changes.push('order');
      if (oldCat.description !== cat.description) changes.push('description');
      if (JSON.stringify(oldCat.tags) !== JSON.stringify(cat.tags)) changes.push('tags');
      if (changes.length > 0) {
        diff.changed.categories.push({ id, title: cat.title, fields: changes });
      }

      // Compare questions
      const oldQs = new Map((oldCat.questions || []).map(q => [q.id, q]));
      const newQs = new Map((cat.questions || []).map(q => [q.id, q]));

      for (const [qid, q] of newQs) {
        if (!oldQs.has(qid)) {
          diff.added.questions.push({ id: qid, title: q.title, category: id });
        } else {
          const oldQ = oldQs.get(qid);
          const qChanges = [];
          if (oldQ.title !== q.title) qChanges.push('title');
          if (oldQ.body !== q.body) qChanges.push('body');
          if (oldQ.order !== q.order) qChanges.push('order');
          if (oldQ.tlq !== q.tlq) qChanges.push('tlq');
          if (qChanges.length > 0) {
            diff.changed.questions.push({ id: qid, title: q.title, category: id, fields: qChanges });
          }

          // Compare deeper dives
          const oldDs = new Map((oldQ.deeperDives || []).map(d => [d.id, d]));
          const newDs = new Map((q.deeperDives || []).map(d => [d.id, d]));

          for (const [did, d] of newDs) {
            if (!oldDs.has(did)) {
              diff.added.dives.push({ id: did, title: d.title, question: qid });
            } else {
              const oldD = oldDs.get(did);
              const dChanges = [];
              if (oldD.title !== d.title) dChanges.push('title');
              if (oldD.body !== d.body) dChanges.push('body');
              if (oldD.order !== d.order) dChanges.push('order');
              if (dChanges.length > 0) {
                diff.changed.dives.push({ id: did, title: d.title, question: qid, fields: dChanges });
              }
            }
          }

          for (const [did, d] of oldDs) {
            if (!newDs.has(did)) {
              diff.removed.dives.push({ id: did, title: d.title, question: qid });
            }
          }
        }
      }

      for (const [qid, q] of oldQs) {
        if (!newQs.has(qid)) {
          diff.removed.questions.push({ id: qid, title: q.title, category: id });
        }
      }
    }
  }

  for (const [id, cat] of oldCats) {
    if (!newCats.has(id)) {
      diff.removed.categories.push({ id, title: cat.title });
    }
  }

  return diff;
}

// Generate markdown report
function generateMarkdownReport(diff) {
  let md = '# Content Diff Report\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;

  const hasChanges = 
    diff.added.categories.length + diff.removed.categories.length + diff.changed.categories.length +
    diff.added.questions.length + diff.removed.questions.length + diff.changed.questions.length +
    diff.added.dives.length + diff.removed.dives.length + diff.changed.dives.length > 0;

  if (!hasChanges) {
    md += '✅ No changes detected.\n';
    return md;
  }

  if (diff.added.categories.length > 0) {
    md += '## ➕ Added Categories\n\n';
    diff.added.categories.forEach(c => md += `- **${c.id}**: ${c.title}\n`);
    md += '\n';
  }

  if (diff.removed.categories.length > 0) {
    md += '## ➖ Removed Categories\n\n';
    diff.removed.categories.forEach(c => md += `- **${c.id}**: ${c.title}\n`);
    md += '\n';
  }

  if (diff.changed.categories.length > 0) {
    md += '## 📝 Changed Categories\n\n';
    diff.changed.categories.forEach(c => md += `- **${c.id}**: ${c.title} (${c.fields.join(', ')})\n`);
    md += '\n';
  }

  if (diff.added.questions.length > 0) {
    md += '## ➕ Added Questions\n\n';
    diff.added.questions.forEach(q => md += `- **${q.id}** in ${q.category}: ${q.title}\n`);
    md += '\n';
  }

  if (diff.removed.questions.length > 0) {
    md += '## ➖ Removed Questions\n\n';
    diff.removed.questions.forEach(q => md += `- **${q.id}** in ${q.category}: ${q.title}\n`);
    md += '\n';
  }

  if (diff.changed.questions.length > 0) {
    md += '## 📝 Changed Questions\n\n';
    diff.changed.questions.forEach(q => md += `- **${q.id}** in ${q.category}: ${q.title} (${q.fields.join(', ')})\n`);
    md += '\n';
  }

  if (diff.added.dives.length > 0) {
    md += '## ➕ Added Deeper Dives\n\n';
    diff.added.dives.forEach(d => md += `- **${d.id}** in ${d.question}: ${d.title}\n`);
    md += '\n';
  }

  if (diff.removed.dives.length > 0) {
    md += '## ➖ Removed Deeper Dives\n\n';
    diff.removed.dives.forEach(d => md += `- **${d.id}** in ${d.question}: ${d.title}\n`);
    md += '\n';
  }

  if (diff.changed.dives.length > 0) {
    md += '## 📝 Changed Deeper Dives\n\n';
    diff.changed.dives.forEach(d => md += `- **${d.id}** in ${d.question}: ${d.title} (${d.fields.join(', ')})\n`);
    md += '\n';
  }

  return md;
}

// Main lint logic
const contentDir = path.join(__dirname, '../content/categories');
const distFile = path.join(__dirname, '../dist/content.json');
const artifactsDir = path.join(__dirname, '../artifacts');
const diffFile = path.join(artifactsDir, 'content-diff.md');

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
  
  // Group errors by category
  const errorsByCategory = {};
  result.errors.forEach(err => {
    const match = err.match(/^Category ([^:]+):/);
    const category = match ? match[1] : 'General';
    if (!errorsByCategory[category]) errorsByCategory[category] = [];
    errorsByCategory[category].push(err);
  });

  Object.entries(errorsByCategory).forEach(([cat, errs]) => {
    console.error(`\n  ${cat}:`);
    errs.forEach(err => console.error(`    • ${err}`));
  });

  console.error('');
  process.exit(1);
}

console.log(`✅ Content OK (${result.stats.categories} categories, ${result.stats.questions} questions, ${result.stats.dives} deeper dives)`);

// Generate diff if dist/content.json exists
let oldContent = null;
if (fs.existsSync(distFile)) {
  try {
    oldContent = JSON.parse(fs.readFileSync(distFile, 'utf8'));
  } catch (e) {
    console.log('⚠️  Could not read previous dist/content.json');
  }
}

const newContent = { categories };
const diff = generateDiff(oldContent, newContent);
const markdown = generateMarkdownReport(diff);

// Write diff report
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}
fs.writeFileSync(diffFile, markdown);

console.log(`📄 Diff report: ${diffFile}`);
