# useUrlState

> A hook for reading and updating URL query parameters with type safety.

## Usage

### Read and update simple parameters

```js
import { useUrlState } from '@mints/hooks';

const [state, setState] = useUrlState({ page: 1, search: '' });

console.log(state.page); // 1 or the value in the URL
console.log(state.search); // '' or the value in the URL

setState({ page: 2 }); // Updates the URL to ?page=2&search=...
```

### Type-safe support for number, string, and boolean

```js
const [params, setParams] = useUrlState({ lat: 0, lng: 0, showMarker: false });

setParams({ lat: -36.85, lng: 174.76, showMarker: true });
// URL becomes ?lat=-36.85&lng=174.76&showMarker=true

console.log(params.lat); // -36.85 (number)
console.log(params.showMarker); // true (boolean)
```

### Remove a parameter by setting it to empty, null, or undefined

```js
setParams({ search: '' }); // Removes `search` from the URL
setParams({ page: undefined }); // Removes `page` from the URL
```

### Functional updates

```js
setParams((prev) => ({ ...prev, page: prev.page + 1 }));
```

## API

```js
useUrlState = <T extends Record<string, string | number | boolean | undefined | null>>(
  defaultState: T
): [
  state: T,
  setState: (
    update: Partial<T> | ((prev: T) => Partial<T>)
  ) => void
]
```

## Options

| Option         | Type                                      | Description                                         |
| -------------- | ----------------------------------------- | --------------------------------------------------- |
| `defaultState` | `Record<string, string\|number\|boolean>` | Default values and type definitions for each param. |

## Details

- **Type-safe**: Parses URL values to the correct types based on defaultState.
- **Automatic fallback**: If a param is missing in the URL, uses the value from defaultState.
- **Non-destructive**: Only updates or removes keys you specify; other query params remain unchanged.
- **Removes param**: Passing '', undefined, or null removes the key from the URL.
- **Sync with browser navigation**: Responds to browser back/forward (popstate).
