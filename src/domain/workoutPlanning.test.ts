import { describe, expect, it } from 'vitest';
import type { Exercise, PlannedExercise } from '../types/models';
import { adaptPlanToTargetDuration, findSmartExerciseSwap } from './workoutPlanning';

const makePlanned = (id: string, sets: number, restSeconds = 120): PlannedExercise => ({
  id,
  exerciseId: id,
  order: 0,
  sets,
  targetRepsMin: 8,
  targetRepsMax: 12,
  targetRpe: 8,
  restSeconds,
  supersetGroup: null
});

const makeExercise = (
  id: string,
  primaryMuscles: Exercise['primaryMuscles'],
  equipment: Exercise['equipment']
): Exercise => ({
  id,
  nameHe: id,
  nameEn: id,
  primaryMuscles,
  secondaryMuscles: [],
  equipment,
  isCustom: false,
  notes: '',
  weightIncrementKg: 2.5,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

describe('adaptPlanToTargetDuration', () => {
  it('reduces sets until the plan fits the target as much as possible', () => {
    const result = adaptPlanToTargetDuration(
      [makePlanned('bench', 4, 180), makePlanned('row', 4, 180), makePlanned('curl', 3, 120)],
      20
    );

    expect(result.isAdapted).toBe(true);
    expect(result.removedSets).toBeGreaterThan(0);
    expect(result.estimatedMinutes).toBeLessThanOrEqual(result.originalEstimatedMinutes);
    expect(result.exercises.every((exercise) => exercise.sets >= 1)).toBe(true);
  });

  it('keeps the original plan when there is enough time', () => {
    const result = adaptPlanToTargetDuration([makePlanned('bench', 3)], 90);

    expect(result.isAdapted).toBe(false);
    expect(result.removedSets).toBe(0);
    expect(result.exercises[0].sets).toBe(3);
  });
});

describe('findSmartExerciseSwap', () => {
  it('prefers an unused exercise with the same primary muscle and equipment', () => {
    const replacement = findSmartExerciseSwap(
      'bench',
      [
        makeExercise('bench', ['chest'], 'barbell'),
        makeExercise('machine_press', ['chest'], 'machine'),
        makeExercise('incline_barbell', ['chest'], 'barbell'),
        makeExercise('row', ['back'], 'barbell')
      ],
      new Set(['bench'])
    );

    expect(replacement?.id).toBe('incline_barbell');
  });

  it('does not return exercises that are already used in the current plan', () => {
    const replacement = findSmartExerciseSwap(
      'bench',
      [
        makeExercise('bench', ['chest'], 'barbell'),
        makeExercise('incline_barbell', ['chest'], 'barbell')
      ],
      new Set(['bench', 'incline_barbell'])
    );

    expect(replacement).toBeNull();
  });
});
