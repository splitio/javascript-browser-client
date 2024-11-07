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

import { SplitFactory as SplitFactoryFull, InLocalStorage as InLocalStorageFull, DebugLogger as DebugLoggerFull, InfoLogger as InfoLoggerFull, WarnLogger as WarnLoggerFull, ErrorLogger as ErrorLoggerFull, PluggableStorage as PluggableStorageFull } from '../types/full';
import { SplitFactory, InLocalStorage, DebugLogger, InfoLogger, WarnLogger, ErrorLogger, PluggableStorage } from '../types/index';

// Entry points must export the same objects
let splitFactory = SplitFactory; splitFactory = SplitFactoryFull;
let inLocalStorage = InLocalStorage; inLocalStorage = InLocalStorageFull;
let pluggableStorage = PluggableStorage; pluggableStorage = PluggableStorageFull;

/**** Interfaces ****/

// Facade return interface
let AsyncSDK: SplitIO.IBrowserAsyncSDK;
let SDK: SplitIO.IBrowserSDK;
// Settings interfaces
let browserSettings: SplitIO.IClientSideSettings;
let browserAsyncSettings: SplitIO.IClientSideAsyncSettings;
// Client & Manager APIs
let client: SplitIO.IBrowserClient;
let manager: SplitIO.IManager;
let asyncClient: SplitIO.IBrowserAsyncClient;
let asyncManager: SplitIO.IAsyncManager;
// Utility interfaces
let impressionListener: SplitIO.IImpressionListener;
// Mocks
let mockedFeaturesMap: SplitIO.MockedFeaturesMap;
// Impression data
let impressionData: SplitIO.ImpressionData;
// Storages
let syncStorageFactory: SplitIO.StorageSyncFactory = InLocalStorage();
let localStorageOptions: SplitIO.InLocalStorageOptions = {
  prefix: 'PREFIX'
};
syncStorageFactory = InLocalStorage(localStorageOptions);

/**** Tests for ISDK interface ****/

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

// Client and Manager
client = SDK.client();
client = SDK.client('a customer key');
// client = SDK.client('a customer key', 'a traffic type'); // Not valid in Browser JS SDK
manager = SDK.manager();
asyncClient = AsyncSDK.client();
asyncClient = AsyncSDK.client('a customer key');
asyncManager = AsyncSDK.manager();

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


/**** Tests for fully crowded settings interfaces ****/

// Split filters
let splitFilters: SplitIO.SplitFilter[] = [{ type: 'bySet', values: ['set_a', 'set_b'] }, { type: 'byName', values: ['my_split_1', 'my_split_1'] }, { type: 'byPrefix', values: ['my_split', 'test_split_'] }]

let fullBrowserSettings: SplitIO.IClientSideSettings = {
  core: {
    authorizationKey: 'sdk-key',
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
    authorizationKey: 'sdk-key',
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
