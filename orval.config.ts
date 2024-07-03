// import { faker } from '@faker-js/faker';
import { defineConfig } from 'orval';

const backend_url = 'https://scicommons-backend-revamp.onrender.com'; // Change this to your backend URL

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
