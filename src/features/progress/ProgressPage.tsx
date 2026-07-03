import { BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { he } from '../../i18n/he';

export function ProgressPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold">{he.progress.title}</h2>
        <p className="text-sm text-muted">
          {he.progress.weeklyVolume} · {he.progress.prs}
        </p>
      </div>
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 size={20} strokeWidth={1.5} className="text-volt" />
          <h3 className="text-xl font-extrabold">{he.progress.exerciseChart}</h3>
        </div>
        <div className="h-40 rounded-2xl border border-dashed border-white/10 bg-white/[0.03]" />
      </Card>
    </div>
  );
}
