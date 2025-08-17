import { renderHook, act } from '@testing-library/react';

import { useLocalStorage, useSessionStorage, useStorage } from '.';

describe('useStorage / useLocalStorage / useSessionStorage', () => {
  const KEY = 'key';

  beforeEach(() => {
    // Safe clear: works whether storages are native or polyfilled.
    try {
      window.localStorage?.clear?.();
      window.sessionStorage?.clear?.();
    } catch {}
  });

  afterEach(() => {
    // jest.setup.ts already restores, but keep this for belt-and-suspenders.
    jest.restoreAllMocks();
  });

  test('useLocalStorage: initialize with value from localStorage', () => {
    localStorage.setItem(KEY, JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    expect(result.current[0]).toBe('stored');
  });

  test('useLocalStorage: initialize with default when empty', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    expect(result.current[0]).toBe('default');
  });

  test('useLocalStorage: update persists to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    act(() => {
      result.current[1]('new value');
    });
    expect(localStorage.getItem(KEY)).toBe(JSON.stringify('new value'));
    expect(result.current[0]).toBe('new value');
  });

  test('useLocalStorage: falls back to default if localStorage unavailable', () => {
    // Simulate getter throwing
    jest
      .spyOn(window, 'localStorage', 'get')
      .mockReturnValue(undefined as unknown as Storage);

    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
    expect(result.current[0]).toBe('default');
  });

  test('useSessionStorage: works with session backend', () => {
    sessionStorage.setItem(KEY, JSON.stringify(42));
    const { result } = renderHook(() => useSessionStorage(KEY, 0));
    expect(result.current[0]).toBe(42);

    act(() => {
      result.current[1]((n) => (n as number) + 1);
    });
    expect(sessionStorage.getItem(KEY)).toBe(JSON.stringify(43));
    expect(result.current[0]).toBe(43);
  });

  test('useStorage with memory strategy (no browser storage)', () => {
    const { result } = renderHook(() =>
      useStorage(KEY, { a: 1 }, { storage: 'memory' }),
    );
    expect(result.current[0]).toEqual({ a: 1 });

    act(() => {
      result.current[1]({ a: 2 });
    });
    // memory does not touch localStorage
    expect(localStorage.getItem(KEY)).toBe(null);
    expect(result.current[0]).toEqual({ a: 2 });

    act(() => {
      result.current[2](); // remove
    });
    expect(result.current[0]).toEqual({ a: 1 });
  });

  test('sync across tabs via storage event', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, 'default'));

    act(() => {
      // simulate another tab writing
      localStorage.setItem(KEY, JSON.stringify('external'));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: KEY,
          newValue: JSON.stringify('external'),
          oldValue: JSON.stringify('default'),
          storageArea: localStorage,
        }),
      );
    });

    expect(result.current[0]).toBe('external');
  });

  test('key change reloads value from storage', () => {
    localStorage.setItem('k1', JSON.stringify('v1'));
    localStorage.setItem('k2', JSON.stringify('v2'));
    const { result, rerender } = renderHook(
      ({ k }) => useLocalStorage(k, 'default'),
      { initialProps: { k: 'k1' } },
    );
    expect(result.current[0]).toBe('v1');
    rerender({ k: 'k2' });
    expect(result.current[0]).toBe('v2');
  });

  test('custom (de)serializer works', () => {
    const { result } = renderHook(() =>
      useLocalStorage<Date>(KEY, new Date('2020-01-01T00:00:00.000Z'), {
        // Store a plain ISO string, not JSON-quoted
        serialize: (d) => (d as Date).toISOString(),
        deserialize: (raw) => new Date(raw),
      }),
    );

    act(() => {
      result.current[1](new Date('2024-02-02T03:04:05.000Z'));
    });

    expect(window.localStorage.getItem(KEY)).toBe('2024-02-02T03:04:05.000Z');
    expect(result.current[0] instanceof Date).toBe(true);
    expect((result.current[0] as Date).toISOString()).toBe(
      '2024-02-02T03:04:05.000Z',
    );
  });
});
