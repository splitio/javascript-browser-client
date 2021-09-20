import { splitsParserFromSettingsFactory } from '@splitsoftware/splitio-commons/src/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerOfflineFactory } from '@splitsoftware/splitio-commons/src/sync/syncManagerOffline';
import { sdkManagerFactory } from '@splitsoftware/splitio-commons/src/sdkManager/index';
import { sdkClientMethodCSFactory } from '@splitsoftware/splitio-commons/src/sdkClient/sdkClientMethodCS';
import EventEmitter from '@splitsoftware/splitio-commons/src/utils/MinEvents';

import { ISettingsInternal } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/types';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { SplitIO } from '@splitsoftware/splitio-commons/src/types';

const browserPlatform = {
  EventEmitter
};

const syncManagerOfflineCSBrowserFactory = syncManagerOfflineFactory(splitsParserFromSettingsFactory);

export function getModules(settings: ISettingsInternal): ISdkFactoryParams {

  return {
    settings,

    platform: browserPlatform,

    storageFactory: settings.storage,

    syncManagerFactory: syncManagerOfflineCSBrowserFactory,

    sdkManagerFactory,

    sdkClientMethodFactory: sdkClientMethodCSFactory,

    impressionListener: settings.impressionListener as SplitIO.IImpressionListener,
  };
}
