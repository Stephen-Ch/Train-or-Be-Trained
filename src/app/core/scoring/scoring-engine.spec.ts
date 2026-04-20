import { AnsweredFollowup, computeDimensionScores } from './scoring-engine';

describe('computeDimensionScores', () => {
  const build = (override: Partial<AnsweredFollowup> = {}): AnsweredFollowup => ({
    dimension: 'base',
    reverse: false,
    value: 3,
    ...override
  });

  it('sums non-reversed answers per dimension', () => {
    expect(
      computeDimensionScores([
        build({ dimension: 'liberty', value: 4 }),
        build({ dimension: 'equality', value: 2 }),
        build({ dimension: 'liberty', value: 1 })
      ])
    ).toEqual({ liberty: 5, equality: 2 });
  });

  it('applies reverse scoring for reversed items', () => {
    expect(
      computeDimensionScores([
        build({ dimension: 'fairness', value: 5 }),
        build({ dimension: 'fairness', reverse: true, value: 2 })
      ])['fairness']
    ).toBe(5 + (6 - 2));
  });

  it('ignores obviously invalid inputs', () => {
    expect(
      computeDimensionScores([
        build({ dimension: '', value: 4 }),
        build({ dimension: 'security', value: 7 }),
        build({ dimension: 'security', value: 3 })
      ])
    ).toEqual({ security: 3 });
  });
});
