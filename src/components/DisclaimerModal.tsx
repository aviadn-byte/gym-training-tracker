import { ShieldAlert } from 'lucide-react';
import { he } from '../i18n/he';
import { Button } from './ui/Button';

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ open, onAccept }: DisclaimerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/72 p-4 backdrop-blur-sm sm:place-items-center">
      <section className="w-full max-w-md rounded-[1.4rem] border border-white/[0.08] bg-gradient-to-br from-surface to-[#101014] p-5 shadow-2xl animate-slide-up">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-ember/25 bg-ember/10 shadow-ember">
          <ShieldAlert size={26} strokeWidth={1.5} className="text-ember" />
        </div>
        <h2 className="mb-2 text-2xl font-extrabold">{he.disclaimer.title}</h2>
        <p className="mb-5 text-sm leading-7 text-white/70">{he.disclaimer.body}</p>
        <Button className="w-full" onClick={onAccept}>
          {he.disclaimer.accept}
        </Button>
      </section>
    </div>
  );
}
