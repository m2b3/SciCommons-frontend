import type { Local as BrowserStackLocalInstance } from 'browserstack-local';

const browserStackGlobal = globalThis as typeof globalThis & {
  _bsLocal?: BrowserStackLocalInstance;
};

async function globalTeardown() {
  const bsLocal = browserStackGlobal._bsLocal;
  if (bsLocal) {
    return new Promise<void>((resolve) => {
      bsLocal.stop(() => {
        console.log('BrowserStack Local Tunnel Stopped');
        resolve();
      });
    });
  }
}

export default globalTeardown;
