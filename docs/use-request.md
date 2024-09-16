# useRequest

> A hook for asynchronous requests.

## Usage

```javascript
import { useRequest } from '@mints/hooks';

const Example = () => {
  const { loading, data } = useRequest(async () => {
    const res = await fetch(url).json();
    return res;
  }, []);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return <div>{JSON.stringfiy(data)}</div>;
};
```

## API

```typescript
useRequest = <T>(
  request: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList = [],
): {
  loading: boolean;
  data?: T;
  error?: unknow;
}
```
