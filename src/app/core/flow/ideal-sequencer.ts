/**
 * Pure sequencer for ideal-based flow: 4 positions then their challenges per ideal.
 * 
 * Flow: For each ideal (category):
 * - Present first 4 positions (or fewer if ideal has <4)
 * - Then present all challenges nested under those positions in order
 * - Then move to next ideal
 * 
 * Challenges have no dimension - they are text responses not included in scoring.
 */

import { Category, FollowUp, Challenge } from '../content/types';

export type NextItemPosition = {
  kind: 'position';
  categoryId: string;
  positionId: string;
  statement: string;
  positionIndex: number;
  positionTotal: number;
  idealIndex: number;
  idealTotal: number;
};

export type NextItemChallenge = {
  kind: 'challenge';
  categoryId: string;
  positionId: string;
  challengeId: string;
  title: string;
  body: string;
  challengeIndex: number;
  challengeTotal: number;
  idealIndex: number;
  idealTotal: number;
};

export type NextItem = NextItemPosition | NextItemChallenge;

/**
 * Build the ideal block structure for a given category.
 * 
 * @param category - The category to build the ideal block for
 * @param positionsPerIdeal - Number of positions to include (default 4)
 * @param positionAnswers - Map of position answers for evaluating triggerRules (default empty)
 * @returns Object with positions array and challenges array
 */
export function buildIdealBlock(
  category: Category,
  positionsPerIdeal: number = 4,
  positionAnswers: Record<string, number> = {}
): { positions: FollowUp[]; challenges: Challenge[] } {
  // Get visible followUps in array order, take first N
  const positions = (category.followUps || []).slice(0, positionsPerIdeal);
  
  // Flatten challenges from positions in order
  // Within each position, sort by challenge.order asc for stability
  // Filter by triggerRule if present
  const challenges: Challenge[] = [];
  for (const position of positions) {
    if (position.challenges && position.challenges.length > 0) {
      const sortedChallenges = [...position.challenges].sort((a, b) => a.order - b.order);
      
      // Apply triggerRule filtering
      for (const challenge of sortedChallenges) {
        if (shouldIncludeChallenge(challenge, position.id, positionAnswers)) {
          challenges.push(challenge);
        }
      }
    }
  }
  
  return { positions, challenges };
}

/**
 * Evaluate whether a challenge should be included based on its triggerRule.
 * 
 * @param challenge - The challenge to evaluate
 * @param parentPositionId - The ID of the parent position
 * @param positionAnswers - Map of position answers
 * @returns true if challenge should be included, false otherwise
 */
function shouldIncludeChallenge(
  challenge: Challenge,
  parentPositionId: string,
  positionAnswers: Record<string, number>
): boolean {
  // No triggerRule = always include
  if (!challenge.triggerRule) {
    return true;
  }
  
  const parentAnswer = positionAnswers[parentPositionId];
  
  // No answer yet = don't include (user hasn't reached challenges phase yet)
  if (parentAnswer === undefined) {
    return false;
  }
  
  const { parentAnswerMin, parentAnswerMax } = challenge.triggerRule;
  
  // Check min constraint
  if (parentAnswerMin !== undefined && parentAnswer < parentAnswerMin) {
    return false;
  }
  
  // Check max constraint
  if (parentAnswerMax !== undefined && parentAnswer > parentAnswerMax) {
    return false;
  }
  
  return true;
}

/**
 * Find the next unanswered item in the ideal flow.
 * 
 * Walks ideals in content.categories order. For each ideal:
 * - If any required position missing answer => return that position NextItem
 * - Else if any required challenge missing answer => return that challenge NextItem
 * - Else move to next ideal
 * 
 * Returns null when all items are answered.
 * 
 * @param categories - Array of categories (ideals) in presentation order
 * @param positionAnswers - Map of position IDs to answer values (1-5)
 * @param challengeAnswers - Map of challenge IDs to answer values (text responses stored as number placeholders for now)
 * @param positionsPerIdeal - Number of positions per ideal (default 4)
 * @returns NextItem or null if complete
 */
export function nextUnansweredItem(
  categories: Category[],
  positionAnswers: Record<string, number>,
  challengeAnswers: Record<string, number>,
  positionsPerIdeal: number = 4
): NextItem | null {
  const idealTotal = categories.length;
  
  for (let idealIndex = 0; idealIndex < categories.length; idealIndex++) {
    const category = categories[idealIndex];
    const { positions, challenges } = buildIdealBlock(category, positionsPerIdeal, positionAnswers);
    
    // Check for unanswered positions first
    for (let posIndex = 0; posIndex < positions.length; posIndex++) {
      const position = positions[posIndex];
      if (positionAnswers[position.id] === undefined) {
        return {
          kind: 'position',
          categoryId: category.id,
          positionId: position.id,
          statement: position.statement || position.text || '',
          positionIndex: posIndex,
          positionTotal: positions.length,
          idealIndex,
          idealTotal
        };
      }
    }
    
    // All positions answered, check for unanswered challenges
    for (let chIndex = 0; chIndex < challenges.length; chIndex++) {
      const challenge = challenges[chIndex];
      if (challengeAnswers[challenge.id] === undefined) {
        return {
          kind: 'challenge',
          categoryId: category.id,
          positionId: challenge.id.replace(/-fu\d+$/, ''), // Extract position ID from challenge ID (e.g., liberty-q0-fu0 -> liberty-q0)
          challengeId: challenge.id,
          title: challenge.title,
          body: challenge.body,
          challengeIndex: chIndex,
          challengeTotal: challenges.length,
          idealIndex,
          idealTotal
        };
      }
    }
    
    // This ideal is complete, continue to next
  }
  
  // All ideals complete
  return null;
}
