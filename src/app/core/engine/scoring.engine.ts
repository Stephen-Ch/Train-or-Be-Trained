import { Setting, ControlId, V2Control, ControlResult, SetupResult } from '../content/types';

/**
 * V2 scoring engine for Train or Be Trained.
 * For each control, averages the numeric values of the two answers
 * (A=0, B=1, C=2) and maps to a setting.
 * avg <= 0.5 → A | avg >= 1.5 → C | otherwise → B
 */
export function scoreSetup(
  answers: Record<string, Setting>,
  controls: V2Control[]
): SetupResult {
  const controlResults: ControlResult[] = controls.map(control => {
    const values: number[] = control.questions
      .map(q => {
        const answer = answers[q.id];
        if (!answer) return null;
        return answer === 'A' ? 0 : answer === 'C' ? 2 : 1;
      })
      .filter((v): v is NonNullable<typeof v> => v !== null) as number[];

    let setting: Setting = 'B';
    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      const avg = sum / values.length;
      setting = avg <= 0.5 ? 'A' : avg >= 1.5 ? 'C' : 'B';
    }

    return { controlId: control.id as ControlId, setting };
  });

  return {
    controls: controlResults,
    generatedAt: new Date().toISOString()
  };
}
