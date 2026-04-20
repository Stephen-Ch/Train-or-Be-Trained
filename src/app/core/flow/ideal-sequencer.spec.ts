/**
 * @human Tests pure sequencer for ideal-based flow (4 positions then challenges per ideal)
 * @proves Sequencer picks first unanswered position, then first unanswered challenge per ideal, handles <4 position ideals, skips complete ideals
 * @lastTouched 2025-12-24
 */

import { nextUnansweredItem, buildIdealBlock } from './ideal-sequencer';
import { Category } from '../content/types';

describe('ideal-sequencer', () => {
  describe('buildIdealBlock', () => {
    it('should take first 4 positions and flatten their challenges', () => {
      const category: Category = {
        id: 'test',
        name: 'Test',
        description: '',
        quote: '',
        followUps: [
          { id: 'test-q0', statement: 'Q0', challenges: [
            { id: 'test-q0-fu0', title: 'C1', body: 'Body1', order: 0 },
            { id: 'test-q0-fu1', title: 'C2', body: 'Body2', order: 1 }
          ]},
          { id: 'test-q1', statement: 'Q1' },
          { id: 'test-q2', statement: 'Q2', challenges: [
            { id: 'test-q2-fu0', title: 'C3', body: 'Body3', order: 0 }
          ]},
          { id: 'test-q3', statement: 'Q3' },
          { id: 'test-q4', statement: 'Q4' } // This should be excluded (only take first 4)
        ]
      };
      
      const result = buildIdealBlock(category, 4);
      
      expect(result.positions.length).toBe(4);
      expect(result.positions.map(p => p.id)).toEqual(['test-q0', 'test-q1', 'test-q2', 'test-q3']);
      expect(result.challenges.length).toBe(3);
      expect(result.challenges.map(c => c.id)).toEqual(['test-q0-fu0', 'test-q0-fu1', 'test-q2-fu0']);
    });
    
    it('should handle ideals with fewer than 4 positions', () => {
      const category: Category = {
        id: 'small',
        name: 'Small',
        description: '',
        quote: '',
        followUps: [
          { id: 'small-q0', statement: 'Q0' },
          { id: 'small-q1', statement: 'Q1' }
        ]
      };
      
      const result = buildIdealBlock(category, 4);
      
      expect(result.positions.length).toBe(2);
      expect(result.challenges.length).toBe(0);
    });
    
    it('should sort challenges by order within each position', () => {
      const category: Category = {
        id: 'test',
        name: 'Test',
        description: '',
        quote: '',
        followUps: [
          { id: 'test-q0', statement: 'Q0', challenges: [
            { id: 'test-q0-fu2', title: 'C3', body: 'Body3', order: 2 },
            { id: 'test-q0-fu0', title: 'C1', body: 'Body1', order: 0 },
            { id: 'test-q0-fu1', title: 'C2', body: 'Body2', order: 1 }
          ]}
        ]
      };
      
      const result = buildIdealBlock(category, 4);
      
      expect(result.challenges.map(c => c.id)).toEqual(['test-q0-fu0', 'test-q0-fu1', 'test-q0-fu2']);
    });
  });
  
  describe('nextUnansweredItem', () => {
    const mockCategories: Category[] = [
      {
        id: 'liberty',
        name: 'Liberty',
        description: '',
        quote: '',
        followUps: [
          { id: 'liberty-q0', statement: 'Freedom Q0', challenges: [
            { id: 'liberty-q0-fu0', title: 'Hate speech', body: 'Explain', order: 0 },
            { id: 'liberty-q0-fu1', title: 'Lies', body: 'Explain', order: 1 }
          ]},
          { id: 'liberty-q1', statement: 'Freedom Q1' },
          { id: 'liberty-q2', statement: 'Freedom Q2' },
          { id: 'liberty-q3', statement: 'Freedom Q3' }
        ]
      },
      {
        id: 'equality',
        name: 'Equality',
        description: '',
        quote: '',
        followUps: [
          { id: 'equality-q0', statement: 'Equal Q0' },
          { id: 'equality-q1', statement: 'Equal Q1' },
          { id: 'equality-q2', statement: 'Equal Q2' },
          { id: 'equality-q3', statement: 'Equal Q3' }
        ]
      }
    ];
    
    it('should return first position when no answers', () => {
      const result = nextUnansweredItem(mockCategories, {}, {}, 4);
      
      expect(result).not.toBeNull();
      expect(result!.kind).toBe('position');
      expect(result!.categoryId).toBe('liberty');
      if (result!.kind === 'position') {
        expect(result!.positionId).toBe('liberty-q0');
        expect(result!.statement).toBe('Freedom Q0');
        expect(result!.positionIndex).toBe(0);
        expect(result!.positionTotal).toBe(4);
        expect(result!.idealIndex).toBe(0);
        expect(result!.idealTotal).toBe(2);
      }
    });
    
    it('should return second position when first is answered', () => {
      const result = nextUnansweredItem(
        mockCategories,
        { 'liberty-q0': 3 },
        {},
        4
      );
      
      expect(result).not.toBeNull();
      expect(result!.kind).toBe('position');
      if (result!.kind === 'position') {
        expect(result!.positionId).toBe('liberty-q1');
        expect(result!.positionIndex).toBe(1);
      }
    });
    
    it('should return first challenge after all 4 positions answered', () => {
      const positionAnswers = {
        'liberty-q0': 3,
        'liberty-q1': 4,
        'liberty-q2': 5,
        'liberty-q3': 2
      };
      
      const result = nextUnansweredItem(mockCategories, positionAnswers, {}, 4);
      
      expect(result).not.toBeNull();
      expect(result!.kind).toBe('challenge');
      expect(result!.categoryId).toBe('liberty');
      if (result!.kind === 'challenge') {
        expect(result!.challengeId).toBe('liberty-q0-fu0');
        expect(result!.title).toBe('Hate speech');
        expect(result!.body).toBe('Explain');
        expect(result!.challengeIndex).toBe(0);
        expect(result!.challengeTotal).toBe(2);
        expect(result!.idealIndex).toBe(0);
        expect(result!.idealTotal).toBe(2);
      }
    });
    
    it('should skip to second challenge when first is answered', () => {
      const positionAnswers = {
        'liberty-q0': 3,
        'liberty-q1': 4,
        'liberty-q2': 5,
        'liberty-q3': 2
      };
      const challengeAnswers = {
        'liberty-q0-fu0': 1 // Placeholder number for text response
      };
      
      const result = nextUnansweredItem(mockCategories, positionAnswers, challengeAnswers, 4);
      
      expect(result).not.toBeNull();
      expect(result!.kind).toBe('challenge');
      if (result!.kind === 'challenge') {
        expect(result!.challengeId).toBe('liberty-q0-fu1');
        expect(result!.challengeIndex).toBe(1);
      }
    });
    
    it('should move to next ideal after completing all positions and challenges', () => {
      const positionAnswers = {
        'liberty-q0': 3,
        'liberty-q1': 4,
        'liberty-q2': 5,
        'liberty-q3': 2
      };
      const challengeAnswers = {
        'liberty-q0-fu0': 1,
        'liberty-q0-fu1': 1
      };
      
      const result = nextUnansweredItem(mockCategories, positionAnswers, challengeAnswers, 4);
      
      expect(result).not.toBeNull();
      expect(result!.kind).toBe('position');
      expect(result!.categoryId).toBe('equality');
      if (result!.kind === 'position') {
        expect(result!.positionId).toBe('equality-q0');
        expect(result!.idealIndex).toBe(1);
      }
    });
    
    it('should return null when all ideals complete', () => {
      const positionAnswers = {
        'liberty-q0': 3,
        'liberty-q1': 4,
        'liberty-q2': 5,
        'liberty-q3': 2,
        'equality-q0': 3,
        'equality-q1': 4,
        'equality-q2': 5,
        'equality-q3': 2
      };
      const challengeAnswers = {
        'liberty-q0-fu0': 1,
        'liberty-q0-fu1': 1
      };
      
      const result = nextUnansweredItem(mockCategories, positionAnswers, challengeAnswers, 4);
      
      expect(result).toBeNull();
    });
    
    it('should handle ideal with fewer than 4 positions', () => {
      const smallCategories: Category[] = [
        {
          id: 'small',
          name: 'Small',
          description: '',
          quote: '',
          followUps: [
            { id: 'small-q0', statement: 'Q0' },
            { id: 'small-q1', statement: 'Q1' }
          ]
        }
      ];
      
      const result = nextUnansweredItem(smallCategories, { 'small-q0': 3 }, {}, 4);
      
      expect(result).not.toBeNull();
      expect(result!.kind).toBe('position');
      if (result!.kind === 'position') {
        expect(result!.positionId).toBe('small-q1');
        expect(result!.positionTotal).toBe(2); // Only 2 positions available
      }
    });
  });

  describe('triggerRule filtering', () => {
    it('should include challenge with NO triggerRule in required-set', () => {
      const categories: Category[] = [
        {
          id: 'test',
          name: 'Test',
          description: '',
          quote: '',
          followUps: [
            { id: 'test-q0', statement: 'Position 0', challenges: [
              { id: 'test-q0-fu0', title: 'Always show', body: 'No trigger', order: 0 }
              // No triggerRule property - should always be included
            ]}
          ]
        }
      ];
      
      const positionAnswers = { 'test-q0': 2 }; // Answer is 2 (neutral)
      const challengeAnswers = {};
      
      const result = nextUnansweredItem(categories, positionAnswers, challengeAnswers, 4);
      
      expect(result).not.toBeNull();
      expect(result!.kind).toBe('challenge');
      if (result!.kind === 'challenge') {
        expect(result!.challengeId).toBe('test-q0-fu0');
      }
    });
    
    it('should EXCLUDE challenge when parent answer is OUTSIDE triggerRule range', () => {
      const categories: Category[] = [
        {
          id: 'test',
          name: 'Test',
          description: '',
          quote: '',
          followUps: [
            { id: 'test-q0', statement: 'Position 0', challenges: [
              { 
                id: 'test-q0-fu0', 
                title: 'High answer only', 
                body: 'For strong positions', 
                order: 0,
                triggerRule: { parentAnswerMin: 4 } // Only show if answer >= 4
              }
            ]}
          ]
        }
      ];
      
      const positionAnswers = { 'test-q0': 2 }; // Answer is 2, rule requires >= 4
      const challengeAnswers = {};
      
      const result = nextUnansweredItem(categories, positionAnswers, challengeAnswers, 4);
      
      // Should return null because challenge should be filtered out
      expect(result).toBeNull();
    });
    
    it('should INCLUDE challenge when parent answer is WITHIN triggerRule range', () => {
      const categories: Category[] = [
        {
          id: 'test',
          name: 'Test',
          description: '',
          quote: '',
          followUps: [
            { id: 'test-q0', statement: 'Position 0', challenges: [
              { 
                id: 'test-q0-fu0', 
                title: 'High answer only', 
                body: 'For strong positions', 
                order: 0,
                triggerRule: { parentAnswerMin: 4 } // Only show if answer >= 4
              }
            ]}
          ]
        }
      ];
      
      const positionAnswers = { 'test-q0': 5 }; // Answer is 5, rule requires >= 4
      const challengeAnswers = {};
      
      const result = nextUnansweredItem(categories, positionAnswers, challengeAnswers, 4);
      
      expect(result).not.toBeNull();
      expect(result!.kind).toBe('challenge');
      if (result!.kind === 'challenge') {
        expect(result!.challengeId).toBe('test-q0-fu0');
      }
    });
  });
});
