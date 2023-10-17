// Declaration file for JavaScript Browser Split Software SDK
// Project: http://www.split.io/

/// <reference path="../splitio.d.ts" />
export = JsSdk;

declare module JsSdk {
  /**
   * Split.io Suite factory function.
   *
   * The settings parameter should be an object that complies with the SplitIO.IBrowserSuiteSettings.
   * For more information read the corresponding article: @see {@link https://help.split.io/hc/en-us/articles/360030898431-Browser-RUM-agent#sdk-integration}
   */
  export function SplitSuite(settings: SplitIO.IBrowserSuiteSettings): SplitIO.ISuiteSDK;

  /**
   * Persistent storage based on the LocalStorage Web API for browsers.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#storage}
   */
  export function InLocalStorage(options?: SplitIO.InLocalStorageOptions): SplitIO.StorageSyncFactory;

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
