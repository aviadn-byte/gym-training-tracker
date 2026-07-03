import { AlertTriangle, Flame, Play, TrendingUp } from 'lucide-react';
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
  const firstDay = days?.find((day) => day.programId === firstProgram?.id);
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
    if (!firstProgram || !firstDay) {
      navigate('/programs');
      return;
    }
    await db.workoutSessions.put({
      id: createId('session'),
      workoutDayId: firstDay.id,
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
      <section className="rounded-[1.6rem] border border-volt/20 bg-[linear-gradient(135deg,rgba(200,255,46,0.14),rgba(255,255,255,0.03)_45%,rgba(21,21,25,0.95))] p-5 shadow-glow">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-volt">{he.today.nextWorkout}</p>
            <h2 className="mt-1 text-3xl font-extrabold leading-tight">
              {activeSession
                ? he.today.resumeWorkout
                : firstProgram?.name || he.programs.newProgram}
            </h2>
          </div>
          <Flame size={32} strokeWidth={1.5} className="text-volt" />
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
