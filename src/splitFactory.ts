import { settingsValidator } from './settings/slim';
import { getModules } from './platform/getModulesSlim';
import { sdkFactory } from '@splitsoftware/splitio-commons/src/sdkFactory/index';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { merge } from '@splitsoftware/splitio-commons/src/utils/lang';

/**
 * Slim SplitFactory with pluggable modules for Browser.
 * Doesn't include localhost mode, verbose log messages and fetch ponyfill.
 *
 * @param config configuration object used to instantiates the SDK
 * @param customModules optional object of SDK modules to overwrite default ones. Use with caution since, unlike `config`, this param is not validated.
 * @throws Will throw an error if the provided config is invalid.
 */
export function SplitFactory(config: any, customModules?: Partial<ISdkFactoryParams>) {
  const settings = settingsValidator(config);
  const modules = getModules(settings);
  return sdkFactory(customModules ? merge(modules, customModules) as ISdkFactoryParams : modules);
}
