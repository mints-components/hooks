import { act, renderHook } from '@testing-library/react';

import { useCountdown } from './use-countdown';

jest.useFakeTimers();

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    localStorage.clear();
  });

  it('counts down to zero and calls onEnd once', () => {
    const onEnd = jest.fn();
    const { result } = renderHook(() => useCountdown({ seconds: 3, onEnd }));

    // initial state
    expect(result.current.secondsLeft).toBe(3);
    expect(result.current.running).toBe(false);

    // start
    act(() => result.current.start());
    expect(result.current.running).toBe(true);
    expect(result.current.secondsLeft).toBe(3);

    // t +1s
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(2);

    // t +2s
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(1);

    // t +3s -> end
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.running).toBe(false);
    expect(onEnd).toHaveBeenCalledTimes(1);

    // keep ticking should not call onEnd again
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('supports start with overrideSeconds', () => {
    const { result } = renderHook(() => useCountdown({ seconds: 5 }));

    act(() => result.current.start(10));
    expect(result.current.running).toBe(true);
    expect(result.current.secondsLeft).toBe(10);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(9);
  });

  it('pause keeps remaining seconds frozen', () => {
    const { result } = renderHook(() => useCountdown({ seconds: 4 }));

    act(() => result.current.start());
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const frozen = result.current.secondsLeft;
    expect(frozen).toBe(2);

    act(() => result.current.pause());
    expect(result.current.running).toBe(false);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toBe(frozen); // unchanged
  });

  it('reset stops and sets back to initial (or provided) seconds', () => {
    const { result } = renderHook(() => useCountdown({ seconds: 5 }));

    act(() => result.current.start());
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.secondsLeft).toBe(3);

    // reset to initial
    act(() => result.current.reset());
    expect(result.current.running).toBe(false);
    expect(result.current.secondsLeft).toBe(5);

    // reset to custom
    act(() => result.current.reset(8));
    expect(result.current.running).toBe(false);
    expect(result.current.secondsLeft).toBe(8);
  });

  it('persists with storageKey and restores after remount', () => {
    const { result, unmount } = renderHook(() =>
      useCountdown({ seconds: 5, storageKey: 'cd' }),
    );

    act(() => result.current.start()); // endAt = now + 5s
    act(() => {
      jest.advanceTimersByTime(2000);
    }); // ~3s left
    expect(result.current.secondsLeft).toBe(3);

    // simulate refresh: unmount, time passes 1s, mount again
    unmount();
    act(() => {
      jest.advanceTimersByTime(1000);
    }); // ~2s left at mount time

    const { result: result2 } = renderHook(() =>
      useCountdown({ seconds: 5, storageKey: 'cd' }),
    );
    expect(result2.current.running).toBe(true);
    // allow either 2 or 1 depending on ceil rounding timing
    expect([2, 1]).toContain(result2.current.secondsLeft);

    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(result2.current.secondsLeft).toBe(0);
    expect(result2.current.running).toBe(false);
  });

  it('autoStart begins immediately when no persisted countdown exists', () => {
    const { result } = renderHook(() =>
      useCountdown({ seconds: 3, autoStart: true }),
    );
    expect(result.current.running).toBe(true);
    expect([3, 2]).toContain(result.current.secondsLeft); // first tick alignment

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.running).toBe(false);
  });

  it('cross-tab sync via storage event updates countdown in another tab', () => {
    // Mount one instance with crossTab enabled (default when storageKey provided)
    const storageKey = 'cd-sync';
    const { result } = renderHook(() =>
      useCountdown({ seconds: 5, storageKey }),
    );

    // Another tab starts a fresh 5s countdown by writing the persisted payload
    const now = Date.now();
    const payload = JSON.stringify({
      mode: 'countdown',
      durationMs: 5000,
      endAt: now + 5000,
    });
    // write to localStorage and dispatch a storage event
    localStorage.setItem(storageKey, payload);
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: storageKey,
          newValue: payload,
          storageArea: localStorage,
        }),
      );
    });

    // The hook should pick up and start running
    expect(result.current.running).toBe(true);
    expect([5, 4]).toContain(result.current.secondsLeft);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.running).toBe(false);
  });
});
