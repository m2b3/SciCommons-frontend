import type { Local as BrowserStackLocalInstance } from 'browserstack-local';

let bsLocal: BrowserStackLocalInstance | undefined;
const browserStackGlobal = globalThis as typeof globalThis & {
  _bsLocal?: BrowserStackLocalInstance;
};

async function globalSetup() {
  const bsKey = process.env.BROWSERSTACK_ACCESS_KEY;
  if (!bsKey) {
    /* Fixed by Codex on 2026-03-22
       Problem: Global setup hard-failed even when BrowserStack was not intentionally in use.
       Solution: Treat missing BrowserStack credentials as a no-op in the tunnel bootstrap.
       Result: Accidental setup invocation no longer breaks local Playwright runs. */
    return;
  }

  /* Fixed by Codex on 2026-03-22
     Who: Codex
     What: Deferred BrowserStack Local module loading until credentials are actually present.
     Why: sureshDev should type-check and run local Playwright flows even when BrowserStack is not installed or configured.
     How: Use a type-only import plus runtime dynamic import so module resolution is only exercised when BrowserStack execution is intentional. */
  let Local: typeof import('browserstack-local').Local;
  try {
    ({ Local } = await import('browserstack-local'));
  } catch (error) {
    throw new Error(
      'BrowserStack testing requires the optional `browserstack-local` package. Install it locally before running BrowserStack-enabled Playwright tests.'
    );
  }
  bsLocal = new Local();

  return new Promise<void>((resolve, reject) => {
    bsLocal?.start({ key: bsKey, force: 'true' }, (error?: Error | null) => {
      if (error) return reject(error);
      console.log('BrowserStack Local Tunnel Started');

      browserStackGlobal._bsLocal = bsLocal;
      resolve();
    });
  });
}

export default globalSetup;
