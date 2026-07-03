import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-volt text-ink shadow-glow hover:bg-[#d6ff5a] focus-visible:ring-volt/70 font-extrabold',
  secondary:
    'border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.09] focus-visible:ring-white/30',
  ghost: 'text-white/80 hover:bg-white/[0.06] focus-visible:ring-white/20',
  danger:
    'border border-danger/35 bg-danger/10 text-white hover:bg-danger/15 focus-visible:ring-danger/40'
};

export function Button({
  variant = 'primary',
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
