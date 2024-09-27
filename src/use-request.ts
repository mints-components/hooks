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
    return () => {
      ref.current.abortController?.abort();
    };
  }, []);

  if (isEqualWith(ref.current.deps, deps)) {
    return {
      data: ref.current.data,
      loading: ref.current.state === 'loading',
      error: ref.current.error,
    };
  }

  ref.current.abortController?.abort();

  ref.current.deps = deps;
  ref.current.state = 'loading';
  const abortController = new AbortController();
  ref.current.abortController = abortController;

  request(abortController.signal)
    .then((data: T) => {
      if (abortController.signal.aborted) return;
      ref.current.data = data;
      ref.current.state = 'done';
    })
    .catch((err: unknown) => {
      if (abortController.signal.aborted) return;
      ref.current.error = err;
      ref.current.state = 'error';
    })
    .finally(() => {
      setVersion((v) => v + 1);
    });

  return {
    loading: ref.current.state === 'loading',
    data: ref.current.data,
    error: ref.current.error,
  };
};
