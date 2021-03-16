// @ts-nocheck
import { SplitFactory } from './splitFactory';
import { InLocalStorage } from '@splitsoftware/splitio-commons/src/storages/inLocalStorage/index';
import { default as GoogleAnalyticsToSplit } from '@splitsoftware/splitio-commons/src/integrations/ga/GaToSplitPlugin';
import { default as SplitToGoogleAnalytics } from '@splitsoftware/splitio-commons/src/integrations/ga/SplitToGaPlugin';
import { errorLogger } from '@splitsoftware/splitio-commons/src/logger/browser/errorLogger';
import { warnLogger } from '@splitsoftware/splitio-commons/src/logger/browser/warnLogger';
import { infoLogger } from '@splitsoftware/splitio-commons/src/logger/browser/infoLogger';
import { debugLogger } from '@splitsoftware/splitio-commons/src/logger/browser/debugLogger';

// Include all pluggable modules as properties to expose at the global `splitio` object
SplitFactory.SplitFactory = SplitFactory;
SplitFactory.InLocalStorage = InLocalStorage;
SplitFactory.GoogleAnalyticsToSplit = GoogleAnalyticsToSplit;
SplitFactory.SplitToGoogleAnalytics = SplitToGoogleAnalytics;
SplitFactory.errorLogger = errorLogger;
SplitFactory.warnLogger = warnLogger;
SplitFactory.infoLogger = infoLogger;
SplitFactory.debugLogger = debugLogger;

export default SplitFactory;
