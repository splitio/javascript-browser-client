/**
 * This file is meant to be bundled with Rollup and run in Node to validate that ESM build exports modules correctly.
 */

import * as splitioSlimESM from '@splitsoftware/splitio-browserjs';
import * as splitioFullESM from '@splitsoftware/splitio-browserjs/full';

import assert from 'assert';

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
  { name: 'PluggableStorage', inFull: true, inSlim: true, inSlimUMD: false },
];

modules.forEach(({ name, inFull, inSlim }) => {
  assert.strictEqual(typeof splitioFullESM[name], inFull ? 'function' : 'undefined', `Module '${name}' should ${inFull ? '' : 'not '}be exported in ESM full`);

  assert.strictEqual(typeof splitioSlimESM[name], inSlim ? 'function' : 'undefined', `Module '${name}' should ${inSlim ? '' : 'not '}be exported in ESM slim`);
});
