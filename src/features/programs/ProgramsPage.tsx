import { Copy, Plus, Play, Settings2, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { db, createId, nowIso } from '../../db/schema';
import { createProgramFromTemplate, goalDefaults } from '../../domain/programTemplates';
import { he } from '../../i18n/he';
import { buildWorkoutSession, recommendedTemplateForGoal } from '../workout/startWorkoutFlow';
import type {
  Exercise,
  PlannedExercise,
  Program,
  ProgramGoal,
  WorkoutDay
} from '../../types/models';

export function ProgramsPage() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [addExerciseDay, setAddExerciseDay] = useState<WorkoutDay | null>(null);
  const [editingExercise, setEditingExercise] = useState<{
    day: WorkoutDay;
    planned: PlannedExercise;
  } | null>(null);

  const programs = useLiveQuery(() => db.programs.orderBy('updatedAt').reverse().toArray(), []);
  const days = useLiveQuery(() => db.workoutDays.orderBy('order').toArray(), []);
  const exercises = useLiveQuery(() => db.exercises.orderBy('nameHe').toArray(), []);
  const exerciseById = useMemo(
    () => new Map((exercises ?? []).map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  const daysByProgram = useMemo(() => {
    const map = new Map<string, WorkoutDay[]>();
    (days ?? []).forEach((day) => {
      map.set(
        day.programId,
        [...(map.get(day.programId) ?? []), day].sort((a, b) => a.order - b.order)
      );
    });
    return map;
  }, [days]);

  const createAutoProgram = async (goal: ProgramGoal) => {
    const { program, days: templateDays } = createProgramFromTemplate(
      recommendedTemplateForGoal(goal),
      goal
    );
    await db.transaction('rw', db.programs, db.workoutDays, async () => {
      await db.programs.put(program);
      await db.workoutDays.bulkPut(templateDays);
    });
    setCreateOpen(false);
  };

  const archiveProgram = async (program: Program) => {
    await db.programs.update(program.id, { status: 'archived', updatedAt: nowIso() });
  };

  const duplicateProgram = async (program: Program) => {
    const clonedProgramId = createId('program');
    const currentDays = daysByProgram.get(program.id) ?? [];
    const timestamp = nowIso();
    await db.transaction('rw', db.programs, db.workoutDays, async () => {
      await db.programs.put({
        ...program,
        id: clonedProgramId,
        name: `${program.name} · עותק`,
        status: 'active',
        createdAt: timestamp,
        updatedAt: timestamp
      });
      await db.workoutDays.bulkPut(
        currentDays.map((day) => ({
          ...day,
          id: createId('day'),
          programId: clonedProgramId,
          createdAt: timestamp,
          updatedAt: timestamp,
          exercises: day.exercises.map((exercise) => ({ ...exercise, id: createId('planned') }))
        }))
      );
    });
  };

  const addExercise = async (day: WorkoutDay, exerciseId: string) => {
    const program = programs?.find((item) => item.id === day.programId);
    const defaults = goalDefaults(program?.goal ?? 'mixed');
    const planned: PlannedExercise = {
      id: createId('planned'),
      exerciseId,
      order: day.exercises.length,
      sets: defaults.sets,
      targetRepsMin: defaults.targetRepsMin,
      targetRepsMax: defaults.targetRepsMax,
      targetRpe: defaults.targetRpe,
      restSeconds: defaults.restSeconds,
      supersetGroup: null
    };
    await db.workoutDays.update(day.id, {
      exercises: [...day.exercises, planned],
      updatedAt: nowIso()
    });
    setAddExerciseDay(null);
  };

  const updatePlannedExercise = async (day: WorkoutDay, planned: PlannedExercise) => {
    await db.workoutDays.update(day.id, {
      exercises: day.exercises.map((exercise) => (exercise.id === planned.id ? planned : exercise)),
      updatedAt: nowIso()
    });
    setEditingExercise(null);
  };

  const updateDayDuration = async (day: WorkoutDay, targetDurationMinutes: number) => {
    await db.workoutDays.update(day.id, {
      targetDurationMinutes,
      updatedAt: nowIso()
    });
  };

  const startDay = async (program: Program, day: WorkoutDay) => {
    const existing = await db.workoutSessions.where('status').equals('active').first();
    if (existing) {
      navigate('/workout');
      return;
    }
    await db.workoutSessions.put(buildWorkoutSession(program.id, day.id));
    navigate('/workout');
  };

  const activePrograms = (programs ?? []).filter((program) => program.status === 'active');
  const archivedPrograms = (programs ?? []).filter((program) => program.status === 'archived');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold">{he.programs.title}</h2>
          <p className="text-sm text-muted">{he.programs.activePrograms}</p>
        </div>
        <Button
          icon={<Plus size={20} strokeWidth={1.5} />}
          className="px-4"
          onClick={() => setCreateOpen(true)}
        >
          {he.common.add}
        </Button>
      </div>

      {!activePrograms.length ? (
        <Card>
          <h3 className="text-xl font-extrabold">{he.programs.noPrograms}</h3>
          <Button className="mt-4 w-full" onClick={() => setCreateOpen(true)}>
            {he.programs.createFromTemplate}
          </Button>
        </Card>
      ) : null}

      {activePrograms.map((program) => (
        <ProgramCard
          key={program.id}
          program={program}
          days={daysByProgram.get(program.id) ?? []}
          exerciseById={exerciseById}
          onArchive={archiveProgram}
          onDuplicate={duplicateProgram}
          onAddExercise={setAddExerciseDay}
          onEditExercise={(day, planned) => setEditingExercise({ day, planned })}
          onUpdateDayDuration={updateDayDuration}
          onStartDay={startDay}
        />
      ))}

      {archivedPrograms.length ? (
        <Card>
          <h3 className="mb-3 text-lg font-extrabold">{he.programs.archivedPrograms}</h3>
          <div className="space-y-2">
            {archivedPrograms.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3"
              >
                <span className="font-semibold text-white/70">{program.name}</span>
                <Button
                  variant="secondary"
                  className="min-h-10 rounded-xl px-3"
                  onClick={() =>
                    db.programs.update(program.id, { status: 'active', updatedAt: nowIso() })
                  }
                >
                  {he.common.resume}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <CreateProgramModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createAutoProgram}
      />
      <AddPlannedExerciseModal
        day={addExerciseDay}
        exercises={exercises ?? []}
        onClose={() => setAddExerciseDay(null)}
        onSave={addExercise}
      />
      <EditPlannedExerciseModal
        item={editingExercise}
        exerciseById={exerciseById}
        onClose={() => setEditingExercise(null)}
        onSave={updatePlannedExercise}
      />
    </div>
  );
}

interface ProgramCardProps {
  program: Program;
  days: WorkoutDay[];
  exerciseById: Map<string, Exercise>;
  onArchive: (program: Program) => void;
  onDuplicate: (program: Program) => void;
  onAddExercise: (day: WorkoutDay) => void;
  onEditExercise: (day: WorkoutDay, planned: PlannedExercise) => void;
  onUpdateDayDuration: (day: WorkoutDay, targetDurationMinutes: number) => void;
  onStartDay: (program: Program, day: WorkoutDay) => void;
}

function ProgramCard({
  program,
  days,
  exerciseById,
  onArchive,
  onDuplicate,
  onAddExercise,
  onEditExercise,
  onUpdateDayDuration,
  onStartDay
}: ProgramCardProps) {
  const defaultDuration = goalDefaults(program.goal).targetDurationMinutes;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold">{program.name}</h3>
          <p className="text-sm text-muted">
            {he.programs[program.goal]} · {program.daysPerWeek} {he.programs.daysPerWeek}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={he.common.duplicate}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] text-white/70"
            onClick={() => onDuplicate(program)}
          >
            <Copy size={19} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label={he.common.archive}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] text-white/70"
            onClick={() => onArchive(program)}
          >
            <Trash2 size={19} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3 text-center">
        <SmallMetric label={he.programs.everyNWeeks} value={program.deload?.everyNWeeks ?? '-'} />
        <SmallMetric label={he.programs.loadFactor} value={program.deload?.loadFactor ?? '-'} />
        <SmallMetric label={he.programs.setFactor} value={program.deload?.setFactor ?? '-'} />
      </div>

      <div className="space-y-3">
        {days.map((day) => (
          <section
            key={day.id}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className="text-lg font-extrabold">{day.name}</h4>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="min-h-10 rounded-xl px-3"
                  icon={<Plus size={17} strokeWidth={1.5} />}
                  onClick={() => onAddExercise(day)}
                >
                  {he.common.add}
                </Button>
                <Button
                  className="min-h-10 rounded-xl px-3"
                  icon={<Play size={17} strokeWidth={1.5} />}
                  onClick={() => onStartDay(program, day)}
                >
                  {he.common.start}
                </Button>
              </div>
            </div>
            <div className="mb-3 rounded-2xl border border-white/[0.06] bg-black/16 p-3">
              <NumberInput
                label={he.programs.targetDuration}
                value={day.targetDurationMinutes ?? defaultDuration}
                min={20}
                max={180}
                step={5}
                suffix={he.common.minutes}
                onChange={(targetDurationMinutes) =>
                  onUpdateDayDuration(day, targetDurationMinutes)
                }
              />
              <p className="mt-2 text-xs leading-5 text-white/50">
                {he.programs.targetDurationHint}
              </p>
            </div>
            <div className="space-y-2">
              {day.exercises.map((planned) => {
                const exercise = exerciseById.get(planned.exerciseId);
                return (
                  <button
                    key={planned.id}
                    type="button"
                    onClick={() => onEditExercise(day, planned)}
                    className="w-full rounded-2xl bg-black/16 p-3 text-right transition hover:bg-white/[0.05] active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold">{exercise?.nameHe ?? planned.exerciseId}</p>
                        <p className="text-xs text-muted" dir="ltr">
                          {exercise?.nameEn}
                        </p>
                      </div>
                      {planned.supersetGroup ? (
                        <span className="rounded-full bg-volt/12 px-2 py-1 text-xs font-bold text-volt">
                          {he.programs.superset} {planned.supersetGroup}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-white/55">
                      {planned.sets} {he.common.sets} · {planned.targetRepsMin}-
                      {planned.targetRepsMax} {he.common.reps} · {planned.restSeconds}{' '}
                      {he.common.seconds}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Card>
  );
}

function SmallMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[0.68rem] font-semibold text-muted">{label}</p>
      <p className="ltr-num mt-1 text-xl font-extrabold text-white" dir="ltr">
        {value}
      </p>
    </div>
  );
}

interface CreateProgramModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (goal: ProgramGoal) => void;
}

function CreateProgramModal({ open, onClose, onCreate }: CreateProgramModalProps) {
  return (
    <Modal open={open} title={he.programs.newProgram} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm leading-6 text-white/62">{he.programs.goalChoiceBody}</p>
        {(['strength', 'hypertrophy', 'mixed'] as ProgramGoal[]).map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => onCreate(goal)}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4 text-right transition hover:border-volt/35 hover:bg-volt/10 active:scale-[0.98]"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold">{he.programs[goal]}</h3>
              <span className="rounded-full bg-volt/12 px-3 py-1 text-xs font-extrabold text-volt">
                {he.programs[recommendedTemplateForGoal(goal)]}
              </span>
            </div>
            <p className="text-sm leading-6 text-white/68">{he.programs.goalDetails[goal]}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
}

interface AddPlannedExerciseModalProps {
  day: WorkoutDay | null;
  exercises: Exercise[];
  onClose: () => void;
  onSave: (day: WorkoutDay, exerciseId: string) => void;
}

function AddPlannedExerciseModal({
  day,
  exercises,
  onClose,
  onSave
}: AddPlannedExerciseModalProps) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? '');

  return (
    <Modal open={Boolean(day)} title={he.programs.addExercise} onClose={onClose}>
      {day ? (
        <div className="space-y-4">
          <select
            value={exerciseId || exercises[0]?.id}
            onChange={(event) => setExerciseId(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-white/[0.08] bg-[#111116] px-4 text-white outline-none"
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.nameHe} / {exercise.nameEn}
              </option>
            ))}
          </select>
          <Button className="w-full" onClick={() => onSave(day, exerciseId || exercises[0]?.id)}>
            {he.programs.addExercise}
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}

interface EditPlannedExerciseModalProps {
  item: { day: WorkoutDay; planned: PlannedExercise } | null;
  exerciseById: Map<string, Exercise>;
  onClose: () => void;
  onSave: (day: WorkoutDay, planned: PlannedExercise) => void;
}

function EditPlannedExerciseModal({
  item,
  exerciseById,
  onClose,
  onSave
}: EditPlannedExerciseModalProps) {
  const [draft, setDraft] = useState<PlannedExercise | null>(null);

  useEffect(() => {
    setDraft(item?.planned ?? null);
  }, [item]);

  const exercise = draft ? exerciseById.get(draft.exerciseId) : null;

  return (
    <Modal
      open={Boolean(item && draft)}
      title={exercise?.nameHe ?? he.programs.editExercise}
      onClose={onClose}
    >
      {item && draft ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label={he.common.sets}
              value={draft.sets}
              min={1}
              onChange={(sets) => setDraft({ ...draft, sets })}
            />
            <NumberInput
              label={he.common.rpe}
              value={draft.targetRpe ?? 8}
              min={1}
              max={10}
              onChange={(targetRpe) => setDraft({ ...draft, targetRpe })}
            />
            <NumberInput
              label={`${he.programs.repsRange} מינ׳`}
              value={draft.targetRepsMin}
              min={1}
              onChange={(targetRepsMin) => setDraft({ ...draft, targetRepsMin })}
            />
            <NumberInput
              label={`${he.programs.repsRange} מקס׳`}
              value={draft.targetRepsMax}
              min={1}
              onChange={(targetRepsMax) => setDraft({ ...draft, targetRepsMax })}
            />
            <NumberInput
              label={he.programs.restSeconds}
              value={draft.restSeconds}
              min={30}
              step={15}
              onChange={(restSeconds) => setDraft({ ...draft, restSeconds })}
            />
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-muted">
                {he.programs.supersetGroup}
              </span>
              <input
                value={draft.supersetGroup ?? ''}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    supersetGroup: event.target.value.trim().toUpperCase() || null
                  })
                }
                placeholder={he.programs.noSuperset}
                className="min-h-12 w-full rounded-2xl border border-white/[0.08] bg-[#111116] px-4 text-white outline-none"
              />
            </label>
          </div>
          <Button
            className="w-full"
            icon={<Settings2 size={19} strokeWidth={1.5} />}
            onClick={() => onSave(item.day, draft)}
          >
            {he.common.save}
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function NumberInput({
  label,
  value,
  min = 0,
  max = 999,
  step = 1,
  suffix,
  onChange
}: NumberInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-muted">{label}</span>
      <div className="flex min-h-12 items-center rounded-2xl border border-white/[0.08] bg-[#111116] px-4">
        <input
          value={value}
          type="number"
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="ltr-num min-h-11 min-w-0 flex-1 bg-transparent text-white outline-none"
          dir="ltr"
        />
        {suffix ? <span className="text-sm font-semibold text-white/50">{suffix}</span> : null}
      </div>
    </label>
  );
}
