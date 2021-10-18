import { settingsValidation } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/index';
import { defaults } from './defaults';
import { validateStorageCS } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/storage/storageCS';
import { validatePluggableIntegrations } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/integrations/pluggable';
import { validateLogger } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/logger/pluggableLogger';
import { validateLocalhostWithDefault } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/localhost/builtin';

const params = {
  defaults,
  storage: validateStorageCS,
  integrations: validatePluggableIntegrations,
  logger: validateLogger,
  // Full SplitFactory returns a default instance, except a valid one is provided
  localhost: validateLocalhostWithDefault
};

export function settingsValidator(config: any) {
  return settingsValidation(config, params);
}
