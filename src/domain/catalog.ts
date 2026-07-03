import type { Equipment, MuscleGroup } from '../types/models';

export const muscleGroups: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core',
  'forearms',
  'traps',
  'adductors',
  'abductors',
  'fullBody'
];

export const equipmentTypes: Equipment[] = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'smith',
  'band',
  'plate',
  'other'
];

export const weightIncrements = [1, 2, 2.5, 5] as const;

