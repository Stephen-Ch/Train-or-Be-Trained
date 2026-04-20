#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PIPELINE_PATH = path.join(ROOT, 'dist', 'content.json');
const OUTPUT_PATH = path.join(ROOT, 'src', 'assets', 'content', 'rawls-values.generated.json');
const LIKERT5 = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree'
];

function fail(message) {
  console.error(`\n[content-export-app] ${message}`);
  process.exit(1);
}

function readPipelineFile() {
  if (!fs.existsSync(PIPELINE_PATH)) {
    fail('Missing dist/content.json. Run "npm run content:build" first.');
  }

  try {
    const raw = fs.readFileSync(PIPELINE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    fail(`Unable to read pipeline file: ${error.message}`);
  }
}

function adaptCategories(pipeline) {
  if (!pipeline || !Array.isArray(pipeline.categories)) {
    fail('Pipeline file must contain a categories array.');
  }

  return pipeline.categories.map(category => ({
    id: category.id,
    name: category.title ?? category.id,
    description: category.description ?? '',
    quote: category.quote ?? '',
    followUps: (category.questions ?? []).map(question => {
      const followUp = {
        id: question.id,
        statement: question.body ?? question.title ?? '',
        reverse: Boolean(question.reverse),
        dimension: question.dimension ?? question.id
      };
      
      // Only include challenges property if deeperDives exist and are non-empty
      if (question.deeperDives && question.deeperDives.length > 0) {
        followUp.challenges = question.deeperDives.map(dive => {
          const challenge = {
            id: dive.id,
            title: dive.title ?? '',
            body: dive.body ?? '',
            order: dive.order ?? 0
          };
          
          // Preserve triggerRule if present
          if (dive.triggerRule) {
            challenge.triggerRule = dive.triggerRule;
          }
          
          return challenge;
        });
      }
      
      return followUp;
    })
  }));
}

function writeOutput(payload) {
  const json = JSON.stringify(payload, null, 2);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, json, 'utf8');
  console.log(`[content-export-app] Exported pipeline content to ${OUTPUT_PATH}`);
}

function main() {
  const pipeline = readPipelineFile();
  const categories = adaptCategories(pipeline);
  const payload = {
    version: 'generated-from-pipeline',
    locale: 'en',
    likert5: LIKERT5,
    categories
  };
  writeOutput(payload);
}

main();
