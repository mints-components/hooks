import { renderHook } from '@testing-library/react';

import { useQueryParams } from '../src';

// Mock window.location.search
const setSearch = (search) => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { search },
  });
};

describe('useQueryParams', () => {
  it('should return query parameters from URL', () => {
    setSearch('?id=123&name=John');

    const { result } = renderHook(() =>
      useQueryParams<{ id: string; name: string }>(),
    );

    expect(result.current).toEqual({ id: '123', name: 'John' });
  });

  it('should return an empty object when no query parameters exist', () => {
    setSearch('');

    const { result } = renderHook(() => useQueryParams());

    expect(result.current).toEqual({});
  });
});
