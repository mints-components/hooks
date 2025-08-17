# useTimer

A generic, persistence-friendly timer hook that can **count down** (remaining time) or **count up** (elapsed time), survive refresh, and sync across tabs. It’s the engine behind `useCountdown`.

## Quick examples

### 1) Resend e-mail (countdown)

```tsx
import { useTimer } from '@mints/hooks';

function ResendButton() {
  const t = useTimer({
    mode: 'countdown',
    durationMs: 60_000,
    persist: { key: 'resend_email_cooldown' }, // survives refresh & syncs across tabs
    onEnd: () => {
      /* re-enable UI */
    },
  });

  const seconds = Math.ceil(t.valueMs / 1000);

  return (
    <button onClick={() => t.start()} disabled={t.running}>
      {t.running ? `Resend in ${seconds}s` : 'Resend e-mail'}
    </button>
  );
}
```

### 2) Stopwatch (count up)

```tsx
const sw = useTimer({ mode: 'countup', intervalMs: 200 });

useEffect(() => {
  sw.start();
}, []); // start immediately

return (
  <div>
    Elapsed: {(sw.valueMs / 1000).toFixed(1)}s
    <button onClick={sw.pause}>Pause</button>
    <button onClick={() => sw.reset()}>Reset</button>
  </div>
);
```

### 3) Deadline / absolute end time

```tsx
const deadline = Date.parse('2025-12-31T23:59:59Z');
const t = useTimer({ mode: 'countdown', endAtMs: deadline, autoStart: true });
```

## API

```tsx
useTimer(options?: {
  mode?: 'countdown' | 'countup';
  durationMs?: number;     // default duration (for progress and countdown)
  endAtMs?: number;        // countdown toward an absolute timestamp
  startAtMs?: number;      // count up from an absolute timestamp
  autoStart?: boolean;     // start on mount if nothing restored
  intervalMs?: number;     // tick, default 1000
  persist?: { key: string; adapter?: PersistAdapter<string>; crossTab?: boolean };
  onEnd?: () => void;      // fired once on completion
  onTick?: (valueMs: number) => void;
  stopAtDuration?: boolean;// for countup: stop when elapsed >= durationMs
}): {
  valueMs: number;         // remaining (countdown) or elapsed (countup)
  progress?: number;       // 0..1 if durationMs is known
  running: boolean;
  ended: boolean;
  start(opts?: { durationMs?: number; endAtMs?: number; startAtMs?: number }): void;
  pause(): void;
  reset(opts?: { durationMs?: number }): void;
}
```

## Persistence

`persist.key` enables restore across refresh and (optionally) cross-tab sync. By default it uses `localStorage`. You can bring your own storage by supplying an `adapter`:

```ts
const memoryAdapter: PersistAdapter<string> = {
  get: () => mem,
  set: (v) => {
    mem = v;
  },
  remove: () => {
    mem = null;
  },
};
useTimer({
  mode: 'countdown',
  durationMs: 10_000,
  persist: { key: 'foo', adapter: memoryAdapter },
});
```

## `useCountdown`

For convenience,`useCountdown` wraps `useTimer` with a seconds-based API:

```ts
const { secondsLeft, running, start, pause, reset } = useCountdown({
  seconds: 60,
  storageKey: 'resend_email_cooldown',
});
```

It uses **ceil rounding** for display (1.2s → `2s`), which matches typical UX for resend/OTP buttons.

---

## Why this is more general

- **Modes:** countdown (remaining) and countup (elapsed) in one API.
- **Absolute or relative:** start from `durationMs`, `endAtMs`, or `startAtMs`.
- **Persistence & cross-tab:** pluggable adapter; localStorage by default; storage events keep tabs in sync.
- **Progress:** normalized 0–1 for free when `durationMs` is known.
- **Extensible:** `onTick`, `onEnd`, and `stopAtDuration` cover stopwatches, progress bars, uploads, etc.
