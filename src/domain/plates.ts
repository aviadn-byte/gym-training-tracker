const plateSizesKg = [25, 20, 15, 10, 5, 2.5, 1.25];

export function calculatePlates(targetWeightKg: number, barWeightKg: number) {
  let perSide = Math.max(0, (targetWeightKg - barWeightKg) / 2);
  const result: Array<{ plate: number; count: number }> = [];

  plateSizesKg.forEach((plate) => {
    const count = Math.floor((perSide + 0.001) / plate);
    if (count > 0) {
      result.push({ plate, count });
      perSide = Number((perSide - count * plate).toFixed(2));
    }
  });

  return result;
}
