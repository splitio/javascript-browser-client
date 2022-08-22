// Type definitions for Javascript and NodeJS Split Software SDK
// Project: http://www.split.io/
// Definitions by: Nico Zelaya <https://github.com/NicoZelaya/>

/// <reference types="@splitsoftware/splitio-commons/src/types" />

/****** Exposed namespace ******/
/**
 * Types and interfaces for @splitsoftware/splitio package for usage when integrating Javascript Browser SDK on Typescript apps.
 * For the SDK package information
 * @see {@link https://www.npmjs.com/package/@splitsoftware/splitio-browserjs}
 */
declare namespace SplitIO {
  /**
   * Settings interface for SDK instances created on the browser in standalone or localhost mode, where client method calls are synchronous.
   * @interface IBrowserSettings
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#configuration}
   */
  interface IBrowserSettings extends IClientSideSharedSettings, IPluggableSettings {
    /**
     * The SDK mode. When using the default in memory storage or `InLocalStorage` as storage, the only possible value is "standalone", which is the default.
     * For "localhost" mode, use "localhost" as authorizationKey.
     *
     * @property {'standalone'} mode
     * @default standalone
     */
    mode?: 'standalone',
    sync?: IClientSideSharedSettings['sync'] & {
      /**
       * Defines the factory function to instantiate the SDK in localhost mode.
       *
       * NOTE: this is only required if using the slim entry point of the library to init the SDK in localhost mode.
       *
       * For more information @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#localhost-mode}
       *
       * Example:
       * ```typescript
       * SplitFactory({
       *   ...
       *   sync: {
       *     localhostMode: LocalhostFromObject()
       *   }
       * })
       * ```
       * @property {Object} localhostMode
       */
      localhostMode?: SplitIO.LocalhostFactory
    },
    /**
     * Defines the factory function to instantiate the storage. If not provided, the default IN MEMORY storage is used.
     *
     * Example:
     * ```typescript
     * SplitFactory({
     *   ...
     *   storage: InLocalStorage()
     * })
     * ```
     * @property {Object} storage
     */
    storage?: SplitIO.StorageSyncFactory,
    /**
     * Defines an optional list of factory functions used to instantiate SDK integrations.
     *
     * Example:
     * ```typescript
     * SplitFactory({
     *   ...
     *   integrations: [SplitToGoogleAnalytics(), GoogleAnalyticsToSplit()]
     * })
     * ```
     * @property {Object} integrations
     */
    integrations?: IntegrationFactory[],
  }
  /**
   * Settings interface with async storage for SDK instances created on the browser.
   * If your storage is synchronous (by defaut we use memory, which is sync) use SplitIO.IBrowserSettings instead.
   * @interface IBrowserAsyncSettings
   * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#configuration}
   */
  interface IBrowserAsyncSettings extends IClientSideSharedSettings, IPluggableSettings {
    /**
     * The SDK mode. When using `PluggableStorage` as storage, the possible values are "consumer" and "consumer_partial".
     *
     * @see {@link https://help.split.io/hc/en-us/articles/360058730852-Browser-SDK#sharing-state-with-a-pluggable-storage}
     *
     * @property {'consumer' | 'consumer_partial'} mode
     */
    mode: 'consumer' | 'consumer_partial',
    /**
     * Defines the factory function to instantiate the storage.
     *
     * Example:
     * ```typescript
     * SplitFactory({
     *   ...
     *   storage: PluggableStorage({ wrapper: SomeWrapper })
     * })
     * ```
     * @property {Object} storage
     */
    storage: StorageAsyncFactory,
  }

  /**
   * This represents the interface for the Client instance with attributes binding, synchronous method calls, and client-side API, where each client has a key associated.
   * @interface IClient
   */
  interface IClient extends IClientWithKey { }
  /**
   * This represents the interface for the SDK instance with synchronous method calls and client-side API, where client instances have a bound user key.
   * @interface ISDK
   */
  interface ISDK extends ISDKWithUserConsent<IClient, IManager> {
    /**
     * Returns the default client instance of the SDK, associated with the key provided on settings.
     * @function client
     * @returns {IClient} The client instance.
     */
    client(): IClient,
    /**
     * Returns a shared client of the SDK, associated with the given key.
     * @function client
     * @param {SplitKey} key The key for the new client instance.
     * @returns {IClient} The client instance.
     */
    client(key: SplitKey): IClient,
  }
  /**
   * This represents the interface for the Client instance with attributes binding, asynchronous method calls, and client-side API, where each client has a key associated.
   * @interface IAsyncClient
   */
  interface IAsyncClient extends IAsyncClientWithKey { }
  /**
   * This represents the interface for the SDK instance with asynchronous method calls and client-side API, where client instances have a bound user key.
   * @interface IAsyncSDK
   */
  interface IAsyncSDK extends ISDKWithUserConsent<IAsyncClient, IAsyncManager> {
    /**
     * Returns the default client instance of the SDK, associated with the key provided on settings.
     * @function client
     * @returns {IAsyncClient} The asynchronous client instance.
     */
    client(): IAsyncClient,
    /**
     * Returns a shared client of the SDK, associated with the given key.
     * @function client
     * @param {SplitKey} key The key for the new client instance.
     * @returns {IAsyncClient} The asynchronous client instance.
     */
    client(key: SplitKey): IAsyncClient,
  }
}
