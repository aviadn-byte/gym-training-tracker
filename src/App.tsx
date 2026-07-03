import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppShell } from './components/layout/AppShell';
import { DisclaimerModal } from './components/DisclaimerModal';
import { bootstrapDatabase } from './db/bootstrap';
import { db, nowIso } from './db/schema';
import { ExercisesPage } from './features/exercises/ExercisesPage';
import { TodayPage } from './features/today/TodayPage';
import { ProgramsPage } from './features/programs/ProgramsPage';
import { WorkoutPage } from './features/workout/WorkoutPage';
import { ProgressPage } from './features/progress/ProgressPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { ToastViewport } from './components/ui/ToastViewport';

export function App() {
  const [ready, setReady] = useState(false);
  const preferences = useLiveQuery(() => db.preferences.get('prefs'), []);

  useEffect(() => {
    bootstrapDatabase().finally(() => setReady(true));
  }, []);

  const acceptDisclaimer = async () => {
    await db.preferences.update('prefs', { disclaimerAcceptedAt: nowIso() });
  };

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-6 text-center text-white">
        <div>
          <div className="mx-auto mb-5 h-12 w-12 rounded-full border border-volt/40 border-t-volt animate-spin" />
          <p className="text-sm text-muted">מכין את האימון...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <AppShell>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <DisclaimerModal open={!preferences?.disclaimerAcceptedAt} onAccept={acceptDisclaimer} />
      <ToastViewport />
    </>
  );
}
