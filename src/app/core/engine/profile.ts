export interface ResultProfile {
  code: string;
  title: string;
  summary: string;
  bullets: string[];
  facets: Record<string, number>;
}

interface FollowUpMeta {
  id: string;
  reverse?: boolean;
}

export function calculateProfileWithReverse(
  answers: Record<string, number>, 
  followUps: FollowUpMeta[]
): ResultProfile {
  const reverseMap = Object.fromEntries(
    followUps.map(f => [f.id, f.reverse || false])
  );
  
  const adjustedAnswers = Object.fromEntries(
    Object.entries(answers).map(([id, value]) => [
      id, 
      reverseMap[id] ? 6 - value : value
    ])
  );
  
  return calculateProfile(adjustedAnswers);
}

export function calculateProfile(answers: Record<string, number>): ResultProfile {
  const values = Object.values(answers);
  if (values.length === 0) {
    return {
      code: 'incomplete',
      title: 'Incomplete Profile',
      summary: 'Complete the survey to see your profile.',
      bullets: ['Take the survey', 'Answer questions', 'Get results'],
      facets: {}
    };
  }

  // Calculate average and normalize to 0-100
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const normalized = ((average - 1) / 4) * 100; // 1-5 scale to 0-100

  // Simple mapping based on normalized score
  if (normalized >= 75) {
    return {
      code: 'idealist',
      title: 'The Principled Idealist',
      summary: 'Values strong ethical principles and justice for all.',
      bullets: ['Champions equality', 'Seeks fairness', 'Values integrity'],
      facets: { justice: normalized, equality: normalized - 10, integrity: normalized - 5 }
    };
  } else if (normalized >= 50) {
    return {
      code: 'moderate',
      title: 'The Balanced Moderate',
      summary: 'Balances idealism with practical considerations.',
      bullets: ['Weighs tradeoffs', 'Seeks balance', 'Values pragmatism'],
      facets: { balance: normalized, pragmatism: normalized + 10, flexibility: normalized }
    };
  } else {
    return {
      code: 'skeptic',
      title: 'The Cautious Skeptic',
      summary: 'Questions assumptions and prefers careful analysis.',
      bullets: ['Questions systems', 'Values evidence', 'Prefers caution'],
      facets: { skepticism: 100 - normalized, analysis: normalized + 20, caution: normalized + 15 }
    };
  }
}