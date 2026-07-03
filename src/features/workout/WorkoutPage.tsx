import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Info,
  Plus,
  Save,
  Shuffle,
  Trash2
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { NumberStepper } from '../../components/ui/NumberStepper';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Stat } from '../../components/ui/Stat';
import { Confetti } from '../../components/Confetti';
import { ExerciseGuide } from '../../components/ExerciseGuide';
import { PlateCalculator } from '../../components/PlateCalculator';
import { RestTimer } from '../../components/RestTimer';
import { db, createId, nowIso } from '../../db/schema';
import { goalDefaults } from '../../domain/programTemplates';
import {
  calculateTotalVolume,
  suggestDoubleProgression,
  wouldSetBeatPr
} from '../../domain/training';
import { he } from '../../i18n/he';
import { useToastStore } from '../../stores/toastStore';
import type {
  Exercise,
  LoggedSet,
  PlannedExercise,
  SetType,
  WorkoutSession
} from '../../types/models';

type SetDraft = {
  weightKg: number;
  reps: number;
  rpe: number | null;
  type: SetType;
  painScore: number | null;
};

const setTypeOptions: Array<{ value: SetType; label: string }> = [
  { value: 'warmup', label: he.workout.warmup },
  { value: 'working', label: he.workout.working },
  { value: 'drop', label: he.workout.drop },
  { value: 'amrap', label: he.workout.amrap }
];

export function WorkoutPage() {
  const navigate = useNavigate();
  const pushToast = useToastStore((state) => state.pushToast);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [draft, setDraft] = useState<SetDraft>({
    weightKg: 20,
    reps: 8,
    rpe: 8,
    type: 'working',
    painScore: null
  });
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
  const [restTotalSeconds, setRestTotalSeconds] = useState(120);
  const [plateOpen, setPlateOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<LoggedSet | null>(null);
  const [sessionRPE, setSessionRPE] = useState(8);
  const [confetti, setConfetti] = useState(false);
  const [summary, setSummary] = useState<{
    volume: number;
    durationMinutes: number;
    prs: number;
  } | null>(null);

  const session = useLiveQuery(
    () => db.workoutSessions.where('status').equals('active').first(),
    []
  );
  const day = useLiveQuery(
    () => (session?.workoutDayId ? db.workoutDays.get(session.workoutDayId) : undefined),
    [session?.workoutDayId]
  );
  const program = useLiveQuery(
    () => (session?.programId ? db.programs.get(session.programId) : undefined),
    [session?.programId]
  );
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const previousSessions = useLiveQuery(
    () => db.workoutSessions.where('status').equals('completed').reverse().sortBy('startedAt'),
    []
  );
  const preferences = useLiveQuery(() => db.preferences.get('prefs'), []);

  const exerciseById = useMemo(
    () => new Map((exercises ?? []).map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  const plan = useMemo(() => {
    const planned = [...(day?.exercises ?? []), ...(session?.addedExercises ?? [])].sort(
      (a, b) => a.order - b.order
    );
    const skipped = new Set(session?.skippedExerciseIds ?? []);
    return planned.filter((item) => !skipped.has(item.id));
  }, [day?.exercises, session?.addedExercises, session?.skippedExerciseIds]);

  const planned = plan[Math.min(exerciseIndex, Math.max(0, plan.length - 1))];
  const exercise = planned ? exerciseById.get(planned.exerciseId) : null;
  const loggedForExercise = useMemo(
    () =>
      (session?.loggedSets ?? []).filter(
        (set) => set.plannedExerciseId === planned?.id || set.exerciseId === planned?.exerciseId
      ),
    [planned?.exerciseId, planned?.id, session?.loggedSets]
  );

  const previousForExercise = useMemo(() => {
    const sets =
      previousSessions
        ?.flatMap((item) => item.loggedSets)
        .filter((set) => set.exerciseId === planned?.exerciseId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)) ?? [];
    return sets;
  }, [planned?.exerciseId, previousSessions]);

  const suggestion = useMemo(() => {
    if (!planned || !exercise) return null;
    return suggestDoubleProgression({
      loggedSets: previousForExercise,
      plannedSets: planned.sets,
      targetRepsMax: planned.targetRepsMax,
      targetRpe: planned.targetRpe,
      incrementKg: exercise.weightIncrementKg
    });
  }, [exercise, planned, previousForExercise]);

  useEffect(() => {
    if (!planned || !exercise) return;
    const previous = previousForExercise[loggedForExercise.length];
    setDraft((current) => ({
      weightKg: previous?.weightKg ?? current.weightKg,
      reps: previous?.reps ?? planned.targetRepsMin,
      rpe: previous?.rpe ?? planned.targetRpe,
      type: 'working',
      painScore: null
    }));
    setRestTotalSeconds(planned.restSeconds);
  }, [exercise, loggedForExercise.length, planned, previousForExercise]);

  const updateSession = async (nextSession: WorkoutSession) => {
    await db.workoutSessions.put(nextSession);
  };

  const saveSet = async () => {
    if (!session || !planned || !exercise) return;
    const timestamp = nowIso();
    const newSet: LoggedSet = {
      id: createId('set'),
      exerciseId: planned.exerciseId,
      plannedExerciseId: planned.id,
      setNumber: loggedForExercise.length + 1,
      type: draft.type,
      weightKg: draft.weightKg,
      reps: draft.reps,
      rpe: draft.rpe,
      painScore: draft.painScore,
      timestamp
    };
    const previousSets = [
      ...(previousSessions?.flatMap((item) => item.loggedSets) ?? []),
      ...session.loggedSets.filter((set) => set.id !== newSet.id)
    ];
    const isPr = wouldSetBeatPr(newSet, previousSets);
    await updateSession({ ...session, loggedSets: [...session.loggedSets, newSet] });
    setRestStartedAt(Date.now());
    setRestTotalSeconds(planned.restSeconds);
    pushToast({
      tone: isPr ? 'success' : 'default',
      title: isPr ? he.workout.newPr : he.workout.setSaved
    });
    if (isPr) {
      setConfetti(true);
      window.setTimeout(() => setConfetti(false), 1100);
    }
  };

  const deleteSet = async (setId: string) => {
    if (!session) return;
    await updateSession({
      ...session,
      loggedSets: session.loggedSets.filter((set) => set.id !== setId)
    });
  };

  const saveEditedSet = async (editedSet: LoggedSet) => {
    if (!session) return;
    await updateSession({
      ...session,
      loggedSets: session.loggedSets.map((set) => (set.id === editedSet.id ? editedSet : set))
    });
    setEditingSet(null);
  };

  const skipExercise = async () => {
    if (!session || !planned) return;
    await updateSession({
      ...session,
      skippedExerciseIds: [...(session.skippedExerciseIds ?? []), planned.id]
    });
    setExerciseIndex((index) => Math.min(index, Math.max(0, plan.length - 2)));
  };

  const addExercise = async (exerciseId: string) => {
    if (!session || !program) return;
    const defaults = goalDefaults(program.goal);
    const added: PlannedExercise = {
      id: createId('planned'),
      exerciseId,
      order: plan.length + (session.addedExercises?.length ?? 0),
      sets: defaults.sets,
      targetRepsMin: defaults.targetRepsMin,
      targetRepsMax: defaults.targetRepsMax,
      targetRpe: defaults.targetRpe,
      restSeconds: defaults.restSeconds,
      supersetGroup: null
    };
    await updateSession({
      ...session,
      addedExercises: [...(session.addedExercises ?? []), added],
      notes: `${session.notes ? `${session.notes}\n` : ''}נוסף באמצע אימון: ${exerciseById.get(exerciseId)?.nameHe ?? exerciseId}`
    });
    setAddExerciseOpen(false);
    setExerciseIndex(plan.length);
  };

  const finishWorkout = async () => {
    if (!session) return;
    const completedAt = nowIso();
    const durationMinutes = Math.max(
      1,
      Math.round((new Date(completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
    );
    const prs = session.loggedSets.filter((set, index) =>
      wouldSetBeatPr(set, session.loggedSets.slice(0, index))
    ).length;
    await updateSession({
      ...session,
      completedAt,
      sessionRPE,
      status: 'completed'
    });
    setSummary({
      volume: calculateTotalVolume(session.loggedSets),
      durationMinutes,
      prs
    });
    setFinishOpen(false);
    setRestStartedAt(null);
  };

  if (summary) {
    return <WorkoutSummary summary={summary} onClose={() => setSummary(null)} />;
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-extrabold">{he.workout.title}</h2>
          <p className="text-sm text-muted">{he.workout.noActive}</p>
        </div>
        <Card className="text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-volt/25 bg-volt/10 shadow-glow">
            <Dumbbell size={30} strokeWidth={1.5} className="text-volt" />
          </div>
          <h3 className="text-xl font-extrabold">{he.workout.activeTitle}</h3>
          <Button className="mt-5 w-full" onClick={() => navigate('/programs')}>
            {he.today.startWorkout}
          </Button>
        </Card>
      </div>
    );
  }

  if (!planned || !exercise) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold">{he.workout.activeTitle}</h2>
        <Card>
          <p className="text-sm text-muted">{he.common.empty}</p>
          <Button className="mt-4 w-full" onClick={() => setFinishOpen(true)}>
            {he.workout.finish}
          </Button>
        </Card>
        <FinishWorkoutModal
          open={finishOpen}
          sessionRPE={sessionRPE}
          setSessionRPE={setSessionRPE}
          onClose={() => setFinishOpen(false)}
          onFinish={finishWorkout}
        />
      </div>
    );
  }

  const previousGhost = previousForExercise[loggedForExercise.length]
    ? `${previousForExercise[loggedForExercise.length].weightKg}×${previousForExercise[loggedForExercise.length].reps}`
    : undefined;

  return (
    <div className="space-y-4">
      <Confetti active={confetti} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-volt">
            {day?.name} · {exerciseIndex + 1}/{plan.length}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight">{exercise.nameHe}</h2>
          <p className="text-sm text-muted" dir="ltr">
            {exercise.nameEn}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-volt"
            onClick={() => setGuideOpen(true)}
            aria-label={he.exercises.explanation}
          >
            <Info size={21} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06]"
            onClick={() => setExerciseIndex((index) => Math.max(0, index - 1))}
            aria-label="הקודם"
          >
            <ChevronRight size={21} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06]"
            onClick={() => setExerciseIndex((index) => Math.min(plan.length - 1, index + 1))}
            aria-label="הבא"
          >
            <ChevronLeft size={21} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-3">
          <Stat label={he.common.sets} value={`${loggedForExercise.length}/${planned.sets}`} />
          <Stat
            label={he.common.reps}
            value={`${planned.targetRepsMin}-${planned.targetRepsMax}`}
            accent
          />
          <Stat
            label={he.common.rest}
            value={Math.round(planned.restSeconds / 60)}
            suffix={he.common.minutes}
          />
        </div>
        {suggestion ? (
          <p className="mt-4 rounded-2xl border border-volt/20 bg-volt/10 p-3 text-sm font-semibold text-volt">
            {he.workout.suggested}: {suggestion.message}
          </p>
        ) : null}
        {exercise.notes ? (
          <p className="mt-3 rounded-2xl bg-white/[0.04] p-3 text-sm leading-6 text-white/70">
            {exercise.notes}
          </p>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <SegmentedControl
          value={draft.type}
          options={setTypeOptions}
          onChange={(type) => setDraft((current) => ({ ...current, type }))}
        />
        <NumberStepper
          label={he.common.kg}
          value={draft.weightKg}
          step={exercise.weightIncrementKg}
          min={0}
          suffix={he.common.kg}
          ghost={previousGhost ? `${he.workout.previous}: ${previousGhost}` : undefined}
          onChange={(weightKg) => setDraft((current) => ({ ...current, weightKg }))}
        />
        <NumberStepper
          label={he.common.reps}
          value={draft.reps}
          step={1}
          min={0}
          suffix={he.common.reps}
          onChange={(reps) => setDraft((current) => ({ ...current, reps }))}
        />
        <div className="space-y-3">
          <NumberStepper
            label={he.common.rpe}
            value={draft.rpe ?? 0}
            step={0.5}
            min={0}
            max={10}
            onChange={(rpe) => setDraft((current) => ({ ...current, rpe }))}
          />
          <NumberStepper
            label={he.workout.pain}
            value={draft.painScore ?? 0}
            step={1}
            min={0}
            max={10}
            onChange={(painScore) => setDraft((current) => ({ ...current, painScore }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setPlateOpen(true)}>
            {he.workout.plateCalculator}
          </Button>
          <Button icon={<Save size={20} strokeWidth={1.5} />} onClick={saveSet}>
            {he.workout.saveSet}
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {loggedForExercise.map((set) => (
          <div
            key={set.id}
            role="button"
            tabIndex={0}
            onClick={() => setEditingSet(set)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') setEditingSet(set);
            }}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3 text-right animate-slide-up"
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-volt/12 text-volt">
              <Check size={18} strokeWidth={1.5} className="animate-check-pop" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="ltr-num text-xl font-extrabold" dir="ltr">
                {set.weightKg} × {set.reps}
              </p>
              <p className="text-xs text-muted">
                {he.workout[set.type]} · RPE {set.rpe ?? '-'} · {he.workout.pain}{' '}
                {set.painScore ?? 0}
              </p>
            </div>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-danger/10 text-danger"
              onClick={(event) => {
                event.stopPropagation();
                deleteSet(set.id);
              }}
              aria-label={he.common.delete}
            >
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="secondary"
          icon={<Plus size={18} strokeWidth={1.5} />}
          onClick={() => setAddExerciseOpen(true)}
        >
          {he.common.add}
        </Button>
        <Button
          variant="secondary"
          icon={<Shuffle size={18} strokeWidth={1.5} />}
          onClick={skipExercise}
        >
          {he.workout.skipExercise}
        </Button>
        <Button variant="danger" onClick={() => setFinishOpen(true)}>
          {he.workout.finish}
        </Button>
      </div>

      <RestTimer
        totalSeconds={restTotalSeconds}
        startedAt={restStartedAt}
        onSkip={() => setRestStartedAt(null)}
        onAddSeconds={(seconds) => setRestTotalSeconds((current) => current + seconds)}
      />
      <Modal
        open={plateOpen}
        title={he.workout.plateCalculator}
        onClose={() => setPlateOpen(false)}
      >
        <PlateCalculator
          targetWeightKg={draft.weightKg}
          barWeightKg={preferences?.barWeightKg ?? 20}
          onTargetChange={(weightKg) => setDraft((current) => ({ ...current, weightKg }))}
          onBarChange={(barWeightKg) => db.preferences.update('prefs', { barWeightKg })}
        />
      </Modal>
      <Modal open={guideOpen} title={exercise.nameHe} onClose={() => setGuideOpen(false)}>
        <ExerciseGuide exercise={exercise} />
      </Modal>
      <AddExerciseDuringWorkoutModal
        open={addExerciseOpen}
        exercises={exercises ?? []}
        onClose={() => setAddExerciseOpen(false)}
        onSave={addExercise}
      />
      <FinishWorkoutModal
        open={finishOpen}
        sessionRPE={sessionRPE}
        setSessionRPE={setSessionRPE}
        onClose={() => setFinishOpen(false)}
        onFinish={finishWorkout}
      />
      <EditSetModal set={editingSet} onClose={() => setEditingSet(null)} onSave={saveEditedSet} />
    </div>
  );
}

function EditSetModal({
  set,
  onClose,
  onSave
}: {
  set: LoggedSet | null;
  onClose: () => void;
  onSave: (set: LoggedSet) => void;
}) {
  const [draft, setDraft] = useState<LoggedSet | null>(null);

  useEffect(() => {
    setDraft(set);
  }, [set]);

  if (!draft) return null;

  return (
    <Modal open title={he.common.edit} onClose={onClose}>
      <div className="space-y-4">
        <SegmentedControl
          value={draft.type}
          options={setTypeOptions}
          onChange={(type) => setDraft({ ...draft, type })}
        />
        <NumberStepper
          label={he.common.kg}
          value={draft.weightKg}
          step={2.5}
          suffix={he.common.kg}
          onChange={(weightKg) => setDraft({ ...draft, weightKg })}
        />
        <NumberStepper
          label={he.common.reps}
          value={draft.reps}
          onChange={(reps) => setDraft({ ...draft, reps })}
        />
        <div className="space-y-3">
          <NumberStepper
            label={he.common.rpe}
            value={draft.rpe ?? 0}
            step={0.5}
            max={10}
            onChange={(rpe) => setDraft({ ...draft, rpe })}
          />
          <NumberStepper
            label={he.workout.pain}
            value={draft.painScore ?? 0}
            max={10}
            onChange={(painScore) => setDraft({ ...draft, painScore })}
          />
        </div>
        <Button className="w-full" onClick={() => onSave(draft)}>
          {he.common.save}
        </Button>
      </div>
    </Modal>
  );
}

function AddExerciseDuringWorkoutModal({
  open,
  exercises,
  onClose,
  onSave
}: {
  open: boolean;
  exercises: Exercise[];
  onClose: () => void;
  onSave: (exerciseId: string) => void;
}) {
  const [exerciseId, setExerciseId] = useState('');
  const selected = exerciseId || exercises[0]?.id || '';

  return (
    <Modal open={open} title={he.programs.addExercise} onClose={onClose}>
      <div className="space-y-4">
        <select
          value={selected}
          onChange={(event) => setExerciseId(event.target.value)}
          className="min-h-12 w-full rounded-2xl border border-white/[0.08] bg-[#111116] px-4 text-white outline-none"
        >
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.nameHe} / {exercise.nameEn}
            </option>
          ))}
        </select>
        <Button className="w-full" onClick={() => onSave(selected)}>
          {he.common.add}
        </Button>
      </div>
    </Modal>
  );
}

function FinishWorkoutModal({
  open,
  sessionRPE,
  setSessionRPE,
  onClose,
  onFinish
}: {
  open: boolean;
  sessionRPE: number;
  setSessionRPE: (value: number) => void;
  onClose: () => void;
  onFinish: () => void;
}) {
  return (
    <Modal open={open} title={he.workout.finish} onClose={onClose}>
      <div className="space-y-4">
        <NumberStepper
          label={he.workout.sessionRpe}
          value={sessionRPE}
          min={1}
          max={10}
          onChange={setSessionRPE}
        />
        <Button className="w-full" onClick={onFinish}>
          {he.workout.finish}
        </Button>
      </div>
    </Modal>
  );
}

function WorkoutSummary({
  summary,
  onClose
}: {
  summary: { volume: number; durationMinutes: number; prs: number };
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-extrabold">{he.workout.summary}</h2>
      <Card className="grid grid-cols-3 gap-3">
        <Stat
          label={he.workout.totalVolume}
          value={summary.volume.toLocaleString('he-IL')}
          suffix={he.common.kg}
          accent
        />
        <Stat
          label={he.workout.duration}
          value={summary.durationMinutes}
          suffix={he.common.minutes}
        />
        <Stat label={he.workout.prs} value={summary.prs} accent={summary.prs > 0} />
      </Card>
      <Button className="w-full" onClick={onClose}>
        {he.common.done}
      </Button>
    </div>
  );
}
