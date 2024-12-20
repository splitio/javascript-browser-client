/**
 * Split software typescript declarations testing.
 *
 * This file is not meant to run but to be compiled without errors. This is the same way to test .d.ts files
 * that you will need to comply to publish packages on @types organization on NPM (DefinitelyTyped).
 * We import the declarations through the NPM package name (using the development branch of the repo)
 * to test in the same way in which customers will be using it on development.
 *
 * The step of compiling this file is part of the continous integration systems in place.
 *
 * @author Nico Zelaya <nicolas.zelaya@split.io>
 */

import type * as SplitTypes from '../types/splitio';

import { SplitFactory as SplitFactoryFull, InLocalStorage as InLocalStorageFull, DebugLogger as DebugLoggerFull, InfoLogger as InfoLoggerFull, WarnLogger as WarnLoggerFull, ErrorLogger as ErrorLoggerFull, PluggableStorage as PluggableStorageFull } from '../types/full';
import { SplitFactory, InLocalStorage, DebugLogger, InfoLogger, WarnLogger, ErrorLogger, PluggableStorage } from '../types/index';

// Entry points must export the same objects
let splitFactory = SplitFactory; splitFactory = SplitFactoryFull;
let inLocalStorage = InLocalStorage; inLocalStorage = InLocalStorageFull;
let pluggableStorage = PluggableStorage; pluggableStorage = PluggableStorageFull;

// Validate that the SplitIO namespace is available and matches the types when imported explicitly
let ambientType: SplitIO.ISDK;
let importedType: SplitTypes.ISDK;
ambientType = importedType;

let stringPromise: Promise<string>;
let splitNamesPromise: Promise<SplitIO.SplitNames>;
let splitViewPromise: Promise<SplitIO.SplitView>;
let splitViewsPromise: Promise<SplitIO.SplitViews>;
let treatmentsPromise: Promise<SplitIO.Treatments>;
let treatmentWithConfigPromise: Promise<SplitIO.TreatmentWithConfig>;
let treatmentsWithConfigPromise: Promise<SplitIO.TreatmentsWithConfig>;
let trackPromise: Promise<boolean>;

/**** Interfaces ****/

// Facade return interface
// let SDK: SplitIO.ISDK;
let AsyncSDK: SplitIO.IBrowserAsyncSDK;
let SDK: SplitIO.IBrowserSDK;
// Settings interfaces
// let nodeSettings: SplitIO.INodeSettings;
// let asyncSettings: SplitIO.INodeAsyncSettings;
let browserSettings: SplitIO.IClientSideSettings;
let browserAsyncSettings: SplitIO.IClientSideAsyncSettings;
// Client & Manager APIs
// let client: SplitIO.IClient;
let client: SplitIO.IBrowserClient;
let manager: SplitIO.IManager;
let asyncClient: SplitIO.IBrowserAsyncClient;
let asyncManager: SplitIO.IAsyncManager;
// Utility interfaces
let impressionListener: SplitIO.IImpressionListener;

/**** Custom Types ****/

// Common
let treatment: SplitIO.Treatment = 'on';
let treatmentWithConfig: SplitIO.TreatmentWithConfig = {
  treatment: 'control',
  config: null
};
treatmentWithConfig = { treatment: 'off', config: '{}' };
let asyncTreatment: SplitIO.AsyncTreatment = stringPromise;
let asyncTreatmentWithConfig: SplitIO.AsyncTreatmentWithConfig = treatmentWithConfigPromise;
let tracked: boolean;
let treatmentsMap: SplitIO.Treatments = {
  feature1: 'on',
  feature2: 'control'
};
let treatmentsWithConfigMap: SplitIO.TreatmentsWithConfig = {
  feature1: { treatment: 'control', config: null },
  feature2: { treatment: 'off', config: '{"color":"blue"}' }
};
let treatments: SplitIO.Treatments = treatmentsMap;
let treatmentsWithConfig: SplitIO.TreatmentsWithConfig = treatmentsWithConfigMap;
let asyncTreatments: SplitIO.AsyncTreatments = treatmentsPromise;
let asyncTreatmentsWithConfig: SplitIO.AsyncTreatmentsWithConfig = treatmentsWithConfigPromise;
let splitEvent: SplitIO.Event;
const attributes: SplitIO.Attributes = {
  attr1: 1,
  attr2: '2',
  attr3: Date.now(),
  attr4: ['str1', 2],
  attr5: ['str1', 'str2'],
  attr6: [1, 2],
  attr7: true
};
// const splitKeyObj: SplitIO.SplitKeyObject = {
//   matchingKey: 'matchingKey',
//   bucketingKey: 'bucketingKey'
// };
let splitKey: SplitIO.SplitKey;
// Mocks
// let mockedFeaturesPath: SplitIO.MockedFeaturesFilePath;
let mockedFeaturesMap: SplitIO.MockedFeaturesMap;
// Split Data
let splitView: SplitIO.SplitView;
let splitViews: SplitIO.SplitViews;
let splitNames: SplitIO.SplitNames;
let splitNamesAsync: SplitIO.SplitNamesAsync;
let splitViewAsync: SplitIO.SplitViewAsync;
let splitViewsAsync: SplitIO.SplitViewsAsync;
// Impression data
let impressionData: SplitIO.ImpressionData;
// Storages
let syncStorage: SplitIO.StorageSync;
let syncStorageFactory: SplitIO.StorageSyncFactory = InLocalStorage();
let localStorageOptions: SplitIO.InLocalStorageOptions = {
  prefix: 'PREFIX',
  expirationDays: 1,
  clearOnInit: true
};
syncStorageFactory = InLocalStorage(localStorageOptions);

// mockedFeaturesPath = 'path/to/file';
mockedFeaturesMap = {
  feature1: 'treatment',
  feature2: { treatment: 'treatment2', config: "{ 'prop': 'value'}" },
  feature3: { treatment: 'treatment3', config: null }
};

// Treatment can be the string or the promise which will resolve to treatment string
treatment = 'some treatment';  // Sync case
asyncTreatment = stringPromise;  // Async case

// Treatments can be the object or the promise which will resolve to treatments object
treatments = {
  someFeature: 'treatment'
}; // Sync
asyncTreatments = treatmentsPromise;  // Async

// SplitViews can be the SplitViewData or the promise which will resolve to SplitViewData obj
splitView = {
  name: 'asd',
  killed: false,
  trafficType: 'user',
  treatments: ['on', 'off'],
  changeNumber: 18294,
  configs: {
    off: '{"dimensions":"{\"height\":20,\"width\":40}"}'
  },
  sets: ['set_a', 'set_b'],
  defaultTreatment: 'off'
};
splitViews = [splitView];

splitViewAsync = splitViewPromise;
splitNamesAsync = splitNamesPromise;
splitViewsAsync = splitViewsPromise;

// Split key can be a string
splitKey = 'someKey';
// splitKey = splitKeyObj;

/**** Tests for ISDK interface ****/

// // For Node.js with sync storage
// nodeSettings = {
//   core: {
//     authorizationKey: 'key'
//   }
// };
// // For Node.js with async storage
// asyncSettings = {
//   core: {
//     authorizationKey: 'key'
//   },
//   storage: {
//     type: 'REDIS'
//   }
// };
// For browser
browserSettings = {
  core: {
    authorizationKey: 'another-key',
    key: 'customer-key'
  }
};
// For browser with async storage
browserAsyncSettings = {
  core: {
    authorizationKey: 'sdk-key',
    key: 'customer-key'
  },
  mode: 'consumer',
  storage: PluggableStorage({
    wrapper: {}
  })
};
// With sync settings should return IBrowserSDK, if settings have async storage it should return IBrowserAsyncSDK
SDK = SplitFactory(browserSettings);
AsyncSDK = SplitFactory(browserAsyncSettings);
// SDK = SplitFactory(nodeSettings);
// AsyncSDK = SplitFactory(asyncSettings);

// The settings values the SDK expose.
const instantiatedSettingsCore: {
  authorizationKey: string,
  key: SplitIO.SplitKey,
  trafficType?: string,
  labelsEnabled: boolean,
  IPAddressesEnabled: boolean
} = SDK.settings.core;
// const instantiatedSettingsMode: ('standalone' | 'consumer') = SDK.settings.mode;
const instantiatedSettingsScheduler: { [key: string]: number } = SDK.settings.scheduler;
const instantiatedSettingsStartup: { [key: string]: number } = SDK.settings.startup;
const instantiatedStorage: SplitIO.StorageSync = SDK.settings.storage;
const instantiatedSettingsUrls: { [key: string]: string } = SDK.settings.urls;
const instantiatedSettingsVersion: string = SDK.settings.version;
let instantiatedSettingsFeatures = SDK.settings.features as SplitIO.MockedFeaturesMap;
// We should be able to write on features prop. The rest are readonly props.
instantiatedSettingsFeatures.something = 'something';
SDK.settings.features = { 'split_x': 'on' };

// Client and Manager
client = SDK.client();
client = SDK.client('a customer key');
manager = SDK.manager();
asyncClient = AsyncSDK.client();
asyncManager = AsyncSDK.manager();

// Logger
SDK.Logger.enable();
SDK.Logger.setLogLevel(SDK.Logger.LogLevel.DEBUG);
SDK.Logger.setLogLevel(SDK.Logger.LogLevel.INFO);
SDK.Logger.setLogLevel(SDK.Logger.LogLevel.WARN);
SDK.Logger.setLogLevel(SDK.Logger.LogLevel.ERROR);
SDK.Logger.setLogLevel(SDK.Logger.LogLevel.NONE);
SDK.Logger.disable();

AsyncSDK.Logger.enable();
AsyncSDK.Logger.setLogLevel(AsyncSDK.Logger.LogLevel.DEBUG);
AsyncSDK.Logger.setLogLevel(AsyncSDK.Logger.LogLevel.INFO);
AsyncSDK.Logger.setLogLevel(AsyncSDK.Logger.LogLevel.WARN);
AsyncSDK.Logger.setLogLevel(AsyncSDK.Logger.LogLevel.ERROR);
AsyncSDK.Logger.setLogLevel(AsyncSDK.Logger.LogLevel.NONE);
AsyncSDK.Logger.disable();

/**** Tests for IClient interface ****/

// Events constants we get
const eventConsts: { [key: string]: SplitIO.Event } = client.Event;
splitEvent = client.Event.SDK_READY;
splitEvent = client.Event.SDK_READY_FROM_CACHE;
splitEvent = client.Event.SDK_READY_TIMED_OUT;
splitEvent = client.Event.SDK_UPDATE;

// Client implements methods from IEventEmitter that is a subset of Node.js EventEmitter. Testing a few.
client = client.on(splitEvent, () => { });
const a: boolean = client.emit(splitEvent);
client = client.removeAllListeners(splitEvent);
client = client.removeAllListeners();
// const b: number = client.listenerCount(splitEvent); // Not part of IEventEmitter

// Ready and destroy
let promise: Promise<void> = client.ready();
promise = client.destroy();
promise = SDK.destroy();
// @TODO not public yet
// promise = client.flush();

// We can call getTreatment without a key.
// treatment = client.getTreatment(splitKey, 'mySplit');
treatment = client.getTreatment('mySplit');
// Attributes parameter is optional.
// treatment = client.getTreatment(splitKey, 'mySplit', attributes);
treatment = client.getTreatment('mySplit', attributes);

// We can call getTreatments without a key.
// treatments = client.getTreatments(splitKey, ['mySplit']);
treatments = client.getTreatments(['mySplit']);
// Attributes parameter is optional.
// treatments = client.getTreatments(splitKey, ['mySplit'], attributes);
treatments = client.getTreatments(['mySplit'], attributes);

// We can call getTreatmentWithConfig without a key.
// treatmentWithConfig = client.getTreatmentWithConfig(splitKey, 'mySplit');
treatmentWithConfig = client.getTreatmentWithConfig('mySplit');
// Attributes parameter is optional.
// treatmentWithConfig = client.getTreatmentWithConfig(splitKey, 'mySplit', attributes);
treatmentWithConfig = client.getTreatmentWithConfig('mySplit', attributes);

// We can call getTreatmentsWithConfig without a key.
// treatmentsWithConfig = client.getTreatmentsWithConfig(splitKey, ['mySplit']);
treatmentsWithConfig = client.getTreatmentsWithConfig(['mySplit']);
// Attributes parameter is optional.
// treatmentsWithConfig = client.getTreatmentsWithConfig(splitKey, ['mySplit'], attributes);
treatmentsWithConfig = client.getTreatmentsWithConfig(['mySplit'], attributes);

// We can call getTreatmentsByFlagSet without a key.
// treatments = client.getTreatmentsByFlagSet(splitKey, 'set_a');
treatments = client.getTreatmentsByFlagSet('set_a');
// Attributes parameter is optional.
// treatments = client.getTreatmentsByFlagSet(splitKey, 'set_a', attributes);
treatments = client.getTreatmentsByFlagSet('set_a', attributes);

// We can call getTreatmentsByFlagSets without a key.
// treatments = client.getTreatmentsByFlagSets(splitKey, ['set_a']);
treatments = client.getTreatmentsByFlagSets(['set_a']);
// Attributes parameter is optional.
// treatments = client.getTreatmentsByFlagSets(splitKey, ['set_a'], attributes);
treatments = client.getTreatmentsByFlagSets(['set_a'], attributes);

// We can call getTreatmentsWithConfigByFlagSet without a key.
// treatmentsWithConfig = client.getTreatmentsWithConfigByFlagSet(splitKey, 'set_a');
treatmentsWithConfig = client.getTreatmentsWithConfigByFlagSet('set_a');
// Attributes parameter is optional.
// treatmentsWithConfig = client.getTreatmentsWithConfigByFlagSet(splitKey, 'set_a', attributes);
treatmentsWithConfig = client.getTreatmentsWithConfigByFlagSet('set_a', attributes);

// We can call getTreatmentsWithConfigByFlagSets without a key.
// treatmentsWithConfig = client.getTreatmentsWithConfigByFlagSets(splitKey, ['set_a']);
treatmentsWithConfig = client.getTreatmentsWithConfigByFlagSets(['set_a']);
// Attributes parameter is optional.
// treatmentsWithConfig = client.getTreatmentsWithConfigByFlagSets(splitKey, ['set_a'], attributes);
treatmentsWithConfig = client.getTreatmentsWithConfigByFlagSets(['set_a'], attributes);

// We can call track without a key. Traffic type can also be binded to the client.
// tracked = client.track(splitKey, 'myTrafficType', 'myEventType'); // all params
tracked = client.track('myTrafficType', 'myEventType'); // key binded, tt provided.
// tracked = client.track('myEventType'); // key and tt binded. Not valid in Browser JS SDK
// Value parameter is optional on all signatures.
// tracked = client.track(splitKey, 'myTrafficType', 'myEventType', 10);
tracked = client.track('myTrafficType', 'myEventType', 10);
// tracked = client.track('myEventType', 10); // Not valid in Browser JS SDK
// Properties parameter is optional on all signatures.
// tracked = client.track(splitKey, 'myTrafficType', 'myEventType', 10, { prop1: 1, prop2: '2', prop3: false, prop4: null });
tracked = client.track('myTrafficType', 'myEventType', null, { prop1: 1, prop2: '2', prop3: false, prop4: null });
// tracked = client.track('myEventType', undefined, { prop1: 1, prop2: '2', prop3: false, prop4: null }); // Not valid in Browser JS SDK

/*** Repeating tests for Async Client ***/

// Events constants we get (same as for sync client, just for interface checking)
const eventConstsAsync: { [key: string]: SplitIO.Event } = asyncClient.Event;
splitEvent = asyncClient.Event.SDK_READY;
splitEvent = asyncClient.Event.SDK_READY_FROM_CACHE;
splitEvent = asyncClient.Event.SDK_READY_TIMED_OUT;
splitEvent = asyncClient.Event.SDK_UPDATE;

// Client implements methods from Node.js EventEmitter. (same as for sync client, just for interface checking)
asyncClient = asyncClient.on(splitEvent, () => { });
const a1: boolean = asyncClient.emit(splitEvent);
asyncClient = asyncClient.removeAllListeners(splitEvent);
asyncClient = asyncClient.removeAllListeners();
// const b1: number = asyncClient.listenerCount(splitEvent); // Not part of IEventEmitter

// Ready and destroy (same as for sync client, just for interface checking)
promise = asyncClient.ready();
promise = asyncClient.destroy();
promise = AsyncSDK.destroy();

// We can call getTreatment
asyncTreatment = asyncClient.getTreatment('mySplit');
// asyncTreatment = asyncClient.getTreatment(splitKey, 'mySplit');
// Attributes parameter is optional
asyncTreatment = asyncClient.getTreatment('mySplit', attributes);
// asyncTreatment = asyncClient.getTreatment(splitKey, 'mySplit', attributes);

// We can call getTreatments
asyncTreatments = asyncClient.getTreatments(['mySplit']);
// asyncTreatments = asyncClient.getTreatments(splitKey, ['mySplit']);
// Attributes parameter is optional
asyncTreatments = asyncClient.getTreatments(['mySplit'], attributes);
// asyncTreatments = asyncClient.getTreatments(splitKey, ['mySplit'], attributes);

// We can call getTreatmentWithConfig
asyncTreatmentWithConfig = asyncClient.getTreatmentWithConfig('mySplit');
// asyncTreatmentWithConfig = asyncClient.getTreatmentWithConfig(splitKey, 'mySplit');
// Attributes parameter is optional
asyncTreatmentWithConfig = asyncClient.getTreatmentWithConfig('mySplit', attributes);
// asyncTreatmentWithConfig = asyncClient.getTreatmentWithConfig(splitKey, 'mySplit', attributes);

// We can call getTreatments but always with a key.
asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfig(['mySplit']);
// asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfig(splitKey, ['mySplit']);
// Attributes parameter is optional
asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfig(['mySplit'], attributes);
// asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfig(splitKey, ['mySplit'], attributes);

// We can call getTreatmentsByFlagSet
asyncTreatments = asyncClient.getTreatmentsByFlagSet('set_a');
// asyncTreatments = asyncClient.getTreatmentsByFlagSet(splitKey, 'set_a');
// Attributes parameter is optional
asyncTreatments = asyncClient.getTreatmentsByFlagSet('set_a', attributes);
// asyncTreatments = asyncClient.getTreatmentsByFlagSet(splitKey, 'set_a', attributes);

// We can call getTreatmentsByFlagSets
asyncTreatments = asyncClient.getTreatmentsByFlagSets(['set_a']);
// asyncTreatments = asyncClient.getTreatmentsByFlagSets(splitKey, ['set_a']);
// Attributes parameter is optional
asyncTreatments = asyncClient.getTreatmentsByFlagSets(['set_a'], attributes);
// asyncTreatments = asyncClient.getTreatmentsByFlagSets(splitKey, ['set_a'], attributes);

// We can call getTreatmentsWithConfigByFlagSet
asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfigByFlagSet('set_a');
// asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfigByFlagSet(splitKey, 'set_a');
// Attributes parameter is optional
asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfigByFlagSet('set_a', attributes);
// asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfigByFlagSet(splitKey, 'set_a', attributes);

// We can call getTreatmentsByFlagSets but always with a key.
asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfigByFlagSets(['set_a']);
// asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfigByFlagSets(splitKey, ['set_a']);
// Attributes parameter is optional
asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfigByFlagSets(['set_a'], attributes);
// asyncTreatmentsWithConfig = asyncClient.getTreatmentsWithConfigByFlagSets(splitKey, ['set_a'], attributes);

// We can call track.
trackPromise = asyncClient.track('myTrafficType', 'myEventType'); // all required params
// trackPromise = asyncClient.track(splitKey, 'myTrafficType', 'myEventType'); // all required params
// Value parameter is optional.
trackPromise = asyncClient.track('myTrafficType', 'myEventType', 10);
// trackPromise = asyncClient.track(splitKey, 'myTrafficType', 'myEventType', 10);
// Properties parameter is optional
trackPromise = asyncClient.track('myTrafficType', 'myEventType', 10, { prop1: 1, prop2: '2', prop3: true, prop4: null });
// trackPromise = asyncClient.track(splitKey, 'myTrafficType', 'myEventType', 10, { prop1: 1, prop2: '2', prop3: true, prop4: null });

/**** Tests for IManager interface ****/

splitNames = manager.names();
splitView = manager.split('mySplit');
splitViews = manager.splits();

// Manager implements ready promise.
promise = manager.ready();

// Manager implements methods from Node.js EventEmitter. Testing a few.
manager = manager.on(splitEvent, () => { });
const aa: boolean = manager.emit(splitEvent);
manager = manager.removeAllListeners(splitEvent);
manager = manager.removeAllListeners();
// const bb: number = manager.listenerCount(splitEvent); // Not part of IEventEmitter

// manager exposes Event constants too
const managerEventConsts: { [key: string]: SplitIO.Event } = manager.Event;
splitEvent = manager.Event.SDK_READY;
splitEvent = manager.Event.SDK_READY_FROM_CACHE;
splitEvent = manager.Event.SDK_READY_TIMED_OUT;
splitEvent = manager.Event.SDK_UPDATE;

/*** Repeating tests for Async Manager ***/

splitNamesAsync = asyncManager.names();
splitViewAsync = asyncManager.split('mySplit');
splitViewsAsync = asyncManager.splits();

// asyncManager implements ready promise.
promise = asyncManager.ready();

// asyncManager implements methods from Node.js EventEmitter. Testing a few.
asyncManager = asyncManager.on(splitEvent, () => { });
const aaa: boolean = asyncManager.emit(splitEvent);
asyncManager = asyncManager.removeAllListeners(splitEvent);
asyncManager = asyncManager.removeAllListeners();
// const bbb: number = asyncManager.listenerCount(splitEvent); // Not part of IEventEmitter

// asyncManager exposes Event constants too
const asyncManagerEventConsts: { [key: string]: SplitIO.Event } = asyncManager.Event;
splitEvent = asyncManager.Event.SDK_READY;
splitEvent = asyncManager.Event.SDK_READY_FROM_CACHE;
splitEvent = asyncManager.Event.SDK_READY_TIMED_OUT;
splitEvent = asyncManager.Event.SDK_UPDATE;

/*** Tests for IImpressionListener interface ***/
class MyImprListener implements SplitIO.IImpressionListener {
  logImpression(data: SplitIO.ImpressionData) {
    impressionData = data;
  }
}

const MyImprListenerMap: SplitIO.IImpressionListener = {
  logImpression: (data: SplitIO.ImpressionData) => {
    impressionData = data;
  }
};

impressionListener = MyImprListenerMap;
impressionListener = new MyImprListener();
impressionListener.logImpression(impressionData);

/**** Tests for attribute binding ****/
let stored: boolean = client.setAttribute('stringAttribute', 'value');
stored = client.setAttribute('numberAttribtue', 1);
stored = client.setAttribute('booleanAttribute', true);
stored = client.setAttribute('stringArrayAttribute', ['value1', 'value2']);
stored = client.setAttribute('numberArrayAttribute', [1, 2]);

let storedAttributeValue: SplitIO.AttributeType = client.getAttribute('stringAttribute');
storedAttributeValue = client.getAttribute('numberAttribute');
storedAttributeValue = client.getAttribute('booleanAttribute');
storedAttributeValue = client.getAttribute('stringArrayAttribute');
storedAttributeValue = client.getAttribute('numberArrayAttribute');

let removed: boolean = client.removeAttribute('numberAttribute');
removed = client.clearAttributes();

let attr: SplitIO.Attributes = {
  stringAttribute: 'value',
  numberAttribute: 1,
  booleanAttribute: true,
  stringArrayAttribute: ['value1', 'value2'],
  numberArrayAttribute: [1, 2]
};

stored = client.setAttributes(attr);
let storedAttr: SplitIO.Attributes = client.getAttributes();
removed = client.clearAttributes();

/**** Tests for user consent API ****/

let userConsent: SplitIO.ConsentStatus;
userConsent = SDK.UserConsent.getStatus();
SDK.UserConsent.setStatus(true);
SDK.UserConsent.setStatus(false);

userConsent = AsyncSDK.UserConsent.getStatus();
AsyncSDK.UserConsent.setStatus(true);
AsyncSDK.UserConsent.setStatus(false);

userConsent = SDK.UserConsent.Status.DECLINED;
userConsent = SDK.UserConsent.Status.GRANTED;
userConsent = AsyncSDK.UserConsent.Status.UNKNOWN;

/**** Tests for fully crowded settings interfaces ****/

// Split filters
let splitFilters: SplitIO.SplitFilter[] = [{ type: 'bySet', values: ['set_a', 'set_b'] }, { type: 'byName', values: ['my_split_1', 'my_split_1'] }, { type: 'byPrefix', values: ['my_split', 'test_split_'] }]

let fullBrowserSettings: SplitIO.IClientSideSettings = {
  core: {
    authorizationKey: 'asd',
    key: 'asd',
    // trafficType: 'myTT', // Not valid in Browser JS SDK
    labelsEnabled: false
  },
  scheduler: {
    featuresRefreshRate: 1,
    impressionsRefreshRate: 1,
    impressionsQueueSize: 1,
    telemetryRefreshRate: 1,
    segmentsRefreshRate: 1,
    offlineRefreshRate: 1,
    eventsPushRate: 1,
    eventsQueueSize: 1,
    pushRetryBackoffBase: 1,
  },
  startup: {
    readyTimeout: 1,
    requestTimeoutBeforeReady: 1,
    retriesOnFailureBeforeReady: 1,
    eventsFirstPushWindow: 1
  },
  urls: {
    sdk: 'https://asd.com/sdk',
    events: 'https://asd.com/events',
    auth: 'https://asd.com/auth',
    streaming: 'https://asd.com/streaming',
    telemetry: 'https://asd.com/telemetry'
  },
  features: mockedFeaturesMap,
  storage: syncStorageFactory,
  impressionListener: impressionListener,
  debug: true,
  integrations: [],
  streamingEnabled: true,
  sync: {
    splitFilters: splitFilters,
    impressionsMode: 'DEBUG',
    enabled: true,
    requestOptions: {
      getHeaderOverrides(context) { return { ...context.headers, 'header': 'value' }; },
    }
  },
  userConsent: 'GRANTED'
};
fullBrowserSettings.userConsent = 'DECLINED';
fullBrowserSettings.userConsent = 'UNKNOWN';

let fullBrowserAsyncSettings: SplitIO.IClientSideAsyncSettings = {
  mode: 'consumer',
  core: {
    authorizationKey: 'asd',
    key: 'asd',
    // trafficType: 'myTT', // Not valid in Browser JS SDK
    labelsEnabled: false
  },
  scheduler: {
    impressionsRefreshRate: 1,
    impressionsQueueSize: 1,
    telemetryRefreshRate: 1,
    eventsPushRate: 1,
    eventsQueueSize: 1,
  },
  startup: {
    readyTimeout: 1,
    eventsFirstPushWindow: 1
  },
  urls: {
    sdk: 'https://asd.com/sdk',
    events: 'https://asd.com/events',
    auth: 'https://asd.com/auth',
    streaming: 'https://asd.com/streaming',
    telemetry: 'https://asd.com/telemetry'
  },
  storage: PluggableStorage({
    prefix: 'MY_PREFIX',
    wrapper: {}
  }),
  impressionListener: impressionListener,
  debug: true,
  integrations: [],
  sync: {
    impressionsMode: 'DEBUG',
    requestOptions: {
      getHeaderOverrides(context) { return { ...context.headers, 'header': 'value' }; },
    }
  },
  userConsent: 'GRANTED'
};
fullBrowserAsyncSettings.mode = 'consumer_partial';
fullBrowserAsyncSettings.userConsent = 'DECLINED';
fullBrowserAsyncSettings.userConsent = 'UNKNOWN';

// debug property can be a log level or Logger instance
fullBrowserSettings.debug = 'ERROR';
fullBrowserSettings.debug = DebugLogger();
fullBrowserSettings.debug = InfoLogger();
fullBrowserSettings.debug = WarnLogger();
fullBrowserSettings.debug = ErrorLogger();
fullBrowserSettings.debug = DebugLoggerFull();
fullBrowserSettings.debug = InfoLoggerFull();
fullBrowserSettings.debug = WarnLoggerFull();
fullBrowserSettings.debug = ErrorLoggerFull();

// let fullNodeSettings: SplitIO.INodeSettings = {
//   core: {
//     authorizationKey: 'asd',
//     labelsEnabled: false,
//     IPAddressesEnabled: false
//   },
//   scheduler: {
//     featuresRefreshRate: 1,
//     impressionsRefreshRate: 1,
//     metricsRefreshRate: 1,
//     segmentsRefreshRate: 1,
//     offlineRefreshRate: 1,
//     eventsPushRate: 1,
//     eventsQueueSize: 1,
//     pushRetryBackoffBase: 1
//   },
//   startup: {
//     readyTimeout: 1,
//     requestTimeoutBeforeReady: 1,
//     retriesOnFailureBeforeReady: 1,
//     eventsFirstPushWindow: 1
//   },
//   urls: {
//     sdk: 'https://asd.com/sdk',
//     events: 'https://asd.com/events',
//     auth: 'https://asd.com/auth',
//     streaming: 'https://asd.com/streaming'
//   },
//   features: mockedFeaturesPath,
//   storage: {
//     type: 'MEMORY'
//   },
//   impressionListener: impressionListener,
//   mode: 'standalone',
//   debug: false,
//   streamingEnabled: false,
//   sync: {
//     splitFilters: splitFilters,
//     impressionsMode: 'OPTIMIZED'
//   }
// };
// fullNodeSettings.storage.type = 'MEMORY';
// fullNodeSettings.mode = 'consumer';

// let fullAsyncSettings: SplitIO.INodeAsyncSettings = {
//   core: {
//     authorizationKey: 'asd',
//     labelsEnabled: false,
//     IPAddressesEnabled: false
//   },
//   scheduler: {
//     featuresRefreshRate: 1,
//     impressionsRefreshRate: 1,
//     metricsRefreshRate: 1,
//     segmentsRefreshRate: 1,
//     offlineRefreshRate: 1,
//     eventsPushRate: 1,
//     eventsQueueSize: 1
//   },
//   startup: {
//     readyTimeout: 1,
//     requestTimeoutBeforeReady: 1,
//     retriesOnFailureBeforeReady: 1
//   },
//   features: mockedFeaturesPath,
//   storage: {
//     type: 'REDIS',
//     options: {
//       opt1: 'whatever'
//     },
//     prefix: 'PREFIX'
//   },
//   impressionListener: impressionListener,
//   mode: 'standalone',
//   debug: true,
//   sync: {
//     splitFilters: splitFilters
//   }
// };
