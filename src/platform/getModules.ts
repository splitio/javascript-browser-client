import { splitApiFactory } from '@splitsoftware/splitio-commons/src/services/splitApi';
import { syncManagerOnlineFactory } from '@splitsoftware/splitio-commons/src/sync/syncManagerOnline';
import pushManagerFactory from '@splitsoftware/splitio-commons/src/sync/streaming/pushManager';
import pollingManagerCSFactory from '@splitsoftware/splitio-commons/src/sync/polling/pollingManagerCS';
import { sdkManagerFactory } from '@splitsoftware/splitio-commons/src/sdkManager/index';
import { sdkClientMethodCSFactory } from '@splitsoftware/splitio-commons/src/sdkClient/sdkClientMethodCS';
import BrowserSignalListener from '@splitsoftware/splitio-commons/src/listeners/browser';
import { impressionObserverCSFactory } from '@splitsoftware/splitio-commons/src/trackers/impressionObserver/impressionObserverCS';
import integrationsManagerFactory from '@splitsoftware/splitio-commons/src/integrations/pluggable';

import { shouldAddPt } from '@splitsoftware/splitio-commons/src/trackers/impressionObserver/utils';
import { ISettingsInternal } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/types';
import { IPlatform, ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { SplitIO } from '@splitsoftware/splitio-commons/src/types';

const syncManagerOnlineCSFactory = syncManagerOnlineFactory(pollingManagerCSFactory, pushManagerFactory);

export function getModules(settings: ISettingsInternal, platform: IPlatform): ISdkFactoryParams {

  return {
    settings,

    platform,

    storageFactory: settings.storage,

    splitApiFactory: settings.mode === 'localhost' ? undefined : splitApiFactory,

    syncManagerFactory: settings.mode === 'localhost' ? settings.sync.localhost : syncManagerOnlineCSFactory,

    sdkManagerFactory,

    sdkClientMethodFactory: sdkClientMethodCSFactory,

    SignalListener: settings.mode === 'localhost' ? undefined : BrowserSignalListener as ISdkFactoryParams['SignalListener'],

    impressionListener: settings.impressionListener as SplitIO.IImpressionListener,

    integrationsManagerFactory: settings.integrations && settings.integrations.length > 0 ? integrationsManagerFactory.bind(null, settings.integrations) : undefined,

    impressionsObserverFactory: shouldAddPt(settings) ? impressionObserverCSFactory : undefined,
  };
}
