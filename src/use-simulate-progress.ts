import { useState, useEffect } from 'react';

export const useSimulateProgress = (
  duration: number,
  onComplete: () => void,
) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 5;
      setProgress(progressValue);

      if (progressValue >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, duration / 20);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return progress;
};
