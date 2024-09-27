import { useState, useRef, useEffect } from 'react';
import { isEqualWith } from 'lodash';

export const useRequest = <T>(
  request: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = [],
) => {
  const [, setVersion] = useState(0);
  const ref = useRef<{
    state: 'loading' | 'done' | 'error';
    data?: T;
    error?: unknown;
    deps?: React.DependencyList;
    abortController?: AbortController;
  }>({
    state: 'loading',
  });

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      ref.current.abortController?.abort();
    };
  }, []);

  if (isEqualWith(ref.current.deps, deps)) {
    // If dependencies haven't changed, return cached state
    return {
      data: ref.current.data,
      loading: ref.current.state === 'loading',
      error: ref.current.error,
    };
  }

  // Cancel previous request
  ref.current.abortController?.abort();

  // Update the dependencies and state
  ref.current.deps = deps;
  ref.current.state = 'loading';
  const abortController = new AbortController();
  ref.current.abortController = abortController;

  // Make the request
  request(abortController.signal)
    .then((data: T) => {
      // Only update if the request hasn't been aborted
      if (abortController.signal.aborted) return;
      ref.current.data = data;
      ref.current.state = 'done';
    })
    .catch((err: unknown) => {
      // Only update if the request hasn't been aborted
      if (abortController.signal.aborted) return;
      ref.current.error = err;
      ref.current.state = 'error';
    })
    .finally(() => {
      // Trigger a re-render to reflect the state changes
      setVersion((v) => v + 1);
    });

  return {
    loading: ref.current.state === 'loading',
    data: ref.current.data,
    error: ref.current.error,
  };
};
