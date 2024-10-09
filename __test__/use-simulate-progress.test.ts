import { renderHook, act } from '@testing-library/react';

import { useSimulateProgress } from '../src';

jest.useFakeTimers();

describe('useSimulateProgress', () => {
  test('should not start progress automatically', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current[0]).toBe(0);
  });

  test('should update progress when startProgress is called', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    act(() => {
      result.current[1]();
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current[0]).toBe(25);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[0]).toBe(75);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current[0]).toBe(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('resets progress to 0 when resetProgress is called', () => {
    const mockOnComplete = jest.fn();
    const { result } = renderHook(() =>
      useSimulateProgress(1000, mockOnComplete),
    );

    act(() => {
      result.current[1]();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[0]).toBeGreaterThan(0);

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(0);
  });

  test('should clear interval when unmounted', () => {
    const mockCallback = jest.fn();
    const { result, unmount } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    act(() => {
      result.current[1]();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[0]).toBe(50);

    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[0]).toBe(50);

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
