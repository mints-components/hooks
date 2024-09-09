import { renderHook, waitFor } from '@testing-library/react';

import { useRequest } from '../src';

const request = jest.fn();

describe('useRequest', () => {
  it('should return the initial values for data, loading, error', async () => {
    const { result } = renderHook(() => useRequest(request));

    const { loading, data, error } = result.current;

    expect(loading).toBe(true);
    expect(data).toBe(undefined);
    expect(error).toBe(undefined);
  });
});

describe('when data is fetched successfully', () => {
  let mockedData;

  beforeEach(() => {
    mockedData = [
      {
        id: 1,
        title: 'mock title',
      },
    ];

    request.mockResolvedValue(mockedData);
  });

  it('should return data', async () => {
    const { result } = renderHook(() => useRequest(request));

    await waitFor(() =>
      expect(result.current).toEqual({
        loading: false,
        data: mockedData,
      }),
    );
  });
});

describe('the loading property', () => {
  it('should initially return true and then false', async () => {
    const { result } = renderHook(() => useRequest(request));
    const { loading } = result.current;

    // asserting that the initial value of loading is true
    // before the re-render
    expect(loading).toBe(true);

    await waitFor(() => {
      const { loading } = result.current;
      expect(loading).toBe(false);
    });
  });
});

describe('when data is not fetched successfully', () => {
  const mockedError = new Error('mocked error');

  beforeEach(() => {
    // we mock fetch to return a rejected value so that
    // we add some coverage in the catch block in our code
    request.mockRejectedValue(mockedError);
  });

  it('should return the Error', async () => {
    const { result } = renderHook(() => useRequest(request));

    await waitFor(() => {
      const { error } = result.current;
      expect(error).toBe(mockedError);
    });
  });
});

describe('should abort the fetch request on unmount', () => {
  const mockAbort = jest.spyOn(AbortController.prototype, 'abort');

  it('should abort the fetch request', async () => {
    const { unmount } = renderHook(() => useRequest(request));
    unmount();

    expect(mockAbort).toHaveBeenCalled();
  });
});
