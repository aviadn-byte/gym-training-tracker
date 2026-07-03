import { describe, expect, it } from 'vitest';
import { calculatePlates } from '../domain/plates';

describe('calculatePlates', () => {
  it('returns plates per side for a 20kg bar', () => {
    expect(calculatePlates(100, 20)).toEqual([
      { plate: 25, count: 1 },
      { plate: 15, count: 1 }
    ]);
  });

  it('returns no plates when target equals bar weight', () => {
    expect(calculatePlates(20, 20)).toEqual([]);
  });
});
