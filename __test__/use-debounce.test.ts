import { renderHook, act } from '@testing-library/react';

import { useDebounce } from '../src';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('useDebounce wait:200ms', async () => {
    let mountedState = 0;
    const { result, rerender } = renderHook(() =>
      useDebounce(mountedState, { wait: 200 }),
    );
    expect(result.current).toBe(0);

    mountedState = 1;
    rerender();
    jest.advanceTimersByTime(50);
    expect(result.current).toBe(0);

    mountedState = 2;
    rerender();
    jest.advanceTimersByTime(100);
    expect(result.current).toBe(0);

    mountedState = 3;
    rerender();
    jest.advanceTimersByTime(150);
    expect(result.current).toBe(0);

    mountedState = 4;
    rerender();
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe(4);
  });
});
