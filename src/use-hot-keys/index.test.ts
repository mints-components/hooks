import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useHotkeys } from '.';

describe('useHotkeys', () => {
  let calls: string[] = [];

  beforeEach(() => {
    calls = [];
  });

  const fireKeyDown = (key: string, options: Partial<KeyboardEvent> = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey: options.ctrlKey || false,
      shiftKey: options.shiftKey || false,
      altKey: options.altKey || false,
      metaKey: options.metaKey || false,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  it('should trigger callback for single key string', () => {
    renderHook(() =>
      useHotkeys('k', () => {
        calls.push('k');
      }),
    );
    fireKeyDown('k');
    expect(calls).toEqual(['k']);
  });

  it('should trigger callback for multiple keys with shared handler', () => {
    renderHook(() =>
      useHotkeys(['enter', 'k'], (_, key) => {
        calls.push(`shared:${key}`);
      }),
    );
    fireKeyDown('k');
    fireKeyDown('Enter');
    expect(calls).toEqual(['shared:k', 'shared:enter']);
  });

  it('should trigger correct handler for object map', () => {
    renderHook(() =>
      useHotkeys({
        k: () => calls.push('k handler'),
        enter: () => calls.push('enter handler'),
      }),
    );
    fireKeyDown('k');
    fireKeyDown('Enter');
    expect(calls).toEqual(['k handler', 'enter handler']);
  });

  it('should ignore keydown inside input when ignoreInput is true', () => {
    renderHook(() =>
      useHotkeys(
        {
          enter: () => calls.push('enter'),
        },
        { ignoreInput: true },
      ),
    );

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    input.dispatchEvent(event);

    expect(calls).toEqual([]);
    input.remove();
  });

  it('should allow input keydown when ignoreInput is false', () => {
    renderHook(() =>
      useHotkeys(
        {
          enter: () => calls.push('enter'),
        },
        { ignoreInput: false },
      ),
    );

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    input.dispatchEvent(event);

    expect(calls).toEqual(['enter']);
    input.remove();
  });

  it('should not trigger if enabled is false', () => {
    renderHook(() =>
      useHotkeys(
        {
          k: () => calls.push('k'),
        },
        { enabled: false },
      ),
    );
    fireKeyDown('k');
    expect(calls).toEqual([]);
  });

  it('should support modifier keys like ctrl+1', () => {
    renderHook(() =>
      useHotkeys({
        'ctrl+1': () => calls.push('ctrl+1'),
      }),
    );
    fireKeyDown('1', { ctrlKey: true });
    fireKeyDown('1'); // shouldn't match
    expect(calls).toEqual(['ctrl+1']);
  });
});
