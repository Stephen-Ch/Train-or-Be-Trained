import { adaptPipelineCategoriesToGameContent, PipelineCategory } from './content-adapter';

describe('adaptPipelineCategoriesToGameContent', () => {
  it('produces game-ready categories with structured follow-ups', () => {
    const pipeline: PipelineCategory[] = [{
      id: 'liberty',
      title: 'Liberty',
      description: 'desc',
      quote: 'quote',
      questions: [
        { id: 'liberty-q0', body: 'Protect privacy?' },
        { id: 'liberty-q1', body: 'Regulate speech?', reverse: true, dimension: 'speech' }
      ]
    }];

    const result = adaptPipelineCategoriesToGameContent(pipeline);

    expect(result.length).toBe(1);
    const category = result[0];
    expect(category.name).toBe('Liberty');
    expect(category.followUps.length).toBe(2);
    expect(category.followUps[0].statement).toBe('Protect privacy?');
    expect(category.followUps[0].reverse).toBe(false);
    expect(category.followUps[0].dimension).toBe('liberty-q0');
    expect(category.followUps[1].statement).toBe('Regulate speech?');
    expect(category.followUps[1].reverse).toBe(true);
    expect(category.followUps[1].dimension).toBe('speech');
  });
});
