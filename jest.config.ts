import nextJest from 'next/jest.js';

import type { Config } from 'jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next/router$': '<rootDir>/src/tests/__mocks__/router.ts',
  },
  /* Fixed by Codex on 2026-02-09
     Problem: Jest haste map reported a naming collision due to .next/standalone/package.json
     Solution: Ignore Next.js build output in module resolution
     Result: Tests run without haste-map naming collisions */
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
