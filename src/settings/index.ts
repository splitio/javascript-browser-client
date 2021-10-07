import { settingsValidation } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/index';
import { defaults } from './defaults';
import { validateStorageCS } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/storage/storageCS';
import { validatePluggableIntegrations } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/integrations/pluggable';
import { validateLogger } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/logger/pluggableLogger';
import { validateLocalhost } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/localhost';

const params = {
  defaults,
  storage: validateStorageCS,
  integrations: validatePluggableIntegrations,
  logger: validateLogger,
  // Slim SplitFactory validates that the localhost module is passed in localhost mode
  localhost: validateLocalhost
};

export function settingsValidator(config: any) {
  return settingsValidation(config, params);
}
