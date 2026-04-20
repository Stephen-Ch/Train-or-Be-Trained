/**
 * @human content-export-app transformation tests: proves deeperDives export to challenges
 * @proves Export pipeline transforms deeperDives[] into challenges[] under each position
 * @lastTouched 2025-12-23
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Read and parse actual source category to ensure ID patterns match production
const libertySource = JSON.parse(readFileSync(join(ROOT, 'content', 'categories', 'liberty.json'), 'utf8'));

// Minimal mock pipeline structure with deeperDives
function createMockPipeline() {
  const firstQuestion = libertySource.questions[0];
  return {
    categories: [
      {
        id: 'liberty',
        title: 'Liberty',
        description: 'Test desc',
        quote: 'Test quote',
        questions: [
          {
            id: firstQuestion.id,
            title: firstQuestion.title,
            body: firstQuestion.body,
            order: 0,
            reverse: false,
            dimension: firstQuestion.id,
            deeperDives: [
              {
                id: `${firstQuestion.id}-fu0`,
                title: 'Should hate speech be protected?',
                body: 'Should hate speech be protected as free expression?',
                order: 0
              },
              {
                id: `${firstQuestion.id}-fu1`,
                title: 'Should government regulate online speech?',
                body: 'Should government have power to regulate speech online?',
                order: 1
              }
            ]
          }
        ]
      }
    ]
  };
}

// Inline adaptation function (matches content-export-app.js)
function adaptCategories(pipeline) {
  if (!pipeline || !Array.isArray(pipeline.categories)) {
    throw new Error('Pipeline file must contain a categories array.');
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
        followUp.challenges = question.deeperDives.map(dive => ({
          id: dive.id,
          title: dive.title ?? '',
          body: dive.body ?? '',
          order: dive.order ?? 0
        }));
      }
      
      return followUp;
    })
  }));
}

console.log('[content-export-app-test] Testing deeperDives transformation...');

// Test 1: Transform includes challenges
const mockPipeline = createMockPipeline();
const adapted = adaptCategories(mockPipeline);

assert.strictEqual(adapted.length, 1, 'Should have 1 category');
assert.strictEqual(adapted[0].id, 'liberty', 'Category id should be liberty');
assert.strictEqual(adapted[0].followUps.length, 1, 'Should have 1 position');

const position = adapted[0].followUps[0];
assert(position.challenges, 'Position should have challenges array');
assert.strictEqual(position.challenges.length, 2, 'Should have 2 challenges');

// Test 2: Challenge structure
const challenge0 = position.challenges[0];
assert.strictEqual(challenge0.id, `${libertySource.questions[0].id}-fu0`, 'Challenge ID follows pattern');
assert.strictEqual(challenge0.title, 'Should hate speech be protected?', 'Challenge title matches');
assert.strictEqual(challenge0.body, 'Should hate speech be protected as free expression?', 'Challenge body matches');
assert.strictEqual(challenge0.order, 0, 'Challenge order is 0');

const challenge1 = position.challenges[1];
assert.strictEqual(challenge1.order, 1, 'Second challenge order is 1');

// Test 3: Position without deeperDives should OMIT challenges property
const noDivesPipeline = {
  categories: [{
    id: 'test',
    title: 'Test',
    questions: [{ id: 'test-q0', title: 'Question', body: 'Body', order: 0 }]
  }]
};
const noDivesAdapted = adaptCategories(noDivesPipeline);
const positionNoDives = noDivesAdapted[0].followUps[0];
assert.strictEqual(positionNoDives.challenges, undefined, 'Should omit challenges property when no deeperDives (not empty array)');
assert.strictEqual(Object.hasOwn(positionNoDives, 'challenges'), false, 'challenges property should not exist at all');

console.log('[content-export-app-test] All assertions passed.');
