import { useState, useRef, useEffect } from 'react';
import { isEqualWith } from 'lodash';

export const useRequest = <T>(
  request: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = [],
) => {
  const [, setVersion] = useState(0);
  const ref = useRef<{
    state: 'idle' | 'loading' | 'done' | 'error';
    deps?: React.DependencyList;
    data?: T;
    error?: unknown;
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

  // When the last state transition has not waited until the new request is completed
  // Reset status to pending
  ref.current.state = 'loading';
  ref.current.deps = deps;
  ref.current.data = undefined;

  clearTimeout(ref.current.timer);

  ref.current.abortController?.abort();
  ref.current.timer = window.setTimeout(() => {
    ref.current.abortController = new AbortController();
    request(ref.current.abortController.signal)
      .then((data: T) => {
        ref.current.data = data;
        ref.current.state = 'done';
        setVersion((v) => v + 1);
      })
      .catch((err: unknown) => {
        ref.current.error = err;
        setVersion((v) => v + 1);
      });
  }, 10);

  return {
    loading: true,
  };
};
