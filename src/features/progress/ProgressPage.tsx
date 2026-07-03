import { CalendarDays, Scale, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { NumberStepper } from '../../components/ui/NumberStepper';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { db, createId, nowIso } from '../../db/schema';
import {
  calculateE1RM,
  calculateMuscleVolume,
  calculateSetVolume,
  derivePersonalRecords
} from '../../domain/training';
import { he } from '../../i18n/he';
import type { BodyWeightEntry, Exercise, LoggedSet, WorkoutSession } from '../../types/models';

type ProgressTab = 'exercise' | 'volume' | 'prs' | 'weight' | 'history';

const dateFormatter = new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit' });

const tabOptions: Array<{ value: ProgressTab; label: string }> = [
  { value: 'exercise', label: he.progress.exerciseChart },
  { value: 'volume', label: he.progress.weeklyVolume },
  { value: 'prs', label: he.progress.prs },
  { value: 'weight', label: he.progress.bodyWeight },
  { value: 'history', label: he.progress.history }
];

export function ProgressPage() {
  const [tab, setTab] = useState<ProgressTab>('exercise');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [bodyWeight, setBodyWeight] = useState(80);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);

  const sessions = useLiveQuery(
    () => db.workoutSessions.where('status').equals('completed').toArray(),
    []
  );
  const exercises = useLiveQuery(() => db.exercises.orderBy('nameHe').toArray(), []);
  const bodyWeights = useLiveQuery(() => db.bodyWeightEntries.orderBy('date').toArray(), []);

  const exerciseById = useMemo(
    () => new Map((exercises ?? []).map((exercise) => [exercise.id, exercise])),
    [exercises]
  );

  const selected = selectedExerciseId || exercises?.[0]?.id || '';
  const allSets = useMemo(
    () => (sessions ?? []).flatMap((session) => session.loggedSets),
    [sessions]
  );
  const prs = useMemo(() => derivePersonalRecords(allSets), [allSets]);

  const chartData = useMemo(() => {
    return (sessions ?? [])
      .slice()
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
      .map((session) => {
        const sets = session.loggedSets.filter((set) => set.exerciseId === selected);
        const maxWeight = Math.max(0, ...sets.map((set) => set.weightKg));
        const volume = sets.reduce((sum, set) => sum + calculateSetVolume(set), 0);
        const e1rm = Math.max(0, ...sets.map((set) => calculateE1RM(set) ?? 0));
        return {
          date: dateFormatter.format(new Date(session.startedAt)),
          maxWeight,
          volume,
          e1rm: Number(e1rm.toFixed(1))
        };
      })
      .filter((item) => item.volume > 0 || item.maxWeight > 0);
  }, [selected, sessions]);

  const weeklyVolume = useMemo(() => {
    const latest = (sessions ?? [])
      .slice()
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
    if (!latest || !exercises) return [];
    const weekStart = new Date(latest.startedAt);
    weekStart.setDate(weekStart.getDate() - 7);
    const sets = (sessions ?? [])
      .filter((session) => new Date(session.startedAt) >= weekStart)
      .flatMap((session) => session.loggedSets);
    return Array.from(calculateMuscleVolume(sets, exercises).entries())
      .map(([muscle, volume]) => ({
        muscle: he.muscles[muscle],
        volume: Math.round(volume),
        recommended: 5000
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8);
  }, [exercises, sessions]);

  const latestWeight = bodyWeights?.at(-1)?.weightKg;
  const relativeStrength = useMemo(() => {
    if (!latestWeight) return [];
    return prs
      .filter((record) => record.metric === 'e1rm')
      .map((record) => ({
        exercise: exerciseById.get(record.exerciseId)?.nameHe ?? record.exerciseId,
        value: Number((record.value / latestWeight).toFixed(2))
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [exerciseById, latestWeight, prs]);

  const addBodyWeight = async () => {
    const entry: BodyWeightEntry = {
      id: createId('weight'),
      date: nowIso(),
      weightKg: bodyWeight
    };
    await db.bodyWeightEntries.put(entry);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold">{he.progress.title}</h2>
        <p className="text-sm text-muted">
          {he.progress.weeklyVolume} · {he.progress.prs}
        </p>
      </div>
      <SegmentedControl value={tab} options={tabOptions} onChange={setTab} />

      {tab === 'exercise' ? (
        <Card>
          <select
            value={selected}
            onChange={(event) => setSelectedExerciseId(event.target.value)}
            className="mb-4 min-h-12 w-full rounded-2xl border border-white/[0.08] bg-[#111116] px-4 text-white outline-none"
          >
            {(exercises ?? []).map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.nameHe} / {exercise.nameEn}
              </option>
            ))}
          </select>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#151519',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 14
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  name={he.progress.maxWeight}
                  stroke="#C8FF2E"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="e1rm"
                  name={he.progress.e1rm}
                  stroke="#FF5A36"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      {tab === 'volume' ? (
        <Card>
          <h3 className="mb-4 text-xl font-extrabold">{he.progress.weeklyVolume}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVolume} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} />
                <YAxis
                  dataKey="muscle"
                  type="category"
                  width={76}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#151519',
                    border: '1px solid rgba(255,255,255,.08)',
                    borderRadius: 14
                  }}
                />
                <Bar dataKey="volume" fill="#C8FF2E" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      {tab === 'prs' ? (
        <div className="space-y-3">
          {prs.map((record) => (
            <Card key={`${record.exerciseId}-${record.metric}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold">
                    {exerciseById.get(record.exerciseId)?.nameHe ?? record.exerciseId}
                  </h3>
                  <p className="text-xs text-muted">
                    {record.metric === 'e1rm'
                      ? he.progress.e1rm
                      : record.metric === 'volume'
                        ? he.progress.volume
                        : he.progress.maxWeight}
                  </p>
                </div>
                <p className="ltr-num text-3xl font-extrabold text-volt" dir="ltr">
                  {record.value.toFixed(record.metric === 'e1rm' ? 1 : 0)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === 'weight' ? (
        <div className="space-y-4">
          <Card className="space-y-4">
            <NumberStepper
              label={he.progress.bodyWeight}
              value={bodyWeight}
              step={0.1}
              min={30}
              max={250}
              suffix={he.common.kg}
              onChange={setBodyWeight}
            />
            <Button
              className="w-full"
              icon={<Scale size={19} strokeWidth={1.5} />}
              onClick={addBodyWeight}
            >
              {he.progress.addWeight}
            </Button>
          </Card>
          <Card>
            <h3 className="mb-3 text-xl font-extrabold">{he.progress.relativeStrength}</h3>
            <div className="space-y-2">
              {relativeStrength.map((item) => (
                <div
                  key={item.exercise}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3"
                >
                  <span className="font-semibold text-white/75">{item.exercise}</span>
                  <span className="ltr-num text-2xl font-extrabold text-volt" dir="ltr">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'history' ? (
        <div className="space-y-3">
          {sessions?.length ? (
            sessions
              .slice()
              .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
              .map((session) => (
                <Card key={session.id}>
                  <button
                    type="button"
                    className="w-full text-right"
                    onClick={() => setEditingSession(session)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold">
                          {dateFormatter.format(new Date(session.startedAt))}
                        </h3>
                        <p className="text-xs text-muted">
                          {session.loggedSets.length} {he.common.sets} · RPE{' '}
                          {session.sessionRPE ?? '-'}
                        </p>
                      </div>
                      <CalendarDays size={22} strokeWidth={1.5} className="text-volt" />
                    </div>
                  </button>
                </Card>
              ))
          ) : (
            <Card>
              <p className="text-sm text-muted">{he.progress.noHistory}</p>
            </Card>
          )}
        </div>
      ) : null}

      <SessionEditorModal
        session={editingSession}
        exercises={exerciseById}
        onClose={() => setEditingSession(null)}
        onSave={(session) => {
          db.workoutSessions.put(session);
          setEditingSession(null);
        }}
      />
    </div>
  );
}

function SessionEditorModal({
  session,
  exercises,
  onClose,
  onSave
}: {
  session: WorkoutSession | null;
  exercises: Map<string, Exercise>;
  onClose: () => void;
  onSave: (session: WorkoutSession) => void;
}) {
  const [draft, setDraft] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    setDraft(session);
  }, [session]);

  if (!draft) return null;

  const updateSet = (setId: string, patch: Partial<LoggedSet>) => {
    setDraft({
      ...draft,
      loggedSets: draft.loggedSets.map((set) => (set.id === setId ? { ...set, ...patch } : set))
    });
  };

  return (
    <Modal open title={he.progress.editSession} onClose={onClose}>
      <div className="space-y-3">
        {draft.loggedSets.map((set) => (
          <div key={set.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-extrabold">
                  {exercises.get(set.exerciseId)?.nameHe ?? set.exerciseId}
                </p>
                <p className="text-xs text-muted">{he.workout[set.type]}</p>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl bg-danger/10 text-danger"
                onClick={() =>
                  setDraft({
                    ...draft,
                    loggedSets: draft.loggedSets.filter((item) => item.id !== set.id)
                  })
                }
                aria-label={he.common.delete}
              >
                <Trash2 size={17} strokeWidth={1.5} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MiniNumber
                label={he.common.kg}
                value={set.weightKg}
                step={2.5}
                onChange={(weightKg) => updateSet(set.id, { weightKg })}
              />
              <MiniNumber
                label={he.common.reps}
                value={set.reps}
                onChange={(reps) => updateSet(set.id, { reps })}
              />
              <MiniNumber
                label={he.common.rpe}
                value={set.rpe ?? 0}
                step={0.5}
                onChange={(rpe) => updateSet(set.id, { rpe })}
              />
            </div>
          </div>
        ))}
        <Button className="w-full" onClick={() => onSave(draft)}>
          {he.common.save}
        </Button>
      </div>
    </Modal>
  );
}

function MiniNumber({
  label,
  value,
  step = 1,
  onChange
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[0.68rem] font-semibold text-muted">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="ltr-num min-h-11 w-full rounded-xl border border-white/[0.08] bg-[#111116] px-2 text-center text-white outline-none"
        dir="ltr"
      />
    </label>
  );
}
