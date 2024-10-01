# useSimulateProgress

> A hook for simulate progress.

## Usage

```javascript
import { useSimulateProgress } from '@mints/hooks';

const Example = () => {
  const progress = useSimulateProgress(duration, () => {
    console.log('Progress complete!');
  });

  return (
    <div
      className="progress-bar"
      style={{ width: '100%', background: '#e0e0e0', height: '30px' }}
    >
      <div
        style={{
          width: `${progress}%`,
          background: 'green',
          color: '#fff',
          textAlign: 'center',
          height: '100%',
        }}
      >
        {progress}%
      </div>
    </div>
  );
};
```

## API

```typescript
useSimulateProgress = (
  duration: number,
  onComplete: () => void,
): number
```
