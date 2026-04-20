import { buildCategoryVector, vectorToScores, CATEGORY_ORDER } from './category-vector';

describe('buildCategoryVector', () => {
  it('should build vector with mixed TLQ values averaging correctly', () => {
    const answers = {
      'liberty-q0': 5,
      'liberty-q1': 1,  // avg = 3
      'equality-q0': 5, // avg = 5
      // other categories missing -> default 3
    };

    const result = buildCategoryVector(answers);

    // [liberty=3, equality=5, community=3, prosperity=3, security=3, fairness=3, sustainability=3]
    expect(result).toEqual([3, 5, 3, 3, 3, 3, 3]);
  });

  it('should default missing categories to 3', () => {
    const answers = {};
    const result = buildCategoryVector(answers);
    
    expect(result).toEqual([3, 3, 3, 3, 3, 3, 3]);
  });

  it('should round averages to nearest integer', () => {
    const answers = {
      'liberty-q0': 2,
      'liberty-q1': 3,  // avg = 2.5 -> rounds to 3
      'equality-q0': 4,
      'equality-q1': 5,  // avg = 4.5 -> rounds to 5
    };

    const result = buildCategoryVector(answers);

    expect(result[0]).toBe(3); // liberty
    expect(result[1]).toBe(5); // equality
  });

  it('should clamp values to 1-5 range', () => {
    const answers = {
      'liberty-q0': 1,
      'equality-q0': 5,
    };

    const result = buildCategoryVector(answers);

    expect(result[0]).toBe(1); // min clamp
    expect(result[1]).toBe(5); // max clamp
  });

  it('should ignore invalid answer keys', () => {
    const answers = {
      'liberty-q0': 3,
      'invalid-key': 5,
      'no-q-suffix': 4,
    };

    const result = buildCategoryVector(answers);

    expect(result[0]).toBe(3); // liberty parsed correctly
    // Other categories default to 3
    expect(result.slice(1)).toEqual([3, 3, 3, 3, 3, 3]);
  });

  it('should ignore out-of-range values', () => {
    const answers = {
      'liberty-q0': 0,   // invalid, ignored
      'liberty-q1': 3,   // valid
      'equality-q0': 6,  // invalid, ignored
    };

    const result = buildCategoryVector(answers);

    expect(result[0]).toBe(3); // liberty: only q1=3 counted
    expect(result[1]).toBe(3); // equality: no valid values -> default
  });
});

describe('vectorToScores', () => {
  it('should convert 7-vector to category-keyed scores object', () => {
    const vector = [5, 1, 3, 4, 2, 5, 1];
    const scores = vectorToScores(vector);

    expect(scores['liberty']).toBe(5);
    expect(scores['equality']).toBe(1);
    expect(scores['community']).toBe(3);
    expect(scores['prosperity']).toBe(4);
    expect(scores['security']).toBe(2);
    expect(scores['fairness']).toBe(5);
    expect(scores['sustainability']).toBe(1);
  });

  it('should default to 3 for missing vector elements', () => {
    const vector = [5, 1]; // incomplete vector
    const scores = vectorToScores(vector);

    expect(scores['liberty']).toBe(5);
    expect(scores['equality']).toBe(1);
    expect(scores['community']).toBe(3); // default
    expect(scores['sustainability']).toBe(3); // default
  });

  it('should match CATEGORY_ORDER', () => {
    const vector = [1, 2, 3, 4, 5, 4, 3];
    const scores = vectorToScores(vector);

    CATEGORY_ORDER.forEach((category, i) => {
      expect(scores[category]).toBe(vector[i]);
    });
  });
});
