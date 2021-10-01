import { getModules as getModulesSlim } from './getModulesSlim';

import { splitsParserFromSettingsFactory } from '@splitsoftware/splitio-commons/src/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerOfflineFactory } from '@splitsoftware/splitio-commons/src/sync/syncManagerOffline';

import { getFetch } from './getFetchFull';
import { ISettingsInternal } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/types';

const syncManagerOfflineCSBrowserFactory = syncManagerOfflineFactory(splitsParserFromSettingsFactory);

export function getModules(settings: ISettingsInternal) {
  const modules = getModulesSlim(settings);

  modules.platform.getFetch = getFetch; // getFetch with unfetch ponyfill

  if (settings.mode === 'localhost') {
    modules.splitApiFactory = undefined;
    modules.syncManagerFactory = syncManagerOfflineCSBrowserFactory;
    modules.SignalListener = undefined;
  }

  return modules;
}
