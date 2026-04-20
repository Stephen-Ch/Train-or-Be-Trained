/**
 * Content schema definitions for Categories, Questions, and Deeper Dives
 */

export interface DeeperDive {
  id: string;
  title: string;
  body: string;
  order: number;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  order: number;
  tlq?: boolean;
  deeperDives?: DeeperDive[];
}

export interface Category {
  id: string;
  title: string;
  order: number;
  description?: string;
  tags?: string[];
  questions: Question[];
}
