import { useMemo, useEffect, useState } from 'react';

export const useQueryParams = <T extends Record<string, string>>(): T => {
  const [search, setSearch] = useState(window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setSearch(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const queryObject = {} as T;
    params.forEach((value, key) => {
      queryObject[key as keyof T] = value as T[keyof T];
    });
    return queryObject;
  }, [search]);
};
