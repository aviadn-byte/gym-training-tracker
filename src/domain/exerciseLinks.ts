import type { Exercise } from '../types/models';

export function buildExerciseYoutubeSearchUrl(exercise: Pick<Exercise, 'nameEn' | 'nameHe'>) {
  const query = `${exercise.nameEn || exercise.nameHe} exercise tutorial proper form`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
