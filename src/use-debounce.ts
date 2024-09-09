import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

export const useDebounce = <T>(
  value: T,
  {
    wait = 1000,
    leading = false,
    maxWait,
    trailing = true,
  }: { wait?: number; leading?: boolean; maxWait?: number; trailing?: boolean },
): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const debounced = debounce(() => setDebouncedValue(value), wait, {
      leading,
      maxWait,
      trailing,
    });

    debounced();

    return () => {
      debounced.cancel();
    };
  }, [value]);

  return debouncedValue;
};
