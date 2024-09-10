import { useState, useRef, useEffect } from 'react';
import { isEqualWith } from 'lodash';

export const useRequest = <T>(
  request: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = [],
) => {
  const [, setVersion] = useState(0);
  const ref = useRef<{
    state: 'idle' | 'loading' | 'done' | 'error';
    data?: T;
    error?: unknown;
    deps?: React.DependencyList;
    abortController?: AbortController;
    timer?: number;
  }>({
    state: 'idle',
  });

  useEffect(() => {
    return () => {
      clearTimeout(ref.current.timer);
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

  clearTimeout(ref.current.timer);
  ref.current.deps = deps;
  ref.current.abortController?.abort();

  ref.current.timer = window.setTimeout(() => {
    ref.current.state = 'loading';
    ref.current.abortController = new AbortController();
    request(ref.current.abortController.signal)
      .then((data: T) => {
        ref.current.data = data;
        ref.current.state = 'done';
      })
      .catch((err: unknown) => {
        ref.current.error = err;
        ref.current.state = 'error';
      })
      .finally(() => {
        setVersion((v) => v + 1);
      });
  }, 10);

  return {
    loading: ref.current.state === 'loading',
    data: ref.current.data,
    error: ref.current.error,
  };
};
