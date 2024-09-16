# useDebounce

> A hook that deal with the debounced value.

## Usage

```javascript
import { useState } from 'react';
import { useDebounce } from '@mints/hooks';

const Example = () => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, { wait: 500 });

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <span>DebouncedValue: {debouncedValue}</span>
    </div>
  );
};
```

## API

```typescript
useDebounce = <T>(
  value: T,
  options?: {
    wait?: number;
    leading?: boolean;
    maxWait?: number;
    trailing?: boolean;
  },
): T
```
