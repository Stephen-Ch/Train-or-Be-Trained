/**
 * @human content integrity validation tests: generated artifact contract enforcement
 * @proves Validator enforces challenges contract (property omitted when empty, non-empty when present)
 * @lastTouched 2025-12-23
 */import { validateContentIntegrity } from './content-integrity-validator';

const CONTENT_URL = new URL(
  '../../../../assets/content/rawls-values.generated.json',
  import.meta.url,
);

interface GeneratedContent {
  categories?: Array<{
    id: string;
    name?: string;
    description?: string;
    followUps: Array<{
      id: string;
      dimension?: string;
      reverse?: unknown;
    }>;
  }>;
}

async function loadGeneratedContent(): Promise<GeneratedContent> {
  const response = await fetch(CONTENT_URL);
  expect(response.ok).withContext(`fetch ${CONTENT_URL}`).toBeTrue();
  return response.json();
}

describe('generated content integrity', () => {
  it('keeps categories and follow-ups consistent', async () => {
    const content = await loadGeneratedContent();
    
    const validation = validateContentIntegrity(content);
    
    expect(validation.valid).withContext(`validation errors: ${JSON.stringify(validation.errors)}`).toBeTrue();
  });

  it('rejects empty challenges array (contract: omit property when empty)', () => {
    const contentWithEmptyChallenges = {
      categories: [
        {
          id: 'test',
          name: 'Test Category',
          description: 'Test',
          followUps: [
            {
              id: 'test-q0',
              statement: 'Test question',
              dimension: 'test-q0',
              reverse: false,
              challenges: []  // Should be omitted, not empty array
            }
          ]
        },
        { id: 'test2', name: 'T2', description: 'T2', followUps: [{ id: 'test2-q0', statement: 'Q', dimension: 'test2-q0', reverse: false }] },
        { id: 'test3', name: 'T3', description: 'T3', followUps: [{ id: 'test3-q0', statement: 'Q', dimension: 'test3-q0', reverse: false }] },
        { id: 'test4', name: 'T4', description: 'T4', followUps: [{ id: 'test4-q0', statement: 'Q', dimension: 'test4-q0', reverse: false }] },
        { id: 'test5', name: 'T5', description: 'T5', followUps: [{ id: 'test5-q0', statement: 'Q', dimension: 'test5-q0', reverse: false }] },
        { id: 'test6', name: 'T6', description: 'T6', followUps: [{ id: 'test6-q0', statement: 'Q', dimension: 'test6-q0', reverse: false }] },
        { id: 'test7', name: 'T7', description: 'T7', followUps: [{ id: 'test7-q0', statement: 'Q', dimension: 'test7-q0', reverse: false }] }
      ]
    };

    const validation = validateContentIntegrity(contentWithEmptyChallenges);
    expect(validation.valid).withContext('Empty challenges array should be invalid').toBeFalse();
    expect(validation.errors.some(e => e.message.includes('omitted when empty'))).toBeTrue();
  });

  it('accepts absent challenges property (backward compatible)', () => {
    const contentWithNoChallenges = {
      categories: [
        {
          id: 'test',
          name: 'Test Category',
          description: 'Test',
          followUps: [
            {
              id: 'test-q0',
              statement: 'Test question',
              dimension: 'test-q0',
              reverse: false
              // No challenges property - this is valid
            }
          ]
        },
        { id: 'test2', name: 'T2', description: 'T2', followUps: [{ id: 'test2-q0', statement: 'Q', dimension: 'test2-q0', reverse: false }] },
        { id: 'test3', name: 'T3', description: 'T3', followUps: [{ id: 'test3-q0', statement: 'Q', dimension: 'test3-q0', reverse: false }] },
        { id: 'test4', name: 'T4', description: 'T4', followUps: [{ id: 'test4-q0', statement: 'Q', dimension: 'test4-q0', reverse: false }] },
        { id: 'test5', name: 'T5', description: 'T5', followUps: [{ id: 'test5-q0', statement: 'Q', dimension: 'test5-q0', reverse: false }] },
        { id: 'test6', name: 'T6', description: 'T6', followUps: [{ id: 'test6-q0', statement: 'Q', dimension: 'test6-q0', reverse: false }] },
        { id: 'test7', name: 'T7', description: 'T7', followUps: [{ id: 'test7-q0', statement: 'Q', dimension: 'test7-q0', reverse: false }] }
      ]
    };

    const validation = validateContentIntegrity(contentWithNoChallenges);
    expect(validation.valid).withContext(`Validation errors: ${JSON.stringify(validation.errors)}`).toBeTrue();
  });

  it('rejects malformed challenges', () => {
    const contentWithBadChallenge = {
      categories: [
        {
          id: 'test',
          name: 'Test Category',
          description: 'Test',
          followUps: [
            {
              id: 'test-q0',
              statement: 'Test question',
              dimension: 'test-q0',
              reverse: false,
              challenges: [
                {
                  id: 'test-q0-fu0',
                  title: '',  // Empty title should fail
                  body: 'Valid body',
                  order: 0
                }
              ]
            }
          ]
        }
      ]
    };

    const validation = validateContentIntegrity(contentWithBadChallenge);
    expect(validation.valid).withContext('Empty challenge title should be invalid').toBeFalse();
    expect(validation.errors.some(e => e.field.includes('title'))).toBeTrue();
  });

  it('rejects non-contiguous challenge order', () => {
    const contentWithBadOrder = {
      categories: [
        {
          id: 'test',
          name: 'Test Category',
          description: 'Test',
          followUps: [
            {
              id: 'test-q0',
              statement: 'Test question',
              dimension: 'test-q0',
              reverse: false,
              challenges: [
                { id: 'test-q0-fu0', title: 'First', body: 'Body', order: 0 },
                { id: 'test-q0-fu2', title: 'Third', body: 'Body', order: 2 }  // Skips order 1
              ]
            }
          ]
        }
      ]
    };

    const validation = validateContentIntegrity(contentWithBadOrder);
    expect(validation.valid).withContext('Non-contiguous challenge order should be invalid').toBeFalse();
    expect(validation.errors.some(e => e.message.includes('contiguous'))).toBeTrue();
  });

  /**
   * triggerRule contract (TD-RAWLS-011):
   * - Optional property on challenges
   * - Allowed keys: parentAnswerMin (number 1-5), parentAnswerMax (number 1-5), tags (string[])
   * - Invariant: if both min and max present, parentAnswerMin <= parentAnswerMax
   * - Unknown keys rejected
   */
  describe('triggerRule validation', () => {
    it('accepts challenge with valid triggerRule', () => {
      const contentWithTriggerRule = {
        categories: [
          {
            id: 'test',
            name: 'Test Category',
            description: 'Test',
            followUps: [
              {
                id: 'test-q0',
                statement: 'Test question',
                dimension: 'test-q0',
                reverse: false,
                challenges: [
                  {
                    id: 'test-q0-fu0',
                    title: 'High answer challenge',
                    body: 'Explain your strong position',
                    order: 0,
                    triggerRule: {
                      parentAnswerMin: 4,
                      tags: ['pro-test']
                    }
                  }
                ]
              }
            ]
          },
          { id: 'test2', name: 'T2', description: 'T2', followUps: [{ id: 'test2-q0', statement: 'Q', dimension: 'test2-q0', reverse: false }] },
          { id: 'test3', name: 'T3', description: 'T3', followUps: [{ id: 'test3-q0', statement: 'Q', dimension: 'test3-q0', reverse: false }] },
          { id: 'test4', name: 'T4', description: 'T4', followUps: [{ id: 'test4-q0', statement: 'Q', dimension: 'test4-q0', reverse: false }] },
          { id: 'test5', name: 'T5', description: 'T5', followUps: [{ id: 'test5-q0', statement: 'Q', dimension: 'test5-q0', reverse: false }] },
          { id: 'test6', name: 'T6', description: 'T6', followUps: [{ id: 'test6-q0', statement: 'Q', dimension: 'test6-q0', reverse: false }] },
          { id: 'test7', name: 'T7', description: 'T7', followUps: [{ id: 'test7-q0', statement: 'Q', dimension: 'test7-q0', reverse: false }] }
        ]
      };

      const validation = validateContentIntegrity(contentWithTriggerRule);
      expect(validation.valid).withContext(`Validation errors: ${JSON.stringify(validation.errors)}`).toBeTrue();
    });

    it('rejects triggerRule with unknown keys', () => {
      const contentWithBadTriggerRule = {
        categories: [
          {
            id: 'test',
            name: 'Test Category',
            description: 'Test',
            followUps: [
              {
                id: 'test-q0',
                statement: 'Test question',
                dimension: 'test-q0',
                reverse: false,
                challenges: [
                  {
                    id: 'test-q0-fu0',
                    title: 'Challenge',
                    body: 'Body',
                    order: 0,
                    triggerRule: {
                      parentAnswerMin: 4,
                      unknownKey: 'invalid'  // Unknown key should be rejected
                    }
                  }
                ]
              }
            ]
          },
          { id: 'test2', name: 'T2', description: 'T2', followUps: [{ id: 'test2-q0', statement: 'Q', dimension: 'test2-q0', reverse: false }] },
          { id: 'test3', name: 'T3', description: 'T3', followUps: [{ id: 'test3-q0', statement: 'Q', dimension: 'test3-q0', reverse: false }] },
          { id: 'test4', name: 'T4', description: 'T4', followUps: [{ id: 'test4-q0', statement: 'Q', dimension: 'test4-q0', reverse: false }] },
          { id: 'test5', name: 'T5', description: 'T5', followUps: [{ id: 'test5-q0', statement: 'Q', dimension: 'test5-q0', reverse: false }] },
          { id: 'test6', name: 'T6', description: 'T6', followUps: [{ id: 'test6-q0', statement: 'Q', dimension: 'test6-q0', reverse: false }] },
          { id: 'test7', name: 'T7', description: 'T7', followUps: [{ id: 'test7-q0', statement: 'Q', dimension: 'test7-q0', reverse: false }] }
        ]
      };

      const validation = validateContentIntegrity(contentWithBadTriggerRule);
      expect(validation.valid).withContext('triggerRule with unknown keys should be invalid').toBeFalse();
      expect(validation.errors.some(e => e.message.includes('unknown key') || e.message.includes('unknownKey'))).toBeTrue();
    });
  });
});
