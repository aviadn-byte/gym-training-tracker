import { Dumbbell } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { he } from '../../i18n/he';

export function WorkoutPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold">{he.workout.title}</h2>
        <p className="text-sm text-muted">{he.workout.noActive}</p>
      </div>
      <Card className="text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl border border-volt/25 bg-volt/10 shadow-glow">
          <Dumbbell size={30} strokeWidth={1.5} className="text-volt" />
        </div>
        <h3 className="text-xl font-extrabold">{he.workout.activeTitle}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/65">
          מסך האימון המלא ייבנה בשלב הפעיל: סטפרים גדולים, טיימר מנוחה, PR וחישוב פלטות.
        </p>
        <Button className="mt-5 w-full">{he.today.startWorkout}</Button>
      </Card>
    </div>
  );
}
