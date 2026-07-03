import type { WorkoutDay, WorkoutSession } from '../types/models';

export function selectNextWorkoutDay(
  days: WorkoutDay[],
  sessions: WorkoutSession[],
  programId: string | null | undefined
) {
  if (!programId) return null;

  const programDays = days
    .filter((day) => day.programId === programId)
    .sort((a, b) => a.order - b.order);

  if (!programDays.length) return null;

  const completedForProgram = sessions
    .filter(
      (session) =>
        session.status === 'completed' &&
        session.programId === programId &&
        Boolean(session.workoutDayId)
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  const lastWorkoutDayId = completedForProgram[0]?.workoutDayId;
  const lastIndex = programDays.findIndex((day) => day.id === lastWorkoutDayId);

  if (lastIndex === -1) return programDays[0];
  return programDays[(lastIndex + 1) % programDays.length];
}
