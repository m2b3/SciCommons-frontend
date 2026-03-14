/* eslint-disable @typescript-eslint/no-var-requires */
const Module = require('module');
const path = require('path');

/* Fixed by Codex on 2026-03-14
   Problem: jsdom calls require.resolve('canvas') during environment bootstrap, and a broken native install crashes Jest before any tests execute
   Solution: Patch Node's module resolution for the exact 'canvas' specifier so jest-environment-jsdom sees a stable local stub instead of the native package
   Result: Test workers can boot deterministically without depending on canvas.node being present on the machine */
const canvasStubPath = path.join(__dirname, 'src', 'tests', '__mocks__', 'canvas.cjs');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (request === 'canvas') {
    return canvasStubPath;
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const jestEnvironmentJsdom = require('jest-environment-jsdom');
const CanvasSafeEnvironment =
  jestEnvironmentJsdom.TestEnvironment ?? jestEnvironmentJsdom.default ?? jestEnvironmentJsdom;

module.exports = CanvasSafeEnvironment;
