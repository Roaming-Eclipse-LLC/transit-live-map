import { describe, expect, it } from 'vitest';

import { convertLong } from './convertLong';

describe('convertLong', () => {
  it('returns the number as-is when given a plain number', () => {
    expect(convertLong(1234567890)).toBe(1234567890);
  });

  it('calls toNumber() when given a Long-like object', () => {
    const mockLong = {
      low: 1234567890,
      toNumber: () => 1234567890,
    };

    expect(convertLong(mockLong)).toBe(1234567890);
  });

  it('returns Date.now() when given null', () => {
    const before = Date.now();
    const result = convertLong(null);
    const after = Date.now();

    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('returns Date.now() when given undefined', () => {
    const before = Date.now();
    const result = convertLong(null);
    const after = Date.now();

    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('returns Date.now() when given an object without toNumber', () => {
    const before = Date.now();
    const result = convertLong({ low: 123 });
    const after = Date.now();

    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });
});
