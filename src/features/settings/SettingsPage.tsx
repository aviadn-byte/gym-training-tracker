import type { ReactNode } from 'react';
import { BrainCircuit, Download, FileUp, ShieldAlert, Upload, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ProfileSetupModal, type ProfileDraft } from '../../components/ProfileSetupModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { NumberStepper } from '../../components/ui/NumberStepper';
import { db, createId, nowIso } from '../../db/schema';
import { buildAiAnalysisPackage } from '../../domain/aiExport';
import { parseWorkoutCsv } from '../../domain/importers';
import { he } from '../../i18n/he';
import { useToastStore } from '../../stores/toastStore';
import type { WorkoutSession } from '../../types/models';

interface PendingCsvImport {
  text: string;
  unmatched: string[];
  mapping: Record<string, string>;
}

export function SettingsPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const preferences = useLiveQuery(() => db.preferences.get('prefs'), []);
  const exercises = useLiveQuery(() => db.exercises.orderBy('nameHe').toArray(), []);
  const bodyWeights = useLiveQuery(() => db.bodyWeightEntries.orderBy('date').toArray(), []);
  const [pendingCsv, setPendingCsv] = useState<PendingCsvImport | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const exerciseOptions = useMemo(() => exercises ?? [], [exercises]);
  const latestWeight = bodyWeights?.at(-1)?.weightKg ?? null;

  const exportJson = async () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      exercises: await db.exercises.toArray(),
      programs: await db.programs.toArray(),
      workoutDays: await db.workoutDays.toArray(),
      workoutSessions: await db.workoutSessions.toArray(),
      bodyWeightEntries: await db.bodyWeightEntries.toArray(),
      preferences: await db.preferences.toArray()
    };
    downloadTextFile(
      `training-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(backup, null, 2),
      'application/json;charset=utf-8'
    );
    pushToast({ tone: 'success', title: he.settings.backupReady });
  };

  const exportAiAnalysis = async () => {
    const exportedAt = new Date().toISOString();
    const stamp = exportedAt.slice(0, 10);
    const aiPackage = buildAiAnalysisPackage(
      {
        exercises: await db.exercises.toArray(),
        programs: await db.programs.toArray(),
        workoutDays: await db.workoutDays.toArray(),
        workoutSessions: await db.workoutSessions.toArray(),
        bodyWeightEntries: await db.bodyWeightEntries.toArray(),
        preferences: await db.preferences.toArray()
      },
      exportedAt
    );

    downloadTextFile(
      `training-ai-data-${stamp}.json`,
      JSON.stringify(aiPackage.data, null, 2),
      'application/json;charset=utf-8'
    );
    downloadTextFile(
      `training-ai-sets-${stamp}.csv`,
      `\uFEFF${aiPackage.setsCsv}`,
      'text/csv;charset=utf-8'
    );
    downloadTextFile(
      `training-ai-prompt-${stamp}.md`,
      aiPackage.prompt,
      'text/markdown;charset=utf-8'
    );

    pushToast({
      tone: 'success',
      title: he.settings.aiExportReady,
      body: he.settings.aiExportReadyBody
    });
  };

  const restoreJson = async (file: File) => {
    const text = await file.text();
    const backup = JSON.parse(text) as {
      exercises?: unknown[];
      programs?: unknown[];
      workoutDays?: unknown[];
      workoutSessions?: unknown[];
      bodyWeightEntries?: unknown[];
      preferences?: unknown[];
    };
    await db.transaction(
      'rw',
      [
        db.exercises,
        db.programs,
        db.workoutDays,
        db.workoutSessions,
        db.bodyWeightEntries,
        db.preferences
      ],
      async () => {
        await Promise.all([
          db.exercises.clear(),
          db.programs.clear(),
          db.workoutDays.clear(),
          db.workoutSessions.clear(),
          db.bodyWeightEntries.clear(),
          db.preferences.clear()
        ]);
        await db.exercises.bulkPut((backup.exercises ?? []) as never[]);
        await db.programs.bulkPut((backup.programs ?? []) as never[]);
        await db.workoutDays.bulkPut((backup.workoutDays ?? []) as never[]);
        await db.workoutSessions.bulkPut((backup.workoutSessions ?? []) as never[]);
        await db.bodyWeightEntries.bulkPut((backup.bodyWeightEntries ?? []) as never[]);
        await db.preferences.bulkPut((backup.preferences ?? []) as never[]);
      }
    );
    pushToast({ tone: 'success', title: he.settings.restoreDone });
  };

  const importSessions = async (sessions: WorkoutSession[]) => {
    await db.workoutSessions.bulkPut(sessions);
    pushToast({
      tone: 'success',
      title: he.settings.importDone,
      body: `${sessions.length} ${he.progress.history}`
    });
  };

  const handleCsv = async (file: File) => {
    const text = await file.text();
    const parsed = parseWorkoutCsv(text, exerciseOptions);
    if (parsed.unmatched.length) {
      setPendingCsv({ text, unmatched: parsed.unmatched, mapping: {} });
      return;
    }
    await importSessions(parsed.sessions);
  };

  const importMappedCsv = async () => {
    if (!pendingCsv) return;
    const parsed = parseWorkoutCsv(pendingCsv.text, exerciseOptions, pendingCsv.mapping);
    await importSessions(parsed.sessions);
    setPendingCsv(null);
  };

  const saveProfile = async ({ ageYears, heightCm, weightKg }: ProfileDraft) => {
    const savedAt = nowIso();
    await db.transaction('rw', [db.preferences, db.bodyWeightEntries], async () => {
      await db.preferences.update('prefs', {
        ageYears,
        heightCm,
        profileCompletedAt: preferences?.profileCompletedAt ?? savedAt
      });
      await db.bodyWeightEntries.put({
        id: createId('weight'),
        date: savedAt,
        weightKg,
        note: he.profile.updatedWeightNote
      });
    });
    setProfileOpen(false);
    pushToast({ tone: 'success', title: he.profile.saved });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold">{he.settings.title}</h2>
        <p className="text-sm text-muted">{he.settings.data}</p>
      </div>
      <Card className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-volt">
            <UserRound size={23} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-extrabold">{he.profile.settingsTitle}</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <ProfileMiniStat
                label={he.profile.age}
                value={preferences?.ageYears ? `${preferences.ageYears} ${he.profile.years}` : '-'}
              />
              <ProfileMiniStat
                label={he.profile.height}
                value={preferences?.heightCm ? `${preferences.heightCm} ${he.profile.cm}` : '-'}
              />
              <ProfileMiniStat
                label={he.profile.weight}
                value={latestWeight ? `${latestWeight} ${he.common.kg}` : '-'}
              />
            </div>
          </div>
        </div>
        <Button variant="secondary" className="w-full" onClick={() => setProfileOpen(true)}>
          {he.profile.editAction}
        </Button>
      </Card>
      <Card className="space-y-4 border-volt/25 bg-gradient-to-br from-volt/[0.08] to-surface">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-volt/15 text-volt shadow-glow">
            <BrainCircuit size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold">{he.settings.aiExportTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-white/65">
              {he.settings.aiExportDescription}
            </p>
          </div>
        </div>
        <Button
          className="w-full"
          icon={<Download size={20} strokeWidth={1.5} />}
          onClick={exportAiAnalysis}
        >
          {he.settings.aiExportAction}
        </Button>
      </Card>
      <Card className="space-y-3">
        <Button
          variant="secondary"
          icon={<Download size={20} strokeWidth={1.5} />}
          className="w-full"
          onClick={exportJson}
        >
          {he.settings.jsonBackup}
        </Button>
        <FileButton
          label={he.settings.restoreJson}
          icon={<FileUp size={20} strokeWidth={1.5} />}
          accept="application/json"
          onFile={restoreJson}
        />
        <FileButton
          label={he.settings.importCsv}
          icon={<Upload size={20} strokeWidth={1.5} />}
          accept=".csv,text/csv"
          onFile={handleCsv}
        />
      </Card>

      <Card>
        <NumberStepper
          label={he.settings.barWeight}
          value={preferences?.barWeightKg ?? 20}
          min={0}
          max={30}
          suffix={he.common.kg}
          onChange={(barWeightKg) => db.preferences.update('prefs', { barWeightKg })}
        />
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} strokeWidth={1.5} className="mt-1 text-ember" />
          <div>
            <h3 className="font-extrabold">{he.settings.disclaimer}</h3>
            <p className="mt-1 text-sm leading-6 text-white/65">{he.disclaimer.body}</p>
          </div>
        </div>
      </Card>

      <Modal
        open={Boolean(pendingCsv)}
        title={he.settings.unmatched}
        onClose={() => setPendingCsv(null)}
      >
        {pendingCsv ? (
          <div className="space-y-3">
            {pendingCsv.unmatched.map((name) => (
              <label key={name} className="block rounded-2xl bg-white/[0.04] p-3">
                <span className="mb-2 block text-sm font-extrabold" dir="ltr">
                  {name}
                </span>
                <select
                  value={pendingCsv.mapping[name] ?? ''}
                  onChange={(event) =>
                    setPendingCsv({
                      ...pendingCsv,
                      mapping: { ...pendingCsv.mapping, [name]: event.target.value }
                    })
                  }
                  className="min-h-12 w-full rounded-2xl border border-white/[0.08] bg-[#111116] px-4 text-white outline-none"
                >
                  <option value="">{he.settings.chooseMapping}</option>
                  {exerciseOptions.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.nameHe} / {exercise.nameEn}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <Button className="w-full" onClick={importMappedCsv}>
              {he.settings.importMapped}
            </Button>
          </div>
        ) : null}
      </Modal>
      <ProfileSetupModal
        open={profileOpen}
        mode="edit"
        initialAgeYears={preferences?.ageYears}
        initialHeightCm={preferences?.heightCm}
        initialWeightKg={latestWeight}
        onClose={() => setProfileOpen(false)}
        onSave={saveProfile}
      />
    </div>
  );
}

function ProfileMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.04] p-3">
      <p className="text-[0.68rem] font-semibold text-white/45">{label}</p>
      <p className="mt-1 truncate text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

function downloadTextFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function FileButton({
  label,
  icon,
  accept,
  onFile
}: {
  label: string;
  icon: ReactNode;
  accept: string;
  onFile: (file: File) => void;
}) {
  return (
    <label className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.97]">
      {icon}
      {label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = '';
        }}
      />
    </label>
  );
}
