# useHotkeys

> A hook for binding keyboard shortcuts to handlers.

## Usage

### Bind single key:

```js
import { useHotkeys } from '@mints/hooks';

useHotkeys('k', () => {
  console.log('Pressed k');
});
```

### Bind multiple keys to the same handler:

```js
useHotkeys(['enter', 'k'], (e, key) => {
  console.log(`Pressed ${key}`);
});
```

### Bind multiple keys with different handlers:

```js
useHotkeys({
  k: () => console.log('Pressed k'),
  enter: () => console.log('Pressed enter'),
});
```

## API

```js
useHotkeys = (
  combo: string | string[] | Record<string, (e: KeyboardEvent) => void>,
  callbackOrOptions?: ((e: KeyboardEvent, combo?: string) => void) | {
    preventDefault?: boolean;
    enabled?: boolean;
    target?: HTMLElement | Window | Document;
    ignoreInput?: boolean;
  },
  maybeOptions?: {
    preventDefault?: boolean;
    enabled?: boolean;
    target?: HTMLElement | Window | Document;
    ignoreInput?: boolean;
  },
): void;

```

## Options

| Option           | Type                                | Default  | Description                                                               |
| ---------------- | ----------------------------------- | -------- | ------------------------------------------------------------------------- |
| `preventDefault` | `boolean`                           | `true`   | Prevent default browser behavior for matched key                          |
| `enabled`        | `boolean`                           | `true`   | Whether the hotkey is active                                              |
| `target`         | `HTMLElement \| Window \| Document` | `window` | The DOM target to bind key events to                                      |
| `ignoreInput`    | `boolean`                           | `false`  | Ignore key events when focused on input/textarea/contenteditable elements |
