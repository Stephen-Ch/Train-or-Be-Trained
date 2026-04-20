#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { applyAdminPatch } = require('./apply-admin-patch-helper');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'categories');

function fail(message) {
  console.error(`\n[admin:apply-patch] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    patchPath: null,
    write: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--patch') {
      args.patchPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--write') {
      args.write = true;
      continue;
    }
    if (token === '--dryRun') {
      args.write = false;
      continue;
    }
    if (token === '--help' || token === '-h') {
      console.log('Usage: npm run admin:apply-patch -- --patch ./path/to/patch.json [--write]');
      process.exit(0);
    }
    fail(`Unknown argument: ${token}`);
  }

  if (!args.patchPath) {
    fail('Missing required --patch <path> argument.');
  }

  return args;
}

function loadPatchPayload(patchPath) {
  const absolutePath = path.resolve(process.cwd(), patchPath);
  if (!fs.existsSync(absolutePath)) {
    fail(`Patch file not found: ${absolutePath}`);
  }

  try {
    const raw = fs.readFileSync(absolutePath, 'utf8');
    const payload = JSON.parse(raw);
    if (!Array.isArray(payload)) {
      fail('Patch file must contain an array.');
    }
    return { payload, absolutePath };
  } catch (error) {
    fail(`Unable to read patch file: ${error.message}`);
  }
}

function loadSourceCategories() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fail(`Source directory not found: ${CONTENT_DIR}`);
  }

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.json') && !file.startsWith('_'));

  if (files.length === 0) {
    fail(`No category JSON files found in ${CONTENT_DIR}`);
  }

  const categories = [];
  const metadata = new Map();

  files.forEach((file) => {
    const filePath = path.join(CONTENT_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    categories.push(data);
    metadata.set(data.id, { filePath, original: data });
  });

  return { categories, metadata };
}

function writeCategory(filePath, category) {
  const json = JSON.stringify(category, null, 2);
  fs.writeFileSync(filePath, `${json}\n`, 'utf8');
}

function formatSkipEntry(entry) {
  if (entry && entry.op === 'reorder') {
    return `reorder ${entry.kind} category ${entry.categoryId} → ${entry.reason}`;
  }
  if (entry && entry.op === 'setHidden') {
    return `setHidden ${entry.kind} ${entry.id} → ${entry.reason}`;
  }
  return `${entry.kind}:${entry.field} ${entry.id} → ${entry.reason}`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { payload, absolutePath } = loadPatchPayload(args.patchPath);
  const { categories, metadata } = loadSourceCategories();

  let result;
  try {
    result = applyAdminPatch(categories, payload);
  } catch (error) {
    fail(error.message);
  }

  const updatedById = new Map(result.categories.map((category) => [category.id, category]));
  console.log('[admin:apply-patch] Loaded patch:', absolutePath);
  console.log(`[admin:apply-patch] Total operations: ${payload.length}`);
  console.log(`[admin:apply-patch] Applied: ${result.summary.appliedCount}`);
  console.log(`[admin:apply-patch] Skipped: ${result.summary.skippedCount}`);
  console.log(`[admin:apply-patch] Reorder applied: ${result.summary.reorderAppliedCount}`);
  console.log(`[admin:apply-patch] Reorder skipped: ${result.summary.reorderSkippedCount}`);
  console.log(`[admin:apply-patch] Hide applied: ${result.summary.setHiddenAppliedCount}`);
  console.log(`[admin:apply-patch] Hide skipped: ${result.summary.setHiddenSkippedCount}`);

  if (result.summary.skipped.length > 0) {
    console.log('[admin:apply-patch] Skipped operations:');
    result.summary.skipped.forEach((entry) => {
      console.log(`  • ${formatSkipEntry(entry)}`);
    });
  }

  const reorderApplied = result.summary.applied.filter((entry) => entry.op === 'reorder');
  if (reorderApplied.length > 0) {
    console.log('[admin:apply-patch] Reorder operations applied:');
    reorderApplied.forEach((entry) => {
      console.log(`  • category ${entry.categoryId} (${entry.orderedIds.length} positions reordered)`);
    });
  }

  const hiddenApplied = result.summary.applied.filter((entry) => entry.op === 'setHidden');
  if (hiddenApplied.length > 0) {
    console.log('[admin:apply-patch] Hidden state changes applied:');
    hiddenApplied.forEach((entry) => {
      console.log(`  • position ${entry.id} → hidden=${entry.hidden}`);
    });
  }

  if (!args.write) {
    console.log('[admin:apply-patch] Dry run mode: no files written. Use --write to persist changes.');
    return;
  }

  if (result.summary.touchedCategoryIds.length === 0) {
    console.log('[admin:apply-patch] No changes detected. Files remain untouched.');
    return;
  }

  result.summary.touchedCategoryIds.forEach((categoryId) => {
    const meta = metadata.get(categoryId);
    if (!meta) {
      console.warn(`[admin:apply-patch] Warning: category ${categoryId} missing metadata; skipping write.`);
      return;
    }
    const updated = updatedById.get(categoryId);
    writeCategory(meta.filePath, updated);
    console.log(`[admin:apply-patch] Wrote ${path.relative(ROOT, meta.filePath)}`);
  });
}

main();
