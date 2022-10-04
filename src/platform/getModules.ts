import { splitApiFactory } from '@splitsoftware/splitio-commons/src/services/splitApi';
import { syncManagerOnlineFactory } from '@splitsoftware/splitio-commons/src/sync/syncManagerOnline';
import { pushManagerFactory } from '@splitsoftware/splitio-commons/src/sync/streaming/pushManager';
import { pollingManagerCSFactory } from '@splitsoftware/splitio-commons/src/sync/polling/pollingManagerCS';
import { sdkManagerFactory } from '@splitsoftware/splitio-commons/src/sdkManager/index';
import { sdkClientMethodCSFactory } from '@splitsoftware/splitio-commons/src/sdkClient/sdkClientMethodCS';
import { BrowserSignalListener } from '@splitsoftware/splitio-commons/src/listeners/browser';
import { impressionObserverCSFactory } from '@splitsoftware/splitio-commons/src/trackers/impressionObserver/impressionObserverCS';
import { pluggableIntegrationsManagerFactory } from '@splitsoftware/splitio-commons/src/integrations/pluggable';

import { IPlatform, ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { ISettings } from '@splitsoftware/splitio-commons/src/types';
import { CONSUMER_MODE, CONSUMER_PARTIAL_MODE, LOCALHOST_MODE } from '@splitsoftware/splitio-commons/src/utils/constants';
import { createUserConsentAPI } from '@splitsoftware/splitio-commons/src/consent/sdkUserConsent';

let syncManagerStandaloneFactory: ISdkFactoryParams['syncManagerFactory'];
let syncManagerSubmittersFactory: ISdkFactoryParams['syncManagerFactory'];

export function getModules(settings: ISettings, platform: IPlatform): ISdkFactoryParams {

  if (!syncManagerStandaloneFactory) syncManagerStandaloneFactory = syncManagerOnlineFactory(pollingManagerCSFactory, pushManagerFactory);

  const modules: ISdkFactoryParams = {
    settings,

    platform,

    storageFactory: settings.storage,

    splitApiFactory,

    syncManagerFactory: syncManagerStandaloneFactory,

    sdkManagerFactory,

    sdkClientMethodFactory: sdkClientMethodCSFactory,

    SignalListener: BrowserSignalListener as ISdkFactoryParams['SignalListener'],

    integrationsManagerFactory: settings.integrations && settings.integrations.length > 0 ? pluggableIntegrationsManagerFactory.bind(null, settings.integrations) : undefined,

    impressionsObserverFactory: impressionObserverCSFactory,

    extraProps: (params) => {
      return {
        UserConsent: createUserConsentAPI(params)
      };
    },
  };

  switch (settings.mode) {
    case LOCALHOST_MODE:
      modules.splitApiFactory = undefined;
      modules.syncManagerFactory = settings.sync.localhostMode;
      modules.SignalListener = undefined;
      break;
    case CONSUMER_MODE:
      modules.syncManagerFactory = undefined;
      break;
    case CONSUMER_PARTIAL_MODE:
      if (!syncManagerSubmittersFactory) syncManagerSubmittersFactory = syncManagerOnlineFactory(undefined, undefined);
      modules.syncManagerFactory = syncManagerSubmittersFactory;
  }

  return modules;
}
