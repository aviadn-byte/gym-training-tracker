import { he } from '../i18n/he';
import { calculatePlates } from '../domain/plates';
import { NumberStepper } from './ui/NumberStepper';

interface PlateCalculatorProps {
  targetWeightKg: number;
  barWeightKg: number;
  onTargetChange: (value: number) => void;
  onBarChange: (value: number) => void;
}

export function PlateCalculator({
  targetWeightKg,
  barWeightKg,
  onTargetChange,
  onBarChange
}: PlateCalculatorProps) {
  const perSide = calculatePlates(targetWeightKg, barWeightKg);

  return (
    <div className="space-y-4">
      <NumberStepper
        label={he.workout.plateCalculator}
        value={targetWeightKg}
        onChange={onTargetChange}
        step={2.5}
        min={barWeightKg}
        suffix={he.common.kg}
      />
      <NumberStepper
        label={he.workout.barWeight}
        value={barWeightKg}
        onChange={onBarChange}
        step={1}
        min={0}
        max={30}
        suffix={he.common.kg}
      />
      <div>
        <p className="mb-2 text-xs font-semibold text-muted">{he.workout.perSide}</p>
        <div className="flex flex-wrap gap-2">
          {perSide.length ? (
            perSide.map(({ plate, count }) => (
              <span
                key={plate}
                className="rounded-full border border-volt/20 bg-volt/10 px-3 py-2 text-sm font-extrabold text-volt"
                dir="ltr"
              >
                {count}x {plate}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted">{he.common.empty}</span>
          )}
        </div>
      </div>
    </div>
  );
}
