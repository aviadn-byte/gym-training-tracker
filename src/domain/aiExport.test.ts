import { describe, expect, it } from 'vitest';
import { buildAiAnalysisPackage } from './aiExport';
import type {
  AppPreferences,
  Exercise,
  Program,
  WorkoutDay,
  WorkoutSession
} from '../types/models';

const exercise: Exercise = {
  id: 'exercise_bench',
  nameHe: 'לחיצת חזה במוט',
  nameEn: 'Barbell Bench Press',
  primaryMuscles: ['chest'],
  secondaryMuscles: ['triceps', 'shoulders'],
  equipment: 'barbell',
  isCustom: false,
  notes: 'גובה ספסל רגיל',
  weightIncrementKg: 2.5,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const program: Program = {
  id: 'program_push',
  name: 'Push',
  goal: 'strength',
  daysPerWeek: 3,
  status: 'active',
  deload: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const workoutDay: WorkoutDay = {
  id: 'day_push',
  programId: program.id,
  name: 'Push A',
  order: 1,
  exercises: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const preferences: AppPreferences = {
  id: 'prefs',
  disclaimerAcceptedAt: '2026-01-01T00:00:00.000Z',
  profileCompletedAt: '2026-01-01T00:02:00.000Z',
  ageYears: 35,
  heightCm: 178,
  barWeightKg: 20,
  installPromptDismissedAt: null
};

const session: WorkoutSession = {
  id: 'session_1',
  workoutDayId: workoutDay.id,
  programId: program.id,
  startedAt: '2026-01-05T10:00:00.000Z',
  completedAt: '2026-01-05T11:00:00.000Z',
  notes: 'אימון טוב',
  sessionRPE: 8,
  status: 'completed',
  loggedSets: [
    {
      id: 'set_1',
      exerciseId: exercise.id,
      setNumber: 1,
      type: 'working',
      weightKg: 100,
      reps: 5,
      rpe: 8,
      painScore: 0,
      timestamp: '2026-01-05T10:10:00.000Z'
    },
    {
      id: 'set_2',
      exerciseId: exercise.id,
      setNumber: 2,
      type: 'warmup',
      weightKg: 60,
      reps: 8,
      rpe: 5,
      painScore: 0,
      timestamp: '2026-01-05T10:05:00.000Z'
    }
  ]
};

describe('buildAiAnalysisPackage', () => {
  it('creates a structured JSON export, sets CSV and Hebrew prompt', () => {
    const aiPackage = buildAiAnalysisPackage(
      {
        exercises: [exercise],
        programs: [program],
        workoutDays: [workoutDay],
        workoutSessions: [session],
        bodyWeightEntries: [
          {
            id: 'weight_1',
            date: '2026-01-05T07:00:00.000Z',
            weightKg: 82.5
          }
        ],
        cardioEntries: [
          {
            id: 'cardio_1',
            date: '2026-01-05T12:00:00.000Z',
            modality: 'treadmill',
            durationMinutes: 25,
            distanceKm: 3.2,
            calories: 220,
            avgHeartRate: 132,
            machineName: 'הליכון 7',
            notes: 'שיפוע 4'
          }
        ],
        preferences: [preferences]
      },
      '2026-01-06T00:00:00.000Z'
    );

    expect(aiPackage.data.kind).toBe('training-ai-analysis');
    expect(aiPackage.data.summary.completedSessions).toBe(1);
    expect(aiPackage.data.summary.totalVolumeKg).toBe(500);
    expect(aiPackage.data.summary.personalRecords).toBe(3);
    expect(aiPackage.data.summary.latestBodyWeightKg).toBe(82.5);
    expect(aiPackage.data.summary.cardioSessions).toBe(1);
    expect(aiPackage.data.summary.totalCardioMinutes).toBe(25);
    expect(aiPackage.data.summary.totalCardioDistanceKm).toBe(3.2);
    expect(aiPackage.data.cardioEntries[0].machineName).toBe('הליכון 7');
    expect(aiPackage.data.analytics.exerciseRollups[0]).toMatchObject({
      exerciseNameEn: 'Barbell Bench Press',
      totalVolumeKg: 500,
      bestE1rmKg: 116.7
    });
    expect(aiPackage.setsCsv).toContain('session_id,session_started_at');
    expect(aiPackage.setsCsv).toContain('לחיצת חזה במוט');
    expect(aiPackage.prompt).toContain('אימונים שהושלמו: 1');
    expect(aiPackage.prompt).toContain('נפח כולל: 500 ק״ג');
  });
});
