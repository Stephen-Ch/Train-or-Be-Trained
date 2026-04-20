import { Category } from './types';

export interface PipelineQuestion {
  id: string;
  body: string;
  reverse?: boolean;
  dimension?: string;
}

export interface PipelineCategory {
  id: string;
  title: string;
  description?: string;
  quote?: string;
  questions: PipelineQuestion[];
}

export function adaptPipelineCategoriesToGameContent(
  pipelineCategories: PipelineCategory[]
): Category[] {
  return pipelineCategories.map(category => ({
    id: category.id,
    name: category.title,
    description: category.description ?? '',
    quote: category.quote ?? '',
    followUps: category.questions.map(question => ({
      id: question.id,
      statement: question.body,
      reverse: question.reverse ?? false,
      dimension: question.dimension ?? question.id
    }))
  }));
}
