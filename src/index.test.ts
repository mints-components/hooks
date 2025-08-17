/* @vitest-environment node */
import { readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

import { describe, it, expect } from 'vitest';

import * as hooks from './index';

// ESM-safe __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

/** Resolve the real src directory even if this test file lives in root or in src */
function resolveSrcDir() {
  // if test placed in src/, then __dirname ends with /src
  if (basename(__dirname) === 'src') return __dirname;
  return join(__dirname, 'src');
}

/** directories that intentionally export multiple public APIs */
const MULTI_EXPORTS: Record<string, string[]> = {
  'use-storage': ['useStorage', 'useLocalStorage', 'useSessionStorage'],
  'use-timer': ['useTimer', 'useCountdown', 'createLocalStorageAdapter'],
};

function toExportNameFromDir(dir: string): string {
  // kebab-case dir -> camelCase export, e.g. use-outside-click -> useOutsideClick
  return dir.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

describe('entrypoint exports vs source folders', () => {
  it('index.ts should export everything expected from src (and nothing extra)', () => {
    const srcDir = resolveSrcDir();

    const hookDirs = readdirSync(srcDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.startsWith('use-'))
      .map((d) => d.name);

    // Build expected export names from folders (+ multi-export directories)
    const expectedFromDirs: string[] = [];
    for (const dir of hookDirs) {
      const many = MULTI_EXPORTS[dir];
      if (many) expectedFromDirs.push(...many);
      else expectedFromDirs.push(toExportNameFromDir(dir));
    }

    const expected = Array.from(new Set(expectedFromDirs)).sort();
    const actual = Object.keys(hooks).sort();

    const unexpected = actual.filter((x) => !expected.includes(x));
    const missing = expected.filter((x) => !actual.includes(x));

    // helpful diff on failure
    expect({ unexpected, missing }).toEqual({ unexpected: [], missing: [] });
  });
});
