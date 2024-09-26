import { renderHook, act } from '@testing-library/react';

import { useLocalStorage } from '../src';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should initialize with the value from localStorage', () => {
    localStorage.setItem('key', JSON.stringify('stored value'));

    const { result } = renderHook(() =>
      useLocalStorage('key', 'default value'),
    );

    expect(result.current[0]).toBe('stored value');
  });

  test('should initialize with the default value if localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('key', 'default value'),
    );

    expect(result.current[0]).toBe('default value');
  });

  test('should update localStorage when the value changes', () => {
    const { result } = renderHook(() =>
      useLocalStorage('key', 'default value'),
    );

    act(() => {
      result.current[1]('new value');
    });

    expect(localStorage.getItem('key')).toBe(JSON.stringify('new value'));
    expect(result.current[0]).toBe('new value');
  });

  test('should initialize with the default value if localStorage is not available', () => {
    jest.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('localStorage is not available');
    });

    const { result } = renderHook(() =>
      useLocalStorage('key', 'default value'),
    );

    expect(result.current[0]).toBe('default value');
  });
});
