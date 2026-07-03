import { Ruler, Scale, UserRound, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { he } from '../i18n/he';
import { Button } from './ui/Button';
import { NumberStepper } from './ui/NumberStepper';

export interface ProfileDraft {
  ageYears: number;
  heightCm: number;
  weightKg: number;
}

interface ProfileSetupModalProps {
  open: boolean;
  mode?: 'initial' | 'edit';
  initialAgeYears?: number | null;
  initialHeightCm?: number | null;
  initialWeightKg?: number | null;
  onClose?: () => void;
  onSave: (draft: ProfileDraft) => void;
}

export function ProfileSetupModal({
  open,
  mode = 'initial',
  initialAgeYears,
  initialHeightCm,
  initialWeightKg,
  onClose,
  onSave
}: ProfileSetupModalProps) {
  const [ageYears, setAgeYears] = useState(initialAgeYears ?? 30);
  const [heightCm, setHeightCm] = useState(initialHeightCm ?? 175);
  const [weightKg, setWeightKg] = useState(initialWeightKg ?? 80);

  useEffect(() => {
    if (!open) return;
    setAgeYears(initialAgeYears ?? 30);
    setHeightCm(initialHeightCm ?? 175);
    setWeightKg(initialWeightKg ?? 80);
  }, [initialAgeYears, initialHeightCm, initialWeightKg, open]);

  if (!open) return null;

  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/72 p-4 backdrop-blur-sm sm:place-items-center">
      <section className="max-h-[92vh] w-full max-w-lg overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-gradient-to-br from-surface to-[#101014] shadow-2xl animate-slide-up">
        <header className="flex items-start justify-between gap-3 border-b border-white/[0.06] p-5">
          <div>
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-volt/25 bg-volt/10 text-volt shadow-glow">
              <UserRound size={27} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-extrabold">
              {isEdit ? he.profile.editTitle : he.profile.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {isEdit ? he.profile.editBody : he.profile.body}
            </p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] transition active:scale-[0.95]"
              aria-label={he.common.close}
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          ) : null}
        </header>
        <div className="max-h-[calc(92vh-9rem)] space-y-4 overflow-y-auto p-4">
          <NumberStepper
            label={he.profile.age}
            value={ageYears}
            min={12}
            max={90}
            suffix={he.profile.years}
            onChange={setAgeYears}
          />
          <NumberStepper
            label={he.profile.height}
            value={heightCm}
            min={120}
            max={230}
            suffix={he.profile.cm}
            onChange={setHeightCm}
          />
          <NumberStepper
            label={he.profile.weight}
            value={weightKg}
            min={35}
            max={250}
            step={0.5}
            suffix={he.common.kg}
            onChange={setWeightKg}
          />
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3">
            <ProfileHint
              icon={<Ruler size={17} strokeWidth={1.5} />}
              text={he.profile.heightHint}
            />
            <ProfileHint
              icon={<Scale size={17} strokeWidth={1.5} />}
              text={he.profile.weightHint}
            />
          </div>
          <Button className="w-full" onClick={() => onSave({ ageYears, heightCm, weightKg })}>
            {isEdit ? he.profile.saveEdit : he.profile.save}
          </Button>
        </div>
      </section>
    </div>
  );
}

function ProfileHint({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-volt">{icon}</div>
      <p className="text-xs leading-5 text-white/58">{text}</p>
    </div>
  );
}
