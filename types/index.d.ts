// Declaration file for Javascript Browser Split Software SDK v1.0.0
// Project: http://www.split.io/
// Definitions by: Nico Zelaya <https://github.com/NicoZelaya/>

/// <reference path="./splitio.d.ts" />
export = JsSdk;

declare module JsSdk {
  /**
   * Split.io sdk factory function.
   * The settings parameter should be an object that complies with the SplitIO.IBrowserSettings.
   * For more information read the corresponding article: @see {@link https://help.split.io/hc/en-us/articles/360058730852#configuration}
   */
  export function SplitFactory(settings: SplitIO.IBrowserSettings): SplitIO.ISDK;

  /**
   * Persistent storage based on the LocalStorage Web API for browsers.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852#storage}
   */
  export function InLocalStorage(options?: SplitIO.InLocalStorageOptions): SplitIO.StorageSyncFactory;

  /**
   * Enable 'Google Analytics to Split' integration, to track Google Analytics hits as Split events.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852#integrations}
   */
  export function GoogleAnalyticsToSplit(options?: SplitIO.GoogleAnalyticsToSplitOptions): SplitIO.IntegrationFactory;

  /**
   * Enable 'Split to Google Analytics' integration, to track Split impressions and events as Google Analytics hits.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852#integrations}
   */
  export function SplitToGoogleAnalytics(options?: SplitIO.SplitToGoogleAnalyticsOptions): SplitIO.IntegrationFactory;

  /**
   * Creates a logger instance that enables descriptive log messages with DEBUG log level when passed in the factory settings.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852#logging}
   */
  export function DebugLogger(): SplitIO.ILogger;

  /**
   * Creates a logger instance that enables descriptive log messages with INFO log level when passed in the factory settings.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852#logging}
   */
  export function InfoLogger(): SplitIO.ILogger;

  /**
   * Creates a logger instance that enables descriptive log messages with WARN log level when passed in the factory settings.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852#logging}
   */
  export function WarnLogger(): SplitIO.ILogger;


  /**
   * Creates a logger instance that enables descriptive log messages with ERROR log level when passed in the factory settings.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852#logging}
   */
  export function ErrorLogger(): SplitIO.ILogger;
}
