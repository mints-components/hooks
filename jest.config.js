/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [151001],
        },
      },
    ],
  },
};
