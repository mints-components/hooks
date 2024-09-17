# useToggle

> A hook that toggle states.

## Usage

```javascript
import { useToggle } from '@mints/hooks';

const Example = () => {
  const [state, toggle] = useToggle('Hello', 'World');

  return (
    <div>
      <span>{state}</span>
      <span onClick={toggle}>Toggle</span>
    </div>
  );
};
```

## API

```typescript
useToggle = <T, U>(
  defaultState: T = false as T,
  reverseState?: U,
): [T | U, () => void]
```
