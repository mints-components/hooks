# useStorage

> A generic storage hook with a pluggable backend. Supports `localStorage`, `sessionStorage`, and in-memory storage. Also ships with two convenience hooks: `useLocalStorage` and `useSessionStorage`.

## Usage

```tsx
import { useLocalStorage, useSessionStorage, useStorage } from '@mints/hooks';

function Example() {
  const [theme, setTheme, resetTheme] = useLocalStorage<'light' | 'dark'>(
    'theme',
    'light',
  );
  const [tab, setTab] = useSessionStorage('active_tab', 'home');
  const [draft, setDraft] = useStorage(
    'draft',
    { title: '', body: '' },
    { storage: 'memory' },
  );

  return (
    <div>
      <div>
        <strong>Theme:</strong> {theme}
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Toggle
        </button>
        <button onClick={resetTheme}>Reset</button>
      </div>

      <div>
        <strong>Tab:</strong> {tab}
        <button onClick={() => setTab('settings')}>Go Settings</button>
      </div>

      <div>
        <strong>Draft Title:</strong> {draft.title}
        <button onClick={() => setDraft({ ...draft, title: 'Hello' })}>
          Set Title
        </button>
      </div>
    </div>
  );
}
```

## API

```ts
useStorage = <T>(
  key: string,
  initialValue: T,
  options?: {
    /** Storage backend: 'local' | 'session' | 'memory' | custom StorageLike */
    storage?: 'local' | 'session' | 'memory' | StorageLike;

    /** Custom serializer (default: JSON.stringify) */
    serialize?: (value: T) => string;

    /** Custom deserializer (default: JSON.parse) */
    deserialize?: (raw: string) => T;

    /**
     * Sync value across tabs via the `storage` event.
     * Default: true for 'local'/'session', false for 'memory' or custom storage.
     */
    syncAcrossTabs?: boolean;
  },
): [T, (next: T | ((prev: T) => T)) => void, () => void]; // [value, setValue, remove]
```

### Convenience Hooks

```ts
useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: Omit<UseStorageOptions<T>, 'storage'>,
): [T, (next: T | ((prev: T) => T)) => void, () => void];

useSessionStorage<T>(
  key: string,
  initialValue: T,
  options?: Omit<UseStorageOptions<T>, 'storage'>,
): [T, (next: T | ((prev: T) => T)) => void, () => void];
```

## Design Notes

- **SSR / Private mode safe**: If `window.localStorage/sessionStorage` is unavailable or throws, the hook falls back to an in-memory implementation.
- **Cross-tab sync**: For `localStorage/sessionStorage`, values are synchronized across tabs via the native `storage` event (configurable via `syncAcrossTabs`).
- **Custom (de)serialization**: Use `serialize/deserialize` for non-JSON types (e.g., `Date`, `Map`).
- **Reset support**: The third returned value `remove()` clears the key and restores the initial value.
