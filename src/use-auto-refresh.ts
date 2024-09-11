import { useState, useRef, useEffect, useCallback } from 'react';

export const useAutoRefresh = <T>(
  request: (signal: AbortSignal) => Promise<T>,
  option?: {
    stop?: (data?: T) => boolean;
    interval?: number;
    retryLimit?: number;
  },
) => {
  const [, setVersion] = useState(0);

  const { stop, interval = 5000, retryLimit } = option ?? {};
  const ref = useRef<{
    state: 'idle' | 'loading' | 'polling' | 'done' | 'error';
    data?: T;
    error?: unknown;
    retryCount: number;
    abortController?: AbortController;
    timer?: any;
  }>({
    state: 'idle',
    retryCount: -1,
  });

  const _request = useCallback(() => {
    ref.current.state = 'loading';
    ref.current.abortController = new AbortController();
    request(ref.current.abortController.signal)
      .then((data: T) => {
        ref.current.data = data;
        ref.current.state = 'polling';
      })
      .catch((err: unknown) => {
        ref.current.error = err;
        ref.current.state = 'error';
      })
      .finally(() => {
        ref.current.retryCount += 1;
        setVersion((v) => v + 1);
      });
  }, [request]);

  useEffect(() => {
    _request();
    return () => {
      clearTimeout(ref.current.timer);
      ref.current.abortController?.abort();
    };
  }, []);

  if (
    stop?.(ref.current.data) ||
    (retryLimit && retryLimit <= ref.current.retryCount)
  ) {
    clearTimeout(ref.current.timer);
    ref.current.abortController?.abort();
    return {
      loading: false,
      data: ref.current.data,
      error: ref.current.error,
      stoped: true,
    };
  }

  clearTimeout(ref.current.timer);
  ref.current.abortController?.abort();

  ref.current.timer = setTimeout(() => _request(), interval);

  return {
    loading: ref.current.state === 'loading',
    data: ref.current.data,
    error: ref.current.error,
    stoped: false,
  };
};
