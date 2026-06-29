import type SplitIO from '@splitsoftware/splitio-commons/types/splitio';
import { settingsFactory } from '../settings/full';
import { getModules } from '../platform/getModules';
import { sdkFactory } from '@splitsoftware/splitio-commons/src/sdkFactory/index';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { getFetch } from '../platform/getFetchFull';
import { platform } from '@splitsoftware/splitio-commons/src/platform/browser';

const platformWithFetchPolyfill = { ...platform, getFetch };

/**
 * SplitFactory with pluggable modules for Browser.
 * It includes a `fetch` polyfill out-of-the-box.
 *
 * @param config - configuration object used to instantiate the SDK
 * @param __updateModules - optional function that lets redefine internal SDK modules. Use with
 * caution since, unlike `config`, this param is not validated neither considered part of the public API.
 * @throws Will throw an error if the provided config is invalid.
 */
export function SplitFactory(config: SplitIO.IClientSideSettings, __updateModules?: (modules: ISdkFactoryParams) => void) {
  const settings = settingsFactory(config);
  const modules = getModules(settings, platformWithFetchPolyfill);
  if (__updateModules) __updateModules(modules);
  return sdkFactory(modules);
}
