import type {
  AppPreferences,
  BodyWeightEntry,
  Exercise,
  ISODateString,
  MuscleGroup,
  Program,
  WorkoutDay,
  WorkoutSession
} from '../types/models';
import {
  calculateE1RM,
  calculateEffectiveSets,
  calculateMuscleVolume,
  calculateSetVolume,
  calculateTotalVolume,
  derivePersonalRecords,
  detectPainAlert,
  detectStagnation,
  type Exposure
} from './training';

export interface AiExportSource {
  exercises: Exercise[];
  programs: Program[];
  workoutDays: WorkoutDay[];
  workoutSessions: WorkoutSession[];
  bodyWeightEntries: BodyWeightEntry[];
  preferences: AppPreferences[];
}

export interface AiAnalysisPackage {
  data: AiAnalysisExport;
  prompt: string;
  setsCsv: string;
}

export interface AiAnalysisExport {
  kind: 'training-ai-analysis';
  version: 1;
  exportedAt: ISODateString;
  language: 'he';
  units: {
    weight: 'kg';
    dates: 'ISO UTC';
  };
  summary: {
    exerciseCount: number;
    programCount: number;
    completedSessions: number;
    activeSessions: number;
    totalLoggedSets: number;
    workingSets: number;
    effectiveSets: number;
    totalVolumeKg: number;
    personalRecords: number;
    firstSessionAt: ISODateString | null;
    lastSessionAt: ISODateString | null;
    latestBodyWeightKg: number | null;
  };
  exercises: Exercise[];
  programs: Program[];
  workoutDays: WorkoutDay[];
  workoutSessions: WorkoutSession[];
  bodyWeightEntries: BodyWeightEntry[];
  analytics: {
    personalRecords: Array<{
      exerciseId: string;
      exerciseNameHe: string;
      exerciseNameEn: string;
      metric: 'weight' | 'volume' | 'e1rm';
      value: number;
      date: ISODateString;
    }>;
    exerciseRollups: Array<{
      exerciseId: string;
      exerciseNameHe: string;
      exerciseNameEn: string;
      primaryMuscles: MuscleGroup[];
      secondaryMuscles: MuscleGroup[];
      sessions: number;
      totalSets: number;
      workingSets: number;
      effectiveSets: number;
      totalVolumeKg: number;
      maxWeightKg: number;
      bestE1rmKg: number | null;
      averageRpe: number | null;
      maxPainScore: number | null;
      lastTrainedAt: ISODateString | null;
    }>;
    weeklyVolumeByMuscle: Array<{
      weekStart: string;
      muscle: MuscleGroup;
      volumeKg: number;
    }>;
    painFlags: Array<{
      exerciseId: string;
      exerciseNameHe: string;
      exerciseNameEn: string;
      maxPainScore: number;
      reason: 'highPainOrRepeatedPain';
    }>;
    stagnationFlags: Array<{
      exerciseId: string;
      exerciseNameHe: string;
      exerciseNameEn: string;
      exposures: number;
      reason: 'nonPositiveE1rmTrend';
    }>;
  };
  preferences: AppPreferences[];
}

export function buildAiAnalysisPackage(
  source: AiExportSource,
  exportedAt: ISODateString = new Date().toISOString()
): AiAnalysisPackage {
  const completedSessions = source.workoutSessions.filter(
    (session) => session.status === 'completed'
  );
  const allSets = source.workoutSessions.flatMap((session) => session.loggedSets);
  const exerciseById = new Map(source.exercises.map((exercise) => [exercise.id, exercise]));
  const sortedSessions = [...source.workoutSessions].sort((a, b) =>
    a.startedAt.localeCompare(b.startedAt)
  );
  const sortedBodyWeights = [...source.bodyWeightEntries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const personalRecords = derivePersonalRecords(allSets).map((record) => {
    const exercise = exerciseById.get(record.exerciseId);
    return {
      exerciseId: record.exerciseId,
      exerciseNameHe: exercise?.nameHe ?? record.exerciseId,
      exerciseNameEn: exercise?.nameEn ?? record.exerciseId,
      metric: record.metric,
      value: round(record.value, record.metric === 'e1rm' ? 1 : 0),
      date: record.date
    };
  });

  const data: AiAnalysisExport = {
    kind: 'training-ai-analysis',
    version: 1,
    exportedAt,
    language: 'he',
    units: {
      weight: 'kg',
      dates: 'ISO UTC'
    },
    summary: {
      exerciseCount: source.exercises.length,
      programCount: source.programs.length,
      completedSessions: completedSessions.length,
      activeSessions: source.workoutSessions.length - completedSessions.length,
      totalLoggedSets: allSets.length,
      workingSets: allSets.filter((set) => set.type === 'working' || set.type === 'amrap').length,
      effectiveSets: calculateEffectiveSets(allSets),
      totalVolumeKg: round(calculateTotalVolume(allSets)),
      personalRecords: personalRecords.length,
      firstSessionAt: sortedSessions[0]?.startedAt ?? null,
      lastSessionAt: sortedSessions.at(-1)?.startedAt ?? null,
      latestBodyWeightKg: sortedBodyWeights.at(-1)?.weightKg ?? null
    },
    exercises: source.exercises,
    programs: source.programs,
    workoutDays: source.workoutDays,
    workoutSessions: source.workoutSessions,
    bodyWeightEntries: source.bodyWeightEntries,
    analytics: {
      personalRecords,
      exerciseRollups: buildExerciseRollups(source.workoutSessions, source.exercises),
      weeklyVolumeByMuscle: buildWeeklyVolumeByMuscle(source.workoutSessions, source.exercises),
      painFlags: buildPainFlags(source.workoutSessions, source.exercises),
      stagnationFlags: buildStagnationFlags(source.workoutSessions, source.exercises)
    },
    preferences: source.preferences
  };

  return {
    data,
    prompt: buildAiPrompt(data),
    setsCsv: buildSetsCsv(source.workoutSessions, source.exercises)
  };
}

export function buildAiPrompt(data: AiAnalysisExport) {
  return `# פרומפט לניתוח אימונים

אתה מאמן כושר אנליטי וזהיר. מצורפים נתוני האימונים שלי בקובץ JSON ובקובץ CSV.

חשוב:
- הנתונים בקילוגרמים בלבד.
- תאריכים הם בפורמט ISO UTC.
- PRs מחושבים מהנתונים, לא נשמרים ידנית.
- אל תיתן ייעוץ רפואי. במקרה של כאב משמעותי או חוזר, המלץ לפנות לאיש מקצוע.
- אם אין מספיק נתונים למסקנה, אמור זאת במפורש ואל תנחש.

תקציר הנתונים:
- אימונים שהושלמו: ${data.summary.completedSessions}
- סטים מתועדים: ${data.summary.totalLoggedSets}
- סטים אפקטיביים: ${data.summary.effectiveSets}
- נפח כולל: ${data.summary.totalVolumeKg} ק״ג
- שיאים מחושבים: ${data.summary.personalRecords}
- משקל גוף אחרון: ${data.summary.latestBodyWeightKg ?? 'לא תועד'} ק״ג

נתח עבורי:
1. סיכום מצב נוכחי בשפה פשוטה.
2. מה מתקדם טוב לפי תרגילים, נפח, e1RM ומשקל גוף אם קיים.
3. איפה יש תקיעות או ירידה בביצועים.
4. עומסים חריגים, שרירים שמקבלים יותר מדי או פחות מדי נפח.
5. כאבים או דגלים שמחייבים זהירות.
6. המלצות לשבועיים הקרובים: עומס, חזרות, מנוחה, וריאציות או דילוד.
7. שלושה צעדים פרקטיים לאימון הבא.

החזר תשובה בעברית, ממוקדת, עם טבלת המלצות בסוף.`;
}

export function buildSetsCsv(sessions: WorkoutSession[], exercises: Exercise[]) {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const rows = sessions.flatMap((session) =>
    session.loggedSets.map((set) => {
      const exercise = exerciseById.get(set.exerciseId);
      return [
        session.id,
        session.startedAt,
        session.completedAt ?? '',
        session.status,
        session.sessionRPE ?? '',
        session.programId ?? '',
        session.workoutDayId ?? '',
        set.id,
        set.timestamp,
        set.exerciseId,
        exercise?.nameHe ?? '',
        exercise?.nameEn ?? '',
        set.setNumber,
        set.type,
        set.weightKg,
        set.reps,
        set.rpe ?? '',
        set.painScore ?? '',
        calculateE1RM(set) ?? '',
        calculateSetVolume(set),
        session.notes
      ];
    })
  );

  return toCsv([
    [
      'session_id',
      'session_started_at',
      'session_completed_at',
      'session_status',
      'session_rpe',
      'program_id',
      'workout_day_id',
      'set_id',
      'set_timestamp',
      'exercise_id',
      'exercise_name_he',
      'exercise_name_en',
      'set_number',
      'set_type',
      'weight_kg',
      'reps',
      'rpe',
      'pain_score',
      'e1rm_kg',
      'volume_kg',
      'session_notes'
    ],
    ...rows
  ]);
}

function buildExerciseRollups(sessions: WorkoutSession[], exercises: Exercise[]) {
  return exercises
    .map((exercise) => {
      const sessionsWithExercise = sessions.filter((session) =>
        session.loggedSets.some((set) => set.exerciseId === exercise.id)
      );
      const sets = sessionsWithExercise.flatMap((session) =>
        session.loggedSets.filter((set) => set.exerciseId === exercise.id)
      );
      const rpeValues = sets
        .map((set) => set.rpe)
        .filter((value): value is number => typeof value === 'number');
      const e1rms = sets
        .map((set) => calculateE1RM(set))
        .filter((value): value is number => typeof value === 'number');
      const painScores = sets
        .map((set) => set.painScore)
        .filter((value): value is number => typeof value === 'number');

      return {
        exerciseId: exercise.id,
        exerciseNameHe: exercise.nameHe,
        exerciseNameEn: exercise.nameEn,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        sessions: sessionsWithExercise.length,
        totalSets: sets.length,
        workingSets: sets.filter((set) => set.type === 'working' || set.type === 'amrap').length,
        effectiveSets: calculateEffectiveSets(sets),
        totalVolumeKg: round(calculateTotalVolume(sets)),
        maxWeightKg: Math.max(0, ...sets.map((set) => set.weightKg)),
        bestE1rmKg: e1rms.length ? round(Math.max(...e1rms), 1) : null,
        averageRpe: rpeValues.length ? round(average(rpeValues), 1) : null,
        maxPainScore: painScores.length ? Math.max(...painScores) : null,
        lastTrainedAt:
          sessionsWithExercise
            .map((session) => session.startedAt)
            .sort((a, b) => a.localeCompare(b))
            .at(-1) ?? null
      };
    })
    .filter((rollup) => rollup.totalSets > 0)
    .sort((a, b) => b.totalVolumeKg - a.totalVolumeKg);
}

function buildWeeklyVolumeByMuscle(sessions: WorkoutSession[], exercises: Exercise[]) {
  const weekly = new Map<string, number>();

  sessions.forEach((session) => {
    const weekStart = getUtcWeekStart(session.startedAt);
    const muscleVolume = calculateMuscleVolume(session.loggedSets, exercises);
    muscleVolume.forEach((volume, muscle) => {
      const key = `${weekStart}:${muscle}`;
      weekly.set(key, (weekly.get(key) ?? 0) + volume);
    });
  });

  return Array.from(weekly.entries())
    .map(([key, volumeKg]) => {
      const [weekStart, muscle] = key.split(':') as [string, MuscleGroup];
      return { weekStart, muscle, volumeKg: round(volumeKg) };
    })
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart) || b.volumeKg - a.volumeKg);
}

function buildPainFlags(sessions: WorkoutSession[], exercises: Exercise[]) {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  return Array.from(buildExposuresByExercise(sessions).entries())
    .filter(([, exposures]) => detectPainAlert(exposures))
    .map(([exerciseId, exposures]) => {
      const exercise = exerciseById.get(exerciseId);
      return {
        exerciseId,
        exerciseNameHe: exercise?.nameHe ?? exerciseId,
        exerciseNameEn: exercise?.nameEn ?? exerciseId,
        maxPainScore: Math.max(0, ...exposures.map((exposure) => exposure.painScore ?? 0)),
        reason: 'highPainOrRepeatedPain' as const
      };
    });
}

function buildStagnationFlags(sessions: WorkoutSession[], exercises: Exercise[]) {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  return Array.from(buildExposuresByExercise(sessions).entries())
    .filter(([, exposures]) => detectStagnation(exposures))
    .map(([exerciseId, exposures]) => {
      const exercise = exerciseById.get(exerciseId);
      return {
        exerciseId,
        exerciseNameHe: exercise?.nameHe ?? exerciseId,
        exerciseNameEn: exercise?.nameEn ?? exerciseId,
        exposures: exposures.length,
        reason: 'nonPositiveE1rmTrend' as const
      };
    });
}

function buildExposuresByExercise(sessions: WorkoutSession[]) {
  const exposuresByExercise = new Map<string, Exposure[]>();

  sessions
    .filter((session) => session.status === 'completed')
    .forEach((session) => {
      const exerciseIds = new Set(session.loggedSets.map((set) => set.exerciseId));
      exerciseIds.forEach((exerciseId) => {
        const sets = session.loggedSets.filter((set) => set.exerciseId === exerciseId);
        const e1rms = sets
          .map((set) => calculateE1RM(set))
          .filter((value): value is number => typeof value === 'number');
        if (!e1rms.length) return;
        const painScore = Math.max(0, ...sets.map((set) => set.painScore ?? 0));
        const exposure: Exposure = {
          date: session.startedAt,
          exerciseId,
          bestE1rm: Math.max(...e1rms),
          painScore
        };
        exposuresByExercise.set(exerciseId, [
          ...(exposuresByExercise.get(exerciseId) ?? []),
          exposure
        ]);
      });
    });

  return exposuresByExercise;
}

function toCsv(rows: Array<Array<string | number>>) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value);
          if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
          return text;
        })
        .join(',')
    )
    .join('\n');
}

function getUtcWeekStart(isoDate: ISODateString) {
  const date = new Date(isoDate);
  const day = date.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
