/**
 * UI Terminology Dictionary
 * 
 * Enforces Core Rule #7 "Terminology Lock":
 * - UI labels are for communication only
 * - Data keys (category/followUp) remain unchanged
 * - Never infer data shape from UI labels
 */

export const TERMINOLOGY = {
  /** UI label for categories (data key: category/categories) */
  IDEAL_SINGULAR: 'Ideal',
  IDEAL_PLURAL: 'Ideals',
  IDEAL_LABEL: 'Ideal',

  /** UI label for followUps (data key: followUp/followUps) */
  POSITION_SINGULAR: 'Position',
  POSITION_PLURAL: 'Positions',

  /** UI label for nested challenges (data key: challenge/challenges) */
  CHALLENGE_SINGULAR: 'Challenge',
  CHALLENGE_PLURAL: 'Challenges',
  CHALLENGE_LABEL: 'Challenge',
  YOUR_POSITION_LABEL: 'Your Position',

  /** 5-point Likert scale labels (static, matches production JSON) */
  SCALE_LABELS: [
    'Strongly Disagree',
    'Disagree',
    'Neutral',
    'Agree',
    'Strongly Agree'
  ] as const,

  /** Scale endpoints for axis labels */
  SCALE_AXIS_LEFT: 'Disagree',
  SCALE_AXIS_RIGHT: 'Agree',

  /** 5-point Importance scale labels (for "How important is..." questions) */
  IMPORTANCE_SCALE_LABELS: [
    'Not',
    'Slightly',
    'Moderately',
    'Very',
    'Extremely'
  ] as const,

  /** Importance scale endpoints for axis labels */
  IMPORTANCE_AXIS_LEFT: 'Not important',
  IMPORTANCE_AXIS_RIGHT: 'Extremely important',

  /** Admin UI labels */
  ADMIN_EXPORT_PATCH: 'Export Patch',
  ADMIN_RESET_DRAFT: 'Reset Draft',
  ADMIN_SAVE_AND_EXPORT: 'Save & Export',
  ADMIN_MOVE_UP: 'Move up',
  ADMIN_MOVE_DOWN: 'Move down',
  ADMIN_HIDE: 'Hide',
  ADMIN_UNHIDE: 'Unhide',
  ADMIN_HIDDEN_TAG: 'Hidden',

  /** Session complete empty state */
  SESSION_COMPLETE_TITLE: 'Session complete',
  SESSION_COMPLETE_BODY: 'You have completed the selected ideals.',
  GO_TO_REVIEW: 'Go to Review',
  START_FRESH: 'Start Fresh',

  /** Veil of ignorance reminder */
  VEIL_MICRO: 'Mindset: Veil of ignorance',
  VEIL_TOGGLE: 'What mindset?',
  VEIL_BODY: 'Imagine you could be anyone in this society. Answer for the fairest outcome, not just yourself.',
  VEIL_ACK: 'Got it',

  /** Results page share/export labels */
  SHARE_RESULTS: 'Share Results',
  DOWNLOAD_PNG: 'Download PNG',
  EXPORTING: 'Exporting...',
} as const;
