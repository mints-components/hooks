import { renderHook, waitFor } from '@testing-library/react';

import { useRequest } from '../src';

const request = jest.fn().mockResolvedValue('data');

describe('useRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the data after the request resolves', async () => {
    const { result } = renderHook(() => useRequest(request));

    expect(result.current.loading).toEqual(true);

    await waitFor(() =>
      expect(result.current).toEqual({
        loading: false,
        data: 'data',
        error: undefined,
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
        data: undefined,
        error,
      }),
    );
  });

  it('should abort the fetch request on unmount', () => {
    const mockAbort = jest.spyOn(AbortController.prototype, 'abort');

    const { unmount } = renderHook(() => useRequest(request));
    unmount();

    expect(mockAbort).toHaveBeenCalled();
  });

  it('should cancel the previous request when dependencies change', async () => {
    const mockAbort = jest.spyOn(AbortController.prototype, 'abort');

    const { rerender } = renderHook(
      ({ dep }) => useRequest(() => request(), [dep]),
      { initialProps: { dep: 1 } },
    );

    rerender({ dep: 2 });

    expect(mockAbort).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it('should handle multiple requests sequentially without interference', async () => {
    const mockAbort = jest.spyOn(AbortController.prototype, 'abort');
    request.mockResolvedValueOnce('data 1').mockResolvedValueOnce('data 2');

    const { result, rerender } = renderHook(
      ({ dep }) => useRequest(() => request(), [dep]),
      { initialProps: { dep: 1 } },
    );

    await waitFor(() =>
      expect(result.current).toEqual({
        loading: false,
        data: 'data 1',
        error: undefined,
      }),
    );

    rerender({ dep: 2 });

    expect(mockAbort).toHaveBeenCalledTimes(3);
    await waitFor(() =>
      expect(result.current).toEqual({
        loading: false,
        data: 'data 2',
        error: undefined,
      }),
    );
  });
});
