/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBaseService } from '../../types/service';

export type SyncState = 'idle' | 'syncing' | 'offline_queued' | 'conflict_detected' | 'error';

export interface SyncStatusInfo {
  readonly state: SyncState;
  readonly lastSyncedAt: string | null;
  readonly pendingChangesCount: number;
}

export interface ISyncService extends IBaseService {
  readonly id: 'syncService';
  readonly status: SyncStatusInfo;
  triggerManualSync(): Promise<boolean>;
  queueOfflineAction(actionType: string, payload: unknown): Promise<void>;
  getPendingActionsCount(): Promise<number>;
}
