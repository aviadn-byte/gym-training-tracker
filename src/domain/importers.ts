import Papa from 'papaparse';
import { createId, nowIso } from '../db/schema';
import type { Exercise, LoggedSet, SetType, WorkoutSession } from '../types/models';

type CsvRow = Record<string, string | undefined>;

export interface ParsedCsvImport {
  sessions: WorkoutSession[];
  unmatched: string[];
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const pick = (row: CsvRow, keys: string[]) => {
  const found = keys.find((key) => row[key] !== undefined && row[key] !== '');
  return found ? (row[found] ?? '') : '';
};

const parseSetType = (value: string): SetType => {
  const normalized = normalize(value);
  if (normalized.includes('warm')) return 'warmup';
  if (normalized.includes('drop')) return 'drop';
  if (normalized.includes('amrap') || normalized.includes('failure')) return 'amrap';
  return 'working';
};

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? nowIso() : date.toISOString();
};

export function parseWorkoutCsv(
  csvText: string,
  exercises: Exercise[],
  manualMapping: Record<string, string> = {}
): ParsedCsvImport {
  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });

  const byEnglishName = new Map(
    exercises.map((exercise) => [normalize(exercise.nameEn), exercise.id])
  );
  const bySessionKey = new Map<string, WorkoutSession>();
  const unmatched = new Set<string>();

  parsed.data.forEach((row) => {
    const exerciseName = pick(row, [
      'Exercise Name',
      'exercise_title',
      'Exercise',
      'Title',
      'Name'
    ]);
    if (!exerciseName) return;

    const exerciseId = manualMapping[exerciseName] ?? byEnglishName.get(normalize(exerciseName));
    if (!exerciseId) {
      unmatched.add(exerciseName);
      return;
    }

    const dateValue = pick(row, ['Date', 'start_time', 'Start Time', 'Start time']);
    const workoutName = pick(row, ['Workout Name', 'title', 'Workout']) || 'Imported Workout';
    const startedAt = parseDate(dateValue);
    const sessionKey = `${startedAt.slice(0, 10)}:${workoutName}`;
    const existing =
      bySessionKey.get(sessionKey) ??
      ({
        id: createId('session'),
        workoutDayId: null,
        programId: null,
        startedAt,
        completedAt: startedAt,
        notes: workoutName,
        sessionRPE: null,
        status: 'completed',
        loggedSets: [],
        addedExercises: [],
        skippedExerciseIds: []
      } satisfies WorkoutSession);

    const set: LoggedSet = {
      id: createId('set'),
      exerciseId,
      setNumber:
        Number(pick(row, ['Set Order', 'set_index', 'Set'])) || existing.loggedSets.length + 1,
      type: parseSetType(pick(row, ['Set Type', 'set_type', 'Type'])),
      weightKg: Number(pick(row, ['Weight', 'Weight (kg)', 'weight_kg', 'weight'])) || 0,
      reps: Number(pick(row, ['Reps', 'reps'])) || 0,
      rpe: Number(pick(row, ['RPE', 'rpe'])) || null,
      timestamp: startedAt
    };

    existing.loggedSets.push(set);
    bySessionKey.set(sessionKey, existing);
  });

  return { sessions: Array.from(bySessionKey.values()), unmatched: Array.from(unmatched.values()) };
}
