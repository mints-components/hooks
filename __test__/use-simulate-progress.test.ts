import { renderHook, act } from '@testing-library/react';

import { useSimulateProgress } from '../src';

// Mock timers
jest.useFakeTimers();

describe('useSimulateProgress', () => {
  test('should not start progress automatically', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    // Progress should initially be 0
    expect(result.current[0]).toBe(0);

    // Progress should not change before startProgress is called
    act(() => {
      jest.advanceTimersByTime(500); // Fast-forward 500ms
    });
    expect(result.current[0]).toBe(0);
  });

  test('should update progress when startProgress is called', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    // Call startProgress to trigger the progress
    act(() => {
      result.current[1](); // Call startProgress
    });

    // Fast-forward the timer, simulating time passing
    act(() => {
      jest.advanceTimersByTime(250); // Fast-forward 250ms
    });

    // Progress should update to 25%
    expect(result.current[0]).toBe(25);

    act(() => {
      jest.advanceTimersByTime(500); // Fast-forward another 500ms
    });

    // Progress should update to 75%
    expect(result.current[0]).toBe(75);

    act(() => {
      jest.advanceTimersByTime(250); // Finish the remaining time
    });

    // Progress should be 100%, and callback should be called
    expect(result.current[0]).toBe(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  test('should clear interval when unmounted', () => {
    const mockCallback = jest.fn();
    const { result, unmount } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    // Call startProgress to trigger the progress
    act(() => {
      result.current[1](); // Call startProgress
    });

    // Fast-forward the timer halfway
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Progress should be 50%
    expect(result.current[0]).toBe(50);

    // Unmount the component
    unmount();

    // Clear the timer, ensuring no further updates
    act(() => {
      jest.advanceTimersByTime(500); // Finish the remaining time
    });

    // Progress should not update further
    expect(result.current[0]).toBe(50);

    // Callback should not be called
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
