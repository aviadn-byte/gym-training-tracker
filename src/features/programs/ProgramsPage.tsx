import { Plus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { he } from '../../i18n/he';

export function ProgramsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold">{he.programs.title}</h2>
          <p className="text-sm text-muted">{he.programs.templates}</p>
        </div>
        <Button icon={<Plus size={20} strokeWidth={1.5} />} className="px-4">
          {he.common.add}
        </Button>
      </div>
      <Card>
        <h3 className="text-xl font-extrabold">{he.programs.ppl}</h3>
        <p className="mt-2 text-sm leading-6 text-white/65">
          כאן יופיע עורך התוכניות: ימים, תרגילים, סופר־סטים ודילוד מובנה.
        </p>
      </Card>
    </div>
  );
}
