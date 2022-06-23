/**
Copyright 2022 Split Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/

export { SplitFactory } from './splitFactory';
export { InLocalStorage } from '@splitsoftware/splitio-commons/src/storages/inLocalStorage/index';
export { GoogleAnalyticsToSplit } from '@splitsoftware/splitio-commons/src/integrations/ga/GoogleAnalyticsToSplit';
export { SplitToGoogleAnalytics } from '@splitsoftware/splitio-commons/src/integrations/ga/SplitToGoogleAnalytics';
export { ErrorLogger } from '@splitsoftware/splitio-commons/src/logger/browser/ErrorLogger';
export { WarnLogger } from '@splitsoftware/splitio-commons/src/logger/browser/WarnLogger';
export { InfoLogger } from '@splitsoftware/splitio-commons/src/logger/browser/InfoLogger';
export { DebugLogger } from '@splitsoftware/splitio-commons/src/logger/browser/DebugLogger';
export { LocalhostFromObject } from '@splitsoftware/splitio-commons/src/sync/offline/LocalhostFromObject';
export { PluggableStorage } from '@splitsoftware/splitio-commons/src/storages/pluggable';
export { DataLoaderFactory } from '@splitsoftware/splitio-commons/src/storages/dataLoader';
