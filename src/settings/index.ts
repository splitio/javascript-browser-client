import { settingsValidation } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/index';
import { defaults } from './defaults';
import { validateRuntime } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/runtime';
import { validateStorageCS } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/storage/storageCS';
import { validatePluggableIntegrations } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/integrations/pluggable';
import { validateLogger } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/logger/pluggableLogger';
import { validateLocalhost } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/localhost/pluggable';
import { validateConsent } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/consent';

const params = {
  defaults,
  acceptKey: true, // Client with bound key
  runtime: validateRuntime,
  storage: validateStorageCS,
  integrations: validatePluggableIntegrations,
  logger: validateLogger,
  localhost: validateLocalhost, // Slim SplitFactory validates that the localhost module is passed in localhost mode
  consent: validateConsent,
};

export function settingsValidator(config: any) {
  return settingsValidation(config, params);
}
