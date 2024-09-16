# useAutoRefresh

> A hook for automatic refresh.

## Usage

```javascript
import { useAutoRefresh } from '@mints/hooks';

const Example = () => {
  const { loading, data } = useAutoRefresh(
    async () => {
      const res = await fetch(url).json();
      return res;
    },
    {
      retryLimit: 5,
    },
  );

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  if (stoped) {
    return <div>Automatic Stoped...</div>;
  }

  return <div>{JSON.stringfiy(data)}</div>;
};
```

## API

```typescript
useAutoRefresh = <T>(
  request: (signal: AbortSignal) => Promise<T>,
  option?: {
    stop?: (data?: T) => boolean;
    interval?: number;
    retryLimit?: number;
  },
): {
  loading: boolean;
  data?: T;
  error?: unknow;
  stoped: boolean;
}
```
