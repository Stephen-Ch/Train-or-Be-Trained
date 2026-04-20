/**
 * QuestionV2 UI Copy Dictionary
 * Centralizes meta line + tutor narration copy for semantic hierarchy + editability
 * Copy content sourced from JSON for easy editing without touching TypeScript
 */

import copyJson from './qv2-tutor-copy.json';

export const META_LINE_TEMPLATE = (idealTitle: string) =>
  copyJson.metaLineTemplate.replace('{idealTitle}', idealTitle);

export const IDEAL_NARRATION_MAP: Record<string, string> = copyJson.idealNarrationMap;

export interface ReflectionBuckets {
  low: string;
  mid: string;
  high: string;
}

export const REFLECTION_BUCKETS_GENERIC: ReflectionBuckets = copyJson.reflectionBucketsGeneric;

export const REFLECTION_BUCKETS_LIBERTY: ReflectionBuckets = copyJson.reflectionBucketsLiberty;

export const UNANSWERED_GENERIC = copyJson.unansweredGeneric;

export const UNANSWERED_LIBERTY = copyJson.unansweredLiberty;
