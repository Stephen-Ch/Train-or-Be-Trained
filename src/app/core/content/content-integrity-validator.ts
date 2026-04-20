/**
 * Canonical content integrity validator
 * Used by content.integrity.spec.ts and admin editor
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ContentToValidate {
  categories?: Array<{
    id: string;
    name?: string;
    description?: string;
    followUps: Array<{
      id: string;
      statement?: string;
      dimension?: string;
      reverse?: unknown;
      challenges?: Array<{
        id: string;
        title?: string;
        body?: string;
        order?: unknown;
        triggerRule?: any; // Use any to allow flexible validation
      }>;
    }>;
  }>;
}

/**
 * Validates runtime content integrity rules.
 * Canonical validator used by content.integrity.spec.ts and admin editor.
 */
export function validateContentIntegrity(content: ContentToValidate): ValidationResult {
  const errors: ValidationError[] = [];
  const categories = Array.isArray(content.categories) ? content.categories : [];

  // Validate expected category count
  if (categories.length !== 7) {
    errors.push({
      field: 'categories',
      message: `Expected 7 categories, found ${categories.length}`
    });
  }

  const allowedPrefixes = new Set(categories.map((category) => category.id));

  categories.forEach((category) => {
    // Validate category name (runtime app content has this field)
    if (category.name !== undefined && (!category.name || category.name.trim().length === 0)) {
      errors.push({
        field: `${category.id}.name`,
        message: `Category name for ${category.id} cannot be empty`
      });
    }

    // Validate category description (runtime app content has this field)
    if (category.description !== undefined && (!category.description || category.description.trim().length === 0)) {
      errors.push({
        field: `${category.id}.description`,
        message: `Category description for ${category.id} cannot be empty`
      });
    }

    // Validate followUps exist
    if (!Array.isArray(category.followUps) || category.followUps.length === 0) {
      errors.push({
        field: `${category.id}.followUps`,
        message: `followUps for ${category.id} must be non-empty array`
      });
      return;
    }

    category.followUps.forEach((followUp) => {
      // Validate statement text (if present in content)
      if (followUp.statement !== undefined && (!followUp.statement || followUp.statement.trim().length === 0)) {
        errors.push({
          field: `${followUp.id}.statement`,
          message: `Statement text for ${followUp.id} cannot be empty`
        });
      }

      const dimension = typeof followUp.dimension === 'string' ? followUp.dimension.trim() : '';

      // Validate dimension string
      if (dimension.length === 0) {
        errors.push({
          field: `${followUp.id}.dimension`,
          message: `dimension string for ${followUp.id} is required`
        });
      } else {
        // Validate dimension prefix
        const prefix = dimension.split('-')[0] ?? '';
        if (!allowedPrefixes.has(prefix)) {
          errors.push({
            field: `${followUp.id}.dimension`,
            message: `dimension prefix for ${followUp.id} is invalid (must match a category ID)`
          });
        }
      }

      // Validate reverse flag
      if (typeof followUp.reverse !== 'boolean') {
        errors.push({
          field: `${followUp.id}.reverse`,
          message: `reverse flag for ${followUp.id} must be boolean`
        });
      }

      // Validate challenges (if present)
      if (followUp.challenges !== undefined) {
        if (!Array.isArray(followUp.challenges)) {
          errors.push({
            field: `${followUp.id}.challenges`,
            message: `challenges for ${followUp.id} must be array`
          });
        } else if (followUp.challenges.length === 0) {
          errors.push({
            field: `${followUp.id}.challenges`,
            message: `challenges property should be omitted when empty, not set to []`
          });
        } else {
          const challengeIds = new Set<string>();
          const challengeOrders: number[] = [];

          followUp.challenges.forEach((challenge) => {
            // Validate id
            if (!challenge.id || typeof challenge.id !== 'string' || challenge.id.trim().length === 0) {
              errors.push({
                field: `${followUp.id}.challenges`,
                message: `Challenge id in ${followUp.id} cannot be empty`
              });
            } else {
              // Check uniqueness
              if (challengeIds.has(challenge.id)) {
                errors.push({
                  field: `${challenge.id}`,
                  message: `Duplicate challenge id ${challenge.id} in ${followUp.id}`
                });
              }
              challengeIds.add(challenge.id);
            }

            // Validate title
            if (challenge.title !== undefined && (!challenge.title || challenge.title.trim().length === 0)) {
              errors.push({
                field: `${challenge.id}.title`,
                message: `Challenge title for ${challenge.id} cannot be empty`
              });
            }

            // Validate body
            if (challenge.body !== undefined && (!challenge.body || challenge.body.trim().length === 0)) {
              errors.push({
                field: `${challenge.id}.body`,
                message: `Challenge body for ${challenge.id} cannot be empty`
              });
            }

            // Validate order
            if (typeof challenge.order === 'number') {
              if (challenge.order < 0) {
                errors.push({
                  field: `${challenge.id}.order`,
                  message: `Challenge order for ${challenge.id} must be >= 0`
                });
              } else {
                challengeOrders.push(challenge.order);
              }
            }

            // Validate triggerRule (optional, TD-RAWLS-011)
            if (challenge.triggerRule !== undefined) {
              const rule = challenge.triggerRule;
              const allowedKeys = new Set(['parentAnswerMin', 'parentAnswerMax', 'tags']);
              
              // Check for unknown keys
              const ruleKeys = Object.keys(rule);
              for (const key of ruleKeys) {
                if (!allowedKeys.has(key)) {
                  errors.push({
                    field: `${challenge.id}.triggerRule`,
                    message: `triggerRule contains unknown key '${key}' for ${challenge.id}`
                  });
                }
              }

              // Validate parentAnswerMin
              if (rule.parentAnswerMin !== undefined) {
                if (typeof rule.parentAnswerMin !== 'number') {
                  errors.push({
                    field: `${challenge.id}.triggerRule.parentAnswerMin`,
                    message: `parentAnswerMin must be a number for ${challenge.id}`
                  });
                } else if (rule.parentAnswerMin < 1 || rule.parentAnswerMin > 5) {
                  errors.push({
                    field: `${challenge.id}.triggerRule.parentAnswerMin`,
                    message: `parentAnswerMin must be 1-5 for ${challenge.id}`
                  });
                }
              }

              // Validate parentAnswerMax
              if (rule.parentAnswerMax !== undefined) {
                if (typeof rule.parentAnswerMax !== 'number') {
                  errors.push({
                    field: `${challenge.id}.triggerRule.parentAnswerMax`,
                    message: `parentAnswerMax must be a number for ${challenge.id}`
                  });
                } else if (rule.parentAnswerMax < 1 || rule.parentAnswerMax > 5) {
                  errors.push({
                    field: `${challenge.id}.triggerRule.parentAnswerMax`,
                    message: `parentAnswerMax must be 1-5 for ${challenge.id}`
                  });
                }
              }

              // Validate min <= max invariant
              if (typeof rule.parentAnswerMin === 'number' && typeof rule.parentAnswerMax === 'number') {
                if (rule.parentAnswerMin > rule.parentAnswerMax) {
                  errors.push({
                    field: `${challenge.id}.triggerRule`,
                    message: `parentAnswerMin must be <= parentAnswerMax for ${challenge.id}`
                  });
                }
              }

              // Validate tags (optional string array)
              if (rule.tags !== undefined) {
                if (!Array.isArray(rule.tags)) {
                  errors.push({
                    field: `${challenge.id}.triggerRule.tags`,
                    message: `tags must be an array for ${challenge.id}`
                  });
                } else {
                  // Validate each tag is a string
                  for (let i = 0; i < rule.tags.length; i++) {
                    if (typeof rule.tags[i] !== 'string') {
                      errors.push({
                        field: `${challenge.id}.triggerRule.tags`,
                        message: `tags must contain only strings for ${challenge.id}`
                      });
                      break;
                    }
                  }
                }
              }
            }
          });

          // Validate order contiguity
          if (challengeOrders.length > 0) {
            const sortedOrders = [...challengeOrders].sort((a, b) => a - b);
            for (let i = 0; i < sortedOrders.length; i++) {
              if (sortedOrders[i] !== i) {
                errors.push({
                  field: `${followUp.id}.challenges`,
                  message: `Challenge order not contiguous in ${followUp.id} (expected ${i}, found ${sortedOrders[i]})`
                });
                break;
              }
            }
          }
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
