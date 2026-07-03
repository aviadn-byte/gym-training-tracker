interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: SegmentedControlProps<T>) {
  return (
    <div className="grid rounded-2xl border border-white/[0.08] bg-white/[0.04] p-1">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-xl px-3 text-sm font-bold transition active:scale-[0.97] ${
              option.value === value
                ? 'bg-volt text-ink shadow-glow'
                : 'text-white/62 hover:bg-white/[0.05]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
