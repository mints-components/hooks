import { renderHook, act } from '@testing-library/react';

import { useSimulateProgress } from '../src';

// Mock timers
jest.useFakeTimers();

describe('useSimulateProgress', () => {
  it('should update progress periodically and reach 100%', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    // Initial progress should be 0
    expect(result.current).toBe(0);

    // Fast-forward the timer, simulating time passing
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Progress should update to 25%
    expect(result.current).toBe(25);

    act(() => {
      jest.advanceTimersByTime(500); // Fast-forward another 500ms
    });

    // Progress should update to 75%
    expect(result.current).toBe(75);

    act(() => {
      jest.advanceTimersByTime(250); // Finish the remaining time
    });

    // Progress should be 100%, and callback should be called
    expect(result.current).toBe(100);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback if progress is less than 100%', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    // Fast-forward the timer to 50%
    act(() => {
      jest.advanceTimersByTime(500); // Fast-forward 500ms
    });

    // Progress should be 50%
    expect(result.current).toBe(50);

    // Callback should not be called
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('should clear interval when unmounted', () => {
    const mockCallback = jest.fn();
    const { result, unmount } = renderHook(() =>
      useSimulateProgress(1000, mockCallback),
    );

    // Fast-forward the timer halfway
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Progress should be 50%
    expect(result.current).toBe(50);

    // Unmount the component
    unmount();

    // Clear the timer, ensuring no further updates
    act(() => {
      jest.advanceTimersByTime(500); // Finish the remaining time
    });

    // Progress should not update further
    expect(result.current).toBe(50);

    // Callback should not be called
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
