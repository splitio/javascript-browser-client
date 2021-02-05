// @ts-nocheck
import { SplitFactory } from './splitFactory';
import { InLocalStorage } from '@splitsoftware/splitio-commons/src/storages/inLocalStorage/index';
import { default as GoogleAnalyticsToSplit } from '@splitsoftware/splitio-commons/src/integrations/ga/GaToSplitPlugin';
import { default as SplitToGoogleAnalytics } from '@splitsoftware/splitio-commons/src/integrations/ga/SplitToGaPlugin';

// Include all pluggable modules as properties to expose at the global `splitio` object
SplitFactory.SplitFactory = SplitFactory;
SplitFactory.InLocalStorage = InLocalStorage;
SplitFactory.GoogleAnalyticsToSplit = GoogleAnalyticsToSplit;
SplitFactory.SplitToGoogleAnalytics = SplitToGoogleAnalytics;

export default SplitFactory;
