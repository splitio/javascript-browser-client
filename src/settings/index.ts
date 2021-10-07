import { settingsValidation } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/index';
import { defaults } from './defaults';
import { validateStorageCS } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/storage/storageCS';
import { validatePluggableIntegrations } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/integrations/pluggable';
import { validateLogger } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/logger/pluggableLogger';
import { ISettings } from '@splitsoftware/splitio-commons/src/types';

const params = {
  defaults,
  storage: validateStorageCS,
  integrations: validatePluggableIntegrations,
  logger: validateLogger,
  // Slim SplitFactory validates that the localhost module is passed in localhost mode
  localhost: (settings: ISettings) => {
    const localhostMode = settings.sync.localhostMode;

    if (settings.mode === 'localhost' && typeof localhostMode !== 'function' || localhostMode.type !== 'localhost') {
      settings.log.error(
        'Localhost mode requires setting the localhost module at your `config.sync.localhost` param to get the SDK ready and evaluate splits'
      );
    }
    return localhostMode;
  }
};

export function settingsValidator(config: any) {
  return settingsValidation(config, params);
}
