import type { Exercise, PlannedExercise } from '../types/models';

const SET_SECONDS = 45;
const EXERCISE_TRANSITION_SECONDS = 75;

export interface AdaptedPlannedExercise extends PlannedExercise {
  originalSets: number;
}

export interface AdaptedWorkoutPlan {
  exercises: AdaptedPlannedExercise[];
  estimatedMinutes: number;
  originalEstimatedMinutes: number;
  removedSets: number;
  isAdapted: boolean;
}

export function estimateWorkoutMinutes(plan: PlannedExercise[]) {
  if (!plan.length) return 0;
  const setSeconds = plan.reduce(
    (sum, exercise) => sum + exercise.sets * (SET_SECONDS + exercise.restSeconds),
    0
  );
  const transitionSeconds = Math.max(0, plan.length - 1) * EXERCISE_TRANSITION_SECONDS;
  return Math.max(1, Math.round((setSeconds + transitionSeconds) / 60));
}

export function adaptPlanToTargetDuration(
  plan: PlannedExercise[],
  targetDurationMinutes: number | null | undefined
): AdaptedWorkoutPlan {
  const originalEstimatedMinutes = estimateWorkoutMinutes(plan);
  const target = targetDurationMinutes ?? 0;
  const exercises = plan.map((exercise) => ({
    ...exercise,
    originalSets: exercise.sets
  }));

  if (!target || originalEstimatedMinutes <= target) {
    return {
      exercises,
      estimatedMinutes: originalEstimatedMinutes,
      originalEstimatedMinutes,
      removedSets: 0,
      isAdapted: false
    };
  }

  let removedSets = 0;
  let estimatedMinutes = originalEstimatedMinutes;

  while (estimatedMinutes > target) {
    const candidateIndex = findSetReductionCandidate(exercises);
    if (candidateIndex === -1) break;
    exercises[candidateIndex] = {
      ...exercises[candidateIndex],
      sets: exercises[candidateIndex].sets - 1
    };
    removedSets += 1;
    estimatedMinutes = estimateWorkoutMinutes(exercises);
  }

  return {
    exercises,
    estimatedMinutes,
    originalEstimatedMinutes,
    removedSets,
    isAdapted: removedSets > 0
  };
}

function findSetReductionCandidate(exercises: AdaptedPlannedExercise[]) {
  let bestIndex = -1;
  let bestScore = -Infinity;

  exercises.forEach((exercise, index) => {
    if (exercise.sets <= 1) return;
    const score = exercise.sets * 100 + index;
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });

  return bestIndex;
}

export function findSmartExerciseSwap(
  currentExerciseId: string,
  exercises: Exercise[],
  usedExerciseIds: Set<string>
) {
  const current = exercises.find((exercise) => exercise.id === currentExerciseId);
  if (!current) return null;

  return (
    exercises
      .filter((exercise) => exercise.id !== current.id && !usedExerciseIds.has(exercise.id))
      .map((exercise) => ({
        exercise,
        score: scoreSwapCandidate(current, exercise)
      }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || a.exercise.nameHe.localeCompare(b.exercise.nameHe, 'he'))
      .at(0)?.exercise ?? null
  );
}

function scoreSwapCandidate(current: Exercise, candidate: Exercise) {
  const primaryMatches = candidate.primaryMuscles.filter((muscle) =>
    current.primaryMuscles.includes(muscle)
  ).length;
  if (!primaryMatches) return 0;

  const secondaryMatches = candidate.secondaryMuscles.filter(
    (muscle) => current.primaryMuscles.includes(muscle) || current.secondaryMuscles.includes(muscle)
  ).length;

  return (
    primaryMatches * 100 +
    secondaryMatches * 10 +
    (candidate.equipment === current.equipment ? 35 : 0) +
    (candidate.primaryMuscles.length === current.primaryMuscles.length ? 5 : 0)
  );
}
