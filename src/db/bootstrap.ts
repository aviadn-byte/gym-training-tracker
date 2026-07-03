import { db, ensurePreferences, nowIso } from './schema';
import { seedExercises } from './seed/exercises';

export async function bootstrapDatabase() {
  await ensurePreferences();
  const exerciseCount = await db.exercises.count();
  if (exerciseCount === 0) {
    const stamped = seedExercises.map((exercise) => ({
      ...exercise,
      createdAt: nowIso(),
      updatedAt: nowIso()
    }));
    await db.exercises.bulkPut(stamped);
  }
}
