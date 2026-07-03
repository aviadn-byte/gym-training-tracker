import { describe, expect, it } from 'vitest';
import { selectNextWorkoutDay } from './schedule';
import type { WorkoutDay, WorkoutSession } from '../types/models';

const makeDay = (id: string, order: number, programId = 'program_1'): WorkoutDay => ({
  id,
  programId,
  name: id,
  order,
  exercises: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
});

const makeSession = (
  workoutDayId: string,
  startedAt: string,
  programId = 'program_1'
): WorkoutSession => ({
  id: `session_${workoutDayId}_${startedAt}`,
  workoutDayId,
  programId,
  startedAt,
  completedAt: startedAt,
  notes: '',
  sessionRPE: 8,
  status: 'completed',
  loggedSets: []
});

describe('selectNextWorkoutDay', () => {
  it('starts from the first ordered day when there is no history', () => {
    const next = selectNextWorkoutDay([makeDay('pull', 2), makeDay('push', 1)], [], 'program_1');
    expect(next?.id).toBe('push');
  });

  it('selects the day after the latest completed workout', () => {
    const next = selectNextWorkoutDay(
      [makeDay('push', 1), makeDay('pull', 2), makeDay('legs', 3)],
      [
        makeSession('push', '2026-01-05T10:00:00.000Z'),
        makeSession('pull', '2026-01-07T10:00:00.000Z')
      ],
      'program_1'
    );

    expect(next?.id).toBe('legs');
  });

  it('wraps back to the first day after the last day', () => {
    const next = selectNextWorkoutDay(
      [makeDay('push', 1), makeDay('pull', 2)],
      [makeSession('pull', '2026-01-07T10:00:00.000Z')],
      'program_1'
    );

    expect(next?.id).toBe('push');
  });
});
