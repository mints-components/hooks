import { useCallback, useMemo, useEffect, useState } from 'react';

type ParamType = string | number | boolean | undefined | null;
type UrlState<T extends Record<string, ParamType>> = [
  T,
  (update: Partial<T> | ((prev: T) => Partial<T>)) => void,
];

function parseValue(value: string | null, defaultValue: ParamType): ParamType {
  if (value == null) return defaultValue;
  if (typeof defaultValue === 'number') {
    const n = Number(value);
    return isNaN(n) ? defaultValue : n;
  }
  if (typeof defaultValue === 'boolean') {
    return value === 'true';
  }
  return value;
}

export function useUrlState<T extends Record<string, ParamType>>(
  defaultState: T,
): UrlState<T> {
  const [search, setSearch] = useState(window.location.search);

  useEffect(() => {
    const handlePopState = () => setSearch(window.location.search);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const state = useMemo(() => {
    const params = new URLSearchParams(search);
    const result = {} as T;
    for (const key in defaultState) {
      const val = params.get(key);
      result[key] = parseValue(val, defaultState[key]) as T[typeof key];
    }
    return result;
  }, [search, defaultState]);

  const setState = useCallback(
    (update: Partial<T> | ((prev: T) => Partial<T>)) => {
      const params = new URLSearchParams(window.location.search);
      const prev = {} as T;
      for (const key in defaultState) {
        prev[key] = parseValue(
          params.get(key),
          defaultState[key],
        ) as T[typeof key];
      }
      const nextUpdate = typeof update === 'function' ? update(prev) : update;
      Object.entries(nextUpdate).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const newSearch = params.toString() ? `?${params}` : '';
      window.history.pushState(
        {},
        '',
        `${window.location.pathname}${newSearch}`,
      );
      setSearch(newSearch);
    },
    [defaultState],
  );

  return [state, setState];
}
