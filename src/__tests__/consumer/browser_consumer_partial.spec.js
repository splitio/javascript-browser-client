import tape from 'tape-catch';
import sinon from 'sinon';
import fetchMock from '../testUtils/fetchMock';
import { inMemoryWrapperFactory } from '@splitsoftware/splitio-commons/src/storages/pluggable/inMemoryWrapper';
import { OPTIMIZED } from '@splitsoftware/splitio-commons/src/utils/constants';
import { SDK_NOT_READY } from '@splitsoftware/splitio-commons/src/utils/labels';
import { url } from '../testUtils';
import { applyOperations } from './wrapper-commands';

import { SplitFactory, PluggableStorage } from '../../';

const expectedSplitName = 'hierarchical_splits_testing_on';
const expectedSplitView = { name: 'hierarchical_splits_testing_on', trafficType: 'user', killed: false, changeNumber: 1487277320548, treatments: ['on', 'off'], configs: {} };

const wrapperPrefix = 'PLUGGABLE_STORAGE_UT';
const wrapperInstance = inMemoryWrapperFactory();
const TOTAL_RAW_IMPRESSIONS = 17;
const TOTAL_EVENTS = 5;

/** @type SplitIO.IBrowserAsyncSettings */
const config = {
  core: {
    authorizationKey: 'SOME API KEY', // in consumer mode, api key is only used to identify the sdk instance
    key: 'UT_Segment_member'
  },
  mode: 'consumer_partial',
  storage: PluggableStorage({
    prefix: wrapperPrefix,
    wrapper: wrapperInstance
  }),
  // sync: {
  //   impressionsMode: 'OPTIMIZED'
  // },
  urls: {
    sdk: 'https://sdk.baseurl/impressionsSuite',
    events: 'https://events.baseurl/impressionsSuite',
    telemetry: 'https://telemetry.baseurl/impressionsSuite'
  }
};

tape('Browser Consumer Partial mode with pluggable storage', function (t) {

  /**
   * We only validates regular usage.
   * Corner cases, such as wrapper connection timeout and operation errors, are validated in `browser_consumer.spec.js`
   */
  t.test('Regular usage - OPTIMIZED strategy', async (assert) => {

    fetchMock.postOnce(url(config, '/testImpressions/bulk'), (url, req) => {
      assert.equal(req.headers.SplitSDKImpressionsMode, OPTIMIZED, 'Impressions mode is OPTIMIZED by default');
      const resp = JSON.parse(req.body);
      assert.equal(resp.reduce((prev, cur) => {
        return prev + cur.i.length;
      }, 0), TOTAL_RAW_IMPRESSIONS - 1, 'Impressions were deduped');
      return 200;
    });

    fetchMock.postOnce(url(config, '/testImpressions/count'), 200);
    fetchMock.postOnce(url(config, '/v1/metrics/config'), 200);
    fetchMock.postOnce(url(config, '/v1/metrics/usage'), 200);

    fetchMock.postOnce(url(config, '/events/bulk'), (url, req) => {
      const resp = JSON.parse(req.body);
      assert.equal(resp.length, TOTAL_EVENTS, 'All successfully tracked events were sent');
      return 200;
    });

    // Load wrapper with data to do the proper tests
    await applyOperations(wrapperInstance);

    /** @type SplitIO.ImpressionData[] */
    const impressions = [];
    const disconnectSpy = sinon.spy(wrapperInstance, 'disconnect');

    // Overwrite Math.random to track telemetry
    const originalMathRandom = Math.random; Math.random = () => 0.001;
    const sdk = SplitFactory({
      ...config,
      impressionListener: {
        logImpression(data) { impressions.push(data); }
      }
    });
    Math.random = originalMathRandom; // restore

    const client = sdk.client();
    const otherClient = sdk.client('emi@split.io');
    const manager = sdk.manager();

    /** Evaluation, track and manager methods before SDK_READY */

    const getTreatmentResult = client.getTreatment('UT_IN_SEGMENT');

    const namesResult = manager.names();
    const splitResult = manager.split(expectedSplitName);
    const splitsResult = manager.splits();

    assert.equal(typeof getTreatmentResult.then, 'function', 'GetTreatment calls should always return a promise on Consumer mode.');
    assert.equal(await getTreatmentResult, 'control', 'Evaluations using pluggable storage should be control if initiated before SDK_READY.');
    assert.equal(client.__getStatus().isReadyFromCache, false, 'SDK in consumer mode is not operational inmediatelly');
    assert.equal(client.__getStatus().isReady, false, 'SDK in consumer mode is not operational inmediatelly');

    const trackResult = otherClient.track('user', 'test.event', 18);
    assert.equal(typeof trackResult.then, 'function', 'Track calls should always return a promise on Consumer mode.');
    assert.true(await trackResult, 'If the wrapper operation success to queue the event, the promise will resolve to true');

    // Manager methods
    assert.deepEqual(await namesResult, [], 'manager `names` method returns an empty list of split names if called before SDK_READY or wrapper operation fail');
    assert.deepEqual(await splitResult, null, 'manager `split` method returns a null split view if called before SDK_READY or wrapper operation fail');
    assert.deepEqual(await splitsResult, [], 'manager `splits` method returns an empty list of split views if called before SDK_READY or wrapper operation fail');

    /** Evaluation, track and manager methods on SDK_READY */

    await client.ready();
    await otherClient.ready(); // waiting to avoid 'control' with label 'sdk not ready'

    assert.equal(await client.getTreatment('UT_IN_SEGMENT'), 'on', '`getTreatment` evaluation using pluggable storage should be correct.');
    assert.equal((await otherClient.getTreatmentWithConfig('UT_IN_SEGMENT')).treatment, 'off', '`getTreatmentWithConfig` evaluation using pluggable storage should be correct.');

    assert.equal((await client.getTreatments(['UT_NOT_IN_SEGMENT']))['UT_NOT_IN_SEGMENT'], 'off', '`getTreatments` evaluation using pluggable storage should be correct.');
    assert.equal((await otherClient.getTreatmentsWithConfig(['UT_NOT_IN_SEGMENT']))['UT_NOT_IN_SEGMENT'].treatment, 'on', '`getTreatmentsWithConfig` evaluation using pluggable storage should be correct.');

    assert.equal(await client.getTreatment('UT_SET_MATCHER', {
      permissions: ['admin']
    }), 'on', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('UT_SET_MATCHER', {
      permissions: ['not_matching']
    }), 'off', 'Evaluations using pluggable storage should be correct.');

    assert.equal(await client.getTreatment('UT_NOT_SET_MATCHER', {
      permissions: ['create']
    }), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('UT_NOT_SET_MATCHER', {
      permissions: ['not_matching']
    }), 'on', 'Evaluations using pluggable storage should be correct.');
    assert.deepEqual(await client.getTreatmentWithConfig('UT_NOT_SET_MATCHER', {
      permissions: ['not_matching']
    }), {
      treatment: 'on',
      config: null
    }, 'Evaluations using pluggable storage should be correct, including configs.');
    assert.deepEqual(await client.getTreatmentWithConfig('always-o.n-with-config'), {
      treatment: 'o.n',
      config: '{"color":"brown"}'
    }, 'Evaluations using pluggable storage should be correct, including configs.');

    assert.equal(await client.getTreatment('always-on'), 'on', 'Evaluations using pluggable storage should be correct.');

    // Below splits were added manually.
    // They are all_keys (always evaluate to on) which depend from always-on split. the _on/off is what treatment they are expecting there.
    assert.equal(await client.getTreatment('hierarchical_splits_testing_on'), 'on', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('hierarchical_splits_testing_off'), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('hierarchical_splits_testing_on_negated'), 'off', 'Evaluations using pluggable storage should be correct.');

    assert.equal(typeof client.track('user', 'test.event', 18).then, 'function', 'Track calls should always return a promise on Consumer mode.');
    assert.equal(typeof client.track().then, 'function', 'Track calls should always return a promise on Consumer mode, even when parameters are incorrect.');

    assert.true(await client.track('user', 'test.event', 18), 'If the event was succesfully queued the promise will resolve to true');
    assert.false(await client.track(), 'If the event was NOT succesfully queued the promise will resolve to false');

    // Manager methods
    const splitNames = await manager.names();
    assert.equal(splitNames.length, 25, 'manager `names` method returns the list of split names asynchronously');
    assert.equal(splitNames.indexOf(expectedSplitName) > -1, true, 'list of split names should contain expected splits');
    assert.deepEqual(await manager.split(expectedSplitName), expectedSplitView, 'manager `split` method returns the split view of the given split name asynchronously');
    const splitViews = await manager.splits();
    assert.equal(splitViews.length, 25, 'manager `splits` method returns the list of split views asynchronously');
    assert.deepEqual(splitViews.find(splitView => splitView.name === expectedSplitName), expectedSplitView, 'manager `split` method returns the split view of the given split name asynchronously');

    // New shared client created
    const newClient = sdk.client('other');
    newClient.track('user', 'test.event', 18).then(result => assert.true(result, 'Track should attempt to track, whether SDK_READY has been emitted or not.'));
    newClient.getTreatment('UT_IN_SEGMENT').then(result => assert.equal(result, 'control', '`getTreatment` evaluation is control if shared client is not ready yet.'));

    await newClient.ready();
    assert.true(await newClient.track('user', 'test.event', 18), 'Track should attempt to track, whether SDK_READY has been emitted or not.');
    assert.equal((await newClient.getTreatment('UT_IN_SEGMENT')), 'off', '`getTreatment` evaluation using pluggable storage should be correct.');

    await client.ready(); // promise already resolved
    await newClient.destroy();
    await otherClient.destroy();

    assert.equal(fetchMock.calls().length, 1, 'fetch has been called once for posting telemetry config stats');
    await client.destroy();
    assert.equal(fetchMock.calls().length, 5, 'fetch has been called 5 times after main client is destroyed, for posting events, impressions, impression counts, telemetry config and usage stats');

    assert.equal(disconnectSpy.callCount, 1, 'Wrapper disconnect method should be called only once, when the main client is destroyed');

    // Assert impressionsListener
    setTimeout(() => {
      assert.equal(impressions.length, TOTAL_RAW_IMPRESSIONS, 'Each evaluation has its corresponting impression');
      assert.equal(impressions[0].impression.label, SDK_NOT_READY, 'The first impression is control with label "sdk not ready"');

      assert.end();
    });
  });

});
