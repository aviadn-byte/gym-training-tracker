import { describe, expect, it } from 'vitest';
import {
  recommendedTemplateForGoal,
  selectQuickStartDay,
  selectQuickStartProgram
} from './startWorkoutFlow';
import type { PlannedExercise, Program, WorkoutDay, WorkoutSession } from '../../types/models';

const plannedExercise: PlannedExercise = {
  id: 'planned_1',
  exerciseId: 'bench_press_barbell',
  order: 0,
  sets: 3,
  targetRepsMin: 6,
  targetRepsMax: 12,
  targetRpe: 8,
  restSeconds: 120,
  supersetGroup: null
};

const makeProgram = (id: string, updatedAt: string, status: Program['status'] = 'active') =>
  ({
    id,
    name: id,
    goal: 'mixed',
    daysPerWeek: 3,
    status,
    deload: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt
  }) satisfies Program;

const makeDay = (id: string, order: number, exercises = [plannedExercise]) =>
  ({
    id,
    programId: 'program_1',
    name: id,
    order,
    targetDurationMinutes: 60,
    exercises,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }) satisfies WorkoutDay;

const makeSession = (workoutDayId: string, startedAt: string) =>
  ({
    id: `session_${workoutDayId}`,
    workoutDayId,
    programId: 'program_1',
    startedAt,
    completedAt: startedAt,
    notes: '',
    sessionRPE: 8,
    status: 'completed',
    loggedSets: []
  }) satisfies WorkoutSession;

describe('quick start workout selection', () => {
  it('uses the newest active program as the quick-start program', () => {
    const program = selectQuickStartProgram([
      makeProgram('archived', '2026-01-03T00:00:00.000Z', 'archived'),
      makeProgram('old', '2026-01-01T00:00:00.000Z'),
      makeProgram('new', '2026-01-02T00:00:00.000Z')
    ]);

    expect(program?.id).toBe('new');
  });

  it('skips empty days so quick start opens a usable workout', () => {
    const day = selectQuickStartDay(
      [makeDay('empty', 0, []), makeDay('ready', 1)],
      [makeSession('ready', '2026-01-05T10:00:00.000Z')],
      'program_1'
    );

    expect(day?.id).toBe('ready');
  });

  it('maps one goal choice to the recommended program structure', () => {
    expect(recommendedTemplateForGoal('strength')).toBe('upperLower');
    expect(recommendedTemplateForGoal('hypertrophy')).toBe('ppl');
    expect(recommendedTemplateForGoal('mixed')).toBe('fullBody');
  });
});
