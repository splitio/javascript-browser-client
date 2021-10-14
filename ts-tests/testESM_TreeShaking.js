/**
 * This file is bundled with Rollup to validate tree-shaking optimization when using ESM build.
 */

import { SplitFactory, LocalhostFromObject } from '@splitsoftware/splitio-browserjs';

import assert from 'assert';

const client = SplitFactory({
  core: {
    authorizationKey: 'localhost'
  },
  features: { 'test_split': 'on'},
  sync: {
    localhostMode: LocalhostFromObject()
  }
}).client();

assert.strictEqual(client.getTreatment('test_split'), 'control');

client.on(client.Event.SDK_READY, () => {
  assert.strictEqual(client.getTreatment('test_split'), 'on');

  client.destroy();
});
