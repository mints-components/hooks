# useLocalStorage

> A Hook that store into localStorage..

## Usage

```javascript
import { useState } from 'react';
import { useLocalStorage } from '@mints/hooks';

const Example = () => {
  const [value, setValue] = useLocalStorage('key', 0);

  return (
    <div>
      <span>{value}</span>
      <span onClick={() => setValue(value + 1)}>Count</span>
      <span onClick={() => setValue(0)}>Clear</span>
    </div>
  );
};
```

## API

```typescript
useLocalStorage = <T>(key: string, initialValue: T): [string, (value: T): void]
```
