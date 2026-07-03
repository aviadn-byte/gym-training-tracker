import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import { useToastStore, type ToastTone } from '../../stores/toastStore';

const toneClass: Record<ToastTone, string> = {
  default: 'border-white/10 bg-surface text-white',
  success: 'border-volt/30 bg-[#192012] text-white shadow-glow',
  warning: 'border-ember/30 bg-[#251712] text-white shadow-ember',
  danger: 'border-danger/35 bg-[#251113] text-white'
};

const toneIcon = {
  default: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: XCircle
};

export function ToastViewport() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(1rem+env(safe-area-inset-top))] z-[60] mx-auto flex max-w-2xl flex-col gap-2 px-4">
      {toasts.map((toast) => {
        const Icon = toneIcon[toast.tone];
        return (
          <button
            key={toast.id}
            type="button"
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 text-right backdrop-blur-xl transition active:scale-[0.99] ${toneClass[toast.tone]} animate-slide-up`}
          >
            <Icon
              size={22}
              strokeWidth={1.5}
              className={toast.tone === 'success' ? 'mt-0.5 text-volt' : 'mt-0.5 text-ember'}
            />
            <span className="min-w-0">
              <span className="block text-sm font-extrabold">{toast.title}</span>
              {toast.body ? (
                <span className="mt-1 block text-xs leading-5 text-white/65">{toast.body}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
