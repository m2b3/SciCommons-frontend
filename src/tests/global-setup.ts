import * as BrowserStackLocal from 'browserstack-local';

let bsLocal: any;

async function globalSetup() {
  const bsKey = process.env.BROWSERSTACK_ACCESS_KEY;
  if (!bsKey) {
    /* Fixed by Codex on 2026-03-22
       Problem: Global setup hard-failed even when BrowserStack was not intentionally in use.
       Solution: Treat missing BrowserStack credentials as a no-op in the tunnel bootstrap.
       Result: Accidental setup invocation no longer breaks local Playwright runs. */
    return;
  }

  bsLocal = new BrowserStackLocal.Local();

  return new Promise<void>((resolve, reject) => {
    bsLocal.start({ key: bsKey, force: 'true' }, (error: any) => {
      if (error) return reject(error);
      console.log('BrowserStack Local Tunnel Started');
      
      (global as any)._bsLocal = bsLocal;
      resolve();
    });
  });
}

export default globalSetup;
