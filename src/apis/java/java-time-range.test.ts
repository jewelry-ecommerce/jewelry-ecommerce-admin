import { afterEach, expect, test, vi } from 'vitest';
import { javaTimeRange } from './java-time-range';
afterEach(() => vi.useRealTimers());
test('explicit dates take precedence over the preset', () => {
  expect(javaTimeRange('TODAY', '2026-10-01', '2026-10-02')).toEqual({ start: '2026-10-01', end: '2026-10-02' });
});
test('both original UI enum spellings produce the same date window', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-11T08:00:00Z'));
  const dates = javaTimeRange('LAST_7_DAYS');
  expect(dates).toEqual(javaTimeRange('Last7Days'));
  expect(Date.parse(dates.end!) - Date.parse(dates.start!)).toBe(7 * 24 * 60 * 60 * 1000 - 1);
});
test('no preset does not invent a date restriction', () => {
  expect(javaTimeRange()).toEqual({});
});
