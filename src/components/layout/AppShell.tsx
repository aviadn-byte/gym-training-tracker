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
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col pb-[calc(9.5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 px-4 pb-2 pt-[calc(.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-4 rounded-[1.65rem] border border-white/[0.08] bg-white/[0.055] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div>
            <p className="text-xs font-semibold text-volt">{he.app.tagline}</p>
            <h1 className="text-2xl font-extrabold tracking-normal text-white">{he.app.name}</h1>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-[1.15rem] border border-volt/20 bg-volt/10 shadow-glow">
            <Dumbbell size={24} strokeWidth={1.5} className="text-volt" />
          </div>
        </div>
      </header>
      <main className="flex-1 px-5 py-5">{children}</main>
      <nav className="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-2xl rounded-[1.8rem] border border-white/[0.1] bg-[#141418]/82 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_65px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
        <div className="grid grid-cols-5 gap-1" dir="rtl">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] text-[0.72rem] font-semibold transition active:scale-[0.97] ${
                  isActive
                    ? 'bg-white/[0.09] text-volt shadow-glow'
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
