/**
 * Scoring engine for Working With Me.
 * Maps answers to dimension-level scores (low / moderate / high).
 */

import { Dimension, DimensionScore, DimensionLevel, AssessmentResult } from '../content/types';
import { AssessmentDepth } from '../session/session.store';

/**
 * Compute a score 0–4 for a question given the raw answer (0–4) and
 * whether the question is reversed.
 * Reversed: high agreement → low dimension concern (score inverted)
 * Non-reversed: high agreement → high dimension concern
 */
function computeQuestionScore(rawAnswer: number, reverse: boolean): number {
  return reverse ? (4 - rawAnswer) : rawAnswer;
}

/**
 * Classify an average score (0–4) into a DimensionLevel.
 * low:      avg < 1.5
 * moderate: 1.5 ≤ avg < 2.75
 * high:     avg ≥ 2.75
 */
function classifyScore(avg: number): DimensionLevel {
  if (avg < 1.5) return 'low';
  if (avg < 2.75) return 'moderate';
  return 'high';
}

/** Compute dimension scores from raw answers */
export function scoreDimensions(
  dimensions: Dimension[],
  answers: Record<string, number>,
  depth: AssessmentDepth
): DimensionScore[] {
  return dimensions.map((dim) => {
    const questions = depth === 'quick'
      ? dim.followUps.filter((q) => q.quick)
      : dim.followUps;

    const scored = questions
      .filter((q) => q.id in answers)
      .map((q) => computeQuestionScore(answers[q.id], q.reverse));

    const avg = scored.length > 0
      ? scored.reduce((sum, v) => sum + v, 0) / scored.length
      : 2; // default to moderate if no answers

    return {
      dimensionId: dim.id,
      level: classifyScore(avg),
      rawScore: avg,
      answeredCount: scored.length
    };
  });
}

/** Build a full AssessmentResult ready for document generation */
export function buildAssessmentResult(
  dimensions: Dimension[],
  answers: Record<string, number>,
  lens: string,
  depth: AssessmentDepth
): AssessmentResult {
  return {
    lens,
    assessmentDepth: depth,
    scores: scoreDimensions(dimensions, answers, depth),
    generatedAt: new Date().toISOString()
  };
}
