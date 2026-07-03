import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card } from '../../components/ui/Card';
import { db } from '../../db/schema';
import { he } from '../../i18n/he';

export function ExercisesPage() {
  const [query, setQuery] = useState('');
  const exercises = useLiveQuery(() => db.exercises.orderBy('nameHe').toArray(), []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return exercises ?? [];
    return (exercises ?? []).filter((exercise) =>
      `${exercise.nameHe} ${exercise.nameEn}`.toLowerCase().includes(normalized)
    );
  }, [exercises, query]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold">{he.exercises.title}</h2>
        <p className="mt-1 text-sm text-muted">{he.exercises.subtitle}</p>
      </div>
      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] px-4">
        <Search size={20} strokeWidth={1.5} className="text-white/45" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${he.common.search}...`}
          className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/35"
        />
      </label>
      <div className="space-y-3">
        {filtered.map((exercise) => (
          <Card key={exercise.id} className="animate-slide-up">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold">{exercise.nameHe}</h3>
                <p className="text-sm text-muted" dir="ltr">
                  {exercise.nameEn}
                </p>
              </div>
              <span className="rounded-full border border-volt/20 bg-volt/10 px-3 py-1 text-xs font-bold text-volt">
                {exercise.weightIncrementKg} {he.common.kg}
              </span>
            </div>
            <p className="mt-3 text-xs text-white/55">
              {exercise.primaryMuscles.map((muscle) => he.muscles[muscle]).join(' · ')}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
