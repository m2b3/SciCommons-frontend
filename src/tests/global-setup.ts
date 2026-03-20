import * as BrowserStackLocal from 'browserstack-local';

let bsLocal: any;

async function globalSetup() {
  const bsKey = process.env.BROWSERSTACK_ACCESS_KEY;
  if (!bsKey) throw new Error('Missing BROWSERSTACK_ACCESS_KEY');

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