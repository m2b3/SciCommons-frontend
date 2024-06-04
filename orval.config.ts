// import { faker } from '@faker-js/faker';
import { defineConfig } from 'orval';

export default defineConfig({
  backend: {
    output: {
      mode: 'tags-split',
      target: './src/api/generated.ts',
      schemas: './src/api/schemas',
      client: 'react-query',
      baseUrl: 'http://localhost:8000',
      //   mock: true,
      override: {
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
      target: 'http://localhost:8000/api/openapi.json',
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
