export interface BuildInfo {
  version: string;
  buildDate: string;
  buildId: string;
  gitHash: string;
  gitBranch: string;
  gitMessage: string;
  timestamp: string;
  isProduction: boolean;
  environment: string;
}

export const BUILD_INFO: BuildInfo;
export const APP_VERSION: string;
export const BUILD_ID: string;
export const GIT_HASH: string;

export function checkForUpdates(): Promise<boolean>;

export default BUILD_INFO;
