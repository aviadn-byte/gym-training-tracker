interface StatProps {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: boolean;
}

export function Stat({ label, value, suffix, accent = false }: StatProps) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-semibold text-muted">{label}</p>
      <div
        className={`ltr-num text-3xl font-extrabold leading-none tracking-normal ${
          accent ? 'text-volt' : 'text-white'
        }`}
        dir="ltr"
      >
        {value}
        {suffix ? <span className="ms-1 text-base text-muted">{suffix}</span> : null}
      </div>
    </div>
  );
}
