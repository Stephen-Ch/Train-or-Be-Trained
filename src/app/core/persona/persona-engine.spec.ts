import { PersonaDefinition, selectTopPersona } from './persona-engine';

describe('selectTopPersona', () => {
  const createPersona = (
    id: string,
    name: string,
    primaryDimensions: string[]
  ): PersonaDefinition => ({
    id,
    name,
    summary: `Summary for ${name}`,
    primaryDimensions,
  });

  describe('null returns', () => {
    it('returns null when no personas provided', () => {
      const scores = { liberty: 10, equality: 5 };
      expect(selectTopPersona(scores, [])).toBeNull();
    });

    it('returns null when scores is empty', () => {
      const personas = [createPersona('p1', 'Persona 1', ['liberty'])];
      expect(selectTopPersona({}, personas)).toBeNull();
    });
  });

  describe('persona selection', () => {
    it('selects persona whose primaryDimensions align with highest scores', () => {
      const scores = { liberty: 10, equality: 3, security: 2 };
      const personaL = createPersona('L', 'Liberty Persona', ['liberty']);
      const personaE = createPersona('E', 'Equality Persona', ['equality']);
      const personas = [personaL, personaE];

      const result = selectTopPersona(scores, personas);

      expect(result).not.toBeNull();
      expect(result!.persona.id).toBe('L');
    });

    it('selects persona with highest combined score for multiple primaryDimensions', () => {
      const scores = { liberty: 5, equality: 4, security: 10 };
      const personaLE = createPersona('LE', 'Liberty-Equality', ['liberty', 'equality']);
      const personaS = createPersona('S', 'Security', ['security']);
      const personas = [personaLE, personaS];

      const result = selectTopPersona(scores, personas);

      expect(result).not.toBeNull();
      expect(result!.persona.id).toBe('S');
    });

    it('treats missing dimensions as zero', () => {
      const scores = { liberty: 5 };
      const personaL = createPersona('L', 'Liberty', ['liberty']);
      const personaE = createPersona('E', 'Equality', ['equality']);

      const result = selectTopPersona(scores, [personaL, personaE]);

      expect(result).not.toBeNull();
      expect(result!.persona.id).toBe('L');
    });
  });

  describe('tie handling', () => {
    it('handles ties deterministically (first persona wins on tie)', () => {
      const scores = { liberty: 10, equality: 10 };
      const personaL = createPersona('L', 'Liberty', ['liberty']);
      const personaE = createPersona('E', 'Equality', ['equality']);

      const result = selectTopPersona(scores, [personaL, personaE]);

      expect(result).not.toBeNull();
      expect(result!.persona.id).toBe('L');
    });

    it('first persona wins when scores are identical', () => {
      const scores = { dim1: 5, dim2: 5, dim3: 5 };
      const persona1 = createPersona('P1', 'Persona 1', ['dim1']);
      const persona2 = createPersona('P2', 'Persona 2', ['dim2']);
      const persona3 = createPersona('P3', 'Persona 3', ['dim3']);

      const result = selectTopPersona(scores, [persona1, persona2, persona3]);

      expect(result!.persona.id).toBe('P1');
    });
  });

  describe('dominantDimensions ordering', () => {
    it('dominantDimensions are ordered by score contribution (highest first)', () => {
      const scores = { liberty: 10, equality: 5, security: 8 };
      const persona = createPersona('Multi', 'Multi Persona', [
        'equality',
        'liberty',
        'security',
      ]);

      const result = selectTopPersona(scores, [persona]);

      expect(result).not.toBeNull();
      expect(result!.dominantDimensions).toEqual(['liberty', 'security', 'equality']);
    });

    it('maintains stable order for equal score values', () => {
      const scores = { dim1: 5, dim2: 5, dim3: 5 };
      const persona = createPersona('Equal', 'Equal Scores', ['dim1', 'dim2', 'dim3']);

      const result = selectTopPersona(scores, [persona]);

      expect(result).not.toBeNull();
      expect(result!.dominantDimensions.length).toBe(3);
      expect(result!.dominantDimensions).toContain('dim1');
      expect(result!.dominantDimensions).toContain('dim2');
      expect(result!.dominantDimensions).toContain('dim3');
    });

    it('handles single dimension persona correctly', () => {
      const scores = { liberty: 10 };
      const persona = createPersona('Single', 'Single Dimension', ['liberty']);

      const result = selectTopPersona(scores, [persona]);

      expect(result).not.toBeNull();
      expect(result!.dominantDimensions).toEqual(['liberty']);
    });
  });
});
