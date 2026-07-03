export type ISODateString = string;

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'forearms'
  | 'traps'
  | 'adductors'
  | 'abductors'
  | 'fullBody';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'smith'
  | 'band'
  | 'plate'
  | 'other';

export type ProgramGoal = 'strength' | 'hypertrophy' | 'mixed';
export type ProgramStatus = 'active' | 'archived';
export type WorkoutStatus = 'active' | 'completed';
export type SetType = 'warmup' | 'working' | 'drop' | 'amrap';

export interface Exercise {
  id: string;
  nameHe: string;
  nameEn: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  isCustom: boolean;
  notes: string;
  weightIncrementKg: 1 | 2 | 2.5 | 5;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface DeloadConfig {
  everyNWeeks: number;
  loadFactor: number;
  setFactor: number;
}

export interface Program {
  id: string;
  name: string;
  goal: ProgramGoal;
  daysPerWeek: number;
  status: ProgramStatus;
  deload: DeloadConfig | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRpe: number | null;
  restSeconds: number;
  supersetGroup: string | null;
}

export interface WorkoutDay {
  id: string;
  programId: string;
  name: string;
  order: number;
  targetDurationMinutes?: number | null;
  exercises: PlannedExercise[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface LoggedSet {
  id: string;
  exerciseId: string;
  plannedExerciseId?: string;
  setNumber: number;
  type: SetType;
  weightKg: number;
  reps: number;
  rpe: number | null;
  painScore?: number | null;
  painNote?: string;
  timestamp: ISODateString;
}

export interface WorkoutSession {
  id: string;
  workoutDayId: string | null;
  programId: string | null;
  startedAt: ISODateString;
  completedAt: ISODateString | null;
  notes: string;
  fatigueNote?: string;
  sessionRPE: number | null;
  status: WorkoutStatus;
  loggedSets: LoggedSet[];
  addedExercises?: PlannedExercise[];
  skippedExerciseIds?: string[];
  exerciseSwaps?: Record<string, string>;
}

export interface BodyWeightEntry {
  id: string;
  date: ISODateString;
  weightKg: number;
  note?: string;
}

export interface AppPreferences {
  id: 'prefs';
  disclaimerAcceptedAt: ISODateString | null;
  profileCompletedAt: ISODateString | null;
  ageYears: number | null;
  heightCm: number | null;
  barWeightKg: number;
  installPromptDismissedAt: ISODateString | null;
}

export interface PersonalRecord {
  exerciseId: string;
  metric: 'weight' | 'volume' | 'e1rm';
  value: number;
  date: ISODateString;
  setId: string;
}
