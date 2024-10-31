// Declaration file for JavaScript Browser Split Software SDK
// Project: http://www.split.io/
// Definitions by: Nico Zelaya <https://github.com/NicoZelaya/>

/// <reference path="./splitio.d.ts" />
export = JsSdk;

declare module JsSdk {
  /**
   * Split.io SDK factory function.
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
