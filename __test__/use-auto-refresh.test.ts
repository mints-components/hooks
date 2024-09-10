import { renderHook, act } from '@testing-library/react';

import { useAutoRefresh } from '../src';

const request = jest.fn();

jest.useFakeTimers();

describe('useAutoRefresh', () => {
  it('should return the initial values for data, loading, error', async () => {
    const { result } = renderHook(() => useAutoRefresh(request));

    expect(result.current).toEqual({
      loading: false,
      stoped: false,
    });
  });

  it('should return the loading state when the request is pending', async () => {
    request.mockImplementation(() => new Promise(() => {}));

    const { result, rerender } = renderHook(() => useAutoRefresh(request));

    expect(result.current).toEqual({
      loading: false,
      stoped: false,
    });

    jest.advanceTimersByTime(5000);
    rerender();
    expect(result.current).toEqual({
      loading: true,
      stoped: false,
    });
  });

  it('should return the data after the request is resolved', async () => {
    request.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('data'), 1000)),
    );

    const { result, rerender } = renderHook(() =>
      useAutoRefresh(request, { retryLimit: 1 }),
    );

    expect(result.current).toEqual({
      loading: false,
      stoped: false,
    });

    jest.advanceTimersByTime(5000);
    rerender();
    expect(result.current).toEqual({
      loading: true,
      stoped: false,
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    rerender();
    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: false,
    });
  });

  it('should return the stoped state after the retry limit is reached', async () => {
    request.mockImplementation(
      () => new Promise((resovle) => setTimeout(() => resovle('data'), 1000)),
    );

    const { result, rerender } = renderHook(() =>
      useAutoRefresh(request, { retryLimit: 1 }),
    );

    expect(result.current).toEqual({
      loading: false,
      stoped: false,
    });

    jest.advanceTimersByTime(5000);
    rerender();
    expect(result.current).toEqual({
      loading: true,
      stoped: false,
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    rerender();
    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: false,
    });

    jest.advanceTimersByTime(5000);
    rerender();
    expect(result.current).toEqual({
      loading: true,
      data: 'data',
      stoped: false,
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    rerender();
    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: true,
    });
  });

  it('should return the stoped state after the stop function is called', async () => {
    request.mockImplementation(
      () => new Promise((resovle) => setTimeout(() => resovle('data'), 1000)),
    );

    const { result, rerender } = renderHook(() =>
      useAutoRefresh(request, { stop: (data) => data === 'data' }),
    );

    expect(result.current).toEqual({
      loading: false,
      stoped: false,
    });

    jest.advanceTimersByTime(5000);
    rerender();
    expect(result.current).toEqual({
      loading: true,
      stoped: false,
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    rerender();
    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: true,
    });

    jest.advanceTimersByTime(5000);
    rerender();
    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: true,
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    rerender();
    expect(result.current).toEqual({
      loading: false,
      data: 'data',
      stoped: true,
    });
  });
});
