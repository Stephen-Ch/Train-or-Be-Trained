// Content types for Working With Me assessment

export interface Question {
  id: string;
  statement: string;
  reverse: boolean;     // When true, score is inverted (high agreement = low dimension score)
  quick: boolean;       // Included in the Quick (short) assessment path
  dimension: string;    // Matches parent dimension id
}

// Alias for compatibility with shared components that use FollowUp
export type FollowUp = Question;

export interface Dimension {
  id: string;
  name: string;
  description: string;
  quote: string;
  followUps: Question[];
}

// Alias for compatibility with shared components that use Category
export type Category = Dimension;

export interface Lens {
  id: string;
  label: string;
  description: string;
}

export interface ContentData {
  likert5: string[];
  lenses: Lens[];
  categories: Dimension[];
}

export interface ContentState {
  categories: Dimension[];
  rawCategories?: Dimension[];
  likert5: string[];
  lenses: Lens[];
  loading: boolean;
  error: string | null;
}

/** Dimension score levels used to select output prose blocks */
export type DimensionLevel = 'low' | 'moderate' | 'high';

/** Scored result for a single dimension */
export interface DimensionScore {
  dimensionId: string;
  level: DimensionLevel;
  rawScore: number;      // 0–4 average across answered questions
  answeredCount: number;
}

/** Full assessment result ready for document generation */
export interface AssessmentResult {
  lens: string;
  assessmentDepth: 'quick' | 'full';
  scores: DimensionScore[];
  generatedAt: string;
}
