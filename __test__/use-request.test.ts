import { renderHook, waitFor } from '@testing-library/react';

import { useRequest } from '../src';

const request = jest.fn();

jest.useFakeTimers();

describe('useRequest', () => {
  it('should return the initial values for data, loading, error', async () => {
    const { result } = renderHook(() => useRequest(request));

    expect(result.current).toEqual({
      loading: false,
    });
  });

  it('should return the loading state when the request is pending', async () => {
    request.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('data'), 1000)),
    );

    const { result, rerender } = renderHook(() => useRequest(request));

    expect(result.current).toEqual({
      loading: false,
    });

    jest.advanceTimersByTime(500);
    rerender();
    expect(result.current).toEqual({
      loading: true,
    });
  });

  it('should return the data after the request is resolved', async () => {
    request.mockResolvedValueOnce('data');

    const { result } = renderHook(() => useRequest(request));

    await waitFor(() =>
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
      }),
    );
  });

  it('should return the error state when the request is rejected', async () => {
    const error = new Error('mocked error');
    request.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useRequest(request));

    await waitFor(() =>
      expect(result.current).toEqual({
        loading: false,
        error,
      }),
    );
  });

  it('should abort the fetch request on unmount', () => {
    const mockAbort = jest.spyOn(AbortController.prototype, 'abort');

    const { unmount } = renderHook(() => useRequest(request));

    jest.advanceTimersByTime(10);
    unmount();

    expect(mockAbort).toHaveBeenCalled();
  });
});
