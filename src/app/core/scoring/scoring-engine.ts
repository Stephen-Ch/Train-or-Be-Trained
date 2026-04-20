export interface AnsweredFollowup {
  dimension: string;
  reverse: boolean;
  value: number;
}

export function computeDimensionScores(answers: AnsweredFollowup[]): Record<string, number> {
  return answers.reduce<Record<string, number>>((totals, answer) => {
    const dimension = typeof answer?.dimension === 'string' ? answer.dimension.trim() : '';
    const value = typeof answer?.value === 'number' ? answer.value : 0;
    if (!dimension || value < 1 || value > 5) {
      return totals;
    }

    const effective = answer.reverse ? 6 - value : value;
    totals[dimension] = (totals[dimension] ?? 0) + effective;
    return totals;
  }, {});
}
