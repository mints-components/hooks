import { renderHook } from '@testing-library/react';

import { useOutsideClick } from '../src';

describe('useOutsideClick', () => {
  let state = 0;
  let container: HTMLDivElement;
  let outOfContainer: HTMLDivElement;
  let onClick = () => state++;

  beforeEach(() => {
    container = document.createElement('div');
    outOfContainer = document.createElement('div');
    document.body.appendChild(container);
    document.body.appendChild(outOfContainer);
  });

  afterEach(() => {
    state = 0;
    document.body.removeChild(container);
    document.body.removeChild(outOfContainer);
  });

  it('the state should be 0 when container click', () => {
    const { rerender } = renderHook(() =>
      useOutsideClick({ current: container }, onClick),
    );

    expect(state).toBe(0);

    rerender();
    container.click();
    expect(state).toBe(0);
  });

  it('the state should be 1 when outside click', () => {
    const { rerender } = renderHook(() =>
      useOutsideClick({ current: container }, onClick),
    );

    expect(state).toBe(0);

    rerender();
    outOfContainer.click();
    expect(state).toBe(1);
  });
});
