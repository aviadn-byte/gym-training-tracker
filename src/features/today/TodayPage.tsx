import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarCheck2,
  Flame,
  LockKeyhole,
  Play,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Stat } from '../../components/ui/Stat';
import { db, createId, nowIso } from '../../db/schema';
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

export function TodayPage() {
  const navigate = useNavigate();
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

  const firstProgram = programs?.[0];
  const recommendedDay = selectNextWorkoutDay(days ?? [], sessions ?? [], firstProgram?.id);
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

  const startWorkout = async () => {
    if (activeSession) {
      navigate('/workout');
      return;
    }
    if (!firstProgram || !recommendedDay) {
      navigate('/programs');
      return;
    }
    await db.workoutSessions.put({
      id: createId('session'),
      workoutDayId: recommendedDay.id,
      programId: firstProgram.id,
      startedAt: nowIso(),
      completedAt: null,
      notes: '',
      sessionRPE: null,
      status: 'active',
      loggedSets: [],
      addedExercises: [],
      skippedExerciseIds: []
    });
    navigate('/workout');
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.7rem] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.085),rgba(255,255,255,0.035)_42%,rgba(12,12,14,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-volt/20 bg-volt/10 px-3 py-1 text-xs font-extrabold text-volt">
              <Sparkles size={14} strokeWidth={1.5} />
              {he.today.autoCoach}
            </p>
            <h2 className="mt-1 text-3xl font-extrabold leading-tight">
              {activeSession
                ? he.today.resumeWorkout
                : recommendedDay?.name || firstProgram?.name || he.programs.newProgram}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/62">
              {activeSession
                ? he.today.autoResume
                : recommendedDay
                  ? `${he.today.autoNext}: ${firstProgram?.name}`
                  : he.today.autoBuild}
            </p>
          </div>
          <Flame size={32} strokeWidth={1.5} className="text-volt" />
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2">
          <SmartChip
            icon={<CalendarCheck2 size={16} strokeWidth={1.5} />}
            label={he.today.weekWorkouts}
            value={`${completedThisWeek.length}`}
          />
          <SmartChip
            icon={<TrendingUp size={16} strokeWidth={1.5} />}
            label={he.progress.prs}
            value={prs.length}
          />
          <SmartChip
            icon={<LockKeyhole size={16} strokeWidth={1.5} />}
            label={he.today.dataMode}
            value={he.today.local}
          />
        </div>
        <Button
          icon={<Play size={20} strokeWidth={1.5} />}
          className="w-full"
          onClick={startWorkout}
        >
          {activeSession
            ? he.today.resumeWorkout
            : programs?.length
              ? he.today.startWorkout
              : he.today.buildProgram}
        </Button>
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

      <Link to="/exercises" className="block text-center text-sm font-semibold text-volt">
        {he.exercises.title}
      </Link>
    </div>
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
