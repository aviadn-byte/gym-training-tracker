import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-4 backdrop-blur-sm sm:place-items-center">
      <section className="max-h-[88vh] w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-br from-surface to-[#101014] shadow-2xl animate-slide-up">
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] p-4">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.06] transition active:scale-[0.95]"
            aria-label="סגור"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </header>
        <div className="max-h-[calc(88vh-4.75rem)] overflow-y-auto p-4">{children}</div>
      </section>
    </div>
  );
}
