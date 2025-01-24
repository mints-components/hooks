import { useState, useRef, useEffect, useCallback } from 'react';

export const useRequest = <T>(
  request: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = [],
) => {
  const [state, setState] = useState<{
    loading: boolean;
    data?: T;
    error?: unknown;
  }>({
    loading: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(() => {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState({ loading: true });

    request(abortController.signal)
      .then((data) => {
        if (!abortController.signal.aborted) {
          setState({ loading: false, data });
        }
      })
      .catch((err) => {
        if (!abortController.signal.aborted) {
          setState({ loading: false, error: err });
        }
      });

    return () => {
      abortController.abort();
    };
  }, deps);

  useEffect(() => {
    const cleanup = fetchData();

    return () => {
      cleanup();
    };
  }, [fetchData]);

  return state;
};
