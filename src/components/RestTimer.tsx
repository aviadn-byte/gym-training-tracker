import { Pause, Plus, SkipForward } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { he } from '../i18n/he';
import { Button } from './ui/Button';

interface RestTimerProps {
  totalSeconds: number;
  startedAt: number | null;
  onSkip: () => void;
  onAddSeconds: (seconds: number) => void;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};

export function RestTimer({ totalSeconds, startedAt, onSkip, onAddSeconds }: RestTimerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const remaining = useMemo(() => {
    if (!startedAt) return 0;
    const elapsed = Math.floor((now - startedAt) / 1000);
    return Math.max(0, totalSeconds - elapsed);
  }, [now, startedAt, totalSeconds]);

  useEffect(() => {
    if (remaining === 0 && startedAt && 'vibrate' in navigator) {
      navigator.vibrate?.([120, 80, 120]);
    }
  }, [remaining, startedAt]);

  if (!startedAt || remaining <= 0) return null;

  const progress = Math.max(0, Math.min(100, (remaining / totalSeconds) * 100));

  return (
    <div
      className={`fixed inset-x-4 bottom-[calc(5.9rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl rounded-full border border-volt/25 bg-[#111315]/95 p-2 shadow-glow backdrop-blur-xl ${
        remaining <= 5 ? 'animate-pulse-volt' : ''
      }`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className="h-full bg-volt/12 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="relative flex items-center gap-2">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-volt/35 bg-volt/12">
          <Pause size={18} strokeWidth={1.5} className="text-volt" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted">{he.workout.restTimer}</p>
          <p className="ltr-num text-2xl font-extrabold leading-none text-white" dir="ltr">
            {formatTime(remaining)}
          </p>
        </div>
        <Button
          variant="secondary"
          className="min-h-11 rounded-full px-3"
          onClick={() => onAddSeconds(30)}
        >
          <Plus size={17} strokeWidth={1.5} />
          {he.workout.add30}
        </Button>
        <Button variant="ghost" className="min-h-11 rounded-full px-3" onClick={onSkip}>
          <SkipForward size={17} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
