import { settingsValidator } from '../settings';
import { getModules } from '../platform/getModules';
import { sdkFactory } from '@splitsoftware/splitio-commons/src/sdkFactory/index';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { merge } from '@splitsoftware/splitio-commons/src/utils/lang';
import { getFetch } from '../platform/getFetchFull';
import { getEventSource } from '../platform/getEventSource';
import EventEmitter from '@splitsoftware/splitio-commons/src/utils/MinEvents';
import { localhost } from '../platform/localhost';

const platform = { getFetch, getEventSource, EventEmitter };

/**
 * SplitFactory with pluggable modules for Browser.
 * Includes localhost mode, verbose log messages and fetch ponyfill for old browsers.
 *
 * @param config configuration object used to instantiates the SDK
 * @param customModules optional object of SDK modules to overwrite default ones. Use with caution since, unlike `config`, this param is not validated.
 * @throws Will throw an error if the provided config is invalid.
 */
export function SplitFactory(config: any, customModules?: Partial<ISdkFactoryParams>) {
  const settings = settingsValidator(config);

  // Full SplitFactory automatically passes the localhost module
  settings.sync.localhost = localhost;

  const modules = getModules(settings, platform);
  return sdkFactory(customModules ? merge(modules, customModules) as ISdkFactoryParams : modules);
}
