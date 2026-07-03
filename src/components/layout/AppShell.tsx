import type { ReactNode } from 'react';
import { Activity, BarChart3, CalendarDays, Dumbbell, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { he } from '../../i18n/he';

interface AppShellProps {
  children: ReactNode;
}

const tabs = [
  { to: '/', label: he.tabs.today, icon: CalendarDays },
  { to: '/workout', label: he.tabs.workout, icon: Dumbbell },
  { to: '/programs', label: he.tabs.programs, icon: Activity },
  { to: '/progress', label: he.tabs.progress, icon: BarChart3 },
  { to: '/settings', label: he.tabs.settings, icon: Settings }
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col pb-[calc(5.75rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-ink/82 px-5 pb-3 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-volt">{he.app.tagline}</p>
            <h1 className="text-2xl font-extrabold tracking-normal text-white">{he.app.name}</h1>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-volt/25 bg-volt/10 shadow-glow">
            <Dumbbell size={24} strokeWidth={1.5} className="text-volt" />
          </div>
        </div>
      </header>
      <main className="flex-1 px-5 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-2xl border-t border-white/[0.08] bg-[#101014]/92 px-2 pb-[calc(.6rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.72rem] font-semibold transition active:scale-[0.97] ${
                  isActive
                    ? 'bg-volt/12 text-volt shadow-glow'
                    : 'text-white/58 hover:bg-white/[0.05] hover:text-white'
                }`
              }
            >
              <Icon size={21} strokeWidth={1.5} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
