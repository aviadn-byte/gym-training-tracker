import { useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck2,
  Dumbbell,
  Flame,
  Gauge,
  Home,
  LockKeyhole,
  Scale,
  Sparkles,
  TrendingUp,
  UserRound,
  Zap
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Stat } from '../../components/ui/Stat';
import { db } from '../../db/schema';
import {
  calculateE1RM,
  calculateTotalVolume,
  derivePersonalRecords,
  detectPainAlert,
  detectStagnation,
  detectWeeklyLoadAlert,
  type Exposure
} from '../../domain/training';
import { selectNextWorkoutDay } from '../../domain/schedule';
import { he } from '../../i18n/he';
import {
  recommendedTemplateForGoal,
  selectQuickStartDay,
  selectQuickStartProgram,
  startRecommendedWorkout
} from '../workout/startWorkoutFlow';
import type { ProgramGoal, WorkoutSession } from '../../types/models';

const dateFormatter = new Intl.DateTimeFormat('he-IL', {
  day: '2-digit',
  month: 'long'
});

export function TodayPage() {
  const navigate = useNavigate();
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);
  const preferences = useLiveQuery(() => db.preferences.get('prefs'), []);
  const bodyWeights = useLiveQuery(() => db.bodyWeightEntries.orderBy('date').toArray(), []);
  const exercises = useLiveQuery(() => db.exercises.orderBy('nameHe').toArray(), []);
  const activeSession = useLiveQuery(
    () => db.workoutSessions.where('status').equals('active').first(),
    []
  );
  const programs = useLiveQuery(() => db.programs.where('status').equals('active').toArray(), []);
  const days = useLiveQuery(() => db.workoutDays.orderBy('order').toArray(), []);
  const sessions = useLiveQuery(
    () => db.workoutSessions.where('status').equals('completed').toArray(),
    []
  );

  const firstProgram = selectQuickStartProgram(programs ?? []);
  const exerciseById = new Map((exercises ?? []).map((exercise) => [exercise.id, exercise]));
  const dayById = new Map((days ?? []).map((day) => [day.id, day]));
  const recommendedDay =
    selectQuickStartDay(days ?? [], sessions ?? [], firstProgram?.id) ??
    selectNextWorkoutDay(days ?? [], sessions ?? [], firstProgram?.id);
  const activeDay = activeSession?.workoutDayId ? dayById.get(activeSession.workoutDayId) : null;
  const nextDay = activeDay ?? recommendedDay;
  const sortedNextExercises = nextDay?.exercises.slice().sort((a, b) => a.order - b.order) ?? [];
  const nextExercisePreview = sortedNextExercises
    .slice(0, 3)
    .map((item) => exerciseById.get(item.exerciseId)?.nameHe ?? he.common.empty);
  const nextExerciseRemainder = Math.max(
    0,
    sortedNextExercises.length - nextExercisePreview.length
  );
  const plannedSetCount = sortedNextExercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const completedThisWeek =
    sessions?.filter((session) => new Date(session.startedAt).getTime() >= weekStart.getTime()) ??
    [];
  const weekVolume = calculateTotalVolume(
    completedThisWeek.flatMap((session) => session.loggedSets)
  );
  const prs = derivePersonalRecords(sessions?.flatMap((session) => session.loggedSets) ?? []);
  const previousWeekVolumes = [1, 2, 3, 4].map((weekOffset) => {
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() - 7 * (weekOffset + 1));
    end.setDate(end.getDate() - 7 * weekOffset);
    return calculateTotalVolume(
      (sessions ?? [])
        .filter(
          (session) => new Date(session.startedAt) >= start && new Date(session.startedAt) < end
        )
        .flatMap((session) => session.loggedSets)
    );
  });

  const exposuresByExercise = new Map<string, Exposure[]>();
  (sessions ?? []).forEach((session) => {
    const inSession = new Map<string, Exposure>();
    session.loggedSets.forEach((set) => {
      const e1rm = calculateE1RM(set);
      const current = inSession.get(set.exerciseId);
      inSession.set(set.exerciseId, {
        date: session.startedAt,
        exerciseId: set.exerciseId,
        bestE1rm: Math.max(current?.bestE1rm ?? 0, e1rm ?? 0),
        painScore: Math.max(current?.painScore ?? 0, set.painScore ?? 0)
      });
    });
    inSession.forEach((exposure, exerciseId) => {
      exposuresByExercise.set(exerciseId, [
        ...(exposuresByExercise.get(exerciseId) ?? []),
        exposure
      ]);
    });
  });

  const alerts = [
    detectWeeklyLoadAlert(weekVolume, previousWeekVolumes) ? he.alerts.load : null,
    Array.from(exposuresByExercise.values()).some(detectPainAlert) ? he.alerts.pain : null,
    Array.from(exposuresByExercise.values()).some(detectStagnation) ? he.alerts.stagnation : null
  ].filter(Boolean);
  const latestWeight = bodyWeights?.at(-1)?.weightKg ?? null;
  const latestSession = getLatestCompletedSession(sessions ?? []);
  const latestSessionDay = latestSession?.workoutDayId
    ? dayById.get(latestSession.workoutDayId)
    : null;
  const latestSessionVolume = latestSession
    ? calculateTotalVolume(latestSession.loggedSets).toLocaleString('he-IL')
    : null;
  const latestSessionDuration =
    latestSession?.completedAt === null || !latestSession
      ? null
      : Math.max(
          1,
          Math.round(
            (new Date(latestSession.completedAt).getTime() -
              new Date(latestSession.startedAt).getTime()) /
              60000
          )
        );

  const startWorkout = async () => {
    if (!activeSession && !recommendedDay) {
      setGoalPickerOpen(true);
      return;
    }
    await startRecommendedWorkout({
      programs: programs ?? [],
      days: days ?? [],
      completedSessions: sessions ?? []
    });
    navigate('/workout');
  };

  const startWithGoal = async (starterGoal: ProgramGoal) => {
    await startRecommendedWorkout({
      programs: programs ?? [],
      days: days ?? [],
      completedSessions: sessions ?? [],
      starterGoal
    });
    setGoalPickerOpen(false);
    navigate('/workout');
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[1.7rem] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(200,255,46,0.12),rgba(255,255,255,0.06)_34%,rgba(12,12,14,0.98)_76%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-volt/20 bg-volt/10 px-3 py-1 text-xs font-extrabold text-volt">
              <Home size={14} strokeWidth={1.5} />
              {he.today.homeEyebrow}
            </p>
            <h2 className="mt-2 text-4xl font-extrabold leading-tight">{he.today.homeTitle}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">{he.today.homeSubtitle}</p>
          </div>
          <Flame size={32} strokeWidth={1.5} className="text-volt" />
        </div>

        <div className="rounded-[1.35rem] border border-white/[0.08] bg-black/20 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold text-volt">
                {activeSession ? he.today.activeSessionLabel : he.today.quickStartLabel}
              </p>
              <h3 className="mt-1 text-2xl font-extrabold">
                {nextDay?.name || firstProgram?.name || he.today.noProgramTitle}
              </h3>
              <p className="mt-1 text-xs leading-5 text-white/55">
                {activeSession
                  ? he.today.autoResume
                  : recommendedDay
                    ? `${he.today.autoNext}: ${firstProgram?.name}`
                    : he.today.autoBuild}
              </p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-volt text-ink shadow-glow">
              <Dumbbell size={24} strokeWidth={1.5} />
            </div>
          </div>

          <Button
            icon={<Zap size={20} strokeWidth={1.5} />}
            className="mb-3 min-h-16 w-full rounded-[1.35rem] text-lg font-extrabold"
            onClick={startWorkout}
          >
            {activeSession ? he.today.resumeWorkout : he.today.startNow}
          </Button>

          <p className="mb-4 rounded-2xl border border-volt/15 bg-volt/10 px-3 py-2 text-center text-xs font-extrabold text-volt">
            {activeSession
              ? he.today.oneTapResume
              : recommendedDay
                ? he.today.oneTapStart
                : he.today.autoCreateAndStart}
          </p>

          {nextDay ? (
            <div className="mb-3 grid grid-cols-2 gap-2">
              <MiniMetric label={he.today.exercisesCount} value={sortedNextExercises.length} />
              <MiniMetric label={he.today.plannedSets} value={plannedSetCount} />
            </div>
          ) : null}

          {nextExercisePreview.length ? (
            <div className="mb-4 space-y-2">
              {nextExercisePreview.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.04] px-3 py-2"
                >
                  <span className="truncate text-sm font-semibold text-white/78">{name}</span>
                  <ArrowLeft size={16} strokeWidth={1.5} className="text-white/35" />
                </div>
              ))}
              {nextExerciseRemainder ? (
                <p className="text-xs font-semibold text-white/45">
                  {he.today.moreExercises.replace('{count}', String(nextExerciseRemainder))}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <SmartChip
            icon={<UserRound size={16} strokeWidth={1.5} />}
            label={he.today.profile}
            value={
              preferences?.profileCompletedAt ? he.today.profileReady : he.today.profileMissing
            }
          />
          <SmartChip
            icon={<Scale size={16} strokeWidth={1.5} />}
            label={he.today.currentWeight}
            value={latestWeight ? `${latestWeight} ${he.common.kg}` : '-'}
          />
          <SmartChip
            icon={<LockKeyhole size={16} strokeWidth={1.5} />}
            label={he.today.dataMode}
            value={he.today.local}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">{he.today.quickActions}</h2>
          <Sparkles size={20} strokeWidth={1.5} className="text-volt" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ActionTile
            to="/programs"
            icon={<CalendarCheck2 size={21} strokeWidth={1.5} />}
            title={he.today.programsShortcut}
            subtitle={firstProgram?.name ?? he.today.buildProgram}
          />
          <ActionTile
            to="/exercises"
            icon={<Dumbbell size={21} strokeWidth={1.5} />}
            title={he.today.exercisesShortcut}
            subtitle={he.exercises.subtitle}
          />
          <ActionTile
            to="/progress"
            icon={<TrendingUp size={21} strokeWidth={1.5} />}
            title={he.today.progressShortcut}
            subtitle={he.today.progressShortcutBody}
          />
          <ActionTile
            to="/settings"
            icon={<UserRound size={21} strokeWidth={1.5} />}
            title={he.today.profileShortcut}
            subtitle={
              preferences?.ageYears && preferences?.heightCm
                ? `${preferences.ageYears} ${he.profile.years} · ${preferences.heightCm} ${he.profile.cm}`
                : he.today.profileMissing
            }
          />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <Stat
            label={he.today.weekVolume}
            value={weekVolume.toLocaleString('he-IL')}
            suffix={he.common.kg}
            accent
          />
        </Card>
        <Card>
          <Stat label={he.progress.prs} value={prs.length} accent />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold text-volt">{he.today.lastWorkout}</p>
            <h2 className="mt-1 text-lg font-extrabold">
              {latestSessionDay?.name ?? he.today.noLastWorkout}
            </h2>
          </div>
          <Gauge size={22} strokeWidth={1.5} className="text-volt" />
        </div>
        {latestSession ? (
          <div className="grid grid-cols-3 gap-2">
            <MiniMetric
              label={he.today.lastDate}
              value={dateFormatter.format(new Date(latestSession.startedAt))}
              numeric={false}
            />
            <MiniMetric label={he.today.sessionSets} value={`${latestSession.loggedSets.length}`} />
            <MiniMetric
              label={he.today.sessionDuration}
              value={
                latestSessionDuration ? `${latestSessionDuration} ${he.today.minutesShort}` : '-'
              }
            />
            <div className="col-span-3">
              <MiniMetric
                label={he.workout.totalVolume}
                value={`${latestSessionVolume} ${he.common.kg}`}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm leading-6 text-white/65">{he.today.noLastWorkoutBody}</p>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{he.today.consistency}</h2>
          <TrendingUp size={20} strokeWidth={1.5} className="text-volt" />
        </div>
        <div className="flex justify-between gap-2" dir="ltr">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className={`h-4 w-4 rounded-full border ${
                index < Math.min(7, completedThisWeek.length)
                  ? 'border-volt/70 bg-volt shadow-glow'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            />
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={20} strokeWidth={1.5} className="text-ember" />
          <h2 className="text-lg font-extrabold">{he.today.alerts}</h2>
        </div>
        {alerts.length ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <p
                key={alert}
                className="rounded-2xl border border-ember/20 bg-ember/10 p-3 text-sm font-semibold text-ember"
              >
                {alert}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/65">{he.today.noAlerts}</p>
        )}
      </Card>

      <Link
        to="/progress"
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-volt/20 bg-volt/10 text-sm font-extrabold text-volt transition active:scale-[0.97]"
      >
        {he.today.viewFullProgress}
        <ArrowLeft size={17} strokeWidth={1.5} />
      </Link>

      <GoalPickerModal
        open={goalPickerOpen}
        onClose={() => setGoalPickerOpen(false)}
        onSelect={startWithGoal}
      />
    </div>
  );
}

function GoalPickerModal({
  open,
  onClose,
  onSelect
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (goal: ProgramGoal) => void;
}) {
  return (
    <Modal open={open} title={he.today.goalPickerTitle} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm leading-6 text-white/62">{he.today.goalPickerBody}</p>
        {(['strength', 'hypertrophy', 'mixed'] as ProgramGoal[]).map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => onSelect(goal)}
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

function getLatestCompletedSession(sessions: WorkoutSession[]) {
  return sessions.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null;
}

function MiniMetric({
  label,
  value,
  numeric = true
}: {
  label: string;
  value: string | number;
  numeric?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.045] p-3">
      <p className="text-[0.68rem] font-semibold text-white/45">{label}</p>
      <p
        className={`mt-1 truncate text-lg font-extrabold text-white ${numeric ? 'ltr-num' : ''}`}
        dir={numeric ? 'ltr' : 'rtl'}
      >
        {value}
      </p>
    </div>
  );
}

function ActionTile({
  to,
  icon,
  title,
  subtitle
}: {
  to: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="group min-h-32 rounded-app border border-white/[0.08] bg-gradient-to-br from-surface to-[#121216] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition active:scale-[0.97]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] text-volt transition group-hover:bg-volt group-hover:text-ink">
          {icon}
        </div>
        <ArrowLeft size={17} strokeWidth={1.5} className="text-white/35" />
      </div>
      <h3 className="font-extrabold">{title}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/55">{subtitle}</p>
    </Link>
  );
}

function SmartChip({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.055] px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-white/50">
        {icon}
        <span className="truncate text-[0.7rem] font-semibold">{label}</span>
      </div>
      <p className="truncate text-sm font-extrabold text-white">{value}</p>
    </div>
  );
}
