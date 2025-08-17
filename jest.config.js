/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.test.json',
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
