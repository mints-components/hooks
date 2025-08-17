import { useEffect } from 'react';

type SingleKey = string;
type MultipleKeys = string[];
type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

interface HotkeyOptions {
  preventDefault?: boolean;
  enabled?: boolean;
  target?: HTMLElement | Window | Document;
  ignoreInput?: boolean;
}

export function useHotkeys(
  combo: SingleKey | MultipleKeys | HotkeyMap,
  callbackOrOptions?:
    | ((e: KeyboardEvent, combo?: string) => void)
    | HotkeyOptions,
  maybeOptions?: HotkeyOptions,
) {
  const isMap = typeof combo === 'object' && !Array.isArray(combo);
  const options = isMap ? callbackOrOptions : maybeOptions;

  // safely extract options
  let preventDefault = true;
  let enabled = true;
  let target: HTMLElement | Window | Document = window;
  let ignoreInput = false;

  if (typeof options === 'object' && options !== null) {
    preventDefault = options.preventDefault ?? true;
    enabled = options.enabled ?? true;
    target = options.target ?? window;
    ignoreInput = options.ignoreInput ?? false;
  }

  useEffect(() => {
    if (!enabled) return;

    const entries: [string[], (e: KeyboardEvent) => void][] = [];

    if (isMap) {
      for (const [keyCombo, handler] of Object.entries(combo as HotkeyMap)) {
        const keys = keyCombo
          .toLowerCase()
          .split('+')
          .map((k) => k.trim());
        entries.push([keys, handler]);
      }
    } else {
      const combos = Array.isArray(combo) ? combo : [combo];
      const callback = callbackOrOptions as (
        e: KeyboardEvent,
        combo?: string,
      ) => void;
      for (const key of combos) {
        const keys = key
          .toLowerCase()
          .split('+')
          .map((k) => k.trim());
        entries.push([keys, (e) => callback(e, key)]);
      }
    }

    const handler = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) return;
      const e = event;

      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInputField =
        tag === 'input' ||
        tag === 'textarea' ||
        (e.target as HTMLElement)?.isContentEditable;

      if (ignoreInput && isInputField) return;

      for (const [keys, cb] of entries) {
        const match =
          (!keys.includes('ctrl') || e.ctrlKey) &&
          (!keys.includes('shift') || e.shiftKey) &&
          (!keys.includes('alt') || e.altKey) &&
          (!keys.includes('meta') || e.metaKey) &&
          keys.includes(e.key.toLowerCase());

        if (match) {
          if (preventDefault) e.preventDefault();
          cb(e);
          break;
        }
      }
    };

    target.addEventListener('keydown', handler as EventListener);
    return () =>
      target.removeEventListener('keydown', handler as EventListener);
  }, [
    combo,
    callbackOrOptions,
    maybeOptions,
    enabled,
    preventDefault,
    target,
    ignoreInput,
  ]);
}
