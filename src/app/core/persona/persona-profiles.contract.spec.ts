import profilesData from '../../../assets/personas/profiles.json';
import { selectTopPersona } from './persona-engine';

describe('Legacy Persona Data Contract', () => {
  let profiles: any;

  beforeEach(() => {
    profiles = profilesData.profiles;
  });

  describe('profiles.json structure', () => {
    it('should parse and be an object with profiles property', () => {
      expect(profilesData).toBeDefined();
      expect(profiles).toBeDefined();
      expect(typeof profiles).toBe('object');
    });

    it('should contain exactly 13 profiles', () => {
      const profileKeys = Object.keys(profiles);
      expect(profileKeys.length).toBe(13);
    });

    it('every profile should have required string fields', () => {
      Object.values(profiles).forEach((profile: any) => {
        expect(typeof profile.label).toBe('string');
        expect(profile.label.length).toBeGreaterThan(0);
        
        expect(typeof profile.summary).toBe('string');
        expect(profile.summary.length).toBeGreaterThan(0);
        
        expect(typeof profile.insight).toBe('string');
        expect(profile.insight.length).toBeGreaterThan(0);
      });
    });

    it('every profile should have idealVector as array of length 7', () => {
      Object.values(profiles).forEach((profile: any) => {
        expect(Array.isArray(profile.idealVector)).toBe(true);
        expect(profile.idealVector.length).toBe(7);
      });
    });

    it('every idealVector value should be a number within 1-5 range', () => {
      Object.values(profiles).forEach((profile: any) => {
        profile.idealVector.forEach((value: any) => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(5);
        });
      });
    });
  });

  describe('engine + data integration', () => {
    it('should return exact match when user vector equals profile idealVector', () => {
      // Use first profile's idealVector as test case
      const firstProfileSlug = Object.keys(profiles)[0];
      const firstProfile = profiles[firstProfileSlug];
      
      // Build dimension scores from idealVector (assuming 7 category order)
      const categoryOrder = ['liberty', 'equality', 'community', 'prosperity', 'security', 'fairness', 'sustainability'];
      const scores: Record<string, number> = {};
      firstProfile.idealVector.forEach((value: number, index: number) => {
        scores[categoryOrder[index]] = value;
      });
      
      // Build personas array for engine (using simplified structure for test)
      const testPersonas = Object.entries(profiles).map(([slug, data]: [string, any]) => ({
        id: slug,
        name: data.label,
        summary: data.summary,
        primaryDimensions: categoryOrder.filter((_, i) => data.idealVector[i] === 5)
      }));
      
      const result = selectTopPersona(scores, testPersonas);
      
      expect(result).not.toBeNull();
      expect(result!.persona.id).toBe(firstProfileSlug);
    });
  });
});
