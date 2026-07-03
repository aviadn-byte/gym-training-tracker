import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExerciseGuide } from '../../components/ExerciseGuide';
import { Modal } from '../../components/ui/Modal';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { db, createId, nowIso } from '../../db/schema';
import { equipmentTypes, muscleGroups, weightIncrements } from '../../domain/catalog';
import { he } from '../../i18n/he';
import type { Equipment, Exercise, MuscleGroup } from '../../types/models';

export function ExercisesPage() {
  const [query, setQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all');
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const exercises = useLiveQuery(() => db.exercises.orderBy('nameHe').toArray(), []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (exercises ?? []).filter((exercise) => {
      const matchesQuery =
        !normalized || `${exercise.nameHe} ${exercise.nameEn}`.toLowerCase().includes(normalized);
      const matchesMuscle =
        muscleFilter === 'all' ||
        exercise.primaryMuscles.includes(muscleFilter) ||
        exercise.secondaryMuscles.includes(muscleFilter);
      return matchesQuery && matchesMuscle;
    });
  }, [exercises, muscleFilter, query]);

  const saveExerciseDetails = async (
    exercise: Exercise,
    notes: string,
    weightIncrementKg: 1 | 2 | 2.5 | 5
  ) => {
    await db.exercises.update(exercise.id, { notes, weightIncrementKg, updatedAt: nowIso() });
    setEditing(null);
  };

  const addCustomExercise = async (draft: {
    nameHe: string;
    nameEn: string;
    primary: MuscleGroup;
    equipment: Equipment;
  }) => {
    await db.exercises.put({
      id: createId('exercise'),
      nameHe: draft.nameHe.trim(),
      nameEn: draft.nameEn.trim(),
      primaryMuscles: [draft.primary],
      secondaryMuscles: [],
      equipment: draft.equipment,
      isCustom: true,
      notes: '',
      weightIncrementKg: 2.5,
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
    setIsAdding(false);
  };

  const muscleOptions = [
    { value: 'all' as const, label: he.common.all },
    ...muscleGroups.slice(0, 4).map((muscle) => ({ value: muscle, label: he.muscles[muscle] }))
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold">{he.exercises.title}</h2>
          <p className="mt-1 text-sm text-muted">{he.exercises.subtitle}</p>
        </div>
        <Button
          icon={<Plus size={20} strokeWidth={1.5} />}
          className="min-w-12 px-4"
          onClick={() => setIsAdding(true)}
        >
          {he.common.add}
        </Button>
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
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} strokeWidth={1.5} className="text-white/45" />
        <div className="min-w-0 flex-1 overflow-x-auto scrollbar-none">
          <div className="flex min-w-max gap-2">
            {muscleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMuscleFilter(option.value)}
                className={`min-h-10 rounded-full border px-4 text-sm font-bold transition active:scale-[0.97] ${
                  muscleFilter === option.value
                    ? 'border-volt/30 bg-volt text-ink shadow-glow'
                    : 'border-white/10 bg-white/[0.04] text-white/62'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((exercise) => (
          <Card key={exercise.id} className="animate-slide-up">
            <button
              type="button"
              className="w-full text-right"
              onClick={() => setEditing(exercise)}
            >
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
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/55">
                <span>
                  {exercise.primaryMuscles.map((muscle) => he.muscles[muscle]).join(' · ')}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{he.equipment[exercise.equipment]}</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>{exercise.isCustom ? he.exercises.custom : he.exercises.builtIn}</span>
              </div>
              {exercise.notes ? (
                <p className="mt-3 rounded-2xl bg-white/[0.04] p-3 text-sm leading-6 text-white/70">
                  {exercise.notes}
                </p>
              ) : null}
            </button>
          </Card>
        ))}
      </div>
      <ExerciseDetailsModal
        exercise={editing}
        onClose={() => setEditing(null)}
        onSave={saveExerciseDetails}
      />
      <AddExerciseModal
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onSave={addCustomExercise}
      />
    </div>
  );
}

interface ExerciseDetailsModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onSave: (exercise: Exercise, notes: string, weightIncrementKg: 1 | 2 | 2.5 | 5) => void;
}

function ExerciseDetailsModal({ exercise, onClose, onSave }: ExerciseDetailsModalProps) {
  const [notes, setNotes] = useState('');
  const [increment, setIncrement] = useState<1 | 2 | 2.5 | 5>(2.5);

  useEffect(() => {
    if (exercise) {
      setNotes(exercise.notes);
      setIncrement(exercise.weightIncrementKg);
    }
  }, [exercise]);

  if (!exercise) return null;

  return (
    <Modal open title={exercise.nameHe} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted" dir="ltr">
          {exercise.nameEn}
        </p>
        <ExerciseGuide exercise={exercise} />
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-muted">{he.exercises.notes}</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder={he.exercises.notesPlaceholder}
            className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.05] p-4 text-white outline-none focus:border-volt/40"
          />
        </label>
        <SegmentedControl
          value={`${increment}`}
          options={weightIncrements.map((value) => ({
            value: `${value}`,
            label: `${value} ${he.common.kg}`
          }))}
          onChange={(value) => setIncrement(Number(value) as 1 | 2 | 2.5 | 5)}
        />
        <Button className="w-full" onClick={() => onSave(exercise, notes, increment)}>
          {he.exercises.saveDetails}
        </Button>
      </div>
    </Modal>
  );
}

interface AddExerciseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (draft: {
    nameHe: string;
    nameEn: string;
    primary: MuscleGroup;
    equipment: Equipment;
  }) => void;
}

function AddExerciseModal({ open, onClose, onSave }: AddExerciseModalProps) {
  const [nameHe, setNameHe] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [primary, setPrimary] = useState<MuscleGroup>('chest');
  const [equipment, setEquipment] = useState<Equipment>('barbell');

  const canSave = nameHe.trim().length > 1 && nameEn.trim().length > 1;

  return (
    <Modal open={open} title={he.exercises.addCustom} onClose={onClose}>
      <div className="space-y-4">
        <TextInput label={he.exercises.nameHe} value={nameHe} onChange={setNameHe} />
        <TextInput label={he.exercises.nameEn} value={nameEn} onChange={setNameEn} dir="ltr" />
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-muted">
            {he.exercises.primary}
          </span>
          <select
            value={primary}
            onChange={(event) => setPrimary(event.target.value as MuscleGroup)}
            className="min-h-12 w-full rounded-2xl border border-white/[0.08] bg-[#111116] px-4 text-white outline-none"
          >
            {muscleGroups.map((muscle) => (
              <option key={muscle} value={muscle}>
                {he.muscles[muscle]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-muted">
            {he.exercises.equipment}
          </span>
          <select
            value={equipment}
            onChange={(event) => setEquipment(event.target.value as Equipment)}
            className="min-h-12 w-full rounded-2xl border border-white/[0.08] bg-[#111116] px-4 text-white outline-none"
          >
            {equipmentTypes.map((item) => (
              <option key={item} value={item}>
                {he.equipment[item]}
              </option>
            ))}
          </select>
        </label>
        <Button
          className="w-full"
          disabled={!canSave}
          onClick={() => onSave({ nameHe, nameEn, primary, equipment })}
        >
          {he.exercises.addCustom}
        </Button>
      </div>
    </Modal>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'rtl' | 'ltr';
}

function TextInput({ label, value, onChange, dir = 'rtl' }: TextInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-muted">{label}</span>
      <input
        value={value}
        dir={dir}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-2xl border border-white/[0.08] bg-white/[0.05] px-4 text-white outline-none focus:border-volt/40"
      />
    </label>
  );
}
