import { settingsValidator } from '../settings/full';
import { getModules } from '../platform/getModules';
import { sdkFactory } from '@splitsoftware/splitio-commons/src/sdkFactory/index';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { getFetch } from '../platform/getFetchFull';
import { getEventSource } from '../platform/getEventSource';
import { EventEmitter } from '@splitsoftware/splitio-commons/src/utils/MinEvents';
import { now } from '@splitsoftware/splitio-commons/src/utils/timeTracker/now/browser';

const platform = { getFetch, getEventSource, EventEmitter, now };

/**
 * SplitFactory with pluggable modules for Browser.
 * Includes localhost mode and fetch polyfill out-of-the-box.
 *
 * @param config configuration object used to instantiate the SDK
 * @param __updateModules optional function that lets redefine internal SDK modules. Use with
 * caution since, unlike `config`, this param is not validated neither considered part of the public API.
 * @throws Will throw an error if the provided config is invalid.
 */
export function SplitFactory(config: any, __updateModules?: (modules: ISdkFactoryParams) => void) {
  const settings = settingsValidator(config);
  const modules = getModules(settings, platform);
  if (__updateModules) __updateModules(modules);
  return sdkFactory(modules);
}
