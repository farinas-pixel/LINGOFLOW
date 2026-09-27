/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WorkspaceViewId =
  | 'home'
  | 'translator'
  | 'search'
  | 'semantic'
  | 'conversation'
  | 'media'
  | 'history'
  | 'languages'
  | 'vault'
  | 'settings'
  | 'architecture'
  | 'services';

export interface NavItem {
  id: WorkspaceViewId;
  label: string;
  description: string;
  iconName:
    | 'Home'
    | 'Languages'
    | 'Sparkles'
    | 'MessagesSquare'
    | 'FileText'
    | 'History'
    | 'Globe'
    | 'HardDrive'
    | 'Settings';
  badge?: string;
  shortcut?: string;
}
