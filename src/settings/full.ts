import { settingsValidation } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/index';
import { defaults } from './defaults';
import { validateStorageCS } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/storage/storageCS';
import { validatePluggableIntegrations } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/integrations/pluggable';
import { validateLogger } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/logger/pluggableLogger';
import { LocalhostFromObject } from '@splitsoftware/splitio-commons/src/sync/offline/LocalhostFromObject';
import { validateLocalhost } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/localhost';
import { ISettings } from '@splitsoftware/splitio-commons/src/types';

const params = {
  defaults,
  storage: validateStorageCS,
  integrations: validatePluggableIntegrations,
  logger: validateLogger,
  // Full SplitFactory returns a default instance, except a valid one is provided
  localhost: (settings: ISettings) => {
    return validateLocalhost(settings) || LocalhostFromObject();
  }
};

export function settingsValidator(config: any) {
  return settingsValidation(config, params);
}
