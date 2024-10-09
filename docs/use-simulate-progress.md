# useSimulateProgress

> A hook for simulate progress.

## Usage

```javascript
import { useSimulateProgress } from '@mints/hooks';

const Example = () => {
  const [progress, startProgress, resetProgress] = useSimulateProgress(
    duration,
    () => {
      console.log('Progress complete!');
    },
  );

  return (
    <div
      className="progress-bar"
      style={{ width: '100%', background: '#e0e0e0', height: '30px' }}
    >
      <div onClick={startProgress}>Start Progress</div>
      <div onClick={resetProgress}>Reset Progress</div>
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
type func = (...args: any[]) => void;

useSimulateProgress = (
  duration: number,
  onComplete: func,
): [number, func, func]
```
