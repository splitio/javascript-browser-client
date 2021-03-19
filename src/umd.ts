// @ts-nocheck
import { SplitFactory } from './splitFactory';
import { InLocalStorage } from '@splitsoftware/splitio-commons/src/storages/inLocalStorage/index';
import { default as GoogleAnalyticsToSplit } from '@splitsoftware/splitio-commons/src/integrations/ga/GaToSplitPlugin';
import { default as SplitToGoogleAnalytics } from '@splitsoftware/splitio-commons/src/integrations/ga/SplitToGaPlugin';
import { ErrorLogger } from '@splitsoftware/splitio-commons/src/logger/browser/ErrorLogger';
import { WarnLogger } from '@splitsoftware/splitio-commons/src/logger/browser/WarnLogger';
import { InfoLogger } from '@splitsoftware/splitio-commons/src/logger/browser/InfoLogger';
import { DebugLogger } from '@splitsoftware/splitio-commons/src/logger/browser/DebugLogger';

// Include all pluggable modules as properties to expose at the global `splitio` object
SplitFactory.SplitFactory = SplitFactory;
SplitFactory.InLocalStorage = InLocalStorage;
SplitFactory.GoogleAnalyticsToSplit = GoogleAnalyticsToSplit;
SplitFactory.SplitToGoogleAnalytics = SplitToGoogleAnalytics;
SplitFactory.ErrorLogger = ErrorLogger;
SplitFactory.WarnLogger = WarnLogger;
SplitFactory.InfoLogger = InfoLogger;
SplitFactory.DebugLogger = DebugLogger;

export default SplitFactory;
