import tape from 'tape-catch';
import sinon from 'sinon';
import fetchMock from '../testUtils/fetchMock';
import { inMemoryWrapperFactory } from '@splitsoftware/splitio-commons/src/storages/pluggable/inMemoryWrapper';
import { OPTIMIZED } from '@splitsoftware/splitio-commons/src/utils/constants';
import { SDK_NOT_READY } from '@splitsoftware/splitio-commons/src/utils/labels';
import { url, nearlyEqual } from '../testUtils';
import { applyOperations } from './wrapper-commands';

import { SplitFactory, PluggableStorage } from '../../';

const expectedSplitName = 'hierarchical_splits_testing_on';
const expectedSplitView = { name: 'hierarchical_splits_testing_on', trafficType: 'user', killed: false, changeNumber: 1487277320548, treatments: ['on', 'off'], configs: {}, sets: [], defaultTreatment: 'off', impressionsDisabled: false, prerequisites: [] };

const wrapperPrefix = 'PLUGGABLE_STORAGE_UT';
const wrapperInstance = inMemoryWrapperFactory();
const TOTAL_RAW_IMPRESSIONS = 17;
const TOTAL_EVENTS = 5;

/** @type SplitIO.IBrowserAsyncSettings */
const config = {
  core: {
    authorizationKey: 'SOME SDK KEY', // in consumer mode, SDK key is only used to identify the sdk instance
    key: 'UT_Segment_member'
  },
  mode: 'consumer_partial',
  storage: PluggableStorage({
    prefix: wrapperPrefix,
    wrapper: wrapperInstance
  }),
  urls: {
    sdk: 'https://sdk.baseurl/impressionsSuite',
    events: 'https://events.baseurl/impressionsSuite',
    telemetry: 'https://telemetry.baseurl/impressionsSuite'
  },
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

    fetchMock.postOnce(url(config, '/v1/keys/cs'), (url, req) => {
      const data = JSON.parse(req.body);

      assert.deepEqual(data, {
        keys: [{
          k: 'UT_Segment_member',
          fs: ['always-on-impressions-disabled-true']
        }]
      }, 'Unique keys for the evaluation with impressions disabled true.');

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

    assert.equal(client.getStatus().isReadyFromCache, false, 'SDK in consumer mode is not operational immediately');
    assert.equal(client.getStatus().isReady, false, 'SDK in consumer mode is not operational immediately');

    client.getTreatment('UT_IN_SEGMENT').then(treatment => assert.equal(treatment, 'control', 'Evaluations using pluggable storage returns a promise that resolves to control if initiated before SDK_READY'));
    otherClient.track('user', 'test.event', 18).then(result => assert.true(result, 'Track calls returns a promise on consumer mode, that resolves to true if the wrapper push operation success to queue the event'));

    // Manager methods
    manager.names().then(namesResult => assert.deepEqual(namesResult, [], 'manager `names` method returns an empty list of split names if called before SDK_READY or wrapper operation fail'));
    manager.split(expectedSplitName).then(splitResult => assert.deepEqual(splitResult, null, 'manager `split` method returns a null split view if called before SDK_READY or wrapper operation fail'));
    manager.splits().then(splitsResult => assert.deepEqual(splitsResult, [], 'manager `splits` method returns an empty list of split views if called before SDK_READY or wrapper operation fail'));

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

    // Below feature flags were added manually.
    // They are all_keys (always evaluate to on) which depend from always-on split. the _on/off is what treatment they are expecting there.
    assert.equal(await client.getTreatment('hierarchical_splits_testing_on'), 'on', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('hierarchical_splits_testing_off'), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('hierarchical_splits_testing_on_negated'), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('always-on-impressions-disabled-true'), 'on', 'Evaluations using pluggable storage should be correct.');

    assert.equal(typeof client.track('user', 'test.event', 18).then, 'function', 'Track calls should always return a promise on Consumer mode.');
    assert.equal(typeof client.track().then, 'function', 'Track calls should always return a promise on Consumer mode, even when parameters are incorrect.');

    assert.true(await client.track('user', 'test.event', 18), 'If the event was successfully queued the promise will resolve to true');
    assert.false(await client.track(), 'If the event was NOT successfully queued the promise will resolve to false');

    // Manager methods
    const splitNames = await manager.names();
    assert.equal(splitNames.length, 28, 'manager `names` method returns the list of split names asynchronously');
    assert.equal(splitNames.indexOf(expectedSplitName) > -1, true, 'list of split names should contain expected splits');
    assert.deepEqual(await manager.split(expectedSplitName), expectedSplitView, 'manager `split` method returns the split view of the given split name asynchronously');
    const splitViews = await manager.splits();
    assert.equal(splitViews.length, 28, 'manager `splits` method returns the list of split views asynchronously');
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
    assert.equal(fetchMock.calls().length, 6, 'fetch has been called 6 times after main client is destroyed, for posting events, impressions, impression counts, unique keys, telemetry config and usage stats');

    assert.equal(disconnectSpy.callCount, 1, 'Wrapper disconnect method should be called only once, when the main client is destroyed');

    // Assert impressionsListener
    setTimeout(() => {
      assert.equal(impressions.length, TOTAL_RAW_IMPRESSIONS + 1 /* One evaluation with impressionsDisabled true */, 'Each evaluation has its corresponding impression');
      assert.equal(impressions[0].impression.label, SDK_NOT_READY, 'The first impression is control with label "sdk not ready"');

      assert.end();
    });
  });

  t.test('Regular usage - NONE strategy', async (assert) => {

    fetchMock.postOnce(url(config, '/testImpressions/count'), 200);
    fetchMock.postOnce(url(config, '/v1/keys/cs'), (url, req) => {
      const data = JSON.parse(req.body);

      assert.deepEqual(data, {
        keys: [
          {
            k: 'UT_Segment_member',
            fs: ['UT_IN_SEGMENT', 'UT_NOT_IN_SEGMENT', 'UT_SET_MATCHER', 'UT_NOT_SET_MATCHER', 'always-o.n-with-config', 'always-on', 'hierarchical_splits_testing_on', 'hierarchical_splits_testing_off', 'hierarchical_splits_testing_on_negated']
          },
          {
            k: 'emi@split.io',
            fs: ['UT_IN_SEGMENT', 'UT_NOT_IN_SEGMENT']
          },
          {
            k: 'other',
            fs: ['UT_IN_SEGMENT']
          }]
      }, 'We performed evaluations for 3 keys, so we should have 3 items total.');

      return 200;
    });

    fetchMock.postOnce(url(config, '/events/bulk'), (url, req) => {
      const resp = JSON.parse(req.body);
      assert.equal(resp.length, TOTAL_EVENTS, 'All successfully tracked events were sent');
      return 200;
    });

    // Load wrapper with data to do the proper tests
    const wrapperInstance = inMemoryWrapperFactory();
    await applyOperations(wrapperInstance);

    /** @type SplitIO.ImpressionData[] */
    const impressions = [];
    const disconnectSpy = sinon.spy(wrapperInstance, 'disconnect');

    // Overwrite Math.random to NOT track telemetry
    const originalMathRandom = Math.random; Math.random = () => 0.5;
    const sdk = SplitFactory({
      ...config,
      storage: PluggableStorage({
        prefix: wrapperPrefix,
        wrapper: wrapperInstance
      }),
      sync: {
        impressionsMode: 'NONE'
      },
      impressionListener: {
        logImpression(data) { impressions.push(data); }
      }
    });
    Math.random = originalMathRandom; // restore

    const client = sdk.client();
    const otherClient = sdk.client('emi@split.io');

    /** Evaluation, track and manager methods before SDK_READY */

    const getTreatmentResult = client.getTreatment('UT_IN_SEGMENT');

    assert.equal(typeof getTreatmentResult.then, 'function', 'GetTreatment calls should always return a promise on Consumer mode.');
    assert.equal(await getTreatmentResult, 'control', 'Evaluations using pluggable storage should be control if initiated before SDK_READY.');
    assert.equal(client.getStatus().isReadyFromCache, false, 'SDK in consumer mode is not operational immediately');
    assert.equal(client.getStatus().isReady, false, 'SDK in consumer mode is not operational immediately');

    const trackResult = otherClient.track('user', 'test.event', 18);
    assert.equal(typeof trackResult.then, 'function', 'Track calls should always return a promise on Consumer mode.');
    assert.true(await trackResult, 'If the wrapper operation success to queue the event, the promise will resolve to true');

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

    // Below feature flags were added manually.
    // They are all_keys (always evaluate to on) which depend from always-on split. the _on/off is what treatment they are expecting there.
    assert.equal(await client.getTreatment('hierarchical_splits_testing_on'), 'on', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('hierarchical_splits_testing_off'), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('hierarchical_splits_testing_on_negated'), 'off', 'Evaluations using pluggable storage should be correct.');

    assert.equal(typeof client.track('user', 'test.event', 18).then, 'function', 'Track calls should always return a promise on Consumer mode.');
    assert.equal(typeof client.track().then, 'function', 'Track calls should always return a promise on Consumer mode, even when parameters are incorrect.');

    assert.true(await client.track('user', 'test.event', 18), 'If the event was successfully queued the promise will resolve to true');
    assert.false(await client.track(), 'If the event was NOT successfully queued the promise will resolve to false');

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

    await client.destroy();

    assert.equal(disconnectSpy.callCount, 1, 'Wrapper disconnect method should be called only once, when the main client is destroyed');

    // Assert impressionsListener
    setTimeout(() => {
      assert.equal(impressions.length, TOTAL_RAW_IMPRESSIONS, 'Each evaluation has its corresponding impression');
      assert.equal(impressions[0].impression.label, SDK_NOT_READY, 'The first impression is control with label "sdk not ready"');

      assert.end();
    });
  });

  t.test('Wrapper connection error timeouts the SDK immediately', (assert) => {
    fetchMock.postOnce(url(config, '/events/bulk'), 200);
    fetchMock.postOnce(url(config, '/testImpressions/bulk'), 200);

    // Mock a wrapper connection error
    sinon.stub(wrapperInstance, 'connect').callsFake(() => { Promise.reject(); });
    const getSpy = sinon.spy(wrapperInstance, 'get');

    const sdk = SplitFactory(config);

    const client = sdk.client();

    client.ready().then(() => {
      assert.fail('Ready promise should not be resolved if wrapper connection fails');
    }, () => {
      assert.pass('Ready promise should be rejected if wrapper connection fails');
    });

    const start = Date.now();
    client.on(client.Event.SDK_READY_TIMED_OUT, async () => {
      assert.true(nearlyEqual(Date.now() - start, 0), 'SDK_READY_TIMED_OUT event is emitted immediately');

      // Client methods behave as if the SDK is not ready
      assert.equal(await client.getTreatment('UT_IN_SEGMENT'), 'control', 'treatment is control with label not ready.');
      assert.true(await client.track('user', 'test.event', 18), 'event is tracked in memory (partial consumer mode).');

      // Shared clients will also timeout immediately and behave as if the SDK is not ready
      const otherClient = sdk.client('other_user');
      otherClient.on(otherClient.Event.SDK_READY_TIMED_OUT, async () => {
        assert.true(nearlyEqual(Date.now() - start, 0), 'SDK_READY_TIMED_OUT event is emitted immediately in shared client');

        assert.equal(await otherClient.getTreatment('UT_IN_SEGMENT'), 'control', 'treatment is control with label not ready.');
        assert.true(await otherClient.track('user', 'test.event', 18), 'event is tracked in memory (partial consumer mode).');

        await client.destroy();
        assert.equal(getSpy.callCount, 0, '`getTreatment` shouldn\'t have called wrapper methods if SDK is not ready');

        wrapperInstance.connect.restore();
        assert.end();
      });
    });
  });
});
