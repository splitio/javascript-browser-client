import type SplitIO from '@splitsoftware/splitio-commons/types/splitio';
import { settingsFactory } from './settings';
import { getModules } from './platform/getModules';
import { sdkFactory } from '@splitsoftware/splitio-commons/src/sdkFactory/index';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { platform } from '@splitsoftware/splitio-commons/src/platform/browser';

/**
 * SplitFactory with pluggable modules for Browser.
 *
 * @param config - configuration object used to instantiate the SDK
 * @param __updateModules - optional function that lets redefine internal SDK modules. Use with
 * caution since, unlike `config`, this param is not validated neither considered part of the public API.
 * @throws Will throw an error if the provided config is invalid.
 */
export function SplitFactory(config: SplitIO.IClientSideSettings, __updateModules?: (modules: ISdkFactoryParams) => void) {
  const settings = settingsFactory(config);
  const modules = getModules(settings, platform);
  if (__updateModules) __updateModules(modules);
  return sdkFactory(modules);
}
