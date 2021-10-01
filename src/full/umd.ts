// @ts-nocheck
import { SplitFactory, InLocalStorage, GoogleAnalyticsToSplit, SplitToGoogleAnalytics } from './index';

// Include all pluggable modules as properties to expose at the global `splitio` object
SplitFactory.SplitFactory = SplitFactory;
SplitFactory.InLocalStorage = InLocalStorage;
SplitFactory.GoogleAnalyticsToSplit = GoogleAnalyticsToSplit;
SplitFactory.SplitToGoogleAnalytics = SplitToGoogleAnalytics;

export default SplitFactory;
