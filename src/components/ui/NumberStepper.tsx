import { Minus, Plus } from 'lucide-react';

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  ghost?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function NumberStepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  suffix,
  ghost
}: NumberStepperProps) {
  const setValue = (nextValue: number) => {
    const decimals = step % 1 === 0 ? 0 : 1;
    onChange(Number(clamp(nextValue, min, max).toFixed(decimals)));
  };

  return (
    <div className="rounded-[1.15rem] border border-white/[0.08] bg-white/[0.045] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted">{label}</span>
        {ghost ? <span className="text-xs text-white/35">{ghost}</span> : null}
      </div>
      <div className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-2">
        <button
          type="button"
          aria-label={`הפחת ${label}`}
          onClick={() => setValue(value - step)}
          className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] transition active:scale-[0.94]"
        >
          <Minus size={24} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => setValue(value + step)}
          className="min-w-0 text-center"
          aria-label={`הגדל ${label}`}
        >
          <span className="ltr-num block text-5xl font-extrabold leading-none text-white" dir="ltr">
            {value}
          </span>
          {suffix ? (
            <span className="mt-1 block text-xs font-semibold text-muted">{suffix}</span>
          ) : null}
        </button>
        <button
          type="button"
          aria-label={`הוסף ${label}`}
          onClick={() => setValue(value + step)}
          className="grid h-14 w-14 place-items-center rounded-2xl border border-volt/25 bg-volt/12 text-volt shadow-glow transition active:scale-[0.94]"
        >
          <Plus size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
