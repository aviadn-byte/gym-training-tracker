import { createId, nowIso } from '../db/schema';
import type { PlannedExercise, Program, ProgramGoal, WorkoutDay } from '../types/models';

interface TemplateExercise {
  exerciseId: string;
  sets?: number;
  supersetGroup?: string | null;
}

interface TemplateDay {
  name: string;
  exercises: TemplateExercise[];
}

export type TemplateId = 'ppl' | 'upperLower' | 'fullBody';

export const goalDefaults = (goal: ProgramGoal) => {
  if (goal === 'strength') {
    return { targetRepsMin: 3, targetRepsMax: 6, restSeconds: 240, targetRpe: 8, sets: 4 };
  }
  if (goal === 'hypertrophy') {
    return { targetRepsMin: 6, targetRepsMax: 15, restSeconds: 120, targetRpe: 8, sets: 3 };
  }
  return { targetRepsMin: 5, targetRepsMax: 10, restSeconds: 180, targetRpe: 8, sets: 3 };
};

const templates: Record<TemplateId, TemplateDay[]> = {
  ppl: [
    {
      name: 'Push',
      exercises: [
        { exerciseId: 'bench_press_barbell' },
        { exerciseId: 'incline_dumbbell_press' },
        { exerciseId: 'barbell_overhead_press' },
        { exerciseId: 'dumbbell_lateral_raise', supersetGroup: 'A' },
        { exerciseId: 'cable_rope_pushdown', supersetGroup: 'A' }
      ]
    },
    {
      name: 'Pull',
      exercises: [
        { exerciseId: 'pull_up' },
        { exerciseId: 'barbell_row' },
        { exerciseId: 'seated_row_cable' },
        { exerciseId: 'face_pull', supersetGroup: 'A' },
        { exerciseId: 'ez_bar_curl', supersetGroup: 'A' }
      ]
    },
    {
      name: 'Legs',
      exercises: [
        { exerciseId: 'barbell_back_squat' },
        { exerciseId: 'romanian_deadlift' },
        { exerciseId: 'leg_press' },
        { exerciseId: 'leg_extension', supersetGroup: 'A' },
        { exerciseId: 'seated_leg_curl', supersetGroup: 'A' },
        { exerciseId: 'standing_calf_raise' }
      ]
    }
  ],
  upperLower: [
    {
      name: 'Upper A',
      exercises: [
        { exerciseId: 'bench_press_barbell' },
        { exerciseId: 'pull_up' },
        { exerciseId: 'dumbbell_shoulder_press' },
        { exerciseId: 'seated_row_cable' },
        { exerciseId: 'cable_rope_pushdown', supersetGroup: 'A' },
        { exerciseId: 'dumbbell_curl', supersetGroup: 'A' }
      ]
    },
    {
      name: 'Lower A',
      exercises: [
        { exerciseId: 'barbell_back_squat' },
        { exerciseId: 'romanian_deadlift' },
        { exerciseId: 'leg_press' },
        { exerciseId: 'standing_calf_raise' }
      ]
    },
    {
      name: 'Upper B',
      exercises: [
        { exerciseId: 'incline_bench_press_barbell' },
        { exerciseId: 'lat_pulldown' },
        { exerciseId: 'machine_chest_press' },
        { exerciseId: 'machine_row' },
        { exerciseId: 'dumbbell_lateral_raise', supersetGroup: 'B' },
        { exerciseId: 'face_pull', supersetGroup: 'B' }
      ]
    },
    {
      name: 'Lower B',
      exercises: [
        { exerciseId: 'barbell_deadlift' },
        { exerciseId: 'front_squat' },
        { exerciseId: 'lying_leg_curl' },
        { exerciseId: 'seated_calf_raise' }
      ]
    }
  ],
  fullBody: [
    {
      name: 'Full Body A',
      exercises: [
        { exerciseId: 'barbell_back_squat' },
        { exerciseId: 'bench_press_barbell' },
        { exerciseId: 'seated_row_cable' },
        { exerciseId: 'dumbbell_lateral_raise' }
      ]
    },
    {
      name: 'Full Body B',
      exercises: [
        { exerciseId: 'romanian_deadlift' },
        { exerciseId: 'barbell_overhead_press' },
        { exerciseId: 'lat_pulldown' },
        { exerciseId: 'leg_extension' }
      ]
    },
    {
      name: 'Full Body C',
      exercises: [
        { exerciseId: 'leg_press' },
        { exerciseId: 'incline_dumbbell_press' },
        { exerciseId: 'barbell_row' },
        { exerciseId: 'seated_leg_curl' }
      ]
    }
  ]
};

export function createProgramFromTemplate(templateId: TemplateId, goal: ProgramGoal) {
  const programId = createId('program');
  const defaults = goalDefaults(goal);
  const createdAt = nowIso();
  const program: Program = {
    id: programId,
    name:
      templateId === 'ppl'
        ? 'Push Pull Legs'
        : templateId === 'upperLower'
          ? 'Upper / Lower'
          : 'Full Body',
    goal,
    daysPerWeek: templates[templateId].length,
    status: 'active',
    deload: { everyNWeeks: 5, loadFactor: 0.6, setFactor: 0.5 },
    createdAt,
    updatedAt: createdAt
  };

  const days: WorkoutDay[] = templates[templateId].map((day, dayIndex) => ({
    id: createId('day'),
    programId,
    name: day.name,
    order: dayIndex,
    createdAt,
    updatedAt: createdAt,
    exercises: day.exercises.map<PlannedExercise>((exercise, exerciseIndex) => ({
      id: createId('planned'),
      exerciseId: exercise.exerciseId,
      order: exerciseIndex,
      sets: exercise.sets ?? defaults.sets,
      targetRepsMin: defaults.targetRepsMin,
      targetRepsMax: defaults.targetRepsMax,
      targetRpe: defaults.targetRpe,
      restSeconds: defaults.restSeconds,
      supersetGroup: exercise.supersetGroup ?? null
    }))
  }));

  return { program, days };
}

export function createEmptyProgram(name: string, goal: ProgramGoal, daysPerWeek: number) {
  const programId = createId('program');
  const createdAt = nowIso();
  const program: Program = {
    id: programId,
    name,
    goal,
    daysPerWeek,
    status: 'active',
    deload: { everyNWeeks: 5, loadFactor: 0.6, setFactor: 0.5 },
    createdAt,
    updatedAt: createdAt
  };
  const days: WorkoutDay[] = Array.from({ length: daysPerWeek }, (_, index) => ({
    id: createId('day'),
    programId,
    name: `יום ${index + 1}`,
    order: index,
    exercises: [],
    createdAt,
    updatedAt: createdAt
  }));
  return { program, days };
}

