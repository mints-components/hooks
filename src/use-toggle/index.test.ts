import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useToggle } from '.';

describe('useToggle', () => {
  it('should return the default state', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('should return the reverse state when the toggle is called', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
  });

  it('should return the default or reverse state when set a default value', () => {
    const { result } = renderHook(() => useToggle('Hello', 'World'));
    expect(result.current[0]).toBe('Hello');

    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe('World');
  });
});
