import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useAutoRefresh } from '.';

const flushMicrotasks = async () => {
  // resolve any pending promise callbacks
  await Promise.resolve();
  await Promise.resolve();
};

vi.useFakeTimers();

describe('useAutoRefresh', () => {
  const request = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('should return the data after the request is resolved', async () => {
    request.mockResolvedValueOnce('data');

    const { result, rerender } = renderHook(() => useAutoRefresh(request));

    // effect runs after mount; rerender to ensure it kicks
    rerender();

    // let the promise resolve (microtask) without ticking timers
    await act(async () => {
      await flushMicrotasks();
    });

    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: false,
    });
  });

  it('should return the error after the request is rejected', async () => {
    request.mockRejectedValueOnce('error');

    const { result, rerender } = renderHook(() => useAutoRefresh(request));
    rerender();

    await act(async () => {
      await flushMicrotasks();
    });

    expect(result.current).toEqual({
      loading: false,
      error: 'error',
      stoped: false,
    });
  });

  it('should return the stoped state after the retry limit is reached', async () => {
    // first call succeeds, subsequent polling toggles stop
    request.mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAutoRefresh(request, { retryLimit: 1 /* default interval ~5s? */ }),
    );

    // initial resolve
    await act(async () => {
      await flushMicrotasks();
    });
    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: false,
    });

    // advance one polling interval to hit retry limit logic
    act(() => {
      vi.advanceTimersByTime(5000); // match your hook's default intervalMs
    });

    await act(async () => {
      await flushMicrotasks();
    });

    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: true,
    });
  });

  it('should return the stoped state after the stop function is called', async () => {
    request.mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAutoRefresh(request, { stop: (d) => d === 'data' }),
    );

    await act(async () => {
      await flushMicrotasks();
    });

    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: true,
    });

    // even if time passes, stop remains true
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await act(async () => {
      await flushMicrotasks();
    });

    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: true,
    });
  });
});
