import { act, renderHook } from '@testing-library/react';

import { FIVE_MINUTES_IN_MS } from '@/constants/common.constants';
import { useDeleteWindow } from '@/hooks/useDeleteWindow';

/* Added by Claude on 2026-08-22
   What: Coverage for the five-minute author delete window.
   Why: The hook gates every delete control this branch adds and had no tests of its own.
   How: Fake timers plus a fixed system time, so createdAt offsets are exact. */

const NOW = new Date('2026-08-22T09:00:00.000Z');
const isoAgo = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('useDeleteWindow', () => {
  it('allows deletion inside the window', () => {
    const { result } = renderHook(() => useDeleteWindow(isoAgo(60_000)));

    expect(result.current).toBe(true);
  });

  it('allows deletion right at the boundary', () => {
    const { result } = renderHook(() => useDeleteWindow(isoAgo(FIVE_MINUTES_IN_MS)));

    expect(result.current).toBe(true);
  });

  it('refuses deletion once the window has passed', () => {
    const { result } = renderHook(() => useDeleteWindow(isoAgo(FIVE_MINUTES_IN_MS + 1)));

    expect(result.current).toBe(false);
  });

  it('closes the window while the component stays mounted', () => {
    const remainingMs = 30_000;
    const { result } = renderHook(() => useDeleteWindow(isoAgo(FIVE_MINUTES_IN_MS - remainingMs)));

    expect(result.current).toBe(true);

    act(() => jest.advanceTimersByTime(remainingMs));
    expect(result.current).toBe(true);

    // The hook schedules its re-check at remainingMs + 1.
    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });

  it('refuses deletion when the caller is not eligible', () => {
    const { result } = renderHook(() => useDeleteWindow(isoAgo(1_000), false));

    expect(result.current).toBe(false);
  });

  it('refuses deletion without a usable creation timestamp', () => {
    expect(renderHook(() => useDeleteWindow(undefined)).result.current).toBe(false);
    expect(renderHook(() => useDeleteWindow(null)).result.current).toBe(false);
    expect(renderHook(() => useDeleteWindow('not a date')).result.current).toBe(false);
  });
});
