import tape from 'tape-catch';
import sinon from 'sinon';
import { inMemoryWrapperFactory } from '@splitsoftware/splitio-commons/src/storages/pluggable/inMemoryWrapper';
import { SDK_NOT_READY, EXCEPTION } from '@splitsoftware/splitio-commons/src/utils/labels';
import { truncateTimeFrame } from '@splitsoftware/splitio-commons/src/utils/time';
import { applyOperations, OPERATIONS_FLAG_SETS } from './wrapper-commands';
import { nearlyEqual } from '../testUtils';
import { version } from '../../../package.json';

import { SplitFactory, PluggableStorage } from '../../';

const expectedSplitName = 'hierarchical_splits_testing_on';
const expectedSplitView = { name: 'hierarchical_splits_testing_on', trafficType: 'user', killed: false, changeNumber: 1487277320548, treatments: ['on', 'off'], configs: {}, sets: [], defaultTreatment: 'off', impressionsDisabled: false };

const wrapperPrefix = 'PLUGGABLE_STORAGE_UT';
const wrapperInstance = inMemoryWrapperFactory();
const TOTAL_RAW_IMPRESSIONS = 18;
const TOTAL_EVENTS = 5;
const DEDUPED_IMPRESSIONS = 2;
const timeFrame = Date.now();

/** @type SplitIO.IBrowserAsyncSettings */
const config = {
  core: {
    authorizationKey: 'SOME SDK KEY', // in consumer mode, SDK key is only used to identify the sdk instance
    key: 'UT_Segment_member'
  },
  mode: 'consumer',
  storage: PluggableStorage({
    prefix: wrapperPrefix,
    wrapper: wrapperInstance
  }),
  sync: {
    impressionsMode: 'DEBUG',
  },
};

tape('Browser Consumer mode with pluggable storage', function (t) {

  t.test('Regular usage - DEBUG strategy', async (assert) => {

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

    assert.equal(client.__getStatus().isReadyFromCache, false, 'SDK in consumer mode is not operational immediately');
    assert.equal(client.__getStatus().isReady, false, 'SDK in consumer mode is not operational immediately');

    client.getTreatment('UT_IN_SEGMENT').then(treatment => assert.equal(treatment, 'control', 'Evaluations using pluggable storage returns a promise that resolves to control if initiated before SDK_READY'));
    otherClient.track('user', 'test.event', 18).then(result => assert.true(result, 'Track calls returns a promise on consumer mode, that resolves to true if the wrapper push operation success to queue the event'));

    // Manager methods
    manager.names().then(namesResult => assert.deepEqual(namesResult, [], 'manager `names` method returns a promise that resolved to an empty list of split names if called before SDK_READY or wrapper operation fail'));
    manager.split(expectedSplitName).then(splitResult => assert.deepEqual(splitResult, null, 'manager `split` method returns a promise that resolved to a null split view if called before SDK_READY or wrapper operation fail'));
    manager.splits().then(splitsResult => assert.deepEqual(splitsResult, [], 'manager `splits` method returns a promise that resolved to an empty list of split views if called before SDK_READY or wrapper operation fail'));

    /** Evaluation, track and manager methods on SDK_READY */

    await client.ready();
    await otherClient.ready(); // waiting to avoid 'control' with label 'sdk not ready'

    assert.equal(await client.getTreatment('UT_IN_SEGMENT'), 'on', '`getTreatment` evaluation using pluggable storage should be correct.');
    assert.equal((await otherClient.getTreatmentWithConfig('UT_IN_SEGMENT')).treatment, 'off', '`getTreatmentWithConfig` evaluation using pluggable storage should be correct.');

    assert.equal((await client.getTreatments(['UT_NOT_IN_SEGMENT']))['UT_NOT_IN_SEGMENT'], 'off', '`getTreatments` evaluation using pluggable storage should be correct.');
    assert.equal((await otherClient.getTreatmentsWithConfig(['UT_NOT_IN_SEGMENT']))['UT_NOT_IN_SEGMENT'].treatment, 'on', '`getTreatmentsWithConfig` evaluation using pluggable storage should be correct.');

    client.setAttribute('permissions', ['not_matching']);
    assert.equal(await client.getTreatment('UT_SET_MATCHER', {
      permissions: ['admin']
    }), 'on', 'Evaluations using pluggable storage should be correct.');
    client.setAttributes({ permissions: ['admin'] });
    assert.equal(await client.getTreatment('UT_SET_MATCHER', {
      permissions: ['not_matching']
    }), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('UT_SET_MATCHER'), 'on', 'Evaluations using pluggable storage and attributes binding should be correct.');

    client.setAttribute('permissions', ['not_matching']);
    assert.equal(await client.getTreatment('UT_NOT_SET_MATCHER', {
      permissions: ['create']
    }), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('UT_NOT_SET_MATCHER'), 'on', 'Evaluations using pluggable storage should be correct.');
    assert.deepEqual(await client.getTreatmentWithConfig('UT_NOT_SET_MATCHER'), {
      treatment: 'on',
      config: null
    }, 'Evaluations using pluggable storage should be correct, including configs.');
    client.clearAttributes();
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
    assert.equal(splitNames.length, 26, 'manager `names` method returns the list of split names asynchronously');
    assert.equal(splitNames.indexOf(expectedSplitName) > -1, true, 'list of split names should contain expected splits');
    assert.deepEqual(await manager.split(expectedSplitName), expectedSplitView, 'manager `split` method returns the split view of the given split name asynchronously');
    const splitViews = await manager.splits();
    assert.equal(splitViews.length, 26, 'manager `splits` method returns the list of split views asynchronously');
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
    await client.destroy();

    assert.equal(disconnectSpy.callCount, 1, 'Wrapper disconnect method should be called only once, when the main client is destroyed');

    // Validate stored impressions and events
    const trackedImpressions = await wrapperInstance.popItems('PLUGGABLE_STORAGE_UT.SPLITIO.impressions', await wrapperInstance.getItemsCount('PLUGGABLE_STORAGE_UT.SPLITIO.impressions'));
    const trackedEvents = await wrapperInstance.popItems('PLUGGABLE_STORAGE_UT.SPLITIO.events', await wrapperInstance.getItemsCount('PLUGGABLE_STORAGE_UT.SPLITIO.events'));
    assert.equal(trackedImpressions.length, TOTAL_RAW_IMPRESSIONS, 'Tracked impressions should be present in the external storage');
    assert.equal(trackedEvents.length, TOTAL_EVENTS, 'Tracked events should be present in the external storage');

    // Validate stored telemetry
    const latencies = await wrapperInstance.getKeysByPrefix(`PLUGGABLE_STORAGE_UT.SPLITIO.telemetry.latencies::browserjs-${version}/unknown/unknown`);
    assert.true(latencies.length > 0, 'There are stored latencies');
    const exceptions = await wrapperInstance.getKeysByPrefix(`PLUGGABLE_STORAGE_UT.SPLITIO.telemetry.exceptions::browserjs-${version}/unknown/unknown`);
    assert.true(exceptions.length === 0, 'There aren\'t stored exceptions');
    const configValue = await wrapperInstance.get(`PLUGGABLE_STORAGE_UT.SPLITIO.telemetry.init::browserjs-${version}/unknown/unknown`);
    assert.deepEqual(JSON.parse(configValue), { oM: 1, st: 'pluggable', aF: 1, rF: 0 }, 'There is stored telemetry config');

    // Assert impressionsListener
    setTimeout(() => {
      assert.equal(impressions.length, TOTAL_RAW_IMPRESSIONS + 1 /* One evaluation with impressionsDisabled true */, 'Each evaluation has its corresponding impression');
      assert.equal(impressions[0].impression.label, SDK_NOT_READY, 'The first impression is control with label "sdk not ready"');

      assert.end();
    });
  });

  t.test('Regular usage - OPTIMIZED strategy', async (assert) => {
    const wrapperInstance = inMemoryWrapperFactory();
    // Load wrapper with data to do the proper tests
    await applyOperations(wrapperInstance);

    /** @type SplitIO.ImpressionData[] */
    const impressions = [];
    const disconnectSpy = sinon.spy(wrapperInstance, 'disconnect');

    // Overwrite Math.random to track telemetry
    const originalMathRandom = Math.random; Math.random = () => 0.5;
    const sdk = SplitFactory({
      ...config,
      storage: PluggableStorage({
        prefix: wrapperPrefix,
        wrapper: wrapperInstance
      }),
      sync: {
        impressionsMode: 'OPTIMIZED'
      },
      impressionListener: {
        logImpression(data) { impressions.push(data); }
      }
    });
    Math.random = originalMathRandom; // restore

    const client = sdk.client();
    const otherClient = sdk.client('emi@split.io');

    /** Evaluation and track methods before SDK_READY */

    const getTreatmentResult = client.getTreatment('UT_IN_SEGMENT');

    assert.equal(typeof getTreatmentResult.then, 'function', 'GetTreatment calls should always return a promise on Consumer mode.');
    assert.equal(await getTreatmentResult, 'control', 'Evaluations using pluggable storage should be control if initiated before SDK_READY.');
    assert.equal(client.__getStatus().isReadyFromCache, false, 'SDK in consumer mode is not operational immediately');
    assert.equal(client.__getStatus().isReady, false, 'SDK in consumer mode is not operational immediately');

    const trackResult = otherClient.track('user', 'test.event', 18);
    assert.equal(typeof trackResult.then, 'function', 'Track calls should always return a promise on Consumer mode.');
    assert.true(await trackResult, 'If the wrapper operation success to queue the event, the promise will resolve to true');

    /** Evaluation and track methods on SDK_READY with OPTIMIZED impressions mode */

    await client.ready();
    await otherClient.ready(); // waiting to avoid 'control' with label 'sdk not ready'

    assert.equal(await client.getTreatment('UT_IN_SEGMENT'), 'on', '`getTreatment` evaluation using pluggable storage should be correct.');
    assert.equal((await otherClient.getTreatmentWithConfig('UT_IN_SEGMENT')).treatment, 'off', '`getTreatmentWithConfig` evaluation using pluggable storage should be correct.');

    assert.equal((await client.getTreatments(['UT_NOT_IN_SEGMENT']))['UT_NOT_IN_SEGMENT'], 'off', '`getTreatments` evaluation using pluggable storage should be correct.');
    assert.equal((await otherClient.getTreatmentsWithConfig(['UT_NOT_IN_SEGMENT']))['UT_NOT_IN_SEGMENT'].treatment, 'on', '`getTreatmentsWithConfig` evaluation using pluggable storage should be correct.');

    client.setAttribute('permissions', ['not_matching']);
    assert.equal(await client.getTreatment('UT_SET_MATCHER', {
      permissions: ['admin']
    }), 'on', 'Evaluations using pluggable storage should be correct.');
    client.setAttributes({ permissions: ['admin'] });
    assert.equal(await client.getTreatment('UT_SET_MATCHER', {
      permissions: ['not_matching']
    }), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('UT_SET_MATCHER'), 'on', 'Evaluations using pluggable storage and attributes binding should be correct.');

    client.setAttribute('permissions', ['not_matching']);
    assert.equal(await client.getTreatment('UT_NOT_SET_MATCHER', {
      permissions: ['create']
    }), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('UT_NOT_SET_MATCHER'), 'on', 'Evaluations using pluggable storage should be correct.');
    assert.deepEqual(await client.getTreatmentWithConfig('UT_NOT_SET_MATCHER'), {
      treatment: 'on',
      config: null
    }, 'Evaluations using pluggable storage should be correct, including configs.');
    client.clearAttributes();
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

    // Validate stored impressions and events
    const trackedImpressions = await wrapperInstance.popItems('PLUGGABLE_STORAGE_UT.SPLITIO.impressions', await wrapperInstance.getItemsCount('PLUGGABLE_STORAGE_UT.SPLITIO.impressions'));
    const trackedEvents = await wrapperInstance.popItems('PLUGGABLE_STORAGE_UT.SPLITIO.events', await wrapperInstance.getItemsCount('PLUGGABLE_STORAGE_UT.SPLITIO.events'));
    assert.equal(trackedImpressions.length, TOTAL_RAW_IMPRESSIONS - DEDUPED_IMPRESSIONS, 'Tracked impressions should be present in the external storage');
    assert.equal(trackedEvents.length, TOTAL_EVENTS, 'Tracked events should be present in the external storage');

    // Validate impression counts
    const trackedImpressionCounts = await wrapperInstance.getKeysByPrefix('PLUGGABLE_STORAGE_UT.SPLITIO.impressions.count')
      .then(impressionCountsKeys => Promise.all(impressionCountsKeys.map(key => wrapperInstance.get(key).then(count => ([key, count])))));
    const expectedImpressionCount = [
      [`${wrapperPrefix}.SPLITIO.impressions.count::UT_SET_MATCHER::${truncateTimeFrame(timeFrame)}`, '1'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::UT_NOT_SET_MATCHER::${truncateTimeFrame(timeFrame)}`, '1'],
    ];
    assert.deepEqual(trackedImpressionCounts, expectedImpressionCount, 'Impression counts should be present in the external storage');

    // Assert impressionsListener
    setTimeout(() => {
      assert.equal(impressions.length, TOTAL_RAW_IMPRESSIONS, 'Each evaluation has its corresponding impression');
      assert.equal(impressions[0].impression.label, SDK_NOT_READY, 'The first impression is control with label "sdk not ready"');

      assert.end();
    });
  });

  t.test('Regular usage - NONE strategy', async (assert) => {
    const wrapperInstance = inMemoryWrapperFactory();
    // Load wrapper with data to do the proper tests
    await applyOperations(wrapperInstance);

    /** @type SplitIO.ImpressionData[] */
    const impressions = [];
    const disconnectSpy = sinon.spy(wrapperInstance, 'disconnect');

    // Overwrite Math.random to not track telemetry
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

    /** Evaluation and track methods before SDK_READY */

    const getTreatmentResult = client.getTreatment('UT_IN_SEGMENT');

    assert.equal(typeof getTreatmentResult.then, 'function', 'GetTreatment calls should always return a promise on Consumer mode.');
    assert.equal(await getTreatmentResult, 'control', 'Evaluations using pluggable storage should be control if initiated before SDK_READY.');
    assert.equal(client.__getStatus().isReadyFromCache, false, 'SDK in consumer mode is not operational immediately');
    assert.equal(client.__getStatus().isReady, false, 'SDK in consumer mode is not operational immediately');

    const trackResult = otherClient.track('user', 'test.event', 18);
    assert.equal(typeof trackResult.then, 'function', 'Track calls should always return a promise on Consumer mode.');
    assert.true(await trackResult, 'If the wrapper operation success to queue the event, the promise will resolve to true');

    /** Evaluation and track methods on SDK_READY with OPTIMIZED impressions mode */

    await client.ready();
    await otherClient.ready(); // waiting to avoid 'control' with label 'sdk not ready'

    assert.equal(await client.getTreatment('UT_IN_SEGMENT'), 'on', '`getTreatment` evaluation using pluggable storage should be correct.');
    assert.equal((await otherClient.getTreatmentWithConfig('UT_IN_SEGMENT')).treatment, 'off', '`getTreatmentWithConfig` evaluation using pluggable storage should be correct.');

    assert.equal((await client.getTreatments(['UT_NOT_IN_SEGMENT']))['UT_NOT_IN_SEGMENT'], 'off', '`getTreatments` evaluation using pluggable storage should be correct.');
    assert.equal((await otherClient.getTreatmentsWithConfig(['UT_NOT_IN_SEGMENT']))['UT_NOT_IN_SEGMENT'].treatment, 'on', '`getTreatmentsWithConfig` evaluation using pluggable storage should be correct.');

    client.setAttribute('permissions', ['not_matching']);
    assert.equal(await client.getTreatment('UT_SET_MATCHER', {
      permissions: ['admin']
    }), 'on', 'Evaluations using pluggable storage should be correct.');
    client.setAttributes({ permissions: ['admin'] });
    assert.equal(await client.getTreatment('UT_SET_MATCHER', {
      permissions: ['not_matching']
    }), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('UT_SET_MATCHER'), 'on', 'Evaluations using pluggable storage and attributes binding should be correct.');

    client.setAttribute('permissions', ['not_matching']);
    assert.equal(await client.getTreatment('UT_NOT_SET_MATCHER', {
      permissions: ['create']
    }), 'off', 'Evaluations using pluggable storage should be correct.');
    assert.equal(await client.getTreatment('UT_NOT_SET_MATCHER'), 'on', 'Evaluations using pluggable storage should be correct.');
    assert.deepEqual(await client.getTreatmentWithConfig('UT_NOT_SET_MATCHER'), {
      treatment: 'on',
      config: null
    }, 'Evaluations using pluggable storage should be correct, including configs.');
    client.clearAttributes();
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

    // Validate stored events and no impressions
    const trackedImpressions = await wrapperInstance.popItems('PLUGGABLE_STORAGE_UT.SPLITIO.impressions', await wrapperInstance.getItemsCount('PLUGGABLE_STORAGE_UT.SPLITIO.impressions'));
    const trackedEvents = await wrapperInstance.popItems('PLUGGABLE_STORAGE_UT.SPLITIO.events', await wrapperInstance.getItemsCount('PLUGGABLE_STORAGE_UT.SPLITIO.events'));
    assert.equal(trackedImpressions.length, 0, 'No impressions are tracked in NONE impressions mode');
    assert.equal(trackedEvents.length, TOTAL_EVENTS, 'Tracked events should be present in the external storage');

    // Validate impression counts
    const trackedImpressionCounts = await wrapperInstance.getKeysByPrefix('PLUGGABLE_STORAGE_UT.SPLITIO.impressions.count')
      .then(impressionCountsKeys => Promise.all(impressionCountsKeys.map(key => wrapperInstance.get(key).then(count => ([key, count])))));
    const expectedImpressionCount = [
      [`${wrapperPrefix}.SPLITIO.impressions.count::UT_IN_SEGMENT::${truncateTimeFrame(timeFrame)}`, '5'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::UT_NOT_IN_SEGMENT::${truncateTimeFrame(timeFrame)}`, '2'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::UT_SET_MATCHER::${truncateTimeFrame(timeFrame)}`, '3'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::UT_NOT_SET_MATCHER::${truncateTimeFrame(timeFrame)}`, '3'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::always-o.n-with-config::${truncateTimeFrame(timeFrame)}`, '1'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::always-on::${truncateTimeFrame(timeFrame)}`, '1'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::hierarchical_splits_testing_on::${truncateTimeFrame(timeFrame)}`, '1'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::hierarchical_splits_testing_off::${truncateTimeFrame(timeFrame)}`, '1'],
      [`${wrapperPrefix}.SPLITIO.impressions.count::hierarchical_splits_testing_on_negated::${truncateTimeFrame(timeFrame)}`, '1']
    ];
    assert.deepEqual(trackedImpressionCounts, expectedImpressionCount, 'Impression counts should be present in the external storage');

    // Validate unique keys
    const trackedUniqueKeys = await wrapperInstance.popItems('PLUGGABLE_STORAGE_UT.SPLITIO.uniquekeys', await wrapperInstance.getItemsCount('PLUGGABLE_STORAGE_UT.SPLITIO.uniquekeys'));
    const expectedUniqueKeys = [
      JSON.stringify({ 'f': 'UT_IN_SEGMENT', 'ks': ['UT_Segment_member', 'emi@split.io', 'other'] }),
      JSON.stringify({ 'f': 'UT_NOT_IN_SEGMENT', 'ks': ['UT_Segment_member', 'emi@split.io'] }),
      JSON.stringify({ 'f': 'UT_SET_MATCHER', 'ks': ['UT_Segment_member'] }),
      JSON.stringify({ 'f': 'UT_NOT_SET_MATCHER', 'ks': ['UT_Segment_member'] }),
      JSON.stringify({ 'f': 'always-o.n-with-config', 'ks': ['UT_Segment_member'] }),
      JSON.stringify({ 'f': 'always-on', 'ks': ['UT_Segment_member'] }),
      JSON.stringify({ 'f': 'hierarchical_splits_testing_on', 'ks': ['UT_Segment_member'] }),
      JSON.stringify({ 'f': 'hierarchical_splits_testing_off', 'ks': ['UT_Segment_member'] }),
      JSON.stringify({ 'f': 'hierarchical_splits_testing_on_negated', 'ks': ['UT_Segment_member'] }),
    ];
    assert.deepEqual(trackedUniqueKeys, expectedUniqueKeys);

    // Assert impressionsListener
    setTimeout(() => {
      assert.equal(impressions.length, TOTAL_RAW_IMPRESSIONS, 'Each evaluation has its corresponding impression');
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
      assert.true(await client.track('user', 'test.event', 18), 'If the event was successfully queued the promise will resolve to true');
      assert.false(await client.track(), 'If the event was NOT successfully queued the promise will resolve to false');

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
      assert.equal(impressions.length, 2, 'Each evaluation has its corresponding impression');
      assert.equal(impressions[1].impression.label, EXCEPTION, 'The last impression is control with label "exception"');

      assert.end();
    });

  });

  t.test('Getting treatments with flag sets', async assert => {
    const wrapperInstance = inMemoryWrapperFactory();
    await applyOperations(wrapperInstance, OPERATIONS_FLAG_SETS);

    const sdk = SplitFactory({
      ...config,
      storage: PluggableStorage({
        prefix: wrapperPrefix,
        wrapper: wrapperInstance
      })
    });

    const client = sdk.client();
    const otherClient = sdk.client('emi@split');

    client.getTreatmentsWithConfigByFlagSets('other', ['set_one']).then(result => assert.deepEqual(result, {}, 'Flag sets evaluations using pluggable storage should be empty until connection is ready.'));

    await client.ready();
    await otherClient.ready();

    assert.deepEqual(
      await client.getTreatmentsByFlagSet('set_one'),
      { 'always-on': 'on', 'always-off': 'off' },
      'Evaluations using pluggable storage should be correct for a set.'
    );

    assert.deepEqual(
      await otherClient.getTreatmentsWithConfigByFlagSet('set_one'),
      { 'always-on': { treatment: 'on', config: null }, 'always-off': { treatment: 'off', config: null } },
      'Evaluations with configs using pluggable storage should be correct for a set.'
    );

    assert.deepEqual(
      await client.getTreatmentsByFlagSet('set_two'),
      { 'always-off': 'off', 'nico_not': 'off' },
      'Evaluations using Redipluggables storage should be correct for a set.'
    );

    assert.deepEqual(
      await client.getTreatmentsByFlagSet('set_invalid'),
      {},
      'Evaluations using pluggable storage should properly handle all invalid sets.'
    );

    assert.deepEqual(
      await client.getTreatmentsByFlagSets(['set_two', 'set_one']),
      { 'always-on': 'on', 'always-off': 'off', 'nico_not': 'off' },
      'Evaluations using pluggable storage should be correct for multiple sets.'
    );

    assert.deepEqual(
      await client.getTreatmentsWithConfigByFlagSets(['set_two', 'set_one']),
      { 'always-on': { treatment: 'on', config: null }, 'always-off': { treatment: 'off', config: null }, 'nico_not': { treatment: 'off', config: '{"text":"Gallardiola"}' } },
      'Evaluations with configs using pluggable storage should be correct for multiple sets.'
    );

    assert.deepEqual(
      await client.getTreatmentsByFlagSets([243, null, 'set_two', 'set_one', 'invalid_set']),
      { 'always-on': 'on', 'always-off': 'off', 'nico_not': 'off' },
      'Evaluations using pluggable storage should be correct for multiple sets, discarding invalids.'
    );

    assert.deepEqual(
      await otherClient.getTreatmentsByFlagSets([243, null, 'invalid_set']),
      {},
      'Evaluations using pluggable storage should properly handle all invalid sets.'
    );

    await otherClient.destroy();
    await client.destroy();

    assert.end();
  });
});
