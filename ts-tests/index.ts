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

///<reference types="../types" />
///<reference types="../types/full" />
import { SplitFactory as SplitFactoryFull, InLocalStorage as InLocalStorageFull, GoogleAnalyticsToSplit as GoogleAnalyticsToSplitFull, SplitToGoogleAnalytics as SplitToGoogleAnalyticsFull, DebugLogger as DebugLoggerFull, InfoLogger as InfoLoggerFull, WarnLogger as WarnLoggerFull, ErrorLogger as ErrorLoggerFull, PluggableStorage as PluggableStorageFull } from '@splitsoftware/splitio-browserjs/full';
import { SplitFactory, InLocalStorage, GoogleAnalyticsToSplit, SplitToGoogleAnalytics, DebugLogger, InfoLogger, WarnLogger, ErrorLogger, LocalhostFromObject, PluggableStorage } from '@splitsoftware/splitio-browserjs';

// Entry points must export the same objects
let splitFactory = SplitFactory; splitFactory = SplitFactoryFull;
let inLocalStorage = InLocalStorage; inLocalStorage = InLocalStorageFull;
let gaToSplit = GoogleAnalyticsToSplit; gaToSplit = GoogleAnalyticsToSplitFull;
let splitToGa = SplitToGoogleAnalytics; splitToGa = SplitToGoogleAnalyticsFull;
let pluggableStorage = PluggableStorage; pluggableStorage = PluggableStorageFull;

/**** Interfaces ****/

// Facade return interface
let SDK: SplitIO.ISDK;
let AsyncSDK: SplitIO.IAsyncSDK;
// Settings interfaces
let browserSettings: SplitIO.IBrowserSettings;
let browserAsyncSettings: SplitIO.IBrowserAsyncSettings;
// Client & Manager APIs
let client: SplitIO.IClient;
let manager: SplitIO.IManager;
let asyncClient: SplitIO.IAsyncClient;
let asyncManager: SplitIO.IAsyncManager;

/**** Tests for SDK interface ****/

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
    authorizationKey: 'api-key',
    key: 'customer-key'
  },
  mode: 'consumer',
  storage: PluggableStorage({
    wrapper: {}
  })
};
// With sync settings should return ISDK, if settings have async storage it should return IAsyncSDK
SDK = SplitFactory(browserSettings);
SDK = SplitFactoryFull(browserSettings);
AsyncSDK = SplitFactory(browserAsyncSettings);
AsyncSDK = SplitFactoryFull(browserAsyncSettings);

// Client and Manager
client = SDK.client();
client = SDK.client('a customer key'); // `client = SDK.client('a customer key', 'a traffic type');` Not valid in Browser JS SDK
manager = SDK.manager();

asyncClient = AsyncSDK.client();
asyncClient = AsyncSDK.client('a customer key');
asyncManager = AsyncSDK.manager();

/**** Tests for Client and Manager interfaces ****/

// Client implements methods from IEventEmitter that is a subset of NodeJS.Events. Testing a few.
let splitEvent: SplitIO.Event;
client = client.on(splitEvent, () => { });
const a: boolean = client.emit(splitEvent);
client = client.removeAllListeners(splitEvent);
client = client.removeAllListeners();
// const b: number = client.listenerCount(splitEvent); // Not part of IEventEmitter

// AsyncClient implements methods from IEventEmitter that is a subset of NodeJS.Events. Testing a few.
asyncClient = asyncClient.on(splitEvent, () => { });
const a1: boolean = asyncClient.emit(splitEvent);
asyncClient = asyncClient.removeAllListeners(splitEvent);
asyncClient = asyncClient.removeAllListeners();
// const b1: number = asyncClient.listenerCount(splitEvent); // Not part of IEventEmitter

// Manager implements methods from IEventEmitter that is a subset of NodeJS.Events. Testing a few.
manager = manager.on(splitEvent, () => { });
const aa: boolean = manager.emit(splitEvent);
manager = manager.removeAllListeners(splitEvent);
manager = manager.removeAllListeners();
// const bb: number = manager.listenerCount(splitEvent); // Not part of IEventEmitter

// asyncManager implements methods from IEventEmitter that is a subset of NodeJS.Events. Testing a few.
asyncManager = asyncManager.on(splitEvent, () => { });
const aaa: boolean = asyncManager.emit(splitEvent);
asyncManager = asyncManager.removeAllListeners(splitEvent);
asyncManager = asyncManager.removeAllListeners();
// const bbb: number = asyncManager.listenerCount(splitEvent); // Not part of IEventEmitter

/**** Tests for fully crowded settings interfaces ****/

// Config parameters
let syncStorage: SplitIO.StorageSync;
let syncStorageFactory: SplitIO.StorageSyncFactory = InLocalStorage();
let localStorageOptions: SplitIO.InLocalStorageOptions = {
  prefix: 'PREFIX'
};
syncStorageFactory = InLocalStorage(localStorageOptions);
let impressionListener: SplitIO.IImpressionListener;
let splitFilters: SplitIO.SplitFilter[] = [{ type: 'byName', values: ['my_split_1', 'my_split_1'] }, { type: 'byPrefix', values: ['my_split', 'test_split_'] }]

// Browser integrations
let fieldsObjectSample: UniversalAnalytics.FieldsObject = { hitType: 'event', eventAction: 'action' };
let eventDataSample: SplitIO.EventData = { eventTypeId: 'someEventTypeId', value: 10, properties: {} };

let minimalGoogleAnalyticsToSplitConfig: SplitIO.GoogleAnalyticsToSplitOptions = { identities: [{ key: 'user', trafficType: 'tt' }] };
let emptySplitToGoogleAnalyticsConfig: SplitIO.SplitToGoogleAnalyticsOptions = {};

let customGoogleAnalyticsToSplitConfig: SplitIO.GoogleAnalyticsToSplitOptions = {
  hits: false,
  filter: function (model: UniversalAnalytics.Model): boolean { return true; },
  mapper: function (model: UniversalAnalytics.Model, defaultMapping: SplitIO.EventData): SplitIO.EventData { return eventDataSample; },
  prefix: 'PREFIX',
  identities: [{ key: 'key1', trafficType: 'tt1' }, { key: 'key2', trafficType: 'tt2' }],
  autoRequire: true
};
let customSplitToGoogleAnalyticsConfig: SplitIO.SplitToGoogleAnalyticsOptions = {
  events: false,
  impressions: true,
  filter: function (model: SplitIO.IntegrationData): boolean { return true; },
  mapper: function (model: SplitIO.IntegrationData, defaultMapping: UniversalAnalytics.FieldsObject): UniversalAnalytics.FieldsObject { return fieldsObjectSample; },
  trackerNames: ['t0', 'myTracker'],
}

let fullBrowserSettings: SplitIO.IBrowserSettings = {
  core: {
    authorizationKey: 'api-key',
    key: 'some-key',
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
  features: { 'feature_1': 'treatment' },
  storage: syncStorageFactory,
  impressionListener: impressionListener,
  debug: true,
  integrations: [
    GoogleAnalyticsToSplit(), SplitToGoogleAnalytics(),
    GoogleAnalyticsToSplit(minimalGoogleAnalyticsToSplitConfig), SplitToGoogleAnalytics(emptySplitToGoogleAnalyticsConfig),
    GoogleAnalyticsToSplit(customGoogleAnalyticsToSplitConfig), SplitToGoogleAnalytics(customSplitToGoogleAnalyticsConfig)
  ],
  streamingEnabled: true,
  sync: {
    splitFilters: splitFilters,
    impressionsMode: 'DEBUG',
    localhostMode: LocalhostFromObject(),
    enabled: true
  },
  userConsent: 'GRANTED'
};
fullBrowserSettings.userConsent = 'DECLINED';
fullBrowserSettings.userConsent = 'UNKNOWN';

let fullBrowserAsyncSettings: SplitIO.IBrowserAsyncSettings = {
  mode: 'consumer',
  core: {
    authorizationKey: 'api-key',
    key: 'some-key',
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
  streamingEnabled: true,
  sync: {
    impressionsMode: 'DEBUG',
    enabled: true
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
