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
import { IPlatform, ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { SplitIO, ISettings } from '@splitsoftware/splitio-commons/src/types';
import { CONSUMER_MODE, LOCALHOST_MODE } from '@splitsoftware/splitio-commons/src/utils/constants';

const syncManagerOnlineCSFactory = syncManagerOnlineFactory(pollingManagerCSFactory, pushManagerFactory);

export function getModules(settings: ISettings, platform: IPlatform): ISdkFactoryParams {

  const modules: ISdkFactoryParams = {
    settings,

    platform,

    storageFactory: settings.storage,

    splitApiFactory,

    syncManagerFactory: syncManagerOnlineCSFactory,

    sdkManagerFactory,

    sdkClientMethodFactory: sdkClientMethodCSFactory,

    SignalListener: BrowserSignalListener as ISdkFactoryParams['SignalListener'],

    impressionListener: settings.impressionListener as SplitIO.IImpressionListener,

    integrationsManagerFactory: settings.integrations && settings.integrations.length > 0 ? integrationsManagerFactory.bind(null, settings.integrations) : undefined,

    impressionsObserverFactory: shouldAddPt(settings) ? impressionObserverCSFactory : undefined,
  };

  switch (settings.mode) {
    case LOCALHOST_MODE:
      modules.splitApiFactory = undefined;
      modules.syncManagerFactory = settings.sync.localhostMode;
      modules.SignalListener = undefined;
      break;
    case CONSUMER_MODE:
      modules.syncManagerFactory = undefined;
  }

  return modules;
}
