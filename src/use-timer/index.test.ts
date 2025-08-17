import { act, renderHook } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';

import { useTimer, createLocalStorageAdapter } from '.';

vi.useFakeTimers();

describe('useTimer (countdown)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    localStorage.clear();
  });

  it('counts down and calls onEnd once', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() =>
      useTimer({ mode: 'countdown', durationMs: 3000, onEnd }),
    );

    // not running by default
    expect(result.current.running).toBe(false);
    expect(result.current.valueMs).toBe(3000);

    act(() => result.current.start());
    expect(result.current.running).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.valueMs).toBeGreaterThan(1000);
    expect(result.current.valueMs).toBeLessThanOrEqual(2000);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.valueMs).toBe(0);
    expect(result.current.running).toBe(false);
    expect(result.current.ended).toBe(true);
    expect(onEnd).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('supports resume/pause/reset', () => {
    const { result } = renderHook(() =>
      useTimer({ mode: 'countdown', durationMs: 5000 }),
    );

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const after2s = result.current.valueMs;
    expect(after2s).toBeGreaterThanOrEqual(2900);
    expect(after2s).toBeLessThanOrEqual(3000);

    act(() => result.current.pause());
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.valueMs).toBe(after2s); // frozen

    act(() => result.current.reset());
    expect(result.current.running).toBe(false);
    expect(result.current.valueMs).toBe(5000);
  });

  it('persists to localStorage and restores after remount', () => {
    const { result, unmount } = renderHook(() =>
      useTimer({
        mode: 'countdown',
        durationMs: 5000,
        persist: { key: 'timer' },
      }),
    );

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const leftBefore = result.current.valueMs;
    expect(leftBefore).toBeGreaterThanOrEqual(2900);
    expect(leftBefore).toBeLessThanOrEqual(3000);

    unmount();
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { result: result2 } = renderHook(() =>
      useTimer({
        mode: 'countdown',
        durationMs: 5000,
        persist: { key: 'timer' },
      }),
    );
    expect(result2.current.running).toBe(true);
    // ~2s left
    expect(result2.current.valueMs).toBeLessThanOrEqual(2200);
    expect(result2.current.valueMs).toBeGreaterThanOrEqual(1500);

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(result2.current.valueMs).toBe(0);
    expect(result2.current.running).toBe(false);
  });
});

describe('useTimer (countup)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    localStorage.clear();
  });

  it('counts up from 0 and respects stopAtDuration', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() =>
      useTimer({
        mode: 'countup',
        durationMs: 3000,
        stopAtDuration: true,
        onEnd,
      }),
    );

    act(() => result.current.start());
    expect(result.current.running).toBe(true);
    expect(result.current.valueMs).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.valueMs).toBeGreaterThanOrEqual(900);
    expect(result.current.progress).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(result.current.valueMs).toBe(3000);
    expect(result.current.running).toBe(false);
    expect(result.current.ended).toBe(true);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('restores from persisted startAt', () => {
    const adapter = createLocalStorageAdapter('countup');
    // simulate persisted state started at now - 2s
    const payload = JSON.stringify({
      mode: 'countup',
      startAt: Date.now() - 2000,
      durationMs: 5000,
    });
    adapter.set(payload);

    const { result } = renderHook(() =>
      useTimer({
        mode: 'countup',
        durationMs: 5000,
        persist: { key: 'countup' },
      }),
    );

    expect(result.current.running).toBe(true);
    expect(result.current.valueMs).toBeGreaterThanOrEqual(1900);
    expect(result.current.valueMs).toBeLessThanOrEqual(2100);
  });
});
