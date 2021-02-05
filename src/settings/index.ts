import { settingsValidation } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/index';
import defaults from './defaults';
import runtime from './runtime';
import { validateStorageCS } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/storage/storageCS';
import { validatePluggableIntegrations } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/integrations/pluggable';

const params = {
  defaults,
  runtime,
  storage: validateStorageCS,
  integrations: validatePluggableIntegrations
};

export default function browserSettingsValidator(config: any) {
  return settingsValidation(config, params);
}
