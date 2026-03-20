async function globalTeardown() {
  const bsLocal = (global as any)._bsLocal;
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