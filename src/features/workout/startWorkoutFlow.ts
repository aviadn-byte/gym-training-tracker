import { db, createId, nowIso } from '../../db/schema';
import { createProgramFromTemplate, type TemplateId } from '../../domain/programTemplates';
import { selectNextWorkoutDay } from '../../domain/schedule';
import type { Program, ProgramGoal, WorkoutDay, WorkoutSession } from '../../types/models';

interface StartRecommendedWorkoutInput {
  programs?: Program[];
  days?: WorkoutDay[];
  completedSessions?: WorkoutSession[];
  starterGoal?: ProgramGoal;
}

export function recommendedTemplateForGoal(goal: ProgramGoal): TemplateId {
  if (goal === 'strength') return 'upperLower';
  if (goal === 'hypertrophy') return 'ppl';
  return 'fullBody';
}

export function selectQuickStartProgram(programs: Program[] = []) {
  return programs
    .filter((program) => program.status === 'active')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function selectQuickStartDay(
  days: WorkoutDay[] = [],
  completedSessions: WorkoutSession[] = [],
  programId: string | null | undefined
) {
  if (!programId) return null;
  const programDays = days
    .filter((day) => day.programId === programId)
    .sort((a, b) => a.order - b.order);
  const recommended = selectNextWorkoutDay(programDays, completedSessions, programId);
  if (recommended?.exercises.length) return recommended;
  return programDays.find((day) => day.exercises.length > 0) ?? null;
}

export function buildWorkoutSession(programId: string | null, workoutDayId: string | null) {
  return {
    id: createId('session'),
    workoutDayId,
    programId,
    startedAt: nowIso(),
    completedAt: null,
    notes: '',
    sessionRPE: null,
    status: 'active',
    loggedSets: [],
    addedExercises: [],
    skippedExerciseIds: []
  } satisfies WorkoutSession;
}

export async function startRecommendedWorkout({
  programs = [],
  days = [],
  completedSessions = [],
  starterGoal = 'mixed'
}: StartRecommendedWorkoutInput) {
  const existing = await db.workoutSessions.where('status').equals('active').first();
  if (existing) {
    return { session: existing, createdProgram: false, resumed: true };
  }

  const program = selectQuickStartProgram(programs);
  const day = selectQuickStartDay(days, completedSessions, program?.id);

  if (program && day) {
    const session = buildWorkoutSession(program.id, day.id);
    await db.workoutSessions.put(session);
    return { session, createdProgram: false, resumed: false };
  }

  const starter = createProgramFromTemplate(recommendedTemplateForGoal(starterGoal), starterGoal);
  const starterDay = starter.days[0];
  const session = buildWorkoutSession(starter.program.id, starterDay.id);

  await db.transaction('rw', [db.programs, db.workoutDays, db.workoutSessions], async () => {
    await db.programs.put(starter.program);
    await db.workoutDays.bulkPut(starter.days);
    await db.workoutSessions.put(session);
  });

  return { session, createdProgram: true, resumed: false };
}
