import { renderHook, act, waitFor } from '@testing-library/react';

import { useRequest } from '../src';

const request = jest.fn();

jest.useFakeTimers();

describe('useRequest', () => {
  it('should return the initial values for data, loading, error', async () => {
    request.mockResolvedValueOnce('data');

    const { result } = renderHook(() => useRequest(request));

    await act(() => {
      expect(result.current).toEqual({
        loading: true,
      });
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
    request.mockResolvedValueOnce('data');
    const mockAbort = jest.spyOn(AbortController.prototype, 'abort');

    const { unmount } = renderHook(() => useRequest(request));
    unmount();

    expect(mockAbort).toHaveBeenCalled();
  });
});
