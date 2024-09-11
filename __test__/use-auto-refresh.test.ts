import { renderHook, waitFor, act } from '@testing-library/react';

import { useAutoRefresh } from '../src';

const request = jest.fn();

jest.useFakeTimers();

describe('useAutoRefresh', () => {
  it('should return the initial values for data, loading, error, stoped', async () => {
    request.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAutoRefresh(request));

    expect(result.current).toEqual({
      loading: false,
      stoped: false,
    });
  });

  it('should return the loading state when the request is pending', async () => {
    request.mockImplementation(() => new Promise(() => {}));

    const { result, rerender } = renderHook(() => useAutoRefresh(request));

    rerender();
    expect(result.current).toEqual({
      loading: true,
      stoped: false,
    });
  });

  it('should return the data after the request is resolved', async () => {
    request.mockResolvedValueOnce('data');

    const { result } = renderHook(() => useAutoRefresh(request));

    await waitFor(() => {
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
        stoped: false,
      });
    });
  });

  it('should return the error after the request is rejected', async () => {
    request.mockRejectedValueOnce('error');

    const { result } = renderHook(() => useAutoRefresh(request));

    await waitFor(() => {
      expect(result.current).toEqual({
        loading: false,
        error: 'error',
        stoped: false,
      });
    });
  });

  it('should return the stoped state after the retry limit is reached', async () => {
    request.mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAutoRefresh(request, { retryLimit: 1 }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
        stoped: false,
      });
    });

    jest.advanceTimersByTime(5000);
    await waitFor(() => {
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
        stoped: true,
      });
    });
  });

  it('should return the stoped state after the stop function is called', async () => {
    request.mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAutoRefresh(request, { stop: (data) => data === 'data' }),
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
        stoped: true,
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
        stoped: true,
      });
    });
  });

  it('should abort the fetch request on unmount', () => {
    request.mockResolvedValue('data');
    const mockAbort = jest.spyOn(AbortController.prototype, 'abort');

    const { rerender, unmount } = renderHook(() => useAutoRefresh(request));
    rerender();
    unmount();

    expect(mockAbort).toHaveBeenCalled();
  });
});
