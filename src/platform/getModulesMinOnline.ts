import { splitApiFactory } from '@splitsoftware/splitio-commons/src/services/splitApi';
import { syncManagerOnlineFactory } from '@splitsoftware/splitio-commons/src/sync/syncManagerOnline';
import pushManagerFactory from '@splitsoftware/splitio-commons/src/sync/streaming/pushManager';
import pollingManagerCSFactory from '@splitsoftware/splitio-commons/src/sync/polling/pollingManagerCS';
import { sdkManagerFactory } from '@splitsoftware/splitio-commons/src/sdkManager/index';
import { sdkClientMethodCSFactory } from '@splitsoftware/splitio-commons/src/sdkClient/sdkClientMethodCS';
import BrowserSignalListener from '@splitsoftware/splitio-commons/src/listeners/browser';
import { impressionObserverCSFactory } from '@splitsoftware/splitio-commons/src/trackers/impressionObserver/impressionObserverCS';
import integrationsManagerFactory from '@splitsoftware/splitio-commons/src/integrations/pluggable';
import EventEmitter from '@splitsoftware/splitio-commons/src/utils/MinEvents';

import { getFetch } from './getFetchMin';
import { getEventSource } from './getEventSource';
import { shouldAddPt } from '@splitsoftware/splitio-commons/src/trackers/impressionObserver/utils';
import { ISettingsInternal } from '@splitsoftware/splitio-commons/src/utils/settingsValidation/types';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { SplitIO } from '@splitsoftware/splitio-commons/src/types';

const browserPlatform = {
  getFetch,
  getEventSource,
  EventEmitter
};

const syncManagerOnlineCSFactory = syncManagerOnlineFactory(pollingManagerCSFactory, pushManagerFactory);

export function getModules(settings: ISettingsInternal): ISdkFactoryParams {

  return {
    settings,

    platform: browserPlatform,

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
}
