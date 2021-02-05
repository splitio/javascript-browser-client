import settingsValidator from './settings';
import { getModules } from './platform/getModules';
import { sdkFactory } from '@splitsoftware/splitio-commons/src/sdkFactory/index';

export function SplitFactory(config: any) {
  const settings = settingsValidator(config);
  const modules = getModules(settings);
  return sdkFactory(modules);
}
