import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Count direction */
export type TimerMode = 'countdown' | 'countup';

/** Persistence adapter so we can swap storage (localStorage, memory, etc.) */
export interface PersistAdapter<T = unknown> {
  get: () => T | null;
  set: (value: T) => void;
  remove: () => void;
  /** Optional cross-tab sync. Return an unsubscribe function. */
  subscribe?: (cb: (value: T | null) => void) => () => void;
}

type PersistShape = {
  mode: TimerMode;
  endAt?: number; // absolute ms timestamp (for countdown)
  startAt?: number; // absolute ms timestamp (for countup)
  durationMs?: number;
};

export type UseTimerOptions = {
  /** Direction; default 'countdown' */
  mode?: TimerMode;
  /** Default duration for countdown; also used to compute `progress` */
  durationMs?: number;
  /** For countdown: start toward an absolute end (overrides duration on start) */
  endAtMs?: number;
  /** For countup: start from an absolute start time */
  startAtMs?: number;
  /** Start running on mount if no persisted state is restored */
  autoStart?: boolean;
  /** Tick resolution; default 1000ms */
  intervalMs?: number;
  /** When provided, the timer persists and restores itself */
  persist?: {
    key: string;
    adapter?: PersistAdapter<string>; // stores the JSON string
    crossTab?: boolean; // listen to storage events if supported
  };
  /** Called once when countdown reaches 0 */
  onEnd?: () => void;
  /** Called every tick with the current value in ms (remaining for countdown, elapsed for countup) */
  onTick?: (valueMs: number) => void;
  /** For countup: stop automatically when elapsed >= durationMs (if provided) */
  stopAtDuration?: boolean;
};

/** Return shape is intentionally unit-agnostic (ms). Higher-level wrappers can present seconds, mm:ss, etc. */
export type UseTimerReturn = {
  /** Remaining for countdown, elapsed for countup (>= 0) */
  valueMs: number;
  /** 0..1 if duration is known; otherwise undefined */
  progress?: number;
  /** Whether it’s currently ticking */
  running: boolean;
  /** True when countdown hit 0 or countup passed duration (with stopAtDuration) */
  ended: boolean;
  /** Start or restart the timer; you can override endAt/startAt/duration per run */
  start: (opts?: {
    durationMs?: number;
    endAtMs?: number;
    startAtMs?: number;
  }) => void;
  /** Pause (keep current value) */
  pause: () => void;
  /** Reset to initial value without running (countdown -> duration, countup -> 0) */
  reset: (opts?: { durationMs?: number }) => void;
};

const defaultNow = () => Date.now();

/** A handy localStorage adapter with optional cross-tab subscription */
export function createLocalStorageAdapter(key: string): PersistAdapter<string> {
  const safe = typeof window !== 'undefined' && !!window.localStorage;
  return {
    get: () => {
      if (!safe) return null;
      try {
        const v = window.localStorage.getItem(key);
        return v ?? null;
      } catch {
        return null;
      }
    },
    set: (value: string) => {
      if (!safe) return;
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* ignore */
      }
    },
    remove: () => {
      if (!safe) return;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
    subscribe: (cb: (value: string | null) => void) => {
      if (!safe) return () => {};
      const handler = (e: StorageEvent) => {
        if (e.storageArea === window.localStorage && e.key === key) {
          cb(e.newValue ?? null);
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    },
  };
}

export function useTimer({
  mode = 'countdown',
  durationMs,
  endAtMs,
  startAtMs,
  autoStart = false,
  intervalMs = 1000,
  persist,
  onEnd,
  onTick,
  stopAtDuration = false,
}: UseTimerOptions): UseTimerReturn {
  // Internal anchors
  const endAtRef = useRef<number | null>(endAtMs ?? null);
  const startAtRef = useRef<number | null>(startAtMs ?? null);
  const baseDurationRef = useRef<number | undefined>(durationMs);
  const endedRef = useRef(false);

  // State
  const [valueMs, setValueMs] = useState<number>(() => {
    if (mode === 'countdown') {
      if (endAtMs != null) return Math.max(0, endAtMs - defaultNow());
      return Math.max(0, durationMs ?? 0);
    } else {
      if (startAtMs != null) return Math.max(0, defaultNow() - startAtMs);
      return 0;
    }
  });
  const [running, setRunning] = useState<boolean>(false);

  // Derived progress
  const progress = useMemo(() => {
    const d = baseDurationRef.current;
    if (!d || d <= 0) return undefined;
    if (mode === 'countdown') return Math.min(1, Math.max(0, 1 - valueMs / d));
    // countup
    return Math.min(1, Math.max(0, valueMs / d));
  }, [mode, valueMs]);

  const ended = useMemo(() => {
    if (mode === 'countdown') return valueMs === 0;
    if (!stopAtDuration || !baseDurationRef.current) return false;
    return valueMs >= baseDurationRef.current;
  }, [mode, valueMs, stopAtDuration]);

  // Persistence helpers
  const persistAdapter: PersistAdapter<string> | null = useMemo(() => {
    if (!persist?.key) return null;
    return persist.adapter ?? createLocalStorageAdapter(persist.key);
  }, [persist?.adapter, persist?.key]);

  const writePersist = useCallback(() => {
    if (!persistAdapter) return;
    const payload: PersistShape = {
      mode,
      durationMs: baseDurationRef.current,
      endAt: endAtRef.current ?? undefined,
      startAt: startAtRef.current ?? undefined,
    };
    try {
      persistAdapter.set(JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [persistAdapter, mode]);

  const clearPersist = useCallback(() => {
    persistAdapter?.remove();
  }, [persistAdapter]);

  const restorePersist = useCallback(() => {
    if (!persistAdapter) return false;
    const raw = persistAdapter.get();
    if (!raw) return false;
    try {
      const data = JSON.parse(raw) as PersistShape;
      if (data.mode !== mode) return false;

      baseDurationRef.current = data.durationMs;
      endedRef.current = false;

      if (mode === 'countdown' && data.endAt && data.endAt > defaultNow()) {
        endAtRef.current = data.endAt;
        startAtRef.current = null;
        setRunning(true);
        setValueMs(Math.max(0, data.endAt - defaultNow()));
        return true;
      }
      if (mode === 'countup' && data.startAt && data.startAt <= defaultNow()) {
        startAtRef.current = data.startAt;
        endAtRef.current = null;
        setRunning(true);
        setValueMs(Math.max(0, defaultNow() - data.startAt));
        return true;
      }
    } catch {
      /* ignore */
    }
    // stale/invalid
    clearPersist();
    return false;
  }, [persistAdapter, mode, clearPersist]);

  // Tick
  const tick = useCallback(() => {
    if (mode === 'countdown') {
      const endAt = endAtRef.current;
      if (!endAt) return;
      const left = endAt - defaultNow();
      if (left <= 0) {
        setValueMs(0);
        setRunning(false);
        endAtRef.current = null;
        if (!endedRef.current) {
          endedRef.current = true;
          clearPersist();
          onEnd?.();
        }
        onTick?.(0);
      } else {
        setValueMs(left);
        onTick?.(left);
      }
      return;
    }

    // countup
    const startAt = startAtRef.current;
    if (!startAt) return;
    const elapsed = Math.max(0, defaultNow() - startAt);
    if (
      stopAtDuration &&
      baseDurationRef.current != null &&
      elapsed >= baseDurationRef.current
    ) {
      setValueMs(baseDurationRef.current);
      setRunning(false);
      if (!endedRef.current) {
        endedRef.current = true;
        clearPersist();
        onEnd?.();
      }
      onTick?.(baseDurationRef.current);
    } else {
      setValueMs(elapsed);
      onTick?.(elapsed);
    }
  }, [mode, onEnd, onTick, stopAtDuration, clearPersist]);

  // Interval driver
  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, intervalMs);
    tick(); // align immediately
    return () => clearInterval(id);
  }, [running, intervalMs, tick]);

  // Init: restore, then autoStart if nothing restored
  useEffect(() => {
    const restored = restorePersist();
    if (!restored && autoStart) {
      if (mode === 'countdown') {
        const dur = baseDurationRef.current ?? 0;
        const endAt = endAtRef.current ?? defaultNow() + dur;
        endAtRef.current = endAt;
        setRunning(true);
        setValueMs(Math.max(0, endAt - defaultNow()));
        writePersist();
      } else {
        const startAt = startAtRef.current ?? defaultNow();
        startAtRef.current = startAt;
        setRunning(true);
        setValueMs(Math.max(0, defaultNow() - startAt));
        writePersist();
      }
    }

    // cross-tab sync
    if (persistAdapter && persist?.crossTab && persistAdapter.subscribe) {
      const unsub = persistAdapter.subscribe((raw) => {
        if (!raw) {
          // someone cleared in another tab; stop here
          endAtRef.current = null;
          startAtRef.current = null;
          setRunning(false);
          setValueMs(
            mode === 'countdown'
              ? Math.max(0, baseDurationRef.current ?? 0)
              : 0,
          );
          return;
        }
        try {
          const data = JSON.parse(raw) as PersistShape;
          if (data.mode !== mode) return;
          baseDurationRef.current = data.durationMs;
          if (mode === 'countdown' && data.endAt) {
            endAtRef.current = data.endAt;
            setRunning(true);
            setValueMs(Math.max(0, data.endAt - defaultNow()));
          }
          if (mode === 'countup' && data.startAt) {
            startAtRef.current = data.startAt;
            setRunning(true);
            setValueMs(Math.max(0, defaultNow() - data.startAt));
          }
        } catch {
          /* ignore */
        }
      });
      return () => unsub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controls
  const start = useCallback(
    (opts?: { durationMs?: number; endAtMs?: number; startAtMs?: number }) => {
      endedRef.current = false;

      if (mode === 'countdown') {
        const dur = opts?.durationMs ?? baseDurationRef.current ?? 0;
        baseDurationRef.current = dur;
        const endAt = opts?.endAtMs ?? defaultNow() + Math.max(0, dur);
        endAtRef.current = endAt;
        startAtRef.current = null;
        setRunning(true);
        setValueMs(Math.max(0, endAt - defaultNow()));
      } else {
        // countup
        if (opts?.durationMs != null)
          baseDurationRef.current = Math.max(0, opts.durationMs);
        const startAt = opts?.startAtMs ?? defaultNow();
        startAtRef.current = startAt;
        endAtRef.current = null;
        setRunning(true);
        setValueMs(Math.max(0, defaultNow() - startAt));
      }
      writePersist();
    },
    [mode, writePersist],
  );

  const pause = useCallback(() => {
    setRunning(false);
    // keep anchors to allow resume
    writePersist();
  }, [writePersist]);

  const reset = useCallback(
    (opts?: { durationMs?: number }) => {
      setRunning(false);
      endedRef.current = false;
      if (opts?.durationMs != null)
        baseDurationRef.current = Math.max(0, opts.durationMs);
      if (mode === 'countdown') {
        endAtRef.current = null;
        startAtRef.current = null;
        setValueMs(Math.max(0, baseDurationRef.current ?? 0));
      } else {
        endAtRef.current = null;
        startAtRef.current = null;
        setValueMs(0);
      }
      clearPersist();
    },
    [mode, clearPersist],
  );

  return { valueMs, progress, running, ended, start, pause, reset };
}
