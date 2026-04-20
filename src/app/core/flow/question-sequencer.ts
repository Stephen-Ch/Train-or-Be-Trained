/**
 * Sequencer for Working With Me assessment flow.
 * Iterates through all dimensions in order, presenting questions
 * filtered by depth (quick or full).
 */

import { Dimension } from '../content/types';
import { AssessmentDepth } from '../session/session.store';

export interface SequencedQuestion {
  dimensionId: string;
  dimensionName: string;
  questionId: string;
  statement: string;
  reverse: boolean;
  dimensionIndex: number;   // 0-based
  dimensionTotal: number;
  questionIndex: number;    // Within dimension, 0-based
  questionTotal: number;    // Questions in this dimension
  overallIndex: number;     // Across all questions, 0-based
  overallTotal: number;
}

/** Build the full ordered question sequence for a given depth */
export function buildSequence(
  dimensions: Dimension[],
  depth: AssessmentDepth
): SequencedQuestion[] {
  const sequence: SequencedQuestion[] = [];

  const filtered = dimensions.map((dim) => ({
    dim,
    questions: depth === 'quick'
      ? dim.followUps.filter((q) => q.quick)
      : dim.followUps
  })).filter((d) => d.questions.length > 0);

  const overallTotal = filtered.reduce((sum, d) => sum + d.questions.length, 0);
  let overallIndex = 0;

  filtered.forEach(({ dim, questions }, dimIndex) => {
    questions.forEach((q, qIndex) => {
      sequence.push({
        dimensionId: dim.id,
        dimensionName: dim.name,
        questionId: q.id,
        statement: q.statement,
        reverse: q.reverse,
        dimensionIndex: dimIndex,
        dimensionTotal: filtered.length,
        questionIndex: qIndex,
        questionTotal: questions.length,
        overallIndex,
        overallTotal
      });
      overallIndex++;
    });
  });

  return sequence;
}

/** Find the next unanswered question index in the sequence */
export function findNextUnanswered(
  sequence: SequencedQuestion[],
  answers: Record<string, number>
): number {
  return sequence.findIndex((q) => !(q.questionId in answers));
}
