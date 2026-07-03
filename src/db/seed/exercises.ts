import type { Equipment, Exercise, MuscleGroup } from '../../types/models';

type SeedExercise = Omit<Exercise, 'createdAt' | 'updatedAt'>;

const ex = (
  id: string,
  nameHe: string,
  nameEn: string,
  primaryMuscles: MuscleGroup[],
  secondaryMuscles: MuscleGroup[],
  equipment: Equipment
): SeedExercise => ({
  id,
  nameHe,
  nameEn,
  primaryMuscles,
  secondaryMuscles,
  equipment,
  isCustom: false,
  notes: '',
  weightIncrementKg: 2.5
});

export const seedExercises: SeedExercise[] = [
  ex(
    'bench_press_barbell',
    'לחיצת חזה במוט',
    'Barbell Bench Press',
    ['chest'],
    ['triceps', 'shoulders'],
    'barbell'
  ),
  ex(
    'squat_barbell',
    'סקוואט במוט',
    'Barbell Back Squat',
    ['quads', 'glutes'],
    ['hamstrings', 'core'],
    'barbell'
  ),
  ex(
    'deadlift_barbell',
    'דדליפט במוט',
    'Barbell Deadlift',
    ['back', 'glutes', 'hamstrings'],
    ['traps', 'forearms', 'core'],
    'barbell'
  ),
  ex(
    'overhead_press_barbell',
    'לחיצת כתפיים במוט',
    'Barbell Overhead Press',
    ['shoulders'],
    ['triceps', 'core'],
    'barbell'
  ),
  ex('lat_pulldown', 'פולי עליון', 'Lat Pulldown', ['back'], ['biceps', 'forearms'], 'cable'),
  ex('leg_press', 'לחיצת רגליים', 'Leg Press', ['quads', 'glutes'], ['hamstrings'], 'machine'),
  ex(
    'seated_row_cable',
    'חתירה בישיבה בכבל',
    'Seated Cable Row',
    ['back'],
    ['biceps', 'forearms'],
    'cable'
  ),
  ex(
    'romanian_deadlift',
    'דדליפט רומני',
    'Romanian Deadlift',
    ['hamstrings', 'glutes'],
    ['back', 'forearms'],
    'barbell'
  )
];
