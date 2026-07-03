import { describe, expect, it } from 'vitest';
import { buildExerciseYoutubeSearchUrl } from './exerciseLinks';

describe('buildExerciseYoutubeSearchUrl', () => {
  it('builds a YouTube search URL from the English exercise name', () => {
    const url = buildExerciseYoutubeSearchUrl({
      nameHe: 'לחיצת חזה במוט',
      nameEn: 'Barbell Bench Press'
    });

    expect(url).toBe(
      'https://www.youtube.com/results?search_query=Barbell%20Bench%20Press%20exercise%20tutorial%20proper%20form'
    );
  });
});
