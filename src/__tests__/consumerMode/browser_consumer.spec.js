import tape from 'tape-catch';
import sinon from 'sinon';
import { inMemoryWrapperFactory } from '@splitsoftware/splitio-commons/src/storages/pluggable/inMemoryWrapper';
import { SDK_NOT_READY, EXCEPTION } from '@splitsoftware/splitio-commons/src/utils/labels';
import { applyOperations } from './wrapper-commands';
import { nearlyEqual } from '../testUtils';

import { SplitFactory, PluggableStorage } from '../../index';

const expectedSplitName = 'hierarchical_splits_testing_on';
const expectedSplitView = { name: 'hierarchical_splits_testing_on', trafficType: 'user', killed: false, changeNumber: 1487277320548, treatments: ['on', 'off'], configs: {} };

const wrapperPrefix = 'PLUGGABLE_STORAGE_UT';
const wrapperInstance = inMemoryWrapperFactory(0);

/** @type SplitIO.IBrowserAsyncSettings */
const config = {
  core: {
    authorizationKey: 'SOME API KEY', // in consumer mode, api key is only used to identify the sdk instance
    key: 'UT_Segment_member'
  },
  mode: 'consumer',
  storage: PluggableStorage({
    prefix: wrapperPrefix,
    wrapper: wrapperInstance
  })
};

tape('Browser Consumer mode with pluggable storage', function (t) {

  t.test('Regular usage', async (assert) => {

    // Load wrapper with data to do the proper tests
    await applyOperations(wrapperInstance);

    /** @type SplitIO.ImpressionData[] */
    const impressions = [];
    const disconnectSpy = sinon.spy(wrapperInstance, 'disconnect');

    const expectedConfig = '{"color":"brown"}';
    const sdk = SplitFactory({
      ...config,
      impressionListener: {
        logImpression(data) { impressions.push(data); }
      }
    });
    const client = sdk.client();
    const otherClient = sdk.client('emi@split.io');
    const manager = sdk.manager();

    /** Evaluation, track and manager methods before SDK_READY */

    const getTreatmentResult = client.getTreatment('UT_IN_SEGMENT');

    const namesResult = manager.names();
    const splitResult = manager.split(expectedSplitName);
    const splitsResult = manager.splits();

    assert.equal(typeof getTreatmentResult.then, 'function', 'GetTreatment calls should always return a promise on Consumer mode.');
    // @TODO caveat: if wrapper.connect is resolved before wrapper operations, next evaluation might be different than control
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
      config: expectedConfig
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
    assert.true(await newClient.track('user', 'test.event', 18), 'Track should attempt to track, whether SDK_READY has been emitted or not.');
    assert.equal((await newClient.getTreatment('UT_IN_SEGMENT')), 'control', '`getTreatment` evaluation is control if shared client is not ready yet.');

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
      assert.equal(impressions.length, 17, 'Each evaluation has its corresponting impression');
      assert.equal(impressions[0].impression.label, SDK_NOT_READY, 'The first impression is control with label "sdk not ready"');

      assert.end();
    });
  });

  t.test('Connection timeout and then ready', assert => {
    const connDelay = 110;
    const readyTimeout = 0.1; // 100 millis
    const configWithShortTimeout = { ...config, startup: { readyTimeout } };
    wrapperInstance._setConnDelay(connDelay);
    const sdk = SplitFactory(configWithShortTimeout);
    wrapperInstance._setConnDelay(0); // restore
    const client = sdk.client();
    const otherClient = sdk.client('other');

    const start = Date.now();
    assert.plan(12);

    client.getTreatment('always-on').then(treatment => {
      assert.equal(treatment, 'control', 'Evaluations using pluggable storage should be control if SDK is not ready');
    });
    client.track('user', 'test.event', 18).then(result => {
      assert.true(result, 'If the wrapper operation success to queue the event, the promise will resolve to true, even if the SDK is not ready');
    });

    // SDK_READY_TIMED_OUT event must be emitted after 100 millis
    [client, otherClient].forEach(client => client.on(client.Event.SDK_READY_TIMED_OUT, () => {
      const delay = Date.now() - start;
      assert.true(nearlyEqual(delay, readyTimeout * 1000), 'SDK_READY_TIMED_OUT event must be emitted after 100 millis');
    }));

    // Also, ready promise must be rejected after 100 millis
    [client, otherClient].forEach(client => client.ready().catch(() => {
      const delay = Date.now() - start;
      assert.true(nearlyEqual(delay, readyTimeout * 1000), 'Ready promise must be rejected after 100 millis');
    }));

    // subscribe to SDK_READY event to assert regular usage
    client.on(client.Event.SDK_READY, async () => {
      const delay = Date.now() - start;
      assert.true(nearlyEqual(delay, connDelay), 'SDK_READY event must be emitted once wrapper is connected');

      await client.ready();
      assert.pass('Ready promise is resolved once SDK_READY is emitted');

      // some asserts to test regular usage
      assert.equal(await client.getTreatment('UT_IN_SEGMENT'), 'on', 'Evaluations using pluggable storage should be correct.');
      assert.equal(await otherClient.getTreatment('UT_IN_SEGMENT'), 'off', 'Evaluations using pluggable storage should be correct.');
      assert.true(await client.track('user', 'test.event', 18), 'If the event was succesfully queued the promise will resolve to true');
      assert.false(await client.track(), 'If the event was NOT succesfully queued the promise will resolve to false');

      await client.destroy();
      assert.end();
    });

  });

  t.test('Wrapper errors', async (assert) => {
    const impressions = [];

    const sdk = SplitFactory({
      ...config,
      impressionListener: {
        logImpression(data) { impressions.push(data); }
      }
    });
    const client = sdk.client();
    const manager = sdk.manager();
    await client.ready();
    assert.equal(await client.getTreatment('UT_IN_SEGMENT'), 'on', '`getTreatment` evaluation correct.');
    assert.true(await client.track('user', 'test.event', 18), 'Event queued');

    // Stubbing wrapper methods to make client and manager methods fail
    const methods = ['pushItems', 'get', 'getKeysByPrefix'];
    methods.forEach(method => sinon.stub(wrapperInstance, method).callsFake(() => { Promise.reject(); }));

    assert.equal(await client.getTreatment('UT_IN_SEGMENT'), 'control', '`getTreatment` evaluation correct.');
    assert.false(await client.track('user', 'test.event', 18), 'If the event failed to be queued due to a wrapper operation failure, the promise will resolve to false');
    assert.deepEqual(await manager.names(), [], 'manager `names` method returns an empty list of split names if called before SDK_READY or wrapper operation fail');
    assert.deepEqual(await manager.split(expectedSplitName), null, 'manager `split` method returns a null split view if called before SDK_READY or wrapper operation fail');
    assert.deepEqual(await manager.splits(), [], 'manager `splits` method returns an empty list of split views if called before SDK_READY or wrapper operation fail');

    // Restore wrapper
    methods.forEach(method => wrapperInstance[method].restore());

    await client.destroy();

    // Assert impressionsListener
    setTimeout(() => {
      assert.equal(impressions.length, 2, 'Each evaluation has its corresponting impression');
      assert.equal(impressions[1].impression.label, EXCEPTION, 'The last impression is control with label "exception"');

      assert.end();
    });

  });


});
