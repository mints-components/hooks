import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Strategy = 'local' | 'session' | 'memory';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

export interface UseStorageOptions<T> {
  /**
   * Choose storage backend. Defaults to 'local'.
   * You can also pass a custom StorageLike implementation.
   */
  storage?: Strategy | StorageLike;
  /**
   * Custom serializer. Defaults to JSON.stringify.
   */
  serialize?: (value: T) => string;
  /**
   * Custom deserializer. Defaults to JSON.parse.
   */
  deserialize?: (raw: string) => T;
  /**
   * Sync value across tabs via 'storage' event. Defaults to true
   * for local/session strategies, false for memory/custom.
   */
  syncAcrossTabs?: boolean;
}

/** Safely access window.*Storage; return undefined if not available or throws. */
function safeGetBrowserStorage(
  kind: 'localStorage' | 'sessionStorage',
): StorageLike | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    const s = (window as any)[kind] as Storage | undefined;
    if (!s) return undefined;
    // Some browsers throw on access when in private mode; test roundtrip.
    const testKey = '__useStorage_probe__';
    s.setItem(testKey, '1');
    s.removeItem(testKey);
    return s;
  } catch {
    return undefined;
  }
}

function resolveStorage(option?: Strategy | StorageLike): StorageLike {
  if (option && typeof option === 'object') return option;
  const memory = new MemoryStorage();
  const kind = option ?? 'local';
  if (kind === 'local') return safeGetBrowserStorage('localStorage') ?? memory;
  if (kind === 'session')
    return safeGetBrowserStorage('sessionStorage') ?? memory;
  return memory;
}

function defaultSerialize<T>(v: T) {
  return JSON.stringify(v);
}
function defaultDeserialize<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

/**
 * Generic storage hook with pluggable backend (local/session/memory/custom).
 */
export function useStorage<T>(
  key: string,
  initialValue: T,
  options?: UseStorageOptions<T>,
): [T, (v: T | ((prev: T) => T)) => void, () => void] {
  const storage = useMemo(
    () => resolveStorage(options?.storage),
    [options?.storage],
  );
  const serialize = options?.serialize ?? defaultSerialize<T>;
  const deserialize = options?.deserialize ?? defaultDeserialize<T>;
  const syncAcrossTabs =
    typeof options?.syncAcrossTabs === 'boolean'
      ? options!.syncAcrossTabs
      : ((): boolean => {
          if (
            !options?.storage ||
            options.storage === 'local' ||
            options.storage === 'session'
          ) {
            return true;
          }
          return false;
        })();

  // Keep a ref to the current key for event handlers.
  const keyRef = useRef(key);
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  // Lazy initializer reads from storage once.
  const [value, setValueState] = useState<T>(() => {
    try {
      const raw = storage.getItem(key);
      return raw != null ? (deserialize(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist when value changes.
  const persist = useCallback(
    (next: T) => {
      try {
        const raw = serialize(next);
        storage.setItem(key, raw);
      } catch {
        // Silently ignore serialization/storage failures.
      }
    },
    [key, serialize, storage],
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        persist(resolved);
        return resolved;
      });
    },
    [persist],
  );

  const remove = useCallback(() => {
    try {
      storage.removeItem(key);
    } catch {
      // ignore
    }
    setValueState(initialValue);
  }, [initialValue, key, storage]);

  // Sync across tabs (only meaningful for native storages).
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') return;
    const handler = (e: StorageEvent) => {
      if (!e.key || e.key !== keyRef.current) return;
      if (e.newValue == null) {
        setValueState(initialValue);
        return;
      }
      try {
        setValueState(deserialize(e.newValue));
      } catch {
        // ignore parse error
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [deserialize, initialValue, syncAcrossTabs]);

  // If key changes, reload from storage for the new key.
  useEffect(() => {
    try {
      const raw = storage.getItem(key);
      setValueState(raw != null ? deserialize(raw) : initialValue);
    } catch {
      setValueState(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, storage]);

  return [value, setValue, remove];
}

/** Convenience: localStorage-backed state. */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: Omit<UseStorageOptions<T>, 'storage'>,
) {
  return useStorage<T>(key, initialValue, { ...options, storage: 'local' });
}

/** Convenience: sessionStorage-backed state. */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options?: Omit<UseStorageOptions<T>, 'storage'>,
) {
  return useStorage<T>(key, initialValue, { ...options, storage: 'session' });
}
