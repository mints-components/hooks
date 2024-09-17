import { renderHook, act } from '@testing-library/react';

import { useToggle } from '../src';

describe('useToggle', () => {
  it('should return the default state', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('should return the reverse state when the toggle is called', async () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);

    await act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
  });

  it('should return the default or reverse state when set a default value', async () => {
    const { result } = renderHook(() => useToggle('Hello', 'World'));
    expect(result.current[0]).toBe('Hello');

    await act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe('World');
  });
});
