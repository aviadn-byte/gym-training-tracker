import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <section
      className={`rounded-app border border-white/[0.08] bg-gradient-to-br from-surface to-[#121216] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
