import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

import { useDebounce } from '.';

vi.useFakeTimers();

let state = 0;

beforeEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  state = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useDebounce', () => {
  it('should not change when the time has not arrived', () => {
    const { result, rerender } = renderHook(() => useDebounce(state));
    expect(result.current).toBe(0);

    state = 1;
    rerender();
    expect(result.current).toBe(0);

    vi.advanceTimersByTime(500);

    state = 2;
    rerender();
    expect(result.current).toBe(0);
  });

  it('should change when the time has arrived', () => {
    const { result, rerender } = renderHook(() => useDebounce(state));
    expect(result.current).toBe(0);

    state = 1;
    rerender();
    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe(1);
  });
});
