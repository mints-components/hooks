# useQueryParams

> A hook for retrieving query parameters from the URL.

## Usage

```javascript
import useQueryParams from "@mints/hooks";

const Example = () => {
  const params = useQueryParams<{ id: string; name: string }>();

  return (
    <div>
      <h1>Query Parameters</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </div>
  );
};
```

## API

```typescript
useQueryParams = <T extends Record<string, string>>(): T;
```

### Returns

- `T` - An object containing the parsed query parameters as key-value pairs.
