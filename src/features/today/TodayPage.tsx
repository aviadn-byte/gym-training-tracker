import { AlertTriangle, Flame, Play, TrendingUp } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Stat } from '../../components/ui/Stat';
import { Button } from '../../components/ui/Button';
import { db } from '../../db/schema';
import { he } from '../../i18n/he';

export function TodayPage() {
  const activeSession = useLiveQuery(
    () => db.workoutSessions.where('status').equals('active').first(),
    []
  );
  const programs = useLiveQuery(() => db.programs.where('status').equals('active').toArray(), []);

  return (
    <div className="space-y-4">
      <section className="rounded-[1.6rem] border border-volt/20 bg-[linear-gradient(135deg,rgba(200,255,46,0.14),rgba(255,255,255,0.03)_45%,rgba(21,21,25,0.95))] p-5 shadow-glow">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-volt">{he.today.nextWorkout}</p>
            <h2 className="mt-1 text-3xl font-extrabold leading-tight">
              {activeSession ? he.today.resumeWorkout : programs?.[0]?.name || 'תוכנית ראשונה'}
            </h2>
          </div>
          <Flame size={32} strokeWidth={1.5} className="text-volt" />
        </div>
        <Button
          icon={<Play size={20} strokeWidth={1.5} />}
          className="w-full"
          onClick={() => {
            window.location.href = activeSession
              ? '/workout'
              : programs?.length
                ? '/programs'
                : '/programs';
          }}
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
          <Stat label={he.today.weekVolume} value="0" suffix={he.common.kg} accent />
        </Card>
        <Card>
          <Stat label={he.progress.prs} value="0" accent />
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
                index < 3 ? 'border-volt/70 bg-volt shadow-glow' : 'border-white/10 bg-white/[0.04]'
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
        <p className="text-sm text-white/65">{he.today.noAlerts}</p>
      </Card>

      <Link to="/exercises" className="block text-center text-sm font-semibold text-volt">
        {he.exercises.title}
      </Link>
    </div>
  );
}
