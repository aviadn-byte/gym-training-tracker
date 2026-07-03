import { describe, expect, it } from 'vitest';
import type { Exercise, LoggedSet } from '../types/models';
import {
  calculateE1RM,
  calculateEffectiveSets,
  calculateMuscleVolume,
  calculateTotalVolume,
  detectPainAlert,
  detectStagnation,
  detectWeeklyLoadAlert,
  derivePersonalRecords,
  suggestDoubleProgression
} from './training';

const set = (overrides: Partial<LoggedSet>): LoggedSet => ({
  id: crypto.randomUUID(),
  exerciseId: 'bench',
  setNumber: 1,
  type: 'working',
  weightKg: 100,
  reps: 5,
  rpe: 8,
  timestamp: '2026-01-01T00:00:00.000Z',
  ...overrides
});

const bench: Exercise = {
  id: 'bench',
  nameHe: 'לחיצת חזה',
  nameEn: 'Bench Press',
  primaryMuscles: ['chest'],
  secondaryMuscles: ['triceps', 'shoulders'],
  equipment: 'barbell',
  isCustom: false,
  notes: '',
  weightIncrementKg: 2.5,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

describe('training domain', () => {
  it('calculates Epley e1RM only for working sets of 1-10 reps', () => {
    expect(calculateE1RM(set({ weightKg: 100, reps: 5 }))).toBeCloseTo(116.67, 2);
    expect(calculateE1RM(set({ reps: 12 }))).toBeNull();
    expect(calculateE1RM(set({ type: 'warmup' }))).toBeNull();
  });

  it('calculates volume and effective sets from working sets only', () => {
    const sets = [set({ weightKg: 100, reps: 5 }), set({ type: 'warmup', weightKg: 60, reps: 8 })];
    expect(calculateTotalVolume(sets)).toBe(500);
    expect(calculateEffectiveSets([...sets, set({ rpe: 6 })])).toBe(1);
  });

  it('splits muscle volume by primary and secondary muscles', () => {
    const volume = calculateMuscleVolume([set({ weightKg: 100, reps: 5 })], [bench]);
    expect(volume.get('chest')).toBe(500);
    expect(volume.get('triceps')).toBe(250);
    expect(volume.get('shoulders')).toBe(250);
  });

  it('derives PRs without storing them', () => {
    const records = derivePersonalRecords([
      set({ id: 'a', weightKg: 100, reps: 5 }),
      set({ id: 'b', weightKg: 102.5, reps: 4 })
    ]);
    expect(records.find((record) => record.metric === 'weight')?.value).toBe(102.5);
    expect(records.find((record) => record.metric === 'volume')?.value).toBe(500);
  });

  it('detects pain alerts and trend stagnation conservatively', () => {
    expect(
      detectPainAlert([
        { date: '2026-01-01', exerciseId: 'bench', bestE1rm: 100, painScore: 1 },
        { date: '2026-01-08', exerciseId: 'bench', bestE1rm: 101, painScore: 2 }
      ])
    ).toBe(true);

    expect(
      detectStagnation([
        { date: '2026-01-01', exerciseId: 'bench', bestE1rm: 110 },
        { date: '2026-01-08', exerciseId: 'bench', bestE1rm: 110 },
        { date: '2026-01-15', exerciseId: 'bench', bestE1rm: 109 },
        { date: '2026-01-22', exerciseId: 'bench', bestE1rm: 108 }
      ])
    ).toBe(true);
  });

  it('suggests double progression and weekly load alerts', () => {
    expect(
      suggestDoubleProgression({
        loggedSets: [set({ reps: 8, rpe: 8 }), set({ reps: 8, rpe: 8 }), set({ reps: 8, rpe: 8 })],
        plannedSets: 3,
        targetRepsMax: 8,
        targetRpe: 8,
        incrementKg: 2.5
      }).type
    ).toBe('increaseWeight');

    expect(detectWeeklyLoadAlert(1300, [1000, 980, 1020, 1000])).toBe(true);
  });
});

