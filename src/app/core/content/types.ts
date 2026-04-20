// V2 content types for Train or Be Trained

export type Setting = 'A' | 'B' | 'C';
export type ControlId = 'continuity' | 'scope' | 'load' | 'challenge' | 'rigor';

export interface V2Question {
  id: string;
  text: string;
  options: Record<Setting, string>;
}

export interface V2Control {
  id: ControlId;
  name: string;
  description: string;
  questions: V2Question[];
  output: Record<Setting, string>;
}

export interface V2Content {
  version: string;
  options: Setting[];
  controls: V2Control[];
  universalGuardrails: string;
}

export interface V2ContentState {
  content: V2Content | null;
  loading: boolean;
  error: string | null;
}

export interface ControlResult {
  controlId: ControlId;
  setting: Setting;
}

export interface SetupResult {
  controls: ControlResult[];
  generatedAt: string;
}
