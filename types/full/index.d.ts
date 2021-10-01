// Declaration file for Javascript Browser Split Software SDK v1.0.0
// Project: http://www.split.io/
// Definitions by: Nico Zelaya <https://github.com/NicoZelaya/>

/// <reference path="../splitio.d.ts" />
export = JsSdk;

declare module JsSdk {
  /**
   * Full version of the Split.io sdk factory function.
   *
   * Unlike the slim version, it includes localhost mode and verbose log messages by default, and a lightweight fetch ponyfill to
   * simplify setup for old browsers @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#size-optimization}.
   *
   * The settings parameter should be an object that complies with the SplitIO.IBrowserSettings.
   * For more information read the corresponding article: @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#configuration}
   */
  export function SplitFactory(settings: SplitIO.IBrowserSettings): SplitIO.ISDK;

  /**
   * Persistent storage based on the LocalStorage Web API for browsers.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#storage}
   */
  export function InLocalStorage(options?: SplitIO.InLocalStorageOptions): SplitIO.StorageSyncFactory;

  /**
   * Enable 'Google Analytics to Split' integration, to track Google Analytics hits as Split events.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#integrations}
   */
  export function GoogleAnalyticsToSplit(options?: SplitIO.GoogleAnalyticsToSplitOptions): SplitIO.IntegrationFactory;

  /**
   * Enable 'Split to Google Analytics' integration, to track Split impressions and events as Google Analytics hits.
   *
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#integrations}
   */
  export function SplitToGoogleAnalytics(options?: SplitIO.SplitToGoogleAnalyticsOptions): SplitIO.IntegrationFactory;
}
