import { useState } from 'react';

export const useToggle = <T, U>(
  defaultState: T = false as T,
  reverseState?: U,
): [T | U, () => void] => {
  const [state, setState] = useState<T | U>(defaultState);

  const toggle = () => {
    setState((prev) =>
      prev === defaultState
        ? (reverseState ?? (!defaultState as U))
        : defaultState,
    );
  };

  return [state, toggle];
};
