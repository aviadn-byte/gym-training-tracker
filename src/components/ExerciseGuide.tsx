import { ExternalLink, Info, ShieldCheck, Target } from 'lucide-react';
import { buildExerciseYoutubeSearchUrl } from '../domain/exerciseLinks';
import { he } from '../i18n/he';
import type { Exercise } from '../types/models';

interface ExerciseGuideProps {
  exercise: Exercise;
}

export function ExerciseGuide({ exercise }: ExerciseGuideProps) {
  const youtubeUrl = buildExerciseYoutubeSearchUrl(exercise);
  const primaryMuscles = exercise.primaryMuscles.map((muscle) => he.muscles[muscle]).join(' · ');
  const secondaryMuscles =
    exercise.secondaryMuscles.map((muscle) => he.muscles[muscle]).join(' · ') ||
    he.exercises.noSecondary;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-volt/12 text-volt">
            <Info size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-extrabold">{he.exercises.guideTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-white/62">{he.exercises.guideSubtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <GuideStat label={he.exercises.primary} value={primaryMuscles} />
          <GuideStat label={he.exercises.secondary} value={secondaryMuscles} />
          <GuideStat label={he.exercises.equipment} value={he.equipment[exercise.equipment]} />
          <GuideStat
            label={he.exercises.increment}
            value={`${exercise.weightIncrementKg} ${he.common.kg}`}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target size={18} strokeWidth={1.5} className="text-volt" />
          <h3 className="font-extrabold">{he.exercises.formTips}</h3>
        </div>
        <div className="space-y-2">
          {[he.exercises.tipRange, he.exercises.tipTempo, he.exercises.tipPain].map((tip) => (
            <p key={tip} className="rounded-xl bg-white/[0.04] p-3 text-sm leading-6 text-white/70">
              {tip}
            </p>
          ))}
        </div>
      </div>

      <a
        href={youtubeUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-volt px-5 py-3 text-sm font-extrabold text-ink shadow-glow transition active:scale-[0.97]"
      >
        <ExternalLink size={19} strokeWidth={1.5} />
        {he.exercises.youtubeSearch}
      </a>

      <div className="flex items-start gap-2 rounded-2xl border border-ember/20 bg-ember/10 p-3 text-sm leading-6 text-white/68">
        <ShieldCheck size={18} strokeWidth={1.5} className="mt-1 shrink-0 text-ember" />
        <p>{he.exercises.youtubeHint}</p>
      </div>
    </div>
  );
}

function GuideStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.04] p-3">
      <p className="text-[0.7rem] font-semibold text-white/45">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-white">{value}</p>
    </div>
  );
}
