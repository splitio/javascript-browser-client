import { splitApiFactory } from '@splitsoftware/splitio-commons/src/services/splitApi';
import { splitsParserFromSettingsFactory } from '@splitsoftware/splitio-commons/src/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerOfflineFactory } from '@splitsoftware/splitio-commons/src/sync/syncManagerOffline';
import { syncManagerOnlineFactory } from '@splitsoftware/splitio-commons/src/sync/syncManagerOnline';
import pushManagerFactory from '@splitsoftware/splitio-commons/src/sync/streaming/pushManager';
import pollingManagerCSFactory from '@splitsoftware/splitio-commons/src/sync/polling/pollingManagerCS';
import { sdkManagerFactory } from '@splitsoftware/splitio-commons/src/sdkManager/index';
import { sdkClientMethodCSFactory } from '@splitsoftware/splitio-commons/src/sdkClient/sdkClientMethodCS';
import BrowserSignalListener from '@splitsoftware/splitio-commons/src/listeners/browser';
import { impressionObserverCSFactory } from '@splitsoftware/splitio-commons/src/trackers/impressionObserver/impressionObserverCS';
import integrationsManagerFactory from '@splitsoftware/splitio-commons/src/integrations/pluggable';
import EventEmitter from '@splitsoftware/splitio-commons/src/utils/MinEvents';

import { getFetch } from './getFetchFull';
import { getEventSource } from './getEventSource';
import { shouldAddPt } from '@splitsoftware/splitio-commons/src/trackers/impressionObserver/utils';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { SplitIO, ISettings } from '@splitsoftware/splitio-commons/src/types';

const browserPlatform = {
  getFetch,
  getEventSource,
  EventEmitter
};

const syncManagerOfflineCSBrowserFactory = syncManagerOfflineFactory(splitsParserFromSettingsFactory);
const syncManagerOnlineCSFactory = syncManagerOnlineFactory(pollingManagerCSFactory, pushManagerFactory);

export function getModules(settings: ISettings): ISdkFactoryParams {

  return {
    settings,

    platform: browserPlatform,

    storageFactory: settings.storage,

    splitApiFactory: settings.mode === 'localhost' ? undefined : splitApiFactory,

    syncManagerFactory: settings.mode === 'localhost' ? syncManagerOfflineCSBrowserFactory : syncManagerOnlineCSFactory,

    sdkManagerFactory,

    sdkClientMethodFactory: sdkClientMethodCSFactory,

    SignalListener: settings.mode === 'localhost' ? undefined : BrowserSignalListener as ISdkFactoryParams['SignalListener'],

    impressionListener: settings.impressionListener as SplitIO.IImpressionListener,

    integrationsManagerFactory: settings.integrations && settings.integrations.length > 0 ? integrationsManagerFactory.bind(null, settings.integrations) : undefined,

    impressionsObserverFactory: shouldAddPt(settings) ? impressionObserverCSFactory : undefined,
  };
}
