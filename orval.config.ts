// import { faker } from '@faker-js/faker';
/* Fixed by Codex on 2026-03-15
   Who: Codex
   What: Added explicit dotenv loading for Orval config execution.
   Why: Node execution of `orval.config.ts` does not automatically load `.env`, which made NEXT_PUBLIC_BACKEND_URL empty and triggered localhost fallback.
   How: Import `dotenv/config` before reading process.env so backend/UI env settings are available during generation. */
import 'dotenv/config';
import { defineConfig } from 'orval';

/* Fixed by Codex on 2026-03-15
   Who: Codex
   What: Switched Orval backend target from hardcoded localhost to env-driven URL.
   Why: Local and shared environments use different backend hosts, and hardcoding localhost points Orval at the wrong spec source.
   How: Read NEXT_PUBLIC_BACKEND_URL from process.env, trim optional quotes/trailing slash, and use localhost as fallback. */
const resolvedBackendUrlFromEnv = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
  .replace(/\/+$/, '');
const backend_url = resolvedBackendUrlFromEnv || 'http://localhost:8000';

export default defineConfig({
  backend: {
    output: {
      mode: 'tags-split',
      target: './src/api/generated.ts',
      schemas: './src/api/schemas',
      client: 'react-query',
      //   mock: true,
      override: {
        mutator: {
          path: './src/api/custom-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          // useSuspenseQuery: true,
          // useSuspenseInfiniteQuery: true,
          // useInfinite: true,
          // useInfiniteQueryParam: 'limit',
        },
      },
    },
    input: {
      target: `${backend_url}/api/openapi.json`,
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
