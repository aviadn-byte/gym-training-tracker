import Dexie, { type Table } from 'dexie';
import type {
  AppPreferences,
  BodyWeightEntry,
  Exercise,
  Program,
  WorkoutDay,
  WorkoutSession
} from '../types/models';

export class TrainingDatabase extends Dexie {
  exercises!: Table<Exercise, string>;
  programs!: Table<Program, string>;
  workoutDays!: Table<WorkoutDay, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  bodyWeightEntries!: Table<BodyWeightEntry, string>;
  preferences!: Table<AppPreferences, string>;

  constructor() {
    super('training-tracker-db');

    this.version(1).stores({
      exercises: 'id, nameHe, nameEn, equipment, isCustom, updatedAt',
      programs: 'id, status, goal, updatedAt',
      workoutDays: 'id, programId, order, updatedAt',
      workoutSessions: 'id, status, workoutDayId, programId, startedAt, completedAt',
      bodyWeightEntries: 'id, date',
      preferences: 'id'
    });
  }
}

export const db = new TrainingDatabase();

export const nowIso = () => new Date().toISOString();

export const createId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

export const defaultPreferences: AppPreferences = {
  id: 'prefs',
  disclaimerAcceptedAt: null,
  barWeightKg: 20,
  installPromptDismissedAt: null
};

export async function ensurePreferences() {
  const existing = await db.preferences.get('prefs');
  if (!existing) {
    await db.preferences.put(defaultPreferences);
    return defaultPreferences;
  }
  return existing;
}
