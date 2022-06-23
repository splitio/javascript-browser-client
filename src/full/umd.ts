// @ts-nocheck
import { SplitFactory, InLocalStorage, GoogleAnalyticsToSplit, SplitToGoogleAnalytics, ErrorLogger, WarnLogger, InfoLogger, DebugLogger, DataLoaderFactory } from './index';

// Include all pluggable modules as properties to expose at the global `splitio` object
SplitFactory.SplitFactory = SplitFactory;
SplitFactory.InLocalStorage = InLocalStorage;
SplitFactory.GoogleAnalyticsToSplit = GoogleAnalyticsToSplit;
SplitFactory.SplitToGoogleAnalytics = SplitToGoogleAnalytics;
SplitFactory.ErrorLogger = ErrorLogger;
SplitFactory.WarnLogger = WarnLogger;
SplitFactory.InfoLogger = InfoLogger;
SplitFactory.DebugLogger = DebugLogger;
SplitFactory.DataLoaderFactory = DataLoaderFactory;

// eslint-disable-next-line import/no-default-export
export default SplitFactory;
