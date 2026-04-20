export interface PersonaDefinition {
  id: string;
  name: string;
  /** Short label for UI; 1–2 sentences max. */
  summary: string;
  /** Dimensions this persona "cares about most". */
  primaryDimensions: string[];
}

export interface PersonaMatch {
  persona: PersonaDefinition;
  dominantDimensions: string[];
}

export interface IdealContribution {
  idealName: string;
  userScore: number;
  personaEmphasis: 'primary' | 'secondary';
}

/**
 * Selects the top persona based on how well dimension scores align with each persona's primary dimensions.
 *
 * @param scores - A record of dimension names to their numeric scores.
 * @param personas - An array of persona definitions to consider.
 * @returns The best matching persona with its dominant dimensions sorted by score, or null if no match is possible.
 */
export function selectTopPersona(
  scores: Record<string, number>,
  personas: PersonaDefinition[]
): PersonaMatch | null {
  if (personas.length === 0 || Object.keys(scores).length === 0) {
    return null;
  }

  let bestPersona: PersonaDefinition | null = null;
  let bestScore = -Infinity;

  for (const persona of personas) {
    const personaScore = persona.primaryDimensions.reduce(
      (sum, dim) => sum + (scores[dim] ?? 0),
      0
    );

    if (personaScore > bestScore) {
      bestScore = personaScore;
      bestPersona = persona;
    }
  }

  if (!bestPersona) {
    return null;
  }

  const dominantDimensions = [...bestPersona.primaryDimensions].sort((a, b) => {
    const scoreA = scores[a] ?? 0;
    const scoreB = scores[b] ?? 0;
    return scoreB - scoreA;
  });

  return {
    persona: bestPersona,
    dominantDimensions,
  };
}
<<<<<<< HEAD

/**
 * Computes the top contributing ideals for a persona match.
 * Only includes ideals that the user actually answered.
 * 
 * @param scores - User's answered-only scores (from buildAnsweredOnlyScores)
 * @param persona - The selected persona
 * @returns Top 3 (or fewer) contributions sorted by impact
 */
export function computeTopContributions(
  scores: Record<string, number>,
  persona: PersonaDefinition
): IdealContribution[] {
  const contributions: IdealContribution[] = [];
  
  for (const [idealName, userScore] of Object.entries(scores)) {
    const isPrimary = persona.primaryDimensions.includes(idealName);
    const contribution = userScore * (isPrimary ? 2 : 1);
    
    contributions.push({
      idealName,
      userScore,
      personaEmphasis: isPrimary ? 'primary' : 'secondary'
    });
  }
  
  // Sort by contribution score desc, take top 3
  contributions.sort((a, b) => {
    const scoreA = a.userScore * (a.personaEmphasis === 'primary' ? 2 : 1);
    const scoreB = b.userScore * (b.personaEmphasis === 'primary' ? 2 : 1);
    return scoreB - scoreA;
  });
  
  return contributions.slice(0, 3);
}
