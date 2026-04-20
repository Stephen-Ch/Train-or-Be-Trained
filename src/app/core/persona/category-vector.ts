/**
 * Fixed category order for 7-vector persona matching
 * Must match the order used in profiles.json idealVector arrays
 */
export const CATEGORY_ORDER = [
  'liberty',
  'equality',
  'community',
  'prosperity',
  'security',
  'fairness',
  'sustainability'
] as const;

/**
 * Builds a 7-element category vector from TLQ answers.
 * 
 * Algorithm:
 * - Extract category from TLQ answer keys (e.g., "liberty-q0" -> "liberty")
 * - Group values by category
 * - Per-category score = round(average(values))
 * - Missing categories default to 3
 * - Clamp all values to 1-5 range
 * 
 * @param answers - Map of TLQ answer keys to 1-5 values
 * @returns 7-element number array aligned to CATEGORY_ORDER
 */
export function buildCategoryVector(answers: Record<string, number>): number[] {
  const categoryGroups = new Map<string, number[]>();
  
  // Group TLQ answers by category prefix
  for (const [key, value] of Object.entries(answers)) {
    const match = key.match(/^(.+)-q\d+$/);
    if (match && typeof value === 'number' && value >= 1 && value <= 5) {
      const category = match[1];
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(value);
    }
  }
  
  // Build 7-vector in fixed order
  return CATEGORY_ORDER.map(category => {
    const values = categoryGroups.get(category);
    if (!values || values.length === 0) {
      return 3; // Default for missing categories
    }
    
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const rounded = Math.round(average);
    
    // Clamp to 1-5
    return Math.max(1, Math.min(5, rounded));
  });
}

/**
 * Converts a 7-element vector to a Record keyed by category names.
 * Used to interface with selectTopPersona which expects Record<string, number>.
 * Only includes categories with actual user answers (omits defaulted 3s).
 */
export function vectorToScores(vector: number[]): Record<string, number> {
  const scores: Record<string, number> = {};
  CATEGORY_ORDER.forEach((category, index) => {
    scores[category] = vector[index] ?? 3;
  });
  return scores;
}

/**
 * Builds a Record of answered-only category scores from TLQ answers.
 * Missing categories are excluded (no default-to-3).
 * Used for persona scoring to only consider ideals the user actually answered.
 */
export function buildAnsweredOnlyScores(answers: Record<string, number>): Record<string, number> {
  const categoryGroups = new Map<string, number[]>();
  
  // Group TLQ answers by category prefix
  for (const [key, value] of Object.entries(answers)) {
    const match = key.match(/^(.+)-q\d+$/);
    if (match && typeof value === 'number' && value >= 1 && value <= 5) {
      const category = match[1];
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(value);
    }
  }
  
  // Build scores for answered categories only
  const scores: Record<string, number> = {};
  for (const [category, values] of categoryGroups.entries()) {
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const rounded = Math.round(average);
    scores[category] = Math.max(1, Math.min(5, rounded));
  }
  
  return scores;
}
