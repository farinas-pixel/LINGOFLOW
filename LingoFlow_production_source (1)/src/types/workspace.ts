/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemReadiness {
  storageInitialized: boolean;
  themeInitialized: boolean;
  networkOnline: boolean;
  secureConfigReady: boolean;
  timestamp: string;
}

export interface WorkspaceState {
  activeView: string;
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  readiness: SystemReadiness;
}
