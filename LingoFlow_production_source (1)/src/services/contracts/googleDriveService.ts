/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBaseService } from '../../types/service';

export interface DriveVaultSnapshot {
  readonly snapshotId: string;
  readonly createdAt: string;
  readonly byteSize: number;
  readonly fileCount: number;
  readonly checksum: string;
}

export interface IGoogleDriveService extends IBaseService {
  readonly id: 'googleDriveService';
  readonly isLinked: boolean;
  authenticateVault(): Promise<boolean>;
  disconnectVault(): Promise<void>;
  createVaultBackup(data: Uint8Array, name: string): Promise<DriveVaultSnapshot>;
  restoreVaultBackup(snapshotId: string): Promise<Uint8Array>;
  listVaultSnapshots(): Promise<readonly DriveVaultSnapshot[]>;
}
