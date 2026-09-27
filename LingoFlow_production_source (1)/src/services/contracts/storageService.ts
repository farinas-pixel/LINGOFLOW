/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IBaseService } from '../../types/service';

export interface StorageQuotaInfo {
  readonly usedBytes: number;
  readonly availableBytes?: number;
  readonly quotaLimitBytes?: number;
}

export interface IStorageService extends IBaseService {
  readonly id: 'storageService';
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(prefix?: string): Promise<void>;
  keys(prefix?: string): Promise<readonly string[]>;
  getQuota(): Promise<StorageQuotaInfo>;
}
