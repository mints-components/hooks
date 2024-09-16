# useOutsideClick

> A hook that helps you bind click events outside of a specified element.

## Usage

```javascript
import { useRef } from 'react';
import { useOutsideClick } from '@mints/hooks';

const Example = () => {
  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref}>
      <span onClick={() => setOpen(true)}>Control</span>
      {open && <div>Show Something.</div>}
    </div>
  );
};
```

## API

```typescript
useOutsideClick = <T>(
  ref: MutableRefObject<HTMLDivElement | null>,
  cb: () => void,
)
```
