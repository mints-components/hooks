import { useMemo } from 'react';

import { useTimer, type UseTimerReturn } from './use-timer';

export type UseCountdownOptions = {
  seconds: number;
  autoStart?: boolean;
  intervalMs?: number;
  storageKey?: string;
  onEnd?: () => void;
  /** Enable cross-tab sync (default: true when storageKey is provided) */
  crossTab?: boolean;
};

export type UseCountdownReturn = {
  secondsLeft: number; // ceil for UX
  running: boolean;
  start: (overrideSeconds?: number) => void;
  pause: () => void;
  reset: (resetSeconds?: number) => void;
};

export function useCountdown(opts: UseCountdownOptions): UseCountdownReturn {
  const t: UseTimerReturn = useTimer({
    mode: 'countdown',
    durationMs: Math.max(0, Math.round(opts.seconds * 1000)),
    autoStart: opts.autoStart,
    intervalMs: opts.intervalMs ?? 1000,
    onEnd: opts.onEnd,
    persist: opts.storageKey
      ? { key: opts.storageKey, crossTab: opts.crossTab ?? true }
      : undefined,
  });

  const secondsLeft = useMemo(() => Math.ceil(t.valueMs / 1000), [t.valueMs]);

  return {
    secondsLeft,
    running: t.running,
    start: (overrideSeconds?: number) =>
      t.start({
        durationMs:
          typeof overrideSeconds === 'number'
            ? Math.max(0, Math.round(overrideSeconds * 1000))
            : undefined,
      }),
    pause: t.pause,
    reset: (resetSeconds?: number) =>
      t.reset({
        durationMs:
          typeof resetSeconds === 'number'
            ? Math.max(0, Math.round(resetSeconds * 1000))
            : undefined,
      }),
  };
}
