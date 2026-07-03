import type { Exercise, LoggedSet, MuscleGroup, PersonalRecord } from '../types/models';

export interface Exposure {
  date: string;
  exerciseId: string;
  bestE1rm: number;
  painScore?: number | null;
}

export interface ProgressionInput {
  loggedSets: LoggedSet[];
  plannedSets: number;
  targetRepsMax: number;
  targetRpe: number | null;
  incrementKg: number;
}

export interface ProgressionSuggestion {
  type: 'increaseWeight' | 'addRep';
  message: string;
  nextWeightDeltaKg?: number;
  nextRepsDelta?: number;
}

export const isWorkingSet = (set: LoggedSet) => set.type === 'working' || set.type === 'amrap';

export function calculateE1RM(set: LoggedSet) {
  if (!isWorkingSet(set) || set.reps < 1 || set.reps > 10 || set.weightKg <= 0) return null;
  return set.weightKg * (1 + set.reps / 30);
}

export function calculateSetVolume(set: LoggedSet) {
  return isWorkingSet(set) ? set.weightKg * set.reps : 0;
}

export function calculateTotalVolume(sets: LoggedSet[]) {
  return sets.reduce((sum, set) => sum + calculateSetVolume(set), 0);
}

export function calculateEffectiveSets(sets: LoggedSet[]) {
  return sets.filter((set) => isWorkingSet(set) && (set.rpe === null || set.rpe >= 7)).length;
}

export function calculateMuscleVolume(sets: LoggedSet[], exercises: Exercise[]) {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const totals = new Map<MuscleGroup, number>();

  sets.forEach((set) => {
    const exercise = byId.get(set.exerciseId);
    const volume = calculateSetVolume(set);
    if (!exercise || volume === 0) return;

    exercise.primaryMuscles.forEach((muscle) => {
      totals.set(muscle, (totals.get(muscle) ?? 0) + volume);
    });
    exercise.secondaryMuscles.forEach((muscle) => {
      totals.set(muscle, (totals.get(muscle) ?? 0) + volume * 0.5);
    });
  });

  return totals;
}

export function derivePersonalRecords(sets: LoggedSet[]): PersonalRecord[] {
  const records = new Map<string, PersonalRecord>();

  sets.forEach((set) => {
    if (!isWorkingSet(set)) return;
    const volume = calculateSetVolume(set);
    const e1rm = calculateE1RM(set);

    const candidates: Array<PersonalRecord | null> = [
      {
        exerciseId: set.exerciseId,
        metric: 'weight',
        value: set.weightKg,
        date: set.timestamp,
        setId: set.id
      },
      {
        exerciseId: set.exerciseId,
        metric: 'volume',
        value: volume,
        date: set.timestamp,
        setId: set.id
      },
      e1rm === null
        ? null
        : {
            exerciseId: set.exerciseId,
            metric: 'e1rm',
            value: e1rm,
            date: set.timestamp,
            setId: set.id
          }
    ];

    candidates.forEach((candidate) => {
      if (!candidate) return;
      const key = `${candidate.exerciseId}:${candidate.metric}`;
      const current = records.get(key);
      if (!current || candidate.value > current.value) {
        records.set(key, candidate);
      }
    });
  });

  return Array.from(records.values());
}

export function wouldSetBeatPr(set: LoggedSet, previousSets: LoggedSet[]) {
  const currentRecords = derivePersonalRecords(previousSets.filter((item) => item.exerciseId === set.exerciseId));
  if (!isWorkingSet(set)) return false;

  return currentRecords.some((record) => {
    if (record.metric === 'weight') return set.weightKg > record.value;
    if (record.metric === 'volume') return calculateSetVolume(set) > record.value;
    const e1rm = calculateE1RM(set);
    return e1rm !== null && e1rm > record.value;
  });
}

export function detectPainAlert(exposures: Exposure[]) {
  const ordered = [...exposures].sort((a, b) => a.date.localeCompare(b.date));
  const highPain = ordered.some((exposure) => (exposure.painScore ?? 0) >= 4);
  const consecutivePain = ordered.some((exposure, index) => {
    if (index === 0) return false;
    return (exposure.painScore ?? 0) > 0 && (ordered[index - 1].painScore ?? 0) > 0;
  });

  return highPain || consecutivePain;
}

export function calculateLinearSlope(values: number[]) {
  const n = values.length;
  if (n < 2) return 0;
  const xs = values.map((_, index) => index + 1);
  const xMean = xs.reduce((sum, value) => sum + value, 0) / n;
  const yMean = values.reduce((sum, value) => sum + value, 0) / n;
  const numerator = values.reduce((sum, y, index) => sum + (xs[index] - xMean) * (y - yMean), 0);
  const denominator = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
  return denominator === 0 ? 0 : numerator / denominator;
}

export function detectStagnation(exposures: Exposure[]) {
  const ordered = [...exposures].sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
  if (ordered.length < 4 || detectPainAlert(ordered)) return false;
  return calculateLinearSlope(ordered.map((exposure) => exposure.bestE1rm)) <= 0;
}

export function suggestDoubleProgression({
  loggedSets,
  plannedSets,
  targetRepsMax,
  targetRpe,
  incrementKg
}: ProgressionInput): ProgressionSuggestion {
  const working = loggedSets.filter(isWorkingSet).slice(0, plannedSets);
  const allSetsCompleted = working.length >= plannedSets;
  const allHitTop = working.every((set) => set.reps >= targetRepsMax);
  const rpeOk =
    targetRpe === null || working.every((set) => set.rpe === null || set.rpe <= targetRpe);

  if (allSetsCompleted && allHitTop && rpeOk) {
    return {
      type: 'increaseWeight',
      message: `העלה ${incrementKg} ק״ג באימון הבא`,
      nextWeightDeltaKg: incrementKg
    };
  }

  return {
    type: 'addRep',
    message: 'נסה להוסיף חזרה בסטים החסרים',
    nextRepsDelta: 1
  };
}

export function detectWeeklyLoadAlert(currentWeekVolume: number, trailingFourWeekVolumes: number[]) {
  const usable = trailingFourWeekVolumes.filter((value) => value > 0);
  if (usable.length < 2) return false;
  const average = usable.reduce((sum, value) => sum + value, 0) / usable.length;
  return currentWeekVolume > average * 1.25;
}

