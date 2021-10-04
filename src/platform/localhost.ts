import { splitsParserFromSettingsFactory } from '@splitsoftware/splitio-commons/src/sync/offline/splitsParser/splitsParserFromSettings';
import { syncManagerOfflineFactory } from '@splitsoftware/splitio-commons/src/sync/syncManagerOffline';

// Factory of Localhost SyncManager
export const localhost = syncManagerOfflineFactory(splitsParserFromSettingsFactory);
