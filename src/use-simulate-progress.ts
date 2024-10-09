import { useState, useEffect, useRef } from 'react';

type func = (...args: any[]) => void;

export const useSimulateProgress = (
  duration: number,
  onComplete: func,
): [number, func, func] => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<any>(null);

  const startProgress: func = (...args) => {
    if (intervalRef.current) return;

    let progressValue = 0;
    intervalRef.current = setInterval(() => {
      progressValue += 5;
      setProgress(progressValue);

      if (progressValue >= 100) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        onComplete(...args);
      }
    }, duration / 20);
  };

  const resetProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return [progress, startProgress, resetProgress];
};

export default useSimulateProgress;
