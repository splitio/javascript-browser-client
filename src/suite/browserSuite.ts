import { objectAssign } from '@splitsoftware/splitio-commons/src/utils/lang/objectAssign';
import { _Set, setToArray } from '@splitsoftware/splitio-commons/src/utils/lang/sets';
import { STANDALONE_MODE } from '@splitsoftware/splitio-commons/src/utils/constants';
import { ISdkFactoryParams } from '@splitsoftware/splitio-commons/src/sdkFactory/types';
import { SplitRumAgent } from '@splitsoftware/browser-rum-agent';
import { SplitFactory } from '../full/splitFactory';
import { IBrowserSuiteSettings } from '../../types/splitio';

const DEFAULT_TRAFFIC_TYPE = 'user';

/**
 * SplitFactory for client-side with RUM Agent.
 *
 * @param config configuration object used to instantiate the Suite
 * @param __updateModules optional function that lets redefine internal SDK modules. Use with
 * caution since, unlike `config`, this param is not validated neither considered part of the public API.
 * @throws Will throw an error if the provided config is invalid.
 */
export function SplitSuite(config: IBrowserSuiteSettings, __updateModules?: (modules: ISdkFactoryParams) => void) {
  const sdk = SplitFactory(config, __updateModules) as any;

  const settings = sdk.settings;

  // Do not setup RUM Agent if not in standalone mode
  if (settings.mode !== STANDALONE_MODE) return sdk;

  // Setup RUM Agent
  const agentConfig = SplitRumAgent.__getConfig();
  if (agentConfig.a) {
    settings.log.warn('RUM Agent already setup. The new Suite instance will reset the RUM Agent configuration.');
  }
  agentConfig.log = settings.log;
  SplitRumAgent.removeIdentities(); // reset identities for new Suite
  SplitRumAgent.setup(settings.core.authorizationKey, objectAssign({
    url: settings.urls.events,
    userConsent: settings.userConsent
  }, settings.rumAgent));

  const clients = new _Set();

  // Override UserConsent.setStatus to update RUM Agent consent
  const originalSetStatus = sdk.UserConsent.setStatus;
  sdk.UserConsent.setStatus = function (newStatus: boolean) {
    SplitRumAgent.setUserConsent(newStatus);
    return originalSetStatus.apply(this, arguments);
  };

  // Create Suite instance extending SDK
  return objectAssign({}, sdk, {
    client() {
      const client = sdk.client.apply(sdk, arguments);

      if (!clients.has(client)) {
        clients.add(client);

        SplitRumAgent.addIdentity({
          key: client.key,
          // For main client, use trafficType from settings. For shared clients, use second argument. If not provided, use default.
          trafficType: (arguments[0] ? arguments[1] : settings.core.trafficType) || DEFAULT_TRAFFIC_TYPE
        });

        // override client.destroy to remove identity from RUM Agent
        const originalDestroy = client.destroy;
        client.destroy = function () {
          SplitRumAgent.removeIdentity({
            key: client.key,
            trafficType: client.trafficType || DEFAULT_TRAFFIC_TYPE
          });
          return originalDestroy.apply(client, arguments);
        };
      }

      return client;
    },

    destroy() {
      return Promise.all(setToArray(clients).map(client => client.destroy()));
    }
  });
}
