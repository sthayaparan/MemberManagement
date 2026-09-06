import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/dateFormatter';

describe('formatDate', () => {
  it('formats a plain ISO date', () => {
    expect(formatDate('1980-05-15')).toBe('15 May 1980');
  });

  it('formats a full ISO datetime by ignoring the time part', () => {
    expect(formatDate('1992-11-30T00:00:00')).toBe('30 Nov 1992');
  });

  it('does not shift the day across timezones', () => {
    expect(formatDate('2000-01-01')).toBe('1 Jan 2000');
  });

  it('returns a dash for an empty string', () => {
    expect(formatDate('')).toBe('-');
  });
});
