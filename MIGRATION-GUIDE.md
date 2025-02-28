# Migrating to JavaScript Browser SDK v1

JavaScript Browser SDK v1.0.0 has a few breaking changes that you should consider when migrating from version 0.x.x.

## Renamed some TypeScript definitions in the `SplitIO` namespace to avoid conflicts with other Split packages

The renamed types are:
- `SplitIO.IBrowserSettings` -> `SplitIO.IClientSideSettings`
- `SplitIO.IBrowserAsyncSettings` -> `SplitIO.IClientSideAsyncSettings`
- `SplitIO.ISDK` -> `SplitIO.IBrowserSDK`
- `SplitIO.IAsyncSDK` -> `SplitIO.IBrowserAsyncSDK`
- `SplitIO.IClient` -> `SplitIO.IBrowserClient`
- `SplitIO.IAsyncClient` -> `SplitIO.IBrowserAsyncClient`

For example, you should replace:

```ts
import { SplitFactory } from '@splitsoftware/splitio-browserjs';

const config: SplitIO.IBrowserSettings = { ... };
const factory: SplitIO.ISDK = SplitFactory(config);
```

with:

```ts
import { SplitFactory } from '@splitsoftware/splitio-browserjs';

const config: SplitIO.IClientSideSettings = { ... };
const factory: SplitIO.IBrowserSDK = SplitFactory(config);
```


## Removed the `LocalhostFromObject` export from the default import

In order to simplify the SDK API, the `LocalhostFromObject` export was removed from the default import (`import { LocalhostFromObject } from '@splitsoftware/splitio-browserjs'`), and it is no longer necessary to manually pass it to the `sync.localhostMode` configuration option to enable localhost mode.

If you were using the `LocalhostFromObject` export, you should remove it from your code. For example, replace:

```js
import { SplitFactory, LocalhostFromObject } from '@splitsoftware/splitio-browserjs';

const factory = SplitFactory({
  core: {
    authorizationKey: 'localhost',
    key: SOME_KEY
  },
  features: {
    'feature1': 'on'
  },
  sync: {
    localhostMode: LocalhostFromObject()
  }
});
```

with:

```js
import { SplitFactory } from '@splitsoftware/splitio-browserjs';

const factory = SplitFactory({
  core: {
    authorizationKey: 'localhost',
    key: SOME_KEY
  },
  features: {
    'feature1': 'on'
  }
});
```

## Removed the deprecated `GoogleAnalyticsToSplit` and `SplitToGoogleAnalytics` pluggable integration modules, along with the related interfaces in the TypeScript definitions

The Google Analytics integrations were removed since they integrate with the *Google Universal Analytics* library, which was shut down on July 1, 2024, and [replaced by *Google Analytics 4*](https://support.google.com/analytics/answer/11583528?hl=en). Check [this docs](https://help.split.io/hc/en-us/articles/360040838752-Google-Analytics#google-analytics-4-ga4) for more information on how to integrate Split with Google Analytics 4.

## Removed internal polyfills for the `Map` and `Set` global objects, dropping support for IE and other outdated browsers

The SDK no longer ships with internal implementations for the `Map` and `Set` global objects, which were used to support old browsers like IE.

If you need to target environments that do not support these features natively, you should provide a polyfill for them. For example, [es6-map](https://github.com/medikoo/es6-map) for `Map`, and [es6-set](https://github.com/medikoo/es6-set) for `Set`.

## Dropped support for Split Proxy below version 5.9.0. The SDK now requires Split Proxy 5.9.0 or above

If using the Split Proxy with the SDK, make sure to update it to version 5.9.0 or above. This is required due to the introduction of Large Segments matchers in the SDK, which uses a new HTTP endpoint to retrieve the segments data and is only supported by Split Proxy 5.9.0.
