import { Download, FileUp, ShieldAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { he } from '../../i18n/he';

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold">{he.settings.title}</h2>
        <p className="text-sm text-muted">{he.settings.data}</p>
      </div>
      <Card className="space-y-3">
        <Button
          variant="secondary"
          icon={<Download size={20} strokeWidth={1.5} />}
          className="w-full"
        >
          {he.settings.jsonBackup}
        </Button>
        <Button
          variant="secondary"
          icon={<FileUp size={20} strokeWidth={1.5} />}
          className="w-full"
        >
          {he.settings.restoreJson}
        </Button>
      </Card>
      <Card>
        <div className="flex items-start gap-3">
          <ShieldAlert size={22} strokeWidth={1.5} className="mt-1 text-ember" />
          <div>
            <h3 className="font-extrabold">{he.settings.disclaimer}</h3>
            <p className="mt-1 text-sm leading-6 text-white/65">{he.disclaimer.body}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
