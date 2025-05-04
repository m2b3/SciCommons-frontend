import type { ComponentType, JSXElementConstructor, ReactElement } from 'react';

import dynamic from 'next/dynamic';

type LoadingFn = () => ReactElement<any, string | JSXElementConstructor<any>>;

export function createDynamicComponents<T extends string>(
  path: string,
  components: T[],
  loadingComponent?: LoadingFn
): Record<T, ComponentType<any>> {
  return components.reduce(
    (acc, componentName) => {
      acc[componentName] = dynamic(() => import(path).then((mod) => mod[componentName]), {
        ssr: false,
        loading: loadingComponent || (() => <div>Loading...</div>),
      }) as ComponentType<any>;
      return acc;
    },
    {} as Record<T, ComponentType<any>>
  );
}
