import type { MutableRefObject } from 'react';
import { useEffect } from 'react';

export const useOutsideClick = (
  ref: MutableRefObject<HTMLDivElement | null>,
  cb: () => void,
) => {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        cb();
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [ref, cb]);
};
