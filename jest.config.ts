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
    /* Fixed by Codex on 2026-03-14
       Problem: Jest/jsdom could detect the native canvas package and crash before tests ran when the local Windows install was missing canvas.node
       Solution: Redirect test-time canvas imports to a lightweight stub so both Jest runtime resolution and jsdom setup avoid the native dependency
       Result: Test runs no longer depend on a healthy local canvas binary */
    '^canvas$': '<rootDir>/src/tests/__mocks__/canvas.cjs',
    '^next/router$': '<rootDir>/src/tests/__mocks__/router.ts',
  },
  /* Fixed by Codex on 2026-02-09
     Problem: Jest haste map reported a naming collision due to .next/standalone/package.json
     Solution: Ignore Next.js build output in module resolution
     Result: Tests run without haste-map naming collisions */
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  coverageProvider: 'v8',
  /* Fixed by Codex on 2026-03-14
     Problem: jsdom probes for canvas during environment startup before Jest setup files run, so a broken local native install aborts the full test suite
     Solution: Use a custom environment that aliases canvas to the shared stub before jest-environment-jsdom loads jsdom internals
     Result: Jest starts reliably even when the transitive native canvas package is absent or half-installed */
  testEnvironment: '<rootDir>/jest.canvas-safe-environment.cjs',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
