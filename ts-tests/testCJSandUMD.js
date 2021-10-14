/**
 * This file is meant to run in Node to validate that UMD and CJS builds export modules correctly.
 *
 * We cannot validate ESM build here, because in Node:
 * - CommonJS and ES modules imports cannot be used together (https://nodejs.org/api/esm.html#esm_no_require_exports_or_module_exports)
 * - The statement `import ... from '@splitsoftware/splitio-browserjs/full'` result in a "Unsupported Directory Import" error (https://nodejs.org/api/esm.html#esm_mandatory_file_extensions)
 */

const splitioSlimCJS = require('@splitsoftware/splitio-browserjs');
const splitioFullCJS = require('@splitsoftware/splitio-browserjs/full');

const splitioSlimUMD = require('../umd/split-browser-dev-');
const splitioFullUMD = require('../umd/split-browser-dev-.full');

const assert = require('assert');

const modules = [
  { name: 'SplitFactory', inFull: true, inSlim: true, inSlimUMD: true },
  { name: 'InLocalStorage', inFull: true, inSlim: true, inSlimUMD: false },
  { name: 'GoogleAnalyticsToSplit', inFull: true, inSlim: true, inSlimUMD: false },
  { name: 'SplitToGoogleAnalytics', inFull: true, inSlim: true, inSlimUMD: false },
  { name: 'ErrorLogger', inFull: true, inSlim: true, inSlimUMD: false },
  { name: 'WarnLogger', inFull: true, inSlim: true, inSlimUMD: false },
  { name: 'InfoLogger', inFull: true, inSlim: true, inSlimUMD: false },
  { name: 'DebugLogger', inFull: true, inSlim: true, inSlimUMD: false },
  { name: 'LocalhostFromObject', inFull: false, inSlim: true, inSlimUMD: false },
];

modules.forEach(({ name, inFull, inSlim, inSlimUMD }) => {
  assert.strictEqual(typeof splitioFullCJS[name], inFull ? 'function' : 'undefined', `Module '${name}' should ${inFull ? '' : 'not '}be exported in CJS full`);
  assert.strictEqual(typeof splitioFullUMD[name], inFull ? 'function' : 'undefined', `Module '${name}' should ${inFull ? '' : 'not '}be exported in UMD full`);

  assert.strictEqual(typeof splitioSlimCJS[name], inSlim ? 'function' : 'undefined', `Module '${name}' should ${inSlim ? '' : 'not '}be exported in CJS slim`);
  assert.strictEqual(typeof splitioSlimUMD[name], inSlimUMD ? 'function' : 'undefined', `Module '${name}' should ${inSlimUMD ? '' : 'not '}be exported in UMD slim`);
});
