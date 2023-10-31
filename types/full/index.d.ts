// Declaration file for JavaScript Browser Split Software SDK
// Project: http://www.split.io/
// Definitions by: Nico Zelaya <https://github.com/NicoZelaya/>

/// <reference path="../splitio.d.ts" />
export = JsSdk;

declare module JsSdk {
  /**
   * Full version of the Split.io sdk factory function.
   *
   * Unlike the slim version, it doesn't require a 'fetch' polyfill to support old browsers @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#language-support}.
   * and includes localhost mode out-of-the-box @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#localhost-mode}.
   *
   * The settings parameter should be an object that complies with the SplitIO.IBrowserSettings.
   * For more information read the corresponding article: @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#configuration}
   */
  export function SplitFactory(settings: SplitIO.IBrowserSettings): SplitIO.ISDK;
  export function SplitFactory(settings: SplitIO.IBrowserAsyncSettings): SplitIO.IAsyncSDK;

  /**
   * Persistent storage based on the LocalStorage Web API for browsers.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#storage}
   */
  export function InLocalStorage(options?: SplitIO.InLocalStorageOptions): SplitIO.StorageSyncFactory;

  /**
   * Pluggable storage to use the SDK in consumer mode.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#sharing-state-with-a-pluggable-storage}
   */
   export function PluggableStorage(options: SplitIO.PluggableStorageOptions): SplitIO.StorageAsyncFactory;

  /**
   * Enable 'Google Analytics to Split' integration, to track Google Analytics hits as Split events.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360040838752#google-analytics-to-split}
   */
  export function GoogleAnalyticsToSplit(options?: SplitIO.GoogleAnalyticsToSplitOptions): SplitIO.IntegrationFactory;

  /**
   * Enable 'Split to Google Analytics' integration, to track Split impressions and events as Google Analytics hits.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360040838752#split-to-google-analytics}
   */
  export function SplitToGoogleAnalytics(options?: SplitIO.SplitToGoogleAnalyticsOptions): SplitIO.IntegrationFactory;

  /**
   * Creates a logger instance that enables descriptive log messages with DEBUG log level when passed in the factory settings.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#logging}
   */
  export function DebugLogger(): SplitIO.ILogger;

  /**
   * Creates a logger instance that enables descriptive log messages with INFO log level when passed in the factory settings.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#logging}
   */
  export function InfoLogger(): SplitIO.ILogger;

  /**
   * Creates a logger instance that enables descriptive log messages with WARN log level when passed in the factory settings.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#logging}
   */
  export function WarnLogger(): SplitIO.ILogger;

  /**
   * Creates a logger instance that enables descriptive log messages with ERROR log level when passed in the factory settings.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#logging}
   */
  export function ErrorLogger(): SplitIO.ILogger;
}
