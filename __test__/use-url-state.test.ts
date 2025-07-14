import { act, renderHook } from '@testing-library/react';

import { useUrlState } from '../src';

// Mock window.location and history
const originalLocation = window.location;
const originalPushState = window.history.pushState;

function setLocation(search: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      ...originalLocation,
      pathname: '/test',
      search,
    },
  });
}

beforeEach(() => {
  setLocation('');
  window.history.pushState = jest.fn();
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
  window.history.pushState = originalPushState;
});

describe('useUrlState', () => {
  it('should parse number and string params according to defaultState', () => {
    setLocation('?id=123&page=5&name=John');

    const { result } = renderHook(() =>
      useUrlState({ id: '', page: 0, name: '' }),
    );

    expect(result.current[0]).toEqual({ id: '123', page: 5, name: 'John' });
  });

  it('should handle boolean params', () => {
    setLocation('?flag=true');

    const { result } = renderHook(() => useUrlState({ flag: false }));

    expect(result.current[0]).toEqual({ flag: true });
  });

  it('should use defaultState for missing params', () => {
    setLocation('');

    const { result } = renderHook(() =>
      useUrlState({ id: '', page: 1, show: false }),
    );

    expect(result.current[0]).toEqual({ id: '', page: 1, show: false });
  });

  it('should update params and parse types', () => {
    setLocation('?id=1');

    const { result } = renderHook(() => useUrlState({ id: '', page: 0 }));

    act(() => {
      result.current[1]({ page: 100 });
    });

    expect(window.history.pushState).toHaveBeenCalledWith(
      {},
      '',
      '/test?id=1&page=100',
    );
    expect(result.current[0]).toEqual({ id: '1', page: 100 });
  });

  it('should remove a param when set to empty string', () => {
    setLocation('?id=123&name=John');

    const { result } = renderHook(() => useUrlState({ id: '', name: '' }));

    act(() => {
      result.current[1]({ name: '' });
    });

    expect(window.history.pushState).toHaveBeenCalledWith(
      {},
      '',
      '/test?id=123',
    );
    expect(result.current[0]).toEqual({ id: '123', name: '' });
  });

  it('should support functional updates', () => {
    setLocation('?page=1');

    const { result } = renderHook(() => useUrlState({ page: 0, sort: '' }));

    act(() => {
      result.current[1]((prev) => ({ ...prev, sort: 'asc' }));
    });

    expect(window.history.pushState).toHaveBeenCalledWith(
      {},
      '',
      '/test?page=1&sort=asc',
    );
    expect(result.current[0]).toEqual({ page: 1, sort: 'asc' });
  });
});
