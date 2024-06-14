import { LogLevels, isLogLevelString } from '@splitsoftware/splitio-commons/src/logger/index';
import { ConsentStatus, LogLevel } from '@splitsoftware/splitio-commons/src/types';
import { CONSENT_GRANTED } from '@splitsoftware/splitio-commons/src/utils/constants';

const packageVersion = '0.14.1';

/**
 * In browser, the default debug level, can be set via the `localStorage.splitio_debug` item.
 * Acceptable values are: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'.
 * Other acceptable values are 'on', 'enable' and 'enabled', which are equivalent to 'DEBUG'.
 * Any other string value is equivalent to disable ('NONE').
 */
let initialLogLevel: LogLevel | undefined;

const LS_KEY = 'splitio_debug';

try {
  const initialState = localStorage.getItem(LS_KEY) || '';
  // Kept to avoid a breaking change ('on', 'enable' and 'enabled' are equivalent)
  initialLogLevel = /^(enabled?|on)/i.test(initialState) ? LogLevels.DEBUG : isLogLevelString(initialState) ? initialState : LogLevels.NONE;
  // eslint-disable-next-line no-empty
} catch { }

export const defaults = {
  startup: {
    // Stress the request time used while starting up the SDK.
    requestTimeoutBeforeReady: 5,
    // How many quick retries we will do while starting up the SDK.
    retriesOnFailureBeforeReady: 1,
    // Maximum amount of time used before notifies me a timeout.
    readyTimeout: 10,
    // Amount of time we will wait before the first push of events.
    eventsFirstPushWindow: 10
  },

  // Consent is considered granted by default
  userConsent: CONSENT_GRANTED as ConsentStatus,

  // Instance version.
  version: `browserjs-${packageVersion}`,

  debug: initialLogLevel
};
