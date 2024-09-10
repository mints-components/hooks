import { renderHook, waitFor } from '@testing-library/react';

import { useAutoRefresh } from '../src';

const request = jest.fn();

jest.useFakeTimers();

describe('useAutoRefresh', () => {
  it('should return the initial values for data, loading, error, stoped', async () => {
    const { result } = renderHook(() => useAutoRefresh(request));

    expect(result.current).toEqual({
      loading: false,
      stoped: false,
    });
  });

  it('should return the loading state when the request is pending', async () => {
    request.mockImplementation(() => new Promise(() => {}));

    const { result, rerender } = renderHook(() => useAutoRefresh(request));

    jest.advanceTimersByTime(5000);
    rerender();
    expect(result.current).toEqual({
      loading: true,
      stoped: false,
    });
  });

  it('should return the data after the request is resolved', async () => {
    request.mockResolvedValueOnce('data');

    const { result } = renderHook(() =>
      useAutoRefresh(request, { retryLimit: 1 }),
    );

    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
        stoped: false,
      });
    });
  });

  it('should return the stoped state after the retry limit is reached', async () => {
    request.mockResolvedValue('data');

    const { result } = renderHook(() =>
      useAutoRefresh(request, { retryLimit: 1 }),
    );

    jest.advanceTimersByTime(5000);
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

    jest.advanceTimersByTime(5000);
    await waitFor(() => {
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
        stoped: true,
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
});
