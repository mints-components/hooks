import { renderHook, act } from '@testing-library/react';

import { useDebounce } from '../src';

jest.useFakeTimers();

describe('useDebounce', () => {
  let state = 0;

  afterEach(() => {
    state = 0;
  });

  it('should not change when the time has not arrived', async () => {
    const { result, rerender } = renderHook(() => useDebounce(state));
    expect(result.current).toBe(0);

    state = 1;
    rerender();
    expect(result.current).toBe(0);

    jest.advanceTimersByTime(500);

    state = 2;
    rerender();
    expect(result.current).toBe(0);
  });

  it('should change when the time has arrived', async () => {
    const { result, rerender } = renderHook(() => useDebounce(state));
    expect(result.current).toBe(0);

    state = 1;
    rerender();
    expect(result.current).toBe(0);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);
  });
});
